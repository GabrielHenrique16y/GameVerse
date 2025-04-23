import { Navigate, useLocation } from 'react-router-dom';
import MyRouteProps from '../interface/RouterProps';

export default function MyRoute({ children, IsClosed = false }: MyRouteProps) {
  const isLoggedIn = false;
  const location = useLocation();

  if (IsClosed && !isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{ prevPath: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}
