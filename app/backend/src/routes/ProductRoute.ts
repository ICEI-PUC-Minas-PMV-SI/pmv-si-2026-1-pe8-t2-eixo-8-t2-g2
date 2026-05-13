import { Router, type Application } from 'express';
import { ProductValidation } from '../validations/ProductValidation';
import { ProductController } from '../controllers/ProductController';
import type { GenericRequest, ProductRequest, Response } from '@types';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware';

class ProductRoute {
  register(app: Application) {
    const router = Router();
    router.post(
      '/product',
      UserScopeMiddleware.adminOnly(),
      ProductValidation.create(),
      async (req, res) => {
        const result = await ProductController.create(req.body);
        res.status(201).json(result);
      },
    );

    router.get('/product', async (req: ProductRequest, res: Response) => {
      const result = await ProductController.list(req);
      res.json(result);
    });

    router.post('/product-list', async (req: ProductRequest, res: Response) => {
      const result = await ProductController.list(req);
      res.json(result);
    });

    router.get('/product/:id', async (req: GenericRequest, res: Response) => {
      const id = req.params.id as string;
      const result = await ProductController.find(id);
      res.json(result);
    });

    router.patch(
      '/product/:id',
      UserScopeMiddleware.adminOnly(),
      ProductValidation.update(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await ProductController.update(id, req.body);

        res.json(result);
      },
    );

    router.delete(
      '/product',
      UserScopeMiddleware.adminOnly(),
      async (req: GenericRequest, res: Response) => {
        const ids = req.body.data.ids as string[];
        await ProductController.deleteMany(ids);
        res.status(204).send();
      },
    );

    router.delete(
      '/product/:id',
      UserScopeMiddleware.adminOnly(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        await ProductController.delete(id);
        res.status(204).send();
      },
    );

    app.use(router);
  }
}

const instance = new ProductRoute();
export { instance as ProductRoute };
export default instance;
