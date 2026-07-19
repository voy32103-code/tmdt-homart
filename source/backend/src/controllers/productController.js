const prisma = require('../config/prisma');

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function mapProduct(p) {
  const now = new Date();
  const prices = p.prices || [];
  const activePrices = prices.filter(pr => new Date(pr.effectiveFrom) <= now);
  const currentPriceObj = activePrices.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))[0];
  const price = currentPriceObj ? Number(currentPriceObj.price) : Number(p.price || 0);

  const promotions = p.promotions || [];
  const activePromo = promotions.find(pr => {
    return new Date(pr.startDate) <= now && new Date(pr.endDate) >= now;
  });

  let finalPrice = price;
  if (activePromo) {
    const val = Number(activePromo.discountValue);
    if (activePromo.discountType === 'percent') {
      finalPrice = price - (price * val / 100);
    } else {
      finalPrice = price - val;
    }
    if (finalPrice < 0) finalPrice = 0;
  }

  const comments = p.comments || [];
  const commentCount = comments.length;
  const totalRating = comments.reduce((sum, c) => sum + c.rating, 0);
  const avgRating = commentCount > 0 ? Number((totalRating / commentCount).toFixed(1)) : 0;

  return {
    id: p.id,
    storeId: p.storeId,
    categoryId: p.categoryId,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    shortDescription: p.shortDescription,
    brand: p.brand,
    imageUrl: p.imageUrl,
    stockQuantity: p.stockQuantity,
    status: p.status,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    createdAt: p.createdAt,
    categoryName: p.category?.name || '',
    storeName: p.store?.name || '',
    price,
    finalPrice,
    commentCount,
    avgRating,
    promotion: activePromo ? {
      id: activePromo.id,
      productId: p.id,
      name: activePromo.name,
      discountType: activePromo.discountType,
      discountValue: Number(activePromo.discountValue),
      startsAt: activePromo.startDate.toISOString().slice(0, 10),
      endsAt: activePromo.endDate.toISOString().slice(0, 10),
      status: 'active'
    } : null
  };
}

async function listProducts(req, res) {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      include: {
        category: true,
        store: true,
        prices: true,
        promotions: true,
        comments: true
      },
      orderBy: { id: 'desc' }
    });
    const mapped = products.map(mapProduct);
    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function getProduct(req, res) {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        store: true,
        prices: true,
        promotions: true,
        comments: true
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    }

    return res.json(mapProduct(product));
  } catch (error) {
    console.error('Lỗi lấy sản phẩm:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function createProduct(req, res) {
  const payload = req.body;

  // Validation
  const required = ['name', 'categoryId', 'sku', 'stockQuantity'];
  const missing = required.filter((field) => isBlank(payload[field]));
  if (missing.length) {
    return res.status(400).json({ message: `Thiếu các trường thông tin bắt buộc: ${missing.join(', ')}.` });
  }
  if (!Number.isInteger(numberValue(payload.categoryId)) || numberValue(payload.categoryId) <= 0) {
    return res.status(400).json({ message: 'Danh mục sản phẩm không hợp lệ.' });
  }
  if (numberValue(payload.stockQuantity) < 0) {
    return res.status(400).json({ message: 'Số lượng sản phẩm tồn kho không được phép là số âm.' });
  }
  if (isBlank(payload.price) || numberValue(payload.price) < 0) {
    return res.status(400).json({ message: 'Giá bán sản phẩm không được phép là số âm.' });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        storeId: numberValue(payload.storeId || 1),
        categoryId: numberValue(payload.categoryId),
        name: payload.name,
        slug: payload.slug || slugify(payload.name),
        sku: payload.sku,
        shortDescription: payload.shortDescription || '',
        brand: payload.brand || '',
        imageUrl: payload.imageUrl || '',
        stockQuantity: numberValue(payload.stockQuantity || 0),
        status: payload.status || 'active',
        price: numberValue(payload.price),
        seoTitle: payload.seoTitle || payload.name,
        seoDescription: payload.seoDescription || payload.shortDescription || ''
      }
    });

    // Create initial price record
    await prisma.productPrice.create({
      data: {
        productId: newProduct.id,
        price: numberValue(payload.price),
        effectiveFrom: new Date()
      }
    });

    // Return mapped product
    const fullProduct = await prisma.product.findUnique({
      where: { id: newProduct.id },
      include: {
        category: true,
        store: true,
        prices: true,
        promotions: true,
        comments: true
      }
    });

    return res.status(201).json(mapProduct(fullProduct));
  } catch (error) {
    console.error('Lỗi tạo sản phẩm:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const payload = req.body;

  // Validation
  const required = ['name', 'categoryId', 'sku', 'stockQuantity'];
  const missing = required.filter((field) => isBlank(payload[field]));
  if (missing.length) {
    return res.status(400).json({ message: `Thiếu các trường thông tin bắt buộc: ${missing.join(', ')}.` });
  }
  if (!Number.isInteger(numberValue(payload.categoryId)) || numberValue(payload.categoryId) <= 0) {
    return res.status(400).json({ message: 'Danh mục sản phẩm không hợp lệ.' });
  }
  if (numberValue(payload.stockQuantity) < 0) {
    return res.status(400).json({ message: 'Số lượng sản phẩm tồn kho không được phép là số âm.' });
  }

  try {
    const current = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { prices: true }
    });

    if (!current) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm yêu cầu.' });
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        storeId: numberValue(payload.storeId || 1),
        categoryId: numberValue(payload.categoryId),
        name: payload.name,
        slug: payload.slug || slugify(payload.name),
        sku: payload.sku,
        shortDescription: payload.shortDescription || '',
        brand: payload.brand || '',
        imageUrl: payload.imageUrl || '',
        stockQuantity: numberValue(payload.stockQuantity || 0),
        status: payload.status || 'active',
        seoTitle: payload.seoTitle || payload.name,
        seoDescription: payload.seoDescription || payload.shortDescription || ''
      }
    });

    // Check price change
    if (!isBlank(payload.price) && Number(payload.price) !== Number(current.price)) {
      // Update base price
      await prisma.product.update({
        where: { id: Number(id) },
        data: { price: numberValue(payload.price) }
      });
      // Insert into productPrices history
      await prisma.productPrice.create({
        data: {
          productId: Number(id),
          price: numberValue(payload.price),
          effectiveFrom: new Date()
        }
      });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        store: true,
        prices: true,
        promotions: true,
        comments: true
      }
    });

    return res.json(mapProduct(fullProduct));
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const orderedCount = await prisma.orderItem.count({
      where: { productId: Number(id) }
    });

    if (orderedCount > 0) {
      // Soft-delete
      await prisma.product.update({
        where: { id: Number(id) },
        data: { status: 'inactive' }
      });
      return res.json({ ok: true, mode: 'soft-delete' });
    }

    // Hard-delete
    await prisma.product.delete({
      where: { id: Number(id) }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

// Comments endpoints
async function getComments(req, res) {
  const { id } = req.params;
  try {
    // Requirements: "admin k xem được bình luận của user"
    // So if the logged-in user is an admin, they should NOT be allowed to view user comments here.
    // Wait, let's check: in getComments endpoint, does it check if req.user role is admin?
    // Let's check from req.headers or auth token if any
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const jwtToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
      if (jwtToken) {
        try {
          const JWT_SECRET = process.env.JWT_SECRET || 'homemart-super-secret-key';
          const decoded = jwt.verify(jwtToken, JWT_SECRET);
          if (decoded.role === 'admin') {
            return res.status(403).json({ message: 'Quản trị viên không được phép xem bình luận của người dùng.' });
          }
        } catch (e) {
          // ignore token error, treat as guest
        }
      }
    }

    const comments = await prisma.comment.findMany({
      where: { productId: Number(id) },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = comments.map(c => ({
      id: c.id,
      customerName: c.customerName,
      content: c.content,
      rating: c.rating,
      createdAt: c.createdAt
    }));

    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi lấy bình luận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function createComment(req, res) {
  const { id } = req.params;
  const { customerName, content, rating } = req.body;

  if (isBlank(customerName) || isBlank(content) || isBlank(rating)) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên, số sao đánh giá và nội dung bình luận.' });
  }

  const ratingVal = numberValue(rating);
  if (ratingVal < 1 || ratingVal > 5) {
    return res.status(400).json({ message: 'Đánh giá sao phải từ 1 đến 5.' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    }

    await prisma.comment.create({
      data: {
        productId: Number(id),
        customerName,
        content,
        rating: ratingVal
      }
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Lỗi thêm bình luận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getComments,
  createComment,
  mapProduct
};
