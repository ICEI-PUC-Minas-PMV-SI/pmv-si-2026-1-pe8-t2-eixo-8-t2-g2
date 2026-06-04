import { type Router } from 'express';
import type { GenericRequest, Response } from '../@types/index.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';
import { ProductCategoryController } from '../controllers/ProductCategoryController.js';
import { ProductCategoryValidation } from '../validations/ProductCategoryValidation.js';
import type { ProductCategoryRequest } from '../@types/product-category.js';

class ProductCategoryRoute {
  register(router: Router) {
    router.post(
      '/product-category',
      UserScopeMiddleware.adminOnly(),
      ProductCategoryValidation.create(),
      async (req, res) => {
        const result = await ProductCategoryController.create(req.body);
        res.status(201).json(result);
      },
    );

    router.get(
      '/product-category',
      async (req: ProductCategoryRequest, res: Response) => {
        const result = await ProductCategoryController.list(req);
        res.json(result);
      },
    );

    router.post(
      '/product-category-list',
      async (req: ProductCategoryRequest, res: Response) => {
        const result = await ProductCategoryController.list(req);
        res.json(result);
      },
    );

    router.patch(
      '/product-category/:id/toggle-active',
      async (req: ProductCategoryRequest, res: Response) => {
        const id = req.params.id as string;
        const { isActive } = req.body;
        const result = await ProductCategoryController.toggleActive(id, isActive);
        res.json(result);
      },
    );

    router.get('/product-category/:id', async (req: GenericRequest, res: Response) => {
      const id = req.params.id as string;
      const result = await ProductCategoryController.find(id);
      res.json(result);
    });

    router.patch(
      '/product-category/:id',
      UserScopeMiddleware.adminOnly(),
      ProductCategoryValidation.update(),
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
