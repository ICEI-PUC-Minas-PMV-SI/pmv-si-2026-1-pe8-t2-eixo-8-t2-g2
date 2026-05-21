import { AboutItemController } from '../controllers/AboutItemController';
import { Router, type Application } from 'express';
import { AboutItemValidation } from '../validations/AboutItemValidation';
import type { Response, AboutItemRequest } from '@types';
import { AppError } from '../error/AppError';

class AboutItemRoute {
  register(app: Application) {
    const router = Router();

    router.post('/aboutItem', AboutItemValidation.create, async (req, res) => {
      const result = await AboutItemController.create(req.body);
      res.json(result);
    });

    router.get('/aboutItems', async (req: AboutItemRequest, res: Response) => {
      const result = await AboutItemController.list();
      res.json(result);
    });

    router.get('/aboutItem/:id', async (req: AboutItemRequest, res: Response) => {
      const id = req.params.id as string;
      const result = await AboutItemController.find(id);
      res.json(result);
    });

    router.patch('/aboutItem/:id', async (req: AboutItemRequest, res: Response) => {
      const id = req.params.id as string;
      const result = await AboutItemController.update(id, req.body);
      res.json(result);
    });

    // router.delete('/aboutItem/:id', async (req: AboutItemRequest, res: Response) => {
    //   const id = req.params.id as string;
    //   await AboutItemController.delete(id);
    //   res.status(204).send();
    // });

    app.use(router);
  }
}

const instance = new AboutItemRoute();
export { instance as AboutItemRoute };
export default instance;
