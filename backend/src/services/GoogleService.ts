import { Prisma } from '../db/Prisma';
import type { GoogleCredentials } from '@types';
import { Crypt } from '../utils/Crypt';
import type { Prisma as PrismaType } from '../generated/prisma/client';
import type { IntegrationType } from '../generated/prisma/enums';

class GoogleService {
  async createCredentials(integration: IntegrationType, credentials: GoogleCredentials) {
    const prisma = await Prisma.getClient();
    const currentCredentials = await this.getCredentials(integration);
    if (currentCredentials) {
      return this.updateCredential(integration, credentials);
    }
    const encryptedAccessToken = Crypt.encrypt(credentials.accessToken);
    const encryptedRefreshToken = Crypt.encrypt(credentials.refreshToken);
    const { tokenId, tokenType } = credentials;
    return prisma.googleCredentials.create({
      data: {
        integration,
        tokenType,
        tokenId,
        encryptedAccessToken,
        encryptedRefreshToken,
      },
      select: {
        id: true,
      },
    });
  }
  async getCredentials(integration: IntegrationType) {
    const prisma = await Prisma.getClient();
    return prisma.googleCredentials.findFirst({
      where: { integration },
    });
  }
  async updateCredential(id: string, data: PrismaType.GoogleCredentialsUpdateInput) {
    const prisma = await Prisma.getClient();
    return prisma.googleCredentials.update({
      data,
      where: { id },
    });
  }
}

const instance = new GoogleService();
export { instance as GoogleService };
export default instance;
