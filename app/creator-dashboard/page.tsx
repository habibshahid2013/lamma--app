'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function CreatorDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    shortBio: '',
    location: '',
    website: '',
    youtube: '',
    twitter: '',
    instagram: '',
  });

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      if (!userData?.creatorProfileId) {
        setLoading(false);
        return;
      }

      try {
        const creatorDoc = await getDoc(doc(db, 'creators', userData.creatorProfileId));
        if (creatorDoc.exists()) {
          const data = creatorDoc.data();
          setCreator(data);
          setFormData({
            name: data.profile?.name || '',
            bio: data.profile?.bio || '',
            shortBio: data.profile?.shortBio || '',
            location: data.location || '',
            website: data.socialLinks?.website || '',
            youtube: data.socialLinks?.youtube || '',
            twitter: data.socialLinks?.twitter || '',
            instagram: data.socialLinks?.instagram || '',
          });
        }
      } catch (error) {
        console.error('Error fetching creator:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchCreatorProfile();
    }
  }, [userData, authLoading]);

  const handleSave = async () => {
    if (!userData?.creatorProfileId) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'creators', userData.creatorProfileId), {
        'profile.name': formData.name,
        'profile.bio': formData.bio,
        'profile.shortBio': formData.shortBio,
        location: formData.location,
        'socialLinks.website': formData.website,
        'socialLinks.youtube': formData.youtube,
        'socialLinks.twitter': formData.twitter,
        'socialLinks.instagram': formData.instagram,
        updatedAt: serverTimestamp(),
      });
      setMessage('✅ Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setMessage('❌ Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to access your creator dashboard.</p>
          <button
            onClick={() => router.push('/signin')}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!userData?.creatorProfileId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-gray-600 mb-4">
            You don't have a claimed creator profile yet. Find your profile and submit a claim request to manage it.
          </p>
          <button
            onClick={() => router.push('/search')}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg"
          >
            Find Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Creator Dashboard</h1>
          <button
            onClick={() => router.push(`/creator/${creator?.slug}`)}
            className="text-teal-600 hover:underline"
          >
            View Public Profile →
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-white rounded-lg border text-center">
            {message}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Followers</p>
              <p className="text-2xl font-bold text-gray-900">{creator?.stats?.followerCount?.toLocaleString() || '0'}</p>
              <span className="text-[10px] text-green-600 font-medium">+12 this week</span>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Profile Views</p>
              <p className="text-2xl font-bold text-gray-900">1,204</p>
              <span className="text-[10px] text-green-600 font-medium">+5% vs last mo</span>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">8,532</p>
              <span className="text-[10px] text-gray-400 font-medium">--</span>
           </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Profile Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Bio (140 chars)</label>
            <input
              type="text"
              value={formData.shortBio}
              onChange={(e) => setFormData({ ...formData, shortBio: e.target.value.slice(0, 140) })}
              className="w-full border rounded-lg p-2"
              maxLength={140}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.shortBio.length}/140</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border rounded-lg p-2 h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Dallas, TX"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <h2 className="text-lg font-semibold border-b pb-2 pt-4">Social Links</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">YouTube Channel</label>
            <input
              type="url"
              value={formData.youtube}
              onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              placeholder="https://youtube.com/@yourchannel"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Twitter/X</label>
            <input
              type="url"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="https://twitter.com/yourusername"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Instagram</label>
            <input
              type="url"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="https://instagram.com/yourusername"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
