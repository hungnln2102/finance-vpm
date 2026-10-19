---
name: finance-vpm-knowledge
description: >
  Kiến thức nền tảng về dự án finance-vpm (Sổ Gốc BKD TTNG): kiến trúc SPA, quy ước code,
  cấu trúc dữ liệu state (S), 7 phân hệ nghiệp vụ, luồng phê duyệt, vai trò người dùng và conventions.
  Đọc file này trước khi làm bất kỳ task nào trong project này.
---

# finance-vpm — Sổ Gốc BKD TTNG Knowledge Base

> **Hệ thống Quản lý Tài chính & Sổ Quỹ Nội Bộ (Bảo Hiểm Có Giàu · do VPM thiết kế)**  
> Ứng dụng Single-Page Application (SPA) độc lập, thuần JavaScript, quản trị toàn diện dòng tiền, công nợ, quà tặng, chấm công & tiền lương, báo cáo P&L và khóa sổ định kỳ.

---

## 📁 1. CẤU TRÚC MÃ NGUỒN (CODEBASE ARCHITECTURE)

Toàn bộ hệ thống được xây dựng theo triết lý **Zero Dependency & Standalone Web Workstation**:
```
finance-vpm/
  index.html            ← Toàn bộ giao diện HTML, CSS tokens, Seed Data và JavaScript logic
  package.json          ← Tiện ích chạy local dev server (npm start / npx serve)
  README.md             ← Tài liệu giới thiệu và hướng dẫn sử dụng nhanh
  .agents/              ← Hệ thống AI Subagents, hiến pháp AGENTS.md, skills & workflows
```

---

## 🏗️ 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

Hệ thống sử dụng một State Store tập trung duy nhất `S`, được lưu trữ tự động vào `localStorage` qua khóa `SO_GOC_BKD_TTNG_v1`:

```js
// Tự động load từ localStorage, nếu chưa có sẽ khởi tạo từ SEED
let S = load();

// Hàm lưu trạng thái và kích hoạt render
save();   // ghi S vào localStorage
render(); // cập nhật toàn bộ DOM tương ứng với tab và vai trò hiện tại
```

### Chi tiết các thực thể dữ liệu trong `S`:

| Thực thể | Mô tả | Cấu trúc trường chính |
| :--- | :--- | :--- |
| **`S.tx`** | Sổ giao dịch gốc (216+ records) | `id` (N0001...), `date` (YYYY-MM-DD), `acc` (TM/ACB/...), `dir` ("in"/"out"), `amt`, `desc`, `type` (THU_KH, OPEX, TAM_UNG...), `cat` (chi phí vận hành), `contract`, `flags`, `status` ("pending"/"checked"/"approved"/"returned"), `doc`, `src` |
| **`S.contracts`** | Danh bạ hợp đồng & công nợ (18 records) | `id` (KH01, TV01...), `kind` ("KH" hoặc "TV"), `customer`, `no`, `tv`, `signed`, `fee`, `disc`, `discApproved`, `due`, `terms`, `note` |
| **`S.gifts`** | Kho quà & ấn phẩm | `items`: danh mục vật phẩm, đơn giá, tồn kho ban đầu.<br>`mv`: lịch sử xuất/nhập kho (`item`, `qty`, `kind`: "in"/"out", `to`: "TV"/"KH", `who`, `tx`) |
| **`S.staff`** | Danh sách nhân sự & lương cơ bản | `id` (S1..S5), `name`, `role`, `base` (lương cơ bản), `kpi`, `allowance`, `advance` (tạm ứng) |
| **`S.att`** | Bảng chấm công theo tháng | Chấm công theo ngày: `1` (1 công), `0.5` (nửa công), `"L"` (nghỉ lễ hưởng lương), `"X"` (chủ nhật), `2` (tăng ca x2) |
| **`S.locks`** | Trạng thái khóa sổ | Mapping `{"YYYY-MM": "YYYY-MM-DD"}` ghi nhận ngày khóa sổ |
| **`S.budget`** | Ngân sách dự toán chi phí | Dự toán chi phí vận hành theo từng danh mục cho từng tháng |
| **`S.log`** | Nhật ký kiểm toán (Audit Trail) | Ghi nhận timestamp, vai trò và hành động can thiệp dữ liệu |

---

## 👥 3. PHÂN QUYỀN VAI TRÒ (ROLES & PERMISSIONS)

Trạng thái vai trò hiện tại được lưu trong `UI.role`:

1. **`tien` (Tiên · nhập liệu)**:
   - Nhập liệu thu - chi hàng ngày vào sổ gốc.
   - Thêm hợp đồng khách hàng / tư vấn mới.
   - Lập phiếu xuất/nhập quà tặng và ấn phẩm.
   - Giao dịch mới nhập có trạng thái `pending`.

2. **`vpm` (VPM · kiểm soát)**:
   - Rà soát tính hợp lệ của chứng từ đính kèm.
   - Phân loại chi phí vận hành (`cat`) cho các khoản chi chưa rõ.
   - Kiểm tra giao dịch (`status: "checked"`) hoặc trả lại Tiên yêu cầu bổ sung (`status: "returned"`).
   - Rà soát chấm công và phát hiện các ngày công bất thường.

3. **`giau` (Chị Giàu · duyệt)**:
   - Phê duyệt các khoản chi có giá trị lớn $\ge 2.000.000$ đ (`needsApproval()`).
   - Phê duyệt các mức chiết khấu vượt ngưỡng quy định ($> 10\%$).
   - Ký duyệt bảng lương tháng.
   - Thực hiện quy trình khóa sổ tháng (`lock` / `unlock`).

---

## 🎯 4. BẢN ĐỒ 7 PHÂN HỆ CHỨC NĂNG (7 MODULE VIEWS)

Mỗi phân hệ được đóng gói trong một hàm render chuyên biệt trả về chuỗi HTML:

| Phân hệ | Hàm Render | Chức năng nghiệp vụ trọng tâm |
| :--- | :--- | :--- |
| **1. Tổng quan** | `vOverview()` | KPI 4 thẻ số quỹ, tiền đã về ACB, nợ quá hạn, chi phí vận hành T10; Bảng đối chiếu báo cáo cũ vs Sổ gốc; 9 mục việc cần xử lý; Biểu đồ phân bổ chi phí theo nhóm |
| **2. Sổ giao dịch gốc** | `vLedger()` | Bảng sổ cái 216 giao dịch, bộ lọc theo tháng/tài khoản/danh mục/trạng thái duyệt; Form nhập giao dịch mới; Thao tác Sửa/Kiểm tra/Duyệt/Trả lại |
| **3. Công nợ** | `vDebt()` | Theo dõi công nợ KH & TV; Phân loại tuổi nợ (1-30, 31-60, >60 ngày quá hạn); Cảnh báo chiết khấu cần duyệt; Form thêm hợp đồng |
| **4. Quà & ấn phẩm** | `vGifts()` | Quản lý tồn kho; Cơ chế tự động khấu trừ 50% giá trị quà xuất cho TV; Form tạo phiếu nhập/xuất kho |
| **5. Chấm công & lương** | `vPayroll()` | Bảng chấm công 30/31 ngày, click xoay vòng ký hiệu chấm công; Tự động tính ngày công thực tế, phụ cấp, thưởng phạt, tạm ứng và thực lĩnh |
| **6. Báo cáo tháng** | `vReport()` | Báo cáo P&L (Thu - Chi - Chênh lệch ròng); So sánh Thực chi vs Dự toán ngân sách; Dòng tiền theo tài khoản |
| **7. Khóa sổ tháng** | `vClosing()` | Checklist 5 bước đối soát số dư cuối kỳ; Khóa sổ ngăn chặn ghi nhận giao dịch quá khứ; Nhật ký kiểm toán |

---

## ⚙️ 5. QUY ƯỚC MÃ NGUỒN & HÀM DÙNG CHUNG (CONVENTIONS)

1. **Định dạng tiền tệ & số liệu**:
   - Luôn sử dụng hàm `fmt(n)`: Tự động định dạng dấu chấm phân cách hàng nghìn (vd: `136.386.000 đ`).
   - Làm tròn số nguyên `Math.round()` khi lưu tiền tệ VND.

2. **Xử lý ngày tháng**:
   - `mon(dateStr)`: Trích xuất chuỗi tháng `"YYYY-MM"` từ ngày.
   - `monthLabel(m)`: Chuyển đổi `"2026-10"` thành `"Tháng 10/2026"`.
   - `isLocked(month)`: Kiểm tra xem kỳ đó đã bị khóa sổ hay chưa trước khi cho phép ghi nhận giao dịch.

3. **Cảnh báo & Phê duyệt**:
   - `needsApproval(t)`: Kiểm tra giao dịch chi có $\ge 2.000.000$ đ cần Giàu duyệt.
   - `toast(msg)`: Hiển thị thông báo toast nổi trên màn hình.
   - `log(desc)`: Ghi nhận vết kiểm toán vào `S.log`.

4. **Nguyên tắc bảo vệ dữ liệu**:
   - Không phá vỡ cấu trúc của `SEED` ban đầu.
   - Khi thêm tính năng mới, luôn duy trì tính tương thích với dữ liệu đã lưu trong `localStorage`.
