import type { Application } from 'express';
// import * as routes from '@routes/index';
import { AuthRoute } from './routes/AuthRoute.js';
import { ProductCategoryRoute } from './routes/ProductCategoryRoute.js';
import { ProductCharacteristicRoute } from './routes/ProductCharacteristicRoute.js';
import { ProductRoute } from './routes/ProductRoute.js';
import { SchedulerRoute } from './routes/SchedulerRoute.js';
import { UserRoute } from './routes/UserRoute.js';
import { DashboardRoute } from './routes/DashboardRoute.js';
import { CustomerRoute } from './routes/CustomerRoute.js';
import { AppSettingsRoute } from './routes/AppSettingsRoute.js';
import { IntegrationsRoute } from './routes/IntegrationsRoute.js';
import { AboutRoute } from './routes/AboutRoute.js';
import { Router as RouterExpress } from 'express';
import { CatalogRoute } from './routes/CatalogRoute.js';
class Router {
  register(app: Application) {
    const router = RouterExpress();
    AuthRoute.register(router);
    ProductCategoryRoute.register(router);
    CatalogRoute.register(router);
    ProductCharacteristicRoute.register(router);
    ProductRoute.register(router);
    SchedulerRoute.register(router);
    UserRoute.register(router);
    DashboardRoute.register(router);
    CustomerRoute.register(router);
    AppSettingsRoute.register(router);
    IntegrationsRoute.register(router);
    AboutRoute.register(router);
    app.use('/', router);
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
