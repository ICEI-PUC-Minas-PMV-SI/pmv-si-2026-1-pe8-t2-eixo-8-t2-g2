cdexport type AuthData = {
  email: string;
  password: string;
};

export type AuthGoogleData = { token: string };

export type AuthPermission = 'admin' | 'customer';

export type AuthResponse = {
  token?: string;
  required2FACode?: boolean;
};

export type Disable2FAResponse = AuthResponse;

export type Enable2FAResponse = {
  token: string;
  recoveryCodes: string[];
};

export type ForgotPasswordResponse = {
  required2FACode: boolean;
};
