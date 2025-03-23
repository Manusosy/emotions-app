
// Placeholder for authentication hooks
// This file provides mock authentication methods and states

export const useAuth = () => {
  return {
    user: null,
    userRole: null,
    isLoading: false,
    isAuthenticating: false,
    isAuthenticated: false,
    logout: async () => {
      console.log('Logout called - placeholder implementation');
      return Promise.resolve();
    },
    getFullName: () => '',
    getDashboardUrl: () => '/',
    getDashboardUrlForRole: () => '/',
    setIsAuthenticating: () => {}
  };
};

export const useAuthState = useAuth;
export default useAuth;
