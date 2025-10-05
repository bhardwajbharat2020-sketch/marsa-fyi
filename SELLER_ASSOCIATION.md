# Seller Association Implementation

## Overview
This document explains how seller association is implemented in the Marsa FYI system to maintain confidentiality while ensuring proper product tracking.

## Implementation Details

### 1. Database Schema
The `products` table includes a `seller_id` column that references the `users` table:
```sql
seller_id UUID REFERENCES users(id) ON DELETE CASCADE
```

This foreign key relationship ensures that:
- Each product is associated with its creator seller
- Products are automatically removed when a seller account is deleted
- Seller information can be retrieved when needed for administrative purposes

### 2. Backend Implementation
The server-side endpoints properly handle seller association:

#### Product Creation
When a seller creates a new product:
- The seller's ID is automatically associated with the product through the `seller_id` field
- This happens in the `/api/seller/products` POST endpoint
- The seller ID comes from the authenticated user session (`req.user.id`)

#### Product Retrieval
When retrieving products:
- The `/api/seller/products` GET endpoint filters products by the authenticated seller's ID
- This ensures sellers only see their own products
- Products from other sellers are not visible

### 3. Confidentiality Measures
To maintain seller confidentiality:
- Seller names are never stored directly with products
- Seller vendor codes are stored in the users table, not duplicated in products
- Product listings show vendor codes only to authorized users (creator seller and captain)
- Buyers see products without pricing information or seller identification

### 4. Data Flow
1. Seller authenticates and accesses their dashboard
2. When adding a product, the server automatically associates it with the seller's ID
3. When viewing products, the server filters to show only those belonging to the authenticated seller
4. Administrative users can view seller information when needed for approval workflows

### 5. Vendor Code Format
As per project requirements, vendor codes follow the format:
`[Role Initial]-[Last 2 digits of current year]-[6-digit alphanumeric mix]`
Example: `SELL-23-ABC123`

### 6. Security Considerations
- Seller IDs are only accessible through authenticated sessions
- Direct access to seller information requires proper authorization
- Product data is isolated per seller through database queries

## Benefits
- Maintains seller confidentiality while enabling product tracking
- Supports the approval workflow with proper seller association
- Enables future features like seller performance analytics
- Complies with data privacy requirements

## Testing
The implementation has been tested to ensure:
- Products are correctly associated with their creators
- Sellers can only access their own products
- Vendor codes are properly formatted and stored
- Confidentiality measures are enforced

## Support
For any issues or questions regarding seller association, please contact the development team.