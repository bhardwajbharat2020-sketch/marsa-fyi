-- COMPLETELY COMPLETE DATABASE SCHEMA FOR MARSa FYI APPLICATION
-- This schema includes ALL tables from previous schemas plus enhanced security features and role code storage

-- 1. ROLES TABLE
-- Stores all possible user roles in the system with enhanced role code storage
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL, -- Short code for each role (e.g., 'SELL' for seller, 'BUY')
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles with role codes
INSERT INTO roles (name, code, description) VALUES
('admin', 'ADM', 'System administrator with full access'),
('hr', 'HR', 'Human resources manager'),
('accountant', 'ACC', 'Financial and accounting manager'),
('captain', 'CAPT', 'Workflow captain who oversees transactions'),
('seller', 'SELL', 'Product seller/vendor'),
('buyer', 'BUY', 'Product buyer'),
('surveyor', 'SUR', 'Quality surveyor'),
('arbitrator', 'ARB', 'Dispute arbitrator'),
('insurance', 'INS', 'Insurance agent'),
('transporter', 'TRN', 'Logistics and transportation provider'),
('logistics', 'LOG', 'Logistics coordinator'),
('cha', 'CHA', 'Customs house agent');

-- 2. USERS TABLE
-- Stores all user information including authentication details with enhanced security
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash TEXT NOT NULL, -- For storing hashed passwords
    password_reset_token TEXT, -- For password reset functionality
    password_reset_expires TIMESTAMP WITH TIME ZONE, -- Expiration time for reset token
    vendor_code VARCHAR(50) UNIQUE, -- Generated vendor code for each user
    is_verified BOOLEAN DEFAULT FALSE, -- Email/phone verification status
    is_active BOOLEAN DEFAULT TRUE, -- Account activation status
    is_blocked_temp BOOLEAN DEFAULT FALSE, -- Temporary blocking status
    is_blocked_perm BOOLEAN DEFAULT FALSE, -- Permanent blocking status
    blocked_until TIMESTAMP WITH TIME ZONE, -- Temporary blocking expiration
    failed_login_attempts INTEGER DEFAULT 0, -- For account lockout security
    locked_until TIMESTAMP WITH TIME ZONE, -- For account lockout security
    last_login TIMESTAMP WITH TIME ZONE, -- Track last successful login
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER_ROLES TABLE
-- Junction table for many-to-many relationship between users and roles
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE, -- Primary role for the user
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- 4. USER_SESSIONS TABLE
-- Stores user session information for authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PASSWORD_RESET_TOKENS TABLE
-- Stores password reset tokens for forgotten password functionality
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CATEGORIES TABLE
-- Product categories for organizing products
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories (39 categories from ShopPage)
INSERT INTO categories (name, description) VALUES
('Industrial Plants, Machinery & Equipment', 'Industrial plants, machinery and equipment for various industries'),
('Consumer Electronics & Household Appliances', 'Consumer electronics and household appliances'),
('Industrial & Engineering Products, Spares and Supplies', 'Industrial and engineering products, spares and supplies'),
('Building Construction Material & Equipment', 'Building construction materials and equipment'),
('Apparel, Clothing & Garments', 'Apparel, clothing and garments'),
('Vegetables, Fruits, Grains, Dairy Products & FMCG', 'Vegetables, fruits, grains, dairy products and fast moving consumer goods'),
('Medical, Pharma, Surgical & Healthcare', 'Medical, pharmaceutical, surgical and healthcare products'),
('Packaging Material, Supplies & Machines', 'Packaging materials, supplies and machines'),
('Chemicals, Dyes & Allied Products', 'Chemicals, dyes and allied products'),
('Kitchen Containers, Utensils & Cookware', 'Kitchen containers, utensils and cookware'),
('Textiles, Yarn, Fabrics & Allied Industries', 'Textiles, yarn, fabrics and allied industries'),
('Books, Notebooks, Stationery & Publications', 'Books, notebooks, stationery and publications'),
('Cosmetics, Toiletries & Personal Care Products', 'Cosmetics, toiletries and personal care products'),
('Home Furnishings and Home Textiles', 'Home furnishings and home textiles'),
('Gems, Jewellery & Precious Stones', 'Gems, jewellery and precious stones'),
('Computers, Software, IT Support & Solutions', 'Computers, software, IT support and solutions'),
('Fashion & Garment Accessories', 'Fashion and garment accessories'),
('Ayurvedic & Herbal Products', 'Ayurvedic and herbal products'),
('Security Devices, Safety Systems & Services', 'Security devices, safety systems and services'),
('Sports Goods, Games, Toys & Accessories', 'Sports goods, games, toys and accessories'),
('Telecom Products, Equipment & Supplies', 'Telecom products, equipment and supplies'),
('Stationery and Paper Products', 'Stationery and paper products'),
('Bags, Handbags, Luggage & Accessories', 'Bags, handbags, luggage and accessories'),
('Stones, Marble & Granite Supplies', 'Stones, marble and granite supplies'),
('Railway, Shipping & Aviation Products', 'Railway, shipping and aviation products'),
('Leather and Leather Products & Accessories', 'Leather and leather products and accessories'),
('Electronics Components and Supplies', 'Electronics components and supplies'),
('Electrical Equipment and Supplies', 'Electrical equipment and supplies'),
('Pharmaceutical Drugs & Medicines', 'Pharmaceutical drugs and medicines'),
('Mechanical Components & Parts', 'Mechanical components and parts'),
('Scientific, Measuring & Laboratory Instruments', 'Scientific, measuring and laboratory instruments'),
('Furniture, Furniture Supplies & Hardware', 'Furniture, furniture supplies and hardware'),
('Fertilizers, Seeds, Plants & Animal Husbandry', 'Fertilizers, seeds, plants and animal husbandry'),
('Automobiles, Spare Parts and Accessories', 'Automobiles, spare parts and accessories'),
('Housewares, Home Appliances & Decorations', 'Housewares, home appliances and decorations'),
('Metals, Minerals, Ores & Alloys', 'Metals, minerals, ores and alloys'),
('Tools, Machine Tools & Power Tools', 'Tools, machine tools and power tools'),
('Gifts, Crafts, Antiques & Handmade Decoratives', 'Gifts, crafts, antiques and handmade decoratives'),
('Bicycles, Rickshaws, Spares and Accessories', 'Bicycles, rickshaws, spares and accessories');

-- 7. CURRENCIES TABLE
-- Supported currencies in the system
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL, -- e.g., USD, EUR, GBP
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default currencies
INSERT INTO currencies (code, name, symbol) VALUES
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('INR', 'Indian Rupee', '₹');

-- 8. PRODUCTS TABLE
-- Stores product information
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    moq INTEGER,
    moq_uom VARCHAR(10),
    available_quantity INTEGER,
    quantity_uom VARCHAR(10),
    price_type VARCHAR(10) DEFAULT 'EXW',
    is_relabeling_allowed BOOLEAN DEFAULT FALSE,
    offer_validity_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    image_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PORTS TABLE
-- Shipping ports for delivery locations
CREATE TABLE ports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    code VARCHAR(10) UNIQUE, -- Port code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample ports
INSERT INTO ports (name, country, code) VALUES
('Port of Los Angeles', 'USA', 'USLAX'),
('Port of Rotterdam', 'Netherlands', 'NLROT'),
('Port of Shanghai', 'China', 'CNSHA'),
('Port of Singapore', 'Singapore', 'SGSIN'),
('Port of Hamburg', 'Germany', 'DEHAM');

-- 10. RFQS (Request for Quotation) TABLE
-- Buyer requests for product quotations
CREATE TABLE rfqs (
    id SERIAL PRIMARY KEY,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    title VARCHAR(255),
    description TEXT,
    quantity INTEGER,
    budget_range_min DECIMAL(10, 2),
    budget_range_max DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    response_deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'open', -- open, closed, fulfilled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. DPQS (Detailed Product Quotation Sheet) TABLE
-- Detailed quotation responses to RFQs
CREATE TABLE dpqs (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES rfqs(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    specifications TEXT,
    delivery_port_id INTEGER REFERENCES ports(id),
    delivery_date DATE,
    payment_terms TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. DPOS (Detailed Product Order Sheet) TABLE
-- Confirmed orders based on accepted quotations
CREATE TABLE dpos (
    id SERIAL PRIMARY KEY,
    dpq_id INTEGER REFERENCES dpqs(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    specifications TEXT,
    delivery_port_id INTEGER REFERENCES ports(id),
    delivery_date DATE,
    payment_terms TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. ORDERS TABLE
-- Main orders table for tracking transactions
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    dpo_id INTEGER REFERENCES dpos(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE,
    total_amount DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, completed, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. INVOICES TABLE
-- Invoices for orders
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE,
    issue_date DATE,
    due_date DATE,
    amount DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. PAYMENTS TABLE
-- Payment records
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    payment_method VARCHAR(50), -- credit_card, bank_transfer, paypal, etc.
    transaction_id VARCHAR(255), -- External payment gateway transaction ID
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    approved_by UUID REFERENCES users(id), -- Who approved the payment
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. PAYOUTS TABLE
-- Seller payout records
CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2),
    currency VARCHAR(3),
    status VARCHAR(50) DEFAULT 'pending', -- pending, processed, failed
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. DISPUTES TABLE
-- Dispute management
CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    raised_by UUID REFERENCES users(id) ON DELETE CASCADE,
    against_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. SURVEY_REQUESTS TABLE
-- Product survey requests
CREATE TABLE survey_requests (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    surveyor_id UUID REFERENCES users(id), -- Assigned surveyor
    fee_amount DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, assigned, completed, paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. SURVEY_REPORTS TABLE
-- Survey reports
CREATE TABLE survey_reports (
    id SERIAL PRIMARY KEY,
    survey_request_id INTEGER REFERENCES survey_requests(id) ON DELETE CASCADE,
    surveyor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report TEXT,
    findings JSONB, -- Structured findings data
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. INSURANCE_REQUESTS TABLE
-- Insurance requests for products/orders
CREATE TABLE insurance_requests (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    insurance_agent_id UUID REFERENCES users(id), -- Assigned insurance agent
    coverage_amount DECIMAL(10, 2),
    premium_amount DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. INSURANCE_POLICIES TABLE
-- Insurance policies
CREATE TABLE insurance_policies (
    id SERIAL PRIMARY KEY,
    insurance_request_id INTEGER REFERENCES insurance_requests(id) ON DELETE CASCADE,
    policy_number VARCHAR(100) UNIQUE,
    coverage_details TEXT,
    terms_and_conditions TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. TRANSPORT_ORDERS TABLE
-- Transportation orders
CREATE TABLE transport_orders (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    transporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    origin_port_id INTEGER REFERENCES ports(id),
    destination_port_id INTEGER REFERENCES ports(id),
    estimated_departure DATE,
    estimated_arrival DATE,
    actual_departure TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_transit, delivered, delayed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. LOGISTICS_ORDERS TABLE
-- Logistics coordination orders
CREATE TABLE logistics_orders (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    logistics_provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    services_requested TEXT, -- JSON or text description of services
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. TRACKING_INFO TABLE
-- Shipment tracking information
CREATE TABLE tracking_info (
    id SERIAL PRIMARY KEY,
    transport_order_id INTEGER REFERENCES transport_orders(id) ON DELETE CASCADE,
    logistics_order_id INTEGER REFERENCES logistics_orders(id) ON DELETE CASCADE,
    tracking_id VARCHAR(100) UNIQUE,
    location VARCHAR(255),
    status VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 25. CHA_SERVICE_REQUESTS TABLE
-- Customs House Agent service requests
CREATE TABLE cha_service_requests (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cha_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Assigned CHA
    service_type VARCHAR(100), -- clearance, documentation, etc.
    fee_amount DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, assigned, completed, paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 26. COMPANY_DOCUMENTS TABLE
-- Company verification documents
CREATE TABLE company_documents (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100), -- business_license, id_proof, etc.
    document_name VARCHAR(255),
    file_path VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27. CONTACT_REQUESTS TABLE
-- Requests for contact between users
CREATE TABLE contact_requests (
    id SERIAL PRIMARY KEY,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 28. USER_ISSUES TABLE
-- User-reported issues
CREATE TABLE user_issues (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    issue TEXT,
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 29. NOTIFICATIONS TABLE
-- User notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50), -- order, payment, dispute, etc.
    related_entity_id INTEGER, -- ID of the related entity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 30. EVIDENCE_REQUESTS TABLE
-- Evidence requests in dispute resolution
CREATE TABLE evidence_requests (
    id SERIAL PRIMARY KEY,
    dispute_id INTEGER REFERENCES disputes(id) ON DELETE CASCADE,
    party_type VARCHAR(50), -- plaintiff, defendant
    document_name VARCHAR(255),
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, submitted, reviewed
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 31. INSURANCE_DOCUMENTS TABLE
-- Insurance documents
CREATE TABLE insurance_documents (
    id SERIAL PRIMARY KEY,
    insurance_request_id INTEGER REFERENCES insurance_requests(id) ON DELETE CASCADE,
    document_url TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 32. CHA_FEE_OFFERS TABLE
-- CHA fee offers
CREATE TABLE cha_fee_offers (
    id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES cha_service_requests(id) ON DELETE CASCADE,
    fee_amount DECIMAL(10, 2),
    currency VARCHAR(3),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 33. CHA_WORK_ORDERS TABLE
-- CHA work orders
CREATE TABLE cha_work_orders (
    id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES cha_service_requests(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 34. USER_ACTIONS TABLE
-- User actions logging for HR functionality
CREATE TABLE user_actions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_by UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50), -- TEMP_BLOCK, PERM_BLOCK, UNBLOCK
    reason TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_vendor_code ON users(vendor_code);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_users_is_blocked_temp ON users(is_blocked_temp);
CREATE INDEX idx_users_is_blocked_perm ON users(is_blocked_perm);
CREATE INDEX idx_users_blocked_until ON users(blocked_until);
CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_action ON user_actions(action);

-- Enable Row Level Security (RLS) for sensitive tables
-- Note: You'll need to define policies based on your application's access control requirements
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Create functions for generating vendor codes
-- This function generates a unique vendor code based on role and timestamp
CREATE OR REPLACE FUNCTION generate_vendor_code(role_code VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    prefix VARCHAR(10);
    year_part VARCHAR(2);
    random_part VARCHAR(10);
BEGIN
    -- Set prefix based on role code
    prefix := role_code;
    
    -- Get last 2 digits of year
    year_part := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Generate random part
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    
    RETURN prefix || '-' || year_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically generate vendor code
CREATE OR REPLACE FUNCTION set_vendor_code()
RETURNS TRIGGER AS $$
DECLARE
    role_code VARCHAR(10);
BEGIN
    IF NEW.vendor_code IS NULL THEN
        -- Get the user's primary role code
        SELECT r.code INTO role_code
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = NEW.id AND ur.is_primary = TRUE
        LIMIT 1;
        
        -- If no primary role found, use default
        IF role_code IS NULL THEN
            role_code := 'USER';
        END IF;
        
        NEW.vendor_code := generate_vendor_code(role_code);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER trigger_set_vendor_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_vendor_code();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables that need updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dpqs_updated_at BEFORE UPDATE ON dpqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dpos_updated_at BEFORE UPDATE ON dpos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_requests_updated_at BEFORE UPDATE ON survey_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_reports_updated_at BEFORE UPDATE ON survey_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_requests_updated_at BEFORE UPDATE ON insurance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON insurance_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_orders_updated_at BEFORE UPDATE ON transport_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_orders_updated_at BEFORE UPDATE ON logistics_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cha_service_requests_updated_at BEFORE UPDATE ON cha_service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_documents_updated_at BEFORE UPDATE ON company_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_requests_updated_at BEFORE UPDATE ON contact_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_issues_updated_at BEFORE UPDATE ON user_issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
-- Sample categories (already inserted above)
-- INSERT INTO categories (name, description) VALUES
-- ('Industrial Plants, Machinery & Equipment', 'Industrial plants, machinery and equipment for various industries'),
-- ('Consumer Electronics & Household Appliances', 'Consumer electronics and household appliances'),
-- ('Industrial & Engineering Products, Spares and Supplies', 'Industrial and engineering products, spares and supplies'),
-- ('Building Construction Material & Equipment', 'Building construction materials and equipment'),
-- ('Apparel, Clothing & Garments', 'Apparel, clothing and garments'),
-- ('Vegetables, Fruits, Grains, Dairy Products & FMCG', 'Vegetables, fruits, grains, dairy products and fast moving consumer goods'),
-- ('Medical, Pharma, Surgical & Healthcare', 'Medical, pharmaceutical, surgical and healthcare products'),
-- ('Packaging Material, Supplies & Machines', 'Packaging materials, supplies and machines'),
-- ('Chemicals, Dyes & Allied Products', 'Chemicals, dyes and allied products'),
-- ('Kitchen Containers, Utensils & Cookware', 'Kitchen containers, utensils and cookware'),
-- ('Textiles, Yarn, Fabrics & Allied Industries', 'Textiles, yarn, fabrics and allied industries'),
-- ('Books, Notebooks, Stationery & Publications', 'Books, notebooks, stationery and publications'),
-- ('Cosmetics, Toiletries & Personal Care Products', 'Cosmetics, toiletries and personal care products'),
-- ('Home Furnishings and Home Textiles', 'Home furnishings and home textiles'),
-- ('Gems, Jewellery & Precious Stones', 'Gems, jewellery and precious stones'),
-- ('Computers, Software, IT Support & Solutions', 'Computers, software, IT support and solutions'),
-- ('Fashion & Garment Accessories', 'Fashion and garment accessories'),
-- ('Ayurvedic & Herbal Products', 'Ayurvedic and herbal products'),
-- ('Security Devices, Safety Systems & Services', 'Security devices, safety systems and services'),
-- ('Sports Goods, Games, Toys & Accessories', 'Sports goods, games, toys and accessories'),
-- ('Telecom Products, Equipment & Supplies', 'Telecom products, equipment and supplies'),
-- ('Stationery and Paper Products', 'Stationery and paper products'),
-- ('Bags, Handbags, Luggage & Accessories', 'Bags, handbags, luggage and accessories'),
-- ('Stones, Marble & Granite Supplies', 'Stones, marble and granite supplies'),
-- ('Railway, Shipping & Aviation Products', 'Railway, shipping and aviation products'),
-- ('Leather and Leather Products & Accessories', 'Leather and leather products and accessories'),
-- ('Electronics Components and Supplies', 'Electronics components and supplies'),
-- ('Electrical Equipment and Supplies', 'Electrical equipment and supplies'),
-- ('Pharmaceutical Drugs & Medicines', 'Pharmaceutical drugs and medicines'),
-- ('Mechanical Components & Parts', 'Mechanical components and parts'),
-- ('Scientific, Measuring & Laboratory Instruments', 'Scientific, measuring and laboratory instruments'),
-- ('Furniture, Furniture Supplies & Hardware', 'Furniture, furniture supplies and hardware'),
-- ('Fertilizers, Seeds, Plants & Animal Husbandry', 'Fertilizers, seeds, plants and animal husbandry'),
-- ('Automobiles, Spare Parts and Accessories', 'Automobiles, spare parts and accessories'),
-- ('Housewares, Home Appliances & Decorations', 'Housewares, home appliances and decorations'),
-- ('Metals, Minerals, Ores & Alloys', 'Metals, minerals, ores and alloys'),
-- ('Tools, Machine Tools & Power Tools', 'Tools, machine tools and power tools'),
-- ('Gifts, Crafts, Antiques & Handmade Decoratives', 'Gifts, crafts, antiques and handmade decoratives'),
-- ('Bicycles, Rickshaws, Spares and Accessories', 'Bicycles, rickshaws, spares and accessories');

-- Sample ports (already inserted above)
-- INSERT INTO ports (name, country, code) VALUES
-- ('Port of Los Angeles', 'USA', 'USLAX'),
-- ('Port of Rotterdam', 'Netherlands', 'NLROT'),
-- ('Port of Shanghai', 'China', 'CNSHA'),
-- ('Port of Singapore', 'Singapore', 'SGSIN'),
-- ('Port of Hamburg', 'Germany', 'DEHAM');

-- Sample currencies (already inserted above)
-- INSERT INTO currencies (code, name, symbol) VALUES
-- ('USD', 'US Dollar', '$'),
-- ('EUR', 'Euro', '€'),
-- ('GBP', 'British Pound', '£');

-- Sample users (for testing only - in production, users would register)
-- Note: Passwords should be hashed in the application before insertion
-- INSERT INTO users (username, email, phone, first_name, last_name, password_hash, vendor_code) VALUES
-- ('john_seller', 'john@example.com', '+1234567890', 'John', 'Seller', 'hashed_password_here', 'SELL-23-ABC123'),
-- ('sarah_buyer', 'sarah@example.com', '+1234567891', 'Sarah', 'Buyer', 'hashed_password_here', 'BUY-23-DEF456');

-- Sample products (for testing only)
-- When inserting sample products, use the new category IDs
-- For example, if 'Industrial Plants, Machinery & Equipment' gets ID 1:
-- INSERT INTO products (seller_id, name, description, category_id, price, currency_id, is_active, is_verified, moq, moq_uom, available_quantity, quantity_uom, price_type, is_relabeling_allowed, offer_validity_date, status, image_url, thumbnail_url) VALUES
-- (1, 'Premium Industrial Equipment', 'High-quality industrial equipment for manufacturing', 1, 5000.00, 1, TRUE, TRUE, 100, 'pcs', 1000, 'pcs', 'EXW', TRUE, '2025-12-31 23:59:59', 'approved', '/images/product1.jpg', '/images/thumb1.jpg'),
-- (1, 'Advanced Circuit Boards', 'Multi-layer PCBs with advanced features', 2, 12000.00, 1, TRUE, TRUE, 50, 'pcs', 500, 'pcs', 'FOB', FALSE, '2025-12-31 23:59:59', 'approved', '/images/product2.jpg', '/images/thumb2.jpg');

-- Sample roles (already inserted above)
-- INSERT INTO roles (name, code, description) VALUES
-- ('admin', 'ADM', 'System administrator with full access'),
-- ('hr', 'HR', 'Human resources manager'),
-- ('accountant', 'ACC', 'Financial and accounting manager'),
-- ('captain', 'CAPT', 'Workflow captain who oversees transactions'),
-- ('seller', 'SELL', 'Product seller/vendor'),
-- ('buyer', 'BUY', 'Product buyer'),
-- ('surveyor', 'SUR', 'Quality surveyor'),
-- ('arbitrator', 'ARB', 'Dispute arbitrator'),
-- ('insurance', 'INS', 'Insurance agent'),
-- ('transporter', 'TRN', 'Logistics and transportation provider'),
-- ('logistics', 'LOG', 'Logistics coordinator'),
-- ('cha', 'CHA', 'Customs house agent');

COMMIT;