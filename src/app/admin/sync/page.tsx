// src/app/admin/sync/page.tsx
// Admin Sync Dashboard - Enrich existing profiles with API data

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SyncResult {
  creatorId: string;
  name: string;
  success: boolean;
  action: 'enriched' | 'skipped' | 'failed';
  enrichments: string[];
  error?: string;
}

export default function SyncDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [allProfiles, setAllProfiles] = useState<string[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<SyncResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Load all profiles
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'all' }),
      });
      const data = await response.json();
      setAllProfiles(data.creatorIds || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleProfile = (id: string) => {
    setSelectedProfiles(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedProfiles(allProfiles.slice(0, 20)); // Max 20
  };

  const clearSelection = () => {
    setSelectedProfiles([]);
  };

  const syncSelected = async () => {
    if (selectedProfiles.length === 0) return;

    setSyncing(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch',
          creatorIds: selectedProfiles,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setResults(data.results || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setSyncing(false);
    }
  };

  const syncSingle = async (creatorId: string) => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'single',
          creatorId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setResults(prev => [...prev, data.result]);
    } catch (err) {
      setError(String(err));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🔄 Profile Sync</h1>
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Admin
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Enrich existing profiles with data from YouTube, Wikipedia, Google Books, and more.
          This adds missing data without overwriting manual edits.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{allProfiles.length}</div>
            <div className="text-sm text-gray-600">Total Profiles</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-teal-600">{selectedProfiles.length}</div>
            <div className="text-sm text-gray-600">Selected</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {results.filter(r => r.action === 'enriched').length}
            </div>
            <div className="text-sm text-gray-600">Enriched</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={selectAll}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            Select First 20
          </button>
          <button
            onClick={clearSelection}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            Clear Selection
          </button>
          <button
            onClick={syncSelected}
            disabled={syncing || selectedProfiles.length === 0}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {syncing ? '🔄 Syncing...' : `Sync ${selectedProfiles.length} Profiles`}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Sync Results</h2>
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={i} className={`p-3 rounded-lg text-sm ${
                  result.action === 'enriched' ? 'bg-green-50' :
                  result.action === 'skipped' ? 'bg-gray-50' :
                  'bg-red-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{result.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.action === 'enriched' ? 'bg-green-100 text-green-800' :
                      result.action === 'skipped' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.action}
                    </span>
                  </div>
                  {result.enrichments.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      Added: {result.enrichments.join(', ')}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">{result.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">All Profiles</h2>
          {loading ? (
            <div className="text-center py-8">Loading profiles...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {allProfiles.map(id => (
                <div
                  key={id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                    selectedProfiles.includes(id) ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'
                  }`}
                  onClick={() => toggleProfile(id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedProfiles.includes(id)}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <span>{id}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      syncSingle(id);
                    }}
                    disabled={syncing}
                    className="px-3 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                  >
                    Sync
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
