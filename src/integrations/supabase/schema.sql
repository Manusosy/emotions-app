-- Enable RLS
alter table public.profiles enable row level security;

-- Create messages table
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references auth.users(id) on delete cascade not null,
    recipient_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unread boolean default true not null
);

-- Create appointments table
create table if not exists public.appointments (
    id uuid default gen_random_uuid() primary key,
    patient_id uuid references auth.users(id) on delete cascade not null,
    therapist_id uuid references auth.users(id) on delete cascade not null,
    date date not null,
    time time not null,
    type text check (type in ('video', 'voice', 'chat')) not null,
    status text check (status in ('upcoming', 'completed', 'cancelled')) default 'upcoming' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create therapist_profiles table
create table if not exists public.therapist_profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name text not null,
    specialty text not null,
    profile_image text,
    bio text,
    years_of_experience integer,
    education text[],
    languages text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table public.messages enable row level security;
alter table public.appointments enable row level security;
alter table public.therapist_profiles enable row level security;

-- RLS policies for messages
create policy "Users can read their own messages"
    on public.messages for select
    using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages"
    on public.messages for insert
    with check (auth.uid() = sender_id);

-- RLS policies for appointments
create policy "Users can read their own appointments"
    on public.appointments for select
    using (auth.uid() = patient_id or auth.uid() = therapist_id);

create policy "Patients can create appointments"
    on public.appointments for insert
    with check (auth.uid() = patient_id);

create policy "Users can update their own appointments"
    on public.appointments for update
    using (auth.uid() = patient_id or auth.uid() = therapist_id);

-- RLS policies for therapist profiles
create policy "Anyone can read therapist profiles"
    on public.therapist_profiles for select
    using (true);

create policy "Therapists can update their own profile"
    on public.therapist_profiles for update
    using (auth.uid() = id);

-- Functions and triggers
create or replace function public.handle_new_user()
returns trigger as $$
begin
    if new.raw_user_metadata->>'role' = 'therapist' then
        insert into public.therapist_profiles (id, full_name)
        values (new.id, new.raw_user_metadata->>'full_name');
    elsif new.raw_user_metadata->>'role' = 'patient' then
        insert into public.patient_profiles (id, first_name, last_name)
        values (
            new.id,
            new.raw_user_metadata->>'first_name',
            new.raw_user_metadata->>'last_name'
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 