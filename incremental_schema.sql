-- Incremental Schema Updates for Marsa FYI Application
-- This script adds missing columns and constraints to existing tables

-- Add missing columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS vendor_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to products table if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to roles table if they don't exist
ALTER TABLE roles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to user_roles table if they don't exist
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to categories table if they don't exist
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to currencies table if they don't exist
ALTER TABLE currencies 
ADD COLUMN IF NOT EXISTS symbol VARCHAR(5);

-- Add missing columns to rfqs table if they don't exist
ALTER TABLE rfqs 
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id),
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER,
ADD COLUMN IF NOT EXISTS budget_range_min DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS budget_range_max DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS response_deadline DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to dpqs table if they don't exist
ALTER TABLE dpqs 
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id),
ADD COLUMN IF NOT EXISTS quantity INTEGER,
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS specifications TEXT,
ADD COLUMN IF NOT EXISTS delivery_port_id INTEGER,
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to dpos table if they don't exist
ALTER TABLE dpos 
ADD COLUMN IF NOT EXISTS dpq_id INTEGER REFERENCES dpqs(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id),
ADD COLUMN IF NOT EXISTS quantity INTEGER,
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS specifications TEXT,
ADD COLUMN IF NOT EXISTS delivery_port_id INTEGER,
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS dpo_id INTEGER REFERENCES dpos(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to invoices table if they don't exist
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS issue_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to payments table if they don't exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency_id INTEGER REFERENCES currencies(id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to payouts table if they don't exist
ALTER TABLE payouts 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to disputes table if they don't exist
ALTER TABLE disputes 
ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS raised_by UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS against_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open',
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to survey_requests table if they don't exist
ALTER TABLE survey_requests 
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id),
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to survey_reports table if they don't exist
ALTER TABLE survey_reports 
ADD COLUMN IF NOT EXISTS survey_request_id INTEGER REFERENCES survey_requests(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS report_details TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to company_documents table if they don't exist
ALTER TABLE company_documents 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS document_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS document_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to user_issues table if they don't exist
ALTER TABLE user_issues 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS issue TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open',
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to contact_requests table if they don't exist
ALTER TABLE contact_requests 
ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to insurance_requests table if they don't exist
ALTER TABLE insurance_requests 
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id),
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to insurance_documents table if they don't exist
ALTER TABLE insurance_documents 
ADD COLUMN IF NOT EXISTS insurance_request_id INTEGER REFERENCES insurance_requests(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to transport_orders table if they don't exist
ALTER TABLE transport_orders 
ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS transporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to logistics_orders table if they don't exist
ALTER TABLE logistics_orders 
ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS logistics_provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to tracking_info table if they don't exist
ALTER TABLE tracking_info 
ADD COLUMN IF NOT EXISTS transport_order_id INTEGER REFERENCES transport_orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS logistics_order_id INTEGER REFERENCES logistics_orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(50),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to cha_service_requests table if they don't exist
ALTER TABLE cha_service_requests 
ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id),
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to cha_fee_offers table if they don't exist
ALTER TABLE cha_fee_offers 
ADD COLUMN IF NOT EXISTS service_request_id INTEGER REFERENCES cha_service_requests(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to cha_work_orders table if they don't exist
ALTER TABLE cha_work_orders 
ADD COLUMN IF NOT EXISTS service_request_id INTEGER REFERENCES cha_service_requests(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_verified ON products(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_vendor_code ON users(vendor_code);

-- Insert default roles if they don't exist
INSERT INTO roles (name, description) 
SELECT 'seller', 'Product seller/vendor'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'seller');

INSERT INTO roles (name, description) 
SELECT 'buyer', 'Product buyer'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'buyer');

INSERT INTO roles (name, description) 
SELECT 'captain', 'Platform administrator'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'captain');

INSERT INTO roles (name, description) 
SELECT 'admin', 'System administrator'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin');

INSERT INTO roles (name, description) 
SELECT 'hr', 'Human resources'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'hr');

INSERT INTO roles (name, description) 
SELECT 'accountant', 'Financial officer'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'accountant');

INSERT INTO roles (name, description) 
SELECT 'arbitrator', 'Dispute resolver'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'arbitrator');

INSERT INTO roles (name, description) 
SELECT 'surveyor', 'Product surveyor'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'surveyor');

INSERT INTO roles (name, description) 
SELECT 'insurance', 'Insurance provider'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'insurance');

INSERT INTO roles (name, description) 
SELECT 'transporter', 'Goods transporter'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'transporter');

INSERT INTO roles (name, description) 
SELECT 'logistics', 'Logistics provider'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'logistics');

INSERT INTO roles (name, description) 
SELECT 'cha', 'Customs house agent'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'cha');

-- Insert default currencies if they don't exist
INSERT INTO currencies (code, name, symbol) 
SELECT 'USD', 'US Dollar', '$'
WHERE NOT EXISTS (SELECT 1 FROM currencies WHERE code = 'USD');

INSERT INTO currencies (code, name, symbol) 
SELECT 'EUR', 'Euro', '€'
WHERE NOT EXISTS (SELECT 1 FROM currencies WHERE code = 'EUR');

INSERT INTO currencies (code, name, symbol) 
SELECT 'GBP', 'British Pound', '£'
WHERE NOT EXISTS (SELECT 1 FROM currencies WHERE code = 'GBP');

INSERT INTO currencies (code, name, symbol) 
SELECT 'INR', 'Indian Rupee', '₹'
WHERE NOT EXISTS (SELECT 1 FROM currencies WHERE code = 'INR');

-- Insert default categories if they don't exist
INSERT INTO categories (name, description) 
SELECT 'Electronics', 'Electronic components and devices'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Electronics');

INSERT INTO categories (name, description) 
SELECT 'Textiles', 'Fabric and clothing materials'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Textiles');

INSERT INTO categories (name, description) 
SELECT 'Machinery', 'Industrial machinery and equipment'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Machinery');

INSERT INTO categories (name, description) 
SELECT 'Chemicals', 'Chemical products and compounds'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Chemicals');

INSERT INTO categories (name, description) 
SELECT 'Food', 'Food and beverage products'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Food');

INSERT INTO categories (name, description) 
SELECT 'Automotive', 'Automotive parts and accessories'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Automotive');

INSERT INTO categories (name, description) 
SELECT 'Construction', 'Construction materials and equipment'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Construction');

INSERT INTO categories (name, description) 
SELECT 'Healthcare', 'Medical devices and supplies'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Healthcare');