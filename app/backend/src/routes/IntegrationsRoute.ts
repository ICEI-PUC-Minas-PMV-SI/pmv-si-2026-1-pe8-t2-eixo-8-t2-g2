import { type Router } from 'express';
import { IntegrationsController } from '../controllers/IntegrationsController.js';
import { AppError } from '../error/AppError.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';
import { HttpCode } from '../utils/HttpCode.js';
import { Logger } from '../logger/Logger.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';

class IntegrationsRoute {
  private logger = new Logger('IntegrationsRoute');
  register(router: Router) {
    router.get('/integrations', UserScopeMiddleware.adminOnly(), async (_req, res) => {
      const data = await IntegrationsController.list();
      res.json(data);
    });
    router.post('/integrations', UserScopeMiddleware.adminOnly(), async (req, res) => {
      const url = await IntegrationsController.save(req.body);
      res.json({ url });
    });
    router.post(
      '/integrations/test',
      UserScopeMiddleware.adminOnly(),
      async (req, res) => {
        try {
          await IntegrationsController.test(req.body.integration || 'all');
          res.json({ success: true });
        } catch (err) {
          this.logger.error('Error testing integration', { error: err });
          ResponseUtil.handleError(
            res,
            new AppError(
              'Falha ao testar integração. Verifique as credenciais e tente novamente.',
              HttpCode.INTERNAL_SERVER_ERROR,
              null,
              err,
            ),
          );
        }
      },
    );

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
        this.logger.error('Error handling Google webhook', { error: err });
        ResponseUtil.handleError(
          res,
          new AppError(
            'Error occurred while authenticating with Google',
            HttpCode.INTERNAL_SERVER_ERROR,
          ),
        );
      }
    });
  }
}

const instance = new IntegrationsRoute();
export { instance as IntegrationsRoute };
export default instance;
