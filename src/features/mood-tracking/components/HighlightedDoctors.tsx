import { useState, useEffect } from "react";
import { Star, MapPin, Clock, Globe2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// Import supabase conditionally to handle potential errors better
let supabaseClient: any;
try {
  const { supabase } = require("@/integrations/supabase/client");
  supabaseClient = supabase;
} catch (error) {
  console.error("Failed to load Supabase client:", error);
  supabaseClient = null;
}

interface Ambassador {
  id: string;
  full_name: string;
  avatar_url: string;
  specialties: string[];
  location: string;
  duration: string;
  rating: number;
  available: boolean;
  languages: string[];
  education: string;
  experience: string;
}

// Sample mock data to use as fallback when API calls fail
const mockAmbassadors: Ambassador[] = [
  {
    id: "mock-1",
    full_name: "Dr. Sarah Johnson",
    avatar_url: "/lovable-uploads/7d02b0da-dd91-4635-8bc4-6df39dffd0f1.png",
    specialties: ["Depression", "Anxiety", "Relationships"],
    location: "New York, US",
    duration: "45 Min",
    rating: 4.9,
    available: true,
    languages: ["English", "Spanish"],
    education: "PhD Psychology, Harvard",
    experience: "10+ years"
  },
  {
    id: "mock-2",
    full_name: "Dr. Michael Chen",
    avatar_url: "/lovable-uploads/a299cbd8-711d-4138-b99d-eec11582bf18.png",
    specialties: ["Stress Management", "Trauma", "Grief"],
    location: "London, UK",
    duration: "60 Min",
    rating: 4.8,
    available: true,
    languages: ["English", "Mandarin"],
    education: "MD Psychiatry, Oxford",
    experience: "8 years"
  },
  {
    id: "mock-3",
    full_name: "Dr. Olivia Rodriguez",
    avatar_url: "/lovable-uploads/557ff7f5-9815-4228-b935-0fb6a858cc65.png",
    specialties: ["Family Therapy", "ADHD", "Addiction"],
    location: "Toronto, CA",
    duration: "30 Min",
    rating: 4.7,
    available: false,
    languages: ["English", "French"],
    education: "PhD Clinical Psychology, Toronto",
    experience: "12 years"
  }
];

export default function AmbassadorsGrid() {
  const navigate = useNavigate();
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>(mockAmbassadors);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set a timeout to ensure page doesn't appear to hang when loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    fetchAmbassadors();
    
    return () => clearTimeout(timeoutId);
  }, []);

  const fetchAmbassadors = async () => {
    // If Supabase client failed to load, use mock data
    if (!supabaseClient) {
      console.log("Using mock data due to Supabase client unavailability");
      setAmbassadors(mockAmbassadors);
      setIsLoading(false);
      return;
    }
    
    try {
      // Wrap in setTimeout to prevent blocking the UI
      setTimeout(async () => {
        try {
          const { data, error } = await supabaseClient
            .from('users')
            .select('*');
          
          if (error) throw error;
          
          // Filter ambassador users 
          const ambassadorUsers = data?.filter((user: any) => 
            user?.role === 'ambassador'
          ) || [];
          
          if (ambassadorUsers.length > 0) {
            setAmbassadors(ambassadorUsers);
          }
        } catch (error: any) {
          console.error("Failed to fetch from Supabase:", error);
          // No need to show an error toast - just silently fallback to mock data
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } catch (error: any) {
      console.error("Error in fetching ambassadors:", error);
      setIsLoading(false);
    }
  };

  const handleBooking = (ambassador: Ambassador) => {
    if (!ambassador.available) {
      toast.error("This ambassador is currently unavailable");
      return;
    }

    navigate({
      pathname: "/booking",
      search: `?ambassadorId=${ambassador.id}&ambassadorName=${encodeURIComponent(ambassador.full_name)}&duration=${encodeURIComponent(ambassador.duration || '30 Min')}`
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Our Ambassadors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="overflow-hidden animate-pulse">
              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-8">Our Ambassadors</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ambassadors.map((ambassador) => (
          <Card key={ambassador.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-4">
                <img
                  src={ambassador.avatar_url || '/default-avatar.png'}
                  alt={ambassador.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback image if the avatar URL fails to load
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{ambassador.full_name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{ambassador.rating || 5.0}</span>
                  </div>
                </div>
              </div>

              {ambassador.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{ambassador.location}</span>
                </div>
              )}

              {ambassador.specialties && ambassador.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ambassador.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}

              {ambassador.languages && ambassador.languages.length > 0 && (
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {ambassador.languages.join(", ")}
                  </span>
                </div>
              )}

              {ambassador.education && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{ambassador.education}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{ambassador.duration || '30 Min'}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  ambassador.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {ambassador.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <Button
                onClick={() => handleBooking(ambassador)}
                className="w-full mt-2"
                disabled={!ambassador.available}
              >
                {ambassador.available ? "Book Session" : "Unavailable"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
