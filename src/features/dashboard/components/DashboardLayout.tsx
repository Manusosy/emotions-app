import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useAuth } from "@/hooks/use-auth";
import WelcomeDialog from "@/components/WelcomeDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Home,
  Calendar,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Inbox,
  FileText,
  Users,
  Bell,
  BookOpen,
  Activity,
  User,
  Clock,
  Shield,
  BadgeHelp,
  ChevronRight,
  Clock3,
  HeartPulse,
  Search,
  Trash2,
  MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  type: 'welcome' | 'update' | 'reminder' | 'other';
  user_id?: string;
}

interface DbNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  user_id: string;
}

const patientNavigation = [
  { 
    section: "Main",
    items: [
      { name: "Overview", href: "/patient-dashboard", icon: Home },
      { name: "Appointments", href: "/patient-dashboard/appointments", icon: Calendar },
      { name: "Messages", href: "/patient-dashboard/messages", icon: Inbox },
      { name: "Notifications", href: "/patient-dashboard/notifications", icon: Bell },
      { name: "Journal", href: "/patient-dashboard/journal", icon: BookOpen },
    ]
  },
  {
    section: "Wellbeing",
    items: [
      { name: "Mood Tracker", href: "/patient-dashboard/mood-tracker", icon: Activity },
      { name: "Reports", href: "/patient-dashboard/reports", icon: FileText }, 
      { name: "Resources", href: "/patient-dashboard/resources", icon: BookOpen },
    ]
  },
  {
    section: "Account",
    items: [
      { name: "Profile", href: "/patient-dashboard/profile", icon: User },
      { name: "Favorites", href: "/patient-dashboard/favorites", icon: Heart },
      { name: "Settings", href: "/patient-dashboard/settings", icon: Settings },
      { name: "Help Center", href: "/patient-dashboard/help", icon: BadgeHelp },
    ]
  }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // State for notification dialog
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  useEffect(() => {
    // Verify user is authenticated, if not redirect to login
    if (!isAuthenticated) {
      // Check localStorage first
      const storedAuthState = localStorage.getItem('auth_state');
      if (storedAuthState) {
        try {
          const { isAuthenticated: storedAuth } = JSON.parse(storedAuthState);
          if (!storedAuth) {
            // Use direct location change instead of React Router for a complete page refresh
            window.location.href = '/login';
          }
          // If we have stored auth, don't redirect
        } catch (e) {
          console.error("Error parsing stored auth state:", e);
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
      return;
    }

    setCurrentPath(window.location.pathname);
  }, [window.location.pathname, isAuthenticated, navigate]);

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

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;

        // Create welcome notification for new users
        const welcomeNotification = {
          id: 'welcome-1',
          title: 'Welcome to Emotions',
          content: 'Hi! Welcome to Emotions. Feel free to take a tour around and familiarize yourself with our cool features to help you monitor, analyze and receive personalized recommendations to do with your mental health. Try our Journal feature, or Stress analytics feature or even emotional checkin!',
          created_at: new Date().toISOString(),
          read: false,
          type: 'welcome' as const
        } as Notification;

        if (data && data.length > 0) {
          // Map database fields to our Notification interface
          const mappedNotifications: Notification[] = data.map((item: DbNotification) => ({
            id: item.id,
            title: item.title,
            content: item.message,
            created_at: item.created_at,
            read: item.read,
            type: 'other' as const,  // Default type if not available
            user_id: item.user_id
          }));
          
          // Check if welcome notification exists
          const hasWelcomeNotification = mappedNotifications.some(n => n.title.includes('Welcome'));
          
          // If no welcome notification exists, add it to the beginning of the array
          if (!hasWelcomeNotification) {
            setNotifications([welcomeNotification, ...mappedNotifications]);
            // Increment unread notifications counter for the welcome message
            setUnreadNotifications(prev => prev + 1);
          } else {
            setNotifications(mappedNotifications);
          }
        } else {
          // No notifications exist, add welcome notification
          setNotifications([welcomeNotification]);
          // Set unread notification counter to 1 for the welcome message
          setUnreadNotifications(1);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  // Handle clicking outside the notification popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement dashboard search functionality
      console.log('Searching for:', searchQuery);
      // This would typically navigate to search results or filter current view
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      // Find the notification
      const notification = notifications.find(n => n.id === id);
      
      // Only proceed if notification exists and is unread
      if (!notification || notification.read) return;
      
      // Update local state immediately for UI responsiveness
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      
      // Update unread count
      setUnreadNotifications(prev => Math.max(0, prev - 1));

      // If this is a real notification (not mock), update in database
      if (id !== 'welcome-1' && user?.id) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Database error marking notification as read:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Revert UI changes on error
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: false } : n
      ));
      setUnreadNotifications(prev => prev + 1);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Find if the notification is unread before removing it
      const notification = notifications.find(n => n.id === id);
      const isUnread = notification && !notification.read;
      
      // Update local state immediately
      setNotifications(notifications.filter(n => n.id !== id));
      
      // If it was unread, update the unread count
      if (isUnread) {
        setUnreadNotifications(prev => Math.max(0, prev - 1));
      }
      
      // If this is a real notification (not mock), delete from database
      if (id !== 'welcome-1' && user?.id) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
          
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    // Close notification panel
    setNotificationOpen(false);
    
    // Navigate to the notifications page for all notifications
    navigate('/patient-dashboard/notifications');
  };

  const handleNotificationDialogClose = () => {
    setNotificationDialogOpen(false);
    setSelectedNotification(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Use direct location change instead of React Router for a complete page refresh
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const firstName = user?.user_metadata?.first_name || 'User';
  const lastName = user?.user_metadata?.last_name || '';
  
  // Add this function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Store original notifications state for rollback if needed
      const originalNotifications = [...notifications];
      
      // Update local state
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      
      // Reset unread count
      setUnreadNotifications(0);
      
      // Update in database
      if (user?.id) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);
        
        if (error) {
          console.error('Database error marking all notifications as read:', error);
          throw error;
        }
        
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error("Failed to update notifications");
      
      // Restore original state on error
      if (notifications) {
        setNotifications(notifications);
        setUnreadNotifications(notifications.filter(n => !n.read).length);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Include the welcome dialog */}
      <WelcomeDialog />
      
      {/* Notification dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedNotification?.title || "Notification"}
            </DialogTitle>
            <DialogDescription className="whitespace-pre-wrap">
              {selectedNotification?.content || ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => {
                if (selectedNotification) {
                  deleteNotification(selectedNotification.id);
                  setNotificationDialogOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button onClick={handleNotificationDialogClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
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
                src="/assets/emotions-logo-black.png"
                alt="Emotions Dashboard Logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search dashboard..."
                className="w-full pl-10 pr-4 rounded-full border-slate-200 focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 rounded-full hover:bg-slate-100"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent ref={notificationRef} className="w-80 p-0 mr-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-3 cursor-pointer hover:bg-slate-50 ${!notification.read ? 'bg-blue-50/40' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center 
                              ${notification.type === 'welcome' ? 'bg-green-100 text-green-600' : 
                                notification.type === 'update' ? 'bg-blue-100 text-blue-600' :
                                notification.type === 'reminder' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}
                            >
                              {notification.type === 'welcome' ? '👋' : 
                               notification.type === 'update' ? '🔄' :
                               notification.type === 'reminder' ? '⏰' : '📢'}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{notification.content}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(notification.created_at).toLocaleDateString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-slate-200 bg-slate-50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => navigate('/patient-dashboard/notifications')}
                  >
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Messages */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-full hover:bg-slate-100"
              onClick={() => navigate('/patient-dashboard/messages')}
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessages > 0 && (
                <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></div>
              )}
            </Button>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-blue-100">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {firstName[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{firstName} {lastName}</span>
                    <span className="text-xs text-slate-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/patient-dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/patient-dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-2 fixed top-16 z-40 w-full bg-white border-b border-slate-200">
        <form onSubmit={handleSearch} className="flex w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search dashboard..."
              className="w-full pl-10 pr-4 rounded-full border-slate-200 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 z-30 flex w-64 flex-col bg-white border-r border-slate-200 top-16 transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex grow flex-col overflow-y-auto pt-0">
            <nav className="flex flex-1 flex-col pt-5 pb-20">
              <div className="px-4 mb-5">
                <div 
                  className="rounded-xl p-3 cursor-pointer hover:bg-[#1AB0E0] transition-colors"
                  style={{ backgroundColor: "#20C0F3" }}
                  onClick={() => navigate('/patient-dashboard/mood-tracker')}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                      <HeartPulse className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Emotional Wellness</p>
                      <p className="text-xs text-white font-semibold">Start Daily Check-in</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="ml-auto h-8 w-8 rounded-full bg-white text-[#20C0F3] hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/patient-dashboard/mood-tracker');
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <ul role="list" className="flex flex-1 flex-col px-3 gap-y-5">
                {patientNavigation.map((section) => (
                  <li key={section.section}>
                    <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {section.section}
                    </div>
                    <ul role="list" className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = currentPath === item.href;
                        return (
                          <li key={item.name}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className={`w-full justify-start gap-x-3 ${
                                isActive 
                                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" 
                                  : "hover:bg-slate-50 text-slate-700"
                              }`}
                              onClick={() => {
                                navigate(item.href);
                                if (isMobile) setSidebarOpen(false);
                              }}
                            >
                              <item.icon 
                                className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-blue-700" : "text-slate-500"}`} 
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
              </ul>
              
              <div className="px-3 mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-x-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 w-full mt-0 ${sidebarOpen ? "lg:pl-64" : ""}`}>
          <div className="py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
            <div className="max-w-full overflow-x-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
