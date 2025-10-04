# MARSa FYI Server

This directory contains the backend server for the MARSa FYI application.

## Main Files

- `server.js` - Main server file (entry point)
- `.env` - Environment variables configuration
- `package.json` - Node.js dependencies and scripts

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in `.env` file

3. Start the server:
   ```
   npm start
   ```

## Development

For development with auto-restart:
```
npm run dev
```

## Environment Variables

The following environment variables are required:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase service role key
- `PORT` - Server port (defaults to 5000 if not set)

## API Endpoints

- POST `/api/register` - User registration
- Other endpoints are defined in server.js

## Supabase Integration

The server integrates with Supabase for:
- User authentication
- Database operations
- Real-time data synchronization