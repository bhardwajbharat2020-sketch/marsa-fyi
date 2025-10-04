# Deployment Instructions for Vercel

## Prerequisites
1. Ensure you have a Vercel account
2. Make sure your Supabase project is set up and running

## Environment Variables
Before deploying to Vercel, you need to set up the following environment variables in your Vercel project settings:

1. `SUPABASE_URL` - Your Supabase project URL
2. `SUPABASE_KEY` - Your Supabase anon/public key

## Deployment Steps

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. In the project settings, add the environment variables:
   - SUPABASE_URL: Your Supabase project URL
   - SUPABASE_KEY: Your Supabase anon/public key
6. Click "Deploy"

## Troubleshooting

### "Failed to fetch catalogs" Error
If you encounter this error, it's likely due to one of the following issues:

1. **Missing Environment Variables**: Ensure SUPABASE_URL and SUPABASE_KEY are correctly set in Vercel
2. **Network Issues**: Check that your Supabase instance is accessible from Vercel
3. **Database Permissions**: Ensure your Supabase anon/public key has read access to the required tables

### Testing Locally
To test the API endpoints locally:

1. Run `npm install` in both the root directory and the client directory
2. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```
3. Run `npm start` in the root directory
4. Test the endpoints:
   - http://localhost:5000/api/catalogs
   - http://localhost:5000/api/products

### Checking Logs
To check for errors in Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Click on the "Logs" tab
4. Look for any error messages related to the API endpoints