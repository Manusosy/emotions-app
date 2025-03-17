import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

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
        .from('users')
        .update({
          full_name: formData.full_name,
          avatar_url: avatarUrl,
          phone_number: formData.phone_number,
          bio: formData.bio,
          specialties: formData.specialties,
          languages: formData.languages,
          education: formData.education,
          experience: formData.experience,
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

  // ... rest of the component code ...
} 