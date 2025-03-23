
// Temporary placeholder for authentication hooks
// This will be reimplemented in a new approach

export const useAuth = () => {
  return {
    user: null,
    userRole: null,
    isLoading: false,
    isAuthenticating: false,
    isAuthenticated: false,
    logout: async () => {},
    getFullName: () => '',
    getDashboardUrl: () => '/',
    getDashboardUrlForRole: () => '/',
    setIsAuthenticating: () => {}
  };
};

export const useAuthState = useAuth;
export default useAuth;
