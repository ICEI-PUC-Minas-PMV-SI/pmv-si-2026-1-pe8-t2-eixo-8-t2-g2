import type { AuthPermission } from './auth';

export type User = {
  id: string;
  name: string;
  email: string;
  role: AuthPermission;
  enabledTwoFactor: boolean;
  onlyGoogle: boolean;
};

export type UserList = {
  id: string;
  name: string;
  email: string;
  role: AuthPermission;
  createdAt: Date;
};

export type UserCreatePayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  state: string;
  city: string;
  neighborhood: string;
};
