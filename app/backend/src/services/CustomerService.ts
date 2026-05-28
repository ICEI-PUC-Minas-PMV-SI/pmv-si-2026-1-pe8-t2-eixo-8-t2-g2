import { Prisma } from '../db/Prisma';

class CustomerService {
  async find(phone: string) {
    const prisma = await Prisma.getClient();
    const customer = await prisma.customer.findFirst({
      where: { phone },
      select: { id: true, name: true },
    });
    return customer;
  }
  async findByUserId(userId: string) {
    const prisma = await Prisma.getClient();
    const customer = await prisma.customer.findFirst({
      where: { userId },
      select: { id: true, name: true },
    });
    return customer;
  }
}

const instance = new CustomerService();
export { instance as CustomerService };
