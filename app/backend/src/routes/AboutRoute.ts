import { AboutController } from '../controllers/AboutController';
import { Router, type Application } from 'express';
import { AboutValidation } from '../validations/AboutValidation';
import type { Response, AboutRequest } from '../@types';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware';

class AboutRoute {
  register(app: Application) {
    const router = Router();

    router.post(
      '/about',
      UserScopeMiddleware.adminOnly(),
      AboutValidation.create,
      async (req, res) => {
        const result = await AboutController.create(req.body);
        res.json(result);
      },
    );

    router.get('/about', async (_req: AboutRequest, res: Response) => {
      const result = await AboutController.findOne();
      res.json(result);
    });

    router.get('/about/:id', async (req: AboutRequest, res: Response) => {
      const id = req.params.id as string;
      const result = await AboutController.find(id);
      res.json(result);
    });

    router.patch(
      '/about/:id',
      UserScopeMiddleware.adminOnly(),
      async (req: AboutRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await AboutController.update(id, req.body);
        res.json(result);
      },
    );

    app.use(router);
  }
}

const instance = new AboutRoute();
export { instance as AboutRoute };
export default instance;
