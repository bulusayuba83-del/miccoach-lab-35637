import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, checkAdminStatus } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(requireAdmin);

  useEffect(() => {
    const checkAdmin = async () => {
      if (requireAdmin && user) {
        const adminStatus = await checkAdminStatus();
        setIsAdmin(adminStatus);
      }
      setCheckingAdmin(false);
    };

    checkAdmin();
  }, [user, requireAdmin]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/client/dashboard" replace />;
  }

  return <>{children}</>;
};
