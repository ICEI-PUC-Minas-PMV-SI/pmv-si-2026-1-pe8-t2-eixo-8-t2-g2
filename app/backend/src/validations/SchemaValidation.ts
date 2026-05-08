import z from 'zod';

class SchemaValidation {
  patchSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
    return schema.partial().refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    });
  }
}

const instance = new SchemaValidation();
export default instance;
