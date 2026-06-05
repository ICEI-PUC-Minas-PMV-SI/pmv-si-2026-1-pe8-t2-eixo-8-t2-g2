import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '../@types/index.js';
import { ErrorValidation } from './ErrorValidation.js';
import { AppError } from '../error/AppError.js';
import { HttpCode } from '../utils/HttpCode.js';
import { UserRole } from './UserValidation.js';
import {
  PaymentMethod,
  PaymentType,
  SchedulerStatus,
} from '../generated/prisma/client.js';

class SchedulerValidation {
  create = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
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
  };
  updateStatus = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          id: z.uuid(),
          status: z.enum(SchedulerStatus),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
  createPayment = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          schedulerId: z.string(),
          amount: z.number(),
          paymentMethod: z.enum(PaymentMethod),
          type: z.enum(PaymentType),
          note: z.string().optional(),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new SchedulerValidation();
export { instance as SchedulerValidation };
