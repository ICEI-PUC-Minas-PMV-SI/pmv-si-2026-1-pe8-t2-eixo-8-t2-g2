import { Prisma } from '../db/Prisma';
import type { AboutCreatePayload } from '@types';
import { Text } from '../utils/Text';
import { ResponseUtil } from 'utils/ResponseUtil';
import type {
  AboutInfoOrderByWithRelationInput,
  AboutInfoWhereInput,
} from '../generated/prisma/models';

class AboutService {
  async create(about: AboutCreatePayload) {
    const prisma = await Prisma.getClient();
    const { items = [], ...aboutProps } = about;
    const itemsToCreate = items.length
      ? {
          create: items.map((id) => ({ itemId: id })),
        }
      : {};
    const createdAbout = await prisma.aboutInfo.create({
      data: {
        ...aboutProps,
        item: itemsToCreate,
      },
    });

    return createdAbout;
  }

  async find(id: string) {
    const prisma = await Prisma.getClient();
    const about = await prisma.aboutInfo.findUnique({
      where: { id },
    });
    return about;
  }

  async findOne() {
    const prisma = await Prisma.getClient();
    const about = await prisma.aboutInfo.findFirst();
    return about;
  }

  async deleteMany(ids: string[]) {
    const prisma = await Prisma.getClient();
    await prisma.aboutInfo.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async update(id: string, data: Partial<AboutCreatePayload>) {
    const prisma = await Prisma.getClient();
    const { items, ...aboutProps } = data;
    const dataToUpdate = { ...aboutProps };
    const updatedAbout = await prisma.aboutInfo.update({
      where: { id },
      data: dataToUpdate,
    });
    return updatedAbout;
  }
}

const instance = new AboutService();
export { instance as AboutService };
