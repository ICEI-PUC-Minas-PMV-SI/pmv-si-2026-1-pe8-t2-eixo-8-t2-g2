import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '../@types';
import { ErrorValidation } from './ErrorValidation';

class AuthValidation {
  auth = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          email: z.email(),
          password: z.string(),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
  enableTwoFactor = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          otp: z.string().min(6).max(6),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
  disableTwoFactor = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          code: z.string().min(6).max(8),
          isRecoveryCode: z.boolean(),
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
  resetPassword = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          password: z.string().max(255),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
  validate2FA = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          email: z.string().max(255),
          code: z.string().min(6).max(8),
          isRecoveryCode: z.boolean(),
          operation: z.enum(['RESET_PASSWORD', 'AUTH']),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
  regenerateRecoveryCodes = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          code: z.string().min(6).max(8),
          isRecoveryCode: z.boolean(),
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new AuthValidation();
export { instance as AuthValidation };
