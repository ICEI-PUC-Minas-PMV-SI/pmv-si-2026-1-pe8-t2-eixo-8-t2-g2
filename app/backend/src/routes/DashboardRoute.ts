import type { Application } from 'express';
import { UserScopeMiddleware } from 'middlewares/UserScopeMiddleware';
import DashboardService from 'services/DashboardService';

class DashboardRoute {
  register(app: Application) {
    app.get('/dashboard-today', UserScopeMiddleware.adminOnly(), async (_req, res) => {
      const data = await DashboardService.overviewToday();
      res.json({ data });
    });

    app.get(
      '/dashboard-latest-months',
      UserScopeMiddleware.adminOnly(),
      async (_req, res) => {
        const data = await DashboardService.latestMonths();
        res.json({ data });
      },
    );

    app.get(
      '/dashboard-latest-months-billing',
      UserScopeMiddleware.adminOnly(),
      async (_req, res) => {
        const data = await DashboardService.latestMonthsBilling();
        res.json({ data });
      },
    );
  }
}

const instance = new DashboardRoute();
export { instance as DashboardRoute };
