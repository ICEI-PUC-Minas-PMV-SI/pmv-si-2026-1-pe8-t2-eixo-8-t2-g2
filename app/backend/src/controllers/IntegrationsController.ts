import { AppError } from 'error/AppError';
import type { IntegrationType } from '../generated/prisma/enums';
import type { GoogleIntegrationUpdateInput } from '../generated/prisma/models';
import { IntegrationsService } from '../services/IntegrationsService';
import type { IntegrationsPayload } from '@types';
import { GoogleApi } from 'integration/GoogleApi';
import { Crypt } from 'utils/Crypt';
import { Logger } from 'logger/Logger';
import { GoogleCalendarApi } from 'integration/GoogleCalendarApi';
import { SMTP } from 'utils/SMTP';

class IntegrationsController {
  private logger = new Logger('IntegrationsController');
  async list() {
    return IntegrationsService.list();
  }
  async save(data: IntegrationsPayload) {
    return IntegrationsService.save(data);
  }
  async update(integration: IntegrationType, data: GoogleIntegrationUpdateInput) {
    return IntegrationsService.update(integration, data);
  }
  async handleWebhookToken(code: unknown, integration: IntegrationType) {
    if (!code || typeof code !== 'string')
      throw new AppError('Invalid token received', 500);
    const tokens = await GoogleApi.getTokens(code, integration);
    const validTokens = GoogleApi.validateTokens(tokens);
    if (validTokens) {
      await this.update(integration, {
        encryptedRefreshToken: Crypt.encrypt(validTokens.refreshToken),
        tokenType: validTokens.tokenType,
      });
    } else {
      const errorMsg = 'Invalid tokens received from Google API';
      this.logger.error(errorMsg, { tokens });
      throw new AppError(errorMsg, 500);
    }
  }

  async test(integration: IntegrationType) {
    console.log('Testing integration:', integration);
    const promises = [];
    if (integration === 'calendar' || integration === 'all') {
      promises.push(
        GoogleCalendarApi.testCalendarIntegration().catch((err) => {
          this.logger.error('Error testing Google Calendar integration', {
            integration,
            error: err,
          });
          throw err;
        }),
      );
    }
    if (integration === 'gmail' || integration === 'all') {
      promises.push(
        SMTP.sendMail({
          attachments: [],
          body: 'This is a test email from Isabella Cáster Site to verify Gmail integration.',
          subject: 'Test Email - Isabella Cáster Site',
          to: '',
        }).catch((err) => {
          this.logger.error('Error sending test email', { integration, error: err });
          throw err;
        }),
      );
    } else {
      throw new AppError('Unsupported integration type', 400);
    }
    return Promise.all(promises);
  }
}

const instance = new IntegrationsController();
export { instance as IntegrationsController };
