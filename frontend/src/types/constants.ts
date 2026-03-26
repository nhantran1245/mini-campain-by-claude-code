import type { CampaignStatus } from './index';

// Campaign status values
export const CAMPAIGN_STATUSES: readonly CampaignStatus[] = [
  'draft',
  'scheduled',
  'sending',
  'sent',
] as const;

// Campaign status filter including 'all' option
export const CAMPAIGN_STATUS_FILTERS = ['all', ...CAMPAIGN_STATUSES] as const;
export type CampaignStatusFilter = typeof CAMPAIGN_STATUS_FILTERS[number];

// Status badge configuration
export const STATUS_BADGE_CONFIG: Record<
  CampaignStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 border border-gray-300',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-100 text-blue-700 border border-blue-300',
  },
  sending: {
    label: 'Sending',
    className: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  },
  sent: {
    label: 'Sent',
    className: 'bg-green-100 text-green-700 border border-green-300',
  },
};

// Helper to get status label
export const getStatusLabel = (status: CampaignStatus): string => {
  return STATUS_BADGE_CONFIG[status].label;
};

// Helper to get status className
export const getStatusClassName = (status: CampaignStatus): string => {
  return STATUS_BADGE_CONFIG[status].className;
};
