import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { campaignsApi } from '@/api/campaigns';
import { VALIDATION_CONSTRAINTS } from '@/types/validation';
import type { Campaign } from '@/types';
import type { AxiosError } from 'axios';

interface CampaignActionsProps {
  campaign: Campaign;
  onSuccess: () => void;
}

export default function CampaignActions({
  campaign,
  onSuccess,
}: CampaignActionsProps) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [error, setError] = useState('');

  const deleteMutation = useMutation({
    mutationFn: () => campaignsApi.delete(campaign.id),
    onSuccess: () => {
      navigate('/campaigns');
    },
    onError: (err: AxiosError<{ error: { message: string; details?: string } }>) => {
      const errorData = err.response?.data?.error;
      const message = errorData?.message || 'Failed to delete campaign';
      const details = errorData?.details;
      setError(details ? `${message}. ${details}` : message);
      setShowDeleteModal(false);
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => campaignsApi.send(campaign.id),
    onSuccess: () => {
      setShowSendModal(false);
      setError('');
      onSuccess();
    },
    onError: (err: AxiosError<{ error: { message: string; details?: string } }>) => {
      const errorData = err.response?.data?.error;
      const message = errorData?.message || 'Failed to send campaign';
      const details = errorData?.details;
      setError(details ? `${message}. ${details}` : message);
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (date: string) =>
      campaignsApi.schedule(campaign.id, { scheduled_at: date }),
    onSuccess: () => {
      setShowScheduleModal(false);
      setScheduledDate('');
      setError('');
      onSuccess();
    },
    onError: (err: AxiosError<{ error: { message: string; details?: string } }>) => {
      const errorData = err.response?.data?.error;
      const message = errorData?.message || 'Failed to schedule campaign';
      const details = errorData?.details;
      setError(details ? `${message}. ${details}` : message);
    },
  });

  const canEdit = campaign.status === 'draft';
  const canDelete = campaign.status === 'draft';
  const canSchedule = campaign.status === 'draft';
  const canSend = campaign.status === 'draft' || campaign.status === 'scheduled';

  const handleSchedule = () => {
    if (!scheduledDate) {
      setError(VALIDATION_CONSTRAINTS.SCHEDULE.DATE.REQUIRED_MESSAGE);
      return;
    }
    
    // Validate that the scheduled date is in the future
    const selectedDate = new Date(scheduledDate);
    const now = new Date();
    
    if (selectedDate <= now) {
      setError(VALIDATION_CONSTRAINTS.SCHEDULE.DATE.FUTURE_REQUIRED_MESSAGE);
      return;
    }
    
    setError('');
    // Convert to ISO 8601 format with timezone
    const isoDateTime = selectedDate.toISOString();
    scheduleMutation.mutate(isoDateTime);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {canSchedule && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Schedule Campaign
          </button>
        )}

        {canSend && (
          <button
            onClick={() => setShowSendModal(true)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
          >
            Send Now
          </button>
        )}

        {canEdit && (
          <button
            onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Edit Campaign
          </button>
        )}

        {canDelete && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 font-medium"
          >
            Delete Campaign
          </button>
        )}
      </div>

      {/* Send Confirmation Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Send Campaign?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This will start sending the campaign to all recipients. This
              action cannot be undone.
            </p>
            
            {sendMutation.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {sendMutation.error instanceof Error
                    ? sendMutation.error.message
                    : 'Failed to send campaign'}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  sendMutation.reset();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => sendMutation.mutate()}
                disabled={sendMutation.isPending}
                className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:bg-green-400"
              >
                {sendMutation.isPending ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Schedule Campaign
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose when to send this campaign
            </p>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-6"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setScheduledDate('');
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={scheduleMutation.isPending}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Campaign?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{campaign.name}"? This action
              cannot be undone.
            </p>
            
            {deleteMutation.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {deleteMutation.error instanceof Error
                    ? deleteMutation.error.message
                    : 'Failed to delete campaign'}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  deleteMutation.reset();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-400"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
