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
  const [stageResults, setStageResults] = useState<any>(null);
  
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
    setStageResults(null);

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
      setEditedData(data.firestoreData);
      setStageResults(data.stages);
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
          <h1 className="text-2xl font-bold">🤖 Multi-Stage Profile Generator</h1>
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
            AI will search the web, verify links with YouTube API, and enrich data with Claude.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Pipeline Progress / Results */}
        {stageResults && (
           <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Stage 1: Discovery */}
              <div className={`p-4 rounded-lg border ${stageResults.discovery.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${stageResults.discovery.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <h3 className="font-semibold text-sm">Stage 1: Discovery</h3>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>{stageResults.discovery.foundYouTube ? '✅' : '❌'} YouTube Channel</p>
                  <p>{stageResults.discovery.foundPodcast ? '✅' : '❌'} Podcast</p>
                  <p>📚 {stageResults.discovery.booksFound} Books Found</p>
                </div>
              </div>

              {/* Stage 2: Verification */}
              <div className={`p-4 rounded-lg border ${stageResults.verification.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${stageResults.verification.success ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <h3 className="font-semibold text-sm">Stage 2: Verification</h3>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>🔗 {stageResults.verification.linksValid}/{stageResults.verification.linksChecked} Links Valid</p>
                  <p>{stageResults.verification.youtubeVerified ? '✅' : '⚠️'} YouTube API Verified</p>
                  <p>{stageResults.verification.podcastVerified ? '✅' : '⚠️'} Podcast RSS Verified</p>
                </div>
              </div>

              {/* Stage 3: Enrichment */}
              <div className={`p-4 rounded-lg border ${stageResults.enrichment.success ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                 <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${stageResults.enrichment.success ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <h3 className="font-semibold text-sm">Stage 3: Enrichment</h3>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>✨ Confidence: {stageResults.enrichment.confidence?.toUpperCase()}</p>
                  <p>📊 Score: {stageResults.enrichment.confidenceScore}/100</p>
                  {stageResults.enrichment.confidenceimproved && <p>🚀 Quality Improved</p>}
                </div>
              </div>
           </div>
        )}

        {/* Step 2: Review & Edit Generated Profile */}
        {editedData && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Step 2: Review & Edit Profile</h2>
            
            {/* Confidence Badge */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                generatedProfile?.confidence === 'high' ? 'bg-green-100 text-green-800' :
                generatedProfile?.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Confidence: {generatedProfile?.confidence?.toUpperCase() || 'UNKNOWN'}
              </span>
              {generatedProfile?.confidenceScore !== undefined && (
                <span className="ml-2 text-sm text-gray-500">
                  ({generatedProfile.confidenceScore}/100)
                </span>
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
              <div>
                <label className="block text-sm font-medium mb-1">🎧 Spotify</label>
                <input
                  type="url"
                  value={editedData.socialLinks?.spotify || ''}
                  onChange={(e) => updateField('socialLinks.spotify', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

            </div>

            {/* Books */}
            {/* Books (Editable) */}
            <div className="mt-6">
               <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">📚 Books</h3>
                  <button 
                    onClick={() => {
                        const newBooks = [...(editedData.content?.books || [])];
                        newBooks.push({ title: "", year: new Date().getFullYear() });
                        updateField("content.books", newBooks);
                    }}
                    className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded hover:bg-teal-100"
                  >
                    + Add Book
                  </button>
               </div>
               
               <div className="space-y-3">
                  {(editedData.content?.books || []).map((book: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                       <div className="flex gap-2 mb-2">
                          <input 
                            type="text" 
                            value={book.title || ""} 
                            onChange={(e) => {
                                const newBooks = [...editedData.content.books];
                                newBooks[i].title = e.target.value;
                                updateField("content.books", newBooks);
                            }}
                            placeholder="Book Title"
                            className="flex-1 border rounded px-2 py-1 text-sm font-medium"
                          />
                          <input 
                            type="number" 
                            value={book.year || ""} 
                            onChange={(e) => {
                                const newBooks = [...editedData.content.books];
                                newBooks[i].year = parseInt(e.target.value) || undefined;
                                updateField("content.books", newBooks);
                            }}
                            placeholder="Year"
                            className="w-20 border rounded px-2 py-1 text-sm"
                          />
                           <button 
                            onClick={() => {
                                const newBooks = editedData.content.books.filter((_: any, idx: number) => idx !== i);
                                updateField("content.books", newBooks);
                            }}
                            className="text-red-400 hover:text-red-600 px-1"
                          >
                            ×
                          </button>
                       </div>
                       <input 
                            type="url" 
                            value={book.amazonUrl || ""} 
                            onChange={(e) => {
                                const newBooks = [...editedData.content.books];
                                newBooks[i].amazonUrl = e.target.value;
                                updateField("content.books", newBooks);
                            }}
                            placeholder="Amazon URL"
                            className="w-full border rounded px-2 py-1 text-xs text-gray-600 bg-white"
                          />
                    </div>
                  ))}
               </div>
            </div>

            {/* Courses (Editable) */}
            <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">🎓 Courses</h3>
                  <button 
                    onClick={() => {
                        const newCourses = [...(editedData.content?.courses || [])];
                        newCourses.push({ title: "", platform: "Bayyinah" });
                        updateField("content.courses", newCourses);
                    }}
                    className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded hover:bg-teal-100"
                  >
                    + Add Course
                  </button>
               </div>

                <div className="space-y-3">
                  {(editedData.content?.courses || []).map((course: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                       <div className="flex gap-2 mb-2">
                          <input 
                            type="text" 
                            value={course.title || ""} 
                            onChange={(e) => {
                                const newCourses = [...editedData.content.courses];
                                newCourses[i].title = e.target.value;
                                updateField("content.courses", newCourses);
                            }}
                            placeholder="Course Title"
                            className="flex-1 border rounded px-2 py-1 text-sm font-medium"
                          />
                          <input 
                            type="text" 
                            value={course.platform || ""} 
                            onChange={(e) => {
                                const newCourses = [...editedData.content.courses];
                                newCourses[i].platform = e.target.value;
                                updateField("content.courses", newCourses);
                            }}
                            placeholder="Platform"
                            className="w-32 border rounded px-2 py-1 text-sm"
                          />
                           <button 
                            onClick={() => {
                                const newCourses = editedData.content.courses.filter((_: any, idx: number) => idx !== i);
                                updateField("content.courses", newCourses);
                            }}
                            className="text-red-400 hover:text-red-600 px-1"
                          >
                            ×
                          </button>
                       </div>
                       <input 
                            type="url" 
                            value={course.url || ""} 
                            onChange={(e) => {
                                const newCourses = [...editedData.content.courses];
                                newCourses[i].url = e.target.value;
                                updateField("content.courses", newCourses);
                            }}
                            placeholder="Course URL"
                            className="w-full border rounded px-2 py-1 text-xs text-gray-600 bg-white"
                          />
                    </div>
                  ))}
               </div>
            </div>

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
            {editedData?.aiGenerated?.sources?.length > 0 && (
              <div className="mt-6 text-sm text-gray-500">
                <p className="font-medium">Sources used:</p>
                <ul className="list-disc list-inside">
                  {editedData.aiGenerated.sources.map((source: string, i: number) => (
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
                  setStageResults(null); 
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
