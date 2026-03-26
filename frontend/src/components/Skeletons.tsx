export function CampaignCardSkeleton() {
  return (
    <div className="block bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

export function CampaignDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-9 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-5 bg-gray-200 rounded w-20 mb-4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-b border-gray-100 last:border-b-0 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
