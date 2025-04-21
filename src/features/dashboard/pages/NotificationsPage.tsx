import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  MessageSquare, 
  Clock, 
  FileText, 
  Settings, 
  User, 
  AlertCircle,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  type: 'welcome' | 'update' | 'reminder' | 'other';
  action_url?: string;
  user_id: string;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Create a welcome notification if there are no notifications
      if (!data || data.length === 0) {
        const welcomeNotification: Notification = {
          id: 'welcome-1',
          title: 'Welcome to Emotions Health',
          content: 'Thank you for joining our platform. Start by tracking your mood and exploring available resources.',
          created_at: new Date().toISOString(),
          read: false,
          type: 'welcome',
          user_id: user.id
        };
        
        // Add system notifications for demo purposes
        const demoNotifications: Notification[] = [
          {
            id: 'system-1',
            title: 'New Ambassador Available',
            content: 'Dr. Jane Smith is now available for consultations. Book your appointment today!',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            read: false,
            type: 'update',
            action_url: '/patient-dashboard/appointments',
            user_id: user.id
          },
          {
            id: 'system-2',
            title: 'Upcoming Appointment Reminder',
            content: 'You have an appointment with Dr. Ruby Perrin tomorrow at 10:30 AM.',
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            read: true,
            type: 'reminder',
            action_url: '/patient-dashboard/appointments',
            user_id: user.id
          },
          {
            id: 'system-3',
            title: 'Journal Streak Achievement',
            content: "Congratulations! You've maintained your journaling streak for 7 days.",
            created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
            read: true,
            type: 'other',
            action_url: '/patient-dashboard/journal',
            user_id: user.id
          }
        ];
        
        setNotifications([welcomeNotification, ...demoNotifications]);
        setUnreadCount(2); // Welcome notification + New Ambassador notification
      } else {
        // Map database notifications to our interface
        const mappedNotifications: Notification[] = data.map(item => ({
          id: item.id,
          title: item.title,
          content: item.message || '',
          created_at: item.created_at,
          read: item.read,
          type: (item.type as 'welcome' | 'update' | 'reminder' | 'other') || 'other',
          action_url: item.action_url,
          user_id: item.user_id
        }));
        setNotifications(mappedNotifications);
        setUnreadCount(mappedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications based on active tab and search query
  useEffect(() => {
    let filtered = [...notifications];
    
    // Apply tab filter
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query)
      );
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, activeTab, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied through the useEffect
  };

  const formatNotificationDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Update UI first for responsiveness
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      // For demo notifications, don't try to update the database
      if (id.startsWith('system-') || id === 'welcome-1') {
        return;
      }
      
      // Update in database
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update UI first
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      // Update database (excluding demo notifications)
      const realNotificationIds = notifications
        .filter(n => !n.id.startsWith('system-') && n.id !== 'welcome-1' && !n.read)
        .map(n => n.id);
      
      if (realNotificationIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', realNotificationIds);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Update UI first
      const isUnread = notifications.find(n => n.id === id)?.read === false;
      setNotifications(notifications.filter(n => n.id !== id));
      
      if (isUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // For demo notifications, don't try to update the database
      if (id.startsWith('system-') || id === 'welcome-1') {
        return;
      }
      
      // Delete from database
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate if there's an action URL
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Bell className="h-5 w-5 text-green-500" />;
      case 'update':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'reminder':
        return <Calendar className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <p className="text-slate-500">
              Manage your notifications and stay updated
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search notifications..."
                className="pl-10 pr-4 w-full md:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all" className="relative">
                All
                <Badge className="ml-1 bg-slate-200 text-slate-800 hover:bg-slate-200">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="relative">
                Unread
                <Badge className="ml-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {unreadCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="space-y-4 mt-1">
            {renderNotificationList(filteredNotifications)}
          </TabsContent>
          
          <TabsContent value="unread" className="space-y-4 mt-1">
            {renderNotificationList(filteredNotifications)}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );

  function renderNotificationList(notifications: Notification[]) {
    if (loading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="mb-3">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ));
    }
    
    if (notifications.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No notifications found</h3>
            <p className="text-slate-500 text-sm">
              {activeTab === 'unread' 
                ? "You've read all your notifications" 
                : searchQuery 
                  ? "No notifications match your search" 
                  : "You don't have any notifications yet"}
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return notifications.map(notification => (
      <Card 
        key={notification.id} 
        className={`mb-3 cursor-pointer transition hover:shadow-md ${!notification.read ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''}`}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
              ${notification.type === 'welcome' ? 'bg-green-100' : 
                notification.type === 'update' ? 'bg-blue-100' : 
                notification.type === 'reminder' ? 'bg-amber-100' : 'bg-slate-100'}`}
            >
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1" onClick={() => handleNotificationClick(notification)}>
              <div className="flex justify-between mb-1">
                <h3 className={`font-medium ${!notification.read ? 'text-blue-900' : ''}`}>
                  {notification.title}
                </h3>
                <span className="text-xs text-slate-500">
                  {formatNotificationDate(notification.created_at)}
                </span>
              </div>
              <p className={`text-sm ${!notification.read ? 'text-blue-800' : 'text-slate-600'}`}>
                {notification.content}
              </p>
              
              {notification.action_url && (
                <div className="mt-2">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(notification.action_url!);
                    }}
                  >
                    {notification.type === 'reminder' ? 'View appointment' : 
                     notification.type === 'update' ? 'Learn more' : 'View details'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {!notification.read && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  }
} 