--
-- 030_storage.sql
-- Configure Supabase Storage buckets and access policies.

-- Create buckets if not existing
SELECT
  storage.create_bucket('performer-photos', public := true);
SELECT
  storage.create_bucket('private', public := false);

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read objects in public performer-photos bucket
CREATE POLICY "public_performer_photos_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'performer-photos'
  );

-- Policy: Only owners or admins can insert/update/delete performer-photos
CREATE POLICY "performer_photos_write_own" ON storage.objects
  FOR ALL USING (
    (bucket_id = 'performer-photos' AND owner = auth.uid()) OR auth.jwt() ->> 'role' = 'admin'
  ) WITH CHECK (
    (bucket_id = 'performer-photos' AND owner = auth.uid()) OR auth.jwt() ->> 'role' = 'admin'
  );

-- Policy: Private bucket - only owners or admins may read/write
CREATE POLICY "private_bucket_owner" ON storage.objects
  FOR ALL USING (
    (bucket_id = 'private' AND owner = auth.uid()) OR auth.jwt() ->> 'role' = 'admin'
  ) WITH CHECK (
    (bucket_id = 'private' AND owner = auth.uid()) OR auth.jwt() ->> 'role' = 'admin'
  );

-- Notes:
-- 1. The 'performer-photos' bucket is public, so files can be read by anyone.
-- 2. The 'private' bucket holds sensitive documents (IDs, receipts) and is restricted to the uploader and admins.