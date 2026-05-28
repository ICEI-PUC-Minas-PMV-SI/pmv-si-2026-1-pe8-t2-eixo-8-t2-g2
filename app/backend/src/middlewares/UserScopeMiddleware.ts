import { HttpCode } from '../utils/HttpCode.js';
import { JWT } from '../utils/JWT.js';
import type { Response, NextFunction, GenericRequest } from '../@types/index.js';
import { RequestUtil } from '../utils/RequestUtil.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';
import { UserRole } from '../validations/UserValidation.js';
import { AppError } from '../error/AppError.js';

type ValidationTokenResult = {
  error: AppError | null;
  tokenData: any | null;
};

class UserScopeMiddleware {
  private validateToken(req: GenericRequest): ValidationTokenResult {
    const token = RequestUtil.getToken(req);
    if (!token) {
      return {
        error: new AppError('Unauthorized. No token provided.', HttpCode.UNAUTHORIZED),
        tokenData: null,
      };
    }
    const tokenData = JWT.validate(token) || null;
    if (!tokenData) {
      return {
        error: new AppError('Unauthorized. Invalid token.', HttpCode.UNAUTHORIZED),
        tokenData: null,
      };
    }
    return { error: null, tokenData };
  }
  hasAccess = (
    req: GenericRequest,
    res: Response,
    next: NextFunction,
    allowedRoles: UserRole[],
  ) => {
    const { error, tokenData } = this.validateToken(req);
    if (error) {
      ResponseUtil.handleError(res, error);
      return;
    }
    const {
      user: { role },
    } = tokenData;
    if (!allowedRoles.includes(role)) {
      ResponseUtil.handleError(
        res,
        new AppError('Access denied. Insufficient permissions.', HttpCode.FORBIDDEN),
      );
      return;
    }
    next();
  };
  adminOnly = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      this.hasAccess(req, res, next, [UserRole.ADMIN]);
    };
  };

  only = (allowedRoles: UserRole[]) => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      this.hasAccess(req, res, next, allowedRoles);
    };
  };

  onlyAdminOrSameUser = () => {
    return (req: GenericRequest, res: Response, next: NextFunction) => {
      const { error, tokenData } = this.validateToken(req);
      if (error) {
        ResponseUtil.handleError(res, error);
        return;
      }
      const {
        user: { id: userId, role },
      } = tokenData;

      return req.params.id === userId || role === UserRole.ADMIN
        ? next()
        : ResponseUtil.handleError(
            res,
            new AppError('Access denied. Insufficient permissions.', HttpCode.FORBIDDEN),
          );
    };
  };
}

const instance = new UserScopeMiddleware();
export { instance as UserScopeMiddleware };
