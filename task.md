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
