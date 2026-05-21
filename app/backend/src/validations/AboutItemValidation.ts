import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '@types';
import { ErrorValidation } from './ErrorValidation';

class AboutItemValidation {
  create = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          icon: z.optional(z.string().min(0).max(20)),
          text: z.optional(z.string().min(5).max(50)),
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
          icon: z.optional(z.string().min(0).max(20)),
          text: z.optional(z.string().min(5).max(50)),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new AboutItemValidation();
export { instance as AboutItemValidation };
