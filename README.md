# HomeMart - Hệ thống Thương mại điện tử & Quản lý bán hàng tối ưu

HomeMart là một nền tảng thương mại điện tử hoàn chỉnh, tích hợp giao diện người dùng mua sắm và trang quản trị dashboard dành cho người bán. Dự án đã được nâng cấp toàn diện lên kiến trúc tiêu chuẩn Production sử dụng bộ ba **Express.js + Prisma ORM + PostgreSQL** ở backend và **React + Vite + TailwindCSS v4** ở frontend.

---

## 🛠️ Công nghệ sử dụng (Technology Stack)

### 1. Frontend (React SPA)
*   **Thư viện cốt lõi**: React v18 (chạy trên Vite build tool siêu nhanh).
*   **Styling**: TailwindCSS v4 (thiết kế tùy biến qua CSS `@import "tailwindcss"` hiện đại, không cần cấu hình file `tailwind.config.js` cũ).
*   **Quản lý trạng thái**: Zustand (quản lý giỏ hàng `cartStore`, xác thực `authStore`).
*   **Routing**: React Router DOM (Single Page Application).
*   **Biểu đồ & Báo cáo**: Chart.js kết hợp React Chartjs 2 (biểu diễn doanh thu dạng đường, cột, tròn và bánh).

### 2. Backend (Express.js MVC)
*   **Framework**: Node.js Express.js tổ chức theo mô hình MVC (Model-View-Controller) tách biệt.
*   **Hệ quản trị cơ sở dữ liệu**: PostgreSQL.
*   **ORM**: Prisma ORM (quản lý schema, migrations, type-safety và thực thi giao dịch cơ sở dữ liệu).
*   **Xác thực bảo mật**: 
    *   Băm mật khẩu bằng **bcrypt** (salt rounds: 10).
    *   Cấp phát **JWT (JSON Web Token)** tự đóng gói (stateless) có thời hạn hiệu lực **2 giờ**.
*   **Xử lý bất đồng bộ & Giao dịch**: Thực hiện giao dịch an toàn khi đặt hàng (Prisma Transactions) và tự động khôi phục/trừ kho tương ứng khi cập nhật trạng thái đơn hàng.

### 3. Tích hợp Trí tuệ nhân tạo (AI Chatbot)
*   Tích hợp mô hình ngôn ngữ lớn (LLM) qua dịch vụ của **Groq** hoặc **Gemini API** để tự động tư vấn sản phẩm, giải đáp thắc mắc của khách hàng tại giao diện chatbot nổi.

---

## ✨ Các chức năng chính (Core Features)

### 🛒 1. Giao diện khách hàng (Client Page)
*   **Xem sản phẩm**: Danh sách sản phẩm theo danh mục, lọc giá bán thực tế (đã tính khuyến mại còn hiệu lực).
*   **Chi tiết sản phẩm**: Xem mô tả, tồn kho, thương hiệu, hình ảnh, các chương trình khuyến mại áp dụng và bình luận/đánh giá (★) từ người mua trước.
*   **Giỏ hàng**: Thêm, bớt, tăng giảm số lượng sản phẩm, tự động tính tổng tiền.
*   **Đăng nhập / Đăng ký**: Quản lý tài khoản khách hàng, mã hóa mật khẩu an toàn.
*   **Đặt hàng (Checkout)**: 
    *   Tự động tính phí vận chuyển theo khoảng cách và đơn vị vận chuyển đối tác.
    *   Đặt hàng an toàn qua Prisma Transactions để tránh xung đột kho hàng (race conditions).
*   **Lịch sử mua hàng**: Tra cứu lịch sử đơn hàng qua số điện thoại cá nhân (chỉ hiển thị khi tài khoản đã đăng nhập).
*   **AI Chatbot**: Hỗ trợ trực tuyến thông minh 24/7.

### 📊 2. Giao diện Quản trị viên (Admin Dashboard)
*   **Báo cáo & KPI doanh thu**:
    *   Thống kê doanh số theo ngày, top 10 sản phẩm bán chạy nhất, doanh thu theo danh mục và trạng thái đơn hàng.
    *   **Bộ lọc KPI tương tác**: Click trực tiếp vào các thẻ KPI (Tổng đơn hàng, Đơn hoàn thành, Đơn bị hủy) sẽ tự động chuyển sang tab Đơn hàng và lọc ra danh sách tương ứng.
*   **Quản lý Danh mục (CRUD)**: Tạo mới, cập nhật, xóa các danh mục sản phẩm, tùy biến slug SEO và mô tả SEO.
*   **Quản lý Sản phẩm (CRUD)**: Quản lý chi tiết SKU, giá bán, tồn kho thực tế, thương hiệu, hình ảnh và SEO metadata.
*   **Quản lý Giá & Khuyến mại**:
    *   Lưu lịch sử thay đổi giá bán của sản phẩm.
    *   Tạo các chương trình khuyến mại giảm giá theo % hoặc số tiền cố định, thiết lập khoảng thời gian hiệu lực tự động.
*   **Quản lý Đơn hàng**:
    *   Xem danh sách chi tiết đơn hàng của khách hàng.
    *   Cập nhật trạng thái đơn hàng (Chờ xác nhận, Đã xác nhận, Đang xử lý, Đang giao, Đã hoàn thành, Đã hủy).
    *   Tự động khôi phục số lượng tồn kho của sản phẩm khi đơn hàng bị hủy hoặc hủy bỏ thao tác hủy đơn.
    *   Hiển thị thông báo lưu thành công ngay lập tức bằng popup/alert trực quan.
*   **Quản lý Giao nhận & Đối tác**:
    *   Quản lý danh sách các công ty giao nhận và thiết lập bảng giá cước liên kết (phí cơ bản, phí trên mỗi km, khu vực phục vụ).
*   **Quản lý Bình luận**:
    *   Admin xem và kiểm duyệt (xóa) bình luận của người dùng trên toàn hệ thống từ dashboard.
    *   Bảo vệ quyền riêng tư: Admin không được phép xem bình luận trên giao diện public sản phẩm như người dùng để đảm bảo tính khách quan.

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án (Getting Started)

### Yêu cầu hệ thống
*   Đã cài đặt **Node.js** (Phiên bản v18 trở lên).
*   Cơ sở dữ liệu **PostgreSQL** đang chạy trên máy (mặc định cổng `5432`).

### Bước 1: Thiết lập cơ sở dữ liệu và Backend
1.  Di chuyển vào thư mục backend:
    ```bash
    cd source/backend
    ```
2.  Cài đặt các thư viện:
    ```bash
    npm install
    ```
3.  Tạo file cấu hình môi trường `.env` trong thư mục `source/backend`:
    ```env
    DATABASE_URL="postgresql://postgres:your_password@localhost:5432/homemart?schema=public"
    JWT_SECRET="nhập_chuỗi_bí_mật_tùy_ý_ở_đây"
    PORT=3000
    ```
4.  Đồng bộ hóa schema với PostgreSQL qua Prisma và nạp dữ liệu mẫu (seed):
    ```bash
    npx prisma db push
    npx prisma db seed
    ```
5.  Khởi động máy chủ backend:
    ```bash
    npm start
    ```
    *Backend sẽ chạy tại địa chỉ http://localhost:3000.*

### Bước 2: Build & Chạy Frontend React
1.  Di chuyển vào thư mục frontend:
    ```bash
    cd source/frontend-react
    ```
2.  Cài đặt các thư viện:
    ```bash
    npm install
    ```
3.  Biên dịch mã nguồn ra thư mục phân phối tĩnh `source/frontend`:
    ```bash
    npm run build
    ```
    *Sau khi build xong, backend chạy ở cổng `3000` sẽ tự động phục vụ các file giao diện tĩnh này.*

---

## 🤝 Đóng góp phát triển (Co-Authored-By)
*   **Antigravity** `<antigravity@google.com>`
