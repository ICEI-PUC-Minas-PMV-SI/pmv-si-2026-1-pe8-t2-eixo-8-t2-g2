import { SchedulerController } from '../controllers/SchedulerController';
import { Router, type Application } from 'express';
import { SchedulerValidation } from '../validations/SchedulerValidation';
import type { Response, SchedulerRequest } from '../@types';
import { UserRole } from '../validations/UserValidation';

class SchedulerRoute {
  register(app: Application) {
    const router = Router();

    router.get('/scheduler/google-auth-url', async (_req, res) => {
      const url = await SchedulerController.getGoogleAuthUrl();
      res.json({ url });
    });

    router.get('/scheduler/count-unsynced-schedulers', async (_req, res) => {
      const count = await SchedulerController.getCountUnsyncedSchedulers();
      res.json({ count });
    });

    router.post('/scheduler/sync-unsynced-schedulers', async (_req, res) => {
      const result = await SchedulerController.syncUnsyncedSchedulers();
      res.json(result);
    });

    router.post(
      '/scheduler',
      SchedulerValidation.create,
      async (req: SchedulerRequest, res) => {
        const isCustomer = req.user?.role === UserRole.CUSTOMER;
        const customerId =
          !req.body.customerId && isCustomer ? req.user?.id : req.body.customerId;
        const data = {
          ...req.body,
          customerId,
          userId: req.user?.id,
        };
        if (isCustomer) {
          data.scheduledAt = new Date().toISOString();
        }
        const result = await SchedulerController.create(data);
        res.json(result);
      },
    );

    router.get('/scheduler', async (req: SchedulerRequest, res: Response) => {
      const result = await SchedulerController.list(req);
      res.json(result);
    });

    router.post('/scheduler-list', async (req: SchedulerRequest, res: Response) => {
      const result = await SchedulerController.list(req);
      res.json(result);
    });

    router.get('/scheduler/:id', async (req: SchedulerRequest, res: Response) => {
      const id = req.params.id as string;
      const result = await SchedulerController.find(id);
      res.json(result);
    });

    router.patch('/scheduler/:id', async (req: SchedulerRequest, res: Response) => {
      const id = req.params.id as string;
      const data = req.body;
      delete data.customerId;
      delete data.customerPhone;
      delete data.customerName;
      const result = await SchedulerController.update(id, data);
      res.json(result);
    });

    router.patch(
      '/scheduler-cancellation/:id',
      async (req: SchedulerRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await SchedulerController.cancel(id, req.body.cancellationReason);
        res.json(result);
      },
    );

    router.delete('/scheduler/:id', async (req: SchedulerRequest, res: Response) => {
      const id = req.params.id as string;
      await SchedulerController.delete(id);
      res.status(204).send();
    });
    app.use(router);
  }
}

const instance = new SchedulerRoute();
export { instance as SchedulerRoute };
export default instance;
