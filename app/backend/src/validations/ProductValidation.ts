import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '../@types/index.js';
import { ErrorValidation } from './ErrorValidation.js';

class ProductValidation {
  create = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          name: z.string().min(3).max(255),
          description: z.optional(z.string().min(5).max(1024)),
          price: z.optional(z.number().min(0)),
          estimatedMinPrice: z.optional(z.number().min(0)),
          estimatedMaxPrice: z.optional(z.number().min(0)),
          bookingLeadTimeMinutes: z.optional(z.number().int().min(0)),
          bookingLeadDays: z.optional(z.number().int().min(0)),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
  update = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          name: z.string().min(3).max(255),
          description: z.optional(z.string().min(5).max(1024)),
          price: z.optional(z.number().min(0)),
          estimatedMinPrice: z.optional(z.number().min(0)),
          estimatedMaxPrice: z.optional(z.number().min(0)),
          bookingLeadTimeMinutes: z.optional(z.number().int().min(0)),
          bookingLeadDays: z.optional(z.number().int().min(0)),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new ProductValidation();
export { instance as ProductValidation };
