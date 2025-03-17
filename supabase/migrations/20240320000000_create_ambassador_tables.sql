-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Add ambassador-specific fields to profiles table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN location text,
        ADD COLUMN rating decimal DEFAULT 5.0,
        ADD COLUMN availability_status boolean DEFAULT true,
        ADD COLUMN onboarding_completed boolean DEFAULT false;
    END IF;
END $$;

-- Create table for ambassador bookings
CREATE TABLE IF NOT EXISTS bookings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    ambassador_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date date NOT NULL,
    session_time time NOT NULL,
    notes text,
    status booking_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create table for favorite ambassadors
CREATE TABLE IF NOT EXISTS favorite_ambassadors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    ambassador_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, ambassador_id)
);

-- Create table for ambassador reviews
CREATE TABLE IF NOT EXISTS ambassador_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    ambassador_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, booking_id)
);

-- Add RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_reviews ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = ambassador_id);

CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = ambassador_id);

-- Favorite ambassadors policies
CREATE POLICY "Users can view their favorite ambassadors"
    ON favorite_ambassadors FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their favorite ambassadors"
    ON favorite_ambassadors FOR ALL
    USING (auth.uid() = user_id);

-- Ambassador reviews policies
CREATE POLICY "Anyone can view ambassador reviews"
    ON ambassador_reviews FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create reviews for completed bookings"
    ON ambassador_reviews FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_id
            AND bookings.user_id = auth.uid()
            AND bookings.status = 'completed'
        )
    );

-- Create function to update ambassador rating
CREATE OR REPLACE FUNCTION update_ambassador_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET rating = (
        SELECT COALESCE(AVG(rating)::numeric(10,2), 5.0)
        FROM ambassador_reviews
        WHERE ambassador_id = NEW.ambassador_id
    )
    WHERE id = NEW.ambassador_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update rating on review changes
CREATE TRIGGER update_ambassador_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON ambassador_reviews
FOR EACH ROW
EXECUTE FUNCTION update_ambassador_rating();

-- Create function to check booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE ambassador_id = NEW.ambassador_id
        AND session_date = NEW.session_date
        AND session_time = NEW.session_time
        AND status NOT IN ('cancelled', 'completed')
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Booking conflict: Time slot is already taken';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check booking conflicts
CREATE TRIGGER check_booking_conflict_trigger
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_booking_conflict(); 