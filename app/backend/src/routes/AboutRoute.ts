import { AboutController } from '../controllers/AboutController.js';
import { type Router } from 'express';
import { AboutValidation } from '../validations/AboutValidation.js';
import type { Response, AboutRequest } from '../@types/index.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';

class AboutRoute {
  register(router: Router) {
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
  }
}

const instance = new AboutRoute();
export { instance as AboutRoute };
export default instance;
