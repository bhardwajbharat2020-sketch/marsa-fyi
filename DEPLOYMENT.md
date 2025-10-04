# Deployment Instructions for Vercel

## Prerequisites
1. Ensure you have a Vercel account
2. Make sure your Supabase project is set up and running

## Environment Variables
Before deploying to Vercel, you need to set up the following environment variables in your Vercel project settings:

1. `SUPABASE_URL` - Your Supabase project URL (e.g., https://your-project.supabase.co)
2. `SUPABASE_KEY` - Your Supabase service role key (NOT the anon/public key)

**Important:** You must use the service role key, not the anon/public key. The service role key has full access to your database.

To find your Supabase keys:
1. Go to your Supabase project dashboard
2. Click on "Settings" in the left sidebar
3. Click on "API"
4. Copy the "URL" and "service_role" key (not the "anon" public key)

## Deployment Steps

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. In the project settings, add the environment variables:
   - SUPABASE_URL: Your Supabase project URL
   - SUPABASE_KEY: Your Supabase service role key
6. Click "Deploy"

## Troubleshooting

### "Failed to fetch catalogs" Error
If you encounter this error, it's likely due to one of the following issues:

1. **Missing Environment Variables**: Ensure SUPABASE_URL and SUPABASE_KEY are correctly set in Vercel
2. **Wrong Key Type**: Make sure you're using the service role key, not the anon/public key
3. **Network Issues**: Check that your Supabase instance is accessible from Vercel
4. **Database Permissions**: Ensure your Supabase service role key has read access to the required tables

### Testing Environment Variables
To test if your environment variables are properly set, you can create a simple API endpoint or use the health check endpoints:
- GET /api/health - Basic health check
- GET /api/health/db - Health check with Supabase connection test

### Testing Locally
To test the API endpoints locally:

1. Run `npm install` in both the root directory and the client directory
2. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_role_key
   ```
3. Run `npm start` in the root directory
4. Test the endpoints:
   - http://localhost:5000/api/catalogs
   - http://localhost:5000/api/products
   - http://localhost:5000/api/health
   - http://localhost:5000/api/health/db

### Checking Logs
To check for errors in Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Click on the "Logs" tab
4. Look for any error messages related to the API endpoints

### Registration Issues
If registration is not working:
1. Check that your Supabase Auth is properly configured
2. Ensure you have the correct service role key (not the anon/public key)
3. Verify that the required tables (users, roles, user_roles) exist in your database
4. Check the Vercel logs for specific error messages