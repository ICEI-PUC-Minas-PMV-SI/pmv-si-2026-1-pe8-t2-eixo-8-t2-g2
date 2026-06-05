import { ResponseUtil } from '../utils/ResponseUtil.js';
import { Prisma as PrismaDB } from '../db/Prisma.js';
import type { Prisma } from '../generated/prisma';
import type {
  ProductCharacteristicCreatePayload,
  PaginationParams,
} from '../@types/index.js';
// import type {
//   CharacteristicOrderByWithRelationInput,
//   CharacteristicWhereInput,
// } from '../generated/prisma/models.js';

class ProductCharacteristicService {
  async create(characteristic: ProductCharacteristicCreatePayload) {
    const prisma = await PrismaDB.getClient();
    const createdCharacteristic = await prisma.characteristic.create({
      data: characteristic,
    });

    return createdCharacteristic;
  }

  async find(id: string) {
    const prisma = await PrismaDB.getClient();
    const characteristic = await prisma.characteristic.findUnique({
      where: { id },
    });
    return characteristic;
  }

  async list(
    filter?: Prisma.CharacteristicWhereInput,
    orderBy?: Prisma.CharacteristicOrderByWithRelationInput[],
    pagination?: PaginationParams,
  ) {
    const prisma = await PrismaDB.getClient();
    const pageParams = pagination || {};
    const where = filter ? filter : {};
    const [characteristics, total] = await Promise.all([
      prisma.characteristic.findMany({
        ...pageParams,
        where,
        orderBy: orderBy && orderBy.length > 0 ? orderBy : { name: 'asc' },
      }),
      prisma.characteristic.count(),
    ]);
    return {
      data: characteristics,
      total,
      ...ResponseUtil.handlePageParams(pageParams, total),
    };
  }

  async delete(id: string) {
    const prisma = await PrismaDB.getClient();
    await prisma.characteristic.delete({
      where: { id },
    });
  }

  async update(id: string, data: Partial<ProductCharacteristicCreatePayload>) {
    const prisma = await PrismaDB.getClient();
    const dataToUpdate: Partial<ProductCharacteristicCreatePayload> = { ...data };
    const updatedCharacteristic = await prisma.characteristic.update({
      where: { id },
      data: dataToUpdate,
    });
    return updatedCharacteristic;
  }
}

const instance = new ProductCharacteristicService();
export { instance as ProductCharacteristicService };
