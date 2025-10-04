# Complete Schema Implementation Guide

## Overview
This document explains the complete database schema and implementation for the Marsa FYI application with proper password management, user roles, and workflow tracking.

## New Features Implemented

### 1. Password Management
- **Strong Password Requirements**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one special character
  - At least one digit
- **Secure Storage**: Passwords are hashed using bcrypt before storage
- **Validation**: Both server-side and client-side validation

### 2. User Registration and Authentication
- Users register with a strong password that is securely hashed
- Users login using their vendor code and password
- Password verification during login using bcrypt comparison

### 3. Role-Based Access Control
- 12 distinct user roles with specific permissions
- Users can have multiple roles with one primary role
- Automatic vendor code generation based on primary role

### 4. Complete Workflow Support
- RFQ (Request for Quotation) system
- DPQ (Detailed Product Quotation) process
- DPO (Detailed Product Order) management
- Order tracking and management
- Payment processing and payout system
- Dispute resolution workflow
- Survey and quality assurance
- Insurance management
- Transportation and logistics tracking
- Customs clearance support

## Database Schema Details

### Core Tables

1. **roles**: Defines all possible user roles
2. **users**: Stores user information including hashed passwords
3. **user_roles**: Junction table for user-role relationships
4. **user_sessions**: Manages user authentication sessions
5. **password_reset_tokens**: Handles forgotten password functionality

### Product and Catalog Management

6. **categories**: Product categories
7. **currencies**: Supported currencies
8. **products**: Product information

### Workflow Tables

9. **ports**: Shipping ports
10. **rfqs**: Request for Quotation
11. **dpqs**: Detailed Product Quotation Sheet
12. **dpos**: Detailed Product Order Sheet
13. **orders**: Main order tracking
14. **invoices**: Invoice management
15. **payments**: Payment records
16. **payouts**: Seller payouts

### Dispute and Quality Management

17. **disputes**: Dispute tracking
18. **survey_requests**: Product survey requests
19. **survey_reports**: Survey reports
20. **insurance_requests**: Insurance requests
21. **insurance_policies**: Insurance policies

### Logistics and Customs

22. **transport_orders**: Transportation orders
23. **tracking_info**: Shipment tracking
24. **logistics_orders**: Logistics coordination
25. **cha_service_requests**: Customs House Agent services

### User Support

26. **company_documents**: Verification documents
27. **contact_requests**: User connection requests
28. **user_issues**: Reported issues
29. **notifications**: User notifications
30. **evidence_requests**: Dispute evidence requests

## Implementation Steps

### 1. Database Setup
1. Create a new Supabase project
2. Run the `complete_schema.sql` script to create all tables
3. The schema includes all necessary indexes and triggers

### 2. Server Configuration
1. Update `server/package.json` to include bcrypt dependency
2. The server now includes password validation and hashing functions
3. Registration endpoint validates and hashes passwords
4. Login endpoint verifies passwords using bcrypt

### 3. Password Requirements
The system enforces strong passwords with:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one special character (!@#$%^&*()_+-=[]{}|;':",./<>?)
- At least one digit (0-9)

### 4. Vendor Code System
- Automatically generated vendor codes based on user role
- Format: ROLE-YY-XXXXXX (e.g., VEND-23-ABC123)
- Unique for each user

## API Endpoints Updated

### Registration (`/api/register`)
- Now validates password strength
- Hashes passwords before storage
- No longer uses Supabase Auth for password management
- Stores user information directly in the users table

### Login (`/api/auth/login`)
- Validates credentials against hashed passwords
- Uses bcrypt for secure password comparison
- Returns user information and token

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **Input Validation**: Strong password requirements enforced
3. **Session Management**: User sessions tracked for security
4. **Role-Based Access**: Fine-grained access control
5. **Data Encryption**: Supabase handles data encryption at rest

## Deployment Instructions

1. Create a new Supabase project
2. Execute the `complete_schema.sql` script in the Supabase SQL editor
3. Update your `.env` file with Supabase credentials
4. Run `npm install` in the server directory to install bcrypt
5. Deploy the updated server code

## Testing the Implementation

1. Register a new user with a strong password:
   ```
   POST /api/register
   {
     "email": "test@example.com",
     "password": "Test123!",
     "firstName": "Test",
     "lastName": "User",
     "phone": "+1234567890",
     "workClass": "buyer"
   }
   ```

2. Login with the user's vendor code and password:
   ```
   POST /api/auth/login
   {
     "vendorCode": "BUY-23-XXXXXX",
     "password": "Test123!"
   }
   ```

## Notes

1. The schema is designed to support the complete workflow you described
2. All passwords are securely hashed before storage
3. Vendor codes are automatically generated based on user roles
4. The system supports multiple roles per user with one primary role
5. All workflow steps are tracked with proper relationships between tables

This implementation provides a robust foundation for your B2B trading platform with proper security, workflow management, and scalability.