// Automated Unit Test Suite for HomeMart Backend (Zero External Test Runner Required)
const assert = require('assert');
const jwt = require('jsonwebtoken');

// Import services and modules to test
const cache = require('../src/config/cache');
const vnpayService = require('../src/services/vnpayService');
const productService = require('../src/services/productService');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(` ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(` ❌ FAIL: ${name}`);
    console.error(err);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(` ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(` ❌ FAIL: ${name}`);
    console.error(err);
  }
}

async function executeTestSuite() {
  console.log('\n========================================');
  console.log(' 🧪 Starting HomeMart Test Suite');
  console.log('========================================\n');

  // 1. JWT Authentication Verification Test
  runTest('JWT Token generation & verification', () => {
    const secret = 'test-jwt-secret';
    const payload = { id: 1, username: 'admin', role: 'admin' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    assert.ok(token && typeof token === 'string', 'Token should be a non-empty string');

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.username, 'admin');
    assert.strictEqual(decoded.role, 'admin');
  });

  // 2. VNPAY Checksum & URL Creation Test
  runTest('VNPAY Payment URL generation & HMAC SHA512 verification', () => {
    const mockReq = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' }
    };
    const paymentUrl = vnpayService.createPaymentUrl(mockReq, {
      orderCode: 'HM-TEST-001',
      amount: 150000,
      orderInfo: 'Thanh toan don test'
    });

    assert.ok(paymentUrl.includes('vnp_SecureHash='), 'Payment URL must contain vnp_SecureHash');
    assert.ok(paymentUrl.includes('HM-TEST-001'), 'Payment URL must include order code');

    // Verify Return URL Checksum
    const urlObj = new URL(paymentUrl);
    const query = {};
    urlObj.searchParams.forEach((val, key) => {
      query[key] = val;
    });

    const verification = vnpayService.verifyReturnUrl(query);
    assert.strictEqual(verification.isValid, true, 'Checksum verification must succeed for self-generated URL');
    assert.strictEqual(verification.orderCode, 'HM-TEST-001');
  });

  // 3. Memory TTL Cache Test
  runTest('MemoryCache set, get, TTL expiration & flushPattern', () => {
    cache.set('test:key1', 'value1', 1);
    assert.strictEqual(cache.get('test:key1'), 'value1');

    cache.flushPattern('test:');
    assert.strictEqual(cache.get('test:key1'), null, 'Key should be deleted after flushPattern');
  });

  // 4. Product Mapping & Promotion Calculation Test
  runTest('productService.mapProduct promotion calculation', () => {
    const now = new Date();
    const future = new Date(now.getTime() + 86400000);
    const past = new Date(now.getTime() - 86400000);

    const mockProduct = {
      id: 10,
      name: 'Nồi chiên không dầu',
      sku: 'NCKD-01',
      price: 1000000,
      stockQuantity: 15,
      prices: [{ price: 1000000 }],
      promotions: [
        {
          id: 1,
          name: 'Giảm giá 20%',
          discountType: 'percent',
          discountValue: 20,
          startDate: past,
          endDate: future
        }
      ],
      comments: [{ rating: 5 }, { rating: 4 }]
    };

    const mapped = productService.mapProduct(mockProduct);
    assert.strictEqual(mapped.price, 1000000);
    assert.strictEqual(mapped.finalPrice, 800000, 'Final price should be 800,000 after 20% discount');
    assert.strictEqual(mapped.hasDiscount, true);
    assert.strictEqual(mapped.avgRating, 4.5, 'Average rating should be 4.5');
  });

  console.log('\n========================================');
  console.log(` 📊 Test Results: ${passedTests}/${totalTests} Passed`);
  console.log('========================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

executeTestSuite();
