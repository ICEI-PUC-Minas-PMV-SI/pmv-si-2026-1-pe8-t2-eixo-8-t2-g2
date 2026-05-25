import { Router, type Application } from 'express';
import { CatalogController } from 'controllers/CatalogController';
import type { Response } from '@types';
import type { Request } from 'express';

class CatalogRoute {
  register(app: Application) {
    const router = Router();

    // GET /catalog — lista pública de produtos ativos (sem autenticação)
    router.get('/catalog', async (req: Request, res: Response) => {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const result = await CatalogController.listPublic({ category, search });
      res.json(result);
    });

    // GET /catalog/:id — detalhe público de um produto (sem autenticação)
    router.get('/catalog/:id', async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await CatalogController.findPublic(id);
      res.json(result);
    });

    // GET /catalog/categories — categorias ativas para filtro do catálogo
    router.get('/catalog-categories', async (_req: Request, res: Response) => {
      const result = await CatalogController.listCategories();
      res.json(result);
    });

    app.use(router);
  }
}

const instance = new CatalogRoute();
export { instance as CatalogRoute };
export default instance;