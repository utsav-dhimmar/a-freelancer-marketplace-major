import { type NextFunction, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { HTTP_STATUS } from '../constants/index.js';
import { ApiError } from '../utils/ApiHelper.js';

/**
 * Validation middleware using Zod
 * @param schema Zod schema to validate against
 */
export const validate =
  (schema: any) =>
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.body);
        next();
      } catch (error: any) {
        if (error instanceof ZodError) {
          const errors = (error as any).issues?.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })) || [];

          next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation Failed', errors));
        } else {
          next(error);
        }
      }
    };
