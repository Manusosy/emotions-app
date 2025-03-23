
// Authentication hooks with properly structured exports
import { useState } from 'react';

export const useAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Mock user data for development
  const mockUser = {
    id: 'mock-user-id',
    email: 'user@example.com',
    user_metadata: {
      avatar_url: '',
      full_name: 'Test User'
    }
  };
  
  return {
    user: mockUser,
    userRole: 'ambassador',
    isLoading: false,
    isAuthenticating: isAuthenticating,
    isAuthenticated: true,
    logout: async () => {
      console.log('Logout called - placeholder implementation');
      return Promise.resolve();
    },
    getFullName: () => mockUser.user_metadata.full_name || 'User',
    getDashboardUrl: () => '/ambassador-dashboard',
    getDashboardUrlForRole: () => '/ambassador-dashboard',
    setIsAuthenticating: (value: boolean) => setIsAuthenticating(value)
  };
};

export const useAuthState = useAuth;
export default useAuth;
