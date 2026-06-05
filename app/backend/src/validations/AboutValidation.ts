import z from 'zod';
import type { Response, NextFunction, GenericRequest } from '../@types/index.js';
import { ErrorValidation } from './ErrorValidation.js';

class AboutValidation {
  create = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      const jsonStringArray = z.preprocess(
        (value) => {
          if (typeof value === 'string') {
            try {
              return JSON.parse(value);
            } catch {
              return value;
            }
          }

          return value;
        },
        z.array(
          z.object({
            aboutId: z.string().optional(),
            text: z.string(),
            orderIndex: z.number(),
          }),
        ),
      );

      try {
        const schema = {
          title: z.string().max(80).optional(),
          subtitle: z.string().max(80).optional(),
          main: z.string().max(500).optional(),
          complementary: z.string().max(500).optional(),
          items: jsonStringArray.optional(),
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
        const schema = {
          title: z.optional(z.string().min(5).max(20)),
          subtitle: z.optional(z.string().min(5).max(80)),
          main: z.optional(z.string().min(5).max(500)),
          complementary: z.optional(z.string().min(5).max(500)),
          items: z
            .array(
              z.object({
                id: z.string(),
                orderIndex: z.number(),
                text: z.string(),
              }),
            )
            .optional(),
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
