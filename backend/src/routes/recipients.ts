import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createRecipientSchema,
  listRecipientsSchema,
  getRecipientSchema,
} from '../validators/recipientValidators';
import {
  createRecipient,
  listRecipients,
  getRecipient,
} from '../controllers/recipientController';

const router = Router();

// All recipient routes require authentication
router.use(authenticate);

// Recipient CRUD operations
router.post('/', validate(createRecipientSchema), createRecipient);
router.get('/', validate(listRecipientsSchema), listRecipients);
router.get('/:id', validate(getRecipientSchema), getRecipient);

export default router;
