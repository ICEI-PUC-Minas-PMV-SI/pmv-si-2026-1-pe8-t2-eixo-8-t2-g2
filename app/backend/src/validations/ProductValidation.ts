import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '../@types/index.js';
import { ErrorValidation } from './ErrorValidation.js';

class ProductValidation {
  create = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const jsonStringArray = z.preprocess((value) => {
          if (typeof value === 'string') {
            try {
              return JSON.parse(value);
            } catch {
              return value;
            }
          }

          return value;
        }, z.array(z.uuid()));
        const schema = {
          id: z.string().optional(),
          name: z.string().min(3).max(255),
          slug: z.string().min(3).max(255),
          description: z.string().max(255).optional(),
          price: z.coerce.number().min(0),
          bookingLeadMinutes: z.coerce.number().int().min(0),
          isActive: z.coerce.boolean(),
          categories: jsonStringArray.optional(),
          characteristics: jsonStringArray.optional(),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        console.log(err);
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
  update = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const jsonStringArray = z.preprocess((value) => {
          if (typeof value === 'string') {
            try {
              return JSON.parse(value);
            } catch {
              return value;
            }
          }

          return value;
        }, z.array(z.uuid()));
        const schema = {
          id: z.uuid(),
          name: z.string().min(3).max(255),
          description: z.optional(z.string().min(5).max(1024)),
          price: z.coerce.number().min(0),
          bookingLeadMinutes: z.coerce.number().int().min(0),
          isActive: z.coerce.boolean(),
          categories: jsonStringArray.optional(),
          characteristics: jsonStringArray.optional(),
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
