
import { useState, useEffect } from "react";
import { Star, MapPin, Clock, Globe2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

export default function AmbassadorsGrid() {
  const navigate = useNavigate();
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'ambassador');

      if (error) throw error;
      setAmbassadors(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Error fetching ambassadors');
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ambassadors.map((ambassador) => (
          <Card key={ambassador.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-4">
                <img
                  src={ambassador.avatar_url || '/default-avatar.png'}
                  alt={ambassador.full_name}
                  className="w-16 h-16 rounded-full object-cover"
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
