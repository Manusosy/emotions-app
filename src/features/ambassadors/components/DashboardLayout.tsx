import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Calendar,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  FileText,
  Users,
  Bell,
  BookOpen,
  Activity,
  User,
  Clock,
  Shield,
  BadgeHelp
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PageLoader from "@/components/ui/page-loader";
import AmbassadorHeader from "./AmbassadorHeader";
import AmbassadorSidebar from "./AmbassadorSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, getFullName, isAuthenticated, isLoading, userRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(!useIsMobile());
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for signup credentials first
    const signupCredentials = localStorage.getItem('signupCredentials');
    
    if (signupCredentials) {
      try {
        const credentials = JSON.parse(signupCredentials);
        
        // Sign in using the credentials stored during signup
        const signInUser = async () => {
          try {
            const { error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password
            });
            
            if (error) {
              console.error("Error signing in with stored credentials:", error);
              // Remove invalid credentials
              localStorage.removeItem('signupCredentials');
            } else {
              // Credentials used successfully, remove them
              localStorage.removeItem('signupCredentials');
            }
          } catch (err) {
            console.error("Error signing in with stored credentials:", err);
            localStorage.removeItem('signupCredentials');
          } finally {
            // After attempting to sign in, proceed with normal flow
            setTimeout(() => {
              setIsPageLoading(false);
            }, 300);
          }
        };
        
        signInUser();
        return;
      } catch (e) {
        // If parsing fails, remove the invalid data
        localStorage.removeItem('signupCredentials');
      }
    }
    
    // No signup credentials, proceed with normal auth flow
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          navigate("/login", { replace: true });
        } else if (userRole !== 'ambassador') {
          // Redirect non-ambassadors to their appropriate dashboard
          navigate("/patient-dashboard", { replace: true });
        } else {
          setIsPageLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, navigate, userRole]);

  useEffect(() => {
    setSidebarOpen(!useIsMobile());
  }, [useIsMobile]);

  useEffect(() => {
    console.log("DashboardLayout checking auth - User:", user?.id);
    if (!user?.id) {
      console.log("No authenticated user in DashboardLayout, redirecting to login");
      navigate('/login', { replace: true });
      return;
    }
    
    // Fetch unread notifications and messages count
    const fetchUnreadCounts = async () => {
      if (!user?.id) return;
      
      try {
        // Using Promise.all to make both requests simultaneously
        const [notificationsResponse, messagesResponse] = await Promise.all([
          supabase
            .from('notifications')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('read', false),
          supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('recipient_id', user.id)
            .eq('unread', true)
        ]);

        setUnreadNotifications(notificationsResponse.count || 0);
        setUnreadMessages(messagesResponse.count || 0);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    fetchUnreadCounts();
  }, [user?.id, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const ambassadorNavigation = [
    { 
      section: "Main",
      items: [
        { name: "Overview", href: "/ambassador-dashboard", icon: Home },
        { name: "Appointments", href: "/ambassador-dashboard/appointments", icon: Calendar },
        { name: "Messages", href: "/ambassador-dashboard/messages", icon: MessageSquare },
        { name: "Clients", href: "/ambassador-dashboard/clients", icon: Users },
      ]
    },
    {
      section: "Content",
      items: [
        { name: "Resources", href: "/ambassador-dashboard/resources", icon: FileText },
        { name: "Support Groups", href: "/ambassador-dashboard/groups", icon: BookOpen },
        { name: "Reviews", href: "/ambassador-dashboard/reviews", icon: Heart },
        { name: "Availability", href: "/ambassador-dashboard/availability", icon: Clock },
      ]
    },
    {
      section: "Account",
      items: [
        { name: "Profile", href: "/ambassador-dashboard/profile", icon: User },
        { name: "Settings", href: "/ambassador-dashboard/settings", icon: Settings },
        { name: "Get Help", href: "/contact", icon: BadgeHelp },
      ]
    }
  ];

  if (isPageLoading || isLoading) {
    return <PageLoader text="Loading your ambassador dashboard..." />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AmbassadorSidebar />
      <div className="flex-1">
        <AmbassadorHeader />
        <main className="p-4 md:p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
