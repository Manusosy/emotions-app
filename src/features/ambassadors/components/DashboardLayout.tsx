
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useAuth } from "@/hooks/use-auth"; // Fixed import path from useAuth to use-auth
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, logout, getFullName } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [window.location.pathname]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    console.log("DashboardLayout checking auth - User:", user?.id);
    if (!user?.id) {
      console.log("No authenticated user in DashboardLayout, redirecting to login");
      navigate('/login');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar Container with Padding */}
      <div className="px-4 py-4 sm:px-6">
        {/* Header with rounded corners and contained width */}
        <div className="sticky top-4 z-40 mx-auto rounded-2xl bg-blue-600 px-4 py-3 shadow-lg sm:px-6 max-w-[98%]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:bg-blue-500/50"
              >
                <span className="sr-only">Toggle sidebar</span>
                {sidebarOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </Button>
              <Link to="/" className="flex items-center">
                <img
                  src="/lovable-uploads/03038be2-2146-4f36-a685-7b7719df9caa.png"
                  alt="Logo"
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-blue-500/50"
                onClick={() => navigate('/ambassador-dashboard/notifications')}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-blue-500/50"
                onClick={() => navigate('/ambassador-dashboard/messages')}
              >
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
              <Avatar 
                className="h-8 w-8 cursor-pointer border-2 border-white/25 hover:border-white/50 transition-colors" 
                onClick={() => navigate('/ambassador-dashboard/profile')}
              >
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-blue-700 text-white">
                  {getFullName()[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar and Main Content */}
      <div
        className={`fixed inset-y-0 z-30 flex w-72 flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: "88px" }}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r">
          <nav className="flex flex-1 flex-col pt-4">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              {ambassadorNavigation.map((section) => (
                <li key={section.section}>
                  <div className="text-xs font-semibold text-blue-600 uppercase mb-2">
                    {section.section}
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
                    {section.items.map((item) => {
                      const isActive = currentPath === item.href;
                      return (
                        <li key={item.name}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={`w-full justify-start gap-x-3 ${
                              isActive 
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                                : "hover:bg-blue-50 hover:text-blue-600"
                            }`}
                            onClick={() => {
                              navigate(item.href);
                              if (isMobile) setSidebarOpen(false);
                            }}
                          >
                            <item.icon 
                              className={`h-5 w-5 ${isActive ? "text-blue-600" : ""}`} 
                              aria-hidden="true" 
                            />
                            {item.name}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
              <li className="mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-x-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Logout
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`lg:pl-72`}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
