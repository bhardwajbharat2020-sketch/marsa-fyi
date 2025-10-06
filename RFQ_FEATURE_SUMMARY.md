# Buyer RFQ Functionality Implementation

## Overview
This document summarizes the implementation of the buyer Request for Quotation (RFQ) functionality in the MarsaFyi platform. The feature allows buyers to request quotations for products directly from the shop page, with proper authentication handling and workflow integration.

## Components Implemented

### 1. RFQ Form Component
- **File**: `client/src/components/RFQForm.js`
- **Features**:
  - Complete RFQ form with product details, quantity, budget range, and deadline
  - Form validation for required fields
  - Integration with backend API for submission
  - Success/error messaging
  - Modal interface with close functionality

### 2. Shop Page Enhancements
- **File**: `client/src/components/ShopPage.js`
- **Features**:
  - "Request Quotation" button on each product card
  - Authentication check before showing RFQ form
  - Redirect to login for unauthenticated users
  - Storage of pending RFQ data in localStorage
  - Post-login redirection to show RFQ form

### 3. Login Component Enhancements
- **File**: `client/src/components/Login.js`
- **Features**:
  - Detection of pending RFQ after successful login
  - Automatic redirection to shop page with RFQ form
  - Cleanup of expired RFQ data from localStorage

### 4. Server API Endpoints
- **File**: `server/server.js`
- **Endpoints Added**:
  - `POST /api/buyer/rfqs` - Create new RFQ
  - `GET /api/buyer/rfqs` - Fetch buyer's RFQs
  - `GET /api/captain/rfqs` - Fetch all RFQs for captain dashboard
  - `POST /api/seller/dpqs` - Create detailed product quotation

## Workflow

1. **Unauthenticated Buyer**:
   - Clicks "Request Quotation" on a product
   - System stores product info in localStorage
   - Redirects to login page
   - After successful login, redirects back to shop page with RFQ form

2. **Authenticated Buyer**:
   - Clicks "Request Quotation" on a product
   - RFQ form modal appears with product details
   - Buyer fills in quantity, budget range, and deadline
   - Submits form to create RFQ in database
   - Seller receives notification of new RFQ

3. **Seller Response**:
   - Seller views RFQ in their dashboard
   - Seller creates detailed quotation (DPQ) in response
   - Buyer receives notification of new quotation

4. **Captain Oversight**:
   - Captain can view all RFQs in captain dashboard
   - Captain can monitor quotation process

## Database Integration

### RFQ Table
- `id`: Primary key
- `buyer_id`: Reference to user who created RFQ
- `product_id`: Reference to product being quoted
- `title`: RFQ title
- `description`: Detailed requirements
- `quantity`: Requested quantity
- `budget_range_min`: Minimum budget
- `budget_range_max`: Maximum budget
- `response_deadline`: Deadline for responses
- `status`: Current status (open, closed, fulfilled)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### DPQ Table (Detailed Product Quotation)
- `id`: Primary key
- `rfq_id`: Reference to original RFQ
- `seller_id`: Reference to seller providing quotation
- `product_id`: Reference to product being quoted
- `quantity`: Quoted quantity
- `unit_price`: Price per unit
- `total_price`: Total quotation amount
- `specifications`: Product specifications
- `delivery_port_id`: Delivery port
- `delivery_date`: Delivery date
- `payment_terms`: Payment terms
- `status`: Current status (pending, accepted, rejected)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Security Considerations

1. **Authentication**: All RFQ endpoints require authentication
2. **Authorization**: Buyers can only view their own RFQs
3. **Data Validation**: Server-side validation of all inputs
4. **Rate Limiting**: Potential for future implementation
5. **Data Expiry**: Pending RFQ data expires after 30 minutes

## Future Enhancements

1. **RFQ Templates**: Predefined templates for common products
2. **Bulk RFQs**: Ability to request quotations for multiple products
3. **RFQ Comparison**: Tools to compare multiple quotations
4. **Automated Notifications**: Email/SMS notifications for RFQ status changes
5. **RFQ Analytics**: Dashboard for tracking RFQ performance