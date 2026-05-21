import { AppError } from 'error/AppError';
import type { IntegrationType } from '../generated/prisma/enums';
import type { GoogleIntegrationUpdateInput } from '../generated/prisma/models';
import { IntegrationsService } from '../services/IntegrationsService';
import type { IntegrationsPayload } from '@types';
import { GoogleApi } from 'integration/GoogleApi';
import { Crypt } from 'utils/Crypt';
import { Logger } from 'logger/Logger';

class IntegrationsController {
  private logger = new Logger('IntegrationsController');
  async find() {
    return IntegrationsService.find();
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
}

const instance = new IntegrationsController();
export { instance as IntegrationsController };
