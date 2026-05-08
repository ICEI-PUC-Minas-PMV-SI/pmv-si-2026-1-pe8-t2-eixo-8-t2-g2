import { UserService } from '../services/UserService';
import type { AuthCredentials } from '../@types';
import { HttpCode } from '../utils/HttpCode';
import { JWT } from '../utils/JWT';
import { OTPUtil } from '../utils/OTPUtil';
import { AppError } from '../error/AppError';
import { Google } from '../utils/Google';
import { UserRole } from '../validations/UserValidation';

class AuthController {
  async authenticate(credentials: AuthCredentials) {
    const user = await UserService.find(credentials);
    if (user) {
      const token = JWT.generate({ user });
      return { token };
    }
    throw new AppError('Invalid credentials', HttpCode.UNAUTHORIZED);
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
    const updatedUser = await UserService.update(userId, { enabledTwoFactor: true });
    return { token: JWT.generate({ user: updatedUser }) };
  }
}

const instance = new AuthController();
export { instance as AuthController };
