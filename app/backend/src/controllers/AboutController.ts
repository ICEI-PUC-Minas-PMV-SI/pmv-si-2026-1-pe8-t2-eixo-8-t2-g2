import type { AboutCreatePayload } from '../@types';
import { AboutService } from '../services/AboutService';

class AboutController {
  async create(data: AboutCreatePayload) {
    const record = await this.findOne();
    if (record && record.id) {
      return this.update(record.id, data);
    }
    return AboutService.create(data);
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
