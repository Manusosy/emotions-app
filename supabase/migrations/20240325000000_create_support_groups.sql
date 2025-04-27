-- Drop existing policies first
DROP POLICY IF EXISTS "Ambassadors can create support groups" ON public.support_groups;
DROP POLICY IF EXISTS "Ambassadors can view their own support groups" ON public.support_groups;
DROP POLICY IF EXISTS "Patients can view groups they're members of" ON public.support_groups;
DROP POLICY IF EXISTS "Ambassadors can update their own support groups" ON public.support_groups;
DROP POLICY IF EXISTS "Ambassadors can add members to their groups" ON public.group_members;
DROP POLICY IF EXISTS "Members can view their group memberships" ON public.group_members;
DROP POLICY IF EXISTS "Ambassadors can update member status" ON public.group_members;
DROP POLICY IF EXISTS "Ambassadors can view patient profiles" ON public.patient_profiles;

-- Create support groups table
CREATE TABLE IF NOT EXISTS public.support_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    ambassador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    max_members INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create group members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.support_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    status TEXT CHECK (status IN ('active', 'inactive', 'removed')) DEFAULT 'active',
    UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policies for support_groups

-- Ambassadors can create support groups
CREATE POLICY "Ambassadors can create support groups"
    ON public.support_groups
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'ambassador'
        )
    );

-- Ambassadors can view their own support groups
CREATE POLICY "Ambassadors can view their own support groups"
    ON public.support_groups
    FOR SELECT
    TO authenticated
    USING (
        ambassador_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Patients can view groups they're members of
CREATE POLICY "Patients can view groups they're members of"
    ON public.support_groups
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_id = public.support_groups.id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

-- Ambassadors can update their own support groups
CREATE POLICY "Ambassadors can update their own support groups"
    ON public.support_groups
    FOR UPDATE
    TO authenticated
    USING (ambassador_id = auth.uid())
    WITH CHECK (ambassador_id = auth.uid());

-- Policies for group_members

-- Ambassadors can add members to their groups
CREATE POLICY "Ambassadors can add members to their groups"
    ON public.group_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_groups
            WHERE id = group_id
            AND ambassador_id = auth.uid()
        )
    );

-- Members can view their group memberships
CREATE POLICY "Members can view their group memberships"
    ON public.group_members
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.support_groups
            WHERE id = group_id
            AND ambassador_id = auth.uid()
        )
    );

-- Ambassadors can update member status in their groups
CREATE POLICY "Ambassadors can update member status"
    ON public.group_members
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.support_groups
            WHERE id = group_id
            AND ambassador_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_groups
            WHERE id = group_id
            AND ambassador_id = auth.uid()
        )
    );

-- Add RLS policy for patient_profiles to allow ambassadors to view
CREATE POLICY "Ambassadors can view patient profiles"
    ON public.patient_profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'ambassador'
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.support_groups TO authenticated;
GRANT ALL ON public.group_members TO authenticated; 