import { AuthController } from '../controllers/AuthController';
import type { Application } from 'express';
import { AuthValidation } from '../validations/AuthValidation';
import type { GenericRequest } from '@types';
import { AppError } from '../error/AppError';
import { HttpCode } from '../utils/HttpCode';
import { RequestUtil } from 'utils/RequestUtil';

class AuthRoute {
  register(app: Application) {
    app.post('/auth', AuthValidation.auth(), async (req: GenericRequest, res) => {
      const result = await AuthController.authenticate(req.body);
      res.json(result);
    });
    app.post('/auth/validate', async (_req: GenericRequest, res) => {
      res.json({
        valid: true,
      });
    });
    app.post('/auth/google', async (req: GenericRequest, res) => {
      const result = await AuthController.googleAuth(req.body);
      res.json(result);
    });
    app.post('/auth/create-two-factor', async (req: GenericRequest, res) => {
      if (!req.user) {
        throw new AppError('Invalid user token', HttpCode.UNAUTHORIZED);
      }
      const result = await AuthController.createTwoFactor(req.user.id);
      res.json(result);
    });
    app.post(
      '/auth/enable-two-factor',
      RequestUtil.rateLimit(),
      AuthValidation.enableTwoFactor(),
      async (req: GenericRequest, res) => {
        if (!req.user) {
          throw new AppError('Invalid user token', HttpCode.UNAUTHORIZED);
        }
        const result = await AuthController.enableTwoFactor(req.user.id, req.body.otp);
        res.json(result);
      },
    );
    app.post(
      '/auth/disable-two-factor',
      RequestUtil.rateLimit(),
      AuthValidation.disableTwoFactor(),
      async (req: GenericRequest, res) => {
        if (!req.user) {
          throw new AppError('Invalid user token', HttpCode.UNAUTHORIZED);
        }
        const result = await AuthController.disableTwoFactor(req.user.id, req.body);
        res.json(result);
      },
    );
  }
}

const instance = new AuthRoute();
export { instance as AuthRoute };
export default instance;
