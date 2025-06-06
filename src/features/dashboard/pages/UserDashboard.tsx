
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ReviewModal } from '@/features/ambassadors/components/ReviewModal';

interface Booking {
  id: string;
  session_date: string;
  session_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  ambassador: {
    id: string;
    full_name: string;
  };
  has_review: boolean;
}

export function UserDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      // Modified query to be more explicit with column names
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          session_date,
          session_time,
          status,
          notes,
          ambassador_info:ambassador_id (
            id,
            full_name
          ),
          has_review:ambassador_reviews!left(id)
        `)
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface with proper error handling
      const processedBookings = (data || []).map(booking => {
        // Safely extract ambassador info, defaulting if there's an error
        const ambassadorInfo = booking.ambassador_info && typeof booking.ambassador_info === 'object' ? 
          { 
            id: (booking.ambassador_info as any).id || '',
            full_name: (booking.ambassador_info as any).full_name || 'Unknown Ambassador'
          } : 
          { 
            id: '', // Remove reference to ambassador_id
            full_name: 'Unknown Ambassador' 
          };
        
        return {
          id: booking.id,
          session_date: booking.session_date,
          session_time: booking.session_time,
          status: (booking.status || 'pending') as 'pending' | 'confirmed' | 'cancelled' | 'completed',
          notes: booking.notes || '',
          ambassador: ambassadorInfo,
          has_review: Array.isArray(booking.has_review) && booking.has_review.length > 0
        };
      });
      
      setBookings(processedBookings);
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error('Error loading bookings:', error);
    }
  };

  const handleReviewClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  const handleReviewComplete = () => {
    loadBookings();
    setIsReviewModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Sessions</h2>
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  You haven't booked any sessions yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle>{booking.ambassador.full_name}</CardTitle>
                    <CardDescription>
                      {format(new Date(booking.session_date), 'PPP')} at{' '}
                      {booking.session_time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {booking.status}
                        </p>
                      </div>
                      {booking.notes && (
                        <div>
                          <p className="text-sm font-medium">Notes</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.notes}
                          </p>
                        </div>
                      )}
                      {booking.status === 'completed' && !booking.has_review && (
                        <Button
                          onClick={() => handleReviewClick(booking)}
                          className="w-full"
                        >
                          Leave a Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleReviewComplete}
          bookingId={selectedBooking.id}
          ambassadorId={selectedBooking.ambassador.id}
          ambassadorName={selectedBooking.ambassador.full_name}
        />
      )}
    </div>
  );
}
