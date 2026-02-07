"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Creator, CreatorCategory, CreatorRegion } from "@/lib/types/creator";
import {
  ArrowLeft,
  Search,
  Plus,
  Save,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImageIcon,
  Check,
  AlertTriangle,
  Loader2,
  Users,
  Filter,
  Edit3,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: { value: CreatorCategory; label: string }[] = [
  { value: "scholar", label: "Scholar" },
  { value: "educator", label: "Educator" },
  { value: "speaker", label: "Speaker" },
  { value: "reciter", label: "Reciter" },
  { value: "author", label: "Author" },
  { value: "activist", label: "Activist" },
  { value: "influencer", label: "Influencer" },
  { value: "public_figure", label: "Public Figure" },
  { value: "youth_leader", label: "Youth Leader" },
  { value: "podcaster", label: "Podcaster" },
];

const REGIONS: { value: CreatorRegion; label: string }[] = [
  { value: "americas", label: "Americas" },
  { value: "europe", label: "Europe" },
  { value: "middle_east", label: "Middle East" },
  { value: "africa", label: "Africa" },
  { value: "south_asia", label: "South Asia" },
  { value: "southeast_asia", label: "Southeast Asia" },
  { value: "east_africa", label: "East Africa" },
  { value: "west_africa", label: "West Africa" },
  { value: "north_africa", label: "North Africa" },
];

const GENDERS = [
  { value: "male" as const, label: "Male" },
  { value: "female" as const, label: "Female" },
];

// ---------------------------------------------------------------------------
// Helper: generate slug from name
// ---------------------------------------------------------------------------
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ---------------------------------------------------------------------------
// Blank creator template
// ---------------------------------------------------------------------------
function blankCreator(): Partial<Creator> {
  return {
    name: "",
    slug: "",
    category: "scholar",
    tier: "new",
    gender: "male",
    region: "americas",
    country: "US",
    countryFlag: "",
    languages: ["English"],
    topics: [],
    verified: false,
    verificationLevel: "none",
    featured: false,
    trending: false,
    isHistorical: false,
    profile: {
      name: "",
      displayName: "",
      title: "",
      avatar: null,
      coverImage: null,
      shortBio: "",
      bio: "",
    },
    socialLinks: {},
    source: "manual",
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ManageCreatorsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data state
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterHasAvatar, setFilterHasAvatar] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Edit state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Creator> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New creator mode
  const [isAddingNew, setIsAddingNew] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch all creators
  // ---------------------------------------------------------------------------
  const fetchCreators = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "creators"), orderBy("name", "asc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Creator[];
      setCreators(data);
    } catch (err) {
      console.error("Error fetching creators:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && userData?.role === "admin") {
      fetchCreators();
    }
  }, [authLoading, userData, fetchCreators]);

  // ---------------------------------------------------------------------------
  // Filtered creators
  // ---------------------------------------------------------------------------
  const filtered = useMemo(() => {
    return creators.filter((c) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = c.name?.toLowerCase().includes(q);
        const slugMatch = c.slug?.toLowerCase().includes(q);
        const bioMatch = (c.profile?.shortBio || "").toLowerCase().includes(q);
        if (!nameMatch && !slugMatch && !bioMatch) return false;
      }
      if (filterCategory !== "all" && c.category !== filterCategory) return false;
      if (filterRegion !== "all" && c.region !== filterRegion) return false;
      if (filterHasAvatar === "yes" && !c.profile?.avatar) return false;
      if (filterHasAvatar === "no" && c.profile?.avatar) return false;
      return true;
    });
  }, [creators, searchQuery, filterCategory, filterRegion, filterHasAvatar]);

  // ---------------------------------------------------------------------------
  // Edit helpers
  // ---------------------------------------------------------------------------
  const startEdit = (creator: Creator) => {
    if (expandedId === creator.id) {
      setExpandedId(null);
      setEditData(null);
      return;
    }
    setExpandedId(creator.id);
    setEditData(JSON.parse(JSON.stringify(creator)));
    setIsAddingNew(false);
  };

  const startAddNew = () => {
    setIsAddingNew(true);
    setExpandedId(null);
    setEditData(blankCreator());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setExpandedId(null);
    setEditData(null);
    setIsAddingNew(false);
  };

  const updateField = (path: string, value: any) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // Auto-generate slug from name for new creators
  const handleNameChange = (name: string) => {
    updateField("name", name);
    updateField("profile.name", name);
    updateField("profile.displayName", name);
    if (isAddingNew) {
      updateField("slug", slugify(name));
    }
  };

  // ---------------------------------------------------------------------------
  // Save creator
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (!editData || !editData.name?.trim()) return;

    setSaving(true);
    setSuccessMsg(null);
    try {
      const creatorId = isAddingNew ? (editData.slug || slugify(editData.name)) : expandedId!;
      const slug = editData.slug || slugify(editData.name);

      const saveData = {
        ...editData,
        id: creatorId,
        creatorId: creatorId,
        slug: slug,
        name: editData.name,
        updatedAt: new Date(),
        ...(isAddingNew ? { createdAt: new Date() } : {}),
      };

      // Save creator doc
      await setDoc(doc(db, "creators", creatorId), saveData, { merge: true });

      // Save slug mapping
      await setDoc(doc(db, "slugs", slug), { creatorId, name: editData.name, updatedAt: new Date() }, { merge: true });

      setSuccessMsg(isAddingNew ? `Created "${editData.name}" successfully` : `Updated "${editData.name}" successfully`);

      // Refresh list
      await fetchCreators();

      if (isAddingNew) {
        setIsAddingNew(false);
        setEditData(null);
      } else {
        setExpandedId(null);
        setEditData(null);
      }

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error saving creator:", err);
      alert("Error saving: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Delete creator
  // ---------------------------------------------------------------------------
  const handleDelete = async (creator: Creator) => {
    if (!confirm(`Are you sure you want to delete "${creator.name}"? This cannot be undone.`)) return;

    setDeleting(creator.id);
    try {
      await deleteDoc(doc(db, "creators", creator.id));
      if (creator.slug) {
        await deleteDoc(doc(db, "slugs", creator.slug));
      }
      setCreators((prev) => prev.filter((c) => c.id !== creator.id));
      if (expandedId === creator.id) {
        setExpandedId(null);
        setEditData(null);
      }
      setSuccessMsg(`Deleted "${creator.name}"`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Error deleting: " + String(err));
    } finally {
      setDeleting(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Auth checks
  // ---------------------------------------------------------------------------
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || userData?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center rounded-xl border bg-card p-8">
          <h1 className="text-2xl font-bold mb-4">Admin Access Only</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to view this page.</p>
          <button onClick={() => router.push("/")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin
            </button>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-lg font-bold">Manage Creators</h1>
            <span className="text-sm text-muted-foreground">({creators.length} total)</span>
          </div>
          <button
            onClick={startAddNew}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Creator
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Success message */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            <Check className="h-4 w-4" />
            {successMsg}
          </div>
        )}

        {/* Add New Creator Form */}
        {isAddingNew && editData && (
          <div className="mb-6 rounded-xl border-2 border-primary/50 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">New Creator</h2>
              <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CreatorEditForm
              data={editData}
              updateField={updateField}
              onNameChange={handleNameChange}
              isNew
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !editData.name?.trim()}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Create Creator"}
              </button>
              <button onClick={cancelEdit} className="rounded-lg border px-4 py-2.5 text-sm hover:bg-accent">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, slug, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
              showFilters ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border bg-card p-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
              >
                <option value="all">All Regions</option>
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Avatar</label>
              <select
                value={filterHasAvatar}
                onChange={(e) => setFilterHasAvatar(e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
              >
                <option value="all">All</option>
                <option value="yes">Has Avatar</option>
                <option value="no">Missing Avatar</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterCategory("all");
                  setFilterRegion("all");
                  setFilterHasAvatar("all");
                  setSearchQuery("");
                }}
                className="w-full rounded-md border px-2 py-1.5 text-sm hover:bg-accent"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            Showing {filtered.length} of {creators.length} creators
          </span>
        </div>

        {/* Creator Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Table Header */}
          <div className="hidden border-b bg-accent/30 px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-4">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Region</div>
            <div className="col-span-1">Avatar</div>
            <div className="col-span-1">Verified</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No creators match your filters</p>
            </div>
          ) : (
            filtered.map((creator) => (
              <div key={creator.id} className="border-b last:border-b-0">
                {/* Row */}
                <div
                  onClick={() => startEdit(creator)}
                  className={`cursor-pointer px-4 py-3 transition-colors hover:bg-accent/30 sm:grid sm:grid-cols-12 sm:items-center sm:gap-4 ${
                    expandedId === creator.id ? "bg-accent/40" : ""
                  }`}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    {creator.profile?.avatar ? (
                      <img
                        src={creator.profile.avatar}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {creator.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{creator.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{creator.slug}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-xs capitalize">
                      {creator.category?.replace("_", " ")}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground capitalize">
                    {creator.region?.replace("_", " ")}
                  </div>
                  <div className="col-span-1">
                    {creator.profile?.avatar ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className="col-span-1">
                    {creator.verified ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/creator/${creator.slug}`);
                      }}
                      className="rounded-md p-1.5 hover:bg-accent"
                      title="View profile"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(creator);
                      }}
                      disabled={deleting === creator.id}
                      className="rounded-md p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20"
                      title="Delete"
                    >
                      {deleting === creator.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      )}
                    </button>
                    {expandedId === creator.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Edit Panel */}
                {expandedId === creator.id && editData && (
                  <div className="border-t bg-accent/10 px-4 py-5">
                    <CreatorEditForm
                      data={editData}
                      updateField={updateField}
                      onNameChange={handleNameChange}
                    />
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-accent"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Creator Edit Form (reusable for both new & existing)
// ===========================================================================

function CreatorEditForm({
  data,
  updateField,
  onNameChange,
  isNew,
}: {
  data: Partial<Creator>;
  updateField: (path: string, value: any) => void;
  onNameChange: (name: string) => void;
  isNew?: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Basic Info */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Edit3 className="h-4 w-4" />
          Basic Information
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Name *</label>
            <input
              type="text"
              value={data.name || ""}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Slug {isNew && <span className="text-muted-foreground">(auto)</span>}
            </label>
            <input
              type="text"
              value={data.slug || ""}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="url-slug"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              readOnly={!isNew}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
            <select
              value={data.category || "scholar"}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Gender</label>
            <select
              value={data.gender || "male"}
              onChange={(e) => updateField("gender", e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Profile title + bio */}
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title / Honorific</label>
            <input
              type="text"
              value={data.profile?.title || ""}
              onChange={(e) => updateField("profile.title", e.target.value)}
              placeholder="Sheikh, Dr., Ustadha, etc."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Short Bio ({(data.profile?.shortBio || "").length}/140)
            </label>
            <input
              type="text"
              value={data.profile?.shortBio || ""}
              onChange={(e) => updateField("profile.shortBio", e.target.value.slice(0, 140))}
              maxLength={140}
              placeholder="Brief description"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Bio</label>
          <textarea
            value={data.profile?.bio || ""}
            onChange={(e) => updateField("profile.bio", e.target.value)}
            placeholder="Detailed biography..."
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Location</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Region</label>
            <select
              value={data.region || "americas"}
              onChange={(e) => updateField("region", e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Country (ISO)</label>
            <input
              type="text"
              value={data.country || ""}
              onChange={(e) => updateField("country", e.target.value.toUpperCase())}
              placeholder="US"
              maxLength={2}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
            <input
              type="text"
              value={data.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="City, State"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Country Flag</label>
            <input
              type="text"
              value={data.countryFlag || ""}
              onChange={(e) => updateField("countryFlag", e.target.value)}
              placeholder="Flag emoji"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Languages (comma-separated)</label>
            <input
              type="text"
              value={(data.languages || []).join(", ")}
              onChange={(e) => updateField("languages", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
              placeholder="English, Arabic"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Topics (comma-separated)</label>
            <input
              type="text"
              value={(data.topics || []).join(", ")}
              onChange={(e) => updateField("topics", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
              placeholder="Quran, Fiqh, Spirituality"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Image */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ImageIcon className="h-4 w-4" />
          Image
        </h3>
        <div className="flex items-start gap-4">
          {data.profile?.avatar ? (
            <img
              src={data.profile.avatar}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Avatar URL</label>
            <input
              type="url"
              value={data.profile?.avatar || ""}
              onChange={(e) => updateField("profile.avatar", e.target.value || null)}
              placeholder="https://..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Social Links</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { key: "website", label: "Website" },
            { key: "youtube", label: "YouTube" },
            { key: "twitter", label: "Twitter/X" },
            { key: "instagram", label: "Instagram" },
            { key: "facebook", label: "Facebook" },
            { key: "tiktok", label: "TikTok" },
            { key: "linkedin", label: "LinkedIn" },
            { key: "podcast", label: "Podcast RSS" },
            { key: "spotify", label: "Spotify" },
          ].map((link) => (
            <div key={link.key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{link.label}</label>
              <input
                type="url"
                value={(data.socialLinks as any)?.[link.key] || ""}
                onChange={(e) => updateField(`socialLinks.${link.key}`, e.target.value || undefined)}
                placeholder={`https://...`}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Status Flags</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { key: "verified", label: "Verified" },
            { key: "featured", label: "Featured" },
            { key: "trending", label: "Trending" },
            { key: "isHistorical", label: "Historical" },
          ].map((flag) => (
            <label key={flag.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!(data as any)[flag.key]}
                onChange={(e) => updateField(flag.key, e.target.checked)}
                className="rounded border-border"
              />
              {flag.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
