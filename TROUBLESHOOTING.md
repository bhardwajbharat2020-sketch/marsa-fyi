# Troubleshooting Guide for "Failed to fetch catalogs" Error

## Common Causes and Solutions

### 1. Environment Variables Not Set Correctly

**Problem**: The SUPABASE_URL and SUPABASE_KEY environment variables are not properly configured in Vercel.

**Solution**:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Ensure you have set:
   - SUPABASE_URL: Your Supabase project URL (e.g., https://yuphowxgoxienbnwcgra.supabase.co)
   - SUPABASE_KEY: Your Supabase **service role key** (NOT the anon/public key)

**Verification**:
- Visit `/api/test-env` on your deployed app to check if environment variables are set
- Check Vercel logs for any "undefined" or missing environment variable errors

### 2. Wrong Supabase Key Type

**Problem**: Using the anon/public key instead of the service role key.

**Solution**:
1. Go to your Supabase project dashboard
2. Click on "Settings" in the left sidebar
3. Click on "API"
4. Use the "service_role" key, NOT the "anon" public key

### 3. Database Connection Issues

**Problem**: Network restrictions or database permissions preventing connection.

**Solution**:
1. Ensure your Supabase database allows connections from Vercel
2. Check that your service role key has the necessary permissions
3. Test the connection locally using the test scripts

### 4. Missing Database Tables

**Problem**: Required tables don't exist in your Supabase database.

**Solution**:
1. Ensure you've run the database schema setup
2. Verify that tables like `products`, `users`, `roles`, and `user_roles` exist
3. Check that the tables have the correct structure

## Diagnostic Steps

### Step 1: Check Environment Variables
Visit these endpoints on your deployed app:
- `/api/health` - Basic health check
- `/api/health/db` - Health check with Supabase connection test
- `/api/test-env` - Environment variables check

### Step 2: Check Vercel Logs
1. Go to your Vercel dashboard
2. Select your project
3. Click on the "Logs" tab
4. Look for error messages when accessing `/api/catalogs` or `/api/products`

### Step 3: Test Locally
1. Create a `.env` file in your project root with:
   ```
   SUPABASE_URL=https://yuphowxgoxienbnwcgra.supabase.co
   SUPABASE_KEY=your_supabase_service_role_key
   ```
2. Run `npm start` in the root directory
3. Visit http://localhost:5000/api/catalogs
4. Check the terminal output for any error messages

### Step 4: Verify Database Structure
1. Go to your Supabase dashboard
2. Check that the following tables exist:
   - `products` with columns: id, name, description, price, currency_id, seller_id, is_active, is_verified
   - `users` with columns: id, username, email, first_name, last_name, phone, is_verified
   - `roles` with columns: id, name
   - `user_roles` with columns: user_id, role_id, is_primary

## Common Error Messages and Solutions

### "Supabase client not initialized"
**Cause**: Environment variables not set or invalid
**Solution**: Check SUPABASE_URL and SUPABASE_KEY environment variables

### " relation 'products' does not exist"
**Cause**: Database tables not created
**Solution**: Run the database schema setup scripts

### "permission denied for table products"
**Cause**: Service role key doesn't have proper permissions
**Solution**: Ensure you're using the service role key, not the anon/public key

### "Network request failed"
**Cause**: Network connectivity issues between Vercel and Supabase
**Solution**: Check firewall settings and ensure Supabase is accessible

## Registration Issues

If registration is not working:

### Check Supabase Auth Configuration
1. Go to your Supabase dashboard
2. Click on "Authentication" in the left sidebar
3. Ensure email signups are enabled
4. Check that the auth settings allow the operations your code is trying to perform

### Verify Required Tables
Ensure these tables exist and have the correct structure:
- `users` - Stores user profile information
- `roles` - Contains role definitions
- `user_roles` - Links users to their roles

## Testing Your Fix

After making changes:

1. Redeploy your application to Vercel
2. Visit `/api/health` to check basic functionality
3. Visit `/api/health/db` to test Supabase connection
4. Visit `/api/catalogs` to test the catalogs endpoint
5. Try registering a new user through the UI

If issues persist, check the Vercel logs for detailed error messages.