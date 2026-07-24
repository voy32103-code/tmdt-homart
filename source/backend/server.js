// dotenv chỉ load nếu biến chưa được set (Render env vars sẽ không bị ghi đè)
require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: false });

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — cho phép frontend Vercel và dev local gọi API
const allowedOrigins = [
  'https://tmdt-homart.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];
app.use(cors({
  origin: (origin, callback) => {
    // Cho phép các tool như Postman (không có origin) và các origin hợp lệ
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Không được phép bởi CORS'));
    }
  },
  credentials: true,
}));

// Parse JSON and urlencoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'HomeMart API đang hoạt động' });
});

// API routes
const apiRouter = require('./src/routes/api');
app.use('/api', apiRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Lỗi hệ thống:', err);
  res.status(500).json({
    message: err.message || 'Đã xảy ra lỗi trên hệ thống.',
    hint: 'Vui lòng kiểm tra lại kết nối cơ sở dữ liệu PostgreSQL và cấu hình biến môi trường.'
  });
});

app.listen(PORT, () => {
  console.log(`Hệ thống đang hoạt động tại http://localhost:${PORT}`);
  console.log(`Cơ sở dữ liệu: PostgreSQL (Prisma)`);
});
