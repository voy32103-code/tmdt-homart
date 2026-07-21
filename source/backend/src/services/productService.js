const productRepo = require('../repositories/productRepository');

class ProductService {
  mapProduct(item) {
    const prices = item.prices || [];
    const promotions = item.promotions || [];
    const comments = item.comments || [];

    const basePrice = prices.length > 0 ? Number(prices[0].price) : 0;
    const now = new Date();

    const activePromo = promotions.find(p =>
      p.status === 'active' &&
      new Date(p.startsAt) <= now &&
      new Date(p.endsAt) >= now
    );

    let finalPrice = basePrice;
    let discountText = '';

    if (activePromo) {
      if (activePromo.discountType === 'percent') {
        finalPrice = Math.max(0, basePrice * (1 - Number(activePromo.discountValue) / 100));
        discountText = `Giảm ${activePromo.discountValue}%`;
      } else {
        finalPrice = Math.max(0, basePrice - Number(activePromo.discountValue));
        discountText = `Giảm ${Number(activePromo.discountValue).toLocaleString('vi-VN')} đ`;
      }
    }

    const totalStars = comments.reduce((sum, c) => sum + (c.rating || 0), 0);
    const avgRating = comments.length > 0 ? Number((totalStars / comments.length).toFixed(1)) : 5.0;

    return {
      id: item.id,
      storeId: item.storeId,
      categoryId: item.categoryId,
      categoryName: item.category ? item.category.name : '',
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      brand: item.brand || '',
      price: basePrice,
      finalPrice: Math.round(finalPrice),
      discountText,
      hasDiscount: !!activePromo,
      stockQuantity: item.stockQuantity,
      status: item.status,
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
      shortDescription: item.shortDescription || '',
      description: item.description || '',
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      averageRating: avgRating,
      commentCount: comments.length,
      createdAt: item.createdAt
    };
  }

  async getAllProducts(filters) {
    const products = await productRepo.findAll(filters);
    return products.map(p => this.mapProduct(p));
  }

  async getProductById(id) {
    const product = await productRepo.findById(id);
    if (!product) throw new Error('Không tìm thấy sản phẩm');
    return this.mapProduct(product);
  }

  async createProduct(data) {
    const existingSku = await productRepo.findBySku(data.sku);
    if (existingSku) throw new Error('Mã SKU sản phẩm đã tồn tại');

    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProduct = await productRepo.create({
      storeId: 1,
      categoryId: Number(data.categoryId),
      name: data.name,
      slug: slug || `prod-${Date.now()}`,
      sku: data.sku,
      brand: data.brand || null,
      stockQuantity: Number(data.stockQuantity || 0),
      imageUrl: data.imageUrl || null,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null
    });

    if (data.price !== undefined) {
      await productRepo.createPriceHistory({
        productId: newProduct.id,
        price: Number(data.price),
        startsAt: new Date(),
        note: 'Khởi tạo giá khi tạo sản phẩm'
      });
    }

    return this.getProductById(newProduct.id);
  }

  async updateProduct(id, data) {
    const product = await productRepo.findById(id);
    if (!product) throw new Error('Không tìm thấy sản phẩm để cập nhật');

    if (data.sku && data.sku !== product.sku) {
      const existingSku = await productRepo.findBySku(data.sku);
      if (existingSku) throw new Error('Mã SKU đã tồn tại ở sản phẩm khác');
    }

    const updated = await productRepo.update(id, {
      name: data.name !== undefined ? data.name : product.name,
      sku: data.sku !== undefined ? data.sku : product.sku,
      categoryId: data.categoryId ? Number(data.categoryId) : product.categoryId,
      brand: data.brand !== undefined ? data.brand : product.brand,
      stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : product.stockQuantity,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : product.imageUrl,
      shortDescription: data.shortDescription !== undefined ? data.shortDescription : product.shortDescription,
      seoTitle: data.seoTitle !== undefined ? data.seoTitle : product.seoTitle,
      seoDescription: data.seoDescription !== undefined ? data.seoDescription : product.seoDescription
    });

    if (data.price !== undefined && Number(data.price) !== (product.prices[0] ? Number(product.prices[0].price) : 0)) {
      await productRepo.createPriceHistory({
        productId: id,
        price: Number(data.price),
        startsAt: new Date(),
        note: 'Cập nhật giá qua bảng quản trị'
      });
    }

    return this.getProductById(id);
  }

  async deleteProduct(id) {
    const product = await productRepo.findById(id);
    if (!product) throw new Error('Không tìm thấy sản phẩm để xóa');
    await productRepo.delete(id);
    return { success: true, message: 'Đã xóa sản phẩm thành công' };
  }

  async addPriceHistory({ productId, price, startsAt, note }) {
    await this.getProductById(productId);
    const newPrice = await productRepo.createPriceHistory({
      productId: Number(productId),
      price: Number(price),
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      note: note || null
    });
    return newPrice;
  }
}

module.exports = new ProductService();
