import type { GoogleCredentials } from '../@types';
import { GoogleService } from '../services/GoogleService';
import type { IntegrationType } from '../generated/prisma/enums';

class GoogleController {
  async createCredentials(integration: IntegrationType, credentials: GoogleCredentials) {
    return GoogleService.createCredentials(integration, credentials);
  }
  async getCredentials(integration: IntegrationType) {
    return GoogleService.getCredentials(integration);
  }
}

const instance = new GoogleController();
export { instance as GoogleController };
export default instance;
