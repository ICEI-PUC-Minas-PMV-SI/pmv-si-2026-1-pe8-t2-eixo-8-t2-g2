import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '@types';
import { ErrorValidation } from './ErrorValidation';

class AboutValidation {
  create = (req: GenericRequest, res: Response, next: NextFunction) => {
    try {

      const schema = {
        title: z.optional(z.string().min(5).max(20)),
        subtitle: z.optional(z.string().min(5).max(80)),
        main: z.optional(z.string().min(5).max(500)),
        complementary: z.optional(z.string().min(5).max(500)),
      };
      z.object(schema).parse(req.body);
      next();
    } catch (err) {
      ErrorValidation.handleZodError(err, res);
    }
  };
  update = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {

        const schema = {
          title: z.optional(z.string().min(5).max(20)),
          subtitle: z.optional(z.string().min(5).max(80)),
          main: z.optional(z.string().min(5).max(500)),
          complementary: z.optional(z.string().min(5).max(500)),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new AboutValidation();
export { instance as AboutValidation };
