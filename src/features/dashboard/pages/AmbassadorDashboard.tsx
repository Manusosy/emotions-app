
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
import { Switch } from '@/components/ui/switch';
import { ReviewList } from '@/features/ambassadors/components/ReviewList';

interface Booking {
  id: string;
  session_date: string;
  session_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

export function AmbassadorDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      
      setUserId(user.id);

      // Load availability status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('availability_status')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setIsAvailable(profile.availability_status);

      // Load bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          session_date,
          session_time,
          status,
          notes,
          user:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('ambassador_id', user.id)
        .order('session_date', { ascending: false });

      if (bookingsError) throw bookingsError;

      setBookings(bookingsData || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async () => {
    try {
      if (!userId) return;

      const newStatus = !isAvailable;

      const { error } = await supabase
        .from('profiles')
        .update({ availability_status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setIsAvailable(newStatus);
      toast.success(
        `You are now ${newStatus ? 'available' : 'unavailable'} for bookings`
      );
    } catch (error) {
      toast.error('Failed to update availability');
      console.error('Error updating availability:', error);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Booking status updated');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to update booking status');
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ambassador Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Available for bookings
          </span>
          <Switch
            checked={isAvailable}
            onCheckedChange={handleAvailabilityChange}
          />
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Sessions</h2>
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  You have no upcoming sessions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <img
                        src={booking.user.avatar_url || '/default-avatar.png'}
                        alt={`${booking.user.full_name}'s avatar`}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <CardTitle className="text-lg">
                          {booking.user.full_name}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(booking.session_date), 'PPP')} at{' '}
                          {booking.session_time}
                        </CardDescription>
                      </div>
                    </div>
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
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleStatusUpdate(booking.id, 'confirmed')
                            }
                            className="flex-1"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleStatusUpdate(booking.id, 'cancelled')
                            }
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(booking.id, 'completed')
                          }
                          className="w-full"
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Reviews</h2>
          {userId && <ReviewList ambassadorId={userId} />}
        </div>
      </div>
    </div>
  );
}
