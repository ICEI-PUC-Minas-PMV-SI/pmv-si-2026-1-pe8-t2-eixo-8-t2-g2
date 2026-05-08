import type { Application } from '@types';

export interface IMiddleware {
  register(app: Application): void;
}
