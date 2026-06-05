import type { IntegrationsPayload } from '../@types/index.js';
import { Prisma as PrismaDB } from '../db/Prisma.js';
import type { Prisma } from '../generated/prisma';
import { GoogleApi } from '../integration/GoogleApi.js';
// import type {
//   GoogleIntegrationUpdateInput,
//   GoogleIntegrationWhereInput,
//   TransactionClient,
// } from '../generated/prisma/internal/prismaNamespace.js';
import { HttpCode } from '../utils/HttpCode.js';
import { AppError } from '../error/AppError.js';
import { Crypt } from '../utils/Crypt.js';

type IntegrationType = 'calendar' | 'gmail' | 'all';

class IntegrationsService {
  private deleteIntegration(
    prisma: Prisma.TransactionClient,
    integration: IntegrationType,
  ) {
    return prisma.googleIntegration.deleteMany({
      where: {
        useForCalendar: integration === 'calendar' || integration === 'all',
        useForEmail: integration === 'gmail' || integration === 'all',
      },
    });
  }
  async save(data: IntegrationsPayload) {
    const prisma = await PrismaDB.getClient();
    let integration: IntegrationType = 'all';
    if (data.gmail) {
      integration = 'gmail';
    } else if (data.googleCalendar) {
      integration = 'calendar';
    }
    await prisma.$transaction(async (tx) => {
      const current = await tx.googleIntegration.findFirst();
      await this.deleteIntegration(tx, integration);
      const clientSecret = data.google?.clientSecret || '';
      const useCurrentSecret = clientSecret.replace(/\*/g, '').length === 0;
      const secret = useCurrentSecret
        ? current?.encryptedClientSecret || ''
        : clientSecret;
      if (data.google) {
        return tx.googleIntegration.create({
          data: {
            clientId: data.google.clientId,
            encryptedClientSecret: useCurrentSecret
              ? secret
              : Crypt.encrypt(clientSecret),
            mailFrom: data.google.mailFrom,
            mailSenderName: data.google.mailSenderName,

            useForCalendar: true,
            useForEmail: true,

            scopes: GoogleApi.config.all.options.scope.join(','),
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
      throw new AppError(
        'Falha ao salvar dados de integração',
        HttpCode.INTERNAL_SERVER_ERROR,
      );
    });

    return GoogleApi.getAuthUrl(integration);
  }
  async find(integration: IntegrationType = 'all') {
    const prisma = await PrismaDB.getClient();
    const filter: Prisma.GoogleIntegrationWhereInput = {};
    if (integration === 'calendar') {
      filter.useForCalendar = true;
    } else if (integration === 'gmail') {
      filter.useForEmail = true;
    } else if (integration === 'all') {
      filter.OR = [{ useForCalendar: true }, { useForEmail: true }];
    } else {
      throw new AppError('Unsupported integration type', HttpCode.BAD_REQUEST);
    }

    const result = await prisma.googleIntegration.findFirst({
      where: filter,
    });
    return result;
  }
  async list() {
    const prisma = await PrismaDB.getClient();
    const result = await prisma.googleIntegration.findMany({
      select: {
        mailFrom: true,
        mailSenderName: true,
        useForCalendar: true,
        useForEmail: true,
        clientId: true,
      },
    });
    if (result.length === 0) {
      return null;
    }
    const [row] = result;
    if (result.length === 1 && row) {
      if (row.useForCalendar && row.useForEmail) {
        return { google: row };
      }
      if (row.useForCalendar) {
        return { googleCalendar: row };
      }
      if (row.useForEmail) {
        return { gmail: row };
      }
    }
    if (result.length === 2) {
      const calendarRow = result.find((row) => row.useForCalendar);
      const gmailRow = result.find((row) => row.useForEmail);
      return {
        googleCalendar: calendarRow || null,
        gmail: gmailRow || null,
      };
    }
    return result;
  }
  async update(integration: IntegrationType, data: Prisma.GoogleIntegrationUpdateInput) {
    const prisma = await PrismaDB.getClient();
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
