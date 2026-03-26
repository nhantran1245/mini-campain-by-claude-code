import Campaign, { CampaignStatus } from '../models/Campaign';
import Recipient from '../models/Recipient';
import CampaignRecipient from '../models/CampaignRecipient';
import {
  NotFoundError,
  AuthorizationError,
  BusinessRuleError,
} from '../utils/errors';
import { emailService } from './emailService';

export interface CreateCampaignInput {
  name: string;
  subject: string;
  body: string;
  scheduled_at?: Date;
  created_by: number;
  recipient_ids?: number[];
}

export interface UpdateCampaignInput {
  name?: string;
  subject?: string;
  body?: string;
  status?: CampaignStatus;
  scheduled_at?: Date;
}

export interface ListCampaignsFilters {
  created_by: number;
  status?: CampaignStatus;
  limit?: number;
  offset?: number;
}

/**
 * Campaign Service - handles business logic for campaign operations
 */
export class CampaignService {
  /**
   * Create a new campaign
   */
  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    const campaign = await Campaign.create({
      name: input.name,
      subject: input.subject,
      body: input.body,
      status: 'draft',
      scheduled_at: input.scheduled_at || null,
      created_by: input.created_by,
    });

    // Add recipients if provided
    if (input.recipient_ids && input.recipient_ids.length > 0) {
      await this.addRecipientsToCampaign(campaign.id, input.recipient_ids);
    }

    // Reload to get associations
    await campaign.reload({
      include: [{ model: Recipient, as: 'recipients' }],
    });

    return campaign;
  }

  /**
   * Get all campaigns for a user with optional filters
   */
  async listCampaigns(filters: ListCampaignsFilters): Promise<{
    campaigns: Campaign[];
    total: number;
  }> {
    const where: any = { created_by: filters.created_by };

    if (filters.status) {
      where.status = filters.status;
    }

    const { count, rows } = await Campaign.findAndCountAll({
      where,
      include: [{ model: Recipient, as: 'recipients' }],
      limit: filters.limit || 20,
      offset: filters.offset || 0,
      order: [['created_at', 'DESC']],
    });

    return {
      campaigns: rows,
      total: count,
    };
  }

  /**
   * Get a single campaign by ID
   * @throws NotFoundError if campaign doesn't exist
   * @throws AuthorizationError if user doesn't own the campaign
   */
  async getCampaignById(
    campaignId: number,
    userId: number
  ): Promise<Campaign> {
    const campaign = await Campaign.findByPk(campaignId, {
      include: [{ model: Recipient, as: 'recipients' }],
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    if (campaign.created_by !== userId) {
      throw new AuthorizationError('You do not have access to this campaign');
    }

    return campaign;
  }

  /**
   * Update a campaign
   * @throws NotFoundError if campaign doesn't exist
   * @throws AuthorizationError if user doesn't own the campaign
   * @throws BusinessRuleError if campaign status doesn't allow updates
   */
  async updateCampaign(
    campaignId: number,
    userId: number,
    updates: UpdateCampaignInput
  ): Promise<Campaign> {
    const campaign = await this.getCampaignById(campaignId, userId);

    // Business Rule: Only draft campaigns can be edited
    if (campaign.status !== 'draft') {
      throw new BusinessRuleError(
        'Only campaigns in draft status can be updated'
      );
    }

    // Apply updates
    await campaign.update(updates);

    // Reload to get fresh data
    await campaign.reload({
      include: [{ model: Recipient, as: 'recipients' }],
    });

    return campaign;
  }

  /**
   * Delete a campaign
   * @throws NotFoundError if campaign doesn't exist
   * @throws AuthorizationError if user doesn't own the campaign
   * @throws BusinessRuleError if campaign status doesn't allow deletion
   */
  async deleteCampaign(campaignId: number, userId: number): Promise<void> {
    const campaign = await this.getCampaignById(campaignId, userId);

    // Business Rule: Only draft campaigns can be deleted
    if (campaign.status !== 'draft') {
      throw new BusinessRuleError(
        'Only campaigns in draft status can be deleted'
      );
    }

    await campaign.destroy();
  }

  /**
   * Schedule a campaign for future sending
   * @throws NotFoundError if campaign doesn't exist
   * @throws AuthorizationError if user doesn't own the campaign
   * @throws BusinessRuleError if campaign status doesn't allow scheduling
   */
  async scheduleCampaign(
    campaignId: number,
    userId: number,
    scheduledAt: Date
  ): Promise<Campaign> {
    const campaign = await this.getCampaignById(campaignId, userId);

    // Business Rule: Only draft campaigns can be scheduled
    if (campaign.status !== 'draft') {
      throw new BusinessRuleError(
        'Only campaigns in draft status can be scheduled'
      );
    }

    // Check if campaign has recipients
    const recipientCount = await CampaignRecipient.count({
      where: { campaign_id: campaignId },
    });

    if (recipientCount === 0) {
      throw new BusinessRuleError(
        'Campaign must have at least one recipient before scheduling'
      );
    }

    // Update status and scheduled_at
    await campaign.update({
      status: 'scheduled',
      scheduled_at: scheduledAt,
    });

    return campaign;
  }

  /**
   * Send a campaign immediately
   * @throws NotFoundError if campaign doesn't exist
   * @throws AuthorizationError if user doesn't own the campaign
   * @throws BusinessRuleError if campaign status doesn't allow sending
   */
  async sendCampaign(campaignId: number, userId: number): Promise<Campaign> {
    const campaign = await this.getCampaignById(campaignId, userId);

    // Business Rule: Only draft or scheduled campaigns can be sent
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new BusinessRuleError(
        'Only campaigns in draft or scheduled status can be sent'
      );
    }

    // Check if campaign has recipients
    const recipientCount = await CampaignRecipient.count({
      where: { campaign_id: campaignId },
    });

    if (recipientCount === 0) {
      throw new BusinessRuleError(
        'Campaign must have at least one recipient before sending'
      );
    }

    // Update status to sending
    await campaign.update({ status: 'sending' });

    // Start async email sending process
    await emailService.startCampaignSending(campaignId);

    return campaign;
  }

  /**
   * Add recipients to a campaign
   * @throws BusinessRuleError if any recipient ID doesn't exist
   */
  async addRecipientsToCampaign(
    campaignId: number,
    recipientIds: number[]
  ): Promise<void> {
    // Verify all recipient IDs exist
    const existingRecipients = await Recipient.findAll({
      where: { id: recipientIds },
      attributes: ['id'],
    });

    if (existingRecipients.length !== recipientIds.length) {
      throw new BusinessRuleError('One or more recipient IDs do not exist');
    }

    // Create campaign-recipient associations
    const associations = recipientIds.map((recipientId) => ({
      campaign_id: campaignId,
      recipient_id: recipientId,
      status: 'pending' as const,
    }));

    await CampaignRecipient.bulkCreate(associations, {
      ignoreDuplicates: true, // Skip if association already exists
    });
  }

  /**
   * Get campaign statistics
   * @throws NotFoundError if campaign doesn't exist
   * @throws AuthorizationError if user doesn't own the campaign
   */
  async getCampaignStats(
    campaignId: number,
    userId: number
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
    opened: number;
    send_rate: number;
    open_rate: number;
  }> {
    // Verify ownership
    await this.getCampaignById(campaignId, userId);

    // Get recipient stats
    const recipients = await CampaignRecipient.findAll({
      where: { campaign_id: campaignId },
    });

    const total = recipients.length;
    const sent = recipients.filter((r: any) => r.status === 'sent').length;
    const failed = recipients.filter((r: any) => r.status === 'failed').length;
    const opened = recipients.filter((r: any) => r.opened_at !== null).length;

    const send_rate = total > 0 ? (sent / total) * 100 : 0;
    const open_rate = sent > 0 ? (opened / sent) * 100 : 0;

    return {
      total,
      sent,
      failed,
      opened,
      send_rate: Math.round(send_rate * 100) / 100, // 2 decimal places
      open_rate: Math.round(open_rate * 100) / 100,
    };
  }

  /**
   * Get campaign recipients with pagination
   * @throws NotFoundError if campaign doesn't exist
   * @throws AuthorizationError if user doesn't own the campaign
   */
  async getCampaignRecipients(params: {
    userId: number;
    campaignId: number;
    limit?: number;
    offset?: number;
  }): Promise<{ recipients: any[]; total: number }> {
    const { userId, campaignId, limit = 50, offset = 0 } = params;

    // Verify ownership
    await this.getCampaignById(campaignId, userId);

    // Get total count
    const total = await CampaignRecipient.count({
      where: { campaign_id: campaignId },
    });

    // Get recipients with pagination
    const campaignRecipients = await CampaignRecipient.findAll({
      where: { campaign_id: campaignId },
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'email', 'name'],
        },
      ],
      limit,
      offset,
      order: [['created_at', 'ASC']],
    });

    // Transform to match expected format
    const recipients = campaignRecipients.map((cr: any) => ({
      id: cr.recipient.id,
      email: cr.recipient.email,
      name: cr.recipient.name,
      status: cr.status,
      sent_at: cr.sent_at,
      opened_at: cr.opened_at,
    }));

    return { recipients, total };
  }
}

export const campaignService = new CampaignService();
