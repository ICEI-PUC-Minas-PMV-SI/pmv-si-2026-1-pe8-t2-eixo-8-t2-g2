import { type Router } from 'express';
import { ProductValidation } from '../validations/ProductValidation.js';
import { ProductCharacteristicController } from '../controllers/ProductCharacteristicController.js';
import type { GenericRequest, Response } from '../@types/index.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';

class ProductCharacteristicRoute {
  register(router: Router) {
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
  }
}

const instance = new ProductCharacteristicRoute();
export { instance as ProductCharacteristicRoute };
export default instance;
