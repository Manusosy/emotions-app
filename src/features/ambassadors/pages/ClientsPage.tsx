
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, MessageSquare, Calendar, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Client } from "@/types/database.types";

const ClientsPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClients();
  }, [user]);

  // Mock client data since the patient_profiles table doesn't exist yet
  const fetchClients = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Mock data
      const mockClients: Client[] = [
        {
          id: "1",
          full_name: "Sophie Miller",
          email: "sophie.miller@example.com",
          avatar_url: "/lovable-uploads/47ac3dae-2498-4dd3-a729-73086f5c34f8.png",
          phone_number: "+1 (555) 123-4567",
          last_session: "2023-03-15",
          total_sessions: 8,
          status: 'active',
          last_appointment: "Mar 15, 2023",
          next_appointment: "Mar 22, 2023"
        },
        {
          id: "2",
          full_name: "Michael Johnson",
          email: "michael.j@example.com",
          avatar_url: "",
          phone_number: "+1 (555) 987-6543",
          last_session: "2023-03-10",
          total_sessions: 5,
          status: 'active',
          last_appointment: "Mar 10, 2023",
          next_appointment: "Mar 24, 2023"
        },
        {
          id: "3",
          full_name: "Emily Chen",
          email: "emily.chen@example.com",
          avatar_url: "",
          phone_number: "+1 (555) 456-7890",
          last_session: "2023-03-08",
          total_sessions: 12,
          status: 'inactive',
          last_appointment: "Mar 8, 2023",
          next_appointment: ""
        }
      ];
      
      setClients(mockClients);
      
      toast.info("Note: Using mock data for client examples", {
        description: "The patient_profiles table has not been created in the database yet"
      });
      
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      toast.error(error.message || "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessageClient = (clientId: string) => {
    // Navigate to messaging interface
    window.location.href = `/ambassador-dashboard/messages/${clientId}`;
  };

  const handleScheduleSession = (clientId: string) => {
    // Navigate to scheduling interface
    window.location.href = `/ambassador-dashboard/schedule/${clientId}`;
  };

  const handleViewProfile = (clientId: string) => {
    // Navigate to client profile
    window.location.href = `/ambassador-dashboard/client/${clientId}`;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-500">Manage and monitor your client relationships</p>
          </div>
          <Button className="bg-[#0078FF] text-white hover:bg-blue-700">
            + Add New Client
          </Button>
        </div>

        <Card className="mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">Loading clients...</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No clients found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Last Session</TableHead>
                    <TableHead>Total Sessions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {client.avatar_url ? (
                              <img
                                src={client.avatar_url}
                                alt={client.full_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-gray-600">
                                {client.full_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{client.full_name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone_number}</TableCell>
                      <TableCell>{client.last_appointment}</TableCell>
                      <TableCell>{client.total_sessions}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {client.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleMessageClient(client.id)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleScheduleSession(client.id)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule Session
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewProfile(client.id)}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;
