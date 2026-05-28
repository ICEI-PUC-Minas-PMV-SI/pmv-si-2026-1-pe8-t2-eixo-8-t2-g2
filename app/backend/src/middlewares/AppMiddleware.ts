import type { IMiddleware } from '../interfaces/IMiddleware';
import express, { type Application } from 'express';

class AppMiddleware implements IMiddleware {
  priority = 0;
  register(app: Application) {
    app.use(express.json());
  }
}

const instance = new AppMiddleware();
export { instance as AppMiddleware };
export default instance;
