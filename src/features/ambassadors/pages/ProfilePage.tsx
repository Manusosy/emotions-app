
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/DashboardLayout';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (formData: any) => {
    try {
      setLoading(true);

      // Handle avatar upload if there's a new file
      let avatarUrl = formData.avatar_url;
      if (formData.avatar && formData.avatar instanceof File) {
        const fileExt = formData.avatar.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, formData.avatar);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('ambassador_profiles')
        .update({
          full_name: formData.full_name,
          avatar_url: avatarUrl,
          phone_number: formData.phone_number,
          bio: formData.bio,
          speciality: formData.specialties,
          hourly_rate: formData.hourly_rate,
          availability_status: formData.availability_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <p>Profile management functionality is currently under development.</p>
      </div>
    </DashboardLayout>
  );
}
