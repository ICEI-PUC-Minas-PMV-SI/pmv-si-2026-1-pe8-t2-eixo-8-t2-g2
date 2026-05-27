import { Prisma } from '../db/Prisma';
import type { AboutCreatePayload } from '@types';
import DashboardService from './DashboardService';

class AboutService {
  async create(about: AboutCreatePayload) {
    const prisma = await Prisma.getClient();

    const {
      title = '',
      subtitle = '',
      complementary = '',
      main = '',
      items = [],
    } = about;

    const createdAbout = await prisma.aboutInfo.create({
      data: {
        title,
        subtitle,
        complementary,
        main,
        items: {
          create: items.map((item) => ({
            text: item.text,
            orderIndex: item.orderIndex ?? 0,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return createdAbout;
  }

  async find(id: string) {
    const prisma = await Prisma.getClient();

    const about = await prisma.aboutInfo.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    return about;
  }

  async findOne() {
    const prisma = await Prisma.getClient();

    const [about, topProducts] = await Promise.all([
      prisma.aboutInfo.findFirst({
        include: {
          items: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      }),
      DashboardService.topProducts(5),
    ]);

    return {
      ...about,
      topProducts: topProducts.map((prod) => ({
        id: prod.id,
        name: prod.name,
        price: prod.price,
      })),
    };
  }

  async deleteMany(ids: string[]) {
    const prisma = await Prisma.getClient();

    await prisma.aboutInfo.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async update(id: string, data: Partial<AboutCreatePayload>) {
    const prisma = await Prisma.getClient();

    const { items = [], ...aboutProps } = data;

    const currentItems = await prisma.aboutItem.findMany({
      where: {
        aboutId: id,
      },
    });

    const currentItemsIds = currentItems.map((item) => item.id);

    const incomingItemsIds = items
      .filter((item) => item.id)
      .map((item) => item.id as string);

    const itemsToCreate = items.filter((item) => !item.id);

    const itemsToUpdate = items.filter(
      (item) => item.id && currentItemsIds.includes(item.id),
    );

    const itemsToDelete = currentItems.filter(
      (item) => !incomingItemsIds.includes(item.id),
    );

    await prisma.aboutInfo.update({
      where: { id },
      data: {
        ...aboutProps,
      },
    });

    if (itemsToCreate.length) {
      await prisma.aboutItem.createMany({
        data: itemsToCreate.map((item) => ({
          text: item.text,
          orderIndex: item.orderIndex ?? 0,
          aboutId: id,
        })),
      });
    }

    await Promise.all(
      itemsToUpdate.map((item) =>
        prisma.aboutItem.update({
          where: {
            id: item.id!,
          },
          data: {
            text: item.text,
            orderIndex: item.orderIndex ?? 0,
          },
        }),
      ),
    );

    if (itemsToDelete.length) {
      await prisma.aboutItem.deleteMany({
        where: {
          id: {
            in: itemsToDelete.map((item) => item.id),
          },
        },
      });
    }

    const updatedAbout = await prisma.aboutInfo.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    return updatedAbout;
  }
}

const instance = new AboutService();

export { instance as AboutService };
