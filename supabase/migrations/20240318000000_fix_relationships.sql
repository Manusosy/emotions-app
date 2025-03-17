-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Enable RLS on the bucket
create policy "Avatar images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
on storage.objects for insert
with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar"
on storage.objects for update
using ( bucket_id = 'avatars' );

-- Fix the appointments table relationships
ALTER TABLE IF EXISTS appointments
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey,
DROP CONSTRAINT IF EXISTS appointments_ambassador_id_fkey;

ALTER TABLE appointments
ADD CONSTRAINT appointments_patient_id_fkey
    FOREIGN KEY (patient_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
ADD CONSTRAINT appointments_ambassador_id_fkey
    FOREIGN KEY (ambassador_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Create an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_ambassador_id ON appointments(ambassador_id); 