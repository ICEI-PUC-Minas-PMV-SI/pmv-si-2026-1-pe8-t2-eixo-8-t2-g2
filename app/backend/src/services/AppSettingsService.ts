import { Prisma } from '../db/Prisma.js';
import type { AppSettingsCreateInput } from '../generated/prisma/models.js';

class AppSettingsService {
  async save(data: AppSettingsCreateInput) {
    const prisma = await Prisma.getClient();
    const siteInformation = await prisma.appSettings.findFirst();
    if (siteInformation) {
      await prisma.appSettings.update({
        where: { id: siteInformation.id },
        data,
      });
    } else {
      await prisma.appSettings.create({
        data,
      });
    }
  }
  async find() {
    const prisma = await Prisma.getClient();
    const siteInformation = await prisma.appSettings.findFirst();
    return siteInformation;
  }
}

const instance = new AppSettingsService();
export { instance as AppSettingsService };
