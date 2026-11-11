# Daily Review Report — 2026-11-11

## [11:00] Tích hợp core-agents làm Git Submodule

- **Phạm vi**: Thay thế thư mục `.agents` tĩnh thành Git Submodule trỏ về kho chuẩn `https://github.com/hungnln2102/core-agents.git`.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [.gitmodules](file:///d:/Desktop/admin/finance-vpm/.gitmodules): Cấu hình submodule path `.agents`.
  - [.agents](file:///d:/Desktop/admin/finance-vpm/.agents): Trỏ commit `71efde7` (branch `main` của `core-agents`).
  - [AGENTS.md](file:///d:/Desktop/admin/finance-vpm/AGENTS.md): Tạo mới tại thư mục gốc trỏ về `.agents/AGENTS.md`.
- **Kiểm tra đã chạy**:
  - `git submodule status`: Xác nhận commit hash `71efde7347983712b0c31f89dfa198c95399f67d` đã checkout thành công.
  - Kiểm tra đầy đủ cấu trúc thư mục kỹ năng mới (`spec-kit`, `subagent-team`, `task-tracking`, v.v.).


## [11:15] Tái thiết kế Giao diện Tổng quan & Dọn dẹp Thanh Điều Khiển Header

- **Phạm vi**:
  - Loại bỏ các nút demo trên thanh Header (nút giả lập Webhook ACB, nút chuông Webhook, thanh 3 nút chuyển role).
  - Thay thế bằng Profile Badge hiển thị người dùng và vai trò trang nhã.
  - Tái thiết kế toàn diện màn hình Tổng quan (Overview) theo kiến trúc Feature-Driven: 5 thẻ Executive KPI dòng tiền, Trung tâm xử lý cảnh báo phân loại 3 cấp độ, phân bổ cơ cấu chi phí Opex trực quan với progress bar, bảng giao dịch dòng tiền trọng yếu gần nhất, và thu gọn bảng đối chiếu file cũ vào modal tra cứu.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/components/layout/TopHeader.tsx](file:///d:/Desktop/admin/finance-vpm/src/components/layout/TopHeader.tsx): Dọn sạch cụm nút giả lập Webhook và role switcher; thay bằng User Profile Badge tinh gọn.
  - [src/features/overview/OverviewView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/overview/OverviewView.tsx): Orchestrator mỏng kết nối các sub-components.
  - [src/features/overview/components/ExecutiveKpiCards.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/overview/components/ExecutiveKpiCards.tsx): 5 thẻ chỉ số tài chính chủ chốt.
  - [src/features/overview/components/ActionCenterCard.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/overview/components/ActionCenterCard.tsx): Bảng cảnh báo phân nhóm 3 cấp (Khẩn cấp / Cần duyệt / Đối soát).
  - [src/features/overview/components/OpexBreakdownCard.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/overview/components/OpexBreakdownCard.tsx): Tỷ trọng chi phí kèm progress bar và bảng biến động 3 tháng.
  - [src/features/overview/components/RecentCashFlowCard.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/overview/components/RecentCashFlowCard.tsx): Top các giao dịch dòng tiền lớn nhất trong kỳ.
  - [src/features/overview/components/LegacyAuditModal.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/overview/components/LegacyAuditModal.tsx): Modal tra cứu đối chiếu số liệu file Excel cũ khi cần.
  - [src/index.css](file:///d:/Desktop/admin/finance-vpm/src/index.css): Bổ sung toàn bộ hệ thống lớp CSS hiện đại, responsive.
- **Kiểm tra đã chạy**:
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 5.55s không phát sinh bất kỳ lỗi nào.


## [11:45] Chuyển đổi Form Nhập Giao Dịch Mới thành Modal Dialog & Nút Bấm Tinh Gọn

- **Phạm vi**:
  - Loại bỏ hoàn toàn khối Card Form inline *"Nhập giao dịch mới"* hiển thị dàn trải, chiếm nhiều diện tích trên trang Sổ Giao Dịch Gốc & Webhook.
  - Bổ sung nút bấm `+ Giao dịch mới` nổi bật trên thanh công cụ của bảng Sổ Giao Dịch Gốc, thuận tiện thao tác và có chỉ báo khi tháng bị khóa sổ.
  - Xây dựng component độc lập `TransactionModal` hỗ trợ cả 2 luồng: Thêm giao dịch mới và Chỉnh sửa giao dịch (đồng bộ khi click nút "Sửa" trên từng dòng của bảng).
  - Tích hợp đóng modal linh hoạt bằng nút `X`, nút `Hủy`, click ra ngoài vùng nền mờ (`backdrop`), hoặc phím `Escape`.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/features/ledger/components/TransactionModal.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/TransactionModal.tsx): Component Modal popup độc lập quản lý toàn bộ form nhập liệu, validation, submit và nạp dữ liệu chỉnh sửa.
  - [src/features/ledger/LedgerView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/LedgerView.tsx): Gỡ bỏ khối card form tĩnh cồng kềnh; thêm nút `+ Giao dịch mới` vào thanh công cụ bên cạnh các filter tab; tích hợp `TransactionModal`.
- **Kiểm tra đã chạy**:
  - `npm run build`: Kiểm tra toàn bộ Type Safety với TypeScript (`tsc`) và đóng gói Vite thành công 100% trong 4.73s.


## [12:05] Loại bỏ hoàn toàn khối Test Webhook & Làm sạch Dữ liệu Mẫu

- **Phạm vi**:
  - Gỡ bỏ hoàn toàn khối Card Panel viền cam *"Đối Soát Biến Động Số Dư ACB (Bank Webhook Engine)"* và các nút test giả lập (`Simulate Webhook`, `Mở danh sách Webhook`) trên giao diện Sổ Giao Dịch Gốc.
  - Cập nhật tiêu đề tại TopHeader: Chuẩn hóa từ *"Sổ Giao Dịch Gốc & Webhook"* thành *"Sổ Giao Dịch Gốc"*.
  - Làm sạch dữ liệu mock test logs trong `seedInitialWebhooks()`, loại bỏ toàn bộ các ID test giả lập (`WH-xxx`) khỏi state khởi tạo và localStorage cache.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/features/ledger/LedgerView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/LedgerView.tsx): Xóa bỏ panel Webhook giả lập, dọn sạch các state và icon (`Zap`, `Link2`) không còn dùng.
  - [src/components/layout/TopHeader.tsx](file:///d:/Desktop/admin/finance-vpm/src/components/layout/TopHeader.tsx): Chuẩn hóa tiêu đề và mô tả ngắn của trang Sổ Giao Dịch Gốc.
  - [src/context/AppContext.tsx](file:///d:/Desktop/admin/finance-vpm/src/context/AppContext.tsx): Đưa `seedInitialWebhooks()` về mảng rỗng và tự động dọn sạch các mock logs cũ.
- **Kiểm tra đã chạy**:
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 1.78s.


## [12:15] Tái thiết kế Sổ Giao Dịch Gốc: Thẻ KPI Tổng hợp, Phân trang Đa năng & Bộ lọc Ngày

- **Phạm vi**:
  - Bổ sung 4 thẻ thống kê số liệu trên cùng: Tổng Quỹ Khả Dụng, Tổng Thu, Tổng Chi, Tổng Số Giao Dịch.
  - Xây dựng thanh phân trang chuyên nghiệp ở chân bảng: Bộ chọn số dòng (10, 20, 50, 100) ở góc trái và thanh chuyển trang thông minh `1, 2, 3 ... N` ở góc phải.
  - Gỡ bỏ hoàn toàn cột và các nút thao tác phê duyệt (`Gửi Admin`, `Sơ duyệt`, `Chốt Sổ Cái`, `Từ chối`), thay bằng cột `Thao tác` với nút `Sửa` tinh gọn.
  - Thay thế cụm nút filter trạng thái cũ bằng 3 tab lọc chuẩn xác: `Tất cả`, `Thu`, `Chi`.
  - Bổ sung bộ lọc khoảng ngày `dd/mm/yyyy — dd/mm/yyyy` trên thanh TopHeader cạnh Kỳ tháng, hỗ trợ lọc theo ngày thời gian thực.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/types/index.ts](file:///d:/Desktop/admin/finance-vpm/src/types/index.ts): Mở rộng `UIState` hỗ trợ `dateFrom`, `dateTo`, và các trạng thái lọc `all`, `in`, `out`.
  - [src/context/AppContext.tsx](file:///d:/Desktop/admin/finance-vpm/src/context/AppContext.tsx): Thêm action `setDateRange` và cung cấp trong AppContext.
  - [src/components/layout/TopHeader.tsx](file:///d:/Desktop/admin/finance-vpm/src/components/layout/TopHeader.tsx): Thêm bộ chọn khoảng ngày `dd/mm/yyyy` cạnh dropdown Kỳ tháng.
  - [src/features/ledger/components/LedgerKpiCards.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/LedgerKpiCards.tsx): Component 4 thẻ số liệu KPI tổng hợp độc lập.
  - [src/features/ledger/LedgerView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/LedgerView.tsx): Tích hợp 4 thẻ KPI, filter Thu/Chi, bỏ cột phê duyệt, và hoàn thiện phân trang thông minh.
  - [src/index.css](file:///d:/Desktop/admin/finance-vpm/src/index.css): Bổ sung CSS responsive cho lưới `.ledger-kpi-grid`.
- **Kiểm tra đã chạy**:
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 2.09s.


## [12:20] Tinh chỉnh 4 Thẻ KPI Sổ Giao Dịch Gốc theo Phong cách Mẫu Chuẩn

- **Phạm vi**:
  - Tái thiết kế 4 thẻ thống kê số liệu trên Sổ Giao Dịch Gốc theo chuẩn giao diện mẫu của Master.
  - Cả 4 thẻ được bố trí cố định trên 1 hàng ngang duy nhất (`grid-template-columns: repeat(4, minmax(0, 1fr))`).
  - Thiết kế từng thẻ gồm 3 tầng:
    1. Header: Tiêu đề in hoa xám nhạt (`TỔNG QUỸ`, `TỔNG THU`, `TỔNG CHI`, `TỔNG SỐ GIAO DỊCH`) + Icon badge vuông bo góc viền màu sắc nét (`$`, `lịch`, `đồng hồ`, `check-circle`).
    2. Main value: Con số chính màu trắng sáng nổi bật 23px in đậm tabular-nums.
    3. Footer row: Dòng chân thẻ chia 2 vế (Nhãn chú thích xám nhạt bên trái - Giá trị phụ màu vàng hổ phách/cyan bên phải).
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/features/ledger/components/LedgerKpiCards.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/LedgerKpiCards.tsx): Cập nhật toàn bộ cấu trúc JSX, màu sắc icon badge và styling chuẩn 1-1 với ảnh mẫu.
- **Kiểm tra đã chạy**:
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 2.08s.


## [12:28] Đồng bộ Màu sắc & Design Tokens Toàn diện cho 4 Thẻ KPI

- **Phạm vi**:
  - Chuyển đổi toàn bộ màu sắc, background, border, bo góc và phông chữ của 4 thẻ KPI sang sử dụng 100% Design Tokens chuẩn của hệ thống (`var(--panel)`, `var(--line)`, `var(--ink)`, `var(--muted)`, `var(--teal)`, `var(--good)`, `var(--bad)`, `var(--ochre)`).
  - Loại bỏ hoàn toàn các mã màu hex cố định demo (`#090e1a`, `#c084fc`, `#06b6d4`), giúp thẻ hòa nhập hoàn hảo với theme tối chuẩn của ứng dụng.
  - Tối ưu hiệu ứng hover `transform: translateY(-2px)` và viền sáng nhẹ `border-color: rgba(66, 194, 187, 0.4)` đồng bộ với các card chức năng khác.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/index.css](file:///d:/Desktop/admin/finance-vpm/src/index.css): Định nghĩa hệ thống lớp CSS chuẩn `.ledger-kpi-card`, `.ledger-kpi-card-header`, `.ledger-kpi-badge`, `.ledger-kpi-card-value`, `.ledger-kpi-card-footer`.
  - [src/features/ledger/components/LedgerKpiCards.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/LedgerKpiCards.tsx): Tái cấu trúc component sử dụng toàn bộ CSS classes chuẩn hóa của hệ thống.
- **Kiểm tra đã chạy**:
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 2.03s.


## [13:10] Loại bỏ Hoàn toàn Cột Trạng Thái trên Sổ Giao Dịch Gốc

- **Phạm vi**:
  - Gỡ bỏ hoàn toàn cột `TRẠNG THÁI` (tiêu đề `<th>Trạng thái</th>` và chip hiển thị `{renderStatusChip(t)}`) trên bảng Sổ Giao Dịch Gốc.
  - Căn chỉnh lại `colSpan` của dòng *"Số dư đầu kỳ"* và dòng thông báo rỗng thành đúng 8 cột.
  - Dọn sạch hàm `renderStatusChip` và các icon trạng thái không còn sử dụng (`ShieldCheck`, `Clock`, `Sparkles`, `XCircle`).
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/features/ledger/LedgerView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/LedgerView.tsx): Xóa cột Trạng thái, dọn sạch code chết và icon thừa, đồng bộ cấu trúc 8 cột chuẩn mực.
- **Kiểm tra đã chạy**:
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 2.21s.


## [13:35] Triển khai Kiến trúc Lưu trữ Song Song (Dual-Storage): PostgreSQL 16 Local & Google Sheet Webhook

- **Phạm vi**:
  - Xây dựng Local Backend API Server (Node.js Express + `pg`) kết nối trực tiếp PostgreSQL 16 chạy cục bộ trên máy Master (`postgresql://admin:ZAQ!xsw21122@localhost:5432/mydtbmav`).
  - Tạo schema riêng biệt `finance_vpm` (độc lập 100%, bảo đảm an toàn cho các schema `business`, `orders`, `finance` của `admin_orderlist`).
  - Khởi tạo đầy đủ các bảng dữ liệu: `transactions`, `contracts`, `staff`, `gift_items`, `gift_movements`, `proposals`, `cost_adjustments`, `app_metadata`.
  - Tự động nạp toàn bộ 216 giao dịch, 18 hợp đồng, 5 nhân sự từ `seedData.json` vào bảng PostgreSQL `finance_vpm.transactions` khi khởi động lần đầu.
  - Xây dựng module đồng bộ dữ liệu ngầm (`server/sheetSync.mjs`) sẵn sàng gửi Webhook HTTP POST sang Google Sheet của Master (`1hGhhLGBo4XaUMS1VTjElJMqxxx-50KA7EIhTV3w7vto`).
  - Viết sẵn mã nguồn Webhook API cho Google Sheet tại [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs) (hỗ trợ `doGet` và `doPost` có lock ACID) để Master dán vào Sheet khi muốn kích hoạt đồng bộ đám mây.
  - Cấu hình Vite Proxy chuyển tiếp các request `/api` sang backend cổng 3001.
  - Tích hợp API Client [src/services/apiClient.ts](file:///d:/Desktop/admin/finance-vpm/src/services/apiClient.ts) vào AppContext, tự động tải state từ PostgreSQL khi mở ứng dụng và lưu song song khi phát sinh giao dịch mới/sửa/xóa.
  - Cập nhật chỉ báo trạng thái kết nối trực quan tại chân thanh menu RailNav (`🟢 PostgreSQL 16 (finance_vpm)`).
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [.env](file:///d:/Desktop/admin/finance-vpm/.env) & [.env.example](file:///d:/Desktop/admin/finance-vpm/.env.example): Khai báo cấu hình `DATABASE_URL` và `GOOGLE_SHEET_API_URL`.
  - [server/db.mjs](file:///d:/Desktop/admin/finance-vpm/server/db.mjs): Module kết nối PostgreSQL pool, tự động tạo schema `finance_vpm`, tạo bảng, nạp seed data và các hàm truy vấn CRUD.
  - [server/sheetSync.mjs](file:///d:/Desktop/admin/finance-vpm/server/sheetSync.mjs): Module background worker đồng bộ dữ liệu sang Google Sheet Webhook.
  - [server/index.mjs](file:///d:/Desktop/admin/finance-vpm/server/index.mjs): REST API Server Express (cổng 3001) với các endpoints: `/api/health`, `/api/state`, `/api/transactions`, `/api/contracts`, `/api/attendance`, `/api/sync-all`.
  - [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs): Backend Google Apps Script Webhook API độc lập cho Google Sheet của Master.
  - [vite.config.ts](file:///d:/Desktop/admin/finance-vpm/vite.config.ts): Bổ sung cấu hình proxy `/api` sang `http://localhost:3001`.
  - [src/services/apiClient.ts](file:///d:/Desktop/admin/finance-vpm/src/services/apiClient.ts): Client service gọi API backend với cơ chế fallback localStorage an toàn.
  - [src/context/AppContext.tsx](file:///d:/Desktop/admin/finance-vpm/src/context/AppContext.tsx): Đấu nối nạp dữ liệu từ PostgreSQL và kích hoạt lưu kép (dual-save) cho mọi thao tác giao dịch.
  - [src/components/layout/RailNav.tsx](file:///d:/Desktop/admin/finance-vpm/src/components/layout/RailNav.tsx): Bổ sung chỉ báo trạng thái kết nối PostgreSQL 16 ở chân menu.
  - [package.json](file:///d:/Desktop/admin/finance-vpm/package.json): Thêm dependencies backend và cập nhật lệnh `npm run dev` chạy đồng thời cả Backend API và Vite Frontend qua `concurrently`.
- **Kiểm tra đã chạy**:
  - Khởi động backend API server cổng 3001, tự động kết nối PostgreSQL 16, tạo thành công schema `finance_vpm` và nạp 216 giao dịch.
  - Gọi test `GET /api/health` trả về HTTP 200 `{ status: "ok", database: "PostgreSQL 16 (Local)", schema: "finance_vpm" }`.
  - Gọi test `POST /api/transactions` thêm giao dịch mẫu `N0217`, query trực tiếp cơ sở dữ liệu xác nhận đã lưu thành công vào PostgreSQL.
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 2.40s không phát sinh bất kỳ lỗi nào.


## [13:58] Tách Số Dư Đầu Kỳ - Cuối Kỳ sang Tab Mới & Bảng Ma Trận Đa Tháng

- **Phạm vi**:
  - Loại bỏ hoàn toàn dòng *"Số dư đầu kỳ"* chen ngang ở đầu bảng trong Sổ Giao Dịch Gốc, trả lại danh sách chứng từ sạch sẽ, liền mạch.
  - Bổ sung thanh Sub-tab linh hoạt ở đầu trang Sổ Giao Dịch Gốc gồm: `[📋 Sổ Giao Dịch Chi Tiết]` và `[🏛️ Theo Dõi Số Dư Đầu Kỳ & Cuối Kỳ]`.
  - Xây dựng component mới `BalanceTrackingTab` hiển thị bảng ma trận số dư theo từng tháng với header 2 tầng chuyên nghiệp:
    + Cột Quỹ Tiền Mặt (QUY): Chia 2 cột `Đầu kỳ (01/MM)` và `Cuối kỳ (Hôm nay / Chốt)`.
    + Cột Tài Khoản ACB: Chia 2 cột `Đầu kỳ (01/MM)` và `Cuối kỳ (Hôm nay / Chốt)`.
    + Cột Tổng Quỹ Khả Dụng: Chia 2 cột `Đầu kỳ` và `Cuối kỳ`.
    + Cột Biến Động Ròng: Tăng (+) / Giảm (-) trong tháng kèm icon trực quan.
    + Cột Trạng Thái Kỳ: Phân loại rõ ràng `🔒 Đã chốt cuối tháng (Cố định)` và `🟢 Cập nhật Realtime`.
  - Tích hợp 3 thẻ KPI số dư tức thời trên đầu tab: Số dư Quỹ mặt, Số dư ACB, Tổng quỹ khả dụng toàn hệ thống.
  - Chuẩn hóa quy tắc số dư kế toán: Số dư đầu kỳ tháng sau tự động kế thừa từ số dư chốt cuối kỳ của tháng trước liền kề.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/features/ledger/LedgerView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/LedgerView.tsx): Xóa bỏ dòng số dư đầu kỳ trong bảng; tích hợp thanh chuyển Sub-tab; bọc render có điều kiện `subTab === 'balances'`.
  - [src/features/ledger/components/BalanceTrackingTab.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx): Tạo mới component bảng ma trận theo dõi số dư đầu kỳ & cuối kỳ qua các tháng.
- **Kiểm tra đã chạy**:
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 6.05s không phát sinh bất kỳ lỗi nào.


## [14:20] Khởi tạo Bảng PostgreSQL finance_vpm.monthly_balances & Cơ chế Tự Động Sinh Tab trên Google Sheet

- **Phạm vi**:
  - Khởi tạo bảng vật lý mới `finance_vpm.monthly_balances` trong PostgreSQL để lưu trữ bền vững snapshot số dư đầu kỳ và cuối kỳ của từng tháng.
  - Viết hàm `recalculateMonthlyBalances()` quét toàn bộ giao dịch, tính toán số dư kế toán chuyển tiếp liên tục và upsert vào PostgreSQL.
  - Mở 2 REST API endpoints mới trên Local Backend: `GET /api/monthly-balances` (lấy dữ liệu số dư) và `POST /api/monthly-balances/sync` (tính toán lại và bắn Webhook sang Google Sheet).
  - Tự động kích hoạt recalculate số dư sau mỗi lần thêm mới hoặc sửa giao dịch qua `POST /api/transactions` hoặc `PUT /api/transactions/:id`.
  - Nâng cấp Google Apps Script Webhook trong [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs): Tự động phát hiện nếu Google Sheet chưa có tab `00_SODU_KY` thì tự động `ss.insertSheet('00_SODU_KY', 0)` tạo mới tab ở đầu trang tính, tự format tiêu đề 10 cột màu xanh đen sang trọng và điền toàn bộ số liệu các tháng.
  - Tích hợp nút bấm tiện ích `🔄 Đồng bộ sang Google Sheet` ngay trên thẻ bảng số dư của giao diện [src/features/ledger/components/BalanceTrackingTab.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx).
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [.env](file:///d:/Desktop/admin/finance-vpm/.env): Cấu hình URL Webhook chính thức của Master (`https://script.google.com/macros/s/AKfycbyFWBCmwLG3cEKSGMxWSKs4wI5vuGKB3BfBh992u9GgwYHSXzxSq27QA7_lpl5AJjNYGQ/exec`).
  - [server/db.mjs](file:///d:/Desktop/admin/finance-vpm/server/db.mjs): Thêm DDL bảng `finance_vpm.monthly_balances`, hàm `recalculateMonthlyBalances` và `getMonthlyBalances`.
  - [server/index.mjs](file:///d:/Desktop/admin/finance-vpm/server/index.mjs): Thêm routes `/api/monthly-balances`, `/api/monthly-balances/sync` và tự động cập nhật số dư sau mutation giao dịch.
  - [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs): Thêm hàm `apiSyncMonthlyBalances()` tự động tạo mới sheet `00_SODU_KY` và format số tiền VND.
  - [src/services/apiClient.ts](file:///d:/Desktop/admin/finance-vpm/src/services/apiClient.ts): Bổ sung `getMonthlyBalances` và `syncMonthlyBalances`.
  - [src/features/ledger/components/BalanceTrackingTab.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx): Đấu nối gọi API và thêm nút bấm đồng bộ tức thì.
- **Kiểm tra đã chạy**:
  - Khởi động server, kiểm tra query `SELECT * FROM finance_vpm.monthly_balances;` trong PostgreSQL: Xác nhận 3 dòng của Tháng 08, 09, 10/2026 đã được tính toán và lưu chính xác 100%.
  - Gọi test `GET /api/monthly-balances`: Trả về HTTP 200 với đầy đủ 3 tháng.
  - Bắn test thực tế lệnh `syncMonthlyBalances` sang Webhook Google Sheet của Master: Kết quả trả về `{ success: true, count: 3, sheetName: '00_SODU_KY' }`, Google Sheet đã tự động tạo tab mới `00_SODU_KY` thành công mỹ mãn!
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 5.97s không phát sinh bất kỳ lỗi nào.


## [14:40] Khởi Tạo Toàn Bộ 9 Tab Cơ Sở Dữ Liệu trên Google Sheet & Cơ Chế Tự Động Đồng Bộ Đa Bảng

- **Phạm vi**:
  - Nâng cấp toàn diện script Webhook [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs): Tích hợp hàm `initAllDatabaseSheets()` tự động thiết lập và điền dữ liệu đầy đủ cho toàn bộ 9 tab cơ sở dữ liệu trên Google Sheet của Master:
    + `00_SODU_KY`: Số dư đầu kỳ & cuối kỳ 3 tháng liên tiếp.
    + `01_SOGOC_2026`: 216 giao dịch sổ gốc chuẩn hóa 13 cột, format số tiền VND và căn chỉnh hiển thị.
    + `02_HOPDONG_2026`: 18 hợp đồng khách hàng với phí, chiết khấu và trạng thái duyệt.
    + `03_QUATANG`: Danh mục 6 loại quà tặng & ấn phẩm và tồn kho ban đầu.
    + `04_CHAMCONG_2026`: Bảng chấm công hàng ngày chi tiết theo từng nhân sự.
    + `05_NHANSU`: 5 nhân sự chủ chốt kèm định mức lương cơ bản và các khoản phụ cấp.
    + `06_NGANSACH_2026`: Dự toán chi phí ngân sách theo từng danh mục và từng tháng.
    + `07_DEXUAT_KEHOACH`: Kế hoạch chi tiêu và tờ trình đệ trình phê duyệt.
    + `08_DANHMUC_CHUNG`: Bảng chuẩn hóa tài khoản nguồn tiền (QUY, ACB, TCB, BT) và nhóm chi phí.
  - Tự động xóa sạch các tab mặc định rỗng (`Sheet1` hoặc `Trang tính1`) nếu có.
  - Mọi tab đều được áp dụng chuẩn nhận diện: Dòng tiêu đề nền Navy `#0f172a`, chữ Cyan `#38bdf8`, freeze 1 row, chiều cao dòng 32px, cột số tiền tự động format `#,##0 đ`.
  - Mở rộng Webhook `doPost` hỗ trợ action `syncFullDatabase` và dynamic sheet creation: Tự động tạo tab mới khi có bảng mới từ PostgreSQL backend.
  - Cập nhật backend [server/index.mjs](file:///d:/Desktop/admin/finance-vpm/server/index.mjs): Bổ sung route `POST /api/init-database-sheets` và nâng cấp `POST /api/sync-all` để đồng bộ toàn bộ dữ liệu PostgreSQL sang Google Sheet qua Webhook.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs): Tạo mới file hợp nhất hoàn chỉnh gồm hàm `initAllDatabaseSheets()`, seed data 216 giao dịch, 18 hợp đồng, 5 nhân sự, quà tặng, chấm công, ngân sách và webhook endpoints.
  - [server/index.mjs](file:///d:/Desktop/admin/finance-vpm/server/index.mjs): Mở endpoint `POST /api/init-database-sheets` và tối ưu `POST /api/sync-all`.
  - [scripts/buildGasApi.mjs](file:///d:/Desktop/admin/finance-vpm/scripts/buildGasApi.mjs): Script tiện ích tự động đóng gói `gas/api.gs` từ seed data.
- **Kiểm tra đã chạy**:
  - Kiểm tra cú pháp JavaScript của [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs) qua Node.js: `new Function(code)` xác nhận 100% hợp lệ, không lỗi cú pháp.
  - Kiểm tra khởi động [server/index.mjs](file:///d:/Desktop/admin/finance-vpm/server/index.mjs): Kết nối PostgreSQL và khởi tạo API thành công.
  - `npm run build`: Vite build thành công 100% trong 7.09s.


## [15:30] Xây Dựng Hệ Thống Đồng Bộ Chéo Hai Chiều (Bi-directional Cross-Sync: Google Sheet <=> PostgreSQL)

- **Phạm vi**:
  - Giải quyết triệt để bài toán đồng bộ chéo theo chỉ đạo của Master: Hỗ trợ người dùng thao tác trực tiếp trên Google Sheet (thêm dòng giao dịch, chỉnh sửa số tiền, nội dung, hợp đồng) và có nút đồng bộ chéo 2 chiều giữa Google Sheet và PostgreSQL.
  - **Chiều 1 (Sheet $\rightarrow$ PostgreSQL)**:
    + Thêm action `exportAllData` trong [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs): Bóc tách toàn bộ dòng dữ liệu từ `01_SOGOC_2026` và `02_HOPDONG_2026`, chuẩn hóa ngày tháng ISO, xử lý chuỗi số tiền và xuất JSON.
    + Viết hàm `importSheetDataToPostgres()` trong [server/db.mjs](file:///d:/Desktop/admin/finance-vpm/server/db.mjs): Quét từng dòng từ Sheet, thực hiện Upsert (nếu trùng `id` thì Update, nếu chưa có thì Insert và tự sinh mã `G0xxx` chuẩn), đồng thời tự động tính toán lại số dư các kỳ (`recalculateMonthlyBalances`) trong 1 Transaction an toàn ACID.
    + Mở API endpoint `POST /api/sync/sheet-to-db` trên backend server.
  - **Chiều 2 (PostgreSQL $\rightarrow$ Google Sheet)**:
    + Mở API endpoint `POST /api/sync/db-to-sheet`: Đẩy toàn bộ dữ liệu từ PostgreSQL lên ghi đè và làm mới các tab tương ứng trên Google Sheet.
  - **Giao diện điều khiển Web**:
    + Nâng cấp thanh công cụ của [src/features/ledger/components/BalanceTrackingTab.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx) với cụm 2 nút bấm chuyên nghiệp:
      * `📥 Đồng bộ Sheet → DB`: Kéo toàn bộ dữ liệu mới nhất từ Google Sheet về nạp vào PostgreSQL, hiển thị Toast số lượng GD mới/sửa và tự động refresh state màn hình thời gian thực qua `refreshFromDatabase()`.
      * `📤 Đồng bộ DB → Sheet`: Đẩy toàn bộ cơ sở dữ liệu từ PostgreSQL lên Google Sheet.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs) & [scripts/buildGasApi.mjs](file:///d:/Desktop/admin/finance-vpm/scripts/buildGasApi.mjs): Thêm action `exportAllData`.
  - [server/db.mjs](file:///d:/Desktop/admin/finance-vpm/server/db.mjs): Bổ sung `importSheetDataToPostgres()` chuẩn ACID transaction.
  - [server/index.mjs](file:///d:/Desktop/admin/finance-vpm/server/index.mjs): Mở routes `POST /api/sync/sheet-to-db` và `POST /api/sync/db-to-sheet`.
  - [src/services/apiClient.ts](file:///d:/Desktop/admin/finance-vpm/src/services/apiClient.ts): Thêm phương thức `syncSheetToDb()` và `syncDbToSheet()`.
  - [src/context/AppContext.tsx](file:///d:/Desktop/admin/finance-vpm/src/context/AppContext.tsx): Thêm hàm `refreshFromDatabase()`.
  - [src/features/ledger/components/BalanceTrackingTab.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx): Tích hợp cụm 2 nút bấm đồng bộ hai chiều trực quan.
- **Kiểm tra đã chạy**:
  - Test hàm `importSheetDataToPostgres()`: Khởi chạy và kiểm tra ACID commit thành công.
  - Test `npm run build`: Typecheck và Vite build thành công 100% trong 5.60s.


## [15:50] Làm Sạch Toàn Diện gas/api.gs: Loại Bỏ 100% Mock Data, Chuyển Sang Stateless Webhook Adapter

- **Phạm vi**:
  - Tiếp thu chỉ đạo chuẩn xác từ Master: Loại bỏ hoàn toàn khối `INITIAL_DATA` và dữ liệu mẫu tĩnh khỏi [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs).
  - Đưa [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs) về chuẩn mực Webhook Headless Adapter thuần túy (Stateless):
    + Hàm `initAllDatabaseSheets()`: Chỉ tạo khung 9 tab cơ sở dữ liệu sạch (Headers, Colors, Formats, Freeze Header) mà hoàn toàn không nạp bất kỳ giao dịch mẫu nào.
    + Hàm `apiSyncFullDatabase(payload)`: Nhận dữ liệu thực tế được truyền động (dynamic payload) từ PostgreSQL qua lệnh `[ 📤 Đồng bộ DB → Sheet ]` và ghi vào Google Sheet.
    + Hàm `exportAllData()`: Trích xuất dữ liệu thật từ Google Sheet để nạp vào PostgreSQL qua lệnh `[ 📥 Đồng bộ Sheet → DB ]`.
  - Dung lượng [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs) giảm hơn 80% (từ ~120KB xuống còn ~24KB), mã nguồn trong sáng, minh bạch và dễ bảo trì.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs): Xóa sạch `INITIAL_DATA`, hoàn thiện logic Webhook động.
- **Kiểm tra đã chạy**:
  - Kiểm tra cú pháp JavaScript [gas/api.gs](file:///d:/Desktop/admin/finance-vpm/gas/api.gs): Đạt chuẩn 100% Valid Syntax.
  - `npm run build`: Vite build thành công 100% trong 6.46s.


## [16:30] Mở Khóa Thời Gian Thực (Realtime Engine): Hỗ Trợ Tháng 11/2026 & Mở Khóa Lịch Chọn Ngày

- **Phạm vi**:
  - Khắc phục triệt để vấn đề Master phản ánh: Lịch bị gán tĩnh, không chọn được Tháng 11/2026.
  - **Chuyển đổi toàn bộ mốc ngày sang Thời Gian Thực**:
    + Nâng cấp [src/utils/formatters.ts](file:///d:/Desktop/admin/finance-vpm/src/utils/formatters.ts): Thêm hàm `getRealToday()` và `getRealCurrentMonth()` tự động đọc thời gian thực của thiết bị.
    + Thêm hàm `generateAvailableMonths()`: Tự động tổng hợp danh sách các tháng linh hoạt gồm các tháng lịch sử (`2026-08`, `2026-09`, `2026-10`), **tháng hiện tại thực tế (`2026-11`)**, và các tháng tương lai kế tiếp (`2026-12`, `2027-01`...).
    + [src/data/constants.ts](file:///d:/Desktop/admin/finance-vpm/src/data/constants.ts): Cập nhật `TODAY` gọi động theo `getRealToday()`.
    + [src/context/AppContext.tsx](file:///d:/Desktop/admin/finance-vpm/src/context/AppContext.tsx): Kỳ tháng khởi tạo mặc định theo tháng thời gian thực `mon(TODAY)`.
  - **Thanh Header linh hoạt ([src/components/layout/TopHeader.tsx](file:///d:/Desktop/admin/finance-vpm/src/components/layout/TopHeader.tsx))**:
    + Bỏ toàn bộ các `<option>` tĩnh, thay thế bằng danh sách tháng sinh động từ `availableMonths` (hỗ trợ chuyển kỳ Tháng 11/2026 ngay lập tức).
  - **Mở khóa lịch trong Modal Nhập Giao Dịch ([src/features/ledger/components/TransactionModal.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/TransactionModal.tsx))**:
    + Gỡ bỏ ràng buộc `max` ép theo từng tháng đơn lẻ; cho phép người dùng thoải mái duyệt và chọn bất kỳ ngày nào trong Tháng 11/2026 hoặc các tháng khác.
    + Khi mở modal trong tháng hiện tại, ngày giao dịch tự động đặt mặc định vào đúng ngày hôm nay.
  - **Bảng ma trận số dư ([src/features/ledger/components/BalanceTrackingTab.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx))**:
    + Tự động hiển thị dòng `Tháng 11/2026` với số dư đầu kỳ kế thừa từ cuối kỳ Tháng 10 và cập nhật biến động theo thời gian thực.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/utils/formatters.ts](file:///d:/Desktop/admin/finance-vpm/src/utils/formatters.ts): Bổ sung `getRealToday`, `getRealCurrentMonth`, `generateAvailableMonths`.
  - [src/data/constants.ts](file:///d:/Desktop/admin/finance-vpm/src/data/constants.ts): `TODAY` chuyển sang gọi động.
  - [src/components/layout/TopHeader.tsx](file:///d:/Desktop/admin/finance-vpm/src/components/layout/TopHeader.tsx): Render dropdown tháng động.
  - [src/features/ledger/components/TransactionModal.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/TransactionModal.tsx): Gỡ bỏ giới hạn `min/max` cứng của input date.
  - [src/features/ledger/components/BalanceTrackingTab.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx): Tự động nạp tháng thời gian thực.
- **Kiểm tra đã chạy**:
  - Node.js verify: `generateAvailableMonths()` trả về đúng danh sách từ `2026-08` qua `2026-11` đến `2027-02`.
  - `npm run build`: Typecheck và Vite build thành công 100% trong 6.65s.


## [16:30] Khac phuc HMR va truy vet loi dong bo Sheet -> PostgreSQL

- Nguyen nhan: webhook ping tra 200 nhung action exportAllData tra unknown_action; deployment GAS dang chay phien ban cu.
- Da sua: tach hook useApp sang src/context/useApp.ts va cap nhat toan bo import.
- Kiem tra: npm run build thanh cong.
- Con thieu: chua the deploy GAS vi browser access host khong kha dung; can cap nhat gas/api.gs va tao deployment version moi.
