import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from './BookingModal';

interface AmbassadorCardProps {
  id: string;
  name: string;
  location: string;
  rating: number;
  imageUrl: string;
  isAvailable: boolean;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export function AmbassadorCard({
  id,
  name,
  location,
  rating,
  imageUrl,
  isAvailable,
  onFavorite,
  isFavorited = false,
}: AmbassadorCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleBook = () => {
    navigate(`/book-appointment/${id}`);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Rating Badge */}
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="secondary" className="bg-white/90 text-primary">
              ★ {rating.toFixed(1)}
            </Badge>
          </div>

          {/* Favorite Button */}
          {onFavorite && (
            <button
              onClick={onFavorite}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
            >
              <Heart
                className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'}
                size={20}
              />
            </button>
          )}

          {/* Ambassador Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="p-6">
          {/* Role Badge */}
          <Badge className="mb-2" variant="outline">
            M.H Ambassador
          </Badge>

          {/* Name and Location */}
          <h3 className="text-2xl font-semibold mb-2">{name}</h3>
          <p className="text-muted-foreground mb-4">
            📍 {location} • 30 Min
          </p>

          {/* Availability and Booking */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isAvailable ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span className={isAvailable ? 'text-green-600' : 'text-gray-500'}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <Button
              onClick={() => setIsBookingModalOpen(true)}
              disabled={!isAvailable}
            >
              Book Now
            </Button>
          </div>
        </div>
      </Card>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        ambassadorId={id}
        ambassadorName={name}
      />
    </>
  );
} 