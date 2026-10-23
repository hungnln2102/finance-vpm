# 📋 Danh Sách Nhiệm Vụ Dự Án (Task Tracking)

> **Dự án:** `finance-vpm` (Sổ Gốc BKD TTNG)  
> **Cập nhật lần cuối:** 2026-10-19

---

## 🎯 Giai đoạn 1: Khởi tạo & Thiết lập nền móng
- [x] Bước 1: Trích xuất và clone toàn bộ mã nguồn ứng dụng web "Sổ Gốc BKD TTNG" từ Artifact về workspace
- [x] Bước 2: Thiết lập cấu trúc dự án (`index.html`, `package.json`, `README.md`)
- [x] Bước 3: Sao chép toàn bộ bộ máy `.agents` từ `admin_orderlist` sang `finance-vpm`
- [x] Bước 4: Cấu hình và đồng bộ hóa `.agents` (Hiến pháp `AGENTS.md`, Knowledge Base `SKILL.md`, Persona các Subagents: Finance Specialist, Frontend Lead, Orchestrator, Lead Planner...)

---

## 🚀 Giai đoạn 2: Tái cấu trúc & Xây dựng với React + TypeScript
- [x] Bước 5: Phê duyệt phương án React + TS từ Master
- [x] Bước 6: Sao lưu an toàn `index.legacy.html` và trích xuất Seed Data & Constants sang TypeScript
- [x] Bước 7: Cài đặt Vite, React 19, TypeScript và Lucide Icons
- [x] Bước 8: Thiết lập hệ thống Types, Services tính toán và AppContext quản lý State
- [x] Bước 9: Thiết kế Design System & CSS Tokens cao cấp (hỗ trợ Dark Mode, responsive)
- [x] Bước 10: Xây dựng Layout (RailNav, TopHeader, Toast) và 7 Features chính:
  - [x] 10.1: Feature Tổng quan (OverviewView)
  - [x] 10.2: Feature Sổ giao dịch gốc (LedgerView & TxForm)
  - [x] 10.3: Feature Công nợ (DebtView & ContractForm)
  - [x] 10.4: Feature Quà & ấn phẩm (GiftsView & StockMovement)
  - [x] 10.5: Feature Chấm công & lương (PayrollView & Interactive Sheet)
  - [x] 10.6: Feature Báo cáo tháng (ReportView & P&L & Budget)
  - [x] 10.7: Feature Khóa sổ tháng (ClosingView & Audit Trail)
- [x] Bước 11: Kiểm thử Typecheck (`npm run build`), chạy Dev Server và đối soát số liệu 1:1

---

## 🏆 Giai đoạn 3: Nghiệm thu toàn diện 7 phân hệ & Kiểm thử tự động E2E
- [x] Bước 12: Kiểm thử tương tác Playwright trên Dev Server (`http://127.0.0.1:5173/`):
  - [x] 12.1: Tổng quan (Overview) - 4 thẻ KPI, 9 cảnh báo, đối chiếu dữ liệu cũ.
  - [x] 12.2: Sổ giao dịch (Ledger) - 216 giao dịch, bộ lọc, kiểm soát duyệt chi.
  - [x] 12.3: Công nợ (Debt) - 18 hợp đồng, tuổi nợ, duyệt chiết khấu.
  - [x] 12.4: Quà tặng (Gifts) - 6 mặt hàng tồn kho, 13 phiếu xuất/nhập, khấu trừ 50% TV.
  - [x] 12.5: Chấm công & Lương (Payroll) - Bảng chấm công tương tác click-xoay-vòng, tính lương tự động.
  - [x] 12.6: Báo cáo tháng (Report) - P&L, thực chi vs ngân sách, đối chiếu quỹ tiền mặt & ACB.
  - [x] 12.7: Khóa sổ (Closing) - 5 tiêu chí khóa sổ, phân quyền VPM, nhật ký kiểm toán.
- [x] Bước 13: Đảm bảo 0 runtime errors, 0 cảnh báo console, giao diện chuẩn Design System cao cấp.
- [x] Bước 14: Biên soạn tài liệu đặc tả toàn diện Logic Nghiệp vụ & Kế toán ([LOGIC.md](file:///d:/Desktop/admin/finance-vpm/LOGIC.md)) gồm 9 chương chi tiết.

---

## 📊 Giai đoạn 4: Chuẩn hóa Mô hình Dữ liệu (Database Schema) & Tài liệu Khách hàng
- [x] Bước 15: Thiết kế và xuất bản toàn bộ Cơ sở dữ liệu ra file Excel [`Database_Finance_VPM.xlsx`](file:///d:/Desktop/admin/finance-vpm/Database_Finance_VPM.xlsx) chuẩn hóa 15 phân hệ nghiệp vụ, dòng 1 ID kỹ thuật, dòng 2 Tên tiếng Việt và 3-4 dòng dữ liệu demo thực tế theo [LOGIC.md](file:///d:/Desktop/admin/finance-vpm/LOGIC.md) & [MASTER_PLAN_V2.md](file:///d:/Desktop/admin/finance-vpm/MASTER_PLAN_V2.md).

---

## ☁️ Giai đoạn 5: Đóng gói & Triển khai Lên Google Apps Script (Google Sheets)
- [x] Bước 16: Thiết kế kiến trúc Google Apps Script kết nối trực tiếp Google Sheet của Master (`1hGhhLGBo4XaUMS1VTjElJMqxxx-50KA7EIhTV3w7vto`).
- [x] Bước 17: Xây dựng Backend Google Apps Script [`gas/Code.gs`](file:///d:/Desktop/admin/finance-vpm/gas/Code.gs):
  - [x] Tự động tạo menu trực quan `👑 Sổ Quỹ VPM` trên Google Sheet (mở Web App dạng Dialog popup và Sidebar).
  - [x] Hàm `initDatabaseSheets()` tự động khởi tạo 15 tab cơ sở dữ liệu và nạp toàn bộ 216 giao dịch, 18 hợp đồng, nhân sự, chấm công, kho quà tặng.
  - [x] Xây dựng bộ API endpoints đọc/ghi dữ liệu có Lock an toàn.
- [x] Bước 18: Tích hợp tầng cầu nối [`src/services/gasService.ts`](file:///d:/Desktop/admin/finance-vpm/src/services/gasService.ts) vào [`src/context/AppContext.tsx`](file:///d:/Desktop/admin/finance-vpm/src/context/AppContext.tsx) hỗ trợ chạy 2 chế độ (Online GAS + Offline LocalStorage).
- [x] Bước 19: Xây dựng pipeline tự động đóng gói Single-File HTML [`scripts/build-gas.js`](file:///d:/Desktop/admin/finance-vpm/scripts/build-gas.js) và lệnh `npm run build:gas` xuất bản file [`gas/index.html`](file:///d:/Desktop/admin/finance-vpm/gas/index.html) (~371 KB).
- [x] Bước 20: Biên soạn cẩm nang hướng dẫn thao tác triển khai 1 phút cho Master ([`GAS_DEPLOY_GUIDE.md`](file:///d:/Desktop/admin/finance-vpm/GAS_DEPLOY_GUIDE.md)).
- [x] Bước 21: Truy vết nguyên nhân gốc lỗi trắng trang trên Google Apps Script:
  - [x] 21.1: Phát hiện và sửa lỗi String Replacement Pattern corruption (`replace` với `inlinedScripts` chứa biến `$` làm hỏng cú pháp).
  - [x] 21.2: Chuyển đổi toàn bộ cơ chế inlining trong [`scripts/build-gas.js`](file:///d:/Desktop/admin/finance-vpm/scripts/build-gas.js) sang `slice()` an toàn tuyệt đối.
  - [x] 21.3: Cấu hình `vite.config.ts` tắt `modulePreload` (`modulePreload: false`), target `es2020` tương thích iframe sandbox.
  - [x] 21.4: Tái sinh [`gas/index.html`](file:///d:/Desktop/admin/finance-vpm/gas/index.html) và xác thực cú pháp đạt 100% Valid, render DOM thành công 46,137 ký tự.
- [x] Bước 22: Khắc phục triệt để lỗi giới hạn độ dài dòng của Google Apps Script Monaco Editor:
  - [x] 22.1: Phát hiện Monaco Editor tự động cắt cụt (truncate) dòng thứ 270 khi vượt quá 300,000 ký tự.
  - [x] 22.2: Tái cấu trúc [`gas/index.html`](file:///d:/Desktop/admin/finance-vpm/gas/index.html) thành 4,568 dòng chuẩn mực, chiều dài dòng tối đa chỉ 659 ký tự (hoàn toàn an toàn cho mọi trình soạn thảo web).
  - [x] 22.3: Tích hợp đầy đủ API đồng bộ hai chiều `google.script.run` kết nối 15 tab Google Sheets.
  - [x] 22.4: Kiểm thử tự động DOM render và chụp ảnh màn hình nghiệm thu hoàn hảo (Screenshot: `gas_render_masterpiece.png`).

---

## 🔐 Giai đoạn 6: Hệ thống Đăng nhập (Authentication) & Phân quyền Người dùng (RBAC)
- [x] Bước 23: Thiết kế cấu trúc bảng `NguoiDung` (16 Tab Cơ sở dữ liệu) trên Google Sheet:
  - [x] 23.1: Cập nhật [`gas/Code.gs`](file:///d:/Desktop/admin/finance-vpm/gas/Code.gs) & [`gas/Code.js`](file:///d:/Desktop/admin/finance-vpm/gas/Code.js): bổ sung tab `NguoiDung` vào `initDatabaseSheets()` với 7 cột (`Mã NV`, `Tên đăng nhập`, `Mật khẩu`, `Họ và tên`, `Vai trò`, `Chức danh`, `Trạng thái`).
  - [x] 23.2: Viết hàm `apiLogin(username, password)` kiểm tra thông tin đăng nhập từ Sheet `NguoiDung` với cơ chế fallback tự động.
- [x] Bước 24: Xây dựng Giao diện Đăng nhập (Login Screen) & Profile Badge:
  - [x] 24.1: Nâng cấp [`scripts/generate-clean-gas-html.js`](file:///d:/Desktop/admin/finance-vpm/scripts/generate-clean-gas-html.js): thiết kế màn hình Login phong cách Dark Mode glassmorphism, hiệu ứng blur sang trọng, vương miện hoàng gia 👑.
  - [x] 24.2: Tích hợp 3 thẻ Quick Access: chọn nhanh tài khoản demo `tien` (Thủ quỹ), `vpm` (Kiểm soát), `giau` (Giám đốc) chỉ với 1 click.
  - [x] 24.3: Xóa bỏ 3 nút chọn vai trò tự do trên Header, thay bằng Avatar Profile Badge (Avatar chữ cái, Họ tên, Chức vụ và nút Đăng xuất).
- [x] Bước 25: Khóa cứng Phân quyền Nghiệp vụ (RBAC Matrix) qua `canDo(action)`:
  - [x] 25.1: `tien`: Thủ quỹ (nhập thu/chi, hợp đồng, kho quà, chấm công). Cấm kiểm tra, cấm duyệt, cấm sửa, cấm khóa sổ.
  - [x] 25.2: `vpm`: Kế toán kiểm soát (kiểm tra, trả lại, sửa phân loại, đối chiếu & khóa sổ). Cấm tự duyệt chi >= 2tr.
  - [x] 25.3: `giau`: Giám đốc (phê duyệt chi >= 2tr, duyệt chiết khấu > 30%, giao ngân sách).
- [x] Bước 27: Tối ưu hóa siêu nhẹ dung lượng HTML (Làm sạch 100% Client):
  - [x] 27.1: Phát hiện và loại bỏ toàn bộ hơn 3.800 dòng dữ liệu mẫu tĩnh `const SEED` trong HTML (dữ liệu thật đã được lưu trữ trong Google Sheets và [`gas/Code.gs`](file:///d:/Desktop/admin/finance-vpm/gas/Code.gs)).
  - [x] 27.2: Thu gọn [`gas/index.html`](file:///d:/Desktop/admin/finance-vpm/gas/index.html) từ 4.795 dòng (160 KB) xuống chỉ còn 983 dòng (74.8 KB) — loại bỏ 100% staff, gifts, contracts, tx cứng!
  - [x] 27.3: Bọc bảo vệ an toàn cho các hàm `attDays()`, `seedGifts()`, `syncGasInitial()` để ứng dụng luôn render mượt mà trong mọi trạng thái mạng.
  - [x] 27.4: Kiểm thử tự động trên Headless Edge đạt 0 exception, 0 lỗi cú pháp, render dashboard hoàn hảo (Ảnh chụp nghiệm thu: `login_screen_preview.png`, `app_logged_in_preview.png`).




