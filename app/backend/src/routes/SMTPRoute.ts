import { GoogleController } from '../controllers/GoogleController';
import { Router, type Application } from 'express';
import { AppError } from '../error/AppError';
import { GoogleApi } from '../integration/GoogleApi';
import { INTEGRATION } from '../integration/GoogleApi';

class SMTPRoute {
  register(app: Application) {
    const router = Router();

    router.get('/gmail/auth-url', async (_req, res) => {
      const url = await GoogleApi.getAuthUrl(INTEGRATION.GMAIL);
      res.json({ url });
    });

    router.get('/gmail/oauth2callback', async (req, res) => {
      const code = req.query.code;
      try {
        if (!code || typeof code !== 'string')
          throw new AppError('Invalid token received', 500);
        const tokens = await GoogleApi.getTokens(code, INTEGRATION.GMAIL);
        const validTokens = GoogleApi.validateTokens(tokens);
        if (validTokens) {
          await GoogleController.createCredentials(INTEGRATION.GMAIL, validTokens);
        }

        res.send(`
  <script>
    window.opener.postMessage(
      { type: 'GMAIL_AUTH_SUCCESS' },
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

    app.use(router);
  }
}

const instance = new SMTPRoute();
export { instance as SMTPRoute };
export default instance;
