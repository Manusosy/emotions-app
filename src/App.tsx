import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MoodTracker from "@/features/mood-tracking/pages/MoodTracker";
import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import NotFound from "./pages/NotFound";
import JournalPage from "@/features/journal/pages/JournalPage";
import Footer from "@/components/layout/Footer";
import ContactBanner from "@/components/layout/ContactBanner";
import Ambassadors from "@/features/ambassadors/pages/Ambassadors";
import AppointmentsPage from "@/features/ambassadors/pages/AppointmentsPage";
import ClientsPage from "@/features/ambassadors/pages/ClientsPage";
import GroupsPage from "@/features/ambassadors/pages/GroupsPage";
import ResourcesPage from "@/features/ambassadors/pages/ResourcesPage";
import BookingPage from "@/features/booking/pages/BookingPage";
import PatientDashboard from "@/features/dashboard/pages/PatientDashboard";
import PatientAppointmentsPage from "@/features/dashboard/pages/AppointmentsPage";
import FavoritesPage from "@/features/dashboard/pages/FavoritesPage";
import Settings from "@/features/dashboard/pages/Settings";
import Profile from "@/features/dashboard/pages/Profile";
import DeleteAccount from "@/features/dashboard/pages/DeleteAccount";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import ComingSoon from '@/components/ComingSoon';
import AmbassadorDashboard from "@/features/dashboard/pages/AmbassadorDashboard";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/app/layout/Header";
import Resources from "@/pages/Resources";
import HelpGroups from "./pages/HelpGroups";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataProtection from "./pages/DataProtection";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import FAQs from "./pages/FAQs";
import About from "./pages/About";
import AmbassadorProfile from "@/features/ambassadors/pages/AmbassadorProfile";
import ReviewsPage from "@/features/ambassadors/pages/ReviewsPage";
import AvailabilityPage from "@/features/ambassadors/pages/AvailabilityPage";
import './styles/App.css';
import { Spinner } from "@/components/ui/spinner";

// Type definition for ProtectedRoute props
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole;
}

const HomePage = () => {
  return (
    <div className="homepage-wrapper relative pb-12">
      <MoodTracker />
    </div>
  );
};

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requiredRole,
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const { isAuthenticated, userRole, isLoading, getDashboardUrlForRole } = useAuth();

  const effectiveAllowedRoles = requiredRole ? [requiredRole] : allowedRoles;

  // Check for stored auth state first
  useEffect(() => {
    // Attempt to get stored auth data from localStorage
    const storedAuthState = localStorage.getItem('auth_state');
    if (storedAuthState) {
      try {
        const { isAuthenticated: storedAuth, userRole: storedRole } = JSON.parse(storedAuthState);
        
        if (storedAuth && storedRole) {
          console.log(`Found stored auth state with role: ${storedRole}`);
          // If the stored role matches our required role, we can bypass the auth check
          const hasRequiredRole = 
            effectiveAllowedRoles.length === 0 || 
            effectiveAllowedRoles.includes(storedRole as UserRole);
            
          if (hasRequiredRole) {
            console.log("User has required role based on stored auth state");
            setIsAuthorized(true);
            setHasCheckedAuth(true);
          }
        }
      } catch (e) {
        console.error("Error parsing stored auth state:", e);
      }
    }
  }, [effectiveAllowedRoles]);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip if we've already authorized based on stored state
      if (hasCheckedAuth && isAuthorized) return;
      
      console.log(
        `Checking auth for path: ${pathname}, isAuthenticated: ${isAuthenticated}, userRole: ${userRole}, allowedRoles:`,
        effectiveAllowedRoles
      );

      // Wait until authentication check is complete
      if (isLoading) return;

      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        const loginPath = `/login?redirect=${encodeURIComponent(pathname)}`;
        setRedirectPath(loginPath);
        setCountdown(1); // Reduced countdown for better UX
        return;
      }

      // If no specific roles are required or user has required role
      const hasRequiredRole =
        effectiveAllowedRoles.length === 0 || (userRole && effectiveAllowedRoles.includes(userRole));

      if (!hasRequiredRole) {
        console.log(
          `User does not have required role. Current role: ${userRole}, required roles:`,
          effectiveAllowedRoles
        );
        // Redirect to appropriate dashboard based on role
        const dashboardPath = getDashboardUrlForRole(userRole);
        setRedirectPath(dashboardPath);
        setCountdown(1); // Reduced countdown for better UX
        return;
      }

      // User is authenticated and authorized
      setIsAuthorized(true);
      setHasCheckedAuth(true);
    };

    checkAuth();
  }, [isAuthenticated, userRole, pathname, effectiveAllowedRoles, navigate, isLoading, getDashboardUrlForRole, hasCheckedAuth, isAuthorized]);

  // Countdown effect
  useEffect(() => {
    if (countdown === null || redirectPath === null) return;
    
    if (countdown === 0) {
      navigate(redirectPath);
      setHasCheckedAuth(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, redirectPath, navigate]);

  if (isLoading || countdown !== null) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <Spinner size="lg" className="mb-4" />
        {countdown !== null && redirectPath && (
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Please wait</p>
            <p>Redirecting to dashboard in {countdown} seconds...</p>
          </div>
        )}
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};

const AppContent = () => {
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isAnchor = target.tagName === 'A' || target.closest('a');
      if (isAnchor) {
        console.log("Link clicked:", target);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    console.log("Current location:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const pathname = location.pathname;
    const isDashboardPage = pathname.includes('dashboard') || 
                          pathname.includes('admin') ||
                          pathname === '/ambassador-dashboard' ||
                          pathname.startsWith('/ambassador-dashboard/');
    
    setShowHeaderFooter(!isDashboardPage);
    console.log('Current path:', pathname, 'Show header/footer:', !isDashboardPage);
  }, [location.pathname]);

  const shouldShowContactBanner = location.pathname === "/" || 
                                 location.pathname === "/contact" || 
                                 location.pathname === "/privacy" ||
                                 location.pathname === "/data-protection" ||
                                 location.pathname === "/terms" ||
                                 location.pathname === "/faqs" ||
                                 location.pathname === "/about";

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="flex flex-col min-h-screen max-w-[100vw] overflow-x-hidden">
          {showHeaderFooter && <Navbar />}
          <div className="flex-grow">
            <Routes key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/ambassadors" element={<Ambassadors />} />
              <Route path="/ambassadors/:id" element={<AmbassadorProfile />} />
              <Route path="/booking" element={<BookingPage />} />
              
              <Route 
                path="/resources" 
                element={<Resources />}
              />
              <Route 
                path="/help-groups" 
                element={<HelpGroups />}
              />
              <Route 
                path="/privacy" 
                element={<PrivacyPolicy />}
              />
              
              <Route 
                path="/data-protection" 
                element={<DataProtection />}
              />
              
              <Route 
                path="/terms" 
                element={<TermsOfService />}
              />
              
              <Route 
                path="/contact" 
                element={<Contact />}
              />
              
              <Route 
                path="/faqs" 
                element={<FAQs />}
              />
              
              <Route 
                path="/about" 
                element={<About />}
              />
              
              <Route path="/ambassador-dashboard" element={
                <ProtectedRoute requiredRole="ambassador">
                  <AmbassadorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/appointments" element={
                <ProtectedRoute requiredRole="ambassador">
                  <AppointmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/clients" element={
                <ProtectedRoute requiredRole="ambassador">
                  <ClientsPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/groups" element={
                <ProtectedRoute requiredRole="ambassador">
                  <GroupsPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/resources" element={
                <ProtectedRoute requiredRole="ambassador">
                  <ResourcesPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/reviews" element={
                <ProtectedRoute requiredRole="ambassador">
                  <ReviewsPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/availability" element={
                <ProtectedRoute requiredRole="ambassador">
                  <AvailabilityPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/profile" element={
                <ProtectedRoute requiredRole="ambassador">
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/settings" element={
                <ProtectedRoute requiredRole="ambassador">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/settings/delete-account" element={
                <ProtectedRoute requiredRole="ambassador">
                  <DeleteAccount />
                </ProtectedRoute>
              } />
              
              <Route path="/patient-dashboard" element={
                <ProtectedRoute requiredRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              } /> 
              <Route path="/patient-dashboard/appointments" element={
                <ProtectedRoute requiredRole="patient">
                  <PatientAppointmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/favorites" element={
                <ProtectedRoute requiredRole="patient">
                  <FavoritesPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/journal" element={
                <ProtectedRoute requiredRole="patient">
                  <JournalPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/settings" element={
                <ProtectedRoute requiredRole="patient">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/settings/delete-account" element={
                <ProtectedRoute requiredRole="patient">
                  <DeleteAccount />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/profile" element={
                <ProtectedRoute requiredRole="patient">
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          
          {showHeaderFooter && (
            <>
              {shouldShowContactBanner && (
                <div className="mb-12">
                  <ContactBanner />
                </div>
              )}
              <Footer />
            </>
          )}
        </div>
      </TooltipProvider>
    </>
  );
};

const App = () => {
  console.log('App component mounting...');

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
