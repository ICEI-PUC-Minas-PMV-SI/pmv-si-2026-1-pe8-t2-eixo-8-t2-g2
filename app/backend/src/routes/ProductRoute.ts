import { type Router } from 'express';
import { ProductValidation } from '../validations/ProductValidation.js';
import { ProductController } from '../controllers/ProductController.js';
import type { GenericRequest, ProductRequest, Response } from '../@types/index.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
});

class ProductRoute {
  register(router: Router) {
    router.post(
      '/product',
      UserScopeMiddleware.adminOnly(),
      ProductValidation.create(),
      upload.single('file'),
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
        const result = await ProductController.deleteMany(ids);
        res.status(200).send(result);
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
  }
}

const instance = new ProductRoute();
export { instance as ProductRoute };
export default instance;
