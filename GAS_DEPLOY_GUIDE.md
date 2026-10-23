# 🚀 Hướng Dẫn Triển Khai Sổ Quỹ VPM Lên Google Apps Script (1 Phút)

> **Bảng tính mục tiêu của Master:**  
> 🔗 [Google Sheets: Sổ Quỹ VPM](https://docs.google.com/spreadsheets/d/1hGhhLGBo4XaUMS1VTjElJMqxxx-50KA7EIhTV3w7vto/edit?usp=sharing)  
> *Spreadsheet ID:* `1hGhhLGBo4XaUMS1VTjElJMqxxx-50KA7EIhTV3w7vto`

---

## 📦 Bộ Tệp Đã Chuẩn Bị Sẵn Trong Dự Án

| Tệp | Vị trí | Mô tả |
| :--- | :--- | :--- |
| **Backend Code** | [`gas/Code.gs`](file:///d:/Desktop/admin/finance-vpm/gas/Code.gs) | Toàn bộ mã nguồn Backend Apps Script: khởi tạo 15 tab Sheet, menu tùy chỉnh, API đọc/ghi 2 chiều, chống xung đột lock dữ liệu. |
| **Frontend Web App** | [`gas/index.html`](file:///d:/Desktop/admin/finance-vpm/gas/index.html) | Bản build Single-File React 19 + TypeScript đã đóng gói toàn bộ CSS, JS, Icon (~371 KB), tương thích 100% với `HtmlService`. |

---

## ⚡ Các Bước Thực Hiện Trên Google Sheet Của Master (3 Bước Đơn Giản)

### 🔹 Bước 1: Mở Trình Soạn Thảo Google Apps Script
1. Mở file Google Sheet của Master: [Link bảng tính](https://docs.google.com/spreadsheets/d/1hGhhLGBo4XaUMS1VTjElJMqxxx-50KA7EIhTV3w7vto/edit?usp=sharing)
2. Trên thanh menu, chọn: **Tiện ích mở rộng (Extensions)** > **Apps Script**.

---

### 🔹 Bước 2: Dán Mã Nguồn Vào Apps Script
1. **Dán mã Backend:**
   - Trong giao diện Apps Script, bạn sẽ thấy file mặc định `Code.gs`.
   - Xóa toàn bộ nội dung mặc định và **Copy & Paste** toàn bộ nội dung từ file [`gas/Code.gs`](file:///d:/Desktop/admin/finance-vpm/gas/Code.gs) vào.
2. **Tạo file giao diện Web App:**
   - Ở cột bên trái, cạnh chữ **Tệp (Files)**, bấm vào dấu **`+`** > Chọn **HTML**.
   - Đặt tên file là `index` (Apps Script sẽ tự nhận diện là `index.html`).
   - Xóa nội dung mặc định và **Copy & Paste** toàn bộ nội dung từ file [`gas/index.html`](file:///d:/Desktop/admin/finance-vpm/gas/index.html) vào.
3. Bấm biểu tượng 💾 **Lưu dự án (Save project)** (hoặc phím tắt `Ctrl + S`).

---

### 🔹 Bước 3: Khởi Tạo 15 Tab Cơ Sở Dữ Liệu
1. Trên thanh công cụ Apps Script, tại ô danh sách hàm (cạnh nút Gỡ lỗi), chọn hàm: **`initDatabaseSheets`**.
2. Bấm nút **Chạy (Run)**.
3. *Cấp quyền lần đầu (nếu Google yêu cầu):*
   - Bấm **Xem lại quyền (Review permissions)** > Chọn tài khoản Google của Master.
   - Bấm **Nâng cao (Advanced)** ở góc dưới > Bấm **Đi tới Dự án không có tiêu đề (không an toàn)** > Bấm **Cho phép (Allow)**.
4. Chờ 3-5 giây để quá trình khởi tạo hoàn tất.
   > 🎉 **Kết quả:** Quay lại tab Google Sheet, Master sẽ thấy **toàn bộ 15 tab nghiệp vụ** đã được tạo tự động với tiêu đề màu xanh đen sang trọng và nạp sẵn 216 giao dịch, 18 hợp đồng, nhân sự, chấm công, kho quà tặng!

---

### 🔹 Bước 4: Triển Khai Web App Để Sử Dụng
1. Trong màn hình Apps Script, bấm nút màu xanh **Triển khai (Deploy)** ở góc trên bên phải > Chọn **Tùy chọn triển khai mới (New deployment)**.
2. Bấm vào biểu tượng bánh răng ⚙️ bên cạnh dòng "Chọn loại" > Chọn **Ứng dụng web (Web app)**.
3. Điền thông tin:
   - **Mô tả (Description):** `Sổ Quỹ VPM v1.0`
   - **Thực thi dưới dạng (Execute as):** `Tôi (hungn... / Tài khoản của bạn)`
   - **Ai có quyền truy cập (Who has access):** `Bất kỳ ai (Anyone)` *(hoặc "Chỉ mình tôi" tùy ý Master)*
4. Bấm nút **Triển khai (Deploy)**.
5. Google sẽ cung cấp **URL ứng dụng web (Web app URL)** (dạng `https://script.google.com/macros/s/.../exec`).
   👉 Master chỉ cần lưu link này và mở trên máy tính hoặc điện thoại là sử dụng được ngay lập tức!

---

## 🌟 Tiện Ích Bổ Sung: Mở Ứng Dụng Ngay Trong Google Sheet
Mỗi khi Master hoặc nhân sự mở file Google Sheet lên:
- Trên thanh menu của Sheet sẽ xuất hiện menu **👑 Sổ Quỹ VPM**.
- Bấm vào menu > Chọn **🚀 Mở Ứng Dụng Sổ Quỹ (Cửa sổ lớn)**: Màn hình Web App sẽ hiện ra dưới dạng cửa sổ popup tiện lợi ngay trên Sheet mà không cần rời khỏi bảng tính!
