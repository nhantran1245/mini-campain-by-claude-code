import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/api/campaigns';
import StatusBadge from '@/components/StatusBadge';
import CampaignStatsDisplay from '@/components/CampaignStatsDisplay';
import CampaignActions from '@/components/CampaignActions';
import { CampaignDetailSkeleton } from '@/components/Skeletons';
import ErrorMessage from '@/components/ErrorMessage';
import { formatDateTime } from '@/utils/date';

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id || '0', 10);

  const {
    data: campaign,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsApi.getById(campaignId),
    refetchInterval: (query) => {
      // Poll every 2 seconds if campaign is in 'sending' status
      const data = query.state.data;
      return data?.status === 'sending' ? 2000 : false;
    },
  });

  const { data: recipientsData } = useQuery({
    queryKey: ['campaign-recipients', campaignId],
    queryFn: () => campaignsApi.getRecipients(campaignId, { limit: 100 }),
    enabled: !!campaign,
  });

  const recipients = recipientsData?.data || [];

  // Refetch when status changes
  useEffect(() => {
    if (campaign?.status === 'sending' || campaign?.status === 'sent') {
      const interval = setInterval(() => {
        refetch();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status, refetch]);

  if (isLoading) return <CampaignDetailSkeleton />;

  if (error || !campaign) {
    return (
      <ErrorMessage
        message="Failed to load campaign details"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500">
          <Link to="/campaigns" className="hover:text-gray-700">Campaigns</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{campaign.name}</span>
        </nav>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {campaign.name}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Created {formatDateTime(campaign.created_at)}
            </p>
          </div>
          <StatusBadge status={campaign.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Campaign Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Subject</p>
                <p className="mt-1 text-gray-900">{campaign.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Body</p>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                  {campaign.body}
                </p>
              </div>
              {campaign.scheduled_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Scheduled For
                  </p>
                  <p className="mt-1 text-blue-600 font-medium">
                    {formatDateTime(campaign.scheduled_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <CampaignStatsDisplay stats={campaign.stats} />

          {/* Recipients List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recipients ({recipients.length})
            </h2>
            {recipients.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No recipients found
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {recipient.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {recipient.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {recipient.status === 'pending' && (
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                          Pending
                        </span>
                      )}
                      {recipient.status === 'sent' && (
                        <>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Sent
                          </span>
                          {recipient.opened_at && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              Opened
                            </span>
                          )}
                        </>
                      )}
                      {recipient.status === 'failed' && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <CampaignActions campaign={campaign} onSuccess={refetch} />
        </div>
      </div>
    </div>
  );
}
