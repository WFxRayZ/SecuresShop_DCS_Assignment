-- Seed sample data
INSERT INTO products (name, description, price, stock) VALUES
('Example Product', 'This is a sample product for SecureShop.', 9.99, 100);

-- insert an admin account (replace password after hashing in production)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@example.com', 'changeme', 'Admin');
