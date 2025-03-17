
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreVertical, Calendar, MessageSquare, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  schedule: Array<{
    day: string;
    time: string;
  }>;
  max_participants: number;
  current_participants: number;
  status: 'active' | 'inactive';
  category: string;
  created_at: string;
}

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, [user]);

  // Using mock data as the support_groups table is not created yet
  const fetchGroups = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockGroups: SupportGroup[] = [
        {
          id: "1",
          name: "Anxiety Relief Group",
          description: "A supportive community for those dealing with anxiety",
          schedule: [
            { day: "Monday", time: "7:00 PM" },
            { day: "Friday", time: "6:30 PM" }
          ],
          max_participants: 15,
          current_participants: 8,
          status: "active",
          category: "Anxiety",
          created_at: "2023-01-15T12:00:00Z"
        },
        {
          id: "2",
          name: "Depression Support",
          description: "Support group for managing depression and finding community",
          schedule: [
            { day: "Wednesday", time: "6:00 PM" }
          ],
          max_participants: 12,
          current_participants: 10,
          status: "active",
          category: "Depression",
          created_at: "2023-02-10T15:30:00Z"
        },
        {
          id: "3",
          name: "Stress Management",
          description: "Learn techniques to manage daily stress and anxiety",
          schedule: [
            { day: "Tuesday", time: "5:30 PM" },
            { day: "Thursday", time: "7:00 PM" }
          ],
          max_participants: 20,
          current_participants: 11,
          status: "active",
          category: "Stress",
          created_at: "2023-03-05T14:15:00Z"
        }
      ];
      
      setGroups(mockGroups);
      
      toast.info("Note: Using mock data for group examples", {
        description: "The support_groups table has not been created in the database yet"
      });
      
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast.error(error.message || "Failed to load support groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = () => {
    window.location.href = "/ambassador-dashboard/groups/create";
  };

  const handleEditGroup = (groupId: string) => {
    window.location.href = `/ambassador-dashboard/groups/${groupId}/edit`;
  };

  const handleViewParticipants = (groupId: string) => {
    window.location.href = `/ambassador-dashboard/groups/${groupId}/participants`;
  };

  const handleMessageGroup = (groupId: string) => {
    window.location.href = `/ambassador-dashboard/groups/${groupId}/messages`;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Groups</h1>
            <p className="text-gray-500">Manage your support groups and sessions</p>
          </div>
          <Button 
            onClick={handleCreateGroup}
            className="bg-[#0078FF] text-white hover:bg-blue-700"
          >
            + Create New Group
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">Loading groups...</div>
          ) : groups.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No support groups found. Create your first group to get started.
            </div>
          ) : (
            groups.map((group) => (
              <Card key={group.id} className="overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 mt-2">
                        {group.category}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditGroup(group.id)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewParticipants(group.id)}>
                          <Users className="mr-2 h-4 w-4" />
                          View Participants
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMessageGroup(group.id)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message All
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {group.description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Participants</span>
                        <span className="font-medium">
                          {group.current_participants}/{group.max_participants}
                        </span>
                      </div>
                      <Progress 
                        value={(group.current_participants / group.max_participants) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Schedule</div>
                      {group.schedule.map((schedule, index) => (
                        <div 
                          key={index}
                          className="flex items-center text-sm"
                        >
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{schedule.day} at {schedule.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          group.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {group.status}
                        </span>
                        <Button 
                          variant="outline"
                          onClick={() => handleViewParticipants(group.id)}
                          className="text-sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GroupsPage;
