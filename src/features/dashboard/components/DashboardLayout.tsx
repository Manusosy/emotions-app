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
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import PageLoader from "@/components/ui/page-loader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const patientNavigation = [
  { 
    section: "Main",
    items: [
      { name: "Overview", href: "/patient-dashboard", icon: Home },
      { name: "Appointments", href: "/patient-dashboard/appointments", icon: Calendar },
      { name: "Messages", href: "/patient-dashboard/messages", icon: MessageSquare },
      { name: "Journal", href: "/patient-dashboard/journal", icon: BookOpen },
    ]
  },
  {
    section: "Personal",
    items: [
      { name: "Favorites", href: "/patient-dashboard/favorites", icon: Heart },
      { 
        name: "Profile", 
        href: "/patient-dashboard/profile", 
        icon: User,
        className: "bg-blue-50 text-blue-600 hover:bg-blue-100" 
      },
      { name: "Settings", href: "/patient-dashboard/settings", icon: Settings },
      { name: "Get Help", href: "/contact", icon: BadgeHelp },
    ]
  }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

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
        } else {
          setIsPageLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    // Fetch unread notifications and messages count
    const fetchUnreadCounts = async () => {
      try {
        if (!user?.id) return;
        
        const [notificationsResponse, messagesResponse] = await Promise.all([
          supabase
            .from('notifications')
            .select('id', { count: 'exact' })
            .eq('user_id', user?.id)
            .eq('read', false),
          supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('recipient_id', user?.id)
            .eq('unread', true)
        ]);

        setUnreadNotifications(notificationsResponse.count || 0);
        setUnreadMessages(messagesResponse.count || 0);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    if (user?.id) {
      fetchUnreadCounts();
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  if (isPageLoading || isLoading) {
    return <PageLoader text="Loading your dashboard..." />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-4 md:p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
