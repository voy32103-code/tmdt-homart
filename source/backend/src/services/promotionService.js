const productRepo = require('../repositories/productRepository');

class PromotionService {
  async getAllPromotions() {
    return productRepo.findAllPromotions();
  }

  async createPromotion(data) {
    if (new Date(data.endsAt) < new Date(data.startsAt)) {
      throw new Error('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu');
    }

    return productRepo.createPromotion({
      productId: Number(data.productId),
      name: data.name,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      status: data.status || 'active'
    });
  }

  async updatePromotion(id, data) {
    if (data.startsAt && data.endsAt && new Date(data.endsAt) < new Date(data.startsAt)) {
      throw new Error('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu');
    }

    return productRepo.updatePromotion(id, {
      productId: data.productId ? Number(data.productId) : undefined,
      name: data.name,
      discountType: data.discountType,
      discountValue: data.discountValue ? Number(data.discountValue) : undefined,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      status: data.status
    });
  }

  async deletePromotion(id) {
    await productRepo.deletePromotion(id);
    return { success: true, message: 'Đã xóa khuyến mại' };
  }
}

module.exports = new PromotionService();
