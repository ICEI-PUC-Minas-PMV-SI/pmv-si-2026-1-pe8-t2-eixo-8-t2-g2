import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '@types';
import { ErrorValidation } from './ErrorValidation';

class CharacteristicValidation {
  create = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          name: z.string().min(3).max(255),
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
        };
        z.object(schema).parse(req.body);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new CharacteristicValidation();
export { instance as CharacteristicValidation };
