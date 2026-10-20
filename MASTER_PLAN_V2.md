# 🏛️ MASTER BLUEPRINT V2 — BẢN THIẾT KẾ & KẾ HOẠCH TRIỂN KHAI HỆ THỐNG `finance-vpm`

> **Chủ nhân & Nhà phát triển chính (Developer):** 👑 **Mavryk**  

---

## 📌 PHẦN 1: MỤC TIÊU & NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1. **Xây dựng hoàn toàn mới (Greenfield Build)**: Không phụ thuộc vào code demo cũ. Xây dựng kiến trúc sạch (Clean Architecture), bảo mật tuyệt đối, chuẩn ACID cho dữ liệu tài chính.
2. **Tự động hóa dòng tiền (Webhook First)**: Mọi biến động số dư ngân hàng (ACB/SePay) được ghi nhận thời gian thực và tự động khớp lệnh (`Auto-Match`). Tiền vào luôn có biến động; tiền ra có thể có hoặc không.
3. **Phân ngạch 3 cấp phê duyệt nghiêm ngặt**:
   - 🟢 **Nhập liệu (Operator)**: Tạo bản nháp chứng từ.
   - 🟡 **Admin Xem xét (Supervisor)**: Đối chiếu chứng từ gốc & webhook ngân hàng, sơ duyệt.
   - 👑 **Phê duyệt cuối cùng (Master Approver)**: Mavryk / Cấp cao chốt đưa vào **Sổ cái (General Ledger)**.
4. **Nguyên tắc Phân loại Dữ liệu (Classification Rule)**: Khi nhân viên nhập liệu đưa chứng từ vào Sổ giao dịch gốc, bắt buộc phải phân loại rõ ràng (Loại thu/chi, Danh mục Opex, Tài khoản quỹ) để tự động hóa Báo cáo P&L.
5. **Kiểm soát Ngân sách & Cost Tháng (Budget & Cost Control)**: Cấu hình định mức ngân sách và điều chỉnh cost định kỳ để so sánh độ lệch (Variance) giữa kế hoạch và thực tế.
6. **Quản lý Kế hoạch & Đệ trình (Planning & Proposals)**: Lập hồ sơ đệ trình kế hoạch, gửi email tự động qua [Resend](https://resend.com/login) kèm cơ chế CC nhân viên và **Phê duyệt / Giải trình trực tiếp qua Email Reply (Inbound Threading)**.
7. **Khóa Sổ Tháng an toàn (Month Closing)**: Đóng băng dữ liệu chống sửa lùi ngày, chuyển số dư sang tháng mới (`Carry Forward`) và lưu vết kiểm toán (`Audit Trail`).
8. **Lưu ý về Tổng quan (Dashboard)**: Dashboard là màn hình hiển thị số liệu tổng hợp (read-only derivative view), không cần xây dựng logic riêng.

---

## 🗂️ PHẦN 2: CẤU TRÚC PHÂN HỘI HỆ THỐNG (MODULE BREAKDOWN)

### 1. Phân hội Sổ Giao Dịch Gốc & Webhook (Original Ledger & Webhook Engine)
- **Kho lưu trữ hóa đơn, chứng từ gốc**:
  - Giao diện **Form nhập liệu** (bắt buộc chọn phân loại: Loại giao dịch, Danh mục Opex...).
  - **Cơ chế Match Webhook**: Hiển thị danh sách biên lai ngân hàng để 1-click **Match** với chứng từ trong sổ.
- **Vòng đời giao dịch 5 trạng thái**:
  - `Draft` ➔ `Pending Admin` ➔ `Pending Master` ➔ `Posted` (Sổ cái) / `Rejected`.

### 2. Phân hội Kế Hoạch & Đệ Trình Phê Duyệt (Planning & Proposal Management)
- **Đặc thù**: Nơi các phòng ban lập hồ sơ kế hoạch đệ trình lên cấp cao phê duyệt hoặc yêu cầu giải trình.
- **Tính năng Gửi Mail & Threading Thông Minh qua [Resend](https://resend.com/login)**:
  - **Gửi đệ trình (Outbound với CC Nhân viên)**: Khi nhân viên tạo kế hoạch và gửi, hệ thống gọi Resend gửi email tới Mavryk, đồng thời **CC sẵn email cá nhân của nhân viên lập kế hoạch** vào cùng thread.
  - **Luồng trao đổi & Giải trình trực tiếp qua Email (Inbound Threading)**:
    - Khi Mavryk bấm **Reply** hỏi thêm / yêu cầu giải trình, email phản hồi đi thẳng vào thread chung.
    - Nhân viên nhận được email yêu cầu ngay trong hòm thư cá nhân, chỉ cần bấm **Reply / Reply All** để viết nội dung giải trình. Resend Inbound Webhook bắt nội dung đó, tự động cập nhật log vào hệ thống.

### 3. Phân hội Quản Lý Ngân Sách & Điều Chỉnh Cost Tháng (Budget & Cost Control)
- Thiết lập định mức chi phí (Ngân sách / Budget) định kỳ và điều chỉnh cost trong tháng qua Mavryk (`Variance Analysis`).

### 4. Phân hội Công Nợ Cá Nhân & Đội Ngũ (Debt & Repayment Management)
- Theo dõi công nợ cá nhân, đội ngũ, đối tác với tính năng **Trả nợ từng phần / tất toán** và cột **Thu/Chi còn nợ**.

### 5. Phân hội Kho Quà Tặng & Ấn Phẩm (Inventory & Gifts Warehouse)
- Quản lý kho Nhập/Xuất kho vật phẩm, quà tặng, ấn phẩm kinh doanh (link trực tiếp đến Sổ giao dịch gốc).

### 6. Phân hội Chấm Công & Tính Lương (Payroll & Attendance Management)
- Note ngày đi làm, bảng chấm công, cấu hình **Kỳ nghỉ lễ tự động**, lương cơ bản, tính thuế TNCN và tạm ứng lương tháng.

### 7. Phân hội Báo Cáo P&L & Khóa Sổ Tháng (Financial Reports & Month Closing)
- Báo cáo Lãi/Lỗ (P&L), thực chi vs ngân sách, đối soát quỹ và quy trình khóa sổ tháng (`Audit Trail`, `Carry Forward`, `Lock Data`).

---

## 🗓️ PHẦN 3: LỘ TRÌNH THỰC HIỆN & HẠ TẦNG (TIMELINE & INFRASTRUCTURE)

- **Thời gian thực hiện**: **5 tuần**.
- **Hạ tầng đề xuất**: Monolithic tối ưu, chạy trên 1 VPS nội bộ cấu hình nhỏ (**150k - 200k VNĐ/tháng**), tiết kiệm chi phí tối đa.

---

## 📋 PHẦN 4: CHECKLIST TIẾN ĐỘ THỰC THI (CO-AUTHORING CHECKLIST)

- [ ] **Bước 1: Phê duyệt Kiến trúc & Mô hình Dữ liệu (Database & State Schema)**
- [ ] **Bước 2: Xây dựng Core Backend & Webhook Ingestion Service**
- [ ] **Bước 3: Xây dựng Luồng Phê duyệt 3 cấp & Form Sổ Giao Dịch Gốc (Bắt buộc phân loại + Match Webhook)**
- [ ] **Bước 4: Thiết kế Phân hội Kế Hoạch & Đệ Trình (Tích hợp Resend Outbound, CC nhân viên & Inbound Email Reply Threading)**
- [ ] **Bước 5: Thiết kế Phân hội Ngân Sách & Điều Chỉnh Cost (Budget định mức, Điều chỉnh cost, Phân tích độ lệch)**
- [ ] **Bước 6: Thiết kế Phân hội Công Nợ (Tính năng Trả nợ từng khoản & Cột Thu/Chi còn nợ)**
- [ ] **Bước 7: Thiết kế Kho Quà Ấn Phẩm (Nhập/Xuất kho & Link Sổ Giao Dịch Gốc)**
- [ ] **Bước 8: Thiết kế Phân hội Chấm Công & Lương (Chấm công, Kỳ nghỉ lễ tự động, Thuế TNCN, Tạm ứng)**
- [ ] **Bước 9: Thiết kế Báo Cáo P&L & Quy trình Khóa Sổ Tháng (Đóng băng dữ liệu, Carry Forward, Audit Trail)**
- [ ] **Bước 10: Kiểm thử E2E (Playwright), Double-check toàn diện & Đưa vào vận hành Production**

---
*Bản thiết kế này thuộc quyền sở hữu và triển khai trực tiếp bởi **Mavryk**.*
