-- Schema for SecureShop
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(200),
  email NVARCHAR(255) UNIQUE NOT NULL,
  password NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) NOT NULL DEFAULT 'Customer',
  created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE products (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE audit_logs (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NULL,
  action NVARCHAR(500),
  created_at DATETIME DEFAULT GETDATE()
);
