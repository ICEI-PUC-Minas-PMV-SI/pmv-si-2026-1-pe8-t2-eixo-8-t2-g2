import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '../@types/index.js';
import { ErrorValidation } from './ErrorValidation.js';
import { AppError } from '../error/AppError.js';
import { HttpCode } from '../utils/HttpCode.js';
import { UserRole } from './UserValidation.js';

class SchedulerValidation {
  create = (req: GenericRequest, res: Response, next: NextFunction) => {
    try {
      const productSchema = {
        productId: z.uuid(),
        customization: z.string().optional(),
        quantity: z.number().positive().int(),
      };

      const schema = {
        customerId: z.optional(z.uuid()),
        customerName: z.optional(z.string()),
        customerPhone: z.string().optional(),
        scheduledAt: z.string(),
        scheduledTo: z.string().optional(),
        paymentMethod: z.enum([
          'credit_card',
          'debit_card',
          'bank_transfer',
          'pix',
          'cash',
        ]),
        deliveryType: z.enum(['delivery', 'pickup']),
        items: z.array(z.object(productSchema)),
      };
      z.object(schema).parse(req.body);
      const { items = [], customerId, customerName } = req.body;
      if (!customerId && !customerName && req.user?.role !== UserRole.CUSTOMER) {
        throw new AppError('Cliente deve ser selecionado', HttpCode.BAD_REQUEST);
      }
      if (items.length === 0) {
        throw new AppError(
          'Ao menos um produto deve ser selecionado',
          HttpCode.BAD_REQUEST,
        );
      }
      next();
    } catch (err) {
      ErrorValidation.handleZodError(err, res);
    }
  };
}

const instance = new SchedulerValidation();
export { instance as SchedulerValidation };
