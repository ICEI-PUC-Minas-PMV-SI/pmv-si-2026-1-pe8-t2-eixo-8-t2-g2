import { useNavigate } from 'react-router-dom';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export function useNavigation() {
  const navigate = useNavigate();

  const { LOGIN, DASHBOARD, HOME } = ROUTES;
  return {
    goToHome: () => navigate(HOME),
    goToLogin: () => navigate(LOGIN),
    goToDashboard: () => navigate(DASHBOARD),
    goTo: (path: RoutePath) => navigate(path),
  };
}
