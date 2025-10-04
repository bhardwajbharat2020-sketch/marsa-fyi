# MARSa FYI Client

This directory contains the frontend client for the MARSa FYI application.

## Main Files

- `src/` - Source code directory
- `public/` - Static assets
- `package.json` - Dependencies and scripts
- `.env` - Environment variables configuration

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in `.env` file

3. Start the development server:
   ```
   npm start
   ```

## Build for Production

```
npm run build
```

## Environment Variables

The following environment variables are required:

- `REACT_APP_SUPABASE_URL` - Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Supabase Integration

The client integrates with Supabase for:
- User authentication
- Database operations
- Real-time data synchronization

## Role-Based Dashboards

The application implements role-based dashboards:
- Admin Dashboard
- Seller Dashboard
- Buyer Dashboard
- And other role-specific dashboards

Users are automatically redirected to their role-specific dashboard after login.