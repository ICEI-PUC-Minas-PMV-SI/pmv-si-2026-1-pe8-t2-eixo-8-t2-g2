import { Prisma as PrismaDB } from '../db/Prisma.js';
import type { Prisma } from '../generated/prisma';
// import type { AppSettingsCreateInput } from '../generated/prisma/models.js';

class AppSettingsService {
  async save(data: Prisma.AppSettingsCreateInput) {
    const prisma = await PrismaDB.getClient();
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
    const prisma = await PrismaDB.getClient();
    const siteInformation = await prisma.appSettings.findFirst();
    return siteInformation;
  }
}

const instance = new AppSettingsService();
export { instance as AppSettingsService };
