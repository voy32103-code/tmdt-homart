const commentRepo = require('../repositories/commentRepository');
const productRepo = require('../repositories/productRepository');

class CommentService {
  async getCommentsByProductId(productId) {
    return commentRepo.findByProductId(productId);
  }

  async getAllComments() {
    const comments = await commentRepo.findAll();
    return comments.map(c => ({
      id: c.id,
      productId: c.productId,
      productName: c.product ? c.product.name : '',
      customerName: c.customerName,
      customerPhone: c.customerPhone,
      rating: c.rating,
      content: c.content,
      createdAt: c.createdAt
    }));
  }

  async addComment(productId, { customerName, customerPhone, rating, content }) {
    const product = await productRepo.findById(productId);
    if (!product) throw new Error('Không tìm thấy sản phẩm để bình luận');

    return commentRepo.create({
      productId: Number(productId),
      customerName,
      customerPhone,
      rating: Number(rating),
      content
    });
  }

  async deleteComment(id) {
    const comment = await commentRepo.findById(id);
    if (!comment) throw new Error('Không tìm thấy bình luận để xóa');
    await commentRepo.delete(id);
    return { success: true, message: 'Đã xóa bình luận' };
  }
}

module.exports = new CommentService();
