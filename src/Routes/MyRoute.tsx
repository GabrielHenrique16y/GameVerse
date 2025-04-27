import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import MyRouteProps from '../interface/RouterProps';

export default function MyRoute({ children, IsClosed = false }: MyRouteProps) {
  const { user } = useAuth(); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [user]);

  if (loading) {
    return null;
  }

  if (IsClosed && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
