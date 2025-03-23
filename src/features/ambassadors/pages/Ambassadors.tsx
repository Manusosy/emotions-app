
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Ambassador {
  id: string;
  full_name: string;
  avatar_url: string;
  speciality: string;
  country: string;
  rating: number;
  availability_status: 'Available' | 'Unavailable';
}

export default function Ambassadors() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
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

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!data.onboarding_completed) {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const loadAmbassadors = async () => {
    try {
      const { data, error } = await supabase
        .from('ambassador_profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          speciality,
          country,
          rating,
          availability_status
        `);

      if (error) throw error;

      setAmbassadors(data || []);
    } catch (error) {
      toast.error('Failed to load ambassadors');
      console.error('Error loading ambassadors:', error);
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

  const handleBooking = (ambassadorId: string) => {
    navigate(`/booking?ambassadorId=${ambassadorId}`);
  };

  if (needsOnboarding) {
    return <div>Onboarding component</div>;
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="inline-block bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-full mb-6">
            Mental Health Support
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#001A41] mb-6 leading-tight">
            Our Compassionate Ambassadors
          </h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Connect with our dedicated mental health ambassadors who provide empathetic support and guidance. 
            Book a free 30-minute session to discuss your concerns in a safe, confidential environment.
          </p>
        </div>

        {/* Booking Guide */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <h2 className="text-2xl font-semibold text-[#001A41] mb-6 text-center">
              How to Book a Session
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Browse Ambassadors</h3>
                  <p className="text-gray-600">Explore our available mental health ambassadors</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Check Specialties</h3>
                  <p className="text-gray-600">Find the best match for your needs</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Book Your Session</h3>
                  <p className="text-gray-600">Click "Book Now" on your chosen ambassador</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Confirm Time</h3>
                  <p className="text-gray-600">Select a convenient time slot</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambassadors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ambassadors.map((ambassador) => (
            <div
              key={ambassador.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative">
                <img
                  src={ambassador.avatar_url || '/default-avatar.png'}
                  alt={ambassador.full_name}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(ambassador.id)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className={`w-6 h-6 ${
                      favorites.includes(ambassador.id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-orange-500" />
                    {ambassador.rating.toFixed(1)}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="text-blue-600 font-medium">
                    {ambassador.speciality}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mt-1">
                    {ambassador.full_name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{ambassador.country}</span>
                  <span className="mx-2">•</span>
                  <span>30 Min Session</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-gray-900">
                    <span className="text-green-600 font-medium">Free Session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={ambassador.availability_status === 'Available' ? 'success' : 'destructive'}
                      className="font-normal"
                    >
                      {ambassador.availability_status}
                    </Badge>
                    <Button
                      onClick={() => handleBooking(ambassador.id)}
                      disabled={ambassador.availability_status !== 'Available'}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
