import type { AuthResponse } from '~/@types/auth';
import type { User } from '~/@types/user';
import { useAuthStore } from '~/hooks/useAuthStore';
import JWT from '~/utils/JWT';
import Request from '~/utils/Request';

class AuthController {
  persistUser(token?: string | null) {
    if (!token) throw new Error('Invalid or empty user token');
    useAuthStore.getState().setToken(token);
    const payload = JWT.getPayload<{ user: User }>(token);
    useAuthStore.getState().setUser(payload.user);
  }
  async authenticate(email: string, password: string) {
    const result = await Request.post<AuthResponse>('/auth', { email, password });
    this.persistUser(result.token);
    return result;
  }
  async authGoogle({ token }: { token: string }) {
    const result = await Request.post<AuthResponse>('/auth/google', { token });
    this.persistUser(result.token);
    return result;
  }
  async enableTwoFactor(otp: string) {
    const result = await Request.post<AuthResponse>('/auth/enable-two-factor', { otp });
    this.persistUser(result.token);
    return result;
  }
  async createTwoFactor() {
    const url = await Request.post<string>('/auth/create-two-factor');
    return url;
  }
}

export default new AuthController();
