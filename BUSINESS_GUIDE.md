# 📘 HƯỚNG DẪN NGHIỆP VỤ TÀI CHÍNH & QUY TRÌNH PHÊ DUYỆT (DÀNH CHO QUẢN LÝ & KHÁCH HÀNG)

> **Dự án:** Sổ Gốc Quản Trị Doanh Nghiệp & Dòng Tiền (`finance-vpm`)  
> **Mục tiêu tài liệu:** Giúp mọi thành viên trong ban lãnh đạo, kế toán và nhân sự hiểu rõ cách thức vận hành hệ thống tài chính, quy trình kiểm soát dòng tiền qua ngân hàng và 3 cấp độ phê duyệt minh bạch mà không cần biết về lập trình.

---

## 🌟 1. GIỚI THIỆU TỔNG QUAN

Hệ thống **`finance-vpm`** được thiết kế như một **Sổ Gốc Kế Toán Điện Tử** thông minh, đóng vai trò là "trái tim" quản lý tài chính của doanh nghiệp. Hệ thống giải quyết trọn vẹn 3 bài toán lớn:
1. **Kiểm soát dòng tiền thực tế 100%**: Tự động nhận thông báo biến động số dư từ tài khoản ngân hàng (ACB) qua Webhook.
2. **Chống thất thoát, sai sót**: Áp dụng mô hình **3 ngạch kiểm duyệt độc lập** trước khi tiền được ghi nhận chính thức vào Sổ cái.
3. **Minh bạch công nợ & P&L (Lợi nhuận)**: Tự động tổng hợp báo cáo kinh doanh, quỹ tiền mặt, công nợ khách hàng và lương thưởng rõ ràng theo từng tháng.

---

## 🏦 2. CƠ CHẾ NHẬN BIẾN ĐỘNG SỐ DƯ & ĐỐI SOÁT TỰ ĐỘNG (WEBHOOK)

Hệ thống kết nối trực tiếp với cổng thông báo biến động số dư ngân hàng (ACB / SePay / VietQR):

- **Đối với TIỀN VÀO (Thu tiền khách hàng, nộp vốn...):**
  - **100% tự động báo biến động**: Ngay khi khách hàng chuyển khoản thành công, hệ thống ngân hàng bắn thông báo (Webhook) về phần mềm.
  - **Tự động khớp lệnh (Auto-Match)**: Hệ thống tự động so khớp số tiền và nội dung chuyển khoản với hợp đồng hoặc phiếu thu đang chờ. Kế toán không cần nhập tay thủ công, giảm thiểu 100% tình trạng nhầm lẫn, bỏ sót.

- **Đối với TIỀN RA (Chi phí vận hành, trả lương, tạm ứng...):**
  - Có thể có webhook trừ tiền ngân hàng hoặc thực hiện chi tiền mặt/tạm ứng thủ công.
  - **Nguyên tắc vàng**: Mọi khoản tiền chi ra đều phải lập hồ sơ chứng từ gốc và bắt buộc đi qua **quy trình phê duyệt 3 cấp** trước khi quỹ thực tế bị trừ.

---

## 👥 3. PHÂN QUYỀN 3 NGẠCH VẬN HÀNH (AI LÀM GÌ - AI DUYỆT GÌ?)

Để đảm bảo tính kiểm soát chặt chẽ, hệ thống phân chia rõ ràng 3 vị trí (3 ngạch) với quyền hạn riêng biệt:

```
[ 1. NHÂN VIÊN NHẬP LIỆU ] ──► [ 2. ADMIN / KẾ TOÁN TRƯỞNG ] ──► [ 3. MASTER / CHỦ ĐẦU TƯ ] ──► [ SỔ CÁI CHÍNH THỨC ]
  (Tạo phiếu, hóa đơn,          (Kiểm tra chứng từ, đối chiếu       (Phê duyệt lần cuối,            (Tiền vào sổ, tính quỹ
   hợp đồng sơ khai)             số dư ngân hàng / Webhook)          chính thức chốt sổ)             & báo cáo lợi nhuận)
```

### 🟢 Cấp 1: Nhân viên Nhập liệu (Operator)
- **Công việc**: Tiếp nhận hóa đơn, hợp đồng mới, tạo các phiếu thu / phiếu chi dạng **Bản nháp (Draft)**.
- **Giới hạn**: Chỉ được nhập liệu và gửi đi, **không có quyền** tự ý sửa đổi hoặc tự ghi nhận vào quỹ chính thức.

### 🟡 Cấp 2: Admin Xem xét & Sơ duyệt (Admin Reviewer / Kế toán trưởng)
- **Công việc**: 
  - Kiểm tra tính hợp lệ của hóa đơn, chứng từ gốc do nhân viên nhập.
  - Đối chiếu số tiền và nội dung với thông báo biến động số dư từ ngân hàng (Webhook).
- **Hành động**: Nếu hồ sơ chuẩn xác, Admin bấm **"Duyệt sơ bộ"** để chuyển lên Sếp lớn. Nếu sai sót, Admin trả lại kèm ghi chú yêu cầu làm lại.

### 👑 Cấp 3: Master Phê duyệt cuối cùng (Master Approver / Chủ đầu tư)
- **Công việc**: 
  - Là người có **quyền lực tối cao** quyết định dòng tiền của doanh nghiệp.
  - Xem xét báo cáo tổng quan, dòng tiền thu/chi, rủi ro.
- **Hành động**: Bấm **"Phê duyệt cuối cùng"**. Ngay khi Master duyệt, giao dịch chính thức được đưa vào **Sổ cái (General Ledger)**, tự động cập nhật số dư quỹ và tính toán vào bảng lãi lỗ (P&L).

---

## 📋 4. VÒNG ĐỜI MỘT GIAO DỊCH TRÊN HỆ THỐNG

Mỗi dòng tiền đi qua phần mềm đều trải qua 5 trạng thái minh bạch:

1. 📝 **Bản nháp (`Draft`)**: Vừa được nhân viên nhập liệu tạo ra.
2. ⏳ **Chờ Admin (`Pending Admin`)**: Đang chờ Kế toán trưởng kiểm tra chứng từ & đối chiếu ngân hàng.
3. 🔍 **Chờ Master (`Pending Master`)**: Admin đã sơ duyệt xong, đang chờ Chủ đầu tư (Master) bấm nút duyệt.
4. ✅ **Đã ghi sổ (`Posted`)**: **Đã được Master phê duyệt**, chính thức ghi nhận vào Sổ cái và ảnh hưởng đến quỹ tiền của công ty.
5. ❌ **Từ chối (`Rejected`)**: Bị trả về do thiếu chứng từ hoặc thông tin không hợp lệ.

---

## 🎯 5. LỢI ÍCH THỰC TẾ CHO DOANH NGHIỆP

- **Minh bạch tuyệt đối**: Mọi đồng tiền ra vào đều có dấu vết rõ ràng (Audit Trail): ai nhập, ai duyệt, ngân hàng nào báo biến động vào lúc mấy giờ.
- **Tiết kiệm 80% thời gian đối soát**: Không còn cảnh ngồi đếm sao kê ngân hàng thủ công khớp với sổ tay. Hệ thống tự động match webhook.
- **Loại bỏ rủi ro gian lận / nhầm lẫn**: Nh nhờ cơ chế 3 cấp kiểm duyệt, không một cá nhân nào có thể tự ý thu chi hoặc làm lệch quỹ của công ty.

---
*Tài liệu nghiệp vụ vận hành chuẩn mực dành cho Ban lãnh đạo và đối tác.*
