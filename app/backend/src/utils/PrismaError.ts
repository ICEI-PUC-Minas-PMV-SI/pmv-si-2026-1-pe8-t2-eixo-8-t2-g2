import { HttpCode } from '../utils/HttpCode';

class PrismaError {
  get(code: string, data?: any) {
    switch (code) {
      case 'P2025':
        return {
          responseStatus: HttpCode.NOT_FOUND,
          message: `${data?.resource ? data.resource : 'Resource'} not found`,
        };
      default:
        return null;
    }
  }
}

const instance = new PrismaError();
export { instance as PrismaError };
export default instance;
