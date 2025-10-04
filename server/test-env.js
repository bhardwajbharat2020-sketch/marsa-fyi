// Vercel API endpoint to test environment variables
module.exports = (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_KEY: process.env.SUPABASE_KEY ? 'SET' : 'NOT SET',
    SUPABASE_KEY_LENGTH: process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : 0,
    PORT: process.env.PORT || 'NOT SET'
  });
};