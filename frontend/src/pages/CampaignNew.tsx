import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/api/campaigns';
import { recipientsApi } from '@/api/recipients';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { VALIDATION_CONSTRAINTS } from '@/types/validation';
import type { AxiosError } from 'axios';

const campaignSchema = z.object({
  name: z.string()
    .min(VALIDATION_CONSTRAINTS.CAMPAIGN.NAME.MIN_LENGTH, VALIDATION_CONSTRAINTS.CAMPAIGN.NAME.REQUIRED_MESSAGE)
    .max(VALIDATION_CONSTRAINTS.CAMPAIGN.NAME.MAX_LENGTH, VALIDATION_CONSTRAINTS.CAMPAIGN.NAME.MAX_LENGTH_MESSAGE)
    .trim(),
  subject: z.string()
    .min(VALIDATION_CONSTRAINTS.CAMPAIGN.SUBJECT.MIN_LENGTH, VALIDATION_CONSTRAINTS.CAMPAIGN.SUBJECT.REQUIRED_MESSAGE)
    .max(VALIDATION_CONSTRAINTS.CAMPAIGN.SUBJECT.MAX_LENGTH, VALIDATION_CONSTRAINTS.CAMPAIGN.SUBJECT.MAX_LENGTH_MESSAGE)
    .trim(),
  body: z.string()
    .min(VALIDATION_CONSTRAINTS.CAMPAIGN.BODY.MIN_LENGTH, VALIDATION_CONSTRAINTS.CAMPAIGN.BODY.MIN_LENGTH_MESSAGE)
    .trim(),
  recipient_ids: z
    .array(z.number())
    .min(VALIDATION_CONSTRAINTS.CAMPAIGN.RECIPIENTS.MIN_COUNT, VALIDATION_CONSTRAINTS.CAMPAIGN.RECIPIENTS.REQUIRED_MESSAGE),
});

type CampaignForm = z.infer<typeof campaignSchema>;

export default function CampaignNew() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(
    new Set()
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      recipient_ids: [],
    },
  });

  // Fetch recipients
  const { data: recipientsData, isLoading: isLoadingRecipients } = useQuery({
    queryKey: ['recipients', 'all'],
    queryFn: () => recipientsApi.list({ limit: 100 }),
  });

  const recipients = recipientsData?.data || [];

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: campaignsApi.create,
    onSuccess: (data) => {
      navigate(`/campaigns/${data.id}`);
    },
    onError: (err: AxiosError<{ error: { message: string } }>) => {
      setError(
        err.response?.data?.error?.message || 'Failed to create campaign'
      );
    },
  });

  const toggleRecipient = (id: number) => {
    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecipients(newSelected);
    setValue('recipient_ids', Array.from(newSelected));
  };

  const selectAll = () => {
    const allIds = new Set(recipients.map((r) => r.id));
    setSelectedRecipients(allIds);
    setValue('recipient_ids', Array.from(allIds));
  };

  const deselectAll = () => {
    setSelectedRecipients(new Set());
    setValue('recipient_ids', []);
  };

  const onSubmit = (data: CampaignForm) => {
    setError('');
    createMutation.mutate(data);
  };

  if (isLoadingRecipients) return <LoadingSpinner />;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500">
          <a href="/campaigns" className="hover:text-gray-700">Campaigns</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">New Campaign</span>
        </nav>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create New Campaign
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill in the details below to create a new email campaign
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Campaign Name */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Campaign Details
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Campaign Name *
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Summer Sale 2024"
                maxLength={VALIDATION_CONSTRAINTS.CAMPAIGN.NAME.MAX_LENGTH}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Subject *
              </label>
              <input
                id="subject"
                type="text"
                {...register('subject')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Get 50% Off This Summer!"
                maxLength={VALIDATION_CONSTRAINTS.CAMPAIGN.SUBJECT.MAX_LENGTH}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Body *
              </label>
              <textarea
                id="body"
                rows={6}
                {...register('body')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.body ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Write your email content here..."
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.body.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recipients Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Select Recipients *
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Select All
              </button>
              <span className="text-gray-400">|</span>
              <button
                type="button"
                onClick={deselectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>

          {recipients.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8 border border-gray-200 rounded-md bg-gray-50">
              <p className="font-medium">No recipients available</p>
              <p className="text-xs mt-1">Please create recipients first before creating a campaign.</p>
            </div>
          ) : (
            <div className={`max-h-64 overflow-y-auto border rounded-md ${
              errors.recipient_ids ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}>
              {recipients.map((recipient) => (
                <label
                  key={recipient.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedRecipients.has(recipient.id)}
                    onChange={() => toggleRecipient(recipient.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {recipient.name}
                    </p>
                    <p className="text-xs text-gray-500">{recipient.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className={`mt-3 flex items-center justify-between ${
            errors.recipient_ids ? 'text-red-600' : 'text-gray-600'
          }`}>
            <p className="text-sm font-medium">
              {selectedRecipients.size} recipient(s) selected
            </p>
            {selectedRecipients.size > 0 && (
              <p className="text-xs text-gray-500">
                Campaign will be sent to {selectedRecipients.size} {selectedRecipients.size === 1 ? 'person' : 'people'}
              </p>
            )}
          </div>
          {errors.recipient_ids && (
            <p className="mt-1 text-sm text-red-600 font-medium">
              {errors.recipient_ids.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
