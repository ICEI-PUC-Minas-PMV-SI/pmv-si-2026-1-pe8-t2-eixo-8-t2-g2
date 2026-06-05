import { AppError } from '../error/AppError.js';
import type {
  Response,
  NextFunction,
  Application,
  GenericRequest,
} from '../@types/index.js';
import { HttpCode } from '../utils/HttpCode.js';
import { JWT } from '../utils/JWT.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';
import z from 'zod';
import { RequestUtil } from '../utils/RequestUtil.js';

class AuthMiddleware {
  priority = 1;
  isPublicRoute(req: GenericRequest) {
    const publicRoutes = [
      '/auth',
      '/auth/google',
      '/auth/validate-2fa',
      '/product',
      '/product/:id',
      '/debug/gmail/oauth2callback',
      '/debug/generate-auth-url',
      '/user/forgot-password',
      '/user/forgot-password/validate-otp',
      '/google-calendar/webhook',
      '/gmail/webhook',
      '/google/webhook',
      '/dashboard',
      '/product-list',
      '/product-category-list',
      '/footerInfo',
      '/review/featured',
    ];
    const publicRoutesByMethod: Record<string, string[]> = {
      POST: ['/user'],
      GET: ['/about'],
    };
    const methodPublicRoutes = publicRoutesByMethod[req.method] || [];
    const cleanedPath = req.path.replace(/\/$/, '');
    const [basePath, uuid = ''] = cleanedPath.split('/').slice(1);
    const { success: hasUUID } = z.safeParse(
      z.object({
        uuid: z.uuid(),
      }),
      { uuid },
    );
    if (methodPublicRoutes.includes(cleanedPath)) {
      return true;
    }
    return publicRoutes.some((publicRoute) => {
      const isEqualSimpleRoute = publicRoute === cleanedPath;
      const isEqualDynamicRoute =
        publicRoute.includes(':id') &&
        hasUUID &&
        publicRoute.replace('/:id', '') === `/${basePath}`;

      return isEqualSimpleRoute || isEqualDynamicRoute;
    });
  }
  setFiltersAndPagination(req: GenericRequest) {
    const paginationParams = RequestUtil.getPaginationParams(req);
    if (paginationParams) {
      req.pagination = paginationParams;
    }
    if (req.body) {
      if (req.body.sort) {
        req.sort = req.body.sort;
      }
      if (req.body.filters) {
        req.filters = req.body.filters;
      }
      if (req.body.search) {
        req.search = req.body.search;
      }
    }
  }
  async register(app: Application) {
    app.use((req: GenericRequest, res: Response, next: NextFunction) => {
      if (this.isPublicRoute(req)) {
        this.setFiltersAndPagination(req);
        if (req.headers.authorization) {
          const authHeader = req.headers.authorization;
          const token = authHeader.split(' ')[1];
          if (token) {
            const decoded = JWT.validate(token);
            if (decoded) {
              req.user = decoded.user;
              if (decoded.operation) {
                req.operation = decoded.operation;
              }
            }
          }
        }
        next();
        return;
      }
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return ResponseUtil.handleError(
          res,
          new AppError('Authorization header not provided', HttpCode.UNAUTHORIZED),
        );
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return ResponseUtil.handleError(
          res,
          new AppError('Token not provided or expired', HttpCode.UNAUTHORIZED),
        );
      }

      try {
        const decoded = JWT.validate(token);
        if (!decoded) {
          return ResponseUtil.handleError(
            res,
            new AppError('Token not provided or expired', HttpCode.UNAUTHORIZED),
          );
        }
        this.setFiltersAndPagination(req);
        req.user = decoded.user;
        if (decoded.operation) {
          req.operation = decoded.operation;
        }
        next();
      } catch (err) {
        console.log(err);
        return ResponseUtil.handleError(
          res,
          new AppError('Invalid token', HttpCode.UNAUTHORIZED),
        );
      }
    });
  }
}

const instance = new AuthMiddleware();
export { instance as AuthMiddleware };
export default instance;
