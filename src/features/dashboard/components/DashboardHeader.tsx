import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface DashboardHeaderProps {
  setSidebarOpen?: (open: boolean) => void;
  sidebarOpen?: boolean;
}

export default function DashboardHeader({ 
  setSidebarOpen, 
  sidebarOpen 
}: DashboardHeaderProps = {}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
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

  const toggleSidebar = () => {
    if (setSidebarOpen && typeof sidebarOpen !== 'undefined') {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="px-4 py-4 sm:px-6 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Toggle sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          )}
          <div className="font-semibold text-lg">Dashboard</div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/patient-dashboard/notifications')}
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
            className="relative"
            onClick={() => navigate('/patient-dashboard/messages')}
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
            className="h-8 w-8 cursor-pointer border hover:border-blue-500 transition-colors" 
            onClick={() => navigate('/patient-dashboard/profile')}
          >
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-blue-700 text-white">
              {user?.user_metadata?.first_name?.[0]?.toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
} 