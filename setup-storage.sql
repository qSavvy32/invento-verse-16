
-- Create a bucket for storing invention assets if it doesn't exist
SELECT * FROM storage.create_bucket(
    'invention-assets', 
    'Invention assets bucket', 
    public := true,
    file_size_limit := 52428800, -- 50MB in bytes
    allowed_mime_types := ARRAY[
        'image/jpeg', 
        'image/png', 
        'image/gif',
        'image/webp',
        'image/bmp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ]
);

-- Create a policy to allow anonymous read access
BEGIN;
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
    'Public Read Access',
    'bucket_id = ''invention-assets'' AND auth.role() = ''anon''',
    'invention-assets'
) ON CONFLICT DO NOTHING;
COMMIT;

-- Create a policy to allow authenticated uploads
BEGIN;
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
    'Authenticated Upload Access',
    'bucket_id = ''invention-assets''',
    'invention-assets'
) ON CONFLICT DO NOTHING;
COMMIT;
