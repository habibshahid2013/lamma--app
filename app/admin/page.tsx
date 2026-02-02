'use client';

import { useState, useEffect } from 'react';
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
import { Database, Zap, Users, Home, Settings, RefreshCw, Plus, Leaf, ImageIcon } from 'lucide-react';

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

export default function AdminDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ creators: 0, users: 0, pending: 0 });
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

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

        setStats({
          creators: creatorsSnap.size,
          users: usersSnap.size,
          pending: pendingSnap.size
        });
      } catch (error: any) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && userData?.role === 'admin') {
      fetchData();
    }
  }, [filter, authLoading, userData]);

  // Seed creators from static data
  const handleSeedCreators = async () => {
    if (!confirm("This will seed/update all creators from static data. Continue?")) return;

    setSeeding(true);
    setSeedStatus('Seeding creators...');
    try {
      const response = await fetch('/api/admin/seed?action=seed', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setSeedStatus(`✅ Done! Created: ${data.created}, Updated: ${data.updated}`);
        // Refresh stats
        const creatorsSnap = await getDocs(collection(db, 'creators'));
        setStats(prev => ({ ...prev, creators: creatorsSnap.size }));
      } else {
        setSeedStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setSeedStatus(`❌ Error: ${String(error)}`);
    } finally {
      setSeeding(false);
    }
  };

  // Fetch missing images
  const handleFetchImages = async () => {
    if (!confirm("This will fetch missing images for all creators. This may take a few minutes. Continue?")) return;

    setSeeding(true);
    setSeedStatus('Fetching images...');
    try {
      const response = await fetch('/api/admin/seed?action=images', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setSeedStatus(`✅ Images: ${data.fetched} fetched, ${data.placeholder} placeholders`);
      } else {
        setSeedStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setSeedStatus(`❌ Error: ${String(error)}`);
    } finally {
      setSeeding(false);
    }
  };

  // Full pipeline: seed + images
  const handleFullPipeline = async () => {
    if (!confirm("This will seed creators AND fetch images. This may take several minutes. Continue?")) return;

    setSeeding(true);
    setSeedStatus('Running full pipeline...');
    try {
      const response = await fetch('/api/admin/seed?action=full', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setSeedStatus(`✅ Complete! Seed: ${data.seed.created}+${data.seed.updated}, Images: ${data.images.fetched}`);
        // Refresh stats
        const creatorsSnap = await getDocs(collection(db, 'creators'));
        setStats(prev => ({ ...prev, creators: creatorsSnap.size }));
      } else {
        setSeedStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setSeedStatus(`❌ Error: ${String(error)}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleMigrateLinks = async () => {
    if (!confirm("This will update podcast links for ALL creators to use Muslim Central. Continue?")) return;

    setLoading(true);
    try {
        const snapshot = await getDocs(collection(db, 'creators'));
        alert(`Found ${snapshot.size} creators. Starting update...`);

        let count = 0;

        for (const docSnapshot of snapshot.docs) {
            const creatorId = docSnapshot.id;
            const podcastUrl = `https://feeds.muslimcentral.com/${creatorId}`;

            await updateDoc(doc(db, 'creators', creatorId), {
                'socialLinks.podcast': podcastUrl
            });
            count++;
        }

        alert(`Successfully updated ${count} creators!`);
    } catch (e) {
        console.error(e);
        alert("Migration failed. Check console.");
    } finally {
        setLoading(false);
    }
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
      alert('Claim approved! User can now edit their profile.');
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Error approving claim');
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
      alert('Claim rejected.');
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert('Error rejecting claim');
    } finally {
      setProcessingId(null);
    }
  };

  // Auth checks
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-offwhite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-offwhite">
        <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-light">
          <h1 className="text-2xl font-bold mb-4 text-gray-dark">Admin Access Only</h1>
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

  return (
    <div className="min-h-screen bg-gray-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-light sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LammaLogo variant="light" size="sm" />
            <div className="h-6 w-px bg-gray-light" />
            <h1 className="text-lg font-bold text-gray-dark">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMigrateLinks}
              className="flex items-center gap-2 text-xs bg-gold/10 text-gold hover:bg-gold/20 px-3 py-2 rounded-lg font-medium transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Fix DB Links
            </button>
            <span className="text-sm bg-teal-light text-teal-deep px-3 py-2 rounded-lg font-medium">
              {userData?.email}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-light shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-light rounded-lg">
                <Users className="w-5 h-5 text-teal" />
              </div>
              <span className="text-sm text-gray-500">Total Creators</span>
            </div>
            <p className="text-3xl font-bold text-gray-dark">{stats.creators}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-light shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gold-light rounded-lg">
                <Users className="w-5 h-5 text-gold" />
              </div>
              <span className="text-sm text-gray-500">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-gray-dark">{stats.users}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-light shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm text-gray-500">Pending Claims</span>
            </div>
            <p className="text-3xl font-bold text-gray-dark">{stats.pending}</p>
          </div>
        </div>

        {/* Seed Status Banner */}
        {seedStatus && (
          <div className={`mb-6 p-4 rounded-xl border ${
            seedStatus.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-800' :
            seedStatus.startsWith('❌') ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <span>{seedStatus}</span>
              <button onClick={() => setSeedStatus(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
          </div>
        )}

        {/* Data Seeding Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-light shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-dark mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-teal" />
            Data Seeding
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Seed the database with creator data. This creates/updates profiles from the static data file (68 creators).
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSeedCreators}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal hover:bg-teal-deep text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              <Leaf className="w-4 h-4" />
              {seeding ? 'Seeding...' : 'Seed Creators'}
            </button>
            <button
              onClick={handleFetchImages}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-dark text-gray-dark rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              {seeding ? 'Fetching...' : 'Fetch Images'}
            </button>
            <button
              onClick={handleFullPipeline}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal to-gold text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              <Zap className="w-4 h-4" />
              {seeding ? 'Running...' : 'Full Pipeline'}
            </button>
          </div>
        </div>

        {/* Admin Navigation Cards */}
        <h2 className="text-lg font-bold text-gray-dark mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/pipeline')}
            className="group bg-gradient-to-br from-teal to-teal-deep text-white rounded-xl p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <div className="p-2 bg-white/20 rounded-lg w-fit mb-3 group-hover:bg-white/30 transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <div className="font-semibold">Profile Pipeline</div>
            <div className="text-xs opacity-80 mt-1">Generate new profiles</div>
          </button>

          <button
            onClick={() => router.push('/admin/sync')}
            className="group bg-gradient-to-br from-gold to-gold-dark text-gray-dark rounded-xl p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <div className="p-2 bg-white/30 rounded-lg w-fit mb-3 group-hover:bg-white/40 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="font-semibold">Sync Profiles</div>
            <div className="text-xs opacity-80 mt-1">Enrich existing profiles</div>
          </button>

          <button
            onClick={() => router.push('/admin/add-creator')}
            className="group bg-gradient-to-br from-teal-deep to-navy text-white rounded-xl p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <div className="p-2 bg-white/20 rounded-lg w-fit mb-3 group-hover:bg-white/30 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div className="font-semibold">Add Creator</div>
            <div className="text-xs opacity-80 mt-1">AI profile generation</div>
          </button>

          <button
            onClick={() => router.push('/')}
            className="group bg-white border-2 border-gray-light text-gray-dark rounded-xl p-5 text-left hover:border-teal hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <div className="p-2 bg-gray-100 rounded-lg w-fit mb-3 group-hover:bg-teal-light transition-colors">
              <Home className="w-5 h-5 text-gray-500 group-hover:text-teal" />
            </div>
            <div className="font-semibold">Back to App</div>
            <div className="text-xs text-gray-500 mt-1">Return to main site</div>
          </button>
        </div>

        {/* Claim Requests Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-light p-6">
          <h2 className="text-lg font-bold text-gray-dark mb-4">Claim Requests</h2>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-light pb-4">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-teal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && stats.pending > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Claims List */}
          {claims.length === 0 ? (
            <div className="py-12 text-center">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No {filter === 'all' ? '' : filter} claims found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="border border-gray-light rounded-xl p-5 hover:border-teal/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-dark">{claim.creatorName}</h3>
                      <p className="text-gray-500 text-sm">
                        Claimed by: <span className="font-medium">{claim.claimantName}</span> ({claim.claimantEmail})
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {claim.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      claim.status === 'pending' ? 'bg-gold-light text-gold' :
                      claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {claim.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-gray-offwhite rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-sm text-gray-dark mb-2">Evidence ({claim.evidence.method})</h4>

                    {claim.evidence.socialMediaLinks && claim.evidence.socialMediaLinks.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Social Links:</p>
                        {claim.evidence.socialMediaLinks.map((link, i) => (
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
                      </div>
                    )}

                    {claim.evidence.officialEmail && (
                      <p className="text-sm">
                        <span className="text-gray-500">Official Email:</span> {claim.evidence.officialEmail}
                      </p>
                    )}

                    {claim.evidence.additionalNotes && (
                      <p className="text-sm mt-2">
                        <span className="text-gray-500">Notes:</span> {claim.evidence.additionalNotes}
                      </p>
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
      </main>
    </div>
  );
}
