import type { IntegrationsPayload } from '@types';
import { Prisma } from '../db/Prisma';
import { GoogleApi } from '../integration/GoogleApi';
import type {
  GoogleIntegrationUpdateInput,
  TransactionClient,
} from '../generated/prisma/internal/prismaNamespace';
import { HttpCode } from '../utils/HttpCode';
import { AppError } from '../error/AppError';
import { Crypt } from '../utils/Crypt';

type IntegrationType = 'calendar' | 'gmail' | 'all';

class IntegrationsService {
  private deleteIntegration(prisma: TransactionClient, integration: IntegrationType) {
    return prisma.googleIntegration.deleteMany({
      where: {
        useForCalendar: integration === 'calendar' || integration === 'all',
        useForEmail: integration === 'gmail' || integration === 'all',
      },
    });
  }
  async save(data: IntegrationsPayload) {
    const prisma = await Prisma.getClient();
    let integration: IntegrationType = 'all';
    if (data.gmail) {
      integration = 'gmail';
    } else if (data.googleCalendar) {
      integration = 'calendar';
    }
    await prisma.$transaction(async (tx) => {
      await this.deleteIntegration(tx, integration);

      if (data.google) {
        return tx.googleIntegration.create({
          data: {
            clientId: data.google.clientId,
            encryptedClientSecret: Crypt.encrypt(data.google.clientSecret),
            mailFrom: data.google.mailFrom,
            mailSenderName: data.google.mailSenderName,

            useForCalendar: true,
            useForEmail: true,

            scopes: [
              ...GoogleApi.config.calendar.options.scope,
              ...GoogleApi.config.gmail.options.scope,
            ].join(','),
          },
        });
      }

      if (data.googleCalendar) {
        return tx.googleIntegration.create({
          data: {
            clientId: data.googleCalendar.clientId,
            encryptedClientSecret: Crypt.encrypt(data.googleCalendar.clientSecret),

            useForCalendar: true,

            scopes: GoogleApi.config.calendar.options.scope.join(','),
          },
        });
      }

      if (data.gmail) {
        return tx.googleIntegration.create({
          data: {
            clientId: data.gmail.clientId,
            encryptedClientSecret: Crypt.encrypt(data.gmail.clientSecret),

            mailFrom: data.gmail.mailFrom,
            mailSenderName: data.gmail.mailSenderName,

            useForEmail: true,

            scopes: GoogleApi.config.gmail.options.scope.join(','),
          },
        });
      }
      throw new AppError('Failed to save integration', HttpCode.INTERNAL_SERVER_ERROR);
    });

    return GoogleApi.getAuthUrl(integration);
  }
  async find(integration: IntegrationType = 'all') {
    const prisma = await Prisma.getClient();
    const result = await prisma.googleIntegration.findFirst({
      where: {
        useForCalendar: integration === 'calendar' || integration === 'all',
        useForEmail: integration === 'gmail' || integration === 'all',
      },
    });
    return result;
  }
  async update(integration: IntegrationType, data: GoogleIntegrationUpdateInput) {
    const prisma = await Prisma.getClient();
    return prisma.googleIntegration.updateMany({
      where: {
        useForCalendar: integration === 'calendar' || integration === 'all',
        useForEmail: integration === 'gmail' || integration === 'all',
      },
      data,
    });
  }
}

const instance = new IntegrationsService();
export { instance as IntegrationsService };
