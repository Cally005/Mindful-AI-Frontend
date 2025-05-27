// utils/auth.ts

/**
 * Get authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  };
  
  /**
   * Get user information from localStorage
   * @returns The user object or null if not found
   */
  export const getUserInfo = () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  };
  
  /**
   * Check if the current user is an admin
   * @returns True if user has admin privileges, false otherwise
   */
  export const isAdmin = () => {
    const user = getUserInfo();
    return user?.user_metadata?.is_admin === true || 
           user?.app_metadata?.role === 'admin';
  };
  
  /**
   * Store authentication token in localStorage
   * @param token The token to store
   */
  export const setAuthToken = (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  };
  
  /**
   * Store user info in localStorage
   * @param user The user object to store
   */
  export const setUserInfo = (user: any): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  };
  
  /**
   * Check if user is authenticated
   * @returns True if user has an auth token, false otherwise
   */
  export const isAuthenticated = (): boolean => {
    return getAuthToken() !== null;
  };
  
  /**
   * Get authorization headers for API requests
   * @returns Object containing authorization header if token exists
   */
  export const getAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };
  
  /**
   * Log the user out by removing all authentication data
   * and redirecting to the login page
   */
  export const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('session');
      // Redirect to login page
      window.location.href = '/admin/login';
    }
  };








// // utils/auth.ts
// export const getAuthToken = () => {
//     return localStorage.getItem('authToken');
//   };
  
//   export const getUserInfo = () => {
//     const user = localStorage.getItem('user');
//     return user ? JSON.parse(user) : null;
//   };
  
//   export const isAdmin = () => {
//     const user = getUserInfo();
//     return user?.user_metadata?.is_admin === true || 
//            user?.app_metadata?.role === 'admin';
//   };
  
//   export const logout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('user');
//     localStorage.removeItem('session');
//     // Redirect to login page
//     window.location.href = '/admin/login';
//   };