// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, isAdmin } from '@/utils/auth';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    const adminStatus = isAdmin();
    
    setIsAuthenticated(!!token);
    setIsAdminUser(adminStatus);

    // Optional: Validate token with backend
    const validateToken = async () => {
      if (token) {
        try {
          const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            // Token is invalid
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
            router.push('/admin/login');
          }
        } catch (error) {
          console.error('Token validation error');
        }
      }
    };

    validateToken();
  }, []);

  return { 
    isAuthenticated, 
    isAdminUser 
  };
};