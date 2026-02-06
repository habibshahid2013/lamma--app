'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import LammaLogo from '@/components/LammaLogo';
import {
  Database, Zap, Users, Home, Settings, RefreshCw, Plus, Leaf, ImageIcon,
  Search, BarChart3, AlertTriangle, CheckCircle2, Clock, Play, Pause,
  ChevronRight, ExternalLink, Edit, Trash2, MoreVertical, Filter,
  Download, Upload, X
} from 'lucide-react';

interface ClaimRequest {
  id: string;
  creatorProfileId: string;
  creatorName: string;
  claimantUserId: string;
  claimantEmail: string;
  claimantName: string;
  evidence: {
    method: string;
    socialMediaLinks?: string[];
    officialEmail?: string;
    additionalNotes?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  reviewNotes?: string;
}

interface DataQualityStats {
  totalCreators: number;
  averageScore: number;
  missingBios: number;
  missingAvatars: number;
  missingYouTube: number;
  templatedPodcasts: number;
}

interface PipelineStatus {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  message?: string;
}

export default function AdminDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ creators: 0, users: 0, pending: 0, premium: 0 });
  const [dataQuality, setDataQuality] = useState<DataQualityStats | null>(null);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStatus[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'creators' | 'claims' | 'settings'>('overview');

  const fetchDataQuality = useCallback(async () => {
    try {
      const response = await fetch('/api/data-quality/audit');
      const data = await response.json();

      const missingBios = data.topIssues?.find((i: any) => i.issue.includes('bio'))?.count || 0;
      const missingYouTube = data.topIssues?.find((i: any) => i.issue.includes('YouTube'))?.count || 0;

      setDataQuality({
        totalCreators: data.totalCreators || 0,
        averageScore: data.averageScore || 0,
        missingBios,
        missingAvatars: 0, // Would need to track this
        missingYouTube,
        templatedPodcasts: data.topIssues?.filter((i: any) => i.issue.includes('podcast')).length || 0,
      });
    } catch (error) {
      console.error('Error fetching data quality:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch claims
        let q;
        if (filter === 'all') {
          q = query(collection(db, 'claimRequests'), orderBy('createdAt', 'desc'));
        } else {
          q = query(
            collection(db, 'claimRequests'),
            where('status', '==', filter),
            orderBy('createdAt', 'desc')
          );
        }

        const snapshot = await getDocs(q);
        const claimsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ClaimRequest[];

        setClaims(claimsData);

        // Fetch stats
        const creatorsSnap = await getDocs(collection(db, 'creators'));
        const usersSnap = await getDocs(collection(db, 'users'));
        const pendingSnap = await getDocs(query(collection(db, 'claimRequests'), where('status', '==', 'pending')));
        const premiumSnap = await getDocs(query(collection(db, 'users'), where('isPremium', '==', true)));

        setStats({
          creators: creatorsSnap.size,
          users: usersSnap.size,
          pending: pendingSnap.size,
          premium: premiumSnap.size,
        });

        // Fetch data quality
        await fetchDataQuality();
      } catch (error: any) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && userData?.role === 'admin') {
      fetchData();
    }
  }, [filter, authLoading, userData, fetchDataQuality]);

  // Run enrichment pipeline
  const runPipeline = async (steps: string[]) => {
    setPipelineRunning(true);
    setPipelineSteps(steps.map(s => ({ step: s, status: 'pending' })));

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setPipelineSteps(prev => prev.map((p, idx) =>
        idx === i ? { ...p, status: 'running', message: 'Processing...' } : p
      ));

      try {
        let endpoint = '';
        switch (step) {
          case 'seed':
            endpoint = '/api/admin/seed?action=seed';
            break;
          case 'youtube':
            endpoint = '/api/data-quality/enrich-youtube';
            break;
          case 'images':
            endpoint = '/api/creators/fetch-images';
            break;
          case 'audit':
            endpoint = '/api/data-quality/audit';
            break;
        }

        const response = await fetch(endpoint, { method: 'POST' });
        const data = await response.json();

        setPipelineSteps(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'completed', message: data.success ? 'Done' : data.error } : p
        ));
      } catch (error) {
        setPipelineSteps(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'error', message: String(error) } : p
        ));
      }
    }

    setPipelineRunning(false);
    await fetchDataQuality();
  };

  const handleApprove = async (claim: ClaimRequest) => {
    if (!confirm(`Approve claim for ${claim.creatorName} by ${claim.claimantName}?`)) return;

    setProcessingId(claim.id);
    try {
      await updateDoc(doc(db, 'claimRequests', claim.id), {
        status: 'approved',
        reviewedBy: user?.uid,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'creators', claim.creatorProfileId), {
        'ownership.ownerId': claim.claimantUserId,
        'ownership.ownershipStatus': 'claimed',
        'ownership.claimedAt': serverTimestamp(),
        'ownership.claimMethod': claim.evidence.method,
        'verification.level': 'official',
        'verification.verifiedAt': serverTimestamp(),
        'verification.verifiedBy': user?.uid,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', claim.claimantUserId), {
        role: 'creator',
        creatorProfileId: claim.creatorProfileId,
        updatedAt: serverTimestamp(),
      });

      setClaims(claims.filter(c => c.id !== claim.id));
    } catch (error) {
      console.error('Error approving claim:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claim: ClaimRequest) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return;

    setProcessingId(claim.id);
    try {
      await updateDoc(doc(db, 'claimRequests', claim.id), {
        status: 'rejected',
        reviewedBy: user?.uid,
        reviewedAt: serverTimestamp(),
        rejectionReason: reason || 'No reason provided',
        updatedAt: serverTimestamp(),
      });

      setClaims(claims.filter(c => c.id !== claim.id));
    } catch (error) {
      console.error('Error rejecting claim:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Auth checks
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center bg-white rounded-xl p-8 shadow-sm border">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Admin Access Only</h1>
          <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
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

  const qualityScore = dataQuality?.averageScore || 0;
  const qualityColor = qualityScore >= 80 ? 'text-green-600' : qualityScore >= 60 ? 'text-yellow-600' : 'text-red-600';
  const qualityBg = qualityScore >= 80 ? 'bg-green-100' : qualityScore >= 60 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LammaLogo variant="light" size="sm" />
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm bg-teal-light text-teal-deep px-3 py-1.5 rounded-lg font-medium">
              {userData?.email}
            </span>
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'creators', label: 'Creators', icon: Users },
            { id: 'claims', label: 'Claims', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-teal text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'claims' && stats.pending > 0 && (
                <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-light rounded-lg">
                    <Users className="w-5 h-5 text-teal" />
                  </div>
                  <span className="text-sm text-gray-500">Creators</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.creators}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gold-light rounded-lg">
                    <Users className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-sm text-gray-500">Users</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.users}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Premium</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.premium}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${qualityBg}`}>
                    <BarChart3 className={`w-5 h-5 ${qualityColor}`} />
                  </div>
                  <span className="text-sm text-gray-500">Data Quality</span>
                </div>
                <p className={`text-3xl font-bold ${qualityColor}`}>{qualityScore}%</p>
              </div>
            </div>

            {/* Data Quality Issues */}
            {dataQuality && (
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="p-5 border-b">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Data Quality Issues
                  </h2>
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-2xl font-bold text-red-600">{dataQuality.missingBios}</p>
                    <p className="text-sm text-red-800">Missing Bios</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <p className="text-2xl font-bold text-orange-600">{dataQuality.missingYouTube}</p>
                    <p className="text-sm text-orange-800">No YouTube</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-600">{dataQuality.templatedPodcasts}</p>
                    <p className="text-sm text-yellow-800">Template Podcasts</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">
                      {dataQuality.totalCreators - dataQuality.missingBios}
                    </p>
                    <p className="text-sm text-green-800">Complete Profiles</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-5 border-b">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-teal" />
                  Quick Actions
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    onClick={() => runPipeline(['seed'])}
                    disabled={pipelineRunning}
                    className="flex flex-col items-center gap-2 p-4 bg-teal/10 hover:bg-teal/20 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Leaf className="w-6 h-6 text-teal" />
                    <span className="text-sm font-medium text-teal-deep">Seed Data</span>
                  </button>
                  <button
                    onClick={() => runPipeline(['youtube'])}
                    disabled={pipelineRunning}
                    className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Play className="w-6 h-6 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Enrich YouTube</span>
                  </button>
                  <button
                    onClick={() => runPipeline(['images'])}
                    disabled={pipelineRunning}
                    className="flex flex-col items-center gap-2 p-4 bg-gold/10 hover:bg-gold/20 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <ImageIcon className="w-6 h-6 text-gold" />
                    <span className="text-sm font-medium text-gold-dark">Fetch Images</span>
                  </button>
                  <button
                    onClick={() => runPipeline(['seed', 'youtube', 'images', 'audit'])}
                    disabled={pipelineRunning}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-teal/10 to-gold/10 hover:from-teal/20 hover:to-gold/20 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-6 h-6 text-teal ${pipelineRunning ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium text-teal-deep">Full Pipeline</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/add-creator')}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Plus className="w-6 h-6 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Add Creator</span>
                  </button>
                </div>

                {/* Pipeline Progress */}
                {pipelineSteps.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-800 mb-3">Pipeline Progress</h3>
                    <div className="space-y-2">
                      {pipelineSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {step.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                          {step.status === 'running' && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                          {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {step.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          <span className="text-sm text-gray-700 capitalize">{step.step}</span>
                          {step.message && (
                            <span className="text-xs text-gray-500">- {step.message}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/admin/pipeline')}
                className="group bg-gradient-to-br from-teal to-teal-deep text-white rounded-xl p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <Zap className="w-6 h-6 mb-3 opacity-80" />
                <div className="font-semibold">Profile Pipeline</div>
                <div className="text-xs opacity-80 mt-1">AI profile generation</div>
              </button>
              <button
                onClick={() => router.push('/admin/sync')}
                className="group bg-gradient-to-br from-gold to-gold-dark text-gray-800 rounded-xl p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <RefreshCw className="w-6 h-6 mb-3 opacity-80" />
                <div className="font-semibold">Sync Profiles</div>
                <div className="text-xs opacity-80 mt-1">Bulk enrichment</div>
              </button>
              <button
                onClick={() => router.push('/admin/data-quality')}
                className="group bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <Search className="w-6 h-6 mb-3 opacity-80" />
                <div className="font-semibold">Data Quality</div>
                <div className="text-xs opacity-80 mt-1">Audit & fix issues</div>
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className="group bg-white border-2 text-gray-800 rounded-xl p-5 text-left hover:border-teal hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <Settings className="w-6 h-6 mb-3 text-gray-500" />
                <div className="font-semibold">Claim Requests</div>
                <div className="text-xs text-gray-500 mt-1">{stats.pending} pending</div>
              </button>
            </div>
          </div>
        )}

        {/* Creators Tab */}
        {activeTab === 'creators' && (
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Creator Management</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => router.push('/admin/add-creator')}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-teal text-white rounded-lg hover:bg-teal-deep"
                >
                  <Plus className="w-4 h-4" />
                  Add Creator
                </button>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-500 text-center py-12">
                Creator table coming soon. Use the Data Quality page for detailed creator management.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => router.push('/admin/data-quality')}
                  className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-deep transition-colors"
                >
                  Go to Data Quality
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">Claim Requests</h2>
              <div className="flex gap-2 mt-4">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      filter === status
                        ? 'bg-teal text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status === 'pending' && stats.pending > 0 && (
                      <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {stats.pending}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {claims.length === 0 ? (
                <div className="py-12 text-center">
                  <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No {filter === 'all' ? '' : filter} claims found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="border rounded-xl p-5 hover:border-teal/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{claim.creatorName}</h3>
                          <p className="text-gray-500 text-sm">
                            Claimed by: <span className="font-medium">{claim.claimantName}</span> ({claim.claimantEmail})
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {claim.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-sm text-gray-800 mb-2">Evidence ({claim.evidence.method})</h4>
                        {claim.evidence.socialMediaLinks?.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal hover:underline block text-sm"
                          >
                            {link}
                          </a>
                        ))}
                        {claim.evidence.additionalNotes && (
                          <p className="text-sm text-gray-600 mt-2">{claim.evidence.additionalNotes}</p>
                        )}
                      </div>

                      {claim.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(claim)}
                            disabled={processingId === claim.id}
                            className="flex-1 py-2.5 bg-teal hover:bg-teal-deep text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                          >
                            {processingId === claim.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(claim)}
                            disabled={processingId === claim.id}
                            className="flex-1 py-2.5 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium disabled:opacity-50 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
