import { UserService } from '../services/UserService';
import type { AuthCredentials } from '../@types';
import { HttpCode } from '../utils/HttpCode';
import { JWT } from '../utils/JWT';
import { OTPUtil } from '../utils/OTPUtil';
import { AppError } from '../error/AppError';
import { Google } from '../utils/Google';
import { UserRole } from '../validations/UserValidation';
import type { User } from '../generated/prisma/client';

class AuthController {
  async authenticate(credentials: AuthCredentials) {
    const user = await UserService.find(credentials, { twoFactorSecret: true });
    if (!user) {
      throw new AppError('Invalid credentials', HttpCode.UNAUTHORIZED);
    }
    if (user.enabledTwoFactor) {
      const { authCode } = credentials;
      if (authCode) {
        let isValid = false;
        isValid = OTPUtil.verify(authCode, user.twoFactorSecret || '');
        if (!isValid) {
          isValid = await UserService.isValidRecoveryCode(user.id, authCode);
        }
        if (!isValid) {
          throw new AppError('Invalid authentication code', 400);
        }
        const token = JWT.generate({ user });
        return { token };
      } else {
        return { required2FACode: true };
      }
    } else {
      const token = JWT.generate({ user });
      return { token };
    }
  }

  async validate2FA({
    email,
    code,
    isRecoveryCode,
    operation,
  }: {
    email: string;
    code: string;
    isRecoveryCode: boolean;
    operation: 'RESET_PASSWORD' | 'AUTH';
  }) {
    const user = await UserService.find({ email }, { twoFactorSecret: true });
    let isValid = null;
    if (!user) {
      throw new AppError('Invalid user', HttpCode.BAD_REQUEST);
    }
    const { twoFactorSecret, ...userProps } = user;
    if (isRecoveryCode) {
      isValid = await UserService.isValidRecoveryCode(user.id, code);
    } else {
      isValid = OTPUtil.verify(code, user.twoFactorSecret || '');
    }
    if (!isValid) {
      throw new AppError('Invalid or already used code', HttpCode.BAD_REQUEST);
    }
    const userData: Partial<User> = { email };
    if (operation === 'AUTH') {
      Object.assign(userData, userProps);
    }
    return {
      token: JWT.generate({
        user: userData,
        operation,
      }),
      userId: user.id,
    };
  }

  async googleAuth(credentials: { token: string }) {
    const googleUser = await Google.verifyToken(credentials.token);
    const userGoogleId = googleUser?.sub || '';

    let user = await UserService.find(
      {
        email: googleUser?.email || '',
      },
      { name: true, id: true, email: true, role: true },
    );

    if (user && !user.googleId && userGoogleId) {
      await UserService.update(user.id, { googleId: userGoogleId });
    }

    if (!user && googleUser?.email && googleUser?.name) {
      const { name, id, email, role } = await UserService.create({
        email: googleUser?.email,
        name: googleUser?.name,
        role: UserRole.CUSTOMER,
        googleId: userGoogleId,
      });
      return { token: JWT.generate({ user: { id, name, email, role } }) };
    }
    if (user) {
      const token = JWT.generate({ user });
      return { token };
    }
    throw new AppError('Invalid credentials', HttpCode.UNAUTHORIZED);
  }
  async createTwoFactor(userId: string) {
    const savedUser = await UserService.find({ id: userId });
    if (!savedUser) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }
    if (savedUser.enabledTwoFactor) {
      throw new AppError('Two factor already enabled', HttpCode.BAD_REQUEST);
    }
    const { url, secret: twoFactorSecret } = OTPUtil.generateAuthURL();
    await UserService.update(userId, { twoFactorSecret });
    return url;
  }
  async enableTwoFactor(userId: string, otpVerify: string) {
    const savedUser = await UserService.find(
      { id: userId },
      { enabledTwoFactor: true, twoFactorSecret: true },
    );
    if (!savedUser) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }
    if (savedUser.enabledTwoFactor) {
      throw new AppError('Two factor already enabled', HttpCode.BAD_REQUEST);
    }
    if (!savedUser.twoFactorSecret) {
      throw new AppError('Invalid two factor', HttpCode.BAD_REQUEST);
    }
    const isValid = OTPUtil.verify(otpVerify, savedUser.twoFactorSecret);
    if (!isValid) {
      throw new AppError('Invalid OTP', HttpCode.BAD_REQUEST);
    }
    const recoveryCodes = await UserService.generateUserRecoveryCodes(userId);
    const updatedUser = await UserService.update(userId, { enabledTwoFactor: true });
    return { token: JWT.generate({ user: updatedUser }), recoveryCodes };
  }
  async disableTwoFactor(
    userId: string,
    data: { code: string; isRecoveryCode: boolean },
  ) {
    const { code, isRecoveryCode } = data;
    const savedUser = await UserService.find(
      { id: userId },
      { enabledTwoFactor: true, twoFactorSecret: true },
    );
    if (!savedUser) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }
    if (!savedUser.enabledTwoFactor) {
      throw new AppError('Two factor already disabled', HttpCode.BAD_REQUEST);
    }
    if (!savedUser.twoFactorSecret) {
      throw new AppError('Invalid two factor', HttpCode.BAD_REQUEST);
    }
    let isValid = null;
    if (isRecoveryCode) {
      isValid = await UserService.isValidRecoveryCode(userId, code);
    } else {
      isValid = OTPUtil.verify(code, savedUser.twoFactorSecret);
    }
    if (!isValid) {
      throw new AppError('Invalid or already used code', HttpCode.BAD_REQUEST);
    }
    const updatedUser = await UserService.update(userId, {
      enabledTwoFactor: false,
      twoFactorSecret: '',
    });
    await UserService.deleteRecoveryCodes(userId);
    return { token: JWT.generate({ user: updatedUser }) };
  }
  async forgotPassword(email: string, resetUrl: string) {
    const user = await UserService.find({ email }, { enabledTwoFactor: true });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.enabledTwoFactor) {
      return {
        required2FACode: true,
      };
    }
    const data = {
      operation: 'RESET_PASSWORD',
      user,
    };
    const token = JWT.generate(data);
    await UserService.sendResetPasswordMail(user.email, `${resetUrl}?token=${token}`);
    return {
      message: 'Success send recovery password email',
    };
  }
  async resetPassword(email: string, newPassword: string) {
    await UserService.updatePassword(email, newPassword);
  }
  async regenerateRecoveryCodes({
    email,
    code,
    isRecoveryCode,
  }: {
    email: string;
    code: string;
    isRecoveryCode: boolean;
  }) {
    const { userId } = await this.validate2FA({
      email,
      code,
      isRecoveryCode,
      operation: 'AUTH',
    });
    await UserService.deleteRecoveryCodes(userId);
    const codes = await UserService.generateUserRecoveryCodes(userId);
    return { codes };
  }
}

const instance = new AuthController();
export { instance as AuthController };
