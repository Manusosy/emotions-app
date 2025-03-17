
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
import AmbassadorDashboard from "@/features/ambassadors/pages/AmbassadorDashboard";
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

const App = () => {
  console.log('App component mounting...');

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('App useEffect running...');
    
    // Initial session check
    const checkInitialSession = async () => {
      try {
        console.log('Checking initial Supabase session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check result:', session);
        
        if (session?.user) {
          console.log('User found in session:', session.user);
          setUser(session.user);
          
          const userRole = session.user.user_metadata?.role;
          console.log('User role from metadata:', userRole);
          setUserRole(userRole);
          
          toast.success(`Welcome back!`);
        } else {
          console.log('No authenticated user found');
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast.error('Authentication error. Please try again.');
      } finally {
        console.log('Setting initialization complete');
        setIsInitialized(true);
      }
    };

    checkInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      
      // Update state based on auth change
      if (session?.user) {
        console.log('User from auth change:', session.user);
        setUser(session.user);
        
        const userRole = session.user.user_metadata?.role;
        console.log('User role from auth change:', userRole);
        setUserRole(userRole);
        
        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in!');
        }
      } else {
        console.log('No user after auth change');
        setUser(null);
        setUserRole(null);
        
        if (event === 'SIGNED_OUT') {
          toast.success('Successfully signed out');
        }
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  if (!isInitialized) {
    console.log('App still initializing...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }

  console.log('App rendering with user:', user, 'and role:', userRole);

  const ProtectedRoute = ({ element, allowedRoles = [], redirectTo = "/login" }) => {
    console.log('Protected route check - User:', !!user, 'Required roles:', allowedRoles, 'User role:', userRole);
    
    if (!user) {
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

  // Check if current path is a dashboard route
  const isDashboardRoute = (pathname: string) => {
    return pathname.includes('dashboard');
  };

  const showFooter = !isDashboardRoute(window.location.pathname);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen max-w-[100vw] overflow-x-hidden">
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<MoodTracker />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/ambassadors" element={<Ambassadors />} />
              <Route path="/booking" element={<BookingPage />} />
              
              {/* Patient Dashboard Routes */}
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
                path="/patient-dashboard/profile" 
                element={
                  <ProtectedRoute 
                    element={<Profile />} 
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
                    allowedRoles={["patient"]} 
                  />
                } 
              />
              
              {/* Ambassador Dashboard Routes */}
              <Route 
                path="/ambassador-dashboard" 
                element={
                  <ProtectedRoute 
                    element={<AmbassadorDashboard />} 
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
              <Route 
                path="/ambassador-dashboard/profile" 
                element={
                  <ProtectedRoute 
                    element={<Profile />} 
                    allowedRoles={["ambassador"]} 
                  />
                } 
              />
              <Route 
                path="/ambassador-dashboard/settings" 
                element={
                  <ProtectedRoute 
                    element={<Settings />} 
                    allowedRoles={["ambassador"]} 
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
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
