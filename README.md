# Sổ Gốc BKD TTNG

> **Hệ thống Quản lý Tài chính & Sổ Quỹ Nội Bộ (Bảo Hiểm Có Giàu · VPM)**

Ứng dụng Single-Page Application (SPA) độc lập, không phụ thuộc framework ngoài, chạy trực tiếp trên trình duyệt hoặc dev server cục bộ. Toàn bộ logic tính toán, phân quyền vai trò và dữ liệu hạt giống (Seed Data) từ 8 file dữ liệu đã được tích hợp đầy đủ.

---

## 🚀 Cách chạy ứng dụng

### Cách 1: Mở trực tiếp
Mở file `index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Cốc Cốc, Safari...).

### Cách 2: Khởi chạy qua Local Web Server
```bash
npm start
# hoặc
npx serve .
```

---

## 📂 Các phân hệ chức năng (7 Modules)

1. **Tổng quan (Overview):**
   - KPI tài chính: Tổng số quỹ, Tiền đã về TK ACB, Nợ quá hạn, Chi phí vận hành T10.
   - 9 mục cảnh báo việc cần xử lý.
   - Bảng đối chiếu số liệu báo cáo cũ vs Sổ gốc.
   - Biểu đồ phân bổ chi phí vận hành theo nhóm chi phí (tháng 8 - 10/2026).

2. **Sổ giao dịch gốc (General Ledger):**
   - Quản lý 216+ giao dịch thu/chi nguồn.
   - Lọc theo kỳ (tháng), tài khoản (Tiền mặt / ACB / Techcombank / ...), danh mục thu chi.
   - Form thêm mới giao dịch, phân loại chi phí vận hành, gắn hợp đồng và chứng từ.
   - Quy trình kiểm tra (VPM) & duyệt chi (>= 2 triệu đồng).

3. **Công nợ (Debt Management):**
   - Theo dõi công nợ Khách hàng (KH) và Tư vấn (TV).
   - Phân loại tuổi nợ (1-30 ngày, 31-60 ngày, quá hạn > 60 ngày).
   - Quản lý tỷ lệ chiết khấu hợp đồng và phê duyệt chiết khấu.

4. **Quà & Ấn phẩm (Gifts & Inventory):**
   - Quản lý xuất/nhập tồn kho quà tặng, ấn phẩm bán hàng.
   - Cơ chế khấu trừ 50% giá trị quà vào thu nhập của tư vấn khi xuất cho TV.

5. **Chấm công & Lương (HR & Payroll):**
   - Bảng chấm công tương tác tháng (chuẩn 24 công/tháng).
   - Cơ chế tính lương tự động, lương tăng ca ngày lễ/chủ nhật, thưởng phạt, tạm ứng và giảm trừ thuế TNCN.

6. **Báo cáo tháng (Monthly Reports):**
   - Báo cáo kết quả hoạt động kinh doanh (P&L), ngân sách dự toán vs thực chi.
   - Báo cáo lưu chuyển tiền tệ theo nhóm.
   - Số dư các quỹ (Hộp tiền mặt & Tài khoản ngân hàng).

7. **Khóa sổ tháng (Period Closing):**
   - Quy trình khóa sổ 5 bước đối soát số dư cuối kỳ.
   - Nhật ký kiểm toán (Audit Trail) ghi nhận mọi hành động thêm/sửa/duyệt.

---

## 👥 Vai trò người dùng (Roles)

- **Tiên · nhập liệu:** Ghi nhận giao dịch, lập phiếu thu chi và phiếu xuất nhập kho.
- **VPM · kiểm soát:** Đối soát chứng từ, phân loại chi phí, kiểm tra các giao dịch và chấm công.
- **Chị Giàu · duyệt:** Phê duyệt các khoản chi >= 2.000.000 đ, duyệt tỷ lệ chiết khấu và thực hiện khóa sổ tháng.

---

## 💾 Lưu trữ dữ liệu

- Dữ liệu được lưu trữ tự động vào `localStorage` của trình duyệt.
- Nút **"Khôi phục dữ liệu ban đầu"** cho phép reset lại toàn bộ dữ liệu mẫu ban đầu từ 8 file khách gửi.
