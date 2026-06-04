import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '../@types/index.js';
import { ErrorValidation } from './ErrorValidation.js';

class ProductCategoryValidation {
  create = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          name: z.string().min(3).max(255),
          isActive: z.boolean(),
          orderIndex: z.number(),
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
          isActive: z.boolean(),
          orderIndex: z.number(),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new ProductCategoryValidation();
export { instance as ProductCategoryValidation };
