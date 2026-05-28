import { Router, type Application } from 'express';
import { AppSettingsController } from '../controllers/AppSettingsController';

class AppSettingsRoute {
  register(app: Application) {
    const router = Router();

    router.get('/app-settings', async (_req, res) => {
      const data = await AppSettingsController.find();
      res.json(data);
    });
    router.post('/app-settings', async (req, res) => {
      const data = await AppSettingsController.save(req.body);
      res.json(data);
    });

    app.use(router);
  }
}

const instance = new AppSettingsRoute();
export { instance as AppSettingsRoute };
export default instance;
