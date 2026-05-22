import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '@types';
import { ErrorValidation } from './ErrorValidation';

class AboutItemValidation {
  create = (req: GenericRequest, res: Response, next: NextFunction) => {
    try {
      const schema = {
        text: z.optional(z.string().min(3).max(50)),
      };
      z.object(schema).parse(req.body);
      next();
    } catch (err) {
      ErrorValidation.handleZodError(err, res);
    }
  };
  update = (req: GenericRequest, res: Response, next: NextFunction) => {
    try {

      const schema = {
        text: z.optional(z.string().min(3).max(50)),
      };
      z.object(schema).parse(req.body);
      next();
    } catch (err) {
      ErrorValidation.handleZodError(err, res);
    }
  };
}

const instance = new AboutItemValidation();
export { instance as AboutItemValidation };
