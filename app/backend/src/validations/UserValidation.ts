import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '@types';
import { ErrorValidation } from './ErrorValidation';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

const passwordValidation = z
  .string()
  .min(6, { error: 'Password must contain at least 6 characters.' })
  .max(255, { error: 'Password cannot exceed 255 characters.' })
  .regex(/^(?=.*[a-z])(?=.*\d).+$/g, {
    error: 'Password requires 1 lowercase letter and 1 digit.',
  });

class UserValidation {
  create = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          email: z.email(),
          name: z.string().min(5).max(255),
          role: z.enum(UserRole),
          password: passwordValidation,
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };

  forgotPassword = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          email: z.email(),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
  validateOTP = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          email: z.email(),
          otp: z.string(),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
  resetPassword = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          newPassword: passwordValidation,
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new UserValidation();
export { instance as UserValidation };
