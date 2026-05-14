export type AuthData = {
  email: string;
  password: string;
};

export type AuthGoogleData = { token: string };

export type AuthPermission = 'admin' | 'customer';

export type AuthResponse = {
  token: string;
};

export type Enable2FAResponse = {
  token: string;
  recoveryCodes: string[];
}

export type Disable2FAResponse = {
  token: string;
}