// src/app/admin/add-creator/page.tsx
// Admin UI for AI-Powered Creator Profile Generation

'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export default function AddCreatorPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedProfile, setGeneratedProfile] = useState<any>(null);
  const [firestoreData, setFirestoreData] = useState<any>(null); // This holds the 'initial' generated state for diffing if needed
  
  // Editable fields - we bind the UI to this state
  const [editedData, setEditedData] = useState<any>(null);

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

  const handleGenerate = async () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedProfile(null);
    setEditedData(null);

    try {
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), saveToDatabase: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate profile');
      }

      setGeneratedProfile(data.profile);
      setFirestoreData(data.firestoreData);
      setEditedData(data.firestoreData);
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editedData) return;

    setSaving(true);
    setError(null);

    try {
      // Save creator document
      await setDoc(doc(db, 'creators', editedData.creatorId), {
        ...editedData,
        updatedAt: new Date(),
      });

      // Save slug mapping
      await setDoc(doc(db, 'slugs', editedData.slug), {
        creatorId: editedData.creatorId,
      });

      alert('✅ Creator saved successfully!');
      router.push(`/creator/${editedData.slug}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path: string, value: any) => {
    setEditedData((prev: any) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let obj = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}; // Create nested object if missing
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🤖 AI Profile Generator</h1>
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Admin
          </button>
        </div>

        {/* Step 1: Enter Name */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Step 1: Enter Creator Name</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Omar Suleiman, Yasmin Mogahed, Mufti Menk"
              className="flex-1 border rounded-lg px-4 py-3 text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !name.trim()}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {generating ? '🔄 Generating...' : '✨ Generate Profile'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            AI will search the web and generate a complete profile with social links, books, podcasts, and more.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Step 2: Review & Edit Generated Profile */}
        {editedData && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Step 2: Review & Edit Profile</h2>
            
            {/* Confidence Badge */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                generatedProfile?.confidence?.overall === 'high' ? 'bg-green-100 text-green-800' :
                generatedProfile?.confidence?.overall === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Confidence: {generatedProfile?.confidence?.overall || 'unknown'}
              </span>
              {generatedProfile?.confidence?.notes?.length > 0 && (
                <ul className="mt-2 text-sm text-gray-600">
                  {generatedProfile.confidence.notes.map((note: string, i: number) => (
                    <li key={i}>• {note}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editedData.profile?.name || ''}
                  onChange={(e) => updateField('profile.name', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={editedData.profile?.displayName || ''}
                  onChange={(e) => updateField('profile.displayName', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editedData.profile?.title || ''}
                  onChange={(e) => updateField('profile.title', e.target.value)}
                  placeholder="Dr., Sheikh, Imam, etc."
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editedData.category || ''}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="scholar">Scholar</option>
                  <option value="speaker">Speaker</option>
                  <option value="educator">Educator</option>
                  <option value="reciter">Reciter</option>
                  <option value="author">Author</option>
                  <option value="activist">Activist</option>
                  <option value="youth_leader">Youth Leader</option>
                  <option value="podcaster">Podcaster</option>
                  <option value="influencer">Influencer</option>
                  <option value="public_figure">Public Figure</option>
                </select>
              </div>
            </div>

            {/* Short Bio */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Short Bio (140 chars)</label>
              <input
                type="text"
                value={editedData.profile?.shortBio || ''}
                onChange={(e) => updateField('profile.shortBio', e.target.value.slice(0, 140))}
                className="w-full border rounded-lg px-3 py-2"
                maxLength={140}
              />
              <p className="text-xs text-gray-500 mt-1">{(editedData.profile?.shortBio || '').length}/140</p>
            </div>

            {/* Full Bio */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Full Bio</label>
              <textarea
                value={editedData.profile?.bio || ''}
                onChange={(e) => updateField('profile.bio', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 h-32"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select
                  value={editedData.region || ''}
                  onChange={(e) => updateField('region', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="americas">Americas</option>
                  <option value="east_africa">East Africa</option>
                  <option value="west_africa">West Africa</option>
                  <option value="north_africa">North Africa</option>
                  <option value="middle_east">Middle East</option>
                  <option value="south_asia">South Asia</option>
                  <option value="southeast_asia">Southeast Asia</option>
                  <option value="europe">Europe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country (ISO)</label>
                <input
                  type="text"
                  value={editedData.country || ''}
                  onChange={(e) => updateField('country', e.target.value.toUpperCase())}
                  placeholder="US, UK, SA, etc."
                  className="w-full border rounded-lg px-3 py-2"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={editedData.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Dallas, TX"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Languages & Topics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Languages (comma-separated)</label>
                <input
                  type="text"
                  value={(editedData.languages || []).join(', ')}
                  onChange={(e) => updateField('languages', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  placeholder="English, Arabic, Urdu"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Topics (comma-separated)</label>
                <input
                  type="text"
                  value={(editedData.topics || []).join(', ')}
                  onChange={(e) => updateField('topics', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  placeholder="Spirituality, Quran, Youth"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Social Links */}
            <h3 className="font-semibold mb-3 mt-6">Social Links</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">🌐 Website</label>
                <input
                  type="url"
                  value={editedData.socialLinks?.website || ''}
                  onChange={(e) => updateField('socialLinks.website', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">📺 YouTube</label>
                <input
                  type="url"
                  value={editedData.socialLinks?.youtube || ''}
                  onChange={(e) => updateField('socialLinks.youtube', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">🐦 Twitter/X</label>
                <input
                  type="url"
                  value={editedData.socialLinks?.twitter || ''}
                  onChange={(e) => updateField('socialLinks.twitter', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">📸 Instagram</label>
                <input
                  type="url"
                  value={editedData.socialLinks?.instagram || ''}
                  onChange={(e) => updateField('socialLinks.instagram', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">🎙️ Podcast RSS</label>
                <input
                  type="url"
                  value={editedData.socialLinks?.podcast || ''}
                  onChange={(e) => updateField('socialLinks.podcast', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Books */}
            {editedData.content?.books?.length > 0 && (
              <>
                <h3 className="font-semibold mb-3 mt-6">📚 Books</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  {editedData.content.books.map((book: any, i: number) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <span className="font-medium">{book.title}</span>
                      {book.year && <span className="text-gray-500 ml-2">({book.year})</span>}
                      {book.amazonUrl && (
                        <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 ml-2 text-sm">
                          Amazon →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Courses */}
            {editedData.content?.courses?.length > 0 && (
              <>
                <h3 className="font-semibold mb-3 mt-6">🎓 Courses</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  {editedData.content.courses.map((course: any, i: number) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <span className="font-medium">{course.title}</span>
                      <span className="text-gray-500 ml-2">({course.platform})</span>
                      {course.url && (
                        <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 ml-2 text-sm">
                          View →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Profile Image */}
            <h3 className="font-semibold mb-3 mt-6">🖼️ Profile Image</h3>
            <div className="mb-6">
              <div className="flex items-start gap-4">
                {editedData.profile?.avatar ? (
                  <img 
                    src={editedData.profile.avatar} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editedData.profile?.avatar || ''}
                    onChange={(e) => updateField('profile.avatar', e.target.value)}
                    placeholder="https://..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Search suggestion: "{editedData.aiGenerated?.imageSearchQuery}"
                  </p>
                </div>
              </div>
            </div>

            {/* Sources */}
            {generatedProfile?.sources?.length > 0 && (
              <div className="mt-6 text-sm text-gray-500">
                <p className="font-medium">Sources used:</p>
                <ul className="list-disc list-inside">
                  {generatedProfile.sources.map((source: string, i: number) => (
                    <li key={i}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Save */}
        {editedData && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Step 3: Save to Database</h2>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? '💾 Saving...' : '✅ Save Creator to Database'}
              </button>
              <button
                onClick={() => {
                  setGeneratedProfile(null);
                  setFirestoreData(null);
                  setEditedData(null);
                  setName('');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Start Over
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This will create a new creator profile at: <code>/creator/{editedData.slug}</code>
            </p>
            <p className="text-xs text-red-400 mt-1">Note: Please double check the data before saving.</p>
          </div>
        )}
      </div>
    </div>
  );
}
