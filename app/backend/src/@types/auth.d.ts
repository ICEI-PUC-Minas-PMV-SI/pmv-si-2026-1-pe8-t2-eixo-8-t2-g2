export type AuthCredentials = {
  email: string;
  password: string;
  authCode?: string;
};

export type ChangePasswordParams = {
  email: string;
  currentPassword: string;
  newPassword: string;
  code?: string;
  isRecoveryCode?: boolean;
};
