-- SQL script to verify and fix phone column in contact_form_submissions table
-- Run this in your Supabase SQL editor

-- First, check if the phone column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contact_form_submissions' AND column_name = 'phone';

-- If the above query returns no results, the phone column is missing
-- Add the phone column if it doesn't exist
ALTER TABLE contact_form_submissions 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';

-- Update any existing rows to ensure they have empty string instead of NULL
UPDATE contact_form_submissions 
SET phone = '' 
WHERE phone IS NULL;

-- Add index for better query performance on phone column
CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_phone 
ON contact_form_submissions(phone);

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'contact_form_submissions' AND column_name = 'phone';

-- Test insert with phone field
INSERT INTO contact_form_submissions (name, phone, email, subject, message, status)
VALUES ('SQL Test', '+1234567890', 'sql-test@example.com', 'SQL Test', 'Testing phone field via SQL', 'pending');

-- Check if the insert worked
SELECT id, name, phone, email FROM contact_form_submissions 
WHERE name = 'SQL Test' AND email = 'sql-test@example.com';

-- Clean up test record
DELETE FROM contact_form_submissions 
WHERE name = 'SQL Test' AND email = 'sql-test@example.com';

-- Show table structure
\d contact_form_submissions;