const prisma = require('../config/prisma');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function validatePromotion(payload) {
  if (isBlank(payload.productId)) return 'Vui lòng chọn sản phẩm áp dụng.';
  if (isBlank(payload.name)) return 'Tên chương trình khuyến mại không được để trống.';
  if (!['percent', 'amount'].includes(payload.discountType)) return 'Hình thức giảm giá không hợp lệ.';
  const value = numberValue(payload.discountValue);
  if (value <= 0) return 'Giá trị giảm giá phải lớn hơn 0.';
  if (payload.discountType === 'percent' && value > 100) return 'Tỷ lệ giảm giá theo phần trăm không được vượt quá 100%.';
  if (isBlank(payload.startsAt) || isBlank(payload.endsAt)) return 'Ngày bắt đầu và ngày kết thúc chương trình khuyến mại là bắt buộc.';
  if (new Date(payload.endsAt) < new Date(payload.startsAt)) return 'Ngày kết thúc phải sau ngày bắt đầu chương trình.';
  return null;
}

async function listPromotions(req, res) {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { id: 'desc' }
    });

    const mapped = promotions.map(p => ({
      id: p.id,
      productId: p.productId,
      name: p.name,
      discountType: p.discountType,
      discountValue: Number(p.discountValue),
      startsAt: p.startDate.toISOString().slice(0, 10),
      endsAt: p.endDate.toISOString().slice(0, 10),
      status: 'active'
    }));

    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi lấy danh sách khuyến mại:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function createPromotion(req, res) {
  const payload = req.body;
  const error = validatePromotion(payload);
  if (error) return res.status(400).json({ message: error });

  try {
    const newPromo = await prisma.promotion.create({
      data: {
        productId: numberValue(payload.productId),
        name: payload.name,
        discountType: payload.discountType,
        discountValue: numberValue(payload.discountValue),
        startDate: new Date(payload.startsAt),
        endDate: new Date(payload.endsAt)
      }
    });
    return res.status(201).json({ id: newPromo.id });
  } catch (error) {
    console.error('Lỗi tạo khuyến mại:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function updatePromotion(req, res) {
  const { id } = req.params;
  const payload = req.body;
  const error = validatePromotion(payload);
  if (error) return res.status(400).json({ message: error });

  try {
    await prisma.promotion.update({
      where: { id: Number(id) },
      data: {
        productId: numberValue(payload.productId),
        name: payload.name,
        discountType: payload.discountType,
        discountValue: numberValue(payload.discountValue),
        startDate: new Date(payload.startsAt),
        endDate: new Date(payload.endsAt)
      }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi cập nhật khuyến mại:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function deletePromotion(req, res) {
  const { id } = req.params;

  try {
    await prisma.promotion.delete({
      where: { id: Number(id) }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi xóa khuyến mại:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

module.exports = {
  listPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
};
