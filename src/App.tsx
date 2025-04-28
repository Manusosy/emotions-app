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
import DashboardJournalPage from "@/features/dashboard/pages/JournalPage";
import NotificationsPage from "@/features/dashboard/pages/NotificationsPage";
import AmbassadorNotificationsPage from "@/features/ambassadors/pages/NotificationsPage";
import MoodTrackerPage from "@/features/dashboard/pages/MoodTrackerPage";
import ReportsPage from "@/features/dashboard/pages/ReportsPage";
import Footer from "@/components/layout/Footer";
import ContactBanner from "@/components/layout/ContactBanner";
import Ambassadors from "@/features/ambassadors/pages/Ambassadors";
import AppointmentsPage from "@/features/ambassadors/pages/AppointmentsPage";
import PatientsPage from "@/features/ambassadors/pages/PatientsPage";
import GroupsPage from "@/features/ambassadors/pages/GroupsPage";
import ResourcesPage from "@/features/ambassadors/pages/ResourcesPage";
import DashboardResourcesPage from "@/features/dashboard/pages/ResourcesPage";
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
import JournalEntryPage from "@/features/journal/pages/JournalEntryPage";
import NewJournalEntryPage from "@/features/journal/pages/NewJournalEntryPage";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import HelpCenterPage from "@/features/dashboard/pages/HelpCenterPage";
import MessagesPage from "@/features/dashboard/pages/MessagesPage";
import AmbassadorMessagesPage from "@/features/ambassadors/pages/MessagesPage";
import ScrollToTop from "@/components/layout/ScrollToTop";
import SettingsPage from "@/features/ambassadors/pages/SettingsPage";
import ProfilePage from "@/features/ambassadors/pages/ProfilePage";
import DeleteAccountPage from "@/features/ambassadors/pages/DeleteAccountPage";
import { profileService } from "@/integrations/supabase/services/profile.service";
import { ambassadorService } from "@/integrations/supabase/services/ambassador.service";

// Type definition for UserRole
type UserRole = 'patient' | 'ambassador' | 'admin';

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

// DashboardErrorFallback component to provide context-aware error handling
const DashboardErrorFallback = ({ dashboardType }: { dashboardType: 'patient' | 'ambassador' }) => {
  const navigate = useNavigate();
  const dashboardPath = dashboardType === 'patient' ? '/patient-dashboard' : '/ambassador-dashboard';
  
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-6 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Something went wrong</h2>
        <p className="text-gray-600">
          We encountered an error while loading this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="outline" onClick={() => navigate(dashboardPath)}>
            Return to Dashboard
          </Button>
        </div>
      </div>
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
        // Use direct window.location for consistent behavior and to prevent React Router state issues
        window.location.href = loginPath;
        return;
      }

      // If no specific roles are required or user has required role
      const hasRequiredRole =
        effectiveAllowedRoles.length === 0 || (userRole && effectiveAllowedRoles.includes(userRole as UserRole));

      if (!hasRequiredRole) {
        console.log(
          `User does not have required role. Current role: ${userRole}, required roles:`,
          effectiveAllowedRoles
        );
        // Redirect to appropriate dashboard based on role
        const dashboardPath = getDashboardUrlForRole(userRole);
        // Use direct window.location for consistent behavior
        window.location.href = dashboardPath;
        return;
      }

      // User is authenticated and authorized
      setIsAuthorized(true);
      setHasCheckedAuth(true);
    };

    checkAuth();
  }, [isAuthenticated, userRole, pathname, effectiveAllowedRoles, navigate, isLoading, getDashboardUrlForRole, hasCheckedAuth, isAuthorized]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  // Wrap the children in an ErrorBoundary with the appropriate dashboard path
  const dashboardPath = requiredRole === 'patient' ? '/patient-dashboard' : '/ambassador-dashboard';
  
  return isAuthorized ? (
    <ErrorBoundary dashboardPath={dashboardPath}>
      {children}
    </ErrorBoundary>
  ) : null;
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
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/ambassadors" element={<Ambassadors />} />
              <Route path="/ambassadors/:id" element={<AmbassadorProfile />} />
              <Route path="/booking" element={<BookingPage />} />
              
              <Route path="/resources" element={<Resources />} />
              <Route path="/help-groups" element={<HelpGroups />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/data-protection" element={<DataProtection />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/about" element={<About />} />
              
              {/* Ambassador Dashboard Routes */}
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
              <Route path="/ambassador-dashboard/patients" element={
                <ProtectedRoute requiredRole="ambassador">
                  <PatientsPage />
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
              <Route path="/ambassador-dashboard/messages" element={
                <ProtectedRoute requiredRole="ambassador">
                  <AmbassadorMessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/profile" element={
                <ProtectedRoute requiredRole="ambassador">
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/settings" element={
                <ProtectedRoute requiredRole="ambassador">
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/settings/delete-account" element={
                <ProtectedRoute requiredRole="ambassador">
                  <DeleteAccountPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/notifications" element={
                <ProtectedRoute requiredRole="ambassador">
                  <AmbassadorNotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="/ambassador-dashboard/*" element={
                <ProtectedRoute requiredRole="ambassador">
                  <NotFound />
                </ProtectedRoute>
              } />
              
              {/* Patient Dashboard Routes */}
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
                  <DashboardJournalPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/journal/:entryId" element={
                <ProtectedRoute requiredRole="patient">
                  <JournalEntryPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/journal/new" element={
                <ProtectedRoute requiredRole="patient">
                  <NewJournalEntryPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/journal/edit/:entryId" element={
                <ProtectedRoute requiredRole="patient">
                  <ComingSoon title="Edit Journal Entry" />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/notifications" element={
                <ProtectedRoute requiredRole="patient">
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/mood-tracker" element={
                <ProtectedRoute requiredRole="patient">
                  <MoodTrackerPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/reports" element={
                <ProtectedRoute requiredRole="patient">
                  <ReportsPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/resources" element={
                <ProtectedRoute requiredRole="patient">
                  <DashboardResourcesPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/messages" element={
                <ProtectedRoute requiredRole="patient">
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard/help" element={
                <ProtectedRoute requiredRole="patient">
                  <HelpCenterPage />
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
              <Route path="/patient-dashboard/*" element={
                <ProtectedRoute requiredRole="patient">
                  <NotFound />
                </ProtectedRoute>
              } />
              
              {/* Fallback 404 route */}
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

  // Run database migrations when the app starts
  useEffect(() => {
    const runMigrations = async () => {
      try {
        // Ensure ambassador_profiles schema
        await profileService.ensureAmbassadorProfileSchema();
        
        // Ensure ambassador dashboard schema
        await ambassadorService.ensureDashboardSchema();
        
        console.log("Database schema checks completed");
      } catch (error) {
        console.error("Error running migrations:", error);
      }
    };
    
    runMigrations();
  }, []);

  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">
              We're sorry, but there was an error loading the application. Please try refreshing the page.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      }
    >
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
