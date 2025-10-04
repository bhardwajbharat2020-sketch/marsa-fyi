-- Supabase Schema for Marsa FYI Application

-- 1. Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    vendor_code VARCHAR(20) UNIQUE,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Roles table (many-to-many relationship)
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- 4. Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    currency_id INTEGER DEFAULT 1,
    category_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Currencies table
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(5)
);

-- 7. RFQs (Request for Quotation) table
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
    response_deadline DATE,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DPQs (Direct Purchase Quotation) table
CREATE TABLE dpqs (
    id SERIAL PRIMARY KEY,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    specifications TEXT,
    delivery_port_id INTEGER, -- Would reference a ports table
    delivery_date DATE,
    payment_terms TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DPOs (Direct Purchase Order) table
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
    delivery_port_id INTEGER, -- Would reference a ports table
    delivery_date DATE,
    payment_terms TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    dpo_id INTEGER REFERENCES dpos(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE,
    total_amount DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Invoices table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE,
    issue_date DATE,
    due_date DATE,
    amount DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Payouts table
CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2),
    currency VARCHAR(3),
    status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Disputes table
CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    raised_by UUID REFERENCES users(id) ON DELETE CASCADE,
    against_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Survey Requests table
CREATE TABLE survey_requests (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Survey Reports table
CREATE TABLE survey_reports (
    id SERIAL PRIMARY KEY,
    survey_request_id INTEGER REFERENCES survey_requests(id) ON DELETE CASCADE,
    report_details TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Company Documents table
CREATE TABLE company_documents (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    document_name VARCHAR(255),
    document_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. User Issues table
CREATE TABLE user_issues (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    issue TEXT,
    status VARCHAR(50) DEFAULT 'open',
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Contact Requests table
CREATE TABLE contact_requests (
    id SERIAL PRIMARY KEY,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Insurance Requests table
CREATE TABLE insurance_requests (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. Insurance Documents table
CREATE TABLE insurance_documents (
    id SERIAL PRIMARY KEY,
    insurance_request_id INTEGER REFERENCES insurance_requests(id) ON DELETE CASCADE,
    document_url TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. Transport Orders table
CREATE TABLE transport_orders (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    transporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. Logistics Orders table
CREATE TABLE logistics_orders (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    logistics_provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. Tracking Info table
CREATE TABLE tracking_info (
    id SERIAL PRIMARY KEY,
    transport_order_id INTEGER REFERENCES transport_orders(id) ON DELETE CASCADE,
    logistics_order_id INTEGER REFERENCES logistics_orders(id) ON DELETE CASCADE,
    tracking_id VARCHAR(100),
    status VARCHAR(50),
    location TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. CHA Service Requests table
CREATE TABLE cha_service_requests (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 26. CHA Fee Offers table
CREATE TABLE cha_fee_offers (
    id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES cha_service_requests(id) ON DELETE CASCADE,
    fee_amount DECIMAL(10, 2),
    currency VARCHAR(3),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27. CHA Work Orders table
CREATE TABLE cha_work_orders (
    id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES cha_service_requests(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('seller', 'Product seller/vendor'),
    ('buyer', 'Product buyer'),
    ('captain', 'Platform administrator'),
    ('admin', 'System administrator'),
    ('hr', 'Human resources'),
    ('accountant', 'Financial officer'),
    ('arbitrator', 'Dispute resolver'),
    ('surveyor', 'Product surveyor'),
    ('insurance', 'Insurance provider'),
    ('transporter', 'Goods transporter'),
    ('logistics', 'Logistics provider'),
    ('cha', 'Customs house agent');

-- Insert default currencies
INSERT INTO currencies (code, name, symbol) VALUES 
    ('USD', 'US Dollar', '$'),
    ('EUR', 'Euro', '€'),
    ('GBP', 'British Pound', '£'),
    ('INR', 'Indian Rupee', '₹');

-- Insert default categories
INSERT INTO categories (name, description) VALUES 
    ('Electronics', 'Electronic components and devices'),
    ('Textiles', 'Fabric and clothing materials'),
    ('Machinery', 'Industrial machinery and equipment'),
    ('Chemicals', 'Chemical products and compounds'),
    ('Food', 'Food and beverage products'),
    ('Automotive', 'Automotive parts and accessories'),
    ('Construction', 'Construction materials and equipment'),
    ('Healthcare', 'Medical devices and supplies');