export type AuthData = {
  email: string;
  password: string;
};

export type AuthGoogleData = { token: string };

export type AuthPermission = 'admin' | 'customer';

export type AuthResponse = {
  token: string;
};
