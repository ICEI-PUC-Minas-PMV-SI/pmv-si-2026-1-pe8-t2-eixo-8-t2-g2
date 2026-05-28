import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '@types';
import { ErrorValidation } from './ErrorValidation';
import { AppError } from '../error/AppError';
import { HttpCode } from '../utils/HttpCode';

class SchedulerValidation {
  create = (req: GenericRequest, res: Response, next: NextFunction) => {
    try {
      const productSchema = {
        id: z.uuid(),
        quantity: z.number().positive().int(),
      };

      const schema = {
        customerId: z.uuid(),
        scheduledAt: z.string(),
        paymentMethod: z.enum(['credit_card', 'bank_transfer', 'pix', 'cash']),
        deliveryType: z.enum(['delivery', 'pickup']),
        products: z.array(z.object(productSchema)),
      };
      z.object(schema).parse(req.body);
      const { products = [] } = req.body;
      if (products.length === 0) {
        throw new AppError('At least one product must be provided', HttpCode.BAD_REQUEST);
      }
      next();
    } catch (err) {
      ErrorValidation.handleZodError(err, res);
    }
  };
}

const instance = new SchedulerValidation();
export { instance as SchedulerValidation };
