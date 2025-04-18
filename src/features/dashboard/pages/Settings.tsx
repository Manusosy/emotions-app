import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().min(30, 'Bio must be at least 30 characters'),
  speciality: z.string().min(1, 'Please select a speciality'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(1, 'Please select your country'),
  languages: z.string().min(1, 'Please enter languages you speak'),
  education: z.string().min(1, 'Please enter your education details'),
  experience: z.string().min(1, 'Please enter your experience'),
  avatar_url: z.string().optional(),
});

const SPECIALITIES = [
  'Anxiety',
  'Depression',
  'Stress Management',
  'Relationship Issues',
  'Trauma',
  'Grief',
  'Self-Esteem',
  'Career',
  'General',
];

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data: profile, error } = await supabase
          .from('ambassador_profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (error) throw error;

        if (profile) {
          setValue('full_name', profile.full_name);
          setValue('bio', profile.bio);
          setValue('speciality', profile.speciality);
          setValue('phone_number', profile.phone_number);
          setValue('country', profile.country);
          setValue('languages', profile.languages);
          setValue('education', profile.education);
          setValue('experience', profile.experience);
          setValue('avatar_url', profile.avatar_url);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadProfile();
    }
  }, [user, setValue]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `ambassador-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setValue('avatar_url', publicUrl);
      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error('Error updating profile photo');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: profileError } = await supabase
        .from('ambassador_profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      const { error: userError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: data.avatar_url,
          full_name: data.full_name,
          country: data.country,
          phone: data.phone_number
        },
      });

      if (userError) throw userError;

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10 px-4">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={watch('avatar_url')} />
                      <AvatarFallback>
                        {watch('full_name')?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <p className="text-sm text-gray-500">
                      Click on the avatar to update your profile picture
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      {...register('full_name')}
                      className="mt-1"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      {...register('phone_number')}
                      className="mt-1"
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...register('country')}
                      className="mt-1"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="languages">Languages</Label>
                    <Input
                      id="languages"
                      {...register('languages')}
                      className="mt-1"
                    />
                    {errors.languages && (
                      <p className="text-red-500 text-sm mt-1">{errors.languages.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="speciality">Speciality</Label>
                    <Select onValueChange={(value) => setValue('speciality', value)} value={watch('speciality')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your speciality" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALITIES.map((speciality) => (
                          <SelectItem key={speciality} value={speciality}>
                            {speciality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.speciality && (
                      <p className="text-red-500 text-sm mt-1">{errors.speciality.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Textarea
                      id="education"
                      {...register('education')}
                      className="mt-1"
                      rows={3}
                    />
                    {errors.education && (
                      <p className="text-red-500 text-sm mt-1">{errors.education.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Textarea
                      id="experience"
                      {...register('experience')}
                      className="mt-1"
                      rows={3}
                    />
                    {errors.experience && (
                      <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="bg-[#001A41] hover:bg-[#001A41]/90 text-white mt-6">
                  Save Changes
                </Button>
              </form>
            </Card>

            {/* Danger Zone */}
            <Card className="mt-8 border-red-200">
              <CardHeader className="border-b border-red-100">
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all of your data
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => navigate(`${location.pathname}/delete-account`)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Account Settings</h3>
              {/* Add account settings here */}
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
              {/* Add notification settings here */}
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Danger Zone - visible on all tabs */}
        <Card className="mt-8 border-red-200">
          <CardHeader className="border-b border-red-100">
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all of your data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => navigate(`${location.pathname}/delete-account`)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 