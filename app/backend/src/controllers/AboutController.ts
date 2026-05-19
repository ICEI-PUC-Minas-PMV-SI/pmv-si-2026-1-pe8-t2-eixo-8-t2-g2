import type { AboutCreatePayload} from '@types';
import { AboutService } from '../services/AboutService';
import { UserRole } from '../validations/UserValidation';

class AboutController {
  async create(product: AboutCreatePayload) {
    const result = await AboutService.create(product);
    return result;
  }

  async find(id: string) {
    return AboutService.find(id);
  }

  async findOne() {
    return AboutService.findOne();
  }
  async update(id: string, data: Partial<AboutCreatePayload>) {
    return AboutService.update(id, data);
  }
  async deleteMany(ids: string[]) {
    return AboutService.deleteMany(ids);
  }
}

const instance = new AboutController();
export { instance as AboutController };
