import { ResponseUtil } from 'utils/ResponseUtil';
import { Prisma } from '../db/Prisma';
import type { ProductCharacteristicCreatePayload, PaginationParams } from '@types';

class ProductCharacteristicService {
  async create(characteristic: ProductCharacteristicCreatePayload) {
    const prisma = await Prisma.getClient();
    const createdCharacteristic = await prisma.characteristic.create({
      data: characteristic,
    });

    return createdCharacteristic;
  }

  async find(id: string) {
    const prisma = await Prisma.getClient();
    const characteristic = await prisma.characteristic.findUnique({
      where: { id },
    });
    return characteristic;
  }

  async list(pagination?: PaginationParams | null) {
    const prisma = await Prisma.getClient();
    const pageParams = pagination || {};
    const [characteristics, total] = await Promise.all([
      prisma.characteristic.findMany({ ...pageParams }),
      prisma.characteristic.count(),
    ]);
    return {
      data: characteristics,
      total,
      ...ResponseUtil.handlePageParams(pageParams, total),
    };
  }

  async delete(id: string) {
    const prisma = await Prisma.getClient();
    await prisma.characteristic.delete({
      where: { id },
    });
  }

  async update(id: string, data: Partial<ProductCharacteristicCreatePayload>) {
    const prisma = await Prisma.getClient();
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
