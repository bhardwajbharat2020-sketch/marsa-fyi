# Deployment Guide for Marsa FYI

## Vercel Deployment

### Environment Variables

Before deploying to Vercel, make sure to set the following environment variables in your Vercel project settings:

1. `SUPABASE_URL` - Your Supabase project URL
2. `SUPABASE_KEY` - Your Supabase service role key (not the anon key)

To set these in Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the variables listed above

### Deployment Steps

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Make sure the build settings are correct:
   - Build Command: `npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

### Troubleshooting

#### "Failed to fetch catalogs" Error

If you see this error on Vercel:

1. Check the Vercel logs for detailed error messages
2. Verify that environment variables are set correctly
3. Test the API endpoints directly:
   - `/api/health` - Basic health check
   - `/api/health/db` - Health check with Supabase connection test
   - `/api/catalogs` - Catalogs endpoint
   - `/api/products` - Products endpoint

#### Local Testing

To test locally before deploying:

1. Create a `.env` file in your project root with:
   ```
   SUPABASE_URL=https://yuphowxgoxienbnwcgra.supabase.co
   SUPABASE_KEY=your_supabase_service_role_key
   ```

2. Run `npm start` in the root directory

3. Visit these URLs in your browser:
   - http://localhost:5000/api/health
   - http://localhost:5000/api/health/db
   - http://localhost:5000/api/catalogs
   - http://localhost:5000/api/products

4. Check the terminal output for any error messages

### Common Issues

1. **Environment Variables Not Set**: Make sure SUPABASE_URL and SUPABASE_KEY are set in Vercel
2. **Incorrect Supabase Key**: Use the service role key, not the anon key
3. **Database Connection Issues**: Verify that your Supabase database is accessible
4. **CORS Issues**: The server is configured to allow all origins, but you may need to adjust this for production

### API Endpoints

The following API endpoints are available:

- `GET /api/health` - Server health check
- `GET /api/health/db` - Database connection test
- `GET /api/catalogs` - Featured products
- `GET /api/products` - All products
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Frontend Routes

All non-API routes will serve the React frontend application.