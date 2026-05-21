import { AppSettingsService } from '../services/AppSettingsService';
import type { AppSettingsCreateInput } from '../generated/prisma/models';

class AppSettingsController {
  async find() {
    return AppSettingsService.find();
  }
  async save(data: AppSettingsCreateInput) {
    return AppSettingsService.save(data);
  }
}

const instance = new AppSettingsController();
export { instance as AppSettingsController };
