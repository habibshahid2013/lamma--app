'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
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
import { db } from '@/src/lib/firebase';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    const fetchClaims = async () => {
      try {
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
      } catch (error: any) {
        console.error('Error fetching claims:', error);
        if (error.code === 'failed-precondition') {
             // Extract URL from error message if available, otherwise just show generic message
             // The error message usually looks like: "The query requires an index. You can create it here: https://console.firebase.google.com/..."
             const errorMessage = error.message || '';
             const match = errorMessage.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
             const link = match ? match[0] : null;
             
             if (link) {
                 alert(`Missing Firestore Index! \n\nPlease create the index by clicking OK to open the console, or check the console logs for the link.\n\nLink: ${link}`);
                 window.open(link, '_blank');
             } else {
                 alert('Error: Missing Firestore Index. Check console for creation link.');
             }
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && userData?.role === 'admin') {
      fetchClaims();
    }
  }, [filter, authLoading, userData]);

  const handleApprove = async (claim: ClaimRequest) => {
    if (!confirm(`Approve claim for ${claim.creatorName} by ${claim.claimantName}?`)) return;

    setProcessingId(claim.id);
    try {
      // 1. Update claim request status
      await updateDoc(doc(db, 'claimRequests', claim.id), {
        status: 'approved',
        reviewedBy: user?.uid,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Update creator profile ownership
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

      // 3. Update user role to creator
      await updateDoc(doc(db, 'users', claim.claimantUserId), {
        role: 'creator',
        creatorProfileId: claim.creatorProfileId,
        updatedAt: serverTimestamp(),
      });

      // Remove from local state
      setClaims(claims.filter(c => c.id !== claim.id));
      alert('✅ Claim approved! User can now edit their profile.');
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Error approving claim');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claim: ClaimRequest) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return; // User cancelled

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
          <p className="text-gray-600 mb-4">You don't have permission to view this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <span className="text-sm bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
            {userData?.email}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && claims.length > 0 && filter === 'pending' && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {claims.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Claims List */}
        {claims.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} claims found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{claim.creatorName}</h3>
                    <p className="text-gray-600">
                      Claimed by: {claim.claimantName} ({claim.claimantEmail})
                    </p>
                    <p className="text-sm text-gray-400">
                      {claim.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {claim.status}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-2">Evidence ({claim.evidence.method})</h4>
                  
                  {claim.evidence.socialMediaLinks && claim.evidence.socialMediaLinks.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Social Links:</p>
                      {claim.evidence.socialMediaLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline block text-sm"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  )}

                  {claim.evidence.officialEmail && (
                    <p className="text-sm">
                      <span className="text-gray-600">Official Email:</span> {claim.evidence.officialEmail}
                    </p>
                  )}

                  {claim.evidence.additionalNotes && (
                    <p className="text-sm mt-2">
                      <span className="text-gray-600">Notes:</span> {claim.evidence.additionalNotes}
                    </p>
                  )}
                </div>

                {claim.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(claim)}
                      disabled={processingId === claim.id}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                      {processingId === claim.id ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(claim)}
                      disabled={processingId === claim.id}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
