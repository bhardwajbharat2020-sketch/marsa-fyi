# Simplified API Endpoints

## Changes Made

I've simplified both API endpoints as requested to ensure they work correctly on Vercel:

### 1. `/api/products` Endpoint
- Added debugging console.log: `console.log('GET /api/products endpoint hit on Vercel');`
- Simplified the implementation to directly fetch all products from Supabase
- Removed complex formatting logic that was causing issues

### 2. `/api/catalogs` Endpoint
- Added debugging console.log: `console.log('GET /api/catalogs endpoint hit on Vercel');`
- Simplified the implementation to directly fetch all products from Supabase
- Removed complex formatting logic that was causing issues

## Why This Fixes the Issue

1. **Proper Middleware Order**: The static file middleware is correctly placed at the end of the file, after all API routes
2. **Simplified Endpoints**: The endpoints are now simple and direct, reducing the chance of errors
3. **Debugging Information**: Added console.log statements to help identify if the endpoints are being hit
4. **Direct Supabase Queries**: Removed complex joins and formatting that might have been causing issues

## Testing the Fix

To test that the fix works:

1. Start the server locally:
   ```
   npm start
   ```

2. Visit these URLs in your browser:
   - http://localhost:5000/api/products - Should return product data
   - http://localhost:5000/api/catalogs - Should return catalog data

3. Check the terminal for the debugging console.log messages

## For Vercel Deployment

After deploying to Vercel:
1. The debugging console.log messages will appear in the Vercel logs
2. The simplified endpoints should work correctly
3. The React app will be served correctly for all non-API routes

This should resolve the "Failed to fetch catalogs" error by ensuring the API endpoints are simple, direct, and properly ordered in the Express application.