import { UserService } from '../services/UserService.js';
import type { AuthCredentials } from '../@types/index.js';
import { HttpCode } from '../utils/HttpCode.js';
import { JWT } from '../utils/JWT.js';
import { OTPUtil } from '../utils/OTPUtil.js';
import { AppError } from '../error/AppError.js';
import { Google } from '../utils/Google.js';
import type { User } from '../generated/prisma/client.js';

class AuthController {
  async authenticate(credentials: AuthCredentials) {
    const user = await UserService.find(credentials, { twoFactorSecret: true });
    if (!user) {
      throw new AppError('Credenciais inválidas', HttpCode.UNAUTHORIZED);
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
          throw new AppError('Código de autenticação inválido', 400);
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
      throw new AppError('Usuário inválido', HttpCode.BAD_REQUEST);
    }
    const { twoFactorSecret, ...userProps } = user;
    if (isRecoveryCode) {
      isValid = await UserService.isValidRecoveryCode(user.id, code);
    } else {
      isValid = OTPUtil.verify(code, user.twoFactorSecret || '');
    }
    if (!isValid) {
      throw new AppError('Código inválido ou já utilizado', HttpCode.BAD_REQUEST);
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
        password: null,
        address: null,
        phone: null,
        googleId: userGoogleId,
      });
      return { token: JWT.generate({ user: { id, name, email, role } }) };
    }
    if (user) {
      const token = JWT.generate({ user });
      return { token };
    }
    throw new AppError('Credenciais inválidas', HttpCode.UNAUTHORIZED);
  }
  async createTwoFactor(userId: string) {
    const savedUser = await UserService.find({ id: userId });
    if (!savedUser) {
      throw new AppError('Usuário não encontrado', HttpCode.NOT_FOUND);
    }
    if (savedUser.enabledTwoFactor) {
      throw new AppError(
        'Autenticação de dois fatores já está ativa',
        HttpCode.BAD_REQUEST,
      );
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
      throw new AppError('Usuário não encontrado', HttpCode.NOT_FOUND);
    }
    if (savedUser.enabledTwoFactor) {
      throw new AppError(
        'Autenticação de dois fatores já está ativa',
        HttpCode.BAD_REQUEST,
      );
    }
    if (!savedUser.twoFactorSecret) {
      throw new AppError('Falha ao validar código', HttpCode.INTERNAL_SERVER_ERROR);
    }
    const isValid = OTPUtil.verify(otpVerify, savedUser.twoFactorSecret);
    if (!isValid) {
      throw new AppError('Código inválido', HttpCode.BAD_REQUEST);
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
      throw new AppError('Usuário não encontrado', HttpCode.NOT_FOUND);
    }
    if (!savedUser.enabledTwoFactor) {
      throw new AppError(
        'Autenticação de dois fatores já está desativada',
        HttpCode.BAD_REQUEST,
      );
    }
    if (!savedUser.twoFactorSecret) {
      throw new AppError('Falha na validação do código', HttpCode.INTERNAL_SERVER_ERROR);
    }
    let isValid = null;
    if (isRecoveryCode) {
      isValid = await UserService.isValidRecoveryCode(userId, code);
    } else {
      isValid = OTPUtil.verify(code, savedUser.twoFactorSecret);
    }
    if (!isValid) {
      throw new AppError('Código inválido ou já utilizado', HttpCode.BAD_REQUEST);
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
      throw new Error('Usuário não encontrado');
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
      message: 'E-mail de recuperação de senha enviado com sucesso',
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
