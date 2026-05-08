import type { Application } from 'express';
// import * as middlewares from '@middlewares/';
import { AppMiddleware } from './middlewares/AppMiddleware';
import { AuthMiddleware } from './middlewares/AuthMiddleware';

class MiddlewareManager {
  register(app: Application) {
    AppMiddleware.register(app);
    AuthMiddleware.register(app);
  }
  // async register(app: Application) {
  //   const { ...allMiddlewares } = middlewares;
  //   Object.values(allMiddlewares)
  //     .sort((a: any, b: any) => {
  //       const priorityA = a?.priority ?? 0;
  //       const priorityB = b?.priority ?? 0;
  //       const invalidA = priorityA === undefined || priorityA === null;
  //       const invalidB = priorityB === undefined || priorityB === null;
  //       let result = 0;

  //       if (invalidA && invalidB) return 0;
  //       if (!invalidA && !invalidB) {
  //         if (priorityA === priorityB) return 0;
  //         if (priorityA < priorityB) return -1;
  //         return 1;
  //       }
  //       if (invalidA) return 1;
  //       if (invalidB) return -1;
  //       return result;
  //     })
  //     .forEach((middleware) => {
  //       if ('register' in middleware) {
  //         middleware.register(app);
  //       }
  //     });
  // }
}

const instance = new MiddlewareManager();
export { instance as MiddlewareManager };
