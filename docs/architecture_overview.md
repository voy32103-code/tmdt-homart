# BÁO CÁO PHÂN TÍCH VÀ MÔ HÌNH KIẾN TRÚC HỆ THỐNG HOMEMART

## 1. MỤC TIÊU NGHIỆP VỤ & TỔNG QUAN

**HomeMart** là nền tảng thương mại điện tử chuyên biệt cho ngành **Đồ gia dụng**, giải quyết bài toán kết nối 4 nhóm đối tượng chính:

1. **Khách hàng (Client/Customer)**:
   - Tìm kiếm, lọc sản phẩm theo danh mục và giá (đã tự động tính khuyến mại còn hiệu lực).
   - Đặt hàng an toàn qua quy trình kiểm tra tồn kho nghiêm ngặt.
   - Tra cứu lịch sử đơn hàng qua số điện thoại.
   - Xem và để lại đánh giá/bình luận sản phẩm (1-5 sao).
   - Trợ lý AI Chatbot 24/7 tư vấn sản phẩm trực tuyến.

2. **Cửa hàng (Store)**:
   - Quản lý thông tin gian hàng, kho hàng SKU và biến động giá.

3. **Đơn vị Giao nhận (Logistics Companies / Store Partners)**:
   - Quản lý cước phí vận chuyển cơ bản, khu vực phục vụ và chiết khấu liên kết.

4. **Quản trị viên (Admin)**:
   - Theo dõi chỉ số KPI & báo cáo doanh thu đa chiều (theo ngày, danh mục, top sản phẩm, trạng thái đơn) qua biểu đồ trực quan (Chart.js).
   - Quản lý CRUD Danh mục, Sản phẩm, Khuyến mại, Đơn hàng, Đơn vị vận chuyển và Kiểm duyệt bình luận.

---

## 2. KIẾN TRÚC KỸ THUẬT HIỆN TẠI (CURRENT ARCHITECTURE)

Hệ thống được xây dựng theo mô hình **Layered Monolith with Split Multi-Page SPA**:

### 2.1. Backend (Express.js + Prisma ORM + PostgreSQL)
- **Framework**: Node.js Express.js tổ chức theo mô hình Layered Architecture (`Routes` -> `Middleware` -> `Controllers` -> `Prisma ORM` -> `PostgreSQL`).
- **Database Schema**: Prisma ORM quản lý 11 entities (`Store`, `LogisticsCompany`, `StoreLogisticsPartner`, `Category`, `Product`, `ProductPrice`, `Promotion`, `Customer`, `Order`, `OrderItem`, `Comment`, `AdminUser`).
- **Xác thực & Bảo mật**: JWT (JsonWebToken) thời hạn 2 giờ cấp cho Admin, băm mật khẩu bằng `bcrypt`.
- **Giao dịch (Transactions)**: Đảm bảo tính nhất quán dữ liệu khi tạo đơn hàng hoặc cập nhật trạng thái đơn (hoàn tồn kho / trừ tồn kho) qua `prisma.$transaction`.
- **AI Chatbot**: Tích hợp Groq API (`llama-3.3-70b`) hoặc Gemini API (`gemini-2.0-flash`), tự động trích xuất catalog sản phẩm làm bối cảnh (context) tư vấn.

### 2.2. Frontend (React v19 + Vite + TailwindCSS v4)
- **Cấu trúc Multi-Page SPA**:
  - Client App: `index.html` -> `main.jsx` -> `App.jsx`
  - Admin App: `admin.html` -> `admin.jsx` -> `AdminApp.jsx`
- **Build & Distribution**: Vite biên dịch mã nguồn vào thư mục tĩnh `source/frontend`, được phục vụ trực tiếp bởi Express server.
- **Biểu đồ & Báo cáo**: Chart.js & React-Chartjs-2 rendering các dạng biểu đồ Line, Bar, Doughnut, Pie.

---

## 3. LUỒNG XỬ LÝ & DỮ LIỆU CHÍNH (CORE WORKFLOWS)

```
                  ┌────────────────────────────────────────┐
                  │          REACT FRONTEND SPA            │
                  │   Client (App)  │  Admin (AdminApp)    │
                  └───────────────────┬────────────────────┘
                                      │ HTTP REST APIs
                                      ▼
                  ┌────────────────────────────────────────┐
                  │           EXPRESS BACKEND              │
                  │  ┌──────────────────────────────────┐  │
                  │  │ Auth Middleware (JWT Admin Guard) │  │
                  │  └────────────────┬─────────────────┘  │
                  │                   ▼                    │
                  │  ┌──────────────────────────────────┐  │
                  │  │          Controllers             │  │
                  │  │  Products | Orders | Reports...  │  │
                  │  └────────────────┬─────────────────┘  │
                  └───────────────────┼────────────────────┘
                                      │ Prisma Client queries
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         POSTGRESQL DATABASE            │
                  │ Products, Orders, Customers, Promos... │
                  └────────────────────────────────────────┘
```

1. **Luồng giá bán & Khuyến mại**:
   - Mỗi sản phẩm kết nối với lịch sử giá (`ProductPrice`) và chương trình khuyến mại (`Promotion`).
   - Hàm `mapProduct` tính toán giá thực tế (`finalPrice`) dựa trên khuyến mại giảm theo % hoặc số tiền áp dụng tại thời điểm hiện tại.

2. **Luồng Quản lý Đơn hàng & Kho hàng**:
   - Đặt hàng: Kiểm tra tồn kho -> Tạo thông tin khách hàng -> Tạo đơn hàng -> Trừ số lượng tồn kho trong 1 giao dịch.
   - Hủy đơn / Đổi trạng thái: Tự động cộng trả hoặc trừ bớt tồn kho sản phẩm tương ứng.

3. **Luồng Bảo mật Bình luận**:
   - Bình luận từ phía khách hàng hiển thị công khai ở giao diện mua sắm.
   - Admin quản lý và xóa bình luận vi phạm tại dashboard. Admin không xem bình luận ở giao diện client nhằm đảm bảo tính bảo mật và riêng tư.

---

## 4. ĐÁNH GIÁ VÀ PHƯƠNG ÁN CẢI TIẾN KIẾN TRÚC

### 4.1. Đánh giá hiện trạng
- **Ưu điểm**: Luồng dữ liệu rõ ràng, xử lý giao dịch an toàn, tích hợp AI Chatbot và báo cáo doanh thu trực quan.
- **Hạn chế**:
  - Frontend Component Monolith: `App.jsx` và `AdminApp.jsx` chứa toàn bộ UI, State và API Fetching trong file đơn.
  - Backend Controllers phình to: Logic nghiệp vụ (tính giá, map DTO, validate) còn nằm ở Controller thay vì tầng Service.

### 4.2. Kế hoạch Cải tiến Kiến trúc (Enterprise Clean Architecture)
1. **Tầng Backend**:
   - Tách tầng **Service Layer** (`src/services/`) để chứa các xử lý nghiệp vụ tinh gọn.
   - Áp dụng Middleware Validation chuẩn hóa (ví dụ: Zod / Joi).
2. **Tầng Frontend**:
   - Phân rã `App.jsx` và `AdminApp.jsx` thành các components nhỏ độc lập (`components/shop/`, `components/admin/`, `components/common/`).
   - Sử dụng **Zustand** làm Global Store cho Giỏ hàng (`cartStore.js`) và Xác thực (`authStore.js`).
   - Tách các hàm giao tiếp API thành module `src/api/` kết hợp Custom Hooks.
