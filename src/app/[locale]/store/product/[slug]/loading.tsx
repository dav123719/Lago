// ============================================
// Product Detail Loading Skeleton
// ============================================

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-lago-black pt-24">
      <div className="container-lg">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-32 bg-lago-charcoal rounded animate-shimmer mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-lago-charcoal rounded-lg animate-shimmer" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-lago-charcoal rounded-lg animate-shimmer"
                />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div className="h-4 w-24 bg-lago-charcoal rounded animate-shimmer" />
            <div className="h-10 w-3/4 bg-lago-charcoal rounded animate-shimmer" />
            <div className="h-6 w-full bg-lago-charcoal rounded animate-shimmer" />
            
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-lago-charcoal rounded animate-shimmer" />
              <div className="h-6 w-24 bg-lago-charcoal rounded animate-shimmer" />
            </div>

            <div className="h-10 w-40 bg-lago-charcoal rounded animate-shimmer" />

            <div className="flex items-center gap-4">
              <div className="h-12 w-32 bg-lago-charcoal rounded animate-shimmer" />
              <div className="h-12 flex-1 bg-lago-charcoal rounded animate-shimmer" />
            </div>

            <div className="border-t border-lago-gray pt-6 space-y-4">
              <div className="h-6 w-32 bg-lago-charcoal rounded animate-shimmer" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-5 w-full bg-lago-charcoal rounded animate-shimmer"
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-lago-gray pt-6">
              <div className="h-6 w-32 bg-lago-charcoal rounded animate-shimmer mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-lago-charcoal rounded animate-shimmer" />
                <div className="h-4 w-full bg-lago-charcoal rounded animate-shimmer" />
                <div className="h-4 w-2/3 bg-lago-charcoal rounded animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="border-t border-lago-gray mt-16 pt-16">
          <div className="h-8 w-48 bg-lago-charcoal rounded animate-shimmer mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] bg-lago-charcoal rounded-lg animate-shimmer" />
                <div className="h-4 w-20 bg-lago-charcoal rounded animate-shimmer" />
                <div className="h-6 w-full bg-lago-charcoal rounded animate-shimmer" />
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 bg-lago-charcoal rounded animate-shimmer" />
                  <div className="h-9 w-24 bg-lago-charcoal rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
