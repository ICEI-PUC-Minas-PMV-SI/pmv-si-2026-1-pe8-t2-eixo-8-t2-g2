import { GoogleController } from '../controllers/GoogleController';
import { SchedulerController } from '../controllers/SchedulerController';
import { Router, type Application } from 'express';
import { SchedulerValidation } from '../validations/SchedulerValidation';
import type { Response, SchedulerRequest } from '@types';
import { AppError } from '../error/AppError';
import { GoogleApi } from '../integration/GoogleApi';
import { INTEGRATION } from '../integration/GoogleApi';

class SchedulerRoute {
  register(app: Application) {
    const router = Router();

    router.get('/scheduler/google-auth-url', async (_req, res) => {
      const url = await SchedulerController.getGoogleAuthUrl();
      res.json({ url });
    });

    router.get('/google-calendar/oauth2callback', async (req, res) => {
      const code = req.query.code;
      try {
        if (!code || typeof code !== 'string')
          throw new AppError('Invalid token received', 500);
        const tokens = await GoogleApi.getTokens(code, INTEGRATION.CALENDAR);
        const validTokens = GoogleApi.validateTokens(tokens);
        if (validTokens) {
          await GoogleController.createCredentials(INTEGRATION.CALENDAR, validTokens);
        } else {
          console.log(tokens);
        }

        res.send(`
  <script>
    window.opener.postMessage(
      { type: 'GOOGLE_AUTH_SUCCESS' },
      '*'
    );
    window.close();
  </script>
`);
      } catch (err) {
        console.error(err);
        res.send('Erro ao autenticar');
      }
    });

    router.post('/scheduler', SchedulerValidation.create, async (req, res) => {
      const result = await SchedulerController.create(req.body);
      res.json(result);
    });

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
      const result = await SchedulerController.update(id, req.body);
      res.json(result);
    });

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
