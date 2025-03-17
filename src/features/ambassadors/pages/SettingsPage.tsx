import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";

interface SettingsFormData {
  full_name: string;
  email: string;
  phone_number: string;
  bio: string;
  specialties: string[];
  languages: string[];
  education: string;
  experience: string;
  available: boolean;
  avatar_url: string;
  avatar: File | null;
}

const availabilityOptions = [
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
  { value: "busy", label: "Busy" }
];

const specialtyOptions = [
  "Anxiety",
  "Depression",
  "Stress Management",
  "Trauma",
  "Relationships",
  "Self-Esteem",
  "Grief",
  "Career",
  "Life Transitions",
  "Identity",
  "LGBTQ+",
  "Cultural Issues"
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SettingsFormData>({
    full_name: "",
    email: "",
    phone_number: "",
    bio: "",
    specialties: [],
    languages: [],
    education: "",
    experience: "",
    available: false,
    avatar_url: "",
    avatar: null
  });

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("ambassador_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setFormData({
        ...formData,
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        bio: data?.bio || '',
        avatar: null,
        avatar_url: data?.avatar_url || user.user_metadata?.avatar_url || '',
        phone_number: data?.phone_number || user.user_metadata?.phone_number || '',
        available: data?.availability_status === 'Available'
      });
    } catch (error: any) {
      toast.error(error.message || "Error fetching profile");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        avatar: e.target.files![0]
      }));
    }
  };

  const handleSpecialtyAdd = (specialty: string) => {
    if (!formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
    }
  };

  const handleSpecialtyRemove = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Handle avatar upload if there's a new file
      let avatarUrl = formData.avatar_url;
      if (formData.avatar) {
        const fileExt = formData.avatar.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, formData.avatar);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("ambassador_profiles")
        .update({
          bio: formData.bio,
          speciality: formData.specialties.join(','),  // Store as comma-separated string
          education: formData.education,
          availability_status: formData.available ? 'Available' : 'Unavailable',
          avatar_url: avatarUrl,
          phone_number: formData.phone_number,
          full_name: formData.full_name,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4 mt-2">
                <img
                  src={formData.avatar_url || "/default-avatar.png"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={e => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
              />
            </div>

            <div>
              <Label>Specialties</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.specialties.map(specialty => (
                  <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleSpecialtyRemove(specialty)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={handleSpecialtyAdd}>
                <SelectTrigger>
                  <SelectValue placeholder="Add a specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={e => setFormData(prev => ({ ...prev, education: e.target.value }))}
              />
            </div>

            <div>
              <Label>Availability Status</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.available}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, available: checked }))}
                />
                <span className="text-sm text-gray-600">
                  {formData.available ? "Available for Sessions" : "Not Available"}
                </span>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
