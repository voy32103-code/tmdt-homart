const prisma = require('../config/prisma');

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' }
    });
    return res.json(categories);
  } catch (error) {
    console.error('Lỗi lấy danh sách danh mục:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function createCategory(req, res) {
  const { name, parentId, slug, seoTitle, seoDescription } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Tên danh mục là bắt buộc và không được để trống.' });
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        parentId: parentId ? Number(parentId) : null,
        slug: slug || slugify(name),
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || ''
      }
    });
    return res.status(201).json({ id: newCategory.id });
  } catch (error) {
    console.error('Lỗi tạo danh mục:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, parentId, slug, seoTitle, seoDescription } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Tên danh mục là bắt buộc và không được để trống.' });
  }

  try {
    await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        parentId: parentId ? Number(parentId) : null,
        slug: slug || slugify(name),
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || ''
      }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi cập nhật danh mục:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params;

  try {
    const productsCount = await prisma.product.count({
      where: { categoryId: Number(id) }
    });

    if (productsCount > 0) {
      return res.status(409).json({ message: 'Không thể xóa danh mục này vì đang có sản phẩm thuộc danh mục.' });
    }

    await prisma.category.delete({
      where: { id: Number(id) }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi xóa danh mục:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
