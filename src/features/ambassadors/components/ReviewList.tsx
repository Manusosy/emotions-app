import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    full_name: string;
    avatar_url: string;
  };
}

interface ReviewListProps {
  ambassadorId: string;
}

export function ReviewList({ ambassadorId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    loadReviews();
  }, [ambassadorId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('ambassador_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          users:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('ambassador_id', ambassadorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No reviews yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={review.users.avatar_url || '/default-avatar.png'}
                  alt={`${review.users.full_name}'s avatar`}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <CardTitle className="text-sm font-medium">
                    {review.users.full_name}
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(review.created_at), 'PPP')}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 