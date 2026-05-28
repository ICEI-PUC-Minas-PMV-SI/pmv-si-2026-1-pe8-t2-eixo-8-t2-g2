import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter_sqlite = new PrismaBetterSqlite3({ url: connectionString });
const adapter_pg = new PrismaPg({ connectionString });

const adapter = connectionString.startsWith('postgre') ? adapter_pg : adapter_sqlite;

// export const prisma = new PrismaClient({ adapter });
// import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
class Prisma {
  async getAdapter() {
    // if (connectionString.startsWith('postgre')) {
    //   const { PrismaPg } = await import('@prisma/adapter-pg');
    //   return new PrismaPg({ connectionString });
    // }
    // const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
    // return new PrismaBetterSqlite3({ url: connectionString });
  }
  async getClient() {
    // const adapter = await this.getAdapter();
    // const { PrismaClient } = await import('../generated/prisma/client');
    return globalForPrisma.prisma || new PrismaClient({ adapter });
  }
}

const instance = new Prisma();
export default instance;
export { instance as Prisma };
