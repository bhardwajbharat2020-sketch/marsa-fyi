import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your build process or runtime
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://yuphowxgoxienbnwcgra.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cGhvd3hnb3hpZW5ibndjZ3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MDA3MDIsImV4cCI6MjA3NTE3NjcwMn0.bjUNbFbH48xj0baFTzWE900LJPDWNTYVHAfOi_6HLFg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);