const crypto = require('crypto');

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      sorted[key] = obj[key];
    }
  }
  return sorted;
}

function formatDate(date) {
  // Return yyyyMMddHHmmss in GMT+7 (Asia/Ho_Chi_Minh)
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const vnDate = new Date(utc + (3600000 * 7));

  const yyyy = vnDate.getFullYear();
  const MM = String(vnDate.getMonth() + 1).padStart(2, '0');
  const dd = String(vnDate.getDate()).padStart(2, '0');
  const HH = String(vnDate.getHours()).padStart(2, '0');
  const mm = String(vnDate.getMinutes()).padStart(2, '0');
  const ss = String(vnDate.getSeconds()).padStart(2, '0');

  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

exports.createPaymentUrl = (req, { orderCode, amount, orderInfo, returnUrl }) => {
  const tmnCode = process.env.VNP_TMNCODE || 'KZ65TSRV';
  const secretKey = process.env.VNP_HASHSECRET || 'C27G7FNPQCUUJI50A1X37S5N8Y425ZTP';
  const vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const callbackUrl = returnUrl || process.env.VNP_RETURNURL || 'http://localhost:5173/payment-callback';

  let ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress ||
    '127.0.0.1';

  if (ipAddr.includes('::ffff:')) {
    ipAddr = ipAddr.replace('::ffff:', '');
  }
  if (ipAddr === '::1') {
    ipAddr = '127.0.0.1';
  }

  const createDate = formatDate(new Date());

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderCode,
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderCode}`,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(Number(amount) * 100),
    vnp_ReturnUrl: callbackUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate
  };

  const sortedParams = sortObject(vnp_Params);

  const signData = Object.keys(sortedParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key])}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;

  return paymentUrl;
};

exports.verifyReturnUrl = (query) => {
  const secretKey = process.env.VNP_HASHSECRET || 'C27G7FNPQCUUJI50A1X37S5N8Y425ZTP';
  const vnp_Params = { ...query };
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = sortObject(vnp_Params);

  const signData = Object.keys(sortedParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key])}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isValid = secureHash && secureHash.toLowerCase() === signed.toLowerCase();
  const responseCode = vnp_Params['vnp_ResponseCode'];
  const isSuccess = isValid && responseCode === '00';

  return {
    isValid,
    isSuccess,
    orderCode: vnp_Params['vnp_TxnRef'],
    transactionNo: vnp_Params['vnp_TransactionNo'],
    responseCode: responseCode,
    amount: vnp_Params['vnp_Amount'] ? Number(vnp_Params['vnp_Amount']) / 100 : 0,
    orderInfo: vnp_Params['vnp_OrderInfo'],
    bankCode: vnp_Params['vnp_BankCode']
  };
};
