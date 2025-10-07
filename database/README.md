# Marsa FYI B2B Platform - Database Schema

## Overview
This PostgreSQL database schema is designed for the Marsa FYI B2B trading platform. It includes all necessary tables to support a comprehensive multi-role B2B marketplace with features for sellers, buyers, and various service providers.

## Database Structure

### Core Tables
1. **users** - User accounts and profiles
2. **roles** - System roles (seller, buyer, captain, admin, etc.)
3. **user_roles** - Many-to-many relationship between users and roles
4. **companies** - Business entity information
5. **company_documents** - Verification documents for companies
6. **categories** - Product categories
7. **ports** - Shipping ports information
8. **currencies** - Supported currencies and exchange rates

### Product Management
9. **products** - Product listings
10. **product_images** - Product images
11. **product_reviews** - Product reviews and ratings

### Trading Process
12. **rfqs** - Request For Quotation (buyer requests)
13. **dpqs** - Document of Product Quantity (quotation responses)
14. **dpos** - Document of Product Order (confirmed orders)
15. **orders** - Order management
16. **invoices** - Invoice generation
17. **payments** - Payment tracking

### Support Systems
18. **disputes** - Dispute resolution system
19. **messages** - Internal messaging
20. **notifications** - User notifications

### Contact Management
21. **contact_requests** - User-to-user contact requests
22. **contact_form_submissions** - Website contact form submissions

## Sample Data Included
- 12 users (one for each role)
- 3 companies with verification documents
- 6 products across different categories
- 2 RFQs (Request for Quotation)
- 2 DPQs (Document of Product Quantity)
- 2 DPOs (Document of Product Order)
- 2 orders with invoices and payments
- 1 dispute case
- Sample messages and notifications

## Installation Instructions

1. Make sure PostgreSQL is installed on your system
2. Create a new database:
   ```sql
   CREATE DATABASE marsa_fyi;
   ```
3. Connect to the database:
   ```bash
   psql -U your_username -d marsa_fyi
   ```
4. Run the schema script:
   ```bash
   psql -U your_username -d marsa_fyi -f schema.sql
   ```

## Incremental Updates

For existing databases, apply incremental schema updates from the `database` directory:
- `incremental_contact_form_schema.sql` - Adds contact form submissions table with phone number field

## Key Features

### Multi-Role Support
- Seller: Product listing, order management
- Buyer: RFQ creation, order placement
- Captain: Platform administration
- Admin: System management
- HR: User verification
- Accountant: Financial management
- Arbitrator: Dispute resolution
- Surveyor: Product verification
- Insurance: Policy management
- Transporter: Shipping coordination
- Logistics: Supply chain management
- CHA: Customs services

### Trading Workflow
1. Buyers create RFQs (Request for Quotation)
2. Sellers respond with DPQs (Document of Product Quantity)
3. Agreements become DPOs (Document of Product Order)
4. Orders are processed with invoices and payments
5. Disputes can be raised and resolved

### Verification System
- Company document verification
- Product verification
- User role verification

### Communication
- Internal messaging system
- Notification center
- Dispute communication

## Security Considerations
- Passwords are stored as hashes (sample data uses placeholder hashes)
- Role-based access control
- Document verification processes
- Data privacy for confidential RFQs

## Customization
You can modify this schema to add:
- Additional product attributes
- More detailed order tracking
- Enhanced reporting capabilities
- Integration with external systems
- Advanced analytics tables

## Sample Data Credentials
For testing purposes, the following users are created with password hash placeholders:

1. **Seller**: john_seller@marsafyi.com
2. **Buyer**: sarah_buyer@marsafyi.com
3. **Captain**: captain@marsafyi.com
4. **Admin**: admin@marsafyi.com
5. **HR**: hr@marsafyi.com
6. **Accountant**: accountant@marsafyi.com
7. **Arbitrator**: arbitrator@marsafyi.com
8. **Surveyor**: surveyor@marsafyi.com
9. **Insurance**: insurance@marsafyi.com
10. **Transporter**: transporter@marsafyi.com
11. **Logistics**: logistics@marsafyi.com
12. **CHA**: cha@marsafyi.com

## Support
For issues with this schema, please contact the development team.