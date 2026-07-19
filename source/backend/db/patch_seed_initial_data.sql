USE HomeMartDb;
GO

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
BEGIN
  INSERT INTO users (username, password_hash, full_name, role, status)
  VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', N'Quan tri vien', 'admin', 'active');
END;
GO

DECLARE @storeId INT;
DECLARE @logisticsId INT;
DECLARE @kitchenCategoryId INT;
DECLARE @cleanCategoryId INT;
DECLARE @airFryerId INT;
DECLARE @vacuumId INT;

SELECT @storeId = id FROM stores WHERE slug = 'gia-dung-an-phat';
IF @storeId IS NULL
BEGIN
  INSERT INTO stores (name, slug, phone, email, address, status)
  VALUES (N'Gia Dung An Phat', 'gia-dung-an-phat', '0901234567', 'anphat@example.com', N'12 Le Loi, Quan 1, TP.HCM', 'active');
  SET @storeId = SCOPE_IDENTITY();
END;

SELECT @logisticsId = id FROM logistics_companies WHERE slug = 'nhanh-viet-express';
IF @logisticsId IS NULL
BEGIN
  INSERT INTO logistics_companies (name, slug, phone, base_fee, rating, status)
  VALUES (N'Nhanh Viet Express', 'nhanh-viet-express', '19001001', 25000, 4.8, 'active');
  SET @logisticsId = SCOPE_IDENTITY();
END;

IF NOT EXISTS (
  SELECT 1 FROM store_logistics_partners
  WHERE store_id = @storeId AND logistics_company_id = @logisticsId
)
BEGIN
  INSERT INTO store_logistics_partners (store_id, logistics_company_id, base_fee, fee_per_km, service_area, rating, status)
  VALUES (@storeId, @logisticsId, 25000, 3500, N'TP.HCM va cac tinh lan can', 4.8, 'active');
END;

SELECT @kitchenCategoryId = id FROM categories WHERE slug = 'nha-bep';
IF @kitchenCategoryId IS NULL
BEGIN
  INSERT INTO categories (parent_id, name, slug, seo_title, seo_description, sort_order, status)
  VALUES (NULL, N'Nha bep', 'nha-bep', N'Do gia dung nha bep gia tot', N'Noi, chao, may xay va dung cu nha bep chinh hang.', 1, 'active');
  SET @kitchenCategoryId = SCOPE_IDENTITY();
END;

SELECT @cleanCategoryId = id FROM categories WHERE slug = 've-sinh-nha-cua';
IF @cleanCategoryId IS NULL
BEGIN
  INSERT INTO categories (parent_id, name, slug, seo_title, seo_description, sort_order, status)
  VALUES (NULL, N'Ve sinh nha cua', 've-sinh-nha-cua', N'Do ve sinh nha cua tien ich', N'Dung cu ve sinh nha cua chat luong, de su dung.', 2, 'active');
  SET @cleanCategoryId = SCOPE_IDENTITY();
END;

SELECT @airFryerId = id FROM products WHERE sku = 'NCKD-5L';
IF @airFryerId IS NULL
BEGIN
  INSERT INTO products (
    store_id, category_id, name, slug, sku, short_description, description, brand,
    image_url, stock_quantity, status, seo_title, seo_description
  )
  VALUES (
    @storeId, @kitchenCategoryId, N'Noi chien khong dau 5L', 'noi-chien-khong-dau-5l', 'NCKD-5L',
    N'Dung tich 5L, dieu khien co, phu hop gia dinh 3-5 nguoi.',
    N'Noi chien khong dau giup nau an nhanh, giam dau mo va de ve sinh.',
    N'KitchenPro',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=80',
    34, 'active', N'Noi chien khong dau 5L KitchenPro', N'Mua noi chien khong dau 5L chinh hang, giao nhanh.'
  );
  SET @airFryerId = SCOPE_IDENTITY();
END;

SELECT @vacuumId = id FROM products WHERE sku = 'MHB-CT';
IF @vacuumId IS NULL
BEGIN
  INSERT INTO products (
    store_id, category_id, name, slug, sku, short_description, description, brand,
    image_url, stock_quantity, status, seo_title, seo_description
  )
  VALUES (
    @storeId, @cleanCategoryId, N'May hut bui cam tay', 'may-hut-bui-cam-tay', 'MHB-CT',
    N'Nho gon, pin sac, hut bui khe hep va sofa.',
    N'May hut bui cam tay cong suat on dinh, phu hop can ho va oto.',
    N'CleanMate',
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=80',
    21, 'active', N'May hut bui cam tay CleanMate', N'May hut bui cam tay pin sac, gia tot, giao nhanh.'
  );
  SET @vacuumId = SCOPE_IDENTITY();
END;

IF NOT EXISTS (SELECT 1 FROM product_prices WHERE product_id = @airFryerId)
BEGIN
  INSERT INTO product_prices (product_id, price, starts_at, ends_at, note)
  VALUES (@airFryerId, 1290000, '2026-01-01', NULL, N'Gia niem yet');
END;

IF NOT EXISTS (SELECT 1 FROM product_prices WHERE product_id = @vacuumId)
BEGIN
  INSERT INTO product_prices (product_id, price, starts_at, ends_at, note)
  VALUES (@vacuumId, 690000, '2026-01-01', NULL, N'Gia niem yet');
END;

IF NOT EXISTS (SELECT 1 FROM promotions WHERE product_id = @airFryerId AND name = N'Giam gia cuoi tuan')
BEGIN
  INSERT INTO promotions (product_id, name, discount_type, discount_value, starts_at, ends_at, status)
  VALUES (@airFryerId, N'Giam gia cuoi tuan', 'percent', 10, '2026-06-01', '2026-12-31', 'active');
END;
GO
