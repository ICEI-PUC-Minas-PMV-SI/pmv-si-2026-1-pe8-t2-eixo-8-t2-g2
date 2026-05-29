import { type Router } from 'express';
import { ProductValidation } from '../validations/ProductValidation.js';
import type { GenericRequest, Response } from '../@types/index.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';
import { ProductCategoryController } from '../controllers/ProductCategoryController.js';

class ProductCategoryRoute {
  register(router: Router) {
    router.post(
      '/product-category',
      UserScopeMiddleware.adminOnly(),
      ProductValidation.create(),
      async (req, res) => {
        const result = await ProductCategoryController.create(req.body);
        res.status(201).json(result);
      },
    );

    router.get('/product-category', async (req: GenericRequest, res: Response) => {
      const result = await ProductCategoryController.list(req.pagination);
      res.json(result);
    });

    router.post('/product-category-list', async (req: GenericRequest, res: Response) => {
      const result = await ProductCategoryController.list(req.pagination);
      res.json(result);
    });

    router.get('/product-category/:id', async (req: GenericRequest, res: Response) => {
      const id = req.params.id as string;
      const result = await ProductCategoryController.find(id);
      res.json(result);
    });

    router.patch(
      '/product-category/:id',
      UserScopeMiddleware.adminOnly(),
      ProductValidation.update(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await ProductCategoryController.update(id, req.body);

        res.json(result);
      },
    );

    router.delete(
      '/product-category/:id',
      UserScopeMiddleware.adminOnly(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        await ProductCategoryController.delete(id);
        res.status(204).send();
      },
    );

    router.post('/product-category/reorder', async (req, res) => {
      const { categories } = req.body; // ← era 'category'
      const result = await ProductCategoryController.reorder(categories);
      res.json(result);
    });
  }
}

const instance = new ProductCategoryRoute();
export { instance as ProductCategoryRoute };
export default instance;
