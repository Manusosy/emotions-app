import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MoodTracker from "@/features/mood-tracking/pages/MoodTracker";
import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
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

// HomePage component that properly wraps the MoodTracker component
const HomePage = () => {
  return (
    <div className="homepage-wrapper relative pb-12">
      <MoodTracker />
    </div>
  );
};

const ProtectedRoute = ({ 
  children, 
  requiredRole,
}: { 
  children: React.ReactNode; 
  requiredRole?: 'patient' | 'ambassador' | 'admin';
}) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log(`ProtectedRoute check - authenticated: ${isAuthenticated}, role: ${userRole}, required: ${requiredRole}`);
  }, [isAuthenticated, userRole, requiredRole]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Role mismatch: user has ${userRole}, requires ${requiredRole}`);
    toast.error("You don't have permission to access this page");
    
    if (userRole === 'ambassador') {
      return <Navigate to="/ambassador-dashboard" replace />;
    } else if (userRole === 'patient') {
      return <Navigate to="/patient-dashboard" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  const location = useLocation();

  // Debug global click events
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

  // Debug routing to ensure proper navigation
  useEffect(() => {
    console.log("Current location:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const pathname = location.pathname;
    // Don't show header/footer on dashboard pages
    const isDashboardPage = pathname.includes('dashboard') || 
                          pathname.includes('admin') ||
                          pathname.includes('booking') ||
                          pathname === '/ambassador-dashboard' ||
                          pathname.startsWith('/ambassador-dashboard/');
    
    setShowHeaderFooter(!isDashboardPage);
    console.log('Current path:', pathname, 'Show header/footer:', !isDashboardPage);
  }, [location.pathname]);

  // Determine if the contact banner should be shown based on the current route
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
            {/* We're using a key based on the path to force a complete re-render on route changes */}
            <Routes key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/ambassadors" element={<Ambassadors />} />
              <Route path="/booking" element={<BookingPage />} />
              
              <Route 
                path="/therapists" 
                element={
                  <ComingSoon 
                    title="Find Your Perfect Therapist" 
                    description="We're building a network of qualified therapists to provide you with professional mental health support. This feature will be available soon!"
                  />
                } 
              />
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
                path="/therapy" 
                element={
                  <ComingSoon 
                    title="Therapy Services" 
                    description="We're working on expanding our therapy services. This feature will be available soon to connect you with qualified therapists who can provide personalized support for your mental health journey."
                  />
                } 
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
              <Route path="/patient-dashboard/settings" element={
                <ProtectedRoute requiredRole="patient">
                  <Settings />
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
