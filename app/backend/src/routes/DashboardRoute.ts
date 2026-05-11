import type { Application } from 'express';
import DashboardService from 'services/DashboardService';

class DashboardRoute {
  register(app: Application) {
    app.get('/dashboard', async (_req, res) => {
      const data = await DashboardService.overviewToday();
      res.json({ data });
    });
  }
}

const instance = new DashboardRoute();
export { instance as DashboardRoute };
