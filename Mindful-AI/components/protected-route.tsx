// components/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {useAuth } from '../hooks/use-auths';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const router = useRouter();
  const { isAuthenticated, isAdminUser } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    if (adminOnly && !isAdminUser) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, isAdminUser, adminOnly]);

  if (!isAuthenticated || (adminOnly && !isAdminUser)) {
    return null;
  }

  return <>{children}</>;
};