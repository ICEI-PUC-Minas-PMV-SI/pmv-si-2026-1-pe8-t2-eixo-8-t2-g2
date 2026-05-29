import { type Router } from 'express';
import { CatalogController } from '../controllers/CatalogController.js';
import type { Response } from '../@types/index.js';
import type { Request } from 'express';
import { TypeCheck } from '../utils/TypeCheck.js';

class CatalogRoute {
  register(router: Router) {
    // GET /catalog — lista pública de produtos ativos (sem autenticação)
    router.get('/catalog', async (req: Request, res: Response) => {
      const { category, search } = req.query;
      const result = await CatalogController.listPublic({
        category: TypeCheck.isString(category) ? category : '',
        search: TypeCheck.isString(search) ? search : '',
      });
      res.json(result);
    });
    router.post('/catalog', async (req: Request, res: Response) => {
      const {
        filters: { category },
        search,
      } = req.body;
      const result = await CatalogController.listPublic({
        category: TypeCheck.isString(category) ? category : '',
        search: TypeCheck.isString(search) ? search : '',
      });
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
    router.post('/catalog-categories', async (_req: Request, res: Response) => {
      const result = await CatalogController.listCategories();
      res.json(result);
    });
  }
}

const instance = new CatalogRoute();
export { instance as CatalogRoute };
export default instance;
