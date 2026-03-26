import type { CampaignStatus } from '@/types';
import { STATUS_BADGE_CONFIG } from '@/types/constants';
import { cn } from '@/utils/cn';

interface StatusBadgeProps {
  status: CampaignStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
