IF DB_ID('HomeMartDb') IS NULL
BEGIN
  CREATE DATABASE HomeMartDb;
END;
GO

USE HomeMartDb;
GO

CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(64) NOT NULL,
  full_name NVARCHAR(180) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'staff')),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

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

INSERT INTO users (username, password_hash, full_name, role, status)
VALUES ('admin', '$2b$10$ew.TAcJSTnnWsr7V5L6jBOlWwEwo6EA8UGjjT8tzDBn9m4kqO.yT.', N'Quan tri vien', 'admin', 'active');

INSERT INTO stores (name, slug, phone, email, address, status)
VALUES (N'Gia Dung An Phat', 'gia-dung-an-phat', '0901234567', 'anphat@example.com', N'12 Le Loi, Quan 1, TP.HCM', 'active');

INSERT INTO logistics_companies (name, slug, phone, base_fee, rating, status)
VALUES (N'Nhanh Viet Express', 'nhanh-viet-express', '19001001', 25000, 4.8, 'active');

INSERT INTO store_logistics_partners (store_id, logistics_company_id, base_fee, fee_per_km, service_area, rating, status)
VALUES (1, 1, 25000, 3500, N'TP.HCM va cac tinh lan can', 4.8, 'active');

INSERT INTO categories (parent_id, name, slug, seo_title, seo_description, sort_order, status)
VALUES
  (NULL, N'Nha bep', 'nha-bep', N'Do gia dung nha bep gia tot', N'Noi, chao, may xay va dung cu nha bep chinh hang.', 1, 'active'),
  (NULL, N'Ve sinh nha cua', 've-sinh-nha-cua', N'Do ve sinh nha cua tien ich', N'Dung cu ve sinh nha cua chat luong, de su dung.', 2, 'active');

INSERT INTO products (
  store_id, category_id, name, slug, sku, short_description, description, brand,
  image_url, stock_quantity, status, seo_title, seo_description
)
VALUES
  (1, 1, N'Noi chien khong dau 5L', 'noi-chien-khong-dau-5l', 'NCKD-5L',
   N'Dung tich 5L, dieu khien co, phu hop gia dinh 3-5 nguoi.',
   N'Noi chien khong dau giup nau an nhanh, giam dau mo va de ve sinh.',
   N'KitchenPro',
   'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=80',
   34, 'active', N'Noi chien khong dau 5L KitchenPro', N'Mua noi chien khong dau 5L chinh hang, giao nhanh.'),
  (1, 2, N'May hut bui cam tay', 'may-hut-bui-cam-tay', 'MHB-CT',
   N'Nho gon, pin sac, hut bui khe hep va sofa.',
   N'May hut bui cam tay cong suat on dinh, phu hop can ho va oto.',
   N'CleanMate',
   'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=80',
   21, 'active', N'May hut bui cam tay CleanMate', N'May hut bui cam tay pin sac, gia tot, giao nhanh.');

INSERT INTO product_prices (product_id, price, starts_at, ends_at, note)
VALUES
  (1, 1290000, '2026-01-01', NULL, N'Gia niem yet'),
  (2, 690000, '2026-01-01', NULL, N'Gia niem yet');

INSERT INTO promotions (product_id, name, discount_type, discount_value, starts_at, ends_at, status)
VALUES (1, N'Giam gia cuoi tuan', 'percent', 10, '2026-06-01', '2026-12-31', 'active');
