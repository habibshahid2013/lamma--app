// src/app/admin/pipeline/page.tsx
// Admin Dashboard for Profile Pipeline
// Review flagged profiles, monitor pipeline, add new creators

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface FlaggedProfile {
  creatorId: string;
  name: string;
  flagCount: number;
}

interface PipelineResult {
  success: boolean;
  creatorId: string | null;
  slug: string | null;
  action: string;
  confidence: { score: number; level: string };
  flags: any[];
  dataSources: string[];
  processingTimeMs: number;
}

export default function PipelineDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<'generate' | 'flagged' | 'batch'>('generate');
  const [singleName, setSingleName] = useState('');
  const [batchNames, setBatchNames] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [batchResults, setBatchResults] = useState<any>(null);
  const [flaggedProfiles, setFlaggedProfiles] = useState<FlaggedProfile[]>([]);
  const [loadingFlagged, setLoadingFlagged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load flagged on tab switch - must be before conditionals!
  useEffect(() => {
    if (activeTab === 'flagged' && userData?.role === 'admin') {
      loadFlaggedProfiles();
    }
  }, [activeTab, userData?.role]);

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">🔒 Admin Access Only</h1>
          <button onClick={() => router.push('/')} className="px-6 py-2 bg-teal-600 text-white rounded-lg">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Generate single profile
  const handleGenerate = async () => {
    if (!singleName.trim()) return;

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/profile-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: singleName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate profile');
      }

      setResult(data.result);
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  };

  // Generate batch profiles
  const handleBatchGenerate = async () => {
    const names = batchNames
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) return;
    if (names.length > 20) {
      setError('Maximum 20 names per batch');
      return;
    }

    setGenerating(true);
    setError(null);
    setBatchResults(null);

    try {
      const response = await fetch('/api/profile-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch', names }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Batch processing failed');
      }

      setBatchResults(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  };

  // Load flagged profiles
  const loadFlaggedProfiles = async () => {
    setLoadingFlagged(true);
    try {
      const response = await fetch('/api/profile-pipeline?action=flagged');
      const data = await response.json();
      setFlaggedProfiles(data.profiles || []);
    } catch (err) {
      console.error('Failed to load flagged profiles:', err);
    } finally {
      setLoadingFlagged(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🤖 Profile Pipeline</h1>
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Admin
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'generate'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✨ Generate
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'batch'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📦 Batch
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'flagged'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🚩 Flagged ({flaggedProfiles.length})
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Generate Single Profile</h2>
            <p className="text-gray-600 mb-4">
              Enter a name and the pipeline will automatically:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Search YouTube, Wikipedia, Google Books, Deezer</li>
                <li>Validate all links and data</li>
                <li>Save to database with version history</li>
                <li>Flag any issues for review</li>
              </ul>
            </p>

            <div className="flex gap-4 mb-6">
              <input
                type="text"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                placeholder="e.g., Omar Suleiman, Yasir Qadhi, Mufti Menk"
                className="flex-1 border rounded-lg px-4 py-3"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !singleName.trim()}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {generating ? '🔄 Processing...' : '✨ Generate'}
              </button>
            </div>

            {/* Single Result */}
            {result && (
              <div className={`rounded-lg p-4 ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">
                    {result.success ? '✅ Profile Generated' : '❌ Generation Failed'}
                  </h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.confidence.level === 'high' ? 'bg-green-100 text-green-800' :
                    result.confidence.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.confidence.level} ({result.confidence.score}/100)
                  </span>
                </div>

                <div className="text-sm space-y-1">
                  <p><strong>Action:</strong> {result.action}</p>
                  <p><strong>Sources:</strong> {result.dataSources.join(', ') || 'None'}</p>
                  <p><strong>Flags:</strong> {result.flags.length}</p>
                  <p><strong>Processing Time:</strong> {(result.processingTimeMs / 1000).toFixed(1)}s</p>
                  {result.slug && (
                    <p>
                      <strong>Profile URL:</strong>{' '}
                      <a href={`/creator/${result.slug}`} className="text-teal-600 hover:underline" target="_blank">
                        /creator/{result.slug}
                      </a>
                    </p>
                  )}
                </div>

                {result.flags.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="font-medium text-sm mb-2">Flags:</p>
                    <ul className="text-sm space-y-1">
                      {result.flags.map((flag: any, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            flag.severity === 'high' ? 'bg-red-100 text-red-800' :
                            flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {flag.severity}
                          </span>
                          {flag.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Batch Tab */}
        {activeTab === 'batch' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Batch Process (Max 20)</h2>
            <p className="text-gray-600 mb-4">
              Enter one name per line. Each will be processed through the full pipeline.
            </p>

            <textarea
              value={batchNames}
              onChange={(e) => setBatchNames(e.target.value)}
              placeholder="Omar Suleiman&#10;Yasir Qadhi&#10;Mufti Menk&#10;Nouman Ali Khan&#10;Yasmin Mogahed"
              className="w-full border rounded-lg px-4 py-3 h-40 mb-4"
            />

            <button
              onClick={handleBatchGenerate}
              disabled={generating || !batchNames.trim()}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {generating ? '🔄 Processing Batch...' : '📦 Process All'}
            </button>

            {/* Batch Results */}
            {batchResults && (
              <div className="mt-6 space-y-3">
                <div className="flex gap-4 text-center">
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold">{batchResults.summary.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{batchResults.summary.successful}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="flex-1 bg-yellow-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-600">{batchResults.summary.flagged}</div>
                    <div className="text-sm text-gray-600">Flagged</div>
                  </div>
                  <div className="flex-1 bg-red-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-600">{batchResults.summary.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>

                {batchResults.summary.profiles.map((profile: any, i: number) => (
                  <div key={i} className={`rounded-lg p-3 text-sm ${
                    profile.success ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{profile.name}</span>
                      <div className="flex items-center gap-2">
                        {profile.slug && (
                          <a href={`/creator/${profile.slug}`} className="text-teal-600 hover:underline" target="_blank">
                            View →
                          </a>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          profile.confidence?.level === 'high' ? 'bg-green-100' :
                          profile.confidence?.level === 'medium' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {profile.confidence?.score || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Flagged Tab */}
        {activeTab === 'flagged' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">🚩 Profiles Needing Review</h2>
              <button
                onClick={loadFlaggedProfiles}
                disabled={loadingFlagged}
                className="text-teal-600 hover:underline text-sm"
              >
                {loadingFlagged ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {flaggedProfiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>🎉 No profiles need review!</p>
                <p className="text-sm mt-2">All profiles are validated and clean.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedProfiles.map((profile) => (
                  <div key={profile.creatorId} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <span className="font-medium">{profile.name}</span>
                      <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs">
                        {profile.flagCount} flags
                      </span>
                    </div>
                    <a
                      href={`/creator/${profile.creatorId}`}
                      className="text-teal-600 hover:underline text-sm"
                      target="_blank"
                    >
                      Review →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Pipeline Info</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Data Sources:</strong> YouTube, Wikipedia, Google Books, Deezer, Muslim Central</p>
            <p><strong>Auto-Save:</strong> Enabled (confidence ≥ 40%)</p>
            <p><strong>Refresh Schedule:</strong> Daily (stale profiles auto-refresh)</p>
            <p><strong>Version History:</strong> Enabled (rollback available)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
