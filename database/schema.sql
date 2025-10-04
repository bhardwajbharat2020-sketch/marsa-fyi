-- PostgreSQL Database Schema for Marsa FYI B2B Platform
-- Created: 2025-10-03
-- Version: 1.0

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS9messages CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS rfqs CASCADE;
DROP TABLE IF EXISTS dpos CASCADE;
DROP TABLE IF EXISTS dpqs CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS company_documents CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS ports CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;

-- Create tables

-- 1. Currencies table
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(5) NOT NULL,
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ports table
CREATE TABLE ports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL,
    city VARCHAR(50),
    code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. User Roles table (many-to-many relationship)
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- 7. Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    legal_name VARCHAR(100),
    registration_number VARCHAR(50),
    tax_id VARCHAR(50),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(100),
    established_year INTEGER,
    employee_count INTEGER,
    annual_revenue DECIMAL(15, 2),
    description TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Company Documents table
CREATE TABLE company_documents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(12, 2),
    currency_id INTEGER REFERENCES currencies(id),
    min_order_quantity INTEGER DEFAULT 1,
    stock_quantity INTEGER DEFAULT 0,
    unit_of_measure VARCHAR(20),
    weight DECIMAL(10, 2),
    dimensions VARCHAR(50),
    origin_port_id INTEGER REFERENCES ports(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Product Images table
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Product Reviews table
CREATE TABLE product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, buyer_id)
);

-- 12. DPQs (Document of Product Quantity) table
CREATE TABLE dpqs (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2),
    total_price DECIMAL(12, 2),
    currency_id INTEGER REFERENCES currencies(id),
    specifications JSONB,
    delivery_port_id INTEGER REFERENCES ports(id),
    delivery_date DATE,
    payment_terms TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. DPOs (Document of Product Order) table
CREATE TABLE dpos (
    id SERIAL PRIMARY KEY,
    dpq_id INTEGER REFERENCES dpqs(id) ON DELETE CASCADE,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2),
    total_price DECIMAL(12, 2),
    currency_id INTEGER REFERENCES currencies(id),
    specifications JSONB,
    delivery_port_id INTEGER REFERENCES ports(id),
    delivery_date DATE,
    payment_terms TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. RFQs (Request for Quotation) table
CREATE TABLE rfqs (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    quantity INTEGER,
    unit_of_measure VARCHAR(20),
    delivery_port_id INTEGER REFERENCES ports(id),
    delivery_date DATE,
    budget_range_min DECIMAL(12, 2),
    budget_range_max DECIMAL(12, 2),
    currency_id INTEGER REFERENCES currencies(id),
    is_confidential BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'open', -- open, closed, fulfilled
    response_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    dpo_id INTEGER REFERENCES dpos(id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE,
    total_amount DECIMAL(12, 2),
    currency_id INTEGER REFERENCES currencies(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, completed
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, partial, refunded
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Invoices table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency_id INTEGER REFERENCES currencies(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, cancelled
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency_id INTEGER REFERENCES currencies(id),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Disputes table
CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    raised_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    against_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high, critical
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id INTEGER REFERENCES messages(id),
    related_dispute_id INTEGER REFERENCES disputes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data

-- Insert currencies
INSERT INTO currencies (code, name, symbol, exchange_rate) VALUES
('USD', 'US Dollar', '$', 1.0000),
('EUR', 'Euro', '€', 0.9300),
('GBP', 'British Pound', '£', 0.7900),
('INR', 'Indian Rupee', '₹', 83.0000);

-- Insert ports
INSERT INTO ports (name, country, city, code) VALUES
('Mumbai Port', 'India', 'Mumbai', 'INBOM'),
('Chennai Port', 'India', 'Chennai', 'INMAA'),
('Jawaharlal Nehru Port', 'India', 'Navi Mumbai', 'INNSA'),
('Kolkata Port', 'India', 'Kolkata', 'INKOL'),
('Vishakhapatnam Port', 'India', 'Vishakhapatnam', 'INVTZ');

-- Insert categories
INSERT INTO categories (name, description, icon) VALUES
('Electronics', 'Electronic components and devices', '🔌'),
('Machinery', 'Industrial machinery and equipment', '⚙️'),
('Textiles', 'Textile products and fabrics', '🧵'),
('Chemicals', 'Chemical products and compounds', '⚗️'),
('Automotive', 'Automotive parts and accessories', '🚗'),
('Construction', 'Construction materials and supplies', '🏗️'),
('Healthcare', 'Medical devices and healthcare products', '⚕️'),
('Food & Beverages', 'Food products and beverages', '🍎');

-- Insert roles
INSERT INTO roles (name, description) VALUES
('seller', 'Product seller/vendor'),
('buyer', 'Product buyer/customer'),
('captain', 'Platform captain/administrator'),
('admin', 'System administrator'),
('hr', 'Human resources personnel'),
('accountant', 'Accounting personnel'),
('arbitrator', 'Dispute arbitrator'),
('surveyor', 'Product surveyor'),
('insurance', 'Insurance agent'),
('transporter', 'Goods transporter'),
('logistics', 'Logistics coordinator'),
('cha', 'Customs House Agent');

-- Insert users
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_verified) VALUES
('john_seller', 'john.seller@marsafyi.com', '$2b$10$examplehash1', 'John', 'Seller', '+919876543210', TRUE),
('sarah_buyer', 'sarah.buyer@marsafyi.com', '$2b$10$examplehash2', 'Sarah', 'Buyer', '+919876543211', TRUE),
('captain_user', 'captain@marsafyi.com', '$2b$10$examplehash3', 'Captain', 'Admin', '+919876543212', TRUE),
('admin_user', 'admin@marsafyi.com', '$2b$10$examplehash4', 'Admin', 'User', '+919876543213', TRUE),
('hr_user', 'hr@marsafyi.com', '$2b$10$examplehash5', 'HR', 'Manager', '+919876543214', TRUE),
('accountant_user', 'accountant@marsafyi.com', '$2b$10$examplehash6', 'Account', 'Manager', '+919876543215', TRUE),
('arbitrator_user', 'arbitrator@marsafyi.com', '$2b$10$examplehash7', 'Arbit', 'Rator', '+919876543216', TRUE),
('surveyor_user', 'surveyor@marsafyi.com', '$2b$10$examplehash8', 'Survey', 'Or', '+919876543217', TRUE),
('insurance_user', 'insurance@marsafyi.com', '$2b$10$examplehash9', 'Insure', 'Agent', '+919876543218', TRUE),
('transporter_user', 'transporter@marsafyi.com', '$2b$10$examplehash10', 'Trans', 'Porter', '+919876543219', TRUE),
('logistics_user', 'logistics@marsafyi.com', '$2b$10$examplehash11', 'Logi', 'Stics', '+919876543220', TRUE),
('cha_user', 'cha@marsafyi.com', '$2b$10$examplehash12', 'Customs', 'Agent', '+919876543221', TRUE);

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, is_primary) VALUES
(1, 1, TRUE), -- John Seller is a seller
(2, 2, TRUE), -- Sarah Buyer is a buyer
(3, 3, TRUE), -- Captain User is a captain
(4, 4, TRUE), -- Admin User is an admin
(5, 5, TRUE), -- HR User is HR
(6, 6, TRUE), -- Accountant User is an accountant
(7, 7, TRUE), -- Arbitrator User is an arbitrator
(8, 8, TRUE), -- Surveyor User is a surveyor
(9, 9, TRUE), -- Insurance User is an insurance agent
(10, 10, TRUE), -- Transporter User is a transporter
(11, 11, TRUE), -- Logistics User is logistics
(12, 12, TRUE); -- CHA User is a CHA

-- Insert companies
INSERT INTO companies (name, legal_name, registration_number, tax_id, address, city, state, country, postal_code, phone, email, website, established_year, employee_count, annual_revenue, description, is_verified, verification_date) VALUES
('Tech Electronics Ltd.', 'Tech Electronics Private Limited', 'U12345MH2023PTC123456', 'AAACT1234P', '123 Electronics Street', 'Mumbai', 'Maharashtra', 'India', '400001', '+912212345678', 'info@techelectronics.com', 'www.techelectronics.com', 2023, 50, 5000000.00, 'Leading supplier of electronic components and devices', TRUE, '2023-10-01 10:00:00'),
('Global Textiles Inc.', 'Global Textiles Corporation', 'U78901MH2022PTC789012', 'BBBGT7890G', '456 Fabric Road', 'Chennai', 'Tamil Nadu', 'India', '600001', '+914412345678', 'contact@globaltextiles.com', 'www.globaltextiles.com', 2022, 120, 12000000.00, 'Premium supplier of organic cotton textiles', TRUE, '2022-05-15 14:30:00'),
('Mega Machinery Corp.', 'Mega Machinery Corporation', 'U34567MH2021PTC345678', 'CCCMC3456C', '789 Industrial Avenue', 'Pune', 'Maharashtra', 'India', '411001', '+912012345678', 'sales@megamachinery.com', 'www.megamachinery.com', 2021, 85, 8500000.00, 'Manufacturer of industrial machinery parts', TRUE, '2021-12-20 09:15:00');

-- Insert company documents
INSERT INTO company_documents (company_id, document_type, document_name, file_path, file_size, uploaded_by, is_verified, verification_date) VALUES
(1, 'GST Certificate', 'GST_Certificate_Tech_Electronics.pdf', '/documents/gst_tech_electronics.pdf', 1024000, 1, TRUE, '2023-10-01 11:00:00'),
(2, 'VAT Certificate', 'VAT_Certificate_Global_Textiles.pdf', '/documents/vat_global_textiles.pdf', 980000, 1, TRUE, '2022-05-16 10:30:00'),
(3, 'Business License', 'Business_License_Mega_Machinery.pdf', '/documents/license_mega_machinery.pdf', 1200000, 1, TRUE, '2021-12-21 10:45:00');

-- Insert products
INSERT INTO products (seller_id, company_id, category_id, name, description, short_description, sku, price, currency_id, min_order_quantity, stock_quantity, unit_of_measure, weight, dimensions, origin_port_id, is_active, is_verified, verification_date) VALUES
(1, 1, 1, 'Premium Electronics Components', 'High-quality electronic components for industrial use with 5-year warranty. These components are designed for heavy-duty applications and have been tested under extreme conditions to ensure reliability and longevity.', 'Industrial electronic components with 5-year warranty', 'ELEC-001', 5000.00, 1, 10, 1000, 'pieces', 0.5, '10x5x3 cm', 1, TRUE, TRUE, '2023-10-02 10:00:00'),
(1, 1, 1, 'Advanced Circuit Boards', 'Multi-layer PCBs with advanced features for high-frequency applications. Gold-plated contacts for enhanced conductivity and durability.', 'Multi-layer PCBs for high-frequency applications', 'ELEC-002', 12000.00, 1, 5, 500, 'pieces', 0.2, '15x10x1 cm', 1, TRUE, TRUE, '2023-10-02 10:30:00'),
(2, 2, 3, 'Organic Cotton Textiles', 'Sustainable organic cotton fabrics for fashion industry, GOTS certified. Made from 100% organic cotton without the use of harmful chemicals or pesticides.', 'GOTS certified organic cotton fabrics', 'TEXT-001', 3500.00, 1, 20, 2000, 'meters', 0.15, NULL, 2, TRUE, TRUE, '2022-05-17 11:00:00'),
(2, 2, 3, 'Premium Fabric Rolls', 'High-quality fabric rolls in various patterns and colors. Perfect for fashion designers and manufacturers.', 'Premium fabric rolls in various patterns', 'TEXT-002', 8500.00, 1, 10, 500, 'rolls', 2.0, NULL, 2, TRUE, TRUE, '2022-05-17 11:30:00'),
(3, 3, 2, 'Industrial Machinery Parts', 'Heavy-duty machinery components for manufacturing with ISO 9001 certification. Precision-engineered for maximum durability and performance.', 'Heavy-duty machinery components with ISO 9001 certification', 'MACH-001', 12000.00, 1, 2, 100, 'pieces', 5.0, '30x20x15 cm', 3, TRUE, TRUE, '2021-12-22 12:00:00'),
(3, 3, 2, 'Precision Manufacturing Tools', 'High-precision tools for manufacturing processes. Comes with calibration certificate and 2-year warranty.', 'High-precision manufacturing tools with warranty', 'MACH-002', 25000.00, 1, 1, 50, 'pieces', 1.5, '25x15x10 cm', 3, TRUE, TRUE, '2021-12-22 12:30:00');

-- Insert product images
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
(1, '/images/electronics_1.jpg', TRUE, 1),
(1, '/images/electronics_1_2.jpg', FALSE, 2),
(2, '/images/electronics_2.jpg', TRUE, 1),
(3, '/images/textiles_1.jpg', TRUE, 1),
(3, '/images/textiles_1_2.jpg', FALSE, 2),
(4, '/images/textiles_2.jpg', TRUE, 1),
(5, '/images/machinery_1.jpg', TRUE, 1),
(6, '/images/machinery_2.jpg', TRUE, 1);

-- Insert sample RFQs
INSERT INTO rfqs (buyer_id, title, description, category_id, quantity, unit_of_measure, delivery_port_id, delivery_date, budget_range_min, budget_range_max, currency_id, status, response_deadline) VALUES
(2, 'Need High-Quality Electronic Components', 'Looking for premium electronic components for our manufacturing process. Need minimum 100 units with warranty.', 1, 100, 'pieces', 1, '2025-11-15', 4000.00, 6000.00, 1, 'open', '2025-10-30 23:59:59'),
(2, 'Organic Cotton Fabric for Fashion Line', 'Require organic cotton fabric for our new sustainable fashion line. Need 500 meters of various colors.', 3, 500, 'meters', 2, '2025-12-01', 3000.00, 4000.00, 1, 'open', '2025-11-15 23:59:59');

-- Insert sample DPQs
INSERT INTO dpqs (buyer_id, product_id, quantity, unit_price, total_price, currency_id, delivery_port_id, delivery_date, payment_terms, status) VALUES
(2, 1, 50, 5000.00, 250000.00, 1, 1, '2025-11-20', '50% advance, 50% before shipment', 'pending'),
(2, 3, 100, 3500.00, 350000.00, 1, 2, '2025-12-05', '30% advance, 70% before shipment', 'pending');

-- Insert sample DPOs
INSERT INTO dpos (dpq_id, seller_id, buyer_id, product_id, quantity, unit_price, total_price, currency_id, delivery_port_id, delivery_date, payment_terms, status) VALUES
(1, 1, 2, 1, 50, 5000.00, 250000.00, 1, 1, '2025-11-20', '50% advance, 50% before shipment', 'pending'),
(2, 2, 2, 3, 100, 3500.00, 350000.00, 1, 2, '2025-12-05', '30% advance, 70% before shipment', 'pending');

-- Insert sample orders
INSERT INTO orders (dpo_id, buyer_id, seller_id, order_number, total_amount, currency_id, status, payment_status, shipping_address, billing_address) VALUES
(1, 2, 1, 'ORD-001', 250000.00, 1, 'pending', 'pending', '123 Buyer Street, Mumbai, Maharashtra 400001, India', '123 Buyer Street, Mumbai, Maharashtra 400001, India'),
(2, 2, 2, 'ORD-002', 350000.00, 1, 'pending', 'pending', '123 Buyer Street, Mumbai, Maharashtra 400001, India', '123 Buyer Street, Mumbai, Maharashtra 400001, India');

-- Insert sample invoices
INSERT INTO invoices (order_id, invoice_number, issue_date, due_date, amount, currency_id, status) VALUES
(1, 'INV-001', '2025-10-03', '2025-10-18', 250000.00, 1, 'pending'),
(2, 'INV-002', '2025-10-03', '2025-10-18', 350000.00, 1, 'pending');

-- Insert sample payments
INSERT INTO payments (invoice_id, order_id, amount, currency_id, payment_method, status) VALUES
(1, 1, 125000.00, 1, 'Bank Transfer', 'pending'),
(2, 2, 105000.00, 1, 'Credit Card', 'pending');

-- Insert sample disputes
INSERT INTO disputes (order_id, raised_by, against_user_id, subject, description, status, priority) VALUES
(1, 2, 1, 'Delivery Delay', 'The delivery of electronic components is delayed by 5 days. Need immediate resolution.', 'open', 'high');

-- Insert sample messages
INSERT INTO messages (sender_id, receiver_id, subject, content, is_read) VALUES
(2, 1, 'Regarding Order ORD-001', 'Hello, I wanted to check on the status of my order. When can I expect delivery?', FALSE),
(1, 2, 'Re: Regarding Order ORD-001', 'Hi Sarah, your order is being processed and will be shipped by next week.', FALSE);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'New Order Received', 'You have received a new order (ORD-001) from Sarah Buyer.', 'order', FALSE),
(2, 'Order Status Update', 'Your order (ORD-001) has been confirmed by the seller.', 'order', FALSE);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_rfqs_buyer_id ON rfqs(buyer_id);
CREATE INDEX idx_rfqs_category_id ON rfqs(category_id);
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_dpqs_buyer_id ON dpqs(buyer_id);
CREATE INDEX idx_dpqs_product_id ON dpqs(product_id);
CREATE INDEX idx_dpqs_status ON dpqs(status);
CREATE INDEX idx_dpos_seller_id ON dpos(seller_id);
CREATE INDEX idx_dpos_buyer_id ON dpos(buyer_id);
CREATE INDEX idx_dpos_status ON dpos(status);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- Display success message
SELECT 'Database schema and sample data created successfully!' AS message;