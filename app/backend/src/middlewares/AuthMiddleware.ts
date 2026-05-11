import { AppError } from '../error/AppError';
import type { Response, NextFunction, Application, GenericRequest } from '@types';
import { HttpCode } from '../utils/HttpCode';
import { JWT } from '../utils/JWT';
import { ResponseUtil } from '../utils/ResponseUtil';
import z from 'zod';
import { RequestUtil } from 'utils/RequestUtil';

class AuthMiddleware {
  priority = 1;
  isPublicRoute(req: GenericRequest) {
    const publicRoutes = [
      '/auth',
      '/auth/google',
      '/product',
      '/product/:id',
      '/debug/gmail/oauth2callback',
      '/gmail/oauth2callback',
      '/debug/generate-auth-url',
      '/user/forgot-password',
      '/user/forgot-password/validate-otp',
      '/google-calendar/oauth2callback',
      '/dashboard',
    ];
    const cleanedPath = req.path.replace(/\/$/, '');
    const [basePath, uuid = ''] = cleanedPath.split('/').slice(1);
    const { success: hasUUID } = z.safeParse(
      z.object({
        uuid: z.uuid(),
      }),
      { uuid },
    );
    return publicRoutes.some((publicRoute) => {
      const isEqualSimpleRoute = publicRoute === cleanedPath;
      const isEqualDynamicRoute =
        publicRoute.includes(':id') &&
        hasUUID &&
        publicRoute.replace('/:id', '') === `/${basePath}`;

      return isEqualSimpleRoute || isEqualDynamicRoute;
    });
  }
  async register(app: Application) {
    app.use((req: GenericRequest, res: Response, next: NextFunction) => {
      if (this.isPublicRoute(req)) {
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
        const paginationParams = RequestUtil.getPaginationParams(req);
        if (!decoded) {
          return ResponseUtil.handleError(
            res,
            new AppError('Token not provided or expired', HttpCode.UNAUTHORIZED),
          );
        }
        if (paginationParams) {
          req.pagination = paginationParams;
        }
        if (req.body && req.body.sort) {
          req.sort = req.body.sort;
        }
        if (req.body && req.body.filters) {
          req.filters = req.body.filters;
        }
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
