import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/api/campaigns';
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
});

type CampaignForm = z.infer<typeof campaignSchema>;

export default function CampaignEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id || '0', 10);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
  });

  // Fetch campaign data
  const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsApi.getById(campaignId),
  });

  // Set form values when campaign loads
  useEffect(() => {
    if (campaign) {
      reset({
        name: campaign.name,
        subject: campaign.subject,
        body: campaign.body,
      });
    }
  }, [campaign, reset]);

  // Update campaign mutation
  const updateMutation = useMutation({
    mutationFn: (data: CampaignForm) =>
      campaignsApi.update(campaignId, data),
    onSuccess: () => {
      navigate(`/campaigns/${campaignId}`);
    },
    onError: (err: AxiosError<{ error: { message: string } }>) => {
      setError(
        err.response?.data?.error?.message || 'Failed to update campaign'
      );
    },
  });

  const onSubmit = (data: CampaignForm) => {
    setError('');
    updateMutation.mutate(data);
  };

  if (isLoadingCampaign) return <LoadingSpinner />;

  if (!campaign) {
    return (
      <ErrorMessage
        message="Campaign not found"
        onRetry={() => navigate('/campaigns')}
      />
    );
  }

  // Check if campaign can be edited
  if (campaign.status !== 'draft') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <nav className="text-sm text-gray-500">
            <Link to="/campaigns" className="hover:text-gray-700">Campaigns</Link>
            <span className="mx-2">/</span>
            <Link to={`/campaigns/${campaignId}`} className="hover:text-gray-700">{campaign.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Edit</span>
          </nav>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            Campaign Cannot Be Edited
          </h2>
          <p className="text-sm text-yellow-700 mb-4">
            Only campaigns in "draft" status can be edited. This campaign is currently in "{campaign.status}" status.
          </p>
          <button
            onClick={() => navigate(`/campaigns/${campaignId}`)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium"
          >
            Back to Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500">
          <Link to="/campaigns" className="hover:text-gray-700">Campaigns</Link>
          <span className="mx-2">/</span>
          <Link to={`/campaigns/${campaignId}`} className="hover:text-gray-700">{campaign.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Edit</span>
        </nav>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Campaign
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your campaign details
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Campaign Details */}
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

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/campaigns/${campaignId}`)}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
