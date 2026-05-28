import type { Application } from 'express';
// import * as routes from '@routes/index';
import { AuthRoute } from './routes/AuthRoute';
import { CatalogRoute } from './routes/CatalogRoute';
import { ProductCategoryRoute } from './routes/ProductCategoryRoute';
import { ProductCharacteristicRoute } from './routes/ProductCharacteristicRoute';
import { ProductRoute } from './routes/ProductRoute';
import { SchedulerRoute } from './routes/SchedulerRoute';
import { UserRoute } from './routes/UserRoute';
import { DashboardRoute } from './routes/DashboardRoute';
import { CustomerRoute } from './routes/CustomerRoute';
import { AppSettingsRoute } from './routes/AppSettingsRoute';
import { IntegrationsRoute } from './routes/IntegrationsRoute';
import { AboutRoute } from './routes/AboutRoute';

class Router {
  register(app: Application) {
    AuthRoute.register(app);
    CatalogRoute.register(app);
    ProductCategoryRoute.register(app);
    ProductCharacteristicRoute.register(app);
    ProductRoute.register(app);
    SchedulerRoute.register(app);
    UserRoute.register(app);
    DashboardRoute.register(app);
    CustomerRoute.register(app);
    AppSettingsRoute.register(app);
    IntegrationsRoute.register(app);
    AboutRoute.register(app);
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
