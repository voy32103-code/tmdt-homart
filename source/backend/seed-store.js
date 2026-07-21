// Script tạm thời để seed store mặc định vào DB
// Chạy: node seed-store.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Kiểm tra stores hiện có
  const storeCount = await prisma.store.count();
  console.log('Số store hiện có:', storeCount);

  if (storeCount === 0) {
    const store = await prisma.store.create({
      data: {
        name: 'HomeMart Store',
        ownerName: 'HomeMart',
        address: 'Hà Nội, Việt Nam',
        phone: '0123456789',
        status: 'active'
      }
    });
    console.log('✅ Đã tạo store mặc định:', store);
  } else {
    const stores = await prisma.store.findMany({ take: 5 });
    console.log('Stores hiện có:', stores);
  }

  // Kiểm tra logistics companies
  const logCount = await prisma.logisticsCompany.count();
  console.log('Số logistics company hiện có:', logCount);

  if (logCount === 0) {
    const log = await prisma.logisticsCompany.create({
      data: {
        name: 'Giao Hàng Nhanh (GHN)',
        baseFee: 30000,
        area: 'Toàn quốc',
        status: 'active'
      }
    });
    console.log('✅ Đã tạo logistics company mặc định:', log);
  } else {
    const logs = await prisma.logisticsCompany.findMany({ take: 5 });
    console.log('Logistics companies:', logs);
  }

  // Kiểm tra products có storeId hợp lệ không
  const productsWithNoStore = await prisma.product.count({
    where: { storeId: { not: { in: (await prisma.store.findMany({ select: { id: true } })).map(s => s.id) } } }
  });
  console.log('Sản phẩm không có storeId hợp lệ:', productsWithNoStore);

  if (productsWithNoStore > 0) {
    const firstStore = await prisma.store.findFirst();
    await prisma.product.updateMany({
      data: { storeId: firstStore.id }
    });
    console.log(`✅ Đã cập nhật tất cả sản phẩm sang storeId=${firstStore.id}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
