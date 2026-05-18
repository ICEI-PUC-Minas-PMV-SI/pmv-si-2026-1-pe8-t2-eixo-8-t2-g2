import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '@types';
import { ErrorValidation } from './ErrorValidation';

class DebugValidation {
  sendMail = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          template: z.enum(['otp']),
          email: z.email(),
          value: z.optional(
            z.object({
              otp: z.optional(z.string()),
            }),
          ),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new DebugValidation();
export { instance as DebugValidation };
