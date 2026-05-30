import type { Router } from 'express';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';
import DashboardService from '../services/DashboardService.js';

class DashboardRoute {
  register(router: Router) {
    router.get('/dashboard-today', UserScopeMiddleware.adminOnly(), async (_req, res) => {
      const data = await DashboardService.overviewToday();
      res.json({ data });
    });

    router.get(
      '/dashboard-latest-months',
      UserScopeMiddleware.adminOnly(),
      async (_req, res) => {
        const data = await DashboardService.latestMonths();
        res.json({ data });
      },
    );

    router.get(
      '/dashboard-latest-months-revenue',
      UserScopeMiddleware.adminOnly(),
      async (_req, res) => {
        const data = await DashboardService.latestMonthsRevenue();
        res.json({ data });
      },
    );

    router.get(
      '/dashboard-top-products',
      UserScopeMiddleware.adminOnly(),
      async (_req, res) => {
        const data = await DashboardService.topProducts();
        res.json({ data });
      },
    );

    router.get(
      '/dashboard-alerts',
      UserScopeMiddleware.adminOnly(),
      async (_req, res) => {
        const data = await DashboardService.dashboardAlerts();
        res.json({ data });
      },
    );

    router.get(
      '/dashboard-booking-lead-time',
      UserScopeMiddleware.adminOnly(),
      async (_req, res) => {
        const data = await DashboardService.bookingLeadTime();
        res.json({ data });
      },
    );

    router.get(
      '/dashboard-deliveries-today',
      UserScopeMiddleware.adminOnly(),
      async (_req, res) => {
        const data = await DashboardService.deliveriesToday();
        res.json({ data });
      },
    );
  }
}

const instance = new DashboardRoute();
export { instance as DashboardRoute };
