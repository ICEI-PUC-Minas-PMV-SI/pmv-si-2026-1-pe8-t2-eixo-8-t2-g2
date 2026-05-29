import type { ListPublicParams } from '../@types/catalog.js';
import { CatalogService } from '../services/CatalogService.js';

class CatalogController {
  async listPublic({ category, search }: ListPublicParams) {
    return CatalogService.listPublic({ category, search });
  }

  async findPublic(id: string) {
    return CatalogService.findPublic(id);
  }

  async listCategories() {
    return CatalogService.listActiveCategories();
  }
}

const instance = new CatalogController();
export { instance as CatalogController };
export default instance;
