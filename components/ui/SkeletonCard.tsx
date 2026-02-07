"use client";

export function SkeletonCreatorCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card animate-pulse">
      {/* Top gradient accent bar */}
      <div className="h-1.5 w-full bg-muted" />

      <div className="p-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 shrink-0 rounded-xl bg-muted" />

          <div className="min-w-0 flex-1 space-y-2">
            {/* Name */}
            <div className="h-5 w-32 rounded bg-muted" />
            {/* Category & location */}
            <div className="h-3 w-24 rounded bg-muted" />
            {/* Bio line 1 */}
            <div className="h-3 w-full rounded bg-muted" />
            {/* Bio line 2 */}
            <div className="h-3 w-3/4 rounded bg-muted" />
          </div>
        </div>

        {/* Topic badges */}
        <div className="mt-3 flex gap-1.5">
          <div className="h-5 w-14 rounded-full bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
          <div className="h-5 w-12 rounded-full bg-muted" />
        </div>

        {/* Bottom stats bar */}
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-3">
            <div className="h-3 w-12 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCreatorGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCreatorCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonCreatorRow({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCreatorCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonProfilePage() {
  return (
    <div className="min-h-screen bg-slate-900 animate-pulse">
      {/* Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700" />
      {/* Cover gradient */}
      <div className="h-36 sm:h-48 bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800" />
      {/* Profile info */}
      <div className="max-w-6xl mx-auto px-4 -mt-14 sm:-mt-20">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-slate-700 ring-4 ring-slate-900" />
          <div className="flex-1 flex flex-col items-center md:items-start gap-3 mt-4">
            {/* Name */}
            <div className="h-8 w-48 bg-slate-700 rounded-lg" />
            {/* Badges */}
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-slate-700 rounded-full" />
              <div className="h-6 w-16 bg-slate-700 rounded-full" />
            </div>
            {/* Meta */}
            <div className="flex gap-3">
              <div className="h-5 w-24 bg-slate-700 rounded-full" />
              <div className="h-5 w-20 bg-slate-700 rounded-lg" />
            </div>
          </div>
          {/* Follow button */}
          <div className="h-10 w-28 bg-slate-700 rounded-full" />
        </div>
      </div>
      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-8 flex gap-4 border-b border-slate-700 pb-3">
        <div className="h-5 w-16 bg-slate-700 rounded" />
        <div className="h-5 w-16 bg-slate-700 rounded" />
        <div className="h-5 w-16 bg-slate-700 rounded" />
      </div>
      {/* Content area */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="h-32 bg-slate-800 rounded-xl" />
        <div className="h-48 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
