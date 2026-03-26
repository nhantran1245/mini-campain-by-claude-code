import { Request, Response, NextFunction } from 'express';
import { campaignService } from '../services/campaignService';
import { CampaignStatus } from '../models/Campaign';

/**
 * Create a new campaign
 * POST /api/campaigns
 */
export const createCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, subject, body, scheduled_at, recipient_ids } = req.body;

    const campaign = await campaignService.createCampaign({
      name,
      subject,
      body,
      scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
      created_by: userId,
      recipient_ids,
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all campaigns for the authenticated user
 * GET /api/campaigns
 */
export const listCampaigns = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { status, limit, offset } = req.query;

    const result = await campaignService.listCampaigns({
      created_by: userId,
      status: status as CampaignStatus | undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result.campaigns,
      pagination: {
        total: result.total,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single campaign by ID
 * GET /api/campaigns/:id
 */
export const getCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);

    const campaign = await campaignService.getCampaignById(campaignId, userId);
    const stats = await campaignService.getCampaignStats(campaignId, userId);

    res.status(200).json({
      success: true,
      data: {
        ...campaign.toJSON(),
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a campaign
 * PATCH /api/campaigns/:id
 */
export const updateCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);
    const updates = req.body;

    // Convert scheduled_at string to Date if provided
    if (updates.scheduled_at) {
      updates.scheduled_at = new Date(updates.scheduled_at);
    }

    const campaign = await campaignService.updateCampaign(
      campaignId,
      userId,
      updates
    );

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a campaign
 * DELETE /api/campaigns/:id
 */
export const deleteCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);

    await campaignService.deleteCampaign(campaignId, userId);

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule a campaign for future sending
 * POST /api/campaigns/:id/schedule
 */
export const scheduleCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);
    const { scheduled_at } = req.body;

    const campaign = await campaignService.scheduleCampaign(
      campaignId,
      userId,
      new Date(scheduled_at)
    );

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a campaign immediately
 * POST /api/campaigns/:id/send
 */
export const sendCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);

    const campaign = await campaignService.sendCampaign(campaignId, userId);

    res.status(200).json({
      success: true,
      data: campaign,
      message: 'Campaign sending initiated',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get campaign statistics
 * GET /api/campaigns/:id/stats
 */
export const getCampaignStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);

    const stats = await campaignService.getCampaignStats(campaignId, userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get campaign recipients
 * GET /api/campaigns/:id/recipients
 */
export const getCampaignRecipients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);
    const { limit, offset } = req.query;

    const result = await campaignService.getCampaignRecipients({
      userId,
      campaignId,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result.recipients,
      pagination: {
        total: result.total,
        limit: Number(limit) || 50,
        offset: Number(offset) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
