const productRepo = require('../repositories/productRepository');

class PromotionService {
  async getAllPromotions() {
    const promos = await productRepo.findAllPromotions();
    return promos.map(p => ({
      ...p,
      startsAt: p.startDate,
      endsAt: p.endDate,
      status: 'active'
    }));
  }

  async createPromotion(data) {
    const start = new Date(data.startDate || data.startsAt);
    const end = new Date(data.endDate || data.endsAt);

    if (end < start) {
      throw new Error('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu');
    }

    const created = await productRepo.createPromotion({
      productId: Number(data.productId),
      name: data.name,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      startDate: start,
      endDate: end
    });

    return {
      ...created,
      startsAt: created.startDate,
      endsAt: created.endDate,
      status: 'active'
    };
  }

  async updatePromotion(id, data) {
    const start = data.startDate || data.startsAt ? new Date(data.startDate || data.startsAt) : undefined;
    const end = data.endDate || data.endsAt ? new Date(data.endDate || data.endsAt) : undefined;

    if (start && end && end < start) {
      throw new Error('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu');
    }

    const updateData = {};
    if (data.productId) updateData.productId = Number(data.productId);
    if (data.name) updateData.name = data.name;
    if (data.discountType) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = Number(data.discountValue);
    if (start) updateData.startDate = start;
    if (end) updateData.endDate = end;

    const updated = await productRepo.updatePromotion(id, updateData);
    return {
      ...updated,
      startsAt: updated.startDate,
      endsAt: updated.endDate,
      status: 'active'
    };
  }

  async deletePromotion(id) {
    await productRepo.deletePromotion(id);
    return { success: true, message: 'Đã xóa khuyến mại' };
  }
}

module.exports = new PromotionService();
