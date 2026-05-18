import { DebugController } from '../controllers/DebugController';
import { GoogleController } from '../controllers/GoogleController';
import { Router, type Application } from 'express';
import { DebugValidation } from '../validations/DebugValidation';
import { Env } from '../utils/Env';
import { OTPUtil } from '../utils/OTPUtil';
import { ResponseUtil } from '../utils/ResponseUtil';
import { AppError } from '../error/AppError';
import { GoogleApi } from '../integration/GoogleApi';
import { INTEGRATION } from '../integration/GoogleApi';

class DebugRoute {
  register(app: Application) {
    if (!Env.isDevelopment()) return;
    const router = Router();
    router.post('/send-mail', DebugValidation.sendMail(), async (req, res) => {
      await DebugController.sendMail(req.body);
      ResponseUtil.handleSuccess(res);
    });
    router.get('/gmail/oauth2', async (_req, res) => {
      const authUrl = await GoogleApi.getAuthUrl(INTEGRATION.GMAIL);

      res.send(`<a href="${authUrl}">Autenticar com Google</a>`);
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

        res.send('Autenticado com sucesso! Refresh token salvo.');
      } catch (err) {
        console.error(err);
        res.send('Erro ao autenticar');
      }
    });
    router.post('/generate-auth-url', async (req, res) => {
      const account = req.body.account || 'Gestão de Confeitaria';
      const url = OTPUtil.generateAuthURL(account);
      res.json({ url });
    });
    app.use('/debug', router);
  }
}

const instance = new DebugRoute();
export { instance as DebugRoute };
export default instance;
