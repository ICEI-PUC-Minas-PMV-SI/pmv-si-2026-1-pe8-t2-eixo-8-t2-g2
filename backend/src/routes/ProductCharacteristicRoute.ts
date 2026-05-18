import { Router, type Application } from 'express';
import { ProductValidation } from '../validations/ProductValidation';
import { ProductCharacteristicController } from '../controllers/ProductCharacteristicController';
import type { GenericRequest, Response } from '@types';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware';

class ProductCharacteristicRoute {
  register(app: Application) {
    const router = Router();
    router.post(
      '/product-characteristic',
      UserScopeMiddleware.adminOnly(),
      ProductValidation.create(),
      async (req, res) => {
        const result = await ProductCharacteristicController.create(req.body);
        res.status(201).json(result);
      },
    );

    router.get('/product-characteristic', async (req: GenericRequest, res: Response) => {
      const result = await ProductCharacteristicController.list(req.pagination);
      res.json(result);
    });

    router.post(
      '/product-characteristic-list',
      async (req: GenericRequest, res: Response) => {
        const result = await ProductCharacteristicController.list(req.pagination);
        res.json(result);
      },
    );

    router.get(
      '/product-characteristic/:id',
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await ProductCharacteristicController.find(id);
        res.json(result);
      },
    );

    router.patch(
      '/product-characteristic/:id',
      UserScopeMiddleware.adminOnly(),
      ProductValidation.update(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await ProductCharacteristicController.update(id, req.body);

        res.json(result);
      },
    );

    router.delete(
      '/product-characteristic/:id',
      UserScopeMiddleware.adminOnly(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        await ProductCharacteristicController.delete(id);
        res.status(204).send();
      },
    );

    app.use(router);
  }
}

const instance = new ProductCharacteristicRoute();
export { instance as ProductCharacteristicRoute };
export default instance;
