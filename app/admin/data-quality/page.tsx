'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LammaLogo from '@/components/LammaLogo';
import { adminFetch } from '@/lib/admin-fetch';
import {
  ArrowLeft,
  Search,
  Wrench,
  Youtube,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Podcast,
  Globe,
  Sparkles,
  Link2,
} from 'lucide-react';

// ============================================================================
// TYPES (mirroring lib/data-quality.ts output)
// ============================================================================

interface DataQualityIssue {
  field: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  autoFixable: boolean;
  fixAction?: string;
}

interface CreatorAuditResult {
  creatorId: string;
  name: string;
  score: number;
  issues: DataQualityIssue[];
  summary: {
    critical: number;
    warning: number;
    info: number;
    autoFixable: number;
  };
}

interface AuditReport {
  source: string;
  timestamp: string;
  totalCreators: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  topIssues: { issue: string; count: number }[];
  creators: CreatorAuditResult[];
}

interface FixResult {
  timestamp: string;
  fixed: number;
  skipped: number;
  errors: number;
  details: Array<{ creatorId: string; name: string; action: string; result: string }>;
}

interface EnrichResult {
  timestamp: string;
  enriched: number;
  skipped: number;
  noYoutube: number;
  errors: number;
  details: Array<{
    creatorId: string;
    name: string;
    status: string;
    subscriberCount?: string;
    recentVideoCount?: number;
    popularVideoCount?: number;
    playlistCount?: number;
    categories?: string[];
  }>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DataQualityPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  // Audit state
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Fix state
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [fixLoading, setFixLoading] = useState(false);

  // Enrich state
  const [enrichResult, setEnrichResult] = useState<EnrichResult | null>(null);
  const [enrichLoading, setEnrichLoading] = useState(false);

  // Multi-source enrich state
  const [multiEnrichResult, setMultiEnrichResult] = useState<any>(null);
  const [multiEnrichLoading, setMultiEnrichLoading] = useState<string | null>(null);

  // UI state
  const [expandedCreators, setExpandedCreators] = useState<Set<string>>(new Set());
  const [scoreFilter, setScoreFilter] = useState<'all' | 'excellent' | 'good' | 'fair' | 'poor'>('all');

  // ---- ACTIONS ----

  const runAudit = async () => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const res = await adminFetch('/api/data-quality/audit');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAuditReport(data);
    } catch (err) {
      setAuditError(String(err));
    } finally {
      setAuditLoading(false);
    }
  };

  const runFixes = async (actions?: string[]) => {
    setFixLoading(true);
    try {
      const res = await adminFetch('/api/data-quality/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actions ? { actions } : {}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFixResult(data);
    } catch (err) {
      alert(`Fix error: ${String(err)}`);
    } finally {
      setFixLoading(false);
    }
  };

  const runEnrichYouTube = async () => {
    setEnrichLoading(true);
    try {
      const res = await adminFetch('/api/data-quality/enrich-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEnrichResult(data);
    } catch (err) {
      alert(`Enrich error: ${String(err)}`);
    } finally {
      setEnrichLoading(false);
    }
  };

  const runMultiEnrich = async (sources: string[]) => {
    const label = sources.join('+');
    setMultiEnrichLoading(label);
    try {
      const res = await adminFetch('/api/data-quality/enrich-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources, batchLimit: 50 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMultiEnrichResult(data);
    } catch (err) {
      alert(`Enrich error: ${String(err)}`);
    } finally {
      setMultiEnrichLoading(null);
    }
  };

  const toggleCreator = (id: string) => {
    setExpandedCreators(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ---- FILTERS ----

  const filteredCreators = auditReport?.creators.filter(c => {
    if (scoreFilter === 'all') return true;
    if (scoreFilter === 'excellent') return c.score >= 80;
    if (scoreFilter === 'good') return c.score >= 60 && c.score < 80;
    if (scoreFilter === 'fair') return c.score >= 40 && c.score < 60;
    if (scoreFilter === 'poor') return c.score < 40;
    return true;
  }) || [];

  // ---- AUTH ----

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-offwhite">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-offwhite">
        <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-light">
          <h1 className="text-2xl font-bold mb-4 text-gray-dark">Admin Access Only</h1>
          <p className="text-gray-500 mb-6">You don&apos;t have permission to view this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-teal hover:bg-teal-deep text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ---- RENDER ----

  return (
    <div className="min-h-screen bg-gray-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-light sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <LammaLogo variant="light" size="sm" />
            <div className="h-6 w-px bg-gray-light" />
            <h1 className="text-lg font-bold text-gray-dark">Data Quality</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="bg-white rounded-xl p-6 border border-gray-light shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-dark mb-2">Audit & Fix</h2>
          <p className="text-gray-500 text-sm mb-5">
            Run an audit to check data quality across all creators, then apply auto-fixes or enrich YouTube content.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runAudit}
              disabled={auditLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal hover:bg-teal-deep text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {auditLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {auditLoading ? 'Running Audit...' : 'Run Audit'}
            </button>
            <button
              onClick={() => runFixes()}
              disabled={fixLoading || !auditReport}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-gray-dark rounded-lg font-medium disabled:opacity-50 transition-colors"
              title={!auditReport ? 'Run audit first' : undefined}
            >
              {fixLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
              {fixLoading ? 'Fixing...' : 'Auto-Fix All'}
            </button>
            <button
              onClick={runEnrichYouTube}
              disabled={enrichLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {enrichLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
              {enrichLoading ? 'Enriching...' : 'Enrich YouTube'}
            </button>
          </div>

          {/* Multi-Source Enrichment */}
          <div className="mt-5 pt-5 border-t border-gray-light">
            <h3 className="text-sm font-semibold text-gray-dark mb-1">Multi-Source Enrichment</h3>
            <p className="text-gray-500 text-xs mb-3">
              Discover books, podcasts, entity data, and social media links from free APIs (Google Books, iTunes, Knowledge Graph, Wikidata).
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => runMultiEnrich(['all'])}
                disabled={!!multiEnrichLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {multiEnrichLoading === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {multiEnrichLoading === 'all' ? 'Enriching All...' : 'Enrich All Sources'}
              </button>
              <button
                onClick={() => runMultiEnrich(['books'])}
                disabled={!!multiEnrichLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {multiEnrichLoading === 'books' ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                Books
              </button>
              <button
                onClick={() => runMultiEnrich(['podcast'])}
                disabled={!!multiEnrichLoading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {multiEnrichLoading === 'podcast' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Podcast className="w-4 h-4" />}
                Podcasts
              </button>
              <button
                onClick={() => runMultiEnrich(['knowledge_graph'])}
                disabled={!!multiEnrichLoading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {multiEnrichLoading === 'knowledge_graph' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Knowledge Graph
              </button>
              <button
                onClick={() => runMultiEnrich(['social_links'])}
                disabled={!!multiEnrichLoading}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {multiEnrichLoading === 'social_links' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Social Links
              </button>
            </div>
          </div>
        </div>

        {/* Audit Error */}
        {auditError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
            {auditError}
          </div>
        )}

        {/* Audit Report */}
        {auditReport && (
          <>
            {/* Score Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 border border-gray-light shadow-sm text-center">
                <div className="text-3xl font-bold text-gray-dark">{auditReport.totalCreators}</div>
                <div className="text-xs text-gray-500 mt-1">Total Creators</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-light shadow-sm text-center">
                <div className={`text-3xl font-bold ${
                  auditReport.averageScore >= 80 ? 'text-green-600' :
                  auditReport.averageScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {auditReport.averageScore}
                </div>
                <div className="text-xs text-gray-500 mt-1">Avg Score</div>
              </div>
              <div className="bg-green-50 rounded-xl p-5 border border-green-200 text-center cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => setScoreFilter(scoreFilter === 'excellent' ? 'all' : 'excellent')}>
                <div className="text-3xl font-bold text-green-700">{auditReport.scoreDistribution.excellent}</div>
                <div className="text-xs text-green-600 mt-1">Excellent (80+)</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200 text-center cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => setScoreFilter(scoreFilter === 'good' ? 'all' : 'good')}>
                <div className="text-3xl font-bold text-yellow-700">{auditReport.scoreDistribution.good}</div>
                <div className="text-xs text-yellow-600 mt-1">Good (60-79)</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-5 border border-orange-200 text-center cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => setScoreFilter(scoreFilter === 'fair' ? 'all' : 'fair')}>
                <div className="text-3xl font-bold text-orange-700">
                  {auditReport.scoreDistribution.fair + auditReport.scoreDistribution.poor}
                </div>
                <div className="text-xs text-orange-600 mt-1">Needs Work (&lt;60)</div>
              </div>
            </div>

            {/* Source Badge */}
            <div className="mb-4 text-xs text-gray-400">
              Data source: <span className="font-medium">{auditReport.source}</span> &middot; {new Date(auditReport.timestamp).toLocaleString()}
            </div>

            {/* Top Issues */}
            <div className="bg-white rounded-xl p-6 border border-gray-light shadow-sm mb-8">
              <h3 className="text-md font-bold text-gray-dark mb-4">Top Issues</h3>
              <div className="space-y-2">
                {auditReport.topIssues.slice(0, 10).map((ti, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{ti.issue}</span>
                    <span className="text-sm font-mono font-bold text-gray-dark bg-gray-100 px-2 py-0.5 rounded">
                      {ti.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
              {(['all', 'excellent', 'good', 'fair', 'poor'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setScoreFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    scoreFilter === f
                      ? 'bg-teal text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? `All (${auditReport.creators.length})` :
                   f === 'excellent' ? `Excellent (${auditReport.scoreDistribution.excellent})` :
                   f === 'good' ? `Good (${auditReport.scoreDistribution.good})` :
                   f === 'fair' ? `Fair (${auditReport.scoreDistribution.fair})` :
                   `Poor (${auditReport.scoreDistribution.poor})`}
                </button>
              ))}
            </div>

            {/* Creator List */}
            <div className="bg-white rounded-xl border border-gray-light shadow-sm overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredCreators.map(creator => (
                  <div key={creator.creatorId} className="border-b border-gray-100 last:border-0">
                    {/* Row */}
                    <button
                      onClick={() => toggleCreator(creator.creatorId)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      {/* Score */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        creator.score >= 80 ? 'bg-green-100 text-green-700' :
                        creator.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        creator.score >= 40 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {creator.score}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-dark truncate">{creator.name}</div>
                        <div className="text-xs text-gray-400">{creator.creatorId}</div>
                      </div>

                      {/* Issue badges */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {creator.summary.critical > 0 && (
                          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> {creator.summary.critical}
                          </span>
                        )}
                        {creator.summary.warning > 0 && (
                          <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> {creator.summary.warning}
                          </span>
                        )}
                        {creator.summary.info > 0 && (
                          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            <Info className="w-3 h-3" /> {creator.summary.info}
                          </span>
                        )}
                        {creator.summary.autoFixable > 0 && (
                          <span className="flex items-center gap-1 text-xs bg-teal-light text-teal px-2 py-0.5 rounded-full">
                            <Wrench className="w-3 h-3" /> {creator.summary.autoFixable}
                          </span>
                        )}
                      </div>

                      {/* Expand arrow */}
                      {expandedCreators.has(creator.creatorId) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {/* Expanded detail */}
                    {expandedCreators.has(creator.creatorId) && (
                      <div className="px-5 pb-4 pt-1 bg-gray-50">
                        <table className="w-full text-sm">
                          <tbody>
                            {creator.issues.map((issue, i) => (
                              <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="py-2 pr-3 w-20">
                                  {issue.severity === 'critical' && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Critical</span>
                                  )}
                                  {issue.severity === 'warning' && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Warning</span>
                                  )}
                                  {issue.severity === 'info' && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Info</span>
                                  )}
                                </td>
                                <td className="py-2 pr-3 text-gray-500 font-mono text-xs whitespace-nowrap">{issue.field}</td>
                                <td className="py-2 text-gray-700">{issue.message}</td>
                                <td className="py-2 pl-3 w-16 text-right">
                                  {issue.autoFixable && (
                                    <span className="text-xs text-teal font-medium">Auto-fix</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Fix Results */}
        {fixResult && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-light shadow-sm">
            <h3 className="text-md font-bold text-gray-dark mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Fix Results
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{fixResult.fixed}</div>
                <div className="text-xs text-green-600">Fixed</div>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{fixResult.skipped}</div>
                <div className="text-xs text-gray-500">Skipped</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{fixResult.errors}</div>
                <div className="text-xs text-red-600">Errors</div>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {fixResult.details.map((d, i) => (
                <div key={i} className="flex gap-3 text-sm py-1.5 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-gray-dark w-40 flex-shrink-0 truncate">{d.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono flex-shrink-0">{d.action}</span>
                  <span className="text-gray-500 truncate">{d.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrich Results */}
        {enrichResult && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-light shadow-sm">
            <h3 className="text-md font-bold text-gray-dark mb-4 flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-600" />
              YouTube Enrichment Results
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{enrichResult.enriched}</div>
                <div className="text-xs text-green-600">Enriched</div>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{enrichResult.skipped}</div>
                <div className="text-xs text-gray-500">Skipped</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{enrichResult.noYoutube}</div>
                <div className="text-xs text-yellow-600">No YouTube</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{enrichResult.errors}</div>
                <div className="text-xs text-red-600">Errors</div>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {enrichResult.details.map((d, i) => (
                <div key={i} className="flex flex-wrap gap-2 text-sm py-2 border-b border-gray-100 last:border-0 items-center">
                  <span className="font-medium text-gray-dark w-40 flex-shrink-0 truncate">{d.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    d.status === 'enriched' ? 'bg-green-100 text-green-700' :
                    d.status === 'no_youtube_link' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{d.status}</span>
                  {d.subscriberCount && (
                    <span className="text-xs text-gray-500">{d.subscriberCount} subs</span>
                  )}
                  {d.recentVideoCount != null && (
                    <span className="text-xs text-gray-500">{d.recentVideoCount} recent</span>
                  )}
                  {d.popularVideoCount != null && (
                    <span className="text-xs text-gray-500">{d.popularVideoCount} popular</span>
                  )}
                  {d.playlistCount != null && (
                    <span className="text-xs text-gray-500">{d.playlistCount} playlists</span>
                  )}
                  {d.categories && d.categories.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {d.categories.map(cat => (
                        <span key={cat} className="text-[10px] bg-teal-light text-teal px-1.5 py-0.5 rounded">{cat}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Source Enrichment Results */}
        {multiEnrichResult && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-light shadow-sm">
            <h3 className="text-md font-bold text-gray-dark mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Multi-Source Enrichment Results
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{multiEnrichResult.enriched}</div>
                <div className="text-xs text-green-600">Enriched</div>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{multiEnrichResult.skipped}</div>
                <div className="text-xs text-gray-500">Skipped</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{multiEnrichResult.errors}</div>
                <div className="text-xs text-red-600">Errors</div>
              </div>
            </div>

            {/* Source Breakdown */}
            {multiEnrichResult.sourceBreakdown && (
              <div className="flex gap-3 mb-4">
                {multiEnrichResult.sourceBreakdown.books > 0 && (
                  <span className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                    <BookOpen className="w-3.5 h-3.5" /> {multiEnrichResult.sourceBreakdown.books} books
                  </span>
                )}
                {multiEnrichResult.sourceBreakdown.podcast > 0 && (
                  <span className="flex items-center gap-1.5 text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full font-medium">
                    <Podcast className="w-3.5 h-3.5" /> {multiEnrichResult.sourceBreakdown.podcast} podcasts
                  </span>
                )}
                {multiEnrichResult.sourceBreakdown.knowledge_graph > 0 && (
                  <span className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
                    <Globe className="w-3.5 h-3.5" /> {multiEnrichResult.sourceBreakdown.knowledge_graph} entities
                  </span>
                )}
                {multiEnrichResult.sourceBreakdown.social_links > 0 && (
                  <span className="flex items-center gap-1.5 text-xs bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full font-medium">
                    <Link2 className="w-3.5 h-3.5" /> {multiEnrichResult.sourceBreakdown.social_links} social
                  </span>
                )}
              </div>
            )}

            <div className="text-xs text-gray-400 mb-3">
              Sources: {multiEnrichResult.sourcesRequested?.join(', ')} &middot; {multiEnrichResult.creatorsProcessed} creators processed &middot; {new Date(multiEnrichResult.timestamp).toLocaleString()}
            </div>

            {/* Detail Rows */}
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {multiEnrichResult.details?.map((d: { creatorId: string; name: string; source: string; status: string; data?: string }, i: number) => (
                <div key={i} className="flex flex-wrap gap-2 text-sm py-2 border-b border-gray-100 last:border-0 items-center">
                  <span className="font-medium text-gray-dark w-40 flex-shrink-0 truncate">{d.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    d.source === 'books' ? 'bg-blue-100 text-blue-700' :
                    d.source === 'podcast' ? 'bg-orange-100 text-orange-700' :
                    d.source === 'knowledge_graph' ? 'bg-emerald-100 text-emerald-700' :
                    d.source === 'social_links' ? 'bg-pink-100 text-pink-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{d.source}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    d.status === 'enriched' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{d.status}</span>
                  {d.data && (
                    <span className="text-xs text-gray-500 truncate max-w-sm">{d.data}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
