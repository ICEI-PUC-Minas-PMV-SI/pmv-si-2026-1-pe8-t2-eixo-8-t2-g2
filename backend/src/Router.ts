import type { Application } from 'express';
// import * as routes from '@routes/index';
import { AuthRoute } from './routes/AuthRoute';
import { ProductCategoryRoute } from './routes/ProductCategoryRoute';
import { ProductCharacteristicRoute } from './routes/ProductCharacteristicRoute';
import { DebugRoute } from './routes/DebugRoute';
import { ProductRoute } from './routes/ProductRoute';
import { SMTPRoute } from './routes/SMTPRoute';
import { SchedulerRoute } from './routes/SchedulerRoute';
import { UserRoute } from './routes/UserRoute';
import { DashboardRoute } from 'routes/DashboardRoute';
class Router {
  register(app: Application) {
    AuthRoute.register(app);
    ProductCategoryRoute.register(app);
    ProductCharacteristicRoute.register(app);
    DebugRoute.register(app);
    ProductRoute.register(app);
    SMTPRoute.register(app);
    SchedulerRoute.register(app);
    UserRoute.register(app);
    DashboardRoute.register(app);
    // const { ...allRoutes } = routes;
    // Object.values(allRoutes).forEach((route) => {
    //   if ('register' in route) {
    //     route.register(app);
    //   }
    // });
  }
}

const instance = new Router();
export { instance as Router };
export default instance;
