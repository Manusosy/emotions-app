import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localAuthState, setLocalAuthState] = useState({ isAuthenticated: false, userRole: null });
  const { isAuthenticated, userRole, logout, getDashboardUrlForRole } = useAuth();

  // Check localStorage for auth state on mount and when auth context changes
  useEffect(() => {
    const checkLocalStorage = () => {
      const storedAuthState = localStorage.getItem('auth_state');
      if (storedAuthState) {
        try {
          const { isAuthenticated, userRole } = JSON.parse(storedAuthState);
          setLocalAuthState({ isAuthenticated, userRole });
        } catch (e) {
          console.error("Error parsing stored auth state:", e);
          setLocalAuthState({ isAuthenticated: false, userRole: null });
        }
      } else {
        setLocalAuthState({ isAuthenticated: false, userRole: null });
      }
    };
    
    checkLocalStorage();
    
    // Listen for storage events (if another tab changes localStorage)
    window.addEventListener('storage', checkLocalStorage);
    return () => window.removeEventListener('storage', checkLocalStorage);
  }, [isAuthenticated, userRole]);

  // Combine context and localStorage auth state for most reliable determination
  const effectiveIsAuthenticated = isAuthenticated || localAuthState.isAuthenticated;
  const effectiveUserRole = userRole || localAuthState.userRole;

  const handleLogout = async () => {
    try {
      await logout();
      // After logout, let the auth state handle the redirect
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const dashboardUrl = effectiveUserRole ? getDashboardUrlForRole(effectiveUserRole) : '/';

  return (
    <nav className="bg-[#0078FF] text-white relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <img 
              src="/images/emotions-logo.svg" 
              alt="Emotions Logo" 
              className="h-7 md:h-9 relative"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-1 bg-blue-600/30 backdrop-blur-sm rounded-full px-2 py-1.5">
              <Link to="/" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Home
              </Link>
              <Link to="/journal" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Journal
              </Link>
              <Link to="/ambassadors" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Mental Health Ambassadors
              </Link>
              <Link to="/resources" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Resource Center
              </Link>
              <Link to="/help-groups" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Help Groups
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {effectiveIsAuthenticated ? (
              <>
                <Link to={dashboardUrl}>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-[#fda802] rounded-full px-6 font-medium transition-all"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-white hover:bg-[#fda802] rounded-full px-6 font-medium transition-all"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-[#fda802] rounded-full px-6 font-medium transition-all"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    className="bg-white text-[#0078FF] hover:bg-[#fda802] hover:text-white rounded-full px-6 font-medium shadow-sm shadow-blue-600/20 transition-all"
                  >
                    Signup
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-blue-600/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link to="/" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Home
            </Link>
            <Link to="/journal" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Journal
            </Link>
            <Link to="/ambassadors" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Mental Health Ambassadors
            </Link>
            <Link to="/resources" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Resource Center
            </Link>
            <Link to="/help-groups" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Help Groups
            </Link>
            
            {/* Mobile Menu Auth Buttons */}
            <div className="py-2 border-t border-blue-600/20">
              {effectiveIsAuthenticated ? (
                <>
                  <Link to={dashboardUrl} className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
                    <span className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors"
                  >
                    <span className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
