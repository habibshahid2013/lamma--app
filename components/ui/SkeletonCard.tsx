"use client";

export function SkeletonCreatorCard() {
  return (
    <div className="flex flex-col items-center p-3.5 sm:p-4 rounded-2xl border border-gray-100 w-[168px] sm:w-48 flex-shrink-0 bg-white animate-pulse shadow-[0_2px_16px_-4px_rgba(0,0,0,0.05)]">
      {/* Avatar with ring */}
      <div className="w-[76px] h-[76px] rounded-full bg-gradient-to-br from-gray-200 to-gray-100 mb-3 ring-2 ring-gray-100" />
      {/* Name */}
      <div className="h-4 w-24 bg-gray-200 rounded-full mb-1.5" />
      {/* Category */}
      <div className="h-3 w-16 bg-gray-100 rounded-full mb-2" />
      {/* Language badges */}
      <div className="flex gap-1.5 mb-2.5">
        <div className="h-4 w-8 bg-gray-100 rounded-md" />
        <div className="h-4 w-8 bg-gray-100 rounded-md" />
      </div>
      {/* Spacer for note area */}
      <div className="h-8 mb-3" />
      {/* Button */}
      <div className="w-full h-9 bg-gray-100 rounded-full" />
    </div>
  );
}

export function SkeletonCreatorGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-center">
          <SkeletonCreatorCard />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCreatorRow({ count = 3 }: { count?: number }) {
  return (
    <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
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
