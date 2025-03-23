
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
              
              {/* Ambassador dashboard routes - temporary, no authentication check */}
              <Route path="/ambassador-dashboard" element={<AmbassadorDashboardAlt />} />
              <Route path="/ambassador-dashboard/appointments" element={<AppointmentsPage />} />
              <Route path="/ambassador-dashboard/clients" element={<ClientsPage />} />
              <Route path="/ambassador-dashboard/groups" element={<GroupsPage />} />
              <Route path="/ambassador-dashboard/resources" element={<ResourcesPage />} />
              
              {/* Patient dashboard routes - temporary, no authentication check */}
              <Route path="/patient-dashboard" element={<PatientDashboard />} /> 
              <Route path="/patient-dashboard/appointments" element={<PatientAppointmentsPage />} />
              <Route path="/patient-dashboard/favorites" element={<FavoritesPage />} />
              <Route path="/patient-dashboard/settings" element={<Settings />} />
              <Route path="/patient-dashboard/profile" element={<Profile />} />
              
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
