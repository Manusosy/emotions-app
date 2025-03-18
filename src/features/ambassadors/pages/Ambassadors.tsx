
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

import { AmbassadorCard } from '../components/AmbassadorCard';
import { AmbassadorOnboarding } from '../components/AmbassadorOnboarding';

interface Ambassador {
  id: string;
  full_name: string;
  avatar_url: string;
  location: string;
  rating: number;
  availability_status: boolean;
}

export default function Ambassadors() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkOnboardingStatus();
    loadAmbassadors();
    loadFavorites();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      // Use profiles table instead of users
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Since we can't check role directly, we'll rely on onboarding_completed only
      if (!data.onboarding_completed) {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const loadAmbassadors = async () => {
    try {
      // Query the ambassador_profiles table directly
      const { data, error } = await supabase
        .from('ambassador_profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          speciality,
          hourly_rate,
          availability_status
        `);

      if (error) throw error;

      // Transform the data to match our Ambassador interface
      const formattedAmbassadors = data?.map((item) => ({
        id: item.id,
        full_name: item.full_name || 'Unnamed Ambassador',
        avatar_url: item.avatar_url || '',
        location: item.speciality || 'General', // Using speciality as location
        rating: 5, // Default rating
        availability_status: item.availability_status === 'Available',
      })) || [];

      setAmbassadors(formattedAmbassadors);
    } catch (error) {
      toast.error('Failed to load ambassadors');
      console.error('Error loading ambassadors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      const { data, error } = await supabase
        .from('favorite_ambassadors')
        .select('ambassador_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites((data || []).map((item) => item.ambassador_id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (ambassadorId: string) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      const isFavorited = favorites.includes(ambassadorId);

      if (isFavorited) {
        await supabase
          .from('favorite_ambassadors')
          .delete()
          .eq('user_id', user.id)
          .eq('ambassador_id', ambassadorId);

        setFavorites(favorites.filter((id) => id !== ambassadorId));
      } else {
        await supabase.from('favorite_ambassadors').insert({
          user_id: user.id,
          ambassador_id: ambassadorId,
        });

        setFavorites([...favorites, ambassadorId]);
      }
    } catch (error) {
      toast.error('Failed to update favorites');
      console.error('Error updating favorites:', error);
    }
  };

  if (needsOnboarding) {
    return <AmbassadorOnboarding />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mental Health Ambassadors</h1>
          <p className="text-muted-foreground mt-2">
            Connect with our dedicated mental health ambassadors for support and guidance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ambassadors.map((ambassador) => (
          <AmbassadorCard
            key={ambassador.id}
            id={ambassador.id}
            name={ambassador.full_name}
            location={ambassador.location}
            rating={ambassador.rating}
            imageUrl={ambassador.avatar_url}
            isAvailable={ambassador.availability_status}
            onFavorite={() => toggleFavorite(ambassador.id)}
            isFavorited={favorites.includes(ambassador.id)}
          />
        ))}
      </div>
    </div>
  );
}
