-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Enable RLS
ALTER DATABASE postgres SET "auth.jwt_secret" TO 'your-jwt-secret';

-- Create users table with role field
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('user', 'ambassador', 'admin')) DEFAULT 'user',
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create profiles table with ambassador fields
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id),
    username TEXT UNIQUE,
    bio TEXT,
    location TEXT,
    availability_status BOOLEAN DEFAULT true,
    consultation_duration INTEGER DEFAULT 30,
    rating DECIMAL(2,1) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    mood_tracking_enabled BOOLEAN DEFAULT true,
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create ambassador_reviews table
CREATE TABLE IF NOT EXISTS public.ambassador_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(ambassador_id, user_id)
);

-- Create ambassador_availability table
CREATE TABLE IF NOT EXISTS public.ambassador_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(ambassador_id, day_of_week)
);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    notes TEXT,
    activities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create support_groups table
CREATE TABLE IF NOT EXISTS public.support_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    max_participants INTEGER DEFAULT 50,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID REFERENCES public.support_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (group_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.support_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view their own mood entries"
    ON public.mood_entries
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their appointments"
    ON public.appointments
    FOR ALL
    USING (auth.uid() IN (user_id, therapist_id));

CREATE POLICY "Users can view public support groups"
    ON public.support_groups
    FOR SELECT
    USING (NOT is_private OR auth.uid() IN (
        SELECT user_id FROM public.group_members WHERE group_id = id
    ));

CREATE POLICY "Group members can view messages"
    ON public.messages
    FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM public.group_members WHERE group_id = group_id
    ));

-- Additional RLS Policies for ambassador tables
CREATE POLICY "Public can view ambassador profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = profiles.id
            AND users.role = 'ambassador'
        )
        OR auth.uid() = id
    );

CREATE POLICY "Users can review ambassadors"
    ON public.ambassador_reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view ambassador reviews"
    ON public.ambassador_reviews
    FOR SELECT
    USING (true);

CREATE POLICY "Ambassadors can manage their availability"
    ON public.ambassador_availability
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = ambassador_availability.ambassador_id
            AND users.role = 'ambassador'
            AND users.id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_groups_updated_at
    BEFORE UPDATE ON public.support_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update ambassador rating
CREATE OR REPLACE FUNCTION update_ambassador_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 5.0)
            FROM public.ambassador_reviews
            WHERE ambassador_id = NEW.ambassador_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.ambassador_reviews
            WHERE ambassador_id = NEW.ambassador_id
        )
    WHERE id = NEW.ambassador_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating ambassador rating
CREATE TRIGGER update_ambassador_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.ambassador_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_ambassador_rating();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON public.appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON public.messages(group_id); 