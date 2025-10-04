-- SAMPLE DATA FOR MARSa FYI APPLICATION
-- This file contains sample data that can be inserted after the schema is created
-- Run this file in the Supabase SQL editor after successfully uploading the schema

-- Enable pgcrypto extension for password hashing (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Sample users (for testing only - in production, users would register)
-- Note: Passwords are hashed using crypt with gen_salt
-- One user for each role
INSERT INTO users (username, email, phone, first_name, last_name, password_hash, vendor_code) VALUES
('john_admin', 'john.admin@example.com', '+1234567890', 'John', 'Admin', crypt('Password123!', gen_salt('bf')), 'ADM-23-ABC123'),
('jane_hr', 'jane.hr@example.com', '+1234567891', 'Jane', 'HR', crypt('Password123!', gen_salt('bf')), 'HR-23-DEF456'),
('mike_accountant', 'mike.accountant@example.com', '+1234567892', 'Mike', 'Accountant', crypt('Password123!', gen_salt('bf')), 'ACC-23-GHI789'),
('sarah_captain', 'sarah.captain@example.com', '+1234567893', 'Sarah', 'Captain', crypt('Password123!', gen_salt('bf')), 'CAPT-23-JKL012'),
('tom_seller', 'tom.seller@example.com', '+1234567894', 'Tom', 'Seller', crypt('Password123!', gen_salt('bf')), 'SELL-23-MNO345'),
('lisa_buyer', 'lisa.buyer@example.com', '+1234567895', 'Lisa', 'Buyer', crypt('Password123!', gen_salt('bf')), 'BUY-23-PQR678'),
('anna_surveyor', 'anna.surveyor@example.com', '+1234567896', 'Anna', 'Surveyor', crypt('Password123!', gen_salt('bf')), 'SUR-23-STU901'),
('peter_arbitrator', 'peter.arbitrator@example.com', '+1234567897', 'Peter', 'Arbitrator', crypt('Password123!', gen_salt('bf')), 'ARB-23-VWX234'),
('emma_insurance', 'emma.insurance@example.com', '+1234567898', 'Emma', 'Insurance', crypt('Password123!', gen_salt('bf')), 'INS-23-YZ567'),
('david_transporter', 'david.transporter@example.com', '+1234567899', 'David', 'Transporter', crypt('Password123!', gen_salt('bf')), 'TRN-23-ABC890'),
('mike_logistics', 'mike.logistics@example.com', '+1234567800', 'Mike', 'Logistics', crypt('Password123!', gen_salt('bf')), 'LOG-23-DEF123'),
('clara_cha', 'clara.cha@example.com', '+1234567801', 'Clara', 'CHA', crypt('Password123!', gen_salt('bf')), 'CHA-23-GHI456');

-- Assign roles to users (each user gets their primary role)
INSERT INTO user_roles (user_id, role_id, is_primary) VALUES
((SELECT id FROM users WHERE username = 'john_admin'), (SELECT id FROM roles WHERE code = 'ADM'), TRUE),
((SELECT id FROM users WHERE username = 'jane_hr'), (SELECT id FROM roles WHERE code = 'HR'), TRUE),
((SELECT id FROM users WHERE username = 'mike_accountant'), (SELECT id FROM roles WHERE code = 'ACC'), TRUE),
((SELECT id FROM users WHERE username = 'sarah_captain'), (SELECT id FROM roles WHERE code = 'CAPT'), TRUE),
((SELECT id FROM users WHERE username = 'tom_seller'), (SELECT id FROM roles WHERE code = 'SELL'), TRUE),
((SELECT id FROM users WHERE username = 'lisa_buyer'), (SELECT id FROM roles WHERE code = 'BUY'), TRUE),
((SELECT id FROM users WHERE username = 'anna_surveyor'), (SELECT id FROM roles WHERE code = 'SUR'), TRUE),
((SELECT id FROM users WHERE username = 'peter_arbitrator'), (SELECT id FROM roles WHERE code = 'ARB'), TRUE),
((SELECT id FROM users WHERE username = 'emma_insurance'), (SELECT id FROM roles WHERE code = 'INS'), TRUE),
((SELECT id FROM users WHERE username = 'david_transporter'), (SELECT id FROM roles WHERE code = 'TRN'), TRUE),
((SELECT id FROM users WHERE username = 'mike_logistics'), (SELECT id FROM roles WHERE code = 'LOG'), TRUE),
((SELECT id FROM users WHERE username = 'clara_cha'), (SELECT id FROM roles WHERE code = 'CHA'), TRUE);

-- Sample products (6 sample products)
INSERT INTO products (seller_id, name, description, category_id, price, currency_id, is_active, is_verified) VALUES
((SELECT id FROM users WHERE username = 'tom_seller'), 'Premium Electronics Components', 'High-quality electronic components for industrial use', 1, 5000.00, 1, TRUE, TRUE),
((SELECT id FROM users WHERE username = 'tom_seller'), 'Advanced Circuit Boards', 'Multi-layer PCBs with advanced features', 1, 12000.00, 1, TRUE, TRUE),
((SELECT id FROM users WHERE username = 'tom_seller'), 'Industrial Microchips', 'High-performance microchips for industrial applications', 1, 8000.00, 1, TRUE, TRUE),
((SELECT id FROM users WHERE username = 'tom_seller'), 'Precision Manufacturing Equipment', 'High-precision machinery for manufacturing', 2, 75000.00, 1, TRUE, TRUE),
((SELECT id FROM users WHERE username = 'tom_seller'), 'Premium Cotton Textiles', 'High-quality cotton fabrics for apparel', 3, 1200.00, 1, TRUE, TRUE),
((SELECT id FROM users WHERE username = 'tom_seller'), 'Industrial Chemical Solvents', 'High-grade solvents for industrial processes', 4, 3500.00, 1, TRUE, TRUE);

-- Sample RFQ (Request for Quotation)
INSERT INTO rfqs (buyer_id, product_id, title, description, quantity, budget_range_min, budget_range_max, currency_id, response_deadline, status) VALUES
((SELECT id FROM users WHERE username = 'lisa_buyer'), 1, 'RFQ for Electronics Components', 'Looking for premium electronic components for industrial use', 100, 4000.00, 6000.00, 1, NOW() + INTERVAL '30 days', 'open');

-- Sample DPQ (Detailed Product Quotation)
INSERT INTO dpqs (rfq_id, seller_id, product_id, quantity, unit_price, total_price, currency_id, specifications, delivery_port_id, delivery_date, payment_terms, status) VALUES
(1, (SELECT id FROM users WHERE username = 'tom_seller'), 1, 100, 4800.00, 480000.00, 1, 'Industrial grade components with 2-year warranty', 1, CURRENT_DATE + INTERVAL '15 days', 'Net 30', 'pending');

-- Sample DPO (Detailed Product Order)
INSERT INTO dpos (dpq_id, seller_id, buyer_id, product_id, quantity, unit_price, total_price, currency_id, specifications, delivery_port_id, delivery_date, payment_terms, status) VALUES
(1, (SELECT id FROM users WHERE username = 'tom_seller'), (SELECT id FROM users WHERE username = 'lisa_buyer'), 1, 100, 4800.00, 480000.00, 1, 'Industrial grade components with 2-year warranty', 1, CURRENT_DATE + INTERVAL '15 days', 'Net 30', 'pending');

-- Sample Order
INSERT INTO orders (dpo_id, buyer_id, seller_id, order_number, total_amount, currency_id, status, payment_status) VALUES
(1, (SELECT id FROM users WHERE username = 'lisa_buyer'), (SELECT id FROM users WHERE username = 'tom_seller'), 'ORD-001', 480000.00, 1, 'pending', 'pending');

-- Sample Invoice
INSERT INTO invoices (order_id, invoice_number, issue_date, due_date, amount, currency_id, status) VALUES
(1, 'INV-001', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 480000.00, 1, 'pending');

-- Sample Payment
INSERT INTO payments (invoice_id, order_id, amount, currency_id, payment_method, status) VALUES
(1, 1, 480000.00, 1, 'bank_transfer', 'pending');

-- Sample Transport Order
INSERT INTO transport_orders (order_id, transporter_id, origin_port_id, destination_port_id, estimated_departure, estimated_arrival, status) VALUES
(1, (SELECT id FROM users WHERE username = 'david_transporter'), 3, 1, CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '30 days', 'pending');

-- Sample Logistics Order
INSERT INTO logistics_orders (order_id, logistics_provider_id, services_requested, status) VALUES
(1, (SELECT id FROM users WHERE username = 'mike_logistics'), 'Full container load shipping with customs clearance', 'pending');

-- Sample Tracking Info
INSERT INTO tracking_info (transport_order_id, logistics_order_id, tracking_id, location, status) VALUES
(1, 1, 'TRK-001', 'Port of Shanghai', 'in_transit');

-- Sample Survey Request
INSERT INTO survey_requests (product_id, buyer_id, seller_id, surveyor_id, fee_amount, currency_id, status) VALUES
(1, (SELECT id FROM users WHERE username = 'lisa_buyer'), (SELECT id FROM users WHERE username = 'tom_seller'), (SELECT id FROM users WHERE username = 'anna_surveyor'), 5000.00, 1, 'assigned');

-- Sample Survey Report
INSERT INTO survey_reports (survey_request_id, surveyor_id, report, status) VALUES
(1, (SELECT id FROM users WHERE username = 'anna_surveyor'), 'Product quality inspection passed all standards. Ready for shipment.', 'submitted');

-- Sample Insurance Request
INSERT INTO insurance_requests (product_id, buyer_id, seller_id, insurance_agent_id, coverage_amount, premium_amount, currency_id, status) VALUES
(1, (SELECT id FROM users WHERE username = 'lisa_buyer'), (SELECT id FROM users WHERE username = 'tom_seller'), (SELECT id FROM users WHERE username = 'emma_insurance'), 500000.00, 12500.00, 1, 'approved');

-- Sample Insurance Policy
INSERT INTO insurance_policies (insurance_request_id, policy_number, coverage_details, terms_and_conditions, start_date, end_date, status) VALUES
(1, 'POL-INS-001', 'Full coverage for electronic components during transit', 'Standard terms and conditions apply', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'active');

-- Sample CHA Service Request
INSERT INTO cha_service_requests (product_id, buyer_id, seller_id, cha_id, service_type, fee_amount, currency_id, status) VALUES
(1, (SELECT id FROM users WHERE username = 'lisa_buyer'), (SELECT id FROM users WHERE username = 'tom_seller'), (SELECT id FROM users WHERE username = 'clara_cha'), 'customs_clearance', 3000.00, 1, 'completed');

-- Sample Notification
INSERT INTO notifications (user_id, title, message, is_read, related_entity_type, related_entity_id) VALUES
((SELECT id FROM users WHERE username = 'tom_seller'), 'New Order Received', 'You have received a new order for Premium Electronics Components', FALSE, 'order', 1);