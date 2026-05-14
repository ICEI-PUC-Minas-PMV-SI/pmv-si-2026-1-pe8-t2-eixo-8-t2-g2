import ms from 'ms';
import { Crypt } from '../utils/Crypt';
import { HttpCode } from '../utils/HttpCode';
import { OTPUtil } from '../utils/OTPUtil';
import { SMTP } from '../utils/SMTP';
import type { UserCreatePayload } from '@types';
import { Prisma } from '../db/Prisma';
import type { User } from '../generated/prisma/client';
import { AppError } from '../error/AppError';
import { OTPTemplate } from '../templates/email/OTPTemplate';
import type { UserSelect } from '../generated/prisma/models';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  enabledTwoFactor: true,
};

class UserService {
  async create(user: UserCreatePayload) {
    const prisma = await Prisma.getClient();
    const { email, name, role, password, googleId = null } = user;
    let pass = null;
    if (password) {
      pass = await Crypt.hash(password);
    }
    const createdUser = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: pass,
        googleId,
      },
      select: userSelect,
    });

    return createdUser;
  }

  async find(params: Partial<User>, customSelect: UserSelect = {}) {
    if (!params.id && !params.email) {
      throw new AppError(
        'At least one of id or email must be provided to find a user.',
        HttpCode.BAD_REQUEST,
      );
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
        throw new AppError('Invalid credentials', HttpCode.UNAUTHORIZED);
      }
    }

    return userInfo;
  }

  async list() {
    const prisma = await Prisma.getClient();
    const users = await prisma.user.findMany({
      select: userSelect,
    });
    return users;
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
      throw new AppError('User not found', HttpCode.NOT_FOUND);
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
      }
    });
    return !!result;
  }
  async deleteRecoveryCodes(userId: string) {
    const prisma = await Prisma.getClient();
    await prisma.recoveryCode.deleteMany({
      where: {
        userId,
      }
    })
  }
}

const instance = new UserService();
export { instance as UserService };
