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
import { AmbassadorOnboardingDialog } from "@/features/ambassadors/components/AmbassadorOnboardingDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Navbar from "@/components/layout/Navbar";
import ComingSoon from '@/components/ComingSoon';

const App = () => {
  console.log('App component mounting...');

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Add logging to clearly display onboarding decision process
  const decideOnboardingStatus = (userData, profile) => {
    // Check metadata flags first
    if (userData?.user_metadata?.onboarded === true) {
      console.log('User marked as onboarded in metadata');
      return false;
    }
    
    if (userData?.user_metadata?.has_completed_profile === true) {
      console.log('User has completed profile according to metadata');
      return false;
    }
    
    // If no flags in metadata, check profile data
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

  const checkAmbassadorProfile = async (userId: string) => {
    try {
      console.log('Checking profile for ambassador:', userId);
      
      // First, check user metadata to see if already onboarded
      const { data: { user: userData } } = await supabase.auth.getUser();
      console.log('User metadata check:', userData?.user_metadata);
      
      // Get profile data regardless of metadata state for better logging
      const { data: profile, error } = await supabase
        .from('ambassador_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is expected for new users
        console.error('Error checking ambassador profile:', error);
      }

      console.log('Ambassador profile data:', profile);
      
      // Make decision based on all available data
      const needsOnboarding = decideOnboardingStatus(userData, profile);
      console.log('Final onboarding decision:', needsOnboarding ? 'NEEDS ONBOARDING' : 'ALREADY ONBOARDED');
      
      return needsOnboarding;
    } catch (error) {
      console.error('Error in checkAmbassadorProfile:', error);
      return true; // Return true to show onboarding if there's an error
    }
  };

  // Add a refreshAmbassadorStatus function to reload when needed
  const refreshAmbassadorStatus = async (userId) => {
    if (!userId) return;
    console.log('Refreshing ambassador onboarding status...');
    
    try {
      // Force refresh the user data from Supabase to get latest metadata
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

  // Update the checkUserMetadataDirectly function to be more efficient
  const checkUserMetadataDirectly = async () => {
    if (userRole !== 'ambassador') return;
    
    try {
      console.log('Performing direct metadata check...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found in direct check');
        return;
      }
      
      // Check both metadata flags and profile completion
      const isOnboarded = user.user_metadata?.onboarded === true || 
                         user.user_metadata?.has_completed_profile === true;
                         
      if (isOnboarded) {
        console.log('User is marked as onboarded in metadata, hiding onboarding');
        setShowOnboarding(false);
        return;
      }
      
      // Only check profile if metadata doesn't indicate completion
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

  // Add a function to load ambassador dashboard data
  const loadAmbassadorDashboardData = async (userId) => {
    if (!userId) return null;
    
    try {
      console.log('Loading ambassador dashboard data for:', userId);
      
      // Force refresh the session to get latest metadata
      await supabase.auth.refreshSession();
      
      // Get profile data with a fresh query
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

          // If user is an ambassador, check their profile
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
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (session?.user) {
        console.log('User from auth change:', session.user);
        setUser(session.user);
        
        const userRole = session.user.user_metadata?.role;
        console.log('User role from auth change:', userRole);
        setUserRole(userRole);

        // Check ambassador profile on login or metadata update
        if (userRole === 'ambassador' && 
            (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          console.log('Checking ambassador status after', event);
          await refreshAmbassadorStatus(session.user.id);
        }
        
        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in!');
        }
      } else {
        console.log('No user after auth change');
        setUser(null);
        setUserRole(null);
        setShowOnboarding(false);
        
        if (event === 'SIGNED_OUT') {
          toast.success('Successfully signed out');
        }
      }
    });

    // Cleanup function for any potential memory leaks
    const beforeUnloadHandler = () => {
      console.log('Cleaning up before page unload');
      isMounted = false;
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);

    return () => {
      console.log('Cleaning up auth subscription');
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  // Update the useEffect for metadata checking
  useEffect(() => {
    if (userRole !== 'ambassador' || !showOnboarding) return;
    
    // Initial check
    checkUserMetadataDirectly();
    
    // Set up interval for periodic checks
    const intervalId = setInterval(checkUserMetadataDirectly, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [userRole, showOnboarding]);

  // Add an event handler for storage events to catch auth changes across tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key?.includes('supabase.auth') && userRole === 'ambassador' && showOnboarding) {
        console.log('Auth data changed in storage, checking onboarding status');
        checkUserMetadataDirectly();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userRole, showOnboarding]);

  // Show loading state only during initial load
  if (!isInitialized) {
    console.log('App still initializing...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm rounded-lg p-4 flex items-center space-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-[#0078FF] border-r-transparent"></div>
          <p className="text-sm text-gray-600 font-medium">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show onboarding dialog for ambassadors with incomplete profiles
  if (userRole === 'ambassador') {
    // Always ensure we've made the right decision about whether to show onboarding
    console.log('Ambassador detected, showing onboarding status:', showOnboarding ? 'NEEDS ONBOARDING' : 'ALREADY ONBOARDED');
    
    if (showOnboarding) {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="*" element={
              <>
                <AmbassadorOnboardingDialog />
                <div style={{ display: 'none' }}>
                  <AmbassadorDashboard /> {/* Preloaded but hidden */}
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

  // Check if current path is a dashboard route
  const isDashboardRoute = (pathname: string) => {
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
              
              {/* Coming Soon Pages */}
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
              
              {/* Protected Dashboard Routes */}
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute 
                    element={<PatientDashboard />}
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
