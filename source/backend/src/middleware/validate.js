const { z } = require('zod');

// Schema definitions
const schemas = {
  login: z.object({
    username: z.string().trim().min(1, 'Tài khoản không được để trống'),
    password: z.string().trim().min(1, 'Mật khẩu không được để trống')
  }),

  category: z.object({
    name: z.string().trim().min(1, 'Tên danh mục không được để trống'),
    slug: z.string().optional(),
    sortOrder: z.number().int().optional().default(0),
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    parentId: z.number().int().optional().nullable()
  }),

  product: z.object({
    name: z.string().trim().min(1, 'Tên sản phẩm không được để trống'),
    sku: z.string().trim().min(1, 'SKU không được để trống'),
    categoryId: z.number().int().positive('Danh mục không hợp lệ'),
    price: z.number().min(0, 'Giá sản phẩm không hợp lệ'),
    brand: z.string().optional().nullable(),
    stockQuantity: z.number().int().min(0, 'Số lượng tồn kho không hợp lệ').default(0),
    imageUrl: z.string().optional().nullable(),
    shortDescription: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable()
  }),

  productPrice: z.object({
    productId: z.number().int().positive('Sản phẩm không hợp lệ'),
    price: z.number().min(0, 'Giá không hợp lệ'),
    startsAt: z.string().min(1, 'Ngày bắt đầu không được để trống'),
    note: z.string().optional().nullable()
  }),

  promotion: z.object({
    productId: z.number().int().positive('Sản phẩm không hợp lệ'),
    name: z.string().trim().min(1, 'Tên chương trình không được để trống'),
    discountType: z.enum(['percent', 'amount']),
    discountValue: z.number().positive('Mức giảm giá phải lớn hơn 0'),
    startsAt: z.string().min(1, 'Ngày bắt đầu không được để trống'),
    endsAt: z.string().min(1, 'Ngày kết thúc không được để trống'),
    status: z.enum(['active', 'inactive']).default('active')
  }),

  order: z.object({
    customerName: z.string().trim().min(1, 'Họ tên khách hàng không được để trống'),
    customerPhone: z.string().trim().min(1, 'Số điện thoại không được để trống'),
    customerEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    customerAddress: z.string().trim().min(1, 'Địa chỉ giao hàng không được để trống'),
    logisticsCompanyId: z.number().int().positive().optional().nullable(),
    items: z.array(z.object({
      productId: z.number().int().positive('Mã sản phẩm không hợp lệ'),
      quantity: z.number().int().positive('Số lượng phải lớn hơn 0')
    })).min(1, 'Giỏ hàng không được để trống')
  }),

  logisticsCompany: z.object({
    name: z.string().trim().min(1, 'Tên đơn vị vận chuyển không được để trống'),
    slug: z.string().optional(),
    phone: z.string().optional().nullable(),
    baseFee: z.number().min(0).default(0),
    rating: z.number().min(0).max(5).default(5),
    status: z.enum(['active', 'inactive']).default('active')
  }),

  storeLogisticsPartner: z.object({
    storeId: z.number().int().positive().default(1),
    logisticsCompanyId: z.number().int().positive('Vui lòng chọn công ty giao nhận'),
    baseFee: z.number().min(0).default(0),
    feePerKm: z.number().min(0).default(0),
    serviceArea: z.string().optional().nullable(),
    rating: z.number().min(0).max(5).default(5),
    status: z.enum(['active', 'inactive']).default('active')
  }),

  comment: z.object({
    customerName: z.string().trim().min(1, 'Tên không được để trống'),
    customerPhone: z.string().trim().min(1, 'Số điện thoại không được để trống'),
    rating: z.number().int().min(1).max(5, 'Đánh giá từ 1 đến 5 sao'),
    content: z.string().trim().min(1, 'Nội dung bình luận không được để trống')
  })
};

// Middleware generator
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = result.error.errors.map(e => e.message).join('. ');
      return res.status(400).json({ message: errorMsg });
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = {
  schemas,
  validate
};
