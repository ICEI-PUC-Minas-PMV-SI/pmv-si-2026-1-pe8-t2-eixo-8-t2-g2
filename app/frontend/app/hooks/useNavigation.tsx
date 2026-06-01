import { useNavigate } from 'react-router-dom';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/app/dashboard',
  CART: '/app/cart',
  VALIDATE2FA: '/validate-2fa',
  RESET_PASSWORD: '/reset-password',
  SCHEDULERS: '/app/scheduler',
  SETTINGS: '/app/settings',
  REVIEW: '/app/review',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export type Validate2FAParams = {
  email: string;
};

export type ResetPasswordParams = {
  token: string;
};

export type LoginParams = {
  email?: string;
  required2FA?: boolean;
};

export function useNavigation() {
  const navigate = useNavigate();

  const {
    LOGIN,
    DASHBOARD,
    HOME,
    CART,
    VALIDATE2FA,
    RESET_PASSWORD,
    SCHEDULERS,
    SETTINGS,
    REVIEW,
  } = ROUTES;
  return {
    goToSchedulers: () => navigate(SCHEDULERS),
    goToSettings: () => navigate(SETTINGS),
    goToHome: () => navigate(HOME),
    goToLogin: (state?: LoginParams) => navigate(LOGIN, { state: state || null }),
    goToDashboard: () => navigate(DASHBOARD),
    goToCart: () => navigate(CART),
    goToReview: () => navigate(REVIEW),
    goToResetPassword: (state: ResetPasswordParams) =>
      navigate(RESET_PASSWORD, { state }),
    goToValidate2FA: (state: Validate2FAParams) => navigate(VALIDATE2FA, { state }),
    goTo: (path: RoutePath) => navigate(path),
  };
}
