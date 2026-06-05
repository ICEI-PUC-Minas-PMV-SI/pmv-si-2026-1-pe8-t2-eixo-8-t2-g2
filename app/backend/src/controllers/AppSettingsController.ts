import { AppSettingsService } from '../services/AppSettingsService.js';
import type { Prisma } from '../generated/prisma';
// import type { AppSettingsCreateInput } from '../generated/prisma/models.js';

class AppSettingsController {
  async find() {
    return AppSettingsService.find();
  }
  async save(data: Prisma.AppSettingsCreateInput) {
    return AppSettingsService.save(data);
  }
}

const instance = new AppSettingsController();
export { instance as AppSettingsController };
