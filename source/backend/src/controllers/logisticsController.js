const prisma = require('../config/prisma');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validateLogistics(payload) {
  if (isBlank(payload.name)) return 'Tên công ty giao nhận không được để trống.';
  if (numberValue(payload.baseFee || 0) < 0) return 'Phí giao nhận cơ bản không được phép là số âm.';
  return null;
}

function validatePartner(payload) {
  if (!Number.isInteger(numberValue(payload.storeId || 1)) || numberValue(payload.storeId || 1) <= 0) return 'Cửa hàng không hợp lệ.';
  if (!Number.isInteger(numberValue(payload.logisticsCompanyId)) || numberValue(payload.logisticsCompanyId) <= 0) return 'Công ty giao nhận không hợp lệ.';
  if (numberValue(payload.baseFee || 0) < 0) return 'Phí giao nhận cơ bản không được phép là số âm.';
  return null;
}

async function listLogisticsCompanies(req, res) {
  try {
    const companies = await prisma.logisticsCompany.findMany({
      where: { status: 'active' },
      orderBy: { id: 'desc' }
    });
    const mapped = companies.map(c => ({
      id: c.id,
      name: c.name,
      slug: slugify(c.name),
      phone: '',
      baseFee: Number(c.baseFee),
      rating: 5,
      status: c.status
    }));
    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi lấy danh sách công ty giao nhận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function adminListLogisticsCompanies(req, res) {
  try {
    const companies = await prisma.logisticsCompany.findMany({
      orderBy: { id: 'desc' }
    });
    const mapped = companies.map(c => ({
      id: c.id,
      name: c.name,
      slug: slugify(c.name),
      phone: '',
      baseFee: Number(c.baseFee),
      rating: 5,
      status: c.status
    }));
    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi admin lấy danh sách công ty giao nhận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function createLogisticsCompany(req, res) {
  const payload = req.body;
  const error = validateLogistics(payload);
  if (error) return res.status(400).json({ message: error });

  try {
    const newCompany = await prisma.logisticsCompany.create({
      data: {
        name: payload.name,
        baseFee: numberValue(payload.baseFee || 0),
        area: payload.area || '',
        status: payload.status || 'active'
      }
    });
    return res.status(201).json({ id: newCompany.id });
  } catch (error) {
    console.error('Lỗi tạo công ty giao nhận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function updateLogisticsCompany(req, res) {
  const { id } = req.params;
  const payload = req.body;
  const error = validateLogistics(payload);
  if (error) return res.status(400).json({ message: error });

  try {
    await prisma.logisticsCompany.update({
      where: { id: Number(id) },
      data: {
        name: payload.name,
        baseFee: numberValue(payload.baseFee || 0),
        area: payload.area || '',
        status: payload.status || 'active'
      }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi cập nhật công ty giao nhận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function deleteLogisticsCompany(req, res) {
  const { id } = req.params;

  try {
    await prisma.logisticsCompany.update({
      where: { id: Number(id) },
      data: { status: 'inactive' }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi xóa công ty giao nhận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

// Store Logistics Partners
async function listPartners(req, res) {
  try {
    const partners = await prisma.storeLogisticsPartner.findMany({
      include: {
        store: true,
        logisticsCompany: true
      },
      orderBy: { id: 'desc' }
    });

    const mapped = partners.map(p => ({
      id: p.id,
      storeId: p.storeId,
      storeName: p.store?.name || '',
      logisticsCompanyId: p.logisticsCompanyId,
      logisticsName: p.logisticsCompany?.name || '',
      baseFee: Number(p.customFee || p.logisticsCompany?.baseFee || 0),
      feePerKm: 0,
      serviceArea: p.logisticsCompany?.area || '',
      rating: 5,
      status: p.status
    }));

    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi lấy danh sách đối tác giao nhận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function createPartner(req, res) {
  const payload = req.body;
  const error = validatePartner(payload);
  if (error) return res.status(400).json({ message: error });

  try {
    const newPartner = await prisma.storeLogisticsPartner.create({
      data: {
        storeId: numberValue(payload.storeId || 1),
        logisticsCompanyId: numberValue(payload.logisticsCompanyId),
        customFee: numberValue(payload.baseFee || 0),
        status: payload.status || 'active'
      }
    });
    return res.status(201).json({ id: newPartner.id });
  } catch (error) {
    console.error('Lỗi tạo đối tác giao nhận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function updatePartner(req, res) {
  const { id } = req.params;
  const payload = req.body;
  const error = validatePartner(payload);
  if (error) return res.status(400).json({ message: error });

  try {
    await prisma.storeLogisticsPartner.update({
      where: { id: Number(id) },
      data: {
        storeId: numberValue(payload.storeId || 1),
        logisticsCompanyId: numberValue(payload.logisticsCompanyId),
        customFee: numberValue(payload.baseFee || 0),
        status: payload.status || 'active'
      }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi cập nhật đối tác giao nhận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function deletePartner(req, res) {
  const { id } = req.params;

  try {
    await prisma.storeLogisticsPartner.delete({
      where: { id: Number(id) }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi xóa đối tác giao nhận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

module.exports = {
  listLogisticsCompanies,
  adminListLogisticsCompanies,
  createLogisticsCompany,
  updateLogisticsCompany,
  deleteLogisticsCompany,
  listPartners,
  createPartner,
  updatePartner,
  deletePartner
};
