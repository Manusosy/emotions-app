
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AmbassadorOnboardingDialog } from "@/features/ambassadors/components/AmbassadorOnboardingDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Navbar from "@/components/layout/Navbar";
import ComingSoon from '@/components/ComingSoon';
import AmbassadorDashboard from "@/features/dashboard/pages/AmbassadorDashboard";
import AmbassadorDashboardAlt from "@/features/ambassadors/pages/AmbassadorDashboard";
import { useAuth } from "@/hooks/use-auth";

// Use a component approach to ensure Router is available before using hooks that depend on it
const AppContent = () => {
  const { user, userRole, isLoading, isAuthenticated, getDashboardUrl } = useAuth();
  const [showFooter, setShowFooter] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = window.location.pathname;
    const shouldShowFooter = !pathname.includes('dashboard') && 
                            !pathname.includes('ambassador') && 
                            !pathname.includes('admin') &&
                            !pathname.includes('booking');
    setShowFooter(shouldShowFooter);
    
    // Debug log
    console.log('Current path:', pathname, 'User authenticated:', isAuthenticated, 'User role:', userRole);
    
    // Handle the case where user is authenticated but trying to access 404 page
    if (isAuthenticated && (pathname === '/patient-dashboard' || pathname === '/ambassador-dashboard')) {
      console.log('Authenticated user accessing dashboard at', pathname);
    }
  }, [isAuthenticated, userRole]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const ProtectedRoute = ({ element, allowedRoles = [], redirectTo = "/login" }) => {
    console.log('Protected route check - User:', !!user, 'Required roles:', allowedRoles, 'User role:', userRole);
    
    if (!isAuthenticated) {
      console.log('No authenticated user, redirecting to:', redirectTo);
      return <Navigate to={redirectTo} replace />;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      console.log('User role not allowed, redirecting to home');
      return <Navigate to="/" replace />;
    }
    
    console.log('Access granted to protected route');
    return element;
  };

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="flex flex-col min-h-screen max-w-[100vw] overflow-x-hidden">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<MoodTracker />} />
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
                element={
                  <ComingSoon 
                    title="Mental Health Resources" 
                    description="A comprehensive library of mental health resources, articles, and self-help materials is coming soon to support your well-being journey."
                  />
                } 
              />
              <Route 
                path="/help-groups" 
                element={
                  <ComingSoon 
                    title="Support Groups" 
                    description="Connect with others who share similar experiences in our moderated support groups. Join the waiting list to be notified when this feature launches!"
                  />
                } 
              />
              
              {/* Ambassador dashboard routes */}
              <Route 
                path="/ambassador-dashboard" 
                element={
                  <ProtectedRoute 
                    element={<AmbassadorDashboardAlt />}
                    allowedRoles={["ambassador"]}
                  />
                } 
              />
              <Route 
                path="/ambassador-dashboard/appointments" 
                element={
                  <ProtectedRoute 
                    element={<AppointmentsPage />}
                    allowedRoles={["ambassador"]}
                  />
                } 
              />
              <Route 
                path="/ambassador-dashboard/clients" 
                element={
                  <ProtectedRoute 
                    element={<ClientsPage />}
                    allowedRoles={["ambassador"]}
                  />
                } 
              />
              <Route 
                path="/ambassador-dashboard/groups" 
                element={
                  <ProtectedRoute 
                    element={<GroupsPage />}
                    allowedRoles={["ambassador"]}
                  />
                } 
              />
              <Route 
                path="/ambassador-dashboard/resources" 
                element={
                  <ProtectedRoute 
                    element={<ResourcesPage />}
                    allowedRoles={["ambassador"]}
                  />
                } 
              />
              
              {/* Patient dashboard routes */}
              <Route 
                path="/patient-dashboard" 
                element={
                  <ProtectedRoute 
                    element={<PatientDashboard />}
                    allowedRoles={["patient"]}
                  />
                } 
              />
              <Route 
                path="/patient-dashboard/appointments" 
                element={
                  <ProtectedRoute 
                    element={<PatientAppointmentsPage />}
                    allowedRoles={["patient"]}
                  />
                } 
              />
              <Route 
                path="/patient-dashboard/favorites" 
                element={
                  <ProtectedRoute 
                    element={<FavoritesPage />}
                    allowedRoles={["patient"]}
                  />
                } 
              />
              <Route 
                path="/patient-dashboard/settings" 
                element={
                  <ProtectedRoute 
                    element={<Settings />}
                    allowedRoles={["patient", "ambassador"]}
                  />
                } 
              />
              <Route 
                path="/patient-dashboard/profile" 
                element={
                  <ProtectedRoute 
                    element={<Profile />}
                    allowedRoles={["patient", "ambassador"]}
                  />
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          
          {showFooter && (
            <>
              <div className="mb-12">
                <ContactBanner />
              </div>
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
