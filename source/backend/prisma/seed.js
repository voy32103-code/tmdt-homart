const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear old data
  await prisma.adminUser.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.productPrice.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.storeLogisticsPartner.deleteMany({});
  await prisma.logisticsCompany.deleteMany({});
  await prisma.store.deleteMany({});

  // Seed AdminUser (password 'admin123' bcrypt hashed)
  const admin = await prisma.adminUser.create({
    data: {
      username: 'admin',
      passwordHash: '$2b$10$ew.TAcJSTnnWsr7V5L6jBOlWwEwo6EA8UGjjT8tzDBn9m4kqO.yT.',
      role: 'admin'
    }
  });

  // Seed Store
  const store = await prisma.store.create({
    data: {
      name: 'Gia Dung An Phat',
      ownerName: 'Quan tri vien',
      phone: '0901234567',
      address: '12 Le Loi, Quan 1, TP.HCM'
    }
  });

  // Seed LogisticsCompany
  const logistics = await prisma.logisticsCompany.create({
    data: {
      name: 'Nhanh Viet Express',
      baseFee: 25000.00,
      area: 'TP.HCM'
    }
  });

  // Seed StoreLogisticsPartner
  await prisma.storeLogisticsPartner.create({
    data: {
      storeId: store.id,
      logisticsCompanyId: logistics.id,
      customFee: 25000.00
    }
  });

  // Seed Categories
  const catKitchen = await prisma.category.create({
    data: {
      name: 'Nha bep',
      slug: 'nha-bep',
      seoTitle: 'Do gia dung nha bep gia tot',
      seoDescription: 'Noi, chao, may xay va dung cu nha bep chinh hang.'
    }
  });

  const catClean = await prisma.category.create({
    data: {
      name: 'Ve sinh nha cua',
      slug: 've-sinh-nha-cua',
      seoTitle: 'Do ve sinh nha cua tien ich',
      seoDescription: 'Dung cu ve sinh nha cua chat luong, de su dung.'
    }
  });

  // Seed Products
  const prod1 = await prisma.product.create({
    data: {
      storeId: store.id,
      categoryId: catKitchen.id,
      name: 'Noi chien khong dau 5L',
      slug: 'noi-chien-khong-dau-5l',
      sku: 'NCKD-5L',
      brand: 'KitchenPro',
      price: 1290000.00,
      stockQuantity: 34,
      imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=80',
      shortDescription: 'Dung tich 5L, dieu khien co, phu hop gia dinh 3-5 nguoi.',
      seoTitle: 'Noi chien khong dau 5L KitchenPro',
      seoDescription: 'Mua noi chien khong dau 5L chinh hang, giao nhanh.'
    }
  });

  const prod2 = await prisma.product.create({
    data: {
      storeId: store.id,
      categoryId: catClean.id,
      name: 'May hut bui cam tay',
      slug: 'may-hut-bui-cam-tay',
      sku: 'MHB-CT',
      brand: 'CleanMate',
      price: 690000.00,
      stockQuantity: 21,
      imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=80',
      shortDescription: 'Nho gon, pin sac, hut bui khe hep va sofa.',
      seoTitle: 'May hut bui cam tay CleanMate',
      seoDescription: 'May hut bui cam tay pin sac, gia tot, giao nhanh.'
    }
  });

  // Seed ProductPrices
  await prisma.productPrice.create({
    data: {
      productId: prod1.id,
      price: 1290000.00,
      effectiveFrom: new Date('2026-01-01')
    }
  });

  await prisma.productPrice.create({
    data: {
      productId: prod2.id,
      price: 690000.00,
      effectiveFrom: new Date('2026-01-01')
    }
  });

  // Seed Promotions
  await prisma.promotion.create({
    data: {
      productId: prod1.id,
      name: 'Giam gia cuoi tuan',
      discountType: 'percent',
      discountValue: 10.00, // 10%
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-12-31')
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
