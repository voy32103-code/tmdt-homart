# Chuc nang da thuc hien

## 1. Thiet ke CSDL

- Da thiet ke schema SQL Server cho san thuong mai ban do gia dung.
- Co cac bang chinh cho module ban va mua hang:
  - `users`: tai khoan quan tri va phan quyen.
  - `stores`: thong tin cua hang ban hang.
  - `logistics_companies`: thong tin cong ty giao nhan.
  - `store_logistics_partners`: lien ket cua hang voi cong ty giao nhan, kem phi, khu vuc phuc vu va danh gia.
  - `categories`: danh muc san pham, co slug va thong tin SEO.
  - `products`: thong tin hang gia dung, ton kho, SKU, anh, mo ta va SEO.
  - `product_prices`: lich su thay doi gia ban theo thoi gian.
  - `promotions`: khuyen mai theo san pham.
  - `customers`, `orders`, `order_items`: thong tin khach hang, don hang va chi tiet don hang.
- Schema da co `CREATE DATABASE`, `USE`, khoa chinh, khoa ngoai, index va cac rang buoc `CHECK` co ban.

## 2. Backend API

- Tao server Node.js ket noi truc tiep SQL Server bang package `mssql`.
- Mac dinh ket noi database `HomeMartDb` tren server `HAPM04-PC17`.
- Ho tro SQL Server Authentication hoac Windows Authentication qua bien moi truong.
- Cac API da co:
  - `POST /api/auth/login`: dang nhap admin.
  - `POST /api/auth/logout`: dang xuat admin.
  - `GET /api/summary`: thong ke so san pham, danh muc, khuyen mai, don vi giao nhan.
  - `GET /api/categories`: lay danh sach danh muc.
  - `POST /api/categories`: them danh muc.
  - `PUT /api/categories/:id`: sua danh muc.
  - `DELETE /api/categories/:id`: xoa danh muc neu chua co san pham.
  - `GET /api/products`: lay danh sach san pham kem gia hien tai va khuyen mai dang ap dung.
  - `POST /api/products`: them san pham va gia ban ban dau.
  - `PUT /api/products/:id`: sua san pham; neu doi gia thi tao ban ghi gia moi.
  - `DELETE /api/products/:id`: xoa san pham, gia va khuyen mai lien quan.
  - `GET /api/prices`: lay lich su gia.
  - `POST /api/prices`: them gia moi cho san pham.
  - `GET /api/promotions`: lay danh sach khuyen mai.
  - `POST /api/promotions`: them khuyen mai.
  - `PUT /api/promotions/:id`: sua khuyen mai.
  - `DELETE /api/promotions/:id`: xoa khuyen mai.
  - `GET /api/logistics-companies`: lay danh sach don vi giao nhan dang hoat dong.
  - `POST /api/orders`: tao don hang tu gio hang.
  - `GET /api/admin/orders`: admin xem danh sach don hang.
  - `PUT /api/admin/orders/:id`: admin cap nhat trang thai don hang.
  - `GET/POST/PUT/DELETE /api/admin/logistics-companies`: admin quan ly cong ty giao nhan.
  - `GET/POST/PUT/DELETE /api/admin/store-logistics-partners`: admin quan ly doi tac cua hang - giao nhan.
- Da bo sung validate cho san pham, gia, khuyen mai va don hang.

## 3. Module Admin

- Dang nhap admin:
  - Tai khoan mac dinh `admin`.
  - Mat khau mac dinh `admin123`.
  - Token dang nhap duoc luu trong `localStorage`.
- Quan ly danh muc hang gia dung:
  - Them danh muc.
  - Sua danh muc.
  - Xoa danh muc neu chua duoc san pham su dung.
  - Quan ly slug, SEO title, SEO description.
- Quan ly thong tin hang ban:
  - Them san pham.
  - Sua san pham.
  - Xoa san pham.
  - Quan ly SKU, danh muc, gia ban, thuong hieu, ton kho, anh, mo ta ngan va SEO.
- Quan ly gia ban:
  - Them gia moi theo ngay ap dung.
  - Khi sua san pham va thay doi gia, he thong tu tao ban ghi gia moi.
- Quan ly khuyen mai:
  - Them khuyen mai.
  - Sua khuyen mai.
  - Xoa khuyen mai.
  - Ho tro giam theo phan tram hoac so tien.
  - Co ngay bat dau, ngay ket thuc va trang thai.
- Quan ly don hang:
  - Xem danh sach don hang.
  - Xem khach hang, so dien thoai, dia chi, don vi giao nhan va tong tien.
  - Cap nhat trang thai `pending`, `confirmed`, `shipping`, `completed`, `cancelled`.
- Quan ly cong ty giao nhan:
  - Them, sua, xoa cong ty giao nhan.
  - Quan ly ten, slug, dien thoai, phi co ban, rating, trang thai.
- Quan ly doi tac cua hang - giao nhan:
  - Them, sua, xoa quan he doi tac.
  - Quan ly cua hang, cong ty giao nhan, phi co ban, phi/km, khu vuc phuc vu, rating, trang thai.

## 4. Module User

- Hien thi trang web ban hang.
- Hien thi danh sach san pham kem:
  - Anh san pham.
  - Danh muc.
  - Ten cua hang.
  - Gia hien tai.
  - Gia sau khuyen mai neu co.
  - Mo ta ngan.
- Tim kiem san pham theo ten, thuong hieu, mo ta.
- Loc san pham theo danh muc.
- Them san pham vao gio hang.
- Cap nhat so luong trong gio hang.
- Xoa san pham khoi gio hang.
- Chon don vi giao nhan.
- Nhap thong tin khach hang va dat hang.
- Sau khi dat hang, he thong tao don hang va tru ton kho.

## 5. Cac cai thien ky thuat da bo sung

- Schema SQL Server co rang buoc du lieu:
  - Gia khong am.
  - Ton kho khong am.
  - So luong dat hang lon hon 0.
  - Rating tu 0 den 5.
  - Khuyen mai phan tram khong qua 100.
  - Ngay ket thuc khong duoc truoc ngay bat dau.
- Frontend da escape HTML truoc khi render du lieu nguoi dung nhap de giam nguy co XSS.
- Backend khong cho them gia/khuyen mai cho san pham khong ton tai.
- Backend kiem tra ton kho khi dat hang.
- Cac API thay doi du lieu trong admin yeu cau token admin.
- File `README.md` da cap nhat cach chay, ERD dang Mermaid va danh sach API.

## 6. Thong ke & Bao cao doanh thu (Tuan 8+9)

- Cung cap 5 API bao cao moi:
  - `GET /api/admin/reports/overview`: tong quan doanh thu, tong don hang, don hoan thanh, don huy.
  - `GET /api/admin/reports/revenue-by-date`: doanh thu theo ngay.
  - `GET /api/admin/reports/top-products`: top 10 san pham ban chay.
  - `GET /api/admin/reports/revenue-by-category`: doanh thu theo danh muc san pham.
  - `GET /api/admin/reports/order-status-summary`: tong hop trang thai don hang.
- Giao dien admin truc quan su dung thu vien Chart.js:
  - KPI cards: hien thi nhanh cac so lieu quan trong.
  - Bo loc theo khoang thoi gian (Tu ngay - Den ngay) tu dong cap nhat toan bo so lieu va bieu do.
  - 4 loai bieu do bat mat: Line chart (doanh thu theo ngay), Horizontal Bar chart (top san pham), Doughnut chart (doanh thu theo danh muc), Pie chart (ty le trang thai don).

## 7. Chatbot AI tu van ban hang (Tuan 8+9)

- Cong bot ho tro floating widget tai goc phai ben duoi trang mua hang cua User.
- API backend `POST /api/chatbot` tich hop voi **Gemini API** (`gemini-2.0-flash`).
- Co che thong minh: tu dong truy van toan bo danh muc san pham tu database, chen lam ngu canh (context) cho AI de tu van chinh xac san pham, gia ca, khuyen mai hien co trong shop.
- Co che tuong thich: ho tro che do Demo truc quan neu chua thiet lap `GEMINI_API_KEY`, giup nguoi dung van trai nghiem duoc chatbot tu van san pham dua tren search keyword.
- Giao dien chat cao cap: ho tro hien thi dinh dang Markdown, scroll tu dong, typing indicator (hoat hoa 3 cham).

## 8. Gioi han hien tai

- Dang nhap demo dung hash SHA-256 don gian, chua co salt/JWT het han phien nang cao.
- Chua co thanh toan online; don hang moi tao o trang thai `pending`.
