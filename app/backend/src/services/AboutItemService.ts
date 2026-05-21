import { Prisma } from '../db/Prisma';
import type { AboutItemCreatePayload } from '@types';
import { Text } from '../utils/Text';
import { ResponseUtil } from 'utils/ResponseUtil';

class AboutItemService {
  async create(aboutItem: AboutItemCreatePayload) {
    const prisma = await Prisma.getClient();
    const createdAboutItem = await prisma.aboutItem.create({
      data: aboutItem,
    });

    return createdAboutItem;
  }

  async find(id: string) {
    const prisma = await Prisma.getClient();
    const aboutItem = await prisma.aboutItem.findUnique({
      where: { id },
    });
    return aboutItem;
  }

  async list() {
    const prisma = await Prisma.getClient();
    const aboutItem = await prisma.aboutItem.findMany();
    return aboutItem;
  }

  async deleteMany(ids: string[]) {
    const prisma = await Prisma.getClient();
    await prisma.aboutItem.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async update(id: string, data: Partial<AboutItemCreatePayload>) {
    const prisma = await Prisma.getClient();
    const { ...aboutItemProps } = data;
    const dataToUpdate = { ...aboutItemProps };
    const updatedAboutItem = await prisma.aboutItem.update({
      where: { id },
      data: dataToUpdate,
    });
    return updatedAboutItem;
  }
}

const instance = new AboutItemService();
export { instance as AboutItemService };
