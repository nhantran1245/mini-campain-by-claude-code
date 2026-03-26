import { Link } from 'react-router-dom';
import type { Campaign } from '@/types';
import StatusBadge from './StatusBadge';
import { formatDateTime } from '@/utils/date';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {campaign.name}
        </h3>
        <StatusBadge status={campaign.status} />
      </div>

      <p className="text-sm text-gray-600 mb-2 font-medium">
        Subject: {campaign.subject}
      </p>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
        {campaign.body}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Created {formatDateTime(campaign.created_at)}</span>
        {campaign.scheduled_at && (
          <span className="text-blue-600 font-medium">
            Scheduled for {formatDateTime(campaign.scheduled_at)}
          </span>
        )}
      </div>
    </Link>
  );
}
