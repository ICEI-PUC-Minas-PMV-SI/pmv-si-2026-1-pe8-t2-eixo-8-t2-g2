import { type Router } from 'express';
import { AppSettingsController } from '../controllers/AppSettingsController.js';

class AppSettingsRoute {
  register(router: Router) {
    router.get('/app-settings', async (_req, res) => {
      const data = await AppSettingsController.find();
      res.json(data);
    });
    router.post('/app-settings', async (req, res) => {
      const data = await AppSettingsController.save(req.body);
      res.json(data);
    });
  }
}

const instance = new AppSettingsRoute();
export { instance as AppSettingsRoute };
export default instance;
