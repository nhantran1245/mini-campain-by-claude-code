import { Request, Response, NextFunction } from 'express';
import Recipient from '../models/Recipient';
import { ConflictError } from '../utils/errors';
import { Op } from 'sequelize';

/**
 * Create a new recipient
 * POST /api/recipients
 */
export const createRecipient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, name } = req.body;

    // Check if recipient with this email already exists
    const existingRecipient = await Recipient.findOne({ where: { email } });
    if (existingRecipient) {
      throw new ConflictError('Recipient with this email already exists');
    }

    const recipient = await Recipient.create({
      email,
      name,
    });

    res.status(201).json({
      success: true,
      data: recipient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all recipients with pagination and optional search
 * GET /api/recipients
 */
export const listRecipients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit, offset, search } = req.query;

    const where: any = {};

    // Add search filter if provided
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Recipient.findAndCountAll({
      where,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single recipient by ID
 * GET /api/recipients/:id
 */
export const getRecipient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipientId = Number(req.params.id);

    const recipient = await Recipient.findByPk(recipientId);

    if (!recipient) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Recipient not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: recipient,
    });
  } catch (error) {
    next(error);
  }
};
