import { AuthController } from '../controllers/AuthController.js';
import type { Router } from 'express';
import { AuthValidation } from '../validations/AuthValidation.js';
import type { GenericRequest } from '../@types/index.js';
import { AppError } from '../error/AppError.js';
import { HttpCode } from '../utils/HttpCode.js';
import { RequestUtil } from '../utils/RequestUtil.js';

class AuthRoute {
  register(router: Router) {
    router.post('/auth', AuthValidation.auth(), async (req: GenericRequest, res) => {
      const result = await AuthController.authenticate(req.body);
      res.json(result);
    });
    router.post('/auth/validate', async (_req: GenericRequest, res) => {
      res.json({
        valid: true,
      });
    });
    router.post('/auth/google', async (req: GenericRequest, res) => {
      const result = await AuthController.googleAuth(req.body);
      res.json(result);
    });
    router.post('/auth/create-two-factor', async (req: GenericRequest, res) => {
      if (!req.user) {
        throw new AppError('Usuário inválido ou sessão expirada', HttpCode.UNAUTHORIZED);
      }
      const result = await AuthController.createTwoFactor(req.user.id);
      res.json(result);
    });
    router.post(
      '/auth/enable-two-factor',
      RequestUtil.rateLimit(),
      AuthValidation.enableTwoFactor(),
      async (req: GenericRequest, res) => {
        if (!req.user) {
          throw new AppError(
            'Usuário inválido ou sessão expirada',
            HttpCode.UNAUTHORIZED,
          );
        }
        const result = await AuthController.enableTwoFactor(req.user.id, req.body.otp);
        res.json(result);
      },
    );
    router.post(
      '/auth/disable-two-factor',
      RequestUtil.rateLimit(),
      AuthValidation.disableTwoFactor(),
      async (req: GenericRequest, res) => {
        if (!req.user) {
          throw new AppError(
            'Usuário inválido ou sessão expirada',
            HttpCode.UNAUTHORIZED,
          );
        }
        const result = await AuthController.disableTwoFactor(req.user.id, req.body);
        res.json(result);
      },
    );
    router.post(
      '/auth/forgot-password',
      AuthValidation.forgotPassword(),
      async (req: GenericRequest, res) => {
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password`;
        const result = await AuthController.forgotPassword(req.body.email, resetUrl);
        res.json(result);
      },
    );
    router.post(
      '/auth/reset-password',
      AuthValidation.resetPassword(),
      async (req: GenericRequest, res) => {
        if (req.operation !== 'RESET_PASSWORD') {
          throw new Error('Falha na validação de token para redefinição de senha');
        }
        const userEmail = req.user?.email;
        if (!userEmail) {
          throw new Error('Falha ao verificar e-mail de usuário');
        }
        const result = await AuthController.resetPassword(userEmail, req.body.password);
        res.json(result);
      },
    );
    router.post(
      '/auth/validate-2fa',
      AuthValidation.validate2FA(),
      async (req: GenericRequest, res) => {
        const result = await AuthController.validate2FA(req.body);
        res.json(result);
      },
    );
    router.post(
      '/auth/regenerate-recovery-codes',
      AuthValidation.regenerateRecoveryCodes(),
      async (req: GenericRequest, res) => {
        const result = await AuthController.regenerateRecoveryCodes({
          ...req.body,
          email: req.user?.email,
        });
        res.json(result);
      },
    );
    router.delete(
      '/auth/delete-account',
      AuthValidation.deleteAccount(),
      async (req: GenericRequest, res) => {
        await AuthController.deleteAccount({
          ...req.body,
          email: req.user?.email,
        });
        res.status(204).send();
      },
    );
    router.post(
      '/auth/change-password',
      AuthValidation.changePassword(),
      async (req: GenericRequest, res) => {
        const result = await AuthController.changePassword({
          ...req.body,
          email: req.user?.email,
        });
        res.json(result);
      },
    );
  }
}

const instance = new AuthRoute();
export { instance as AuthRoute };
export default instance;
