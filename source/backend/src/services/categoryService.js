const categoryRepo = require('../repositories/categoryRepository');
const cache = require('../config/cache');

class CategoryService {
  async getAllCategories(filters) {
    const cacheKey = !filters ? 'categories:all' : null;
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }

    const categories = await categoryRepo.findAll(filters);
    if (cacheKey) cache.set(cacheKey, categories, 120);
    return categories;
  }

  async getCategoryById(id) {
    const category = await categoryRepo.findById(id);
    if (!category) throw new Error('Không tìm thấy danh mục');
    return category;
  }

  async createCategory(data) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await categoryRepo.findBySlug(slug);
    if (existing) throw new Error('Đường dẫn SEO (Slug) danh mục đã tồn tại');

    const created = await categoryRepo.create({
      name: data.name,
      slug: slug || `cat-${Date.now()}`,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      parentId: data.parentId ? Number(data.parentId) : null
    });

    cache.del('categories:all');
    return created;
  }

  async updateCategory(id, data) {
    const category = await categoryRepo.findById(id);
    if (!category) throw new Error('Không tìm thấy danh mục để cập nhật');

    if (data.slug && data.slug !== category.slug) {
      const existing = await categoryRepo.findBySlug(data.slug);
      if (existing) throw new Error('Đường dẫn SEO (Slug) đã được sử dụng');
    }

    const updated = await categoryRepo.update(id, {
      name: data.name !== undefined ? data.name : category.name,
      slug: data.slug !== undefined ? data.slug : category.slug,
      seoTitle: data.seoTitle !== undefined ? data.seoTitle : category.seoTitle,
      seoDescription: data.seoDescription !== undefined ? data.seoDescription : category.seoDescription
    });

    cache.del('categories:all');
    return updated;
  }

  async deleteCategory(id) {
    const productCount = await categoryRepo.countProductsInCategory(id);
    if (productCount > 0) {
      throw new Error(`Không thể xóa danh mục này vì còn ${productCount} sản phẩm trực thuộc`);
    }
    await categoryRepo.delete(id);
    cache.del('categories:all');
    return { success: true, message: 'Đã xóa danh mục thành công' };
  }
}

module.exports = new CategoryService();
