import type { Application } from '../@types/index.js';

export interface IMiddleware {
  register(app: Application): void;
}
