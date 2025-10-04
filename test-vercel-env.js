// Test script to check Vercel environment variables
console.log('=== Vercel Environment Variables Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'NOT SET');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');

if (process.env.SUPABASE_URL) {
  console.log('SUPABASE_URL length:', process.env.SUPABASE_URL.length);
}

if (process.env.SUPABASE_KEY) {
  console.log('SUPABASE_KEY length:', process.env.SUPABASE_KEY.length);
  console.log('SUPABASE_KEY starts with:', process.env.SUPABASE_KEY.substring(0, 10) + '...');
}