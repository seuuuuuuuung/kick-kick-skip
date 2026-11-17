-- Run once in Supabase Dashboard > SQL Editor.
-- Photos are accessible to anyone who has the unguessable photo URL.
-- Never use a secret/service_role key in browser source.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photobooth', 'photobooth', true, 8388608, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "kks_photobooth_anon_upload" on storage.objects;
create policy "kks_photobooth_anon_upload"
on storage.objects for insert to anon
with check (
  bucket_id = 'photobooth'
  and storage.extension(name) = 'jpg'
  and (storage.foldername(name))[1] is null
);
-- Do not grant anon UPDATE/DELETE/LIST. Public bucket allows public file reads.
-- Upload permission is public: add abuse limits / cleanup for a real event.
