# 🔄 System Flow — HomeMart

Tài liệu này mô tả toàn bộ luồng xử lý của hệ thống HomeMart, từ client gửi request đến khi nhận response.

---

## 🏗️ Kiến trúc tổng quan

```
┌─────────────────────┐        ┌──────────────────────┐
│   Frontend (React)  │        │   Admin Panel (React) │
│  Vercel (CDN)       │        │   Vercel (CDN)        │
└────────┬────────────┘        └──────────┬────────────┘
         │ HTTPS API calls                │ HTTPS API calls
         ▼                                ▼
┌──────────────────────────────────────────────────────┐
│              Backend (Express.js)                    │
│              Render.com (Node.js server)             │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Routes  │→ │Middleware│→ │    Controllers      │ │
│  └──────────┘  └──────────┘  └────────┬───────────┘ │
│                                        ▼             │
│                               ┌────────────────────┐ │
│                               │     Services       │ │
│                               └────────┬───────────┘ │
│                                        ▼             │
│                               ┌────────────────────┐ │
│                               │   Repositories     │ │
│                               └────────┬───────────┘ │
└────────────────────────────────────────┼─────────────┘
                                         │ Prisma ORM
                                         ▼
                              ┌─────────────────────┐
                              │  PostgreSQL (Neon)  │
                              │  ap-southeast-1     │
                              └─────────────────────┘
```

---

## 1. 🔐 Luồng Xác Thực (Authentication)

### 1.1 Đăng nhập Admin

```
Client                    Backend                      Database
  │                          │                             │
  │── POST /api/auth/login ──►│                             │
  │   {username, password}   │                             │
  │                          │── Rate limiter check ───────│
  │                          │   (max 10 req/phút)         │
  │                          │                             │
  │                          │── validate(login schema) ───│
  │                          │                             │
  │                          │── adminUser.findUnique() ──►│
  │                          │                             │
  │                          │◄── user record ─────────────│
  │                          │                             │
  │                          │── bcrypt.compare(password) ─│
  │                          │                             │
  │                          │── jwt.sign({id, role}) ─────│
  │                          │   expires: 8h               │
  │                          │                             │
  │◄── 200 {token, user} ────│                             │
  │                          │                             │
```

### 1.2 Xác thực token (Middleware)

```
Request với Authorization header
         │
         ▼
┌─────────────────────────────────────┐
│ authenticateToken middleware        │
│                                     │
│  1. Lấy token từ header             │
│     "Authorization: Bearer <token>" │
│                                     │
│  2. jwt.verify(token, JWT_SECRET)   │
│     ├─ Hợp lệ → req.user = payload │
│     │           → next()            │
│     └─ Lỗi → 401 / 403            │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ requireAdmin middleware (nếu cần)   │
│                                     │
│  req.user.role === 'admin'          │
│     ├─ Đúng → next()               │
│     └─ Sai → 403 Forbidden         │
└─────────────────────────────────────┘
```

---

## 2. 🛒 Luồng Đặt Hàng (Order Flow)

### 2.1 Khách hàng tạo đơn hàng

```
Client                         Backend (OrderService)              Database
  │                                    │                               │
  │── POST /api/orders ───────────────►│                               │
  │   {customer, items, logistics}     │                               │
  │                                    │                               │
  │                          ┌─────────▼──────────────────────────────┐
  │                          │        Prisma Transaction              │
  │                          │                                        │
  │                          │  1. Tìm/Tạo Customer                  │
  │                          │     findFirst(phone) → nếu chưa có    │
  │                          │     → customer.create()                │
  │                          │                                        │
  │                          │  2. Tính phí vận chuyển               │
  │                          │     logisticsCompany.findUnique(id)    │
  │                          │     → lấy baseFee                      │
  │                          │     (mặc định: 30,000đ)               │
  │                          │                                        │
  │                          │  3. Xử lý từng sản phẩm               │
  │                          │     ├─ product.findUnique(id)          │
  │                          │     ├─ Kiểm tra tồn kho               │
  │                          │     ├─ Lấy giá hiện tại               │
  │                          │     ├─ Áp dụng khuyến mãi (nếu có)   │
  │                          │     │  percent/fixed discount          │
  │                          │     └─ Trừ tồn kho                    │
  │                          │        product.update(stockQuantity-N) │
  │                          │                                        │
  │                          │  4. Tính tổng tiền                    │
  │                          │     grandTotal = subtotal              │
  │                          │                - discountTotal         │
  │                          │                + shippingFee           │
  │                          │                                        │
  │                          │  5. Tạo đơn hàng                      │
  │                          │     orderCode = HM-{timestamp}-{rand}  │
  │                          │     order.create(status: 'pending')    │
  │                          └─────────┬──────────────────────────────┘
  │                                    │
  │◄── 201 {orderCode, grandTotal} ───│
```

### 2.2 Admin cập nhật trạng thái đơn hàng

```
Trạng thái: pending → confirmed → shipping → delivered
                                           → cancelled (bất kỳ lúc nào)

Khi cancelled:
  → Hoàn tồn kho: product.update(stockQuantity + item.quantity)

Khi khôi phục từ cancelled → trạng thái khác:
  → Kiểm tra tồn kho đủ không
  → Trừ lại tồn kho
```

---

## 3. 💳 Luồng Thanh Toán VNPay

```
Client                  Backend               VNPay                 Database
  │                        │                    │                       │
  │── POST /api/vnpay ─────►│                    │                       │
  │   create-payment-url   │                    │                       │
  │   {orderCode, amount}  │                    │                       │
  │                        │                    │                       │
  │                        │── Tạo vnp_Params──►│                       │
  │                        │   Sort params       │                       │
  │                        │   HMAC-SHA512 sign  │                       │
  │                        │                    │                       │
  │◄── {paymentUrl} ───────│                    │                       │
  │                        │                    │                       │
  │── Redirect ────────────────────────────────►│                       │
  │   to VNPay payment page│                    │                       │
  │                        │                    │                       │
  │                        │                    │── User pays ──────────│
  │                        │                    │                       │
  │◄────────────────────────────────────────────│ Redirect to           │
  │   /payment-callback    │                    │ VNP_RETURNURL         │
  │   ?vnp_ResponseCode=00 │                    │                       │
  │   &vnp_SecureHash=...  │                    │                       │
  │                        │                    │                       │
  │── GET /api/vnpay ──────►│                   │                       │
  │   /callback            │                    │                       │
  │                        │── Verify HMAC ─────│                       │
  │                        │   hash signature    │                       │
  │                        │   ResponseCode=00?  │                       │
  │                        │                    │                       │
  │◄── {isSuccess, order} ─│                    │                       │
  │                        │                    │                       │
  │                        │◄──── IPN Notify ───│ (server-to-server)    │
  │                        │   GET /vnpay/ipn   │                       │
  │                        │── Verify IPN ──────│                       │
  │                        │── Update order ────────────────────────────►│
  │                        │   status (nếu cần) │                       │
```

---

## 4. 🤖 Luồng Chatbot AI

```
Client                    Backend                    Groq AI API
  │                          │                            │
  │── POST /api/chatbot ─────►│                            │
  │   {message: "..."}       │                            │
  │                          │── Rate limit check ────────│
  │                          │   (max 20 req/phút)        │
  │                          │                            │
  │                          │── Lấy context sản phẩm ───►DB
  │                          │   (top products/categories)│
  │                          │                            │
  │                          │── POST to Groq API ────────►│
  │                          │   model: llama3            │
  │                          │   system: HomeMart context │
  │                          │   user: message            │
  │                          │                            │
  │                          │◄── AI response ────────────│
  │                          │                            │
  │◄── {reply: "..."} ───────│                            │
```

---

## 5. 🗂️ Luồng Quản lý Sản phẩm & Danh mục (Admin)

```
Admin Client              Backend                     Database
  │                          │                            │
  │── POST /api/products ────►│                            │
  │                          │── requireAdmin middleware──│
  │                          │── validate(product) ───────│
  │                          │── productService.create ───►│
  │                          │   product.create()         │
  │◄── 201 {product} ────────│                            │

  │── PUT /api/products/:id ─►│                            │
  │                          │── requireAdmin ────────────│
  │                          │── productService.update ───►│
  │                          │   product.update()         │
  │◄── 200 {product} ────────│                            │

  │── DELETE /api/products/:id►│                           │
  │                          │── requireAdmin ────────────│
  │                          │── productService.delete ───►│
  │                          │   Kiểm tra có đơn hàng?   │
  │                          │   → Có: soft delete        │
  │                          │   → Không: hard delete     │
  │◄── 200 {message} ────────│                            │
```

---

## 6. 🚚 Luồng Quản lý Vận chuyển

```
Admin tạo công ty vận chuyển
  → LogisticsCompany.create(name, baseFee, status)

Admin gắn đối tác vào cửa hàng
  → StoreLogisticsPartner.create(storeId, logisticsCompanyId)

Khách hàng đặt hàng
  → GET /api/logistics-companies (lấy danh sách)
  → Chọn company → POST /api/orders (gửi logisticsCompanyId)
  → OrderService tính shippingFee = company.baseFee
```

---

## 7. 📊 Luồng Báo cáo (Admin Reports)

```
Admin Client              Backend (ReportService)         Database
  │                                │                          │
  │── GET /api/admin/reports ──────►│                          │
  │   /overview                    │── requireAdmin ──────────│
  │                                │                          │
  │                                │── Prisma aggregate ─────►│
  │                                │   COUNT orders           │
  │                                │   SUM grandTotal         │
  │                                │   GROUP BY status/date   │
  │                                │                          │
  │◄── {totalRevenue, orders} ─────│                          │
```

---

## 8. 🔒 Luồng Bảo mật (Security Middleware)

Mọi request đều qua các lớp bảo vệ theo thứ tự:

```
Request đến
    │
    ▼
┌─────────────────────────────────┐
│ 1. Security Headers             │
│    X-Content-Type-Options       │
│    X-Frame-Options: DENY        │
│    X-XSS-Protection             │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 2. CORS Middleware              │
│    Whitelist: vercel.app        │
│              localhost:5173     │
│    credentials: true            │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 3. Rate Limiter (theo route)    │
│    Auth: 10 req/phút            │
│    Sensitive: 20 req/phút       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 4. Input Validation (Zod)       │
│    Schema validation            │
│    → 400 nếu sai format         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 5. Auth Middleware (nếu cần)    │
│    JWT verify                   │
│    Role check (admin/user)      │
└──────────────┬──────────────────┘
               │
               ▼
         Controller → Service → Repository → Database
```

---

## 9. 📁 Luồng MVC trong Backend

```
Request
  │
  ▼
Router (src/routes/api.js)
  │  Phân phối request theo method + path
  │
  ▼
Controller (src/controllers/)
  │  Nhận req/res, gọi Service, trả response
  │
  ▼
Service (src/services/)
  │  Business logic, validation nghiệp vụ
  │  Xử lý transaction phức tạp
  │
  ▼
Repository (src/repositories/)
  │  Truy vấn database qua Prisma
  │  Tách biệt logic DB khỏi business logic
  │
  ▼
Prisma ORM
  │  Generate SQL từ Prisma query
  │
  ▼
PostgreSQL (Neon)
```

---

## 10. ⚡ Luồng Cache (TTL Cache)

```
GET /api/categories (request lần 1)
  │
  ▼
Cache miss → Query DB → Lưu vào cache (TTL: 60s)
  │
  ▼
Response trả data

GET /api/categories (request lần 2, trong 60s)
  │
  ▼
Cache hit → Trả data từ cache (không query DB)
  │
  ▼
Response trả data (nhanh hơn)

Khi TTL hết hạn → Cache tự xóa → Lần sau query DB lại
```

---

*Cập nhật lần cuối: 2026-07-25*
