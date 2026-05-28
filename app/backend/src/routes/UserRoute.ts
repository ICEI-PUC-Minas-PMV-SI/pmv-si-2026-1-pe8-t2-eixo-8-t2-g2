import { UserController } from '../controllers/UserController';
import { Router, type Application } from 'express';
import { UserValidation } from '../validations/UserValidation';
import type { GenericRequest, Response, UserRequest } from '../@types';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware';
import { JWT } from '../utils/JWT';

class UserRoute {
  register(app: Application) {
    const router = Router();
    router.post(
      '/user',
      UserValidation.create(),
      async (req: GenericRequest, res: Response) => {
        const result = await UserController.create(req.body, { createCustomer: true });
        res.status(201).json(result);
      },
    );

    router.post(
      '/user-list',
      UserScopeMiddleware.adminOnly(),
      async (req: UserRequest, res: Response) => {
        const result = await UserController.list(req);
        res.json(result);
      },
    );

    router.get(
      '/user/:id',
      UserScopeMiddleware.onlyAdminOrSameUser(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await UserController.find({ id });
        if (result === null) {
          res.status(404).json({
            message: 'User not found',
          });
          return;
        }
        res.json(result);
      },
    );

    router.patch(
      '/user/:id',
      UserScopeMiddleware.onlyAdminOrSameUser(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await UserController.update(id, req.body);
        res.json(result);
      },
    );

    router.delete(
      '/user/:id',
      UserScopeMiddleware.onlyAdminOrSameUser(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        await UserController.delete(id);
        res.status(204).send();
      },
    );

    router.post(
      '/user/forgot-password',
      UserValidation.forgotPassword(),
      async (req: GenericRequest, res: Response) => {
        const result = await UserController.forgotPassword(req.body.email);
        res.status(200).send(result);
      },
    );

    router.post(
      '/user/forgot-password/validate-otp',
      UserValidation.validateOTP(),
      async (req: GenericRequest, res: Response) => {
        const params = req.body;
        const isValid = await UserController.validateOTP(params);
        if (isValid) {
          const token = JWT.generate({
            user: { email: params.email },
            operation: 'RESET_PASSWORD',
          });
          res.status(200).json({ token });
        } else {
          res.status(400).send({
            message: 'INVALID_OTP_OR_EXPIRED',
          });
        }
      },
    );

    router.post(
      '/user/reset-password',
      UserValidation.resetPassword(),
      async (req: GenericRequest, res: Response) => {
        try {
          const email = req.user ? req.user.email : null;
          const isValid = email && req.operation === 'RESET_PASSWORD';
          if (isValid) {
            const { newPassword } = req.body;
            await UserController.resetPassword(email, newPassword);
            res.status(204).json();
            return;
          }
          res.status(400).json({
            message: 'Invalid token for password reset',
          });
        } catch (error: any) {
          res.status(500).json({
            message: error.message || 'Unexpected error',
            errors: {
              error,
            },
          });
        }
      },
    );

    router.patch(
      '/user-role/:id',
      UserScopeMiddleware.adminOnly(),
      UserValidation.changeRole(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        const { role } = req.body as { role: 'admin' | 'customer' };
        const result = await UserController.changeRole(id, role);
        res.json(result);
      },
    );

    app.use(router);
  }
}

const instance = new UserRoute();
export { instance as UserRoute };
export default instance;
