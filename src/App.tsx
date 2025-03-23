
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
import AmbassadorDashboardAlt from "@/features/ambassadors/pages/AmbassadorDashboard";
import { useAuth } from "@/hooks/use-auth";

// Protected route component that checks authentication and role
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
    // Optional: show loading indicator
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard if role doesn't match
    console.log(`Role mismatch: user has ${userRole}, requires ${requiredRole}`);
    toast.error("You don't have permission to access this page");
    
    if (userRole === 'ambassador') {
      return <Navigate to="/ambassador-dashboard" replace />;
    } else if (userRole === 'patient') {
      return <Navigate to="/patient-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

// Use a component approach to ensure Router is available before using hooks that depend on it
const AppContent = () => {
  const [showFooter, setShowFooter] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const shouldShowFooter = !pathname.includes('dashboard') && 
                            !pathname.includes('ambassador') && 
                            !pathname.includes('admin') &&
                            !pathname.includes('booking');
    setShowFooter(shouldShowFooter);
    
    // Debug log
    console.log('Current path:', pathname);
  }, [location.pathname]);

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
              
              {/* Ambassador dashboard routes with role protection */}
              <Route path="/ambassador-dashboard" element={
                <ProtectedRoute requiredRole="ambassador">
                  <AmbassadorDashboardAlt />
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
              
              {/* Patient dashboard routes with role protection */}
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
