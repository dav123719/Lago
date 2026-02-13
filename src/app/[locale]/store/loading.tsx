// ============================================
// Store Page Loading Skeleton
// ============================================

export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-lago-black">
      {/* Hero Skeleton */}
      <div className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0 bg-lago-charcoal animate-shimmer" />
        <div className="container-lg relative py-24">
          <div className="max-w-xl space-y-6">
            <div className="h-4 w-32 bg-lago-gray rounded animate-shimmer" />
            <div className="h-16 w-3/4 bg-lago-gray rounded animate-shimmer" />
            <div className="h-6 w-full bg-lago-gray rounded animate-shimmer" />
            <div className="h-12 w-48 bg-lago-gray rounded animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Store Section Skeleton */}
      <section className="py-16">
        <div className="container-lg">
          {/* Header Skeleton */}
          <div className="text-center mb-12 space-y-4">
            <div className="h-10 w-48 mx-auto bg-lago-charcoal rounded animate-shimmer" />
            <div className="h-4 w-96 mx-auto bg-lago-charcoal rounded animate-shimmer" />
          </div>

          {/* Filters and Grid Skeleton */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Skeleton */}
            <aside className="lg:w-64 flex-shrink-0 space-y-6">
              <div className="h-12 bg-lago-charcoal rounded animate-shimmer" />
              <div className="space-y-4 p-4 bg-lago-charcoal rounded-lg">
                <div className="h-5 w-24 bg-lago-gray rounded animate-shimmer" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-lago-gray rounded animate-shimmer" />
                    <div className="h-4 w-24 bg-lago-gray rounded animate-shimmer" />
                  </div>
                ))}
              </div>
              <div className="space-y-4 p-4 bg-lago-charcoal rounded-lg">
                <div className="h-5 w-20 bg-lago-gray rounded animate-shimmer" />
                <div className="h-4 w-full bg-lago-gray rounded animate-shimmer" />
                <div className="h-2 w-full bg-lago-gray rounded animate-shimmer" />
              </div>
            </aside>

            {/* Grid Skeleton */}
            <div className="flex-1">
              <div className="flex justify-end mb-6">
                <div className="h-10 w-40 bg-lago-charcoal rounded animate-shimmer" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[4/3] bg-lago-charcoal rounded-lg animate-shimmer" />
                    <div className="h-3 w-16 bg-lago-charcoal rounded animate-shimmer" />
                    <div className="h-6 w-full bg-lago-charcoal rounded animate-shimmer" />
                    <div className="h-4 w-3/4 bg-lago-charcoal rounded animate-shimmer" />
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-20 bg-lago-charcoal rounded animate-shimmer" />
                      <div className="h-9 w-24 bg-lago-charcoal rounded animate-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
