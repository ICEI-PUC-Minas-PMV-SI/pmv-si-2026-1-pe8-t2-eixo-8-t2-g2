import type { AuthPermission } from '~/@types/auth';

export const UserRole: Record<string, AuthPermission> = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};
