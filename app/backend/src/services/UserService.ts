import ms from 'ms';
import { Crypt } from '../utils/Crypt';
import { HttpCode } from '../utils/HttpCode';
import { OTPUtil } from '../utils/OTPUtil';
import { SMTP } from '../utils/SMTP';
import type { PaginationParams, UserCreatePayload } from '../@types';
import { Prisma } from '../db/Prisma';
import type { User } from '../generated/prisma/client';
import { AppError } from '../error/AppError';
import { OTPTemplate } from '../templates/email/OTPTemplate';
import type {
  UserOrderByWithRelationInput,
  UserSelect,
  UserWhereInput,
} from '../generated/prisma/models';
import { PasswordResetTemplate } from '../templates/email/PasswordResetTemplate';
import { ResponseUtil } from '../utils/ResponseUtil';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  enabledTwoFactor: true,
};

class UserService {
  async create(
    user: UserCreatePayload,
    { createCustomer }: { createCustomer?: boolean } = {},
  ) {
    const prisma = await Prisma.getClient();
    const alreadyExists = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.email }, { phone: user.phone }],
      },
    });
    if (alreadyExists) {
      throw new AppError(
        'E-mail e/ou telefone já está cadastrado para outro usuário',
        HttpCode.BAD_REQUEST,
      );
    }
    const { email, name, phone, address, password, googleId = null } = user;
    let pass = null;
    if (password) {
      pass = await Crypt.hash(password);
    }
    const createdUser = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          role: 'customer',
          password: pass,
          googleId,
        },
        select: userSelect,
      });
      if (createCustomer && address) {
        await tx.customer.create({
          data: {
            name,
            addresses: {
              create: {
                postalCode: address.postalCode,
                street: address.street,
                number: address.number,
                complement: address.complement || null,
                state: address.state,
                city: address.city,
                neighborhood: address.neighborhood,
                country: 'BR',
                isPrimary: address.isPrimary ?? false,
              },
            },
            phone,
            user: {
              connect: {
                id: newUser.id,
              },
            },
          },
        });
      }
      return newUser;
    });
    console.log('Created user:', createdUser);
    return createdUser;
  }

  async find(params: Partial<User>, customSelect: UserSelect = {}) {
    if (!params.id && !params.email) {
      throw new AppError('Falha ao buscar informações do usuário', HttpCode.BAD_REQUEST);
    }
    const prisma = await Prisma.getClient();
    const { password, ...searchParams } = params;
    const user = await prisma.user.findFirst({
      where: searchParams,
      select: { ...userSelect, ...customSelect, password: !!password },
    });
    if (!user) {
      return null;
    }

    const { password: userPassword, ...userInfo } = user;

    if (password && userPassword) {
      const isValidPassword = await Crypt.isValidHash(password, userPassword);
      if (!isValidPassword) {
        throw new AppError('Credenciais inválidas', HttpCode.UNAUTHORIZED);
      }
    }

    return userInfo;
  }

  async list(
    filter?: UserWhereInput,
    orderBy?: UserOrderByWithRelationInput[],
    pagination?: PaginationParams,
  ) {
    const prisma = await Prisma.getClient();
    const where = filter ? filter : {};
    const pageParams = pagination || {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        ...pageParams,
        select: {
          id: true,
          email: true,
          createdAt: true,
          role: true,
          name: true,
        },
        orderBy: orderBy && orderBy.length > 0 ? orderBy : { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    return { data: users, total, ...ResponseUtil.handlePageParams(pageParams, total) };
  }

  async delete(id: string) {
    const prisma = await Prisma.getClient();
    await prisma.user.delete({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Partial<UserCreatePayload> & {
      twoFactorSecret?: string;
      enabledTwoFactor?: boolean;
    },
  ) {
    const prisma = await Prisma.getClient();
    const dataToUpdate: Partial<UserCreatePayload> = { ...data };

    if (data.password) {
      dataToUpdate.password = await Crypt.hash(data.password);
    }

    if (data.email) {
      delete dataToUpdate.email;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: userSelect,
    });
    return updatedUser;
  }
  async updateOTPSecret(userId: string, otpSecret: string) {
    const prisma = await Prisma.getClient();
    await prisma.user.update({
      where: { id: userId },
      data: { otpSecret },
      select: userSelect,
    });
  }
  async forgotPassword(email: string) {
    const user = await this.find({ email });
    if (!user) {
      throw new AppError('Usuário não encontrado', HttpCode.NOT_FOUND);
    }
    const secret = OTPUtil.generateSecret();

    await this.updateOTPSecret(user.id, secret);
    const otp = OTPUtil.generate(secret, ms('5m'));

    const { template, attachments } = OTPTemplate.buildOTP(otp);
    await SMTP.sendMail({
      body: template,
      subject: `${otp} - Código de recuperação de senha`,
      to: user.email,
      attachments,
    });
  }
  async sendResetPasswordMail(email: string, resetUrl: string) {
    const { template, attachments } = PasswordResetTemplate.buildResetEmail(resetUrl);
    await SMTP.sendMail({
      body: template,
      subject: 'Redefinição de senha',
      to: email,
      attachments,
    });
  }
  async updatePassword(email: string, newPassword: string) {
    const prisma = await Prisma.getClient();
    const password = await Crypt.hash(newPassword);
    await prisma.user.update({
      where: { email },
      data: { password },
    });
  }
  async generateUserRecoveryCodes(userId: string) {
    const prisma = await Prisma.getClient();
    const codes = await OTPUtil.generateRecoveryCodes(8);
    await prisma.recoveryCode.createMany({
      data: codes.map((code) => ({ codeHash: code.hash, userId })),
    });
    return codes.map(({ code }) => code);
  }
  async isValidRecoveryCode(userId: string, recoveryCode: string) {
    const prisma = await Prisma.getClient();
    const result = await prisma.recoveryCode.findUnique({
      where: {
        codeHash: OTPUtil.hashRecoveryCode(recoveryCode),
        userId,
      },
    });
    if (result && !result.used) {
      await prisma.recoveryCode.update({
        where: { id: result.id },
        data: { used: true },
      });
    }
    return !result?.used;
  }
  async deleteRecoveryCodes(userId: string) {
    const prisma = await Prisma.getClient();
    await prisma.recoveryCode.deleteMany({
      where: {
        userId,
      },
    });
  }
  async changeRole(id: string, role: 'admin' | 'customer') {
    const prisma = await Prisma.getClient();
    if (role === 'customer') {
      const count = await prisma.user.count({
        where: {
          role: 'admin',
        },
      });
      if (count === 1) {
        throw new AppError(
          'Não é possível retirar permissão de todos os usuários administrativos',
          HttpCode.BAD_REQUEST,
        );
      }
    }
    await prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}

const instance = new UserService();
export { instance as UserService };
