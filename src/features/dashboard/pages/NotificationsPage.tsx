import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
          title: 'Welcome to Emotions',
          content: 'Hi! Welcome to Emotions. Feel free to take a tour around and familiarize yourself with our cool features to help you monitor, analyze and receive personalized recommendations to do with your mental health. Try our Journal feature, or Stress analytics feature or even emotional checkin!',
          created_at: new Date().toISOString(),
          read: false,
          type: 'welcome',
          user_id: user.id
        };
        
        setNotifications([welcomeNotification]);
        setUnreadCount(1);
      } else {
        // Map database notifications to our interface
        const mappedNotifications: Notification[] = data.map(item => {
          return {
            id: item.id,
            title: item.title,
            content: item.message || '',
            created_at: item.created_at,
            read: item.read,
            type: ((item as any).type as 'welcome' | 'update' | 'reminder' | 'other') || 'other',
            action_url: (item as any).action_url,
            user_id: item.user_id
          };
        });
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

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Toggle the read status
      const newReadStatus = !currentStatus;
      
      // Update UI first for responsiveness
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: newReadStatus } : n
      ));
      
      // Update unread count
      if (newReadStatus) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setUnreadCount(prev => prev + 1);
      }

      // For demo notifications, don't try to update the database
      if (id === 'welcome-1') {
        return;
      }
      
      // Update in database - make sure to include user_id in the query to avoid conflicts
      const { error } = await supabase
        .from('notifications')
        .update({ read: newReadStatus })
        .eq('id', id)
        .eq('user_id', user?.id || '');
        
      if (error) {
        console.error('Error updating notification in database:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error toggling notification read status:', error);
      // Revert UI changes on error
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: currentStatus } : n
      ));
      
      // Revert unread count
      if (!currentStatus) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setUnreadCount(prev => prev + 1);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update UI first
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      // Update in database
      const realNotificationIds = notifications
        .filter(n => n.id !== 'welcome-1' && !n.read)
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
      if (id === 'welcome-1') {
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
    // Mark as read if unread and persist to database immediately
    if (!notification.read) {
      toggleReadStatus(notification.id, notification.read);
    }
    
    // Navigate if there's an action URL
    if (notification.action_url) {
      // Small delay to ensure database update completes before navigation
      setTimeout(() => {
        navigate(notification.action_url || '');
      }, 100);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Bell className="h-6 w-6 text-green-600" />;
      case 'update':
        return <Bell className="h-6 w-6 text-blue-600" />;
      case 'reminder':
        return <Calendar className="h-6 w-6 text-amber-600" />;
      case 'message':
        return <MessageSquare className="h-6 w-6 text-indigo-600" />;
      default:
        return <Bell className="h-6 w-6 text-slate-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-slate-500">
              Manage all your notifications in one place
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>
                {unreadCount > 0 ? (
                  <span>You have <span className="font-medium text-blue-600">{unreadCount} unread</span> notification{unreadCount !== 1 ? 's' : ''}</span>
                ) : (
                  <span>All caught up!</span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs defaultValue="all" className="w-[200px]" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b border-slate-200">
              <form onSubmit={handleSearch} className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search notifications..."
                    className="w-full pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full max-w-[250px]" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                          ${notification.type === 'welcome' ? 'bg-green-100' : 
                            notification.type === 'update' ? 'bg-blue-100' :
                            notification.type === 'reminder' ? 'bg-amber-100' : 'bg-slate-100'}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1" onClick={() => handleNotificationClick(notification)}>
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notification.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {formatNotificationDate(notification.created_at)}
                            </p>
                          </div>
                          <p className={`mt-1 text-sm ${!notification.read ? 'text-slate-600' : 'text-slate-500'}`}>
                            {notification.content}
                          </p>
                          
                          <div className="flex items-center mt-2 justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <span>Mark as read</span>
                                <Switch 
                                  checked={notification.read} 
                                  onCheckedChange={() => toggleReadStatus(notification.id, notification.read)}
                                />
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Bell className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No notifications found</h3>
                    <p className="text-slate-500 mt-1 max-w-md">
                      {searchQuery.trim() 
                        ? `No notifications match your search for "${searchQuery}"`
                        : activeTab === 'unread' 
                          ? "You've read all your notifications" 
                          : "You don't have any notifications yet"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}