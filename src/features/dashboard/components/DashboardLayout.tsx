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
  Trash2
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
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [unreadMessages, setUnreadMessages] = useState(2);
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
            navigate('/login', { replace: true });
          }
          // If we have stored auth, don't redirect
        } catch (e) {
          console.error("Error parsing stored auth state:", e);
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
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

        setUnreadNotifications(notificationsResponse.count || 3);
        setUnreadMessages(messagesResponse.count || 2);
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
          setNotifications(mappedNotifications);
        } else {
          // Create welcome notification for new users
          const welcomeNotification: Notification = {
            id: 'welcome-1',
            title: 'Welcome to Emotions Health',
            content: 'Thank you for joining our platform. Start by tracking your mood and exploring available resources.',
            created_at: new Date().toISOString(),
            read: false,
            type: 'welcome'
          };
          setNotifications([welcomeNotification]);
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
      // Update local state immediately for UI responsiveness
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      
      // Update unread count
      setUnreadNotifications(prev => Math.max(0, prev - 1));

      // If this is a real notification (not mock), update in database
      if (id !== 'welcome-1' && user?.id) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Update local state immediately
      const updatedNotifications = notifications.filter(n => n.id !== id);
      setNotifications(updatedNotifications);
      
      // If it was unread, update the unread count
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
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
    
    // Handle different notification types
    if (notification.type === 'welcome') {
      // For welcome notification, just close the notification panel
      setNotificationOpen(false);
    } else if (notification.content.includes('journal')) {
      // For journal-related notifications, navigate to the journal entry
      setNotificationOpen(false);
      
      // Extract journal ID if it exists in the notification content
      const journalIdMatch = notification.content.match(/journal\/(\d+)/);
      if (journalIdMatch && journalIdMatch[1]) {
        navigate(`/patient-dashboard/journal/${journalIdMatch[1]}`);
      } else {
        // If no specific journal entry, go to journal page
        navigate('/patient-dashboard/journal');
      }
    } else {
      // For all other notifications, show in dialog
      setSelectedNotification(notification);
      setNotificationDialogOpen(true);
      setNotificationOpen(false);
    }
  };

  const handleNotificationDialogClose = () => {
    setNotificationDialogOpen(false);
    setSelectedNotification(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const firstName = user?.user_metadata?.first_name || 'User';
  const lastName = user?.user_metadata?.last_name || '';
  
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
      <header className="sticky top-0 z-40 w-full">
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
                  className="relative"
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
              </PopoverTrigger>
              <PopoverContent ref={notificationRef} className="w-80 p-0 mr-4">
                <div className="px-4 py-3 border-b border-slate-200">
                  <h3 className="font-semibold">Notifications</h3>
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
              className="relative"
              onClick={() => navigate('/patient-dashboard/messages')}
            >
              <Inbox className="h-5 w-5" />
              {unreadMessages > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadMessages}
                </Badge>
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
      <div className="md:hidden px-4 py-2">
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

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 z-30 flex w-64 flex-col bg-white border-r border-slate-200 top-16 transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex grow flex-col overflow-y-auto">
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
        <main className={`flex-1 transition-all duration-300 w-full ${sidebarOpen ? "lg:pl-64" : ""}`}>
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
