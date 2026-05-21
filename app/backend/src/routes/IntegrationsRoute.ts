import { Router, type Application } from 'express';
import { IntegrationsController } from '../controllers/IntegrationsController';
import { AppError } from '../error/AppError';
import { ResponseUtil } from '../utils/ResponseUtil';
import { HttpCode } from '../utils/HttpCode';

class IntegrationsRoute {
  register(app: Application) {
    const router = Router();

    router.get('/integrations', async (_req, res) => {
      const data = await IntegrationsController.find();
      res.json(data);
    });
    router.post('/integrations', async (req, res) => {
      const url = await IntegrationsController.save(req.body);
      res.json({ url });
    });

    router.get('/google-calendar/webhook', async (req, res) => {
      const code = req.query.code;
      try {
        await IntegrationsController.handleWebhookToken(code, 'calendar');
        res.send(`
          <script>
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_SUCCESS', integration: 'calendar' },
              '*'
            );
            window.close();
          </script>
        `);
      } catch (err) {
        ResponseUtil.handleError(
          res,
          new AppError(
            'Error occurred while authenticating with Google',
            HttpCode.INTERNAL_SERVER_ERROR,
          ),
        );
      }
    });

    router.get('/gmail/webhook', async (req, res) => {
      const code = req.query.code;
      try {
        await IntegrationsController.handleWebhookToken(code, 'gmail');
        res.send(`
          <script>
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_SUCCESS', integration: 'gmail' },
              '*'
            );
            window.close();
          </script>
        `);
      } catch (err) {
        ResponseUtil.handleError(
          res,
          new AppError(
            'Error occurred while authenticating with Google',
            HttpCode.INTERNAL_SERVER_ERROR,
          ),
        );
      }
    });

    router.get('/google/webhook', async (req, res) => {
      const code = req.query.code;
      try {
        await IntegrationsController.handleWebhookToken(code, 'all');
        res.send(`
          <script>
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_SUCCESS', integration: 'all' },
              '*'
            );
            window.close();
          </script>
        `);
      } catch (err) {
        ResponseUtil.handleError(
          res,
          new AppError(
            'Error occurred while authenticating with Google',
            HttpCode.INTERNAL_SERVER_ERROR,
          ),
        );
      }
    });

    app.use(router);
  }
}

const instance = new IntegrationsRoute();
export { instance as IntegrationsRoute };
export default instance;
