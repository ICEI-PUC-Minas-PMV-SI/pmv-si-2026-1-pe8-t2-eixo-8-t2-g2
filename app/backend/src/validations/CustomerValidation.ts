import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '../@types';
import { ErrorValidation } from './ErrorValidation';

class CustomerValidation {
  getCustomer = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      try {
        const schema = {
          phone: z.string().max(30),
        };
        z.object(schema).parse(req.query);
        next();
      } catch (err) {
        ErrorValidation.handleZodError(err, res);
      }
    };
  };
}

const instance = new CustomerValidation();
export { instance as CustomerValidation };
