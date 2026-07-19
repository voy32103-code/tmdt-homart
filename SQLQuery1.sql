IF DB_ID('HomeMartDb') IS NULL
BEGIN
  CREATE DATABASE HomeMartDb;
END;
GO

USE HomeMartDb;
GO

CREATE TABLE stores (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  phone VARCHAR(30),
  email VARCHAR(180),
  address NVARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE logistics_companies (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  phone VARCHAR(30),
  base_fee DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (base_fee >= 0),
  rating DECIMAL(3, 2) NOT NULL DEFAULT 5 CHECK (rating >= 0 AND rating <= 5),
  status VARCHAR(30) NOT NULL DEFAULT 'active'
);

CREATE TABLE store_logistics_partners (
  id INT IDENTITY(1,1) PRIMARY KEY,
  store_id INT NOT NULL,
  logistics_company_id INT NOT NULL,
  base_fee DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (base_fee >= 0),
  fee_per_km DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (fee_per_km >= 0),
  service_area NVARCHAR(255),
  rating DECIMAL(3, 2) NOT NULL DEFAULT 5 CHECK (rating >= 0 AND rating <= 5),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT uq_store_logistics UNIQUE (store_id, logistics_company_id),
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (logistics_company_id) REFERENCES logistics_companies(id)
);

CREATE TABLE categories (
  id INT IDENTITY(1,1) PRIMARY KEY,
  parent_id INT,
  name NVARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  seo_title NVARCHAR(255),
  seo_description NVARCHAR(500),
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
  id INT IDENTITY(1,1) PRIMARY KEY,
  store_id INT NOT NULL,
  category_id INT NOT NULL,
  name NVARCHAR(220) NOT NULL,
  slug VARCHAR(260) NOT NULL UNIQUE,
  sku VARCHAR(80) NOT NULL UNIQUE,
  short_description NVARCHAR(500),
  description NVARCHAR(MAX),
  brand NVARCHAR(120),
  image_url VARCHAR(500),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  seo_title NVARCHAR(255),
  seo_description NVARCHAR(500),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE product_prices (
  id INT IDENTITY(1,1) PRIMARY KEY,
  product_id INT NOT NULL,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  starts_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  ends_at DATETIME2,
  note NVARCHAR(255),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (product_id) REFERENCES products(id),
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE TABLE promotions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  product_id INT NOT NULL,
  name NVARCHAR(180) NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  discount_value DECIMAL(12, 2) NOT NULL CHECK (discount_value > 0),
  starts_at DATETIME2 NOT NULL,
  ends_at DATETIME2 NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  FOREIGN KEY (product_id) REFERENCES products(id),
  CHECK (ends_at >= starts_at),
  CHECK (
    (discount_type = 'percent' AND discount_value <= 100)
    OR discount_type = 'amount'
  )
);

CREATE TABLE customers (
  id INT IDENTITY(1,1) PRIMARY KEY,
  full_name NVARCHAR(180) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(180),
  address NVARCHAR(255),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE orders (
  id INT IDENTITY(1,1) PRIMARY KEY,
  customer_id INT NOT NULL,
  store_id INT NOT NULL,
  logistics_company_id INT,
  order_code VARCHAR(40) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  grand_total DECIMAL(12, 2) NOT NULL CHECK (grand_total >= 0),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (logistics_company_id) REFERENCES logistics_companies(id)
);

CREATE TABLE order_items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  line_total DECIMAL(12, 2) NOT NULL CHECK (line_total >= 0),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_product_prices_active ON product_prices(product_id, starts_at, ends_at);
CREATE INDEX idx_promotions_active ON promotions(product_id, starts_at, ends_at, status);
CREATE INDEX idx_store_logistics ON store_logistics_partners(store_id, logistics_company_id, status);
