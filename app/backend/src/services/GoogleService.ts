import { Prisma } from '../db/Prisma';
import type { IntegrationType } from '../generated/prisma/enums';

class GoogleService {
  async getCredentials(integration: IntegrationType) {
    const prisma = await Prisma.getClient();
    return prisma.googleIntegration.findFirst({
      where: {
        useForCalendar: integration === 'calendar',
        useForEmail: integration === 'gmail',
      },
    });
  }
}

const instance = new GoogleService();
export { instance as GoogleService };
export default instance;
