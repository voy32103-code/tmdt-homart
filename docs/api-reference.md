# 📡 API Reference — HomeMart

**Base URL (Production):** `https://tmdt-homart.onrender.com`  
**Base URL (Local):** `http://localhost:3000`  
**Prefix:** Tất cả endpoints đều bắt đầu bằng `/api`

---

## Xác thực (Authentication)

Các endpoint yêu cầu quyền admin phải gửi kèm header:
```
Authorization: Bearer <jwt_token>
```
Token nhận được sau khi đăng nhập thành công.

**Phân quyền:**
- `Public` — Không cần token
- `Admin` — Cần token với `role = admin`

---

## 🔐 Auth

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `POST` | `/api/auth/login` | Public | Đăng nhập lấy JWT token |
| `POST` | `/api/auth/logout` | Public | Đăng xuất |

### POST `/api/auth/login`
**Rate limit:** 10 requests/phút

**Request body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response thành công (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

---

## 📦 Products (Sản phẩm)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/api/products` | Public | Lấy danh sách sản phẩm (phân trang) |
| `GET` | `/api/products/:id` | Public | Lấy chi tiết sản phẩm |
| `POST` | `/api/products` | Admin | Tạo sản phẩm mới |
| `PUT` | `/api/products/:id` | Admin | Cập nhật sản phẩm |
| `DELETE` | `/api/products/:id` | Admin | Xóa sản phẩm |
| `POST` | `/api/prices` | Admin | Thêm lịch sử giá cho sản phẩm |
| `GET` | `/api/summary` | Public | Thống kê tổng quan (tổng SP, danh mục...) |

### GET `/api/products`
**Query params:**

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `page` | number | Trang hiện tại (mặc định: 1) |
| `limit` | number | Số item/trang (mặc định: 10) |
| `category` | number | Lọc theo ID danh mục |
| `search` | string | Tìm kiếm theo tên |
| `minPrice` | number | Giá tối thiểu |
| `maxPrice` | number | Giá tối đa |

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Nồi cơm điện Sharp",
      "price": 850000,
      "stockQuantity": 20,
      "categoryId": 2,
      "storeId": 1
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## 🗂️ Categories (Danh mục)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/api/categories` | Public | Lấy tất cả danh mục |
| `GET` | `/api/categories/:id` | Public | Lấy chi tiết danh mục |
| `POST` | `/api/categories` | Admin | Tạo danh mục mới |
| `PUT` | `/api/categories/:id` | Admin | Cập nhật danh mục |
| `DELETE` | `/api/categories/:id` | Admin | Xóa danh mục |

### POST `/api/categories`
**Request body:**
```json
{
  "name": "Đồ gia dụng",
  "description": "Các thiết bị dùng trong nhà"
}
```

---

## 💬 Comments (Bình luận)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/api/products/:id/comments` | Public | Lấy bình luận của sản phẩm |
| `POST` | `/api/products/:id/comments` | Public | Thêm bình luận |
| `GET` | `/api/admin/comments` | Admin | Lấy tất cả bình luận (quản trị) |
| `DELETE` | `/api/admin/comments/:id` | Admin | Xóa bình luận |

### POST `/api/products/:id/comments`
**Request body:**
```json
{
  "authorName": "Nguyễn Văn A",
  "content": "Sản phẩm chất lượng tốt!",
  "rating": 5
}
```

---

## 🎁 Promotions (Khuyến mãi)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/api/promotions` | Public | Lấy danh sách khuyến mãi |
| `POST` | `/api/promotions` | Admin | Tạo khuyến mãi mới |
| `PUT` | `/api/promotions/:id` | Admin | Cập nhật khuyến mãi |
| `DELETE` | `/api/promotions/:id` | Admin | Xóa khuyến mãi |

### POST `/api/promotions`
**Request body:**
```json
{
  "productId": 1,
  "discountType": "percent",
  "discountValue": 10,
  "startDate": "2026-07-01T00:00:00Z",
  "endDate": "2026-07-31T23:59:59Z"
}
```
> `discountType`: `"percent"` (phần trăm) hoặc `"fixed"` (số tiền cố định)

---

## 🛒 Orders (Đơn hàng)

### Client endpoints

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `POST` | `/api/orders` | Public | Tạo đơn hàng mới |
| `GET` | `/api/orders/code/:code` | Public | Tra cứu đơn theo mã |
| `GET` | `/api/orders/phone/:phone` | Public | Tra cứu đơn theo số điện thoại |

### POST `/api/orders`
**Rate limit:** 20 requests/phút

**Request body:**
```json
{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "customerEmail": "a@gmail.com",
  "customerAddress": "123 Lê Lợi, Q.1, TP.HCM",
  "logisticsCompanyId": 1,
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

**Response (201):**
```json
{
  "id": 101,
  "orderCode": "HM-123456-789",
  "status": "pending",
  "grandTotal": 1730000,
  "shippingFee": 30000,
  "items": [...]
}
```

### Admin endpoints

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/api/admin/orders` | Admin | Lấy tất cả đơn hàng |
| `PUT` | `/api/admin/orders/:id` | Admin | Cập nhật trạng thái đơn hàng |

**Trạng thái đơn hàng:** `pending` → `confirmed` → `shipping` → `delivered` / `cancelled`

---

## 🚚 Logistics (Vận chuyển)

### Công ty vận chuyển

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/api/logistics-companies` | Public | Lấy danh sách công ty vận chuyển |
| `GET` | `/api/admin/logistics-companies` | Admin | Lấy danh sách (admin) |
| `POST` | `/api/admin/logistics-companies` | Admin | Tạo công ty mới |
| `PUT` | `/api/admin/logistics-companies/:id` | Admin | Cập nhật công ty |
| `DELETE` | `/api/admin/logistics-companies/:id` | Admin | Xóa công ty |

### Đối tác vận chuyển (Store)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/api/admin/store-logistics-partners` | Admin | Lấy danh sách đối tác |
| `POST` | `/api/admin/store-logistics-partners` | Admin | Thêm đối tác |
| `PUT` | `/api/admin/store-logistics-partners/:id` | Admin | Cập nhật đối tác |
| `DELETE` | `/api/admin/store-logistics-partners/:id` | Admin | Xóa đối tác |

---

## 📊 Reports (Báo cáo)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/api/admin/reports/overview` | Admin | Tổng quan doanh thu, đơn hàng |
| `GET` | `/api/admin/reports/revenue-by-date` | Admin | Doanh thu theo ngày |
| `GET` | `/api/admin/reports/top-products` | Admin | Top sản phẩm bán chạy |
| `GET` | `/api/admin/reports/revenue-by-category` | Admin | Doanh thu theo danh mục |
| `GET` | `/api/admin/reports/order-status-summary` | Admin | Thống kê trạng thái đơn hàng |

---

## 🤖 Chatbot

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `POST` | `/api/chatbot` | Public | Gửi tin nhắn tới AI chatbot (Groq) |

**Rate limit:** 20 requests/phút

**Request body:**
```json
{
  "message": "Tôi muốn tìm nồi cơm điện giá rẻ"
}
```

---

## 💳 VNPay (Thanh toán)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `POST` | `/api/vnpay/create-payment-url` | Public | Tạo URL thanh toán VNPay |
| `GET` | `/api/vnpay/callback` | Public | Xử lý callback sau thanh toán |
| `GET` | `/api/vnpay/ipn` | Public | Nhận IPN từ VNPay server |

**Rate limit:** 20 requests/phút

### POST `/api/vnpay/create-payment-url`
**Request body:**
```json
{
  "orderCode": "HM-123456-789",
  "amount": 1730000,
  "orderInfo": "Thanh toan don hang HM-123456-789"
}
```

**Response (200):**
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
}
```

---

## ❌ Mã lỗi chung

| HTTP Code | Ý nghĩa |
|-----------|---------|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `400` | Dữ liệu đầu vào không hợp lệ |
| `401` | Chưa xác thực (thiếu/sai token) |
| `403` | Không có quyền truy cập |
| `404` | Không tìm thấy tài nguyên |
| `429` | Vượt giới hạn request (rate limit) |
| `500` | Lỗi server |

---

*Cập nhật lần cuối: 2026-07-25*
