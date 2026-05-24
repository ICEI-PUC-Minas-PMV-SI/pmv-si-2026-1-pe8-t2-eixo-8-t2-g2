import type { AuthPermission } from './auth';

export type User = {
  id: string;
  name: string;
  email: string;
  role: AuthPermission;
  enabledTwoFactor: boolean;
};

export type UserList = {
  id: string;
  name: string;
  email: string;
  role: AuthPermission;
  createdAt: Date;
};
