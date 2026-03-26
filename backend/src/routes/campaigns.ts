import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createCampaignSchema,
  updateCampaignSchema,
  getCampaignSchema,
  deleteCampaignSchema,
  listCampaignsSchema,
  scheduleCampaignSchema,
  sendCampaignSchema,
  getCampaignStatsSchema,
  getCampaignRecipientsSchema,
} from '../validators/campaignValidators';
import {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  scheduleCampaign,
  sendCampaign,
  getCampaignStats,
  getCampaignRecipients,
} from '../controllers/campaignController';

const router = Router();

// All campaign routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', validate(createCampaignSchema), createCampaign);
router.get('/', validate(listCampaignsSchema), listCampaigns);
router.get('/:id', validate(getCampaignSchema), getCampaign);
router.patch('/:id', validate(updateCampaignSchema), updateCampaign);
router.delete('/:id', validate(deleteCampaignSchema), deleteCampaign);

// Campaign operations
router.post('/:id/schedule', validate(scheduleCampaignSchema), scheduleCampaign);
router.post('/:id/send', validate(sendCampaignSchema), sendCampaign);
router.get('/:id/stats', validate(getCampaignStatsSchema), getCampaignStats);
router.get('/:id/recipients', validate(getCampaignRecipientsSchema), getCampaignRecipients);

export default router;
