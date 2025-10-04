# MarsaFyi - Global Port-Centric B2B Trade Platform

This is a comprehensive B2B trade platform built with React (frontend) and Node.js (backend), implementing all the features specified in the MarsaFyi Application Flow specification.

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js backend server
- `client/src/components/` - React components for each dashboard
- `client/src/contexts/` - Authentication context
- `client/src/assets/` - Static assets

## Features Implemented

### Core Platform Features
- Animated logo with MarsaFy! to MarsaFyi transformation
- Beautiful, modern homepage inspired by leading e-commerce platforms
- Dedicated Shop page with product listings and filtering
- Comprehensive About page with company information
- Contact page with form and support information
- User registration with OTP verification for email and WhatsApp
- Role-based authentication system with Supabase integration
- Multi-role dashboard switching
- Comprehensive dashboard layouts for all 12 roles
- In-app camera with geotagging (simulated)
- Multilingual support (framework ready)
- AI-based moderation (framework ready)
- Virtual currency system
- Strict data validation

### Enhanced Homepage Features
- Professional header with navigation (Home, Shop, About, Contact)
- Hero carousel with auto-rotating banners
- Category browsing with visual icons
- Featured product/catalog display
- Company information section
- How-it-works process explanation
- Customer testimonials
- Value proposition section highlighting platform benefits
- Responsive design that works on all devices
- Professional footer with site navigation

### Shop Page Features
- Comprehensive product listing
- Advanced search and filtering capabilities
- Category and port filtering
- Sorting options
- Pagination for large product sets
- Product cards with detailed information

### About Page Features
- Company mission and vision
- Core values display
- Leadership team information
- Company milestones timeline
- Statistics and achievements

### Contact Page Features
- Contact form with validation
- Company contact information
- Support options by category
- FAQ section
- Interactive map placeholder

### Role-Specific Dashboards
1. **Captain Dashboard** - Super role with role code generation and transaction management
2. **Admin Dashboard** - Catalog approval and survey management
3. **HR Dashboard** - Document verification and user management
4. **Accountant Dashboard** - Payment processing and invoice generation
5. **Arbitrator Dashboard** - Dispute resolution
6. **Seller Dashboard** - Catalog management and DPO handling
7. **Buyer Dashboard** - RFQ management and order tracking
8. **Surveyor Dashboard** - Survey requests and report submission
9. **Insurance Agent Dashboard** - Policy management
10. **Transporter Dashboard** - Work order management
11. **Logistics Dashboard** - International logistics coordination
12. **CHA Dashboard** - Customs House Agent services

### Transaction Workflows
- RFQ (Request for Quotation) system
- DPQ (Draft Priced Quotation) workflow
- DPO (Draft Purchase Order) processing
- Survey management with fee processing
- Multi-stage payment system (advance, LC, etc.)
- Dispute resolution mechanism
- Virtual currency earning and spending

## Supabase Integration

This project now uses Supabase for:
- User authentication
- Database operations
- Real-time data synchronization

### Environment Configuration

Both client and server require Supabase credentials in their respective `.env` files:

**Server (.env):**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
```

**Client (.env):**
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

### Prerequisites

- Node.js installed on your machine

### Installation

1. Install client dependencies:
   ```
   cd client
   npm install
   ```

2. Install server dependencies:
   ```
   cd ../server
   npm install
   ```

### Running the Application

1. Start the React development server:
   ```
   cd client
   npm start
   ```

2. In a separate terminal, start the Node.js server:
   ```
   cd server
   npm start
   ```

The React app will be available at http://localhost:3000
The Node.js server will be available at http://localhost:5000

## Building for Production

1. Build the React app:
   ```
   cd client
   npm run build
   ```

2. Start the server (which will serve the built React app):
   ```
   cd server
   npm start
   ```

The production app will be available at http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### General
- `GET /api/hello` - Returns a welcome message
- `GET /api/info` - Returns application information
- `GET /api/ideas` - Returns creative ideas
- `POST /api/feedback` - Submit user feedback

### MarsaFyi Specific
- `GET /api/catalogs` - Retrieve all catalogs
- `GET /api/roles` - Retrieve all roles
- `GET /api/dashboard/:role` - Retrieve dashboard data for specific role

## Scripts

- `setup.bat` - Installs all dependencies
- `start-dev.bat` - Starts both development servers
- `build-prod.bat` - Builds the React app for production
- `start-prod.bat` - Starts the production server

## Technology Stack

- **Frontend**: React, React Router
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: CSS3 with responsive design and animations
- **Data Management**: Context API for state management
- **Security**: JWT-based authentication with Supabase

## Future Enhancements

- Integration with Firebase for real-time data synchronization
- Implementation of actual geotagging camera functionality
- Full AI moderation system
- Advanced virtual currency marketplace
- SEO optimization
- Advertisement integration
- Real-time notifications system