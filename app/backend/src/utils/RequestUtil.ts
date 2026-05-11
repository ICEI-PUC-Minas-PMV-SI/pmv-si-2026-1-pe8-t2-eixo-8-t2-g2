import rateLimit from 'express-rate-limit';
import ms from 'ms';
import type { GenericRequest } from '@types';
import { JWT } from '../utils/JWT';

class RequestUtil {
  getToken(req: GenericRequest): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
  getTokenData(req: GenericRequest) {
    const token = this.getToken(req);
    if (!token) {
      return null;
    }
    const data = JWT.validate(token) || null;
    return data;
  }
  rateLimit({
    windowMs = ms('1m'),
    max = 5,
    message = 'Muitas tentativas, tente novamente em 1 minuto',
  } = {}) {
    return rateLimit({
      windowMs: windowMs,
      max: max,
      message: message,
      standardHeaders: true,
      legacyHeaders: false,
    });
  }
  getPaginationParams(req: GenericRequest) {
    if (!req.body || !req.body.page || !req.body.pageSize) {
      return null;
    }
    const page = Number(req.body.page);
    const pageSize = Number(req.body.pageSize);
    const skip = (page - 1) * pageSize;

    return { skip, take: pageSize };
  }
  getRequestMetadata(req: GenericRequest) {
    const tokenData = this.getTokenData(req);
    const pagination = this.getPaginationParams(req);

    return {
      tokenData,
      pagination,
    };
  }
}

const instance = new RequestUtil();
export { instance as RequestUtil };
