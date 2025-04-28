import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  UserPlus,
  Users,
  Eye,
  MoreVertical,
  MapPin,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format, differenceInHours } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  country: string;
  city: string;
  state: string;
  avatar_url?: string;
  created_at: string;
}

interface SupportGroup {
  id: string;
  name: string;
  ambassador_id: string;
  description: string;
  created_at: string;
}

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  useEffect(() => {
    // Fetch patients first
    fetchPatients();
    
    // Then fetch support groups - temporarily disabled
    // if (user?.id) {
    //   fetchSupportGroups();
    // }

    // Set up real-time subscription for new patients
    const subscription = supabase
      .channel('patient_profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_profiles'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchPatients(); // Refresh the patients list
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      console.log('Starting patient fetch...');

      // First try to get all users with role='patient' and join with their profiles
      const { data: patientUsers, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          role,
          created_at,
          avatar_url,
          patient_profiles!left (
            id,
            first_name,
            last_name,
            phone_number,
            date_of_birth,
            country,
            city,
            state
          )
        `)
        .eq('role', 'patient');

      if (userError) {
        console.error('Error fetching patient users:', userError);
        
        // Fallback to directly querying patient_profiles if users query fails
        const { data: profilesOnly, error: profilesError } = await supabase
          .from('patient_profiles')
          .select('*');

        if (profilesError) {
          console.error('Error in fallback patient profiles query:', profilesError);
          toast.error("Failed to load patients");
          setPatients([]);
          return;
        }

        if (!profilesOnly || profilesOnly.length === 0) {
          console.log('No patient profiles found');
          setPatients([]);
          return;
        }

        // Transform profile data without user data
        const transformedProfiles = profilesOnly.map(profile => ({
          id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name || 'Unknown',
          last_name: profile.last_name || '',
          phone_number: profile.phone_number || '',
          date_of_birth: profile.date_of_birth || '',
          country: profile.country || 'Unknown',
          city: profile.city || '',
          state: profile.state || '',
          avatar_url: undefined,
          created_at: profile.created_at
        }));

        setPatients(transformedProfiles);
        return;
      }

      if (!patientUsers || patientUsers.length === 0) {
        // If no patient users found, try to query auth.users to get all users with role=patient in metadata
        console.log('No patient users found in users table, trying auth.users table...');
        
        const { data: authUsers, error: authError } = await supabase.rpc('get_patient_users');
        
        if (authError || !authUsers || authUsers.length === 0) {
          console.log('No patients found in auth.users either:', authError);
          setPatients([]);
          toast.info("No patients found in the system");
          return;
        }
        
        // Process auth users (these will have limited profile data)
        const authPatients = authUsers.map(user => ({
          id: user.id,
          email: user.email,
          first_name: user.raw_user_meta_data?.first_name || user.email?.split('@')[0] || 'Unknown',
          last_name: user.raw_user_meta_data?.last_name || '',
          phone_number: user.raw_user_meta_data?.phone_number || '',
          date_of_birth: '',
          country: user.raw_user_meta_data?.country || 'Unknown',
          city: '',
          state: '',
          avatar_url: user.raw_user_meta_data?.avatar_url,
          created_at: user.created_at
        }));
        
        console.log('Auth patients:', authPatients);
        setPatients(authPatients);
        return;
      }

      console.log('Found patient users:', patientUsers.length);

      // Transform the joined data
      const transformedData = patientUsers.map(user => {
        const profile = user.patient_profiles?.[0] || {};
        return {
          id: user.id,
          email: user.email,
          first_name: profile.first_name || user.email?.split('@')[0] || 'Unknown',
          last_name: profile.last_name || '',
          phone_number: profile.phone_number || '',
          date_of_birth: profile.date_of_birth || '',
          country: profile.country || 'Unknown',
          city: profile.city || '',
          state: profile.state || '',
          avatar_url: user.avatar_url,
          created_at: user.created_at
        };
      });

      console.log('Transformed patients:', transformedData.length);
      setPatients(transformedData);
    } catch (error) {
      console.error('Error in fetchPatients:', error);
      toast.error("An error occurred while loading patients");
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupportGroups = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available for fetching support groups');
        setSupportGroups([]);
        return;
      }

      console.log('Fetching support groups for ambassador:', user.id);
      
      const { data: groupsData, error: groupsError } = await supabase
        .from('support_groups')
        .select('*')
        .eq('ambassador_id', user.id);

      if (groupsError) {
        console.error('Supabase error fetching support groups:', {
          code: groupsError.code,
          message: groupsError.message,
          details: groupsError.details
        });
        toast.error("Failed to load support groups");
        setSupportGroups([]);
        return;
      }

      if (!groupsData) {
        console.log('No support groups found for ambassador');
        setSupportGroups([]);
        return;
      }

      console.log('Successfully fetched support groups:', groupsData);
      setSupportGroups(groupsData);
      
    } catch (error) {
      // Type guard to check if error is an Error object
      if (error instanceof Error) {
        console.error('Error in fetchSupportGroups:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error in fetchSupportGroups:', error);
      }
      
      toast.error("Failed to load support groups");
      setSupportGroups([]);
    }
  };

  const addToGroup = async (patientId: string, groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: patientId,
          added_by: user?.id
        });

      if (error) throw error;
      toast.success("Patient added to group successfully");
    } catch (error: any) {
      console.error('Error adding patient to group:', error);
      toast.error(error.message || "Failed to add patient to group");
    }
  };

  const viewProfile = (patient: PatientProfile) => {
    setSelectedPatient(patient);
    setIsProfileOpen(true);
  };

  const getFullName = (patient: PatientProfile) => {
    return `${patient.first_name} ${patient.last_name}`;
  };

  const getInitials = (patient: PatientProfile) => {
    return `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase();
  };

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A";
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return age.toString();
  };

  const isNewPatient = (createdAt: string) => {
    const hoursSinceCreation = differenceInHours(new Date(), new Date(createdAt));
    return hoursSinceCreation <= 24; // Consider patients created within last 24 hours as new
  };

  const filteredPatients = patients.filter(patient => {
    if (searchQuery === "") return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      getFullName(patient).toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower) ||
      patient.country.toLowerCase().includes(searchLower) ||
      (patient.city && patient.city.toLowerCase().includes(searchLower))
    );
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-500">View and manage all patients in the platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Users className="w-4 h-4 mr-2" />
              {patients.length} Patients
            </Badge>
          </div>
        </div>

        <Card>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading patients...
                      </TableCell>
                    </TableRow>
                  ) : filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={patient.avatar_url} alt={getFullName(patient)} />
                              <AvatarFallback>{getInitials(patient)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{getFullName(patient)}</span>
                                {isNewPatient(patient.created_at) && (
                                  <Badge className="bg-yellow-500 text-white">NEW</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{patient.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                            <span>{patient.city ? `${patient.city}, ${patient.country}` : patient.country}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getAge(patient.date_of_birth)}</TableCell>
                        <TableCell>{format(new Date(patient.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewProfile(patient)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Profile
                            </Button>
                            {supportGroups.length > 0 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {supportGroups.map((group) => (
                                    <DropdownMenuItem
                                      key={group.id}
                                      onClick={() => addToGroup(patient.id, group.id)}
                                    >
                                      <UserPlus className="w-4 h-4 mr-2" />
                                      Add to {group.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        {/* Patient Profile Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Patient Profile</DialogTitle>
              <DialogDescription>
                Detailed information about the patient
              </DialogDescription>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedPatient.avatar_url} alt={getFullName(selectedPatient)} />
                    <AvatarFallback>{getInitials(selectedPatient)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{getFullName(selectedPatient)}</h3>
                      {isNewPatient(selectedPatient.created_at) && (
                        <Badge className="bg-yellow-500 text-white">NEW</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{selectedPatient.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm">{selectedPatient.phone_number || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-sm">{getAge(selectedPatient.date_of_birth)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm">
                    {selectedPatient.city && `${selectedPatient.city}, `}
                    {selectedPatient.state && `${selectedPatient.state}, `}
                    {selectedPatient.country}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined</label>
                  <p className="text-sm">{format(new Date(selectedPatient.created_at), 'MMMM d, yyyy')}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Add to Support Group</h4>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {supportGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full mt-2"
                    disabled={!selectedGroup}
                    onClick={() => {
                      addToGroup(selectedPatient.id, selectedGroup);
                      setSelectedGroup("");
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add to Group
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PatientsPage; 