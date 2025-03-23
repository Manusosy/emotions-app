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
import AmbassadorDashboard from "@/features/dashboard/pages/AmbassadorDashboard";
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

const App = () => {
  console.log('App component mounting...');

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const decideOnboardingStatus = (userData, profile) => {
    if (userData?.user_metadata?.onboarded === true) {
      console.log('User marked as onboarded in metadata');
      return false;
    }
    
    if (userData?.user_metadata?.has_completed_profile === true) {
      console.log('User has completed profile according to metadata');
      return false;
    }
    
    if (!profile) {
      console.log('No profile data found');
      return true;
    }
    
    const isIncomplete = !profile.full_name || 
      !profile.bio || 
      !profile.speciality || 
      !profile.avatar_url;
      
    console.log('Profile completeness check:', 
      {
        'Has full_name': !!profile.full_name,
        'Has bio': !!profile.bio,
        'Has speciality': !!profile.speciality,
        'Has avatar': !!profile.avatar_url
      }
    );
    
    return isIncomplete;
  }

  const checkAmbassadorProfile = async (userId) => {
    try {
      console.log('Checking profile for ambassador:', userId);
      
      const { data: { user: userData } } = await supabase.auth.getUser();
      console.log('User metadata check:', userData?.user_metadata);
      
      const { data: profile, error } = await supabase
        .from('ambassador_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking ambassador profile:', error);
      }

      console.log('Ambassador profile data:', profile);
      
      const needsOnboarding = decideOnboardingStatus(userData, profile);
      console.log('Final onboarding decision:', needsOnboarding ? 'NEEDS ONBOARDING' : 'ALREADY ONBOARDED');
      
      return needsOnboarding;
    } catch (error) {
      console.error('Error in checkAmbassadorProfile:', error);
      return true;
    }
  };

  const refreshAmbassadorStatus = async (userId) => {
    if (!userId) return;
    console.log('Refreshing ambassador onboarding status...');
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      if (data?.user?.user_metadata?.onboarded === true || 
          data?.user?.user_metadata?.has_completed_profile === true) {
        console.log('User is marked as onboarded in refreshed metadata');
        setShowOnboarding(false);
        return;
      }
      
      const needsOnboarding = await checkAmbassadorProfile(userId);
      console.log('Updated onboarding status:', needsOnboarding ? 'needs onboarding' : 'already onboarded');
      setShowOnboarding(needsOnboarding);
    } catch (error) {
      console.error('Error refreshing ambassador status:', error);
    }
  };

  const checkUserMetadataDirectly = async () => {
    if (userRole !== 'ambassador') return;
    
    try {
      console.log('Performing direct metadata check...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found in direct check');
        return;
      }
      
      const isOnboarded = user.user_metadata?.onboarded === true || 
                         user.user_metadata?.has_completed_profile === true;
                         
      if (isOnboarded) {
        console.log('User is marked as onboarded in metadata, hiding onboarding');
        setShowOnboarding(false);
        return;
      }
      
      const { data: profile } = await supabase
        .from('ambassador_profiles')
        .select('full_name, bio, speciality, avatar_url')
        .eq('id', user.id)
        .single();
        
      const hasCompleteProfile = profile && 
                               profile.full_name && 
                               profile.bio && 
                               profile.speciality;
                               
      if (hasCompleteProfile) {
        console.log('Profile is complete, hiding onboarding');
        setShowOnboarding(false);
      }
    } catch (error) {
      console.error('Error in direct metadata check:', error);
    }
  };

  const loadAmbassadorDashboardData = async (userId) => {
    if (!userId) return null;
    
    try {
      console.log('Loading ambassador dashboard data for:', userId);
      
      await supabase.auth.refreshSession();
      
      const { data: profile, error } = await supabase
        .from('ambassador_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error loading ambassador profile:', error);
        return null;
      }
      
      console.log('Loaded fresh ambassador profile:', profile);
      return profile;
    } catch (error) {
      console.error('Error in loadAmbassadorDashboardData:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('App useEffect running...');
    let isMounted = true;
    
    const checkInitialSession = async () => {
      try {
        console.log('Checking initial Supabase session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check result:', session);
        
        if (session?.user && isMounted) {
          console.log('User found in session:', session.user);
          setUser(session.user);
          
          const userRole = session.user.user_metadata?.role;
          console.log('User role from metadata:', userRole);
          setUserRole(userRole);

          if (userRole === 'ambassador') {
            await refreshAmbassadorStatus(session.user.id);
          }
          
          toast.success(`Welcome back!`);
        } else {
          console.log('No authenticated user found');
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast.error('Authentication error. Please try again.');
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (session?.user && isMounted) {
        setUser(session.user);
        const userRole = session.user.user_metadata?.role;
        setUserRole(userRole);
        
        if (userRole === 'ambassador') {
          await refreshAmbassadorStatus(session.user.id);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userRole === 'ambassador') {
      checkUserMetadataDirectly();
    }
  }, [userRole]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (userRole === 'ambassador') {
        checkUserMetadataDirectly();
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [userRole]);

  if (userRole === 'ambassador') {
    console.log('Ambassador detected, showing onboarding status:', showOnboarding ? 'NEEDS ONBOARDING' : 'ALREADY ONBOARDED');
    
    if (showOnboarding) {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="*" element={
              <>
                <AmbassadorOnboardingDialog />
                <div style={{ display: 'none' }}>
                  <AmbassadorDashboard />
                </div>
              </>
            } />
          </Routes>
        </BrowserRouter>
      );
    }
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

  const isDashboardRoute = (pathname) => {
    return pathname.includes('dashboard') || 
           pathname.includes('ambassador') || 
           pathname.includes('admin') ||
           pathname.includes('booking');
  };

  const showFooter = !isDashboardRoute(window.location.pathname);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
