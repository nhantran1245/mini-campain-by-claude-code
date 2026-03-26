import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Validation middleware factory - validates request data against Zod schema
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body, query, and params against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into readable messages (just the message, no field prefix)
        const messages = error.errors.map((err) => err.message);
        
        // Use the first error message as the main message
        const mainMessage = messages[0] || 'Validation failed';
        const details = messages.length > 1 ? messages.slice(1).join(', ') : undefined;
        
        next(new ValidationError(
          mainMessage,
          details
        ));
      } else {
        next(error);
      }
    }
  };
};
