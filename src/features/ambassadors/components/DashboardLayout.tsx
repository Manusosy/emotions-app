
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Clock,
  Users,
  Brain,
  HeartHandshake,
  Star,
  User,
  Mail,
  Settings,
  Lock,
  LogOut,
  DollarSign,
  Bell,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, getFullName, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [availabilityStatus, setAvailabilityStatus] = useState("Available");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleAvailabilityChange = async (value: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("ambassador_profiles")
        .update({ availability_status: value })
        .eq("id", user.id);

      if (error) throw error;

      setAvailabilityStatus(value);
      toast.success("Availability status updated");
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast.error(error.message || "Failed to update availability");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Get user's display name from metadata
  const displayName = getFullName();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-b from-[#D1E4FF] to-white">
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            className="bg-white shadow-md"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
          </Button>
        </div>
      )}
      
      <div 
        className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-40 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`
            : 'w-64 min-h-screen'
        } bg-white shadow-sm flex flex-col border-r border-gray-200`}
      >
        <div className="bg-[#0078FF] p-4 flex items-center justify-center">
          <Link to="/">
            <img 
              src="/lovable-uploads/cdf0f73f-159c-4841-927b-09f1f086e7f9.png" 
              alt="MindWell Logo" 
              className="h-10 cursor-pointer"
            />
          </Link>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src="/lovable-uploads/47ac3dae-2498-4dd3-a729-73086f5c34f8.png" 
                alt="Ambassador Profile" 
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center">
                <Star className="h-3 w-3 mr-0.5" /> 5
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-md">
                <div className="bg-green-500 w-2.5 h-2.5 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {displayName || "Ambassador"}
              </h3>
              <div className="flex items-center mt-1">
                <div className="w-1 h-5 bg-blue-600 mr-2"></div>
                <span className="text-xs text-blue-600 font-medium">Mental Health Ambassador</span>
              </div>
              
              <div className="mt-2">
                <Select 
                  value={availabilityStatus}
                  onValueChange={handleAvailabilityChange}
                >
                  <SelectTrigger className="h-7 text-xs bg-white border-gray-200 w-full">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 ${availabilityStatus === 'Available' ? 'bg-green-500' : availabilityStatus === 'Away' ? 'bg-amber-500' : 'bg-gray-500'} rounded-full mr-1.5`}></span>
                      <SelectValue>{availabilityStatus}</SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Available">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                          Available
                        </div>
                      </SelectItem>
                      <SelectItem value="Away">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1.5"></span>
                          Away
                        </div>
                      </SelectItem>
                      <SelectItem value="Do Not Disturb">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                          Do Not Disturb
                        </div>
                      </SelectItem>
                      <SelectItem value="Offline">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-1.5"></span>
                          Offline
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="mt-4 flex-1 overflow-y-auto px-3">
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">Main Menu</div>
          <ul className="space-y-1">
            <li>
              <Link
                to="/ambassador-dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActiveRoute('/ambassador-dashboard')
                    ? 'bg-[#0078FF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/ambassador-dashboard/appointments"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActiveRoute('/ambassador-dashboard/appointments')
                    ? 'bg-[#0078FF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="h-5 w-5" />
                Appointments
              </Link>
            </li>
            <li>
              <Link
                to="/ambassador-dashboard/clients"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActiveRoute('/ambassador-dashboard/clients')
                    ? 'bg-[#0078FF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5" />
                Clients
              </Link>
            </li>
            <li>
              <Link
                to="/ambassador-dashboard/groups"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActiveRoute('/ambassador-dashboard/groups')
                    ? 'bg-[#0078FF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <HeartHandshake className="h-5 w-5" />
                Support Groups
              </Link>
            </li>
            <li>
              <Link
                to="/ambassador-dashboard/resources"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActiveRoute('/ambassador-dashboard/resources')
                    ? 'bg-[#0078FF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Brain className="h-5 w-5" />
                Resources
              </Link>
            </li>
            
            <div className="text-xs font-semibold text-gray-400 uppercase mt-6 mb-2 px-3">Management</div>
            <li>
              <Link
                to="/ambassador-dashboard/messages"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActiveRoute('/ambassador-dashboard/messages')
                    ? 'bg-[#0078FF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Mail className="h-5 w-5" />
                Messages
                <span className="ml-auto w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-xs text-white">2</span>
              </Link>
            </li>
            <li>
              <Link
                to="/ambassador-dashboard/profile"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActiveRoute('/ambassador-dashboard/profile')
                    ? 'bg-[#0078FF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/ambassador-dashboard/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActiveRoute('/ambassador-dashboard/settings')
                    ? 'bg-[#0078FF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </li>
            <li>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-800">
            {isMobile && isSidebarOpen ? null : "Welcome back, " + (displayName || "Ambassador")}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Mail className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
