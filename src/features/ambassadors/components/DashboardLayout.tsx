import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useAuth } from "@/hooks/use-auth";
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
  MessageSquare,
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
  Search,
  Trash2,
  Sparkles,
  BarChart2,
  UserCheck,
  Briefcase,
  Brain,
  UserCog,
  Award,
  PlayCircle,
  Zap
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
  type: 'appointment' | 'message' | 'review' | 'update' | 'other';
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

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, logout: signout, getFullName, isAuthenticated } = useAuth();
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
      // We're using ProtectedRoute, so we should rarely hit this case
      // Only check localStorage as a backup and don't aggressively redirect
      const storedAuthState = localStorage.getItem('auth_state');
      if (storedAuthState) {
        try {
          const { isAuthenticated: storedAuth, userRole } = JSON.parse(storedAuthState);
          // Only redirect if we're absolutely sure the user is not authenticated
          if (!storedAuth || userRole !== 'ambassador') {
            console.warn("User not authenticated as ambassador in DashboardLayout, redirecting");
            window.location.href = '/login';
          }
          // Otherwise, assume auth is still processing
        } catch (e) {
          console.error("Error parsing stored auth state:", e);
        }
      }
      return;
    }

    setCurrentPath(window.location.pathname);
  }, [window.location.pathname, isAuthenticated, navigate]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    console.log("DashboardLayout checking auth - User:", user?.id);
    
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

    if (user?.id) {
      fetchUnreadCounts();
    }
  }, [user?.id, navigate]);

  // Handle click outside notification panel to close it
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
  }, [notificationRef]);

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

        // Create welcome notification for new ambassadors
        const welcomeNotification = {
          id: 'welcome-amb-1',
          title: 'Welcome to Emotions Ambassador Hub',
          content: 'Hello and welcome to your Ambassador Dashboard! Here you can manage your client appointments, resources, and therapeutic tools. We're excited to have you onboard to help our users on their mental health journey.',
          created_at: new Date().toISOString(),
          read: false,
          type: 'update' as const
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ambassador-dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const markNotificationAsRead = async (id: string, read: boolean) => {
    try {
      // If it's a special welcome notification (client-side only)
      if (id.startsWith('welcome-amb-')) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === id ? { ...notification, read } : notification
          )
        );
        setUnreadNotifications(prev => prev - 1);
        return;
      }

      // Otherwise update in the database
      const { error } = await supabase
        .from('notifications')
        .update({ read })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update the notification in state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read } : notification
        )
      );

      // Update unread count
      setUnreadNotifications(prev => read ? Math.max(0, prev - 1) : prev + 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markNotificationAsRead(notification.id, true);
    }
    
    // Set selected notification and open dialog
    setSelectedNotification(notification);
    setNotificationDialogOpen(true);
  };

  const handleSignout = async () => {
    try {
      await signout();
      // Use direct location change instead of React Router for a complete page refresh
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during signout:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const clientSideNotifications = notifications.filter(n => n.id.startsWith('welcome-amb-') && !n.read);
      const databaseNotifications = notifications.filter(n => !n.id.startsWith('welcome-amb-') && !n.read);
      
      if (clientSideNotifications.length > 0) {
        setNotifications(prev => prev.map(n => 
          n.id.startsWith('welcome-amb-') && !n.read 
            ? { ...n, read: true } 
            : n
        ));
      }
      
      if (databaseNotifications.length > 0 && user?.id) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);
          
        if (error) throw error;
          
        setNotifications(prev => prev.map(n => 
          !n.id.startsWith('welcome-amb-') && !n.read 
            ? { ...n, read: true } 
            : n
        ));
      }
      
      setUnreadNotifications(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const ambassadorNavigation = [
    { 
      section: "Main",
      items: [
        { name: "Dashboard", href: "/ambassador-dashboard", icon: Home },
        { name: "Appointments", href: "/ambassador-dashboard/appointments", icon: Calendar },
        { name: "Messages", href: "/ambassador-dashboard/messages", icon: MessageSquare },
        { name: "Clients", href: "/ambassador-dashboard/clients", icon: UserCheck },
      ]
    },
    {
      section: "Resources",
      items: [
        { name: "Resource Library", href: "/ambassador-dashboard/resources", icon: Briefcase },
        { name: "Support Groups", href: "/ambassador-dashboard/groups", icon: Users },
        { name: "Therapeutic Tools", href: "/ambassador-dashboard/tools", icon: Brain },
        { name: "Media Content", href: "/ambassador-dashboard/media", icon: PlayCircle },
      ]
    },
    {
      section: "Account",
      items: [
        { name: "My Profile", href: "/ambassador-dashboard/profile", icon: UserCog },
        { name: "Analytics", href: "/ambassador-dashboard/analytics", icon: BarChart2 },
        { name: "Credentials", href: "/ambassador-dashboard/credentials", icon: Award },
        { name: "Settings", href: "/ambassador-dashboard/settings", icon: Settings },
      ]
    }
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + 
           ' at ' + 
           date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Top Navigation Bar Container with Padding */}
      <div className="px-4 py-4 sm:px-6">
        {/* Header with rounded corners and contained width */}
        <div className="sticky top-4 z-40 mx-auto rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 shadow-lg sm:px-6 max-w-[98%]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:bg-white/10"
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
                  src="/assets/emotions-logo.png"
                  alt="Emotions Dashboard Logo"
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-xl font-bold text-white hidden sm:inline-block">Ambassador Hub</span>
              </Link>
            </div>

            <div className="flex-1 mx-8 hidden md:block">
              <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
                <Input 
                  type="search"
                  placeholder="Search clients, appointments, resources..."
                  className="w-full pr-10 bg-white/10 border-transparent text-white placeholder:text-white/60 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-white">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="flex items-center gap-4">
              <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-white hover:bg-white/10"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-amber-500 text-white"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 p-0 mr-4" 
                  ref={notificationRef}
                  align="end"
                >
                  <div className="flex items-center justify-between bg-purple-600 text-white p-3 rounded-t-md">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadNotifications > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white hover:bg-purple-500 text-xs h-8"
                        onClick={markAllNotificationsAsRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-purple-50' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'text-purple-800' : 'text-gray-900'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {notification.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2 bg-gray-50 rounded-b-md border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => navigate('/ambassador-dashboard/notifications')}
                    >
                      View all notifications
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-white/10"
                onClick={() => navigate('/ambassador-dashboard/messages')}
              >
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-amber-500 text-white"
                  >
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9 cursor-pointer border-2 border-white/25 hover:border-white/50 transition-colors">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-purple-900 text-white">
                        {user?.user_metadata?.first_name?.[0]?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getFullName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/ambassador-dashboard/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ambassador-dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription className="text-right text-xs">
              {selectedNotification?.created_at && formatTime(selectedNotification.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="p-2">
            <p className="text-sm">{selectedNotification?.content}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Layout with Sidebar and Content */}
      <div className="flex h-[calc(100vh-6rem)]">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 z-30 flex w-64 flex-col transition-transform duration-300 lg:translate-x-0 bg-white/80 backdrop-blur-sm border-r border-purple-100 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ top: "88px" }}
        >
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
            {/* Ambassador Profile Quick View */}
            <div className="flex flex-col items-center mt-8 mb-6">
              <Avatar className="h-16 w-16 mb-2 border-2 border-purple-200">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-lg">
                  {user?.user_metadata?.first_name?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-gray-900">{getFullName()}</h3>
              <Badge className="mt-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                Mental Health Ambassador
              </Badge>
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                {ambassadorNavigation.map((section) => (
                  <li key={section.section}>
                    <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
                      {section.section}
                    </div>
                    <ul role="list" className="-mx-2 space-y-1">
                      {section.items.map((item) => {
                        const isActive = currentPath === item.href;
                        const IconComponent = item.icon;
                        return (
                          <li key={item.name}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className={`w-full justify-start gap-x-3 ${
                                isActive 
                                  ? "bg-purple-100 text-purple-800 hover:bg-purple-200" 
                                  : "hover:bg-purple-50 hover:text-purple-700"
                              }`}
                              onClick={() => {
                                navigate(item.href);
                                if (isMobile) {
                                  setSidebarOpen(false);
                                }
                              }}
                            >
                              <IconComponent className="h-4 w-4" />
                              <span>{item.name}</span>
                              {(item.name === "Messages" && unreadMessages > 0) && (
                                <Badge variant="secondary" className="ml-auto bg-purple-200 text-purple-800">
                                  {unreadMessages}
                                </Badge>
                              )}
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Quick Action Buttons */}
            <div className="mt-auto">
              <Button 
                variant="outline" 
                className="w-full mb-2 text-purple-700 border-purple-300 hover:bg-purple-50"
                onClick={() => navigate('/contact')}
              >
                <BadgeHelp className="mr-2 h-4 w-4" />
                Support Center
              </Button>
              <Button 
                variant="default" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={handleSignout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto ${sidebarOpen ? "lg:pl-64" : ""} p-4 sm:p-6 transition-all duration-300`}>
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
