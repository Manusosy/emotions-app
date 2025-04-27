-- Create the gallery bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Enable RLS on the bucket
create policy "Gallery images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'gallery' );

create policy "Anyone can upload to gallery"
on storage.objects for insert
with check ( bucket_id = 'gallery' );

create policy "Anyone can update their own gallery images"
on storage.objects for update
using ( bucket_id = 'gallery' );

create policy "Anyone can delete their own gallery images"
on storage.objects for delete
using ( bucket_id = 'gallery' ); 