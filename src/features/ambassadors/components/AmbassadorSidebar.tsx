import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  Home,
  Calendar,
  Heart,
  Settings,
  LogOut,
  MessageSquare,
  FileText,
  Users,
  BookOpen,
  Clock,
  User,
  BadgeHelp
} from "lucide-react";

export default function AmbassadorSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [window.location.pathname]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
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

  if (!sidebarOpen && isMobile) {
    return null;
  }

  return (
    <>
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex flex-col flex-grow border-r pt-5 bg-background overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <img
              className="h-8 w-auto"
              src="/lovable-uploads/03038be2-2146-4f36-a685-7b7719df9caa.png"
              alt="Logo"
            />
          </div>
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-4 pb-4 space-y-8">
              {ambassadorNavigation.map((section) => (
                <div key={section.section}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {section.section}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = currentPath === item.href;
                      return (
                        <Button
                          key={item.name}
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start ${
                            isActive
                              ? "bg-primary/10 text-primary hover:bg-primary/20"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => navigate(item.href)}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="px-4 pb-4">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b p-4">
              <img
                className="h-8 w-auto"
                src="/lovable-uploads/03038be2-2146-4f36-a685-7b7719df9caa.png"
                alt="Logo"
              />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-8">
              {ambassadorNavigation.map((section) => (
                <div key={section.section}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {section.section}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = currentPath === item.href;
                      return (
                        <Button
                          key={item.name}
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start ${
                            isActive
                              ? "bg-primary/10 text-primary hover:bg-primary/20"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => {
                            navigate(item.href);
                            setSidebarOpen(false);
                          }}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 