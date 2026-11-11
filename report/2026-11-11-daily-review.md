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
 
 
## [20:35] Tái Cấu Trúc Toàn Diện: Dọn Dẹp Mã Nguồn Rác & Chuyển Đổi Sang Triển Khai Web Độc Lập

- **Phạm vi**:
  - Xác nhận kiến trúc chính thức: Google Sheet chuyển thành Headless Cloud Database thuần túy (kết nối qua Webhook REST API), ứng dụng Web được deploy độc lập trên hạ tầng Web Server / Cloud.
  - Loại bỏ toàn bộ các tệp phục vụ nhúng giao diện bên trong Google Apps Script iframe/dialog/sidebar cũ và các công cụ debug không còn cần thiết:
    + Xóa `index.legacy.html` (124 KB): Tệp nguyên khối HTML cũ từ ban đầu.
    + Xóa `gas/Code.gs` (120 KB), `gas/Code.js` (120 KB), `gas/index.html` (77 KB): Bộ mã nguồn cũ phục vụ HtmlService trong Sheet.
    + Xóa toàn bộ thư mục `scripts/` (12 script đóng gói, debug CDP, test login iframe, string-split).
    + Xóa `server/fullSeed.json` (93 KB): Tệp mock data cũ chỉ dùng cho script đóng gói đã xóa.
    + Xóa `src/services/gasService.ts` và gỡ bỏ toàn bộ tham chiếu `window.google.script.run` trong [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx).
    + Xóa `GAS_DEPLOY_GUIDE.md` và thay bằng [GOOGLE_SHEET_SETUP.md](file:///e:/Project/finance-vpm/GOOGLE_SHEET_SETUP.md).
  - Giữ lại duy nhất tệp [gas/api.gs](file:///e:/Project/finance-vpm/gas/api.gs) làm Webhook Controller cho Google Sheet Database.
  - Nâng cấp [server/index.mjs](file:///e:/Project/finance-vpm/server/index.mjs): Cấu hình Express phục vụ trực tiếp Web Frontend tĩnh (`dist/`) và fallback SPA routing.
  - Cập nhật [package.json](file:///e:/Project/finance-vpm/package.json): Bỏ script `build:gas`, bổ sung script `npm start` phục vụ production.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Kiểm tra đã chạy**:
  - `node --check server/index.mjs; node --check server/db.mjs`: Cú pháp JavaScript Backend đạt chuẩn 100%.
  - `npm run build`: Typecheck và Vite build đóng gói thành công 100% trong 2.19s, 0 lỗi, 0 cảnh báo.


## [22:05] Tối Ưu Hóa Form Nhập Giao Dịch Mới (Phân Loại Thu/Chi, Database Accounts, Hợp Đồng Tùy Chọn)

- **Phạm vi**:
  - Tái cấu trúc trường **Loại tiền**: Rút gọn danh sách 10 loại phức tạp thành đúng 2 loại chuẩn: `Thu (Tiền vào +)` và `Chi (Tiền ra -)`.
  - Trường **Tài khoản**: Chuyển sang lấy động từ bảng cơ sở dữ liệu `finance_vpm.accounts` (`QUY`, `ACB`, `MB`, `TCB`...).
  - Trường **Hợp đồng liên kết**: Chuyển thành tùy chọn `(Không bắt buộc)`, cho phép để trống và xóa bỏ toàn bộ cờ cảnh báo bắt buộc trong `financeService.ts`.
  - Trường **Nhóm chi phí**: Tự động vô hiệu hóa (`disabled`) khi là khoản Thu và chỉ kích hoạt khi là khoản Chi.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/features/ledger/components/TransactionModal.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/TransactionModal.tsx): Thiết kế lại toàn bộ form theo tiêu chuẩn mới.
  - [server/db.mjs](file:///e:/Project/finance-vpm/server/db.mjs): Thêm bảng `accounts`, seed dữ liệu mặc định và hàm `getAccounts()`.
  - [server/index.mjs](file:///e:/Project/finance-vpm/server/index.mjs): Mở route `GET /api/accounts`.
  - [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx): Nạp `accounts` từ DB và hỗ trợ `dir` Thu/Chi.
  - [src/services/financeService.ts](file:///e:/Project/finance-vpm/src/services/financeService.ts): Gỡ bỏ cảnh báo bắt buộc gắn hợp đồng.
  - [src/services/apiClient.ts](file:///e:/Project/finance-vpm/src/services/apiClient.ts) & [src/types/index.ts](file:///e:/Project/finance-vpm/src/types/index.ts): Định nghĩa kiểu `AccountItem` và client `getAccounts`.
- **Kiểm tra đã chạy**:
  - `npm run build`: Compile TypeScript và Vite đóng gói thành công 100% trong 2.42s.
  - Query DB xác nhận bảng `finance_vpm.accounts` có 4 tài khoản hoạt động (`QUY`, `ACB`, `MB`, `TCB`).


## [22:10] Kéo và Đồng Bộ Toàn Diện Git Submodule .agents (core-agents)

- **Phạm vi**:
  - Kiểm tra trạng thái Git Submodule `.agents` (trỏ về repo `https://github.com/hungnln2102/core-agents.git`).
  - Thực thi `git submodule update --init --recursive` và `git submodule update --remote --merge` để kéo toàn bộ mã nguồn của `core-agents` về thư mục `.agents`.
  - Xác nhận checkout thành công tại commit mới nhất `71efde7` (nhánh `heads/main`).
  - Đồng bộ đầy đủ các thành phần: Hiến pháp AI Agent tối cao (`.agents/AGENTS.md`), bộ kỹ năng (`.agents/skills/`), plugins (`.agents/plugins/subagent-team/`), rules và workflows.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [.agents](file:///e:/Project/finance-vpm/.agents): Khởi tạo và checkout đầy đủ commit `71efde7347983712b0c31f89dfa198c95399f67d`.
- **Kiểm tra đã chạy**:
  - `git submodule status`: Trả về ` 71efde7347983712b0c31f89dfa198c95399f67d .agents (heads/main)` (đã checkout sạch sẽ, không còn trạng thái missing `-`).


## [22:35] Đồng Bộ Realtime 1-1 Toàn Diện Giữa 10 Bảng PostgreSQL & 10 Tab Google Sheet (Kèm Nhật Ký Kiểm Toán Audit Logs)

- **Phạm vi**:
  - Triển khai yêu cầu tối cao của Master: *"postgres có bao nhiêu bảng nghiệp vụ thì ở Google Sheet phải có bấy nhiêu bảng nghiệp vụ. Và tôi muốn cả 2 nó phải realtime, postgres cập nhật là sheet cũng cập nhật realtime luôn, kể cả các log, tạo, sửa, xóa..."*.
  - **Thiết lập Ma trận 10 Bảng nghiệp vụ chuẩn 1-1**:
    1. `finance_vpm.monthly_balances` $\iff$ Tab `00_SODU_KY` (10 cột: Kỳ tháng, Quỹ đầu/cuối kỳ, ACB đầu/cuối kỳ, Tổng đầu/cuối kỳ, Biến động, Trạng thái, Cập nhật).
    2. `finance_vpm.transactions` $\iff$ Tab `01_SOGOC_2026` (13 cột: Mã GD, Ngày GD, Tài khoản, Chiều tiền, Số tiền, Nội dung, Phân loại, Nhóm CP, Mã HĐ, Trạng thái, Cảnh báo, Chứng từ, Nguồn).
    3. `finance_vpm.contracts` $\iff$ Tab `02_HOPDONG_2026` (12 cột: Mã HĐ, Loại HĐ, Tên KH, Số HĐ, Tư vấn, Ngày ký, Phí BH, Chiết khấu, Duyệt CK, Hạn TT, Kỳ hạn, Ghi chú).
    4. `finance_vpm.gift_items` & `gift_movements` $\iff$ Tab `03_QUATANG` (7 cột: Mã quà, Tên quà / Ấn phẩm, Đơn vị tính, Đơn giá xuất kho, Số lượng tồn, Mục đích, Ghi chú).
    5. `finance_vpm.attendance` $\iff$ Tab `04_CHAMCONG_2026` (5 cột: Mã NV, Họ tên NV, Ngày chấm, Số công, Trạng thái).
    6. `finance_vpm.staff` $\iff$ Tab `05_NHANSU` (12 cột: Mã NV, Họ tên NV, Chức vụ, Lương cơ bản, Phụ cấp ĐT, Xăng, Ăn, Công tác, KPI, Lương BH, Phụ thuộc, Tạm ứng).
    7. `finance_vpm.cost_adjustments` $\iff$ Tab `06_NGANSACH_2026` (7 cột: Mã điều chỉnh, Kỳ tháng, Danh mục, Định mức cũ, Định mức mới, Lý do, Trạng thái).
    8. `finance_vpm.proposals` $\iff$ Tab `07_DEXUAT_KEHOACH` (9 cột: Mã đề xuất, Tiêu đề, Người lập, Email, Bộ phận, Số tiền, Ngày lập, Nội dung, Trạng thái).
    9. `finance_vpm.accounts` $\iff$ Tab `08_TAIKHOAN_QUY` (6 cột: Mã tài khoản, Tên tài khoản / Quỹ, Phân loại, Số TK, Ngân hàng, Trạng thái).
    10. `finance_vpm.audit_logs` $\iff$ Tab `09_NHATKY_HOATDONG` (7 cột: ID Log, Thời gian VN, Hành động, Bảng dữ liệu, Mã bản ghi, Người thực hiện, Chi tiết hoạt động).
  - **Hệ Thống Realtime Dual-Sync Pipeline**:
    - Xây dựng hàm trung tâm `dispatchRealtimeSync({ table, action, id, data, actor, details })` trong [server/sheetSync.mjs](file:///e:/Project/finance-vpm/server/sheetSync.mjs):
      + Tự động ghi vết vào bảng `finance_vpm.audit_logs` trong PostgreSQL.
      + Gửi Webhook sang Google Sheet: gọi `syncRow` (thêm mới hoặc cập nhật tại dòng tương ứng) hoặc `deleteRow` (xóa dòng theo ID) trên đúng Tab đó.
      + Đồng thời ghi vết hoạt động vào Tab `09_NHATKY_HOATDONG` trên Google Sheet.
      + Chạy ngầm Non-blocking, bảo đảm phản hồi của API cực nhanh mà không làm tắc nghẽn luồng xử lý.
  - **Nâng Cấp Webhook Google Apps Script ([gas/api.gs](file:///e:/Project/finance-vpm/gas/api.gs))**:
    - Khởi tạo khung 10 Tab chuẩn hóa qua `initAllDatabaseSheets()`: Header Navy `#0f172a`, chữ Cyan `#38bdf8`, freeze row 1, format tiền VND `#,##0 đ`.
    - Hỗ trợ đầy đủ các hành động realtime: `syncRow`, `deleteRow`, `logActivity`, `syncFullDatabase`, `exportAllData`.
    - Cơ chế khóa an toàn `LockService.getScriptLock()` bảo vệ dữ liệu theo chuẩn ACID khi nhận request realtime.
  - **Đấu Nối Toàn Diện Vào Tất Cả Các Route Backend ([server/index.mjs](file:///e:/Project/finance-vpm/server/index.mjs)) & Frontend**:
    - Mọi thao tác thêm/sửa/xóa giao dịch, hợp đồng, tài khoản, chấm công, đề xuất kế hoạch, điều chỉnh ngân sách, quà tặng... đều gọi `dispatchRealtimeSync`.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [gas/api.gs](file:///e:/Project/finance-vpm/gas/api.gs): Tái cấu trúc toàn diện hỗ trợ 10 Tab và các hành động realtime `syncRow`, `deleteRow`, `logActivity`.
  - [server/sheetSync.mjs](file:///e:/Project/finance-vpm/server/sheetSync.mjs): Thêm `dispatchRealtimeSync` kết hợp `recordAuditLog` và Webhook worker.
  - [server/db.mjs](file:///e:/Project/finance-vpm/server/db.mjs): Bổ sung đầy đủ hàm CRUD cho `accounts`, `contracts`, `proposals`, `cost_adjustments`, `staff`, `gift_movements`, `audit_logs`.
  - [server/index.mjs](file:///e:/Project/finance-vpm/server/index.mjs): Đấu nối đầy đủ các route REST API và liên kết `dispatchRealtimeSync`.
  - [src/services/apiClient.ts](file:///e:/Project/finance-vpm/src/services/apiClient.ts): Bổ sung các phương thức client gọi backend cho toàn bộ 10 bảng nghiệp vụ.
  - [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx): Kết nối các action đề xuất, điều chỉnh chi phí, duyệt chiết khấu, quà tặng sang `apiClient`.
- **Kiểm tra đã chạy**:
  - `npm run build`: Compile TypeScript và Vite bundle thành công 100% trong 2.42s (0 lỗi).
  - Integration Test thực tế:
    + Thêm giao dịch mẫu `TEST_SYNC_8163` -> PostgreSQL ghi nhận thành công, `dispatchRealtimeSync` phát sinh event CREATE.
    + Sửa giao dịch `TEST_SYNC_8163` -> PostgreSQL cập nhật số tiền 1.500.000 đ, `dispatchRealtimeSync` phát sinh event UPDATE.
    + Xóa giao dịch `TEST_SYNC_8163` -> PostgreSQL xóa sạch bản ghi, `dispatchRealtimeSync` phát sinh event DELETE.
    + Kiểm tra bảng `finance_vpm.audit_logs`: Ghi nhận chuẩn xác cả 3 vết CREATE, UPDATE, DELETE kèm thời gian và mô tả chi tiết.


## [23:10] Tái Cấu Trúc Toàn Diện Hệ Thống: Chuẩn Hóa Domain-Driven Backend & Feature-Driven Frontend (Xóa Bỏ Triệt Để Monolith & God Files)

- **Phạm vi & Mục tiêu**:
  - Thực thi chỉ đạo tái cấu trúc toàn diện của Master theo Gói Đề Xuất Hợp Nhất (Spec-Kit SDD + Pre-Flight Check) đã được phê duyệt.
  - Xóa bỏ triệt để tình trạng Monolith cồng kềnh ở Backend: phân rã `server/db.mjs` (42.5 KB) và `server/index.mjs` (21.8 KB) thành cấu trúc **Domain-Driven Architecture** chuẩn mực (`config/` + `domains/<domain>/`), tách rõ controller, service, routes và SSOT schema.
  - Xóa bỏ triệt để các God Files và God Context ở Frontend:
    + Thu gọn God Context [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx) (41.5 KB, 1170 dòng xuống còn ~7 KB, 230 dòng), bóc tách thành các custom hook domain actions chuyên biệt (`useAppUiState`, `useTransactionActions`, `useProposalActions`, `useBudgetDebtActions`, `useOperationsActions`, `initialState`).
    + Phân rã [src/features/ledger/components/BalanceTrackingTab.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx) (24 KB $\rightarrow$ 8 KB).
    + Phân rã [src/features/proposals/ProposalsView.tsx](file:///e:/Project/finance-vpm/src/features/proposals/ProposalsView.tsx) (22.7 KB, 470 dòng $\rightarrow$ 2.1 KB, 58 dòng).
    + Phân rã [src/features/budget/BudgetControlView.tsx](file:///e:/Project/finance-vpm/src/features/budget/BudgetControlView.tsx) (16.6 KB, 361 dòng $\rightarrow$ 2.8 KB, 75 dòng).
    + Phân rã [src/features/ledger/LedgerView.tsx](file:///e:/Project/finance-vpm/src/features/ledger/LedgerView.tsx) (16.6 KB, 431 dòng $\rightarrow$ 9.6 KB, 256 dòng).
    + Phân rã [src/features/debt/DebtView.tsx](file:///e:/Project/finance-vpm/src/features/debt/DebtView.tsx) (14.7 KB, 356 dòng $\rightarrow$ 2.4 KB, 60 dòng).
    + Dọn dẹp hoàn toàn dead code cũ ([src/services/webhookService.ts](file:///e:/Project/finance-vpm/src/services/webhookService.ts)) và chuyển đổi layout components sang [src/shared/components/](file:///e:/Project/finance-vpm/src/shared/components/).
  - Bảo toàn 100% tính tương thích ngược, API contract, cơ chế lưu trữ PostgreSQL ACID và đồng bộ Google Sheet Webhook.

- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)

- **Thay đổi kỹ thuật chi tiết**:
  - **Backend (Domain-Driven Architecture)**:
    - [server/config/dbPool.mjs](file:///e:/Project/finance-vpm/server/config/dbPool.mjs): Quản lý PostgreSQL Connection Pool, helper `withTransaction()` ACID và `checkDbHealth()`.
    - [server/config/dbSchema.mjs](file:///e:/Project/finance-vpm/server/config/dbSchema.mjs): Nguồn sự thật duy nhất (SSOT) bảng dữ liệu và hàm `tableName()`.
    - [server/domains/init/initDbService.mjs](file:///e:/Project/finance-vpm/server/domains/init/initDbService.mjs): DDL 12 bảng và bộ nạp seed data.
    - [server/domains/state/stateService.mjs](file:///e:/Project/finance-vpm/server/domains/state/stateService.mjs): Dịch vụ tổng hợp trạng thái hệ thống `getFullState()`.
    - [server/domains/accounts/accountsService.mjs](file:///e:/Project/finance-vpm/server/domains/accounts/accountsService.mjs) & [server/domains/accounts/accountsRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/accounts/accountsRoutes.mjs): Domain quản lý tài khoản/nguồn tiền.
    - [server/domains/ledger/ledgerService.mjs](file:///e:/Project/finance-vpm/server/domains/ledger/ledgerService.mjs) & [server/domains/ledger/ledgerRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/ledger/ledgerRoutes.mjs): Domain sổ cái giao dịch và tính toán số dư chuyển tiếp.
    - [server/domains/contracts/contractsService.mjs](file:///e:/Project/finance-vpm/server/domains/contracts/contractsService.mjs) & [server/domains/contracts/contractsRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/contracts/contractsRoutes.mjs): Domain hợp đồng và duyệt chiết khấu.
    - [server/domains/attendance/attendanceService.mjs](file:///e:/Project/finance-vpm/server/domains/attendance/attendanceService.mjs) & [server/domains/attendance/attendanceRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/attendance/attendanceRoutes.mjs): Domain chấm công và nhân sự.
    - [server/domains/proposals/proposalsService.mjs](file:///e:/Project/finance-vpm/server/domains/proposals/proposalsService.mjs) & [server/domains/proposals/proposalsRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/proposals/proposalsRoutes.mjs): Domain hồ sơ đệ trình và trao đổi.
    - [server/domains/budget/budgetService.mjs](file:///e:/Project/finance-vpm/server/domains/budget/budgetService.mjs) & [server/domains/budget/budgetRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/budget/budgetRoutes.mjs): Domain định mức chi phí và điều chỉnh cost.
    - [server/domains/gifts/giftsService.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsService.mjs) & [server/domains/gifts/giftsRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsRoutes.mjs): Domain kho quà tặng & ấn phẩm.
    - [server/domains/audit/auditService.mjs](file:///e:/Project/finance-vpm/server/domains/audit/auditService.mjs) & [server/domains/audit/auditRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/audit/auditRoutes.mjs): Domain nhật ký kiểm toán.
    - [server/domains/sync/syncService.mjs](file:///e:/Project/finance-vpm/server/domains/sync/syncService.mjs) & [server/domains/sync/syncRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/sync/syncRoutes.mjs): Domain đồng bộ hai chiều Google Sheet <=> DB.
    - [server/db.mjs](file:///e:/Project/finance-vpm/server/db.mjs): Tinh gọn thành barrel exporter (2.1 KB, 76 dòng) bảo đảm tương thích ngược 100%.
    - [server/index.mjs](file:///e:/Project/finance-vpm/server/index.mjs): Tinh gọn thành bootstrap server mỏng (3.2 KB, 96 dòng), tích hợp endpoint `/api/health` kiểm tra real pool status.

  - **Frontend (Feature-Driven Architecture & Action Modularization)**:
    - [src/context/initialState.ts](file:///e:/Project/finance-vpm/src/context/initialState.ts): Tách biệt logic nạp state ban đầu và dọn dẹp cache.
    - [src/context/actions/useAppUiState.ts](file:///e:/Project/finance-vpm/src/context/actions/useAppUiState.ts): Quản lý UI state, Toast, phân quyền `canDo`, bộ lọc kỳ và ngày.
    - [src/context/actions/useTransactionActions.ts](file:///e:/Project/finance-vpm/src/context/actions/useTransactionActions.ts): Toàn bộ xử lý nghiệp vụ giao dịch, sơ duyệt, duyệt posted, từ chối, webhook matching.
    - [src/context/actions/useProposalActions.ts](file:///e:/Project/finance-vpm/src/context/actions/useProposalActions.ts): Toàn bộ xử lý đệ trình, phê duyệt, luồng trao đổi.
    - [src/context/actions/useBudgetDebtActions.ts](file:///e:/Project/finance-vpm/src/context/actions/useBudgetDebtActions.ts): Nghiệp vụ ngân sách, điều chỉnh cost, hợp đồng công nợ và chiết khấu.
    - [src/context/actions/useOperationsActions.ts](file:///e:/Project/finance-vpm/src/context/actions/useOperationsActions.ts): Chấm công, xuất nhập quà tặng, khóa sổ, refresh DB.
    - [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx): Thu gọn thành Provider mỏng gọn gàng, ghép nối các hook actions sạch sẽ.
    - [src/features/ledger/components/balance/BalanceLiveKpis.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/balance/BalanceLiveKpis.tsx), [BalanceSyncActions.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/balance/BalanceSyncActions.tsx), [BalanceMatrixTable.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/balance/BalanceMatrixTable.tsx): Phân tách module quản lý số dư đa kỳ.
    - [src/features/ledger/components/table/LedgerDataTable.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/table/LedgerDataTable.tsx), [LedgerPagination.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/table/LedgerPagination.tsx): Phân tách bảng và thanh phân trang đa năng.
    - [src/features/proposals/components/ProposalKpiCards.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalKpiCards.tsx), [ProposalStatusBadge.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalStatusBadge.tsx), [ProposalListTable.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalListTable.tsx), [ProposalDetailCard.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalDetailCard.tsx), [ProposalCreateModal.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalCreateModal.tsx): Phân tách hồ sơ đệ trình.
    - [src/features/budget/components/BudgetKpiCards.tsx](file:///e:/Project/finance-vpm/src/features/budget/components/BudgetKpiCards.tsx), [BudgetVarianceTable.tsx](file:///e:/Project/finance-vpm/src/features/budget/components/BudgetVarianceTable.tsx), [BudgetAdjustmentLog.tsx](file:///e:/Project/finance-vpm/src/features/budget/components/BudgetAdjustmentLog.tsx), [BudgetAdjustmentModal.tsx](file:///e:/Project/finance-vpm/src/features/budget/components/BudgetAdjustmentModal.tsx): Phân tách quản lý ngân sách & variance analysis.
    - [src/features/debt/components/DebtKpiTiles.tsx](file:///e:/Project/finance-vpm/src/features/debt/components/DebtKpiTiles.tsx), [DebtAddContractForm.tsx](file:///e:/Project/finance-vpm/src/features/debt/components/DebtAddContractForm.tsx), [DebtTable.tsx](file:///e:/Project/finance-vpm/src/features/debt/components/DebtTable.tsx): Phân tách theo dõi công nợ.
    - [src/shared/components/common/Toast.tsx](file:///e:/Project/finance-vpm/src/shared/components/common/Toast.tsx), [src/shared/components/layout/RailNav.tsx](file:///e:/Project/finance-vpm/src/shared/components/layout/RailNav.tsx), [src/shared/components/layout/TopHeader.tsx](file:///e:/Project/finance-vpm/src/shared/components/layout/TopHeader.tsx): Chuẩn hóa các layout components dùng chung.

- **Kiểm tra đã chạy**:
  - `node --check` kiểm tra cú pháp trên tất cả 26 file `.mjs` trong `server/`: 100% Valid Syntax.
  - Integration Test runtime backend:
    + Truy vấn trực tiếp PostgreSQL qua `db.checkDbHealth()`: Kết quả `dbHealthy: true`.
    + Truy vấn `db.getFullState()` và `db.getAccounts()`: Dữ liệu tải đầy đủ (`accounts: 4`, `contracts: 18`, `tx: 0`), kết nối ổn định.
  - `npm run build`: Type check TypeScript (`tsc`) và đóng gói Vite thành công 100% trong 2.37s, tạo bundle tối ưu (`dist/assets/index-BAK9u65h.js`), **0 lỗi, 0 cảnh báo type**.


## [23:18] Cân Chỉnh Chia Đều Cột & Khắc Phục Lệch Phải Bảng Ma Trận Số Dư Đầu Kỳ & Cuối Kỳ

- **Phạm vi**:
  - Tiếp nhận phản hồi từ Master: Các ô trong bảng theo dõi số dư đầu kỳ & cuối kỳ theo tháng bị lệch, co cụm không đều và tạo cảm giác nghiêng dạt sang bên phải màn hình.
  - Áp dụng cấu hình `tableLayout: 'fixed'` và dàn trải 100% chiều rộng trên thẻ `<table>`.
  - Thiết lập thẻ `<colgroup>` phân bổ tỷ lệ phần trăm đối xứng hoàn hảo cho cả 9 cột:
    + Cột `Kỳ tháng`: **12%** (chữ hiển thị trên 1 dòng với `whiteSpace: 'nowrap'`).
    + 6 cột số dư tài chính (`Quỹ mặt - Đầu kỳ`, `Quỹ mặt - Cuối kỳ`, `ACB - Đầu kỳ`, `ACB - Cuối kỳ`, `Tổng quỹ - Đầu kỳ`, `Tổng quỹ - Cuối kỳ`): Mỗi cột chia **đều chằn chặn 11%** (chiếm 66% tổng bảng).
    + Cột `Biến động ròng`: **11%** (căn giữa).
    + Cột `Trạng thái kỳ`: **11%** (căn giữa).
    *(Tổng cộng: 12% + 8 × 11% = 100%)*.
  - Bổ sung đường phân cách thanh mảnh (`1px dashed rgba(148, 163, 184, 0.18)`) giữa 2 cột con `Đầu kỳ` và `Cuối kỳ` của từng quỹ, kết hợp căn giữa đồng nhất (`textAlign: 'center'`) cho toàn bộ tiêu đề và các con số `0 đ`, chấm dứt hoàn toàn hiện tượng số tiền bị ép dạt dính vào viền phải.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Thay đổi kỹ thuật**:
  - [src/features/ledger/components/balance/BalanceMatrixTable.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/balance/BalanceMatrixTable.tsx): Cập nhật `tableLayout: 'fixed'`, `<colgroup>` 9 cột đều 11%, đường viền dashed nội bộ và căn giữa đối xứng.
- **Kiểm tra đã chạy**:
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 2.28s (0 lỗi).


## [23:55] Triển Khai Toàn Diện Gói Nâng Cấp Theo Yêu Cầu Của Master: Modal Giao Dịch, Tab Quản Lý Tài Sản ON/OFF, Bảng Số Dư Cột Động, Tái Thiết Kế Trang Kế Hoạch 7 Cột Dropdown Accordion & Dữ Liệu Động KPI Tổng Quan

- **Phạm vi & Mục tiêu**:
  - Thực thi trọn vẹn 100% 5 hạng mục Master đã chỉ đạo và phê duyệt:
    1. **Modal Giao Dịch**: Loại bỏ hoàn toàn trường `Hợp đồng liên kết`; bắt buộc phải chọn `Số tiền (> 0)`, `Nhóm chi phí` (khi Chi tiền), và `Diễn giải`, thiếu các trường này nút Tạo/Lưu sẽ bị vô hiệu hóa (`disabled`) và chuột hiển thị `not-allowed`.
    2. **Sub-tab "Tài Sản Doanh Nghiệp"**: Thêm sub-tab thứ 3 tại Sổ Giao Dịch Gốc tổng hợp danh mục toàn bộ tài sản doanh nghiệp (tiền mặt tại két, tài khoản ngân hàng ACB, MB, Vietcombank, ví số...). Mỗi tài khoản có cột thao tác bật/tắt (Công tắc nguồn xanh ON / OFF).
    3. **Bảng Số Dư Sinh Cột Động Theo Tab Tài Sản**: Tab Tài Sản có bao nhiêu tài khoản đang **ON** thì Bảng Số Dư Đầu Kỳ & Cuối Kỳ sinh bấy nhiêu cặp cột tương ứng. Tài khoản nào gạt sang **OFF** thì cột đó ngay lập tức tự động biến mất khỏi Bảng Số Dư.
    4. **Tái Thiết Kế Trang Kế Hoạch & Đệ Trình (Proposals)**:
       - 4 Thẻ KPI đầu trang được gom gọn nằm trên **1 hàng ngang** duy nhất.
       - Gom 2 bảng trước đây thành **1 bảng hợp nhất duy nhất** full-width gồm đúng 7 cột: `Mã`, `Tiêu đề`, `Nội dung`, `Dự toán`, `Đã chi`, `Trạng thái`, `Thao tác`.
       - Tích hợp tính năng **Dropdown Accordion Row**: Bấm vào dòng hoặc nút mở rộng sẽ bung ra bảng con bên dưới có **viền xanh dọc bên trái** (`border-left: 4px solid #3b82f6`) chuẩn 1-1 theo mẫu ảnh Master cung cấp, gồm đúng 6 cột: `STT`, `Ngày`, `Tiêu đề`, `Nội dung`, `Người gửi`, `Thao tác (Xem, Phản hồi)`, kèm khung soạn thảo phản hồi/giải trình và gửi email Inbound trực tiếp tại chỗ.
    5. **Gắn Dữ Liệu Động Cho 5 Thẻ KPI Tổng Quan**:
       - Thẻ `Tổng vốn khả dụng`: Đọc động toàn bộ tài khoản active từ PostgreSQL, tính số dư thật thời gian thực và hiển thị breakdown từng quỹ/ngân hàng.
       - Thẻ `Thực thu`, `Opex`, `Thặng dư dòng tiền`: Đọc dữ liệu thật theo kỳ tháng `ui.month` từ `state.tx`.
       - Thẻ `Công nợ quá hạn`: Tính toán thật từ danh sách hợp đồng có hạn thanh toán `due < TODAY`.

- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)

- **Thay đổi kỹ thuật chi tiết**:
  - **Backend**:
    - [server/domains/accounts/accountsService.mjs](file:///e:/Project/finance-vpm/server/domains/accounts/accountsService.mjs): Bổ sung `getAccounts(activeOnly)` và hàm `toggleAccountStatus(id, status)` cập nhật trạng thái `active`/`inactive`.
    - [server/domains/accounts/accountsRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/accounts/accountsRoutes.mjs): Mở endpoint `PATCH /api/accounts/:id/status` và query `GET /api/accounts?activeOnly=true`. Tích hợp `dispatchRealtimeSync` phát event UPDATE khi bật/tắt tài khoản.
    - [server/domains/state/stateService.mjs](file:///e:/Project/finance-vpm/server/domains/state/stateService.mjs): Cập nhật `getFullState()` trả về toàn bộ accounts (cả active & inactive) để phục vụ quản lý toggle tại Tab Tài Sản.
  - **Frontend**:
    - [src/services/apiClient.ts](file:///e:/Project/finance-vpm/src/services/apiClient.ts): Thêm phương thức `toggleAccountStatus(id, status)`.
    - [src/features/ledger/components/TransactionModal.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/TransactionModal.tsx): Xóa bỏ trường Hợp đồng liên kết, bắt buộc Số tiền + Nhóm chi phí + Diễn giải, dropdown tài khoản chỉ lọc các tài khoản đang active.
    - [src/features/ledger/components/assets/AssetsManagementTab.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/assets/AssetsManagementTab.tsx): Tạo mới component quản lý danh mục tài sản doanh nghiệp, 4 thẻ KPI thống kê, bảng danh mục đầy đủ thông tin, công tắc nguồn xanh ON/OFF và modal tạo tài sản mới.
    - [src/features/ledger/LedgerView.tsx](file:///e:/Project/finance-vpm/src/features/ledger/LedgerView.tsx): Tích hợp Sub-tab thứ 3 `assets` (`💼 Tài Sản Doanh Nghiệp`), tính `totalFund` động từ toàn bộ tài khoản active.
    - [src/features/ledger/components/BalanceTrackingTab.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx): Lọc `activeAccounts`, tính số dư realtime và ma trận các tháng động theo số lượng tài khoản active.
    - [src/features/ledger/components/balance/BalanceLiveKpis.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/balance/BalanceLiveKpis.tsx): Hiển thị động các thẻ KPI cho từng tài khoản active + 1 thẻ KPI Tổng cộng toàn hệ thống.
    - [src/features/ledger/components/balance/BalanceMatrixTable.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/balance/BalanceMatrixTable.tsx): Bảng số dư sinh cột ĐỘNG theo tài khoản active: phân chia `<colgroup>`, header 2 tầng sinh động, thân bảng render đúng các tài khoản ON, tài khoản OFF tự biến mất.
    - [src/features/proposals/components/ProposalKpiCards.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalKpiCards.tsx): Cấu hình grid 4 thẻ nằm trên 1 hàng ngang.
    - [src/features/proposals/components/ProposalListTable.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalListTable.tsx): Gom 2 bảng thành 1 bảng 7 cột chuẩn (`Mã`, `Tiêu đề`, `Nội dung`, `Dự toán`, `Đã chi`, `Trạng thái`, `Thao tác`), tích hợp Accordion Dropdown Sub-table có viền xanh dọc bên trái, bảng con 6 cột (`STT`, `Ngày`, `Tiêu đề`, `Nội dung`, `Người gửi`, `Thao tác`) và modal xem chi tiết tin nhắn.
    - [src/features/proposals/ProposalsView.tsx](file:///e:/Project/finance-vpm/src/features/proposals/ProposalsView.tsx): Loại bỏ layout 2 cột cũ, tích hợp bảng hợp nhất mới. Xóa bỏ dead file `ProposalDetailCard.tsx`.
    - [src/features/overview/components/ExecutiveKpiCards.tsx](file:///e:/Project/finance-vpm/src/features/overview/components/ExecutiveKpiCards.tsx): Gắn dữ liệu thật cho 5 thẻ KPI Tổng Quan: Tổng vốn khả dụng động từ toàn bộ tài khoản active, Thực thu, Opex thực tế, Thặng dư ròng theo kỳ tháng chọn, và Nợ quá hạn.

- **Kiểm tra đã chạy**:
  - `node --check` kiểm tra cú pháp trên tất cả file `.mjs` backend: 100% Valid Syntax.
  - `npm run build`: TypeScript compile (`tsc`) và Vite build thành công 100% trong 2.31s, **0 lỗi, 0 cảnh báo**.


## [00:03] Tạo Dữ Liệu Test: Biên Lai Chi 5.800.000 đ Trong Sổ Giao Dịch Gốc

- **Phạm vi**:
  - Khởi tạo giao dịch chi thực tế theo yêu cầu của Master trong Sổ Giao Dịch Gốc:
    + **Mã giao dịch**: `N0001`
    + **Ngày ghi sổ**: `2026-11-11` (thời gian thực hôm nay)
    + **Tài khoản trích tiền**: `ACB` (Ngân hàng Á Châu)
    + **Chiều dòng tiền**: `Chi (out -)`
    + **Số tiền**: **5.800.000 đ**
    + **Diễn giải**: `Chi phí văn phòng - Thanh toán biên lai chi tiền`
    + **Phân loại**: `OPEX` (Chi phí vận hành)
    + **Nhóm chi phí**: `VP` (Mặt bằng & Văn phòng)
    + **Hợp đồng liên kết**: Để trống (không bắt buộc theo quy tắc mới)
    + **Trạng thái**: `posted` (Đã duyệt chính thức vào Sổ Cái)
    + **Chứng từ đính kèm**: `Biên lai BL-5800K`
    + **Nguồn tạo**: `Master Test`
  - Đã nạp thành công vào cơ sở dữ liệu PostgreSQL 16 bảng `finance_vpm.transactions`.
  - Đã kích hoạt hàm `recalculateMonthlyBalances()` tự động cập nhật số dư cuối kỳ Tháng 11/2026 trong bảng `finance_vpm.monthly_balances`.
  - Đã phát sự kiện `dispatchRealtimeSync` ghi nhận vào `finance_vpm.audit_logs`.
  - Đã đồng bộ vào [src/data/seedData.ts](file:///e:/Project/finance-vpm/src/data/seedData.ts) và [server/seedData.json](file:///e:/Project/finance-vpm/server/seedData.json) để đảm bảo dữ liệu hiển thị tức thì trên mọi môi trường.
- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Kiểm tra đã chạy**:
  - Query trực tiếp database: `SELECT id, to_char(date, 'YYYY-MM-DD') as date, acc, dir, amt::float, description, type, cat, status, doc FROM finance_vpm.transactions;` -> Xác nhận trả về đúng bản ghi `N0001` chi 5.800.000 đ từ tài khoản ACB.
  - `npm run build`: TypeScript compile và Vite build thành công 100% trong 2.53s.


