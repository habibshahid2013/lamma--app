'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ClaimProfileButtonProps {
  creatorId: string;
  creatorName: string;
  isOwned: boolean;
}

export default function ClaimProfileButton({ creatorId, creatorName, isOwned }: ClaimProfileButtonProps) {
  const { user, userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  
  const [formData, setFormData] = useState({
    method: 'social_media',
    socialLinks: '',
    officialEmail: '',
    additionalNotes: '',
  });

  // Don't show if already owned
  if (isOwned) return null;

  const checkExistingClaim = async () => {
    if (!user) return;
    
    const q = query(
      collection(db, 'claimRequests'),
      where('creatorProfileId', '==', creatorId),
      where('claimantUserId', '==', user.uid),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setAlreadyClaimed(true);
      return true;
    }
    return false;
  };

  const handleOpen = async () => {
    if (!user) {
      alert('Please sign in to claim this profile');
      return;
    }
    
    const hasClaim = await checkExistingClaim();
    if (!hasClaim) {
      setIsOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'claimRequests'), {
        creatorProfileId: creatorId,
        creatorName: creatorName,
        claimantUserId: user.uid,
        claimantEmail: userData.email,
        claimantName: userData.displayName,
        evidence: {
          method: formData.method,
          socialMediaLinks: formData.socialLinks.split('\n').filter(Boolean),
          officialEmail: formData.officialEmail || null,
          additionalNotes: formData.additionalNotes || null,
        },
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Error submitting claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (alreadyClaimed) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">⏳ Your claim is pending review</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800">✅ Claim submitted! We'll review it within 48 hours.</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
      >
        🔐 Claim This Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Claim {creatorName}</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Verify your identity to take ownership of this profile and manage your content.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Verification Method</label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="social_media">Social Media Verification</option>
                  <option value="email">Official Email Verification</option>
                  <option value="video">Video Verification</option>
                </select>
              </div>

              {formData.method === 'social_media' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Official Social Media Links
                  </label>
                  <textarea
                    value={formData.socialLinks}
                    onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                    placeholder="https://twitter.com/yourusername&#10;https://instagram.com/yourusername"
                    className="w-full border rounded-lg p-2 h-24"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">One link per line</p>
                </div>
              )}

              {formData.method === 'email' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Official/Public Email
                  </label>
                  <input
                    type="email"
                    value={formData.officialEmail}
                    onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                    placeholder="contact@yourdomain.com"
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
              )}

              {formData.method === 'video' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    After submitting, we'll email you instructions to record a short verification video.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Additional Notes (Optional)</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Any additional information to help verify your identity..."
                  className="w-full border rounded-lg p-2 h-20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Claim Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
