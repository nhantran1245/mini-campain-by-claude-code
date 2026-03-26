import type { CampaignStats } from '@/types';

interface CampaignStatsDisplayProps {
  stats: CampaignStats;
}

export default function CampaignStatsDisplay({
  stats,
}: CampaignStatsDisplayProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Campaign Statistics
        </h2>
        <p className="text-sm text-gray-500">No statistics available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Campaign Statistics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Total Recipients</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Sent</p>
          <p className="text-3xl font-bold text-green-600">{stats.sent || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            {(stats.send_rate || 0).toFixed(1)}% send rate
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed || 0}</p>
        </div>

        <div className="col-span-2 md:col-span-3">
          <p className="text-sm text-gray-500 mb-1">Opened</p>
          <p className="text-3xl font-bold text-blue-600">{stats.opened || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            {(stats.open_rate || 0).toFixed(1)}% open rate
          </p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-6 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Sent Progress</span>
            <span className="font-medium">{(stats.send_rate || 0).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${stats.send_rate || 0}%` }}
            />
          </div>
        </div>

        {stats.sent > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Open Rate</span>
              <span className="font-medium">
                {(stats.open_rate || 0).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.open_rate || 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
