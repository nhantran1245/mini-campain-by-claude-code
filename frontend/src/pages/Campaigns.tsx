import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/api/campaigns';
import CampaignCard from '@/components/CampaignCard';
import { CampaignCardSkeleton } from '@/components/Skeletons';
import ErrorMessage from '@/components/ErrorMessage';
import type { CampaignStatus } from '@/types';
import { CAMPAIGN_STATUS_FILTERS, STATUS_BADGE_CONFIG, type CampaignStatusFilter } from '@/types/constants';

export default function Campaigns() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>('all');
  const limit = 12;

  // Convert statusFilter to API parameter (null for 'all', otherwise the status value)
  const statusParam = statusFilter === 'all' ? null : statusFilter;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaigns', page, statusParam],
    queryFn: () =>
      campaignsApi.list({
        page,
        limit,
        status: statusParam === null ? undefined : statusParam,
      }),
  });

  const campaigns = data?.data || [];
  const pagination = data?.pagination;

  if (error) {
    return (
      <ErrorMessage
        message="Failed to load campaigns"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Campaigns</span>
        </nav>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and track your email campaigns
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {CAMPAIGN_STATUS_FILTERS.map((status) => {
          const isActive = statusFilter === status;
          
          const getStatusStyles = () => {
            if (status === 'all') {
              return isActive 
                ? 'bg-blue-600 text-white border border-blue-600 font-bold'
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300 font-medium';
            }
            
            const config = STATUS_BADGE_CONFIG[status as CampaignStatus];
            if (isActive) {
              return `${config.className} font-bold`;
            }
            
            // Inactive: white background with colored text
            const textColorMap = {
              draft: 'text-gray-700',
              scheduled: 'text-blue-700',
              sending: 'text-yellow-700',
              sent: 'text-green-700',
            };
            
            return `bg-white ${textColorMap[status as CampaignStatus]} hover:bg-gray-50 border border-gray-300 font-medium`;
          };

          const getLabel = () => {
            if (status === 'all') return 'All';
            return STATUS_BADGE_CONFIG[status as CampaignStatus].label;
          };

          return (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${getStatusStyles()}`}
            >
              {getLabel()}
            </button>
          );
        })}
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No campaigns found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new campaign.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
