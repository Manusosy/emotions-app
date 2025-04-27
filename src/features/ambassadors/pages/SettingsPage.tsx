import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Image as ImageIcon, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  Plus, 
  Brain,
  Users,
  MessageSquare,
  Activity,
  Star,
  Heart,
  Shield,
  Baby
} from "lucide-react";
import { ProfileCompletion } from "../components/ProfileCompletion";
import { LucideIcon } from "lucide-react";

interface TherapyType {
  name: string;
  icon: LucideIcon;
}

interface SettingsFormData {
  full_name: string;
  email: string;
  phone_number: string;
  bio: string;
  specialties: string[];
  languages: string[];
  education: {
    university: string;
    degree: string;
    period: string;
  }[];
  experience: {
    company: string;
    position: string;
    period: string;
    duration: string;
  }[];
  credentials: string;
  specialty: string;
  location: string;
  therapyTypes: TherapyType[];
  services: string[];
  awards: {
    title: string;
    year: string;
    description: string;
  }[];
  availability_status: string;
  consultation_fee: number;
  isFree: boolean;
  avatar_url: string;
  avatar: File | null;
  gallery_images: string[];
}

const defaultEducation = {
  university: "",
  degree: "",
  period: ""
};

const defaultExperience = {
  company: "",
  position: "",
  period: "",
  duration: ""
};

const defaultAward = {
  title: "",
  year: "",
  description: ""
};

const therapyTypeOptions: TherapyType[] = [
  { name: "Cognitive Behavioral Therapy", icon: Brain },
  { name: "EMDR Therapy", icon: Activity },
  { name: "Mindfulness", icon: Heart },
  { name: "Group Therapy", icon: Users },
  { name: "Trauma-Focused CBT", icon: Shield },
  { name: "Family Counseling", icon: Users },
  { name: "Couples Therapy", icon: Heart },
  { name: "Child Psychology", icon: Baby }
];

const africanLanguages = [
  // Official/International Languages
  "English",
  "French",

  // East Africa
  "Swahili",
  "Amharic",
  "Oromo",
  "Somali",
  "Tigrinya",
  
  // West Africa
  "Yoruba",
  "Igbo",
  "Hausa",
  "Fulani",
  "Akan",
  "Twi",
  "Wolof",
  "Mandinka",
  
  // Central Africa
  "Lingala",
  "Kikongo",
  "Tshiluba",
  "Sango",
  
  // Southern Africa
  "Zulu",
  "Xhosa",
  "Shona",
  "Ndebele",
  "Tswana",
  "Sotho",
  "Swati",
  
  // North Africa
  "Arabic",
  "Berber",
  "Tamazight",
  "Kabyle",
  
  // Other major African languages
  "Bambara",
  "Ewe",
  "Fon",
  "Kinyarwanda",
  "Kirundi",
  "Luganda",
  "Luo",
  "Malagasy",
  "Moore",
  "Nyanja",
  "Oromo",
  "Tigre",
  "Umbundu"
].sort();

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

// Helper function to decode base64 if needed
function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return str;
  }
}

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
    education: [defaultEducation],
    experience: [defaultExperience],
    credentials: "",
    specialty: "",
    location: "",
    therapyTypes: [] as TherapyType[],
    services: [],
    awards: [defaultAward],
    availability_status: "Available",
    consultation_fee: 0,
    isFree: true,
    avatar_url: "",
    avatar: null,
    gallery_images: []
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

      // Map the stored therapy types to their corresponding Lucide icons
      const mappedTherapyTypes = (data?.therapyTypes || []).map((type: { name: string }) => {
        const matchingType = therapyTypeOptions.find(t => t.name === type.name);
        return matchingType || null;
      }).filter((type: TherapyType | null): type is TherapyType => type !== null);

      setFormData(prev => ({
        ...prev,
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        bio: data?.bio || '',
        avatar: null,
        avatar_url: data?.avatar_url || user.user_metadata?.avatar_url || '',
        phone_number: data?.phone_number || user.user_metadata?.phone_number || '',
        availability_status: data?.availability_status || 'Available',
        therapyTypes: mappedTherapyTypes,
        specialties: data?.specialties || [],
        languages: data?.languages || [],
        education: data?.education || [defaultEducation],
        experience: data?.experience || [defaultExperience],
        awards: data?.awards || [defaultAward],
        location: data?.location || '',
        consultation_fee: data?.consultation_fee || 0,
        isFree: data?.isFree ?? true,
        gallery_images: data?.gallery_images || []
      }));
    } catch (error: any) {
      toast.error(error.message || "Error fetching profile");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, avatar: file }));
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          gallery_images: [...prev.gallery_images, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  const handleSpecialtyAdd = (value: string) => {
    if (!formData.specialties.includes(value)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, value]
      }));
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const handleTherapyTypeToggle = (type: TherapyType) => {
    setFormData(prev => {
      const exists = prev.therapyTypes.some(t => t.name === type.name);
      const updatedTypes = exists
        ? prev.therapyTypes.filter(t => t.name !== type.name)
        : [...prev.therapyTypes, type];
      return { ...prev, therapyTypes: updatedTypes };
    });
  };

  const handleLanguageAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const language = e.currentTarget.value.trim();
      if (!formData.languages.includes(language)) {
        setFormData(prev => ({
          ...prev,
          languages: [...prev.languages, language]
        }));
      }
      e.currentTarget.value = '';
    }
  };

  const handleRemoveLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (index: number, field: keyof typeof defaultEducation, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { ...defaultEducation }]
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleExperienceChange = (index: number, field: keyof typeof defaultExperience, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { ...defaultExperience }]
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleAwardChange = (index: number, field: keyof typeof defaultAward, value: string) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.map((award, i) =>
        i === index ? { ...award, [field]: value } : award
      )
    }));
  };

  const handleAddAward = () => {
    setFormData(prev => ({
      ...prev,
      awards: [...prev.awards, { ...defaultAward }]
    }));
  };

  const handleRemoveAward = (index: number) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) throw new Error("User not authenticated");

      // Prepare therapy types for storage (only store name and icon name)
      const therapyTypesForStorage = formData.therapyTypes.map(type => ({
        name: type.name,
        iconName: type.icon.displayName || type.icon.name
      }));

      // Upload new gallery images
      const galleryImages = await Promise.all(
        formData.gallery_images.map(async (image, index) => {
          if (image.startsWith('data:')) {
            // This is a new image that needs to be uploaded
            const base64Data = image.split(',')[1];
            const filePath = `${user.id}/gallery/${index}-${Date.now()}.jpg`;
            
            const { error: uploadError } = await supabase.storage
              .from('gallery')
              .upload(filePath, decodeBase64(base64Data), {
                contentType: 'image/jpeg',
                upsert: true
              });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('gallery')
              .getPublicUrl(filePath);

            return publicUrl;
          }
          return image;
        })
      );

      const updates = {
        id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        bio: formData.bio,
        specialties: formData.specialties,
        languages: formData.languages,
        education: formData.education,
        experience: formData.experience,
        credentials: formData.credentials,
        specialty: formData.specialty,
        location: formData.location,
        therapyTypes: therapyTypesForStorage,
        services: formData.services,
        awards: formData.awards,
        availability_status: formData.availability_status,
        consultation_fee: formData.consultation_fee,
        isFree: formData.isFree,
        avatar_url: formData.avatar_url,
        gallery_images: galleryImages,
        updated_at: new Date().toISOString()
      };

      // Upload avatar if changed
      if (formData.avatar) {
        const avatarFile = formData.avatar;
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        updates.avatar_url = publicUrl;
      }

      // Update profile in database
      const { error } = await supabase
        .from('ambassador_profiles')
        .upsert(updates);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your profile and account preferences</p>
          </div>
          <Button 
            onClick={handleSubmit} 
            className="bg-[#20C0F3] hover:bg-[#20C0F3]/90 text-white w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </div>

        {/* Profile Completion Card */}
        <div className="mb-8">
          <ProfileCompletion profile={formData} />
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Personal Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-[#20C0F3]" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700">Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Dr. John Doe"
                    className="border-gray-200 focus-visible:ring-[#20C0F3]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doctor@example.com"
                    className="border-gray-200 focus-visible:ring-[#20C0F3]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Phone Number</Label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="border-gray-200 focus-visible:ring-[#20C0F3]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="New York, USA"
                    className="border-gray-200 focus-visible:ring-[#20C0F3]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Write a brief description about yourself..."
                  className="min-h-[120px] border-gray-200 focus-visible:ring-[#20C0F3]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Write a brief professional bio that highlights your expertise and approach to therapy.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Media */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ImageIcon className="h-5 w-5 text-[#20C0F3]" />
                Profile Media
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Avatar Upload */}
              <div>
                <Label className="text-gray-700 block mb-4">Profile Picture</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Avatar className="h-32 w-32 rounded-full border-4 border-gray-100 shadow-sm">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="bg-[#20C0F3] text-white text-xl">
                      {formData.full_name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="border-gray-200 focus-visible:ring-[#20C0F3]"
                    />
                    <p className="text-sm text-gray-500">
                      Upload a professional profile picture. Recommended: Square image, at least 400x400px.
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <Label className="text-gray-700 block mb-4">Gallery Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.gallery_images.map((image, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveGalleryImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#20C0F3] transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto" />
                      <span className="text-sm text-gray-500 mt-2">Add Image</span>
                    </div>
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Add up to 8 images showcasing your practice, workspace, or professional achievements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Briefcase className="h-5 w-5 text-[#20C0F3]" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Specialties */}
              <div>
                <Label className="text-gray-700 block mb-2">Specialties</Label>
                <p className="text-sm text-gray-500 mb-4">Add your areas of expertise and specialization</p>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-[#20C0F3]/10 text-[#20C0F3] hover:bg-[#20C0F3]/20 transition-colors py-1.5 px-3"
                    >
                      {specialty}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-2 hover:bg-transparent hover:text-red-500"
                        onClick={() => handleRemoveSpecialty(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add specialty..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSpecialtyAdd(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-32 h-9 border-gray-200 focus-visible:ring-[#20C0F3]"
                  />
                </div>
              </div>

              {/* Therapy Types */}
              <div>
                <Label className="text-gray-700 block mb-2">Therapy Types</Label>
                <p className="text-sm text-gray-500 mb-4">Select the types of therapy you provide</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {therapyTypeOptions.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.therapyTypes.some(t => t.name === type.name);
                    return (
                      <Button
                        key={type.name}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-auto py-3 px-4 justify-start gap-3 ${
                          isSelected 
                            ? "bg-[#20C0F3] hover:bg-[#20C0F3]/90 text-white" 
                            : "hover:border-[#20C0F3] hover:text-[#20C0F3]"
                        }`}
                        onClick={() => handleTherapyTypeToggle(type)}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{type.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label className="text-gray-700 block mb-2">Languages</Label>
                <p className="text-sm text-gray-500 mb-4">Select the languages you can provide therapy in</p>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((language, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-[#20C0F3]/10 text-[#20C0F3] hover:bg-[#20C0F3]/20 transition-colors py-1.5 px-3"
                    >
                      {language}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-2 hover:bg-transparent hover:text-red-500"
                        onClick={() => handleRemoveLanguage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Select
                    onValueChange={(value) => {
                      if (!formData.languages.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          languages: [...prev.languages, value]
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px] border-gray-200 focus:ring-[#20C0F3]">
                      <SelectValue placeholder="Select language..." />
                    </SelectTrigger>
                    <SelectContent>
                      {africanLanguages.map((language) => (
                        <SelectItem 
                          key={language} 
                          value={language}
                          disabled={formData.languages.includes(language)}
                        >
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected languages will appear as tags above. Click the X to remove a language.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="h-5 w-5 text-[#20C0F3]" />
                Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Education */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-gray-700 block">Education</Label>
                    <p className="text-sm text-gray-500 mt-1">Add your educational background</p>
                  </div>
                  <Button
                    onClick={handleAddEducation}
                    variant="outline"
                    className="border-[#20C0F3] text-[#20C0F3] hover:bg-[#20C0F3]/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
                <div className="space-y-6">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="relative p-4 rounded-lg border border-gray-200 bg-white">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 hover:text-red-500"
                        onClick={() => handleRemoveEducation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700">University/Institution</Label>
                          <Input
                            value={edu.university}
                            onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                            placeholder="Harvard University"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            placeholder="Master of Psychology"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Period</Label>
                          <Input
                            value={edu.period}
                            onChange={(e) => handleEducationChange(index, 'period', e.target.value)}
                            placeholder="2018 - 2020"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-gray-700 block">Experience</Label>
                    <p className="text-sm text-gray-500 mt-1">Add your professional experience</p>
                  </div>
                  <Button
                    onClick={handleAddExperience}
                    variant="outline"
                    className="border-[#20C0F3] text-[#20C0F3] hover:bg-[#20C0F3]/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
                <div className="space-y-6">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="relative p-4 rounded-lg border border-gray-200 bg-white">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 hover:text-red-500"
                        onClick={() => handleRemoveExperience(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700">Company/Organization</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            placeholder="Mental Health Clinic"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Position</Label>
                          <Input
                            value={exp.position}
                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                            placeholder="Senior Therapist"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Period</Label>
                          <Input
                            value={exp.period}
                            onChange={(e) => handleExperienceChange(index, 'period', e.target.value)}
                            placeholder="2020 - Present"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Duration</Label>
                          <Input
                            value={exp.duration}
                            onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                            placeholder="3 years"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Awards & Recognition */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-gray-700 block">Awards & Recognition</Label>
                    <p className="text-sm text-gray-500 mt-1">Add your achievements and recognition</p>
                  </div>
                  <Button
                    onClick={handleAddAward}
                    variant="outline"
                    className="border-[#20C0F3] text-[#20C0F3] hover:bg-[#20C0F3]/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Award
                  </Button>
                </div>
                <div className="space-y-6">
                  {formData.awards.map((award, index) => (
                    <div key={index} className="relative p-4 rounded-lg border border-gray-200 bg-white">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 hover:text-red-500"
                        onClick={() => handleRemoveAward(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700">Award Title</Label>
                          <Input
                            value={award.title}
                            onChange={(e) => handleAwardChange(index, 'title', e.target.value)}
                            placeholder="Excellence in Therapy"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Year</Label>
                          <Input
                            value={award.year}
                            onChange={(e) => handleAwardChange(index, 'year', e.target.value)}
                            placeholder="2022"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Description</Label>
                          <Input
                            value={award.description}
                            onChange={(e) => handleAwardChange(index, 'description', e.target.value)}
                            placeholder="Brief description of the award"
                            className="border-gray-200 focus-visible:ring-[#20C0F3]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability & Fees */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-5 w-5 text-[#20C0F3]" />
                Availability & Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Availability Status */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div>
                  <Label className="text-gray-700 block mb-1">Availability Status</Label>
                  <p className="text-sm text-gray-500">Set your current availability for new clients</p>
                </div>
                <Select
                  value={formData.availability_status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, availability_status: value }))}
                >
                  <SelectTrigger className="w-[180px] border-gray-200 focus:ring-[#20C0F3]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Limited">Limited Availability</SelectItem>
                    <SelectItem value="Unavailable">Not Available</SelectItem>
                    <SelectItem value="Waitlist">Waitlist Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Free Consultations */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div>
                  <Label className="text-gray-700 block mb-1">Free Consultations</Label>
                  <p className="text-sm text-gray-500">Offer free initial consultations to new clients</p>
                </div>
                <Switch
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked }))}
                  className="data-[state=checked]:bg-[#20C0F3]"
                />
              </div>

              {/* Consultation Fee */}
              <div className="p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-gray-700 block mb-1">Consultation Fee</Label>
                    <p className="text-sm text-gray-500">Set your fee for therapy sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-lg">$</span>
                  <Input
                    type="number"
                    value={formData.consultation_fee}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      consultation_fee: parseInt(e.target.value) || 0
                    }))}
                    disabled={formData.isFree}
                    className={`max-w-[200px] text-right border-gray-200 focus-visible:ring-[#20C0F3] ${
                      formData.isFree ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                    placeholder="0.00"
                  />
                  <span className="text-gray-500">per session</span>
                </div>
                {formData.isFree && (
                  <p className="text-sm text-gray-500 mt-2">
                    Fee settings are disabled while free consultations are enabled
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Changes Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit} 
              className="bg-[#20C0F3] hover:bg-[#20C0F3]/90 text-white px-8"
            >
              Save All Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
