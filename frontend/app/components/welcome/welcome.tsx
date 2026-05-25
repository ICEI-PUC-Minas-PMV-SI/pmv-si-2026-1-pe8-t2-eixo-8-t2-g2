import { Navigate } from 'react-router-dom';

export function Welcome() {
  return <Navigate to="/catalogo" replace />;
}
