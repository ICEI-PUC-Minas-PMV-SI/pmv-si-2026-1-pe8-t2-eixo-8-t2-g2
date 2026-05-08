import type { AuthPermission } from './auth';

export type User = {
  name: string;
  email: string;
  role: AuthPermission;
  enabledTwoFactor: boolean;
};
