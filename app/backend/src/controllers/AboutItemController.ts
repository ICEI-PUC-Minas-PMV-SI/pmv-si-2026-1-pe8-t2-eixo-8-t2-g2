import type { AboutItemCreatePayload } from '@types';
import { AboutItemService } from '../services/AboutItemService';
import { UserRole } from '../validations/UserValidation';

class AboutItemController {
  async create(product: AboutItemCreatePayload) {
    const result = await AboutItemService.create(product);
    return result;
  }

  async find(id: string) {
    return AboutItemService.find(id);
  }

  async list() {
    return AboutItemService.list();
  }
  async update(id: string, data: Partial<AboutItemCreatePayload>) {
    return AboutItemService.update(id, data);
  }
  async deleteMany(ids: string[]) {
    return AboutItemService.deleteMany(ids);
  }
}

const instance = new AboutItemController();
export { instance as AboutItemController };
