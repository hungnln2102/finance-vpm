# BÁO CÁO NGHIỆM THU NGÀY 2026-11-12

> **Dự án:** Sổ Quỹ Quản Trị VPM TTNG (`finance-vpm`)  
> **Chủ nhân tối cao:** 👑 **Master (Sếp)**  
> **Master Agent:** 👑 **Orchestrator Agent**  
> **Thời gian:** 2026-11-12 (Múi giờ Asia/Ho_Chi_Minh)  

---

## [00:26] Xử Lý Triệt Để Lỗi Kết Nối Backend (ECONNREFUSED) & Vite Fast Refresh HMR

- **Phạm vi**:
  - Khắc phục lỗi trình duyệt hiển thị *"Không có dữ liệu"* / *"Cục bộ (LocalStorage fallback)"* do lỗi `ECONNREFUSED` trên các endpoint `/api/health`, `/api/state`, `/api/accounts`.
  - Khắc phục triệt để cảnh báo Vite HMR: `Could not Fast Refresh ("AppContext" export is incompatible)`.
  - Thiết lập cơ chế tự phục hồi kết nối (Auto-reconnect & Auto-retry) trên Frontend để tự động đồng bộ dữ liệu PostgreSQL ngay khi Backend online mà không bị kẹt ở LocalStorage rỗng.

- **Nguyên nhân gốc (Root Cause qua dữ liệu thực tế)**:
  1. **Backend Server (cổng 3001) chưa chạy lúc 12:01 - 12:09 AM**: Vite Dev Server cấu hình proxy chuyển tiếp `/api` sang `http://localhost:3001`. Khi tiến trình Node.js chưa chạy, proxy ném lỗi `AggregateError [ECONNREFUSED]`.
  2. **Frontend kẹt ở LocalStorage rỗng**: Khi `apiClient.getState()` trả về `null`, ứng dụng giữ nguyên state ban đầu từ `localStorage` (trước đó người dùng có thể đã bấm xóa hoặc khởi tạo ban đầu có `base.tx = []`).
  3. **Lỗi Vite Fast Refresh Component Export**: File [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx) vừa export React Component (`AppProvider`), vừa export Context Object (`AppContext`). Theo quy chuẩn Vite `@vitejs/plugin-react`, file chứa Component không được export object non-component, dẫn tới Vite HMR invalidate toàn bộ React tree.

- **Giải pháp kỹ thuật đã triển khai**:
  1. **Khởi chạy & Duy trì Backend Server**:
     - Đã chạy tiến trình `node server/index.mjs` trên cổng 3001 kết nối PostgreSQL 16 schema `finance_vpm`.
     - Health check: `http://localhost:3001/api/health` -> HTTP 200 `{ status: "ok", database: "PostgreSQL 16 (Local)", schema: "finance_vpm" }`.
  2. **Sửa dứt điểm Fast Refresh HMR**:
     - Đã tách Context Object và Context Interface sang [src/context/AppContextInstance.ts](file:///e:/Project/finance-vpm/src/context/AppContextInstance.ts).
     - Loại bỏ `export { AppContext }` khỏi [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx), bảo đảm file chỉ export React Components và types. Vite Fast Refresh 100% chuẩn chỉ.
  3. **Thêm cơ chế tự động kết nối lại (Auto-reconnect Polling)**:
     - [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx): Thêm timer tự động fetch lại state sau mỗi 2.5s nếu lần gọi đầu tiên chưa có dữ liệu từ backend. Ngay khi backend online, frontend lập tức nhận state mới nhất từ PostgreSQL.
     - [src/shared/components/layout/RailNav.tsx](file:///e:/Project/finance-vpm/src/shared/components/layout/RailNav.tsx): Thêm timer tự động ping `/api/health` sau mỗi 3s nếu đang ở trạng thái mất kết nối, tự động chuyển chấm xanh `🟢 PostgreSQL 16 (finance_vpm)` khi server sẵn sàng.
  4. **Bảo toàn dữ liệu Fallback**:
     - [src/context/initialState.ts](file:///e:/Project/finance-vpm/src/context/initialState.ts): Gán `base.tx` nạp từ `SEED_DATA.tx` (đã có chứng từ `N0001` chi 5.800.000 đ) thay vì ép về rỗng, bảo đảm mọi kịch bản offline/online đều có dữ liệu test của Master.

- **Các file đã tác động**:
  - [src/context/AppContextInstance.ts](file:///e:/Project/finance-vpm/src/context/AppContextInstance.ts): Tách context instance độc lập.
  - [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx): Pure component export + auto-retry polling.
  - [src/context/useApp.ts](file:///e:/Project/finance-vpm/src/context/useApp.ts): Import context từ `AppContextInstance`.
  - [src/shared/components/layout/RailNav.tsx](file:///e:/Project/finance-vpm/src/shared/components/layout/RailNav.tsx): Auto-retry health ping.
  - [src/context/initialState.ts](file:///e:/Project/finance-vpm/src/context/initialState.ts): Nạp seed tx khi state rỗng.

- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Kiểm tra đã chạy**:
  - `curl http://localhost:5173/api/health`: HTTP 200 OK từ proxy Vite.
  - `curl http://localhost:5173/api/state`: Trả về `data.tx` chứa đúng bản ghi `N0001` (amt: 5.800.000 đ, date: 2026-11-11, acc: ACB, dir: out).
  - `npm run build`: `tsc && vite build` hoàn thành trong 2.62s, **0 lỗi**.


## [00:52] Thiết Kế Lại Hệ Thống Thông Báo (Glassmorphic Toast) & Tối Ưu Tiêu Đề Bảng Số Dư

- **Phạm vi**:
  - Khắc phục lỗi hiển thị thông báo Toast bị đảo ngược màu sắc (chữ trắng trên nền trắng sáng do biến `--ink` trong Dark Mode), icon mất màu do class Tailwind ảo.
  - Tái cấu trúc cơ chế điều khiển thông báo `ToastState`: bổ sung `id: number` và `duration: number`, thiết lập cơ chế hủy/làm mới bộ đếm thời gian (timer reset) độc lập mỗi khi kích hoạt thông báo mới.
  - Bổ sung hiệu ứng Loading Spinner (`Loader2` xoay mượt mà) cho các tác vụ bất đồng bộ (như bấm *Đồng bộ DB → Sheet*, *Chuyển kỳ mới*, *Xóa sổ*).
  - Tích hợp thanh đếm ngược tiến trình thời gian (progress countdown bar) dưới đáy toast.
  - Tối ưu chống chồng chéo tiêu đề cột tài khoản ngân hàng (`white-space: nowrap; text-overflow: ellipsis;` kèm `minWidth: 1050px`) trong Bảng Theo Dõi Số Dư Đầu Kỳ & Cuối Kỳ.

- **Các file đã tác động**:
  - [src/shared/components/common/Toast.tsx](file:///e:/Project/finance-vpm/src/shared/components/common/Toast.tsx): Nâng cấp giao diện Toast cao cấp với Glassmorphism card, badge trạng thái, icon Lucide chuẩn màu sắc, nút đóng và progress bar.
  - [src/index.css](file:///e:/Project/finance-vpm/src/index.css): Thay thế toàn bộ CSS `.app-toast` cũ, dùng nền tối kính mờ `rgba(13, 21, 32, 0.94)` kèm `backdrop-filter: blur(16px)`, dải viền trái phát sáng và animation `toastSlideUp`, `toastCountdown`, `toastSpin`.
  - [src/context/actions/useAppUiState.ts](file:///e:/Project/finance-vpm/src/context/actions/useAppUiState.ts): Quản lý timer qua `useRef`, tự động tính toán thời lượng hiển thị (error 5.5s, loading 12s, thông thường 3.8s) và tự động dọn dẹp khi unmount.
  - [src/context/AppContextInstance.ts](file:///e:/Project/finance-vpm/src/context/AppContextInstance.ts): Cập nhật kiểu `showToast(msg, type, duration)`.
  - [src/features/ledger/components/BalanceTrackingTab.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/BalanceTrackingTab.tsx): Gắn trạng thái `'loading'` cho các tác vụ đồng bộ Google Sheet / chuyển kỳ.
  - [src/features/ledger/components/balance/BalanceMatrixTable.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/balance/BalanceMatrixTable.tsx): Rút gọn tiền tố rườm rà trên header cột tài khoản và chống tràn chữ.

- **Trạng thái nghiệm thu**: ĐÃ HOÀN THÀNH (Accepted)
- **Kiểm tra đã chạy**:
  - `npm run build`: `tsc && vite build` hoàn thành trong **2.42s**, **0 lỗi**.

## [Hiện tại] Mô phỏng giao dịch 5.800.000 và rút gọn bảng Sổ Giao Dịch

- **Phạm vi**: Giữ giao dịch mô phỏng chi 5.800.000 đồng; hiển thị số đã thu/chi và tổng theo dạng `xxxx/yyy`; bỏ cột Mã khỏi bảng.
- **Thay đổi kỹ thuật**:
  - `src/types/index.ts`: bổ sung `paidAmt` và `totalAmt` dạng tùy chọn, tương thích với dữ liệu giao dịch cũ.
  - `src/data/seedData.ts`: giao dịch `N0001` có `paidAmt = 5.800.000` và `totalAmt = 5.800.000`.
  - `src/features/ledger/components/table/LedgerDataTable.tsx`: hiển thị Thu/Chi dạng `đã thực hiện/tổng`, fallback về `amt/amt`; xóa cột Mã và cập nhật `colSpan`.
- **Kiểm tra**: `npm run build` hoàn thành thành công, TypeScript và Vite không báo lỗi.
- **Trạng thái**: Đã hoàn thành ở phạm vi frontend/seed local; chưa xác nhận dữ liệu tương ứng trên môi trường production.

## [Hiện tại] Bổ sung giao dịch mô phỏng vào PostgreSQL local

- **Nguyên nhân**: Frontend nhận `AppState` từ `/api/state`, nên 216 giao dịch trong PostgreSQL ghi đè seed frontend; database chưa có giao dịch tháng 11/2026 và chưa có khoản `5.800.000`.
- **Xử lý**: Gọi API chính thức `POST /api/transactions` để ghi giao dịch `N0001`, ngày `2026-11-12`, tài khoản `ACB`, chiều `out`, số tiền `5.800.000`, trạng thái `posted`.
- **Kiểm tra**: `/api/state` đã trả về giao dịch `N0001` trong tháng 11/2026; sau khi tải lại trang, bảng sẽ có 1 dòng và cột Chi hiển thị `5.800.000/5.800.000`.
- **Phạm vi**: Chỉ dữ liệu PostgreSQL local; chưa phải dữ liệu production.

## [Hiện tại] Đối chiếu số lượng 217 giao dịch khi đồng bộ DB → Sheet

- **Kết quả đối chiếu**: `/api/state` hiện trả về `217` giao dịch, trong đó `216` giao dịch cũ có mã `G0001` đến `G0208` và `1` giao dịch `N0001` trị giá `5.800.000` đồng.
- **Chuỗi sự kiện đã xác nhận qua audit log**: `16:15:21` đồng bộ DB → Sheet; `16:19:36` tạo `N0001`; `16:25:20` đồng bộ DB → Sheet lần tiếp theo. Vì vậy lần đồng bộ sau cùng xuất toàn bộ `217` bản ghi.
- **Nguyên nhân kỹ thuật**: `POST /api/sync/db-to-sheet` gọi `getFullState()` rồi lấy `state.tx.length`; nó không tạo thêm giao dịch. Nút Clear gọi `TRUNCATE ... transactions RESTART IDENTITY CASCADE`, nên nếu Clear thực sự thành công sau cùng thì DB không thể còn 216 giao dịch cũ.
- **Kết luận**: Tại thời điểm kiểm tra, DB chưa ở trạng thái đã clear toàn bộ; hoặc thao tác Clear không hoàn tất, hoặc dữ liệu 216 dòng đã được nạp lại từ Sheet → DB trước lần đồng bộ DB → Sheet. Không có audit event Sheet → DB trong log hiện tại.
- **Trạng thái**: Đã xác định nguyên nhân và không thực hiện thêm thao tác xóa/sync dữ liệu.



## [Hiện tại] Chuẩn hóa nguyên tắc đồng bộ hai chiều PostgreSQL ↔ Google Sheet

- **DB → Sheet khi ghi**: Các route ghi dữ liệu đã chờ `dispatchRealtimeSync` hoàn tất thay vì chạy nền; nếu Webhook Sheet lỗi hoặc chưa cấu hình, API không trả thành công giả.
- **Sheet → DB**: Giao dịch trên Sheet được coi là snapshot import. Hệ thống insert/update dữ liệu có trên Sheet và xóa giao dịch DB không còn trong snapshot, trong cùng transaction PostgreSQL; trả thêm `deletedTx`.
- **DB → Sheet thủ công**: Giữ `syncFullDatabase` là luồng chuẩn hóa toàn bộ dữ liệu PostgreSQL theo schema/cột của Sheet.
- **Clear**: Sau khi PostgreSQL truncate, hệ thống bắt buộc kiểm tra cả kết quả làm sạch Sheet và số dư Sheet trước khi trả thành công.
- **Kiểm tra**: `node --check` cho các module backend đã đạt; `npm run build` đạt; chưa chạy đồng bộ thật để tránh thay đổi dữ liệu hiện tại.
- **Giới hạn ACID**: PostgreSQL và Apps Script là hai hệ thống khác nhau, không có transaction xuyên hệ thống tuyệt đối; API hiện fail-closed ở bước Sheet và cần cơ chế retry/reconcile nếu DB đã commit nhưng Sheet mất kết nối sau đó.


## [Hi?n t?i] ??a ?i?u khi?n ??ng b? to?n h? th?ng l?n Header

- **UI**: Di chuy?n b?n n?t `Sheet ? DB`, `DB ? Sheet`, `Chuy?n k? th?ng` v? `Clear S? G?c` kh?i tab Theo D?i S? D? l?n `TopHeader`, n?n m?i trang ??u nh?n th?y.
- **H?nh vi**: Gi? nguy?n tr?ng th?i loading, x?c nh?n thao t?c, toast l?i/th?nh c?ng v? g?i l?i d? li?u sau c?c thao t?c thay ??i DB.
- **Responsive**: Th?m h?ng header ri?ng cho c?m ??ng b?; m?n h?nh nh? cho ph?p cu?n ngang c?m n?t.
- **Ki?m tra**: `npm run build` th?nh c?ng; kh?ng ch?y ??ng b? th?t v? kh?ng thay ??i d? li?u Sheet/DB trong b??c UI n?y.


## [16:30] Chuyển khu vực tài khoản vào chân menu

- **Phạm vi**: Bỏ thẻ trạng thái PostgreSQL/LocalStorage và nút khôi phục dữ liệu khỏi `RailNav`; bỏ huy hiệu tài khoản khỏi `TopHeader`.
- **Thay đổi**: Thêm khu vực tài khoản cuối rail, menu mở rộng hiển thông tin vai trò và nút `Đăng xuất`; thao tác đăng xuất cập nhật về vai trò mặc định `operator` trong phiên mô phỏng.
- **CSS**: Thêm style cho account panel, menu logout và trạng thái responsive; không còn ẩn khu vực này trên mobile.
- **Kiểm tra**: `npm run build` thành công; không thực hiện thao tác Sheet/DB hay xóa dữ liệu.

## [21:22] Build lại dự án theo yêu cầu

- **Bối cảnh**: Kiểm tra và thực thi build lại toàn bộ dự án (`npm run build`).
- **Sự cố phát hiện & xử lý**: Môi trường ban đầu thiếu các devDependencies (`tsc`, `vite`) trong `node_modules` do trước đó chưa được cài đặt đầy đủ. Đã tiến hành chạy `npm install` bổ sung.
- **Kết quả Build**:
  - TypeScript (`tsc`): Biên dịch thành công 0 lỗi.
  - Vite (`vite build`): Đóng gói hoàn tất trong 2.42s vào thư mục `dist/` (`dist/index.html`, `dist/assets/style-D2mOOIS_.css`, `dist/assets/index-BSVZy2ci.js`).
- **Trạng thái**: Build thành công 100%, không có thay đổi mã nguồn.

## [22:12] Triển khai Dropdown Biên Lai tại Sổ Giao Dịch & Khớp Nối 1 Kế Hoạch - Nhiều Giao Dịch Chi

- **Phạm vi & Yêu cầu của Master**:
  1. Hỗ trợ dropdown (accordion expand row) trên từng dòng Sổ Giao Dịch để xem danh sách chi tiết các biên lai/chứng từ đính kèm với log đó.
  2. Xây dựng luồng match chuẩn xác giữa Kế hoạch được duyệt và Sổ Giao Dịch, giải quyết bài toán thực tế: 1 Kế hoạch có nhiều đợt chi/nhiều phân loại chi phí/nhiều biên lai khác nhau.
- **Thay đổi Backend & Database**:
  - `initDbService.mjs`: Bổ sung cột `proposal_id VARCHAR(32) DEFAULT ''` và `receipts JSONB DEFAULT '[]'::jsonb`, tạo index `idx_tx_proposal`.
  - `ledgerService.mjs` & `stateService.mjs`: Cập nhật `insertTransaction`, `updateTransaction` và `getFullState` để lưu/trả về `proposalId` và `receipts`.
  - CSDL PostgreSQL: Đã áp dụng migration an toàn và gán liên kết cho bản ghi mẫu `N0001` (khớp với Kế hoạch `PROP-02` / `KH-2026-10-02` và biên lai `BL-5800K`).
- **Thay đổi Frontend UI/UX**:
  - `src/types/index.ts`: Bổ sung interface `TransactionReceipt` và các trường `proposalId?: string`, `receipts?: TransactionReceipt[]`.
  - `LedgerDataTable.tsx`: Thêm nút toggle mũi tên và thẻ biên lai; khi bấm vào dòng sẽ xổ xuống sub-table hiển thị đầy đủ: Mã biên lai, Ngày chứng từ, Đơn vị thụ hưởng/Nhà cung cấp, Nội dung chi tiết, Số tiền và nút xem chứng từ, kèm huy hiệu Kế hoạch liên kết.
  - `TransactionModal.tsx`: Bổ sung ô chọn Kế hoạch đã duyệt (hiển thị dự toán và số dư còn lại của kế hoạch) khi tạo khoản Chi; bổ sung ô nhập mã biên lai và đơn vị thụ hưởng.
  - `ProposalListTable.tsx`: Bổ sung tab con "Các đợt chi giải ngân" bên cạnh "Nhật ký trao đổi", hiển thị bảng thống kê tiến độ giải ngân (Dự toán duyệt vs Đã chi vs Còn lại) và chi tiết từng giao dịch chi thực tế.
- **Kiểm thử**:
  - `node --check` syntax backend đạt 100%.
  - `npm run build` thành công trong 2.35s, 0 lỗi TypeScript.

## [22:58] Triển khai Luồng Chưa Liệt Kê (Trừ Tiền Tài Sản Tức Thì & Khớp Nguồn Tiền) + Ẩn Input Phản Hồi Kế Hoạch

- **Phạm vi & Yêu cầu của Master**:
  1. Khi có Webhook ngân hàng hoặc biên lai trả về, mặc định **trừ tiền (hoặc cộng tiền) vào Tài sản ngay lập tức** để phản ánh đúng số dư thực tế, đồng thời đưa vào tab **"Chưa liệt kê"** do chưa xác định được mục đích chi/thu.
  2. Trong phần **"Chưa liệt kê"**, phải có nơi để chọn khớp trực tiếp với **Kế hoạch đã duyệt** HOẶC **Chi phí khác (OPEX)** để làm rõ nguồn tiền đi đâu hoặc từ đâu.
  3. Tại bảng trao đổi của **Kế hoạch & Đệ trình**, ẩn mặc định ô nhập phản hồi ở đáy bảng, chỉ hiện ra khi người dùng bấm nút **"Phản hồi"** trên một tin nhắn.

- **Các file đã cập nhật**:
  - [src/types/index.ts](file:///e:/Project/finance-vpm/src/types/index.ts): Mở rộng `UIState['ledgerFilter']` hỗ trợ tab `'unlisted'`.
  - [src/context/actions/useTransactionActions.ts](file:///e:/Project/finance-vpm/src/context/actions/useTransactionActions.ts): Cập nhật `simulateWebhook` để tạo ngay giao dịch thực tế trong `state.tx` & PostgreSQL khi có webhook/biên lai mới không khớp giao dịch cũ (trừ/cộng tiền tài sản tức thì và gắn cờ `flags: ['unlisted']`).
  - [src/features/ledger/LedgerView.tsx](file:///e:/Project/finance-vpm/src/features/ledger/LedgerView.tsx): Thêm tab `⚡ Chưa liệt kê (N)` ở vị trí đầu tiên trên thanh lọc, nút `+ Webhook / Biên lai về` để test trực tiếp, và truyền hàm `updateTransaction` xuống bảng.
  - [src/features/ledger/components/table/LedgerDataTable.tsx](file:///e:/Project/finance-vpm/src/features/ledger/components/table/LedgerDataTable.tsx): Thêm huy hiệu `Chưa liệt kê`, nút `⚡ Khớp nguồn` và panel mở rộng trực quan cho phép chọn **Khớp Kế hoạch đã duyệt** hoặc **Chi phí khác (OPEX)** (với tiền vào hỗ trợ gán Hợp đồng). Sau khi xác nhận, giao dịch được giải trình nguồn tiền và tự động rời khỏi tab Chưa liệt kê (số dư tài sản giữ nguyên).
  - [src/features/proposals/components/ProposalListTable.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalListTable.tsx): Bổ sung state `activeReplyProposalId`, ẩn mặc định khung phản hồi và chỉ hiển thị kèm auto-focus `@sender:` khi bấm nút `Phản hồi` (có nút `Hủy` và tự đóng sau khi gửi).

- **Kiểm tra đã chạy**:
  - `npm run build`: `tsc && vite build` biên dịch thành công 100% trong **2.42s**, **0 lỗi TypeScript**, đóng gói hoàn tất vào `dist/`.

## [23:14] Loại Bỏ Khung Dropdown Mở Rộng Con Khỏi Bảng Kế Hoạch & Đệ Trình

- **Yêu cầu của Master**: Loại bỏ hoàn toàn khối nội dung dropdown mở rộng (gồm thanh tiêu đề `Hồ Sơ Kế Hoạch`, 2 tab `Các đợt chi giải ngân` / `Nhật ký trao đổi`, bảng trao đổi và form phản hồi) trong bảng Kế Hoạch & Đệ Trình theo đúng ảnh chụp màn hình Master khoanh đỏ.
- **Thay đổi kỹ thuật**:
  - [src/features/proposals/components/ProposalListTable.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalListTable.tsx):
    - Loại bỏ hoàn toàn `expandedRowId`, khối `isExpanded && (<tr>...</tr>)`, các tab con `subTabMap`, và khung nhập trao đổi.
    - Loại bỏ nút mũi tên Chevron toggle ở cột Mã kế hoạch và nút `0 đợt chi · 3 chat` ở cột Thao tác.
    - Chuẩn hóa bảng 7 cột phẳng, sạch sẽ, chuyên nghiệp: Mã kế hoạch, Tiêu đề, Nội dung, Dự toán, Đã chi, Trạng thái và Thao tác phê duyệt (Sơ duyệt/Duyệt/Từ chối).
- **Kiểm tra đã chạy**:
  - `npm run build`: `tsc && vite build` thành công trong **2.35s**, **0 lỗi TypeScript**, kích thước bundle giảm về 858kB.

## [23:40] Khôi Phục Dropdown Thuần Túy Xem Danh Sách Biên Lai Khớp Kế Hoạch & Khởi Động Lại Backend API

- **Yêu cầu của Master**: Không hiển thị phần Nhật ký trao đổi/chat rườm rà, nhưng **vẫn giữ dropdown mở rộng** dưới từng dòng Kế hoạch để xem danh sách các biên lai được match với kế hoạch đó.
- **Root Cause (Phát hiện qua kiểm tra dữ liệu thực tế)**:
  - Phát hiện tiến trình Node backend cũ (`PID 18628`) chưa được khởi động lại sau khi cập nhật `stateService.mjs`, dẫn tới API `/api/state` trả về giao dịch `N0001` bị thiếu `proposalId` và `receipts`, khiến cột Đã chi trên màn hình Kế hoạch hiển thị `0 đ` dù trong PostgreSQL cột `proposal_id` đã là `'PROP-02'`.
- **Thay đổi kỹ thuật & Hạ tầng**:
  - [src/features/proposals/components/ProposalListTable.tsx](file:///e:/Project/finance-vpm/src/features/proposals/components/ProposalListTable.tsx):
    - Thiết kế lại dropdown thuần túy chuyên biệt cho đối soát biên lai: bấm nút mũi tên Chevron hoặc nút `N biên lai` để mở bảng **Các Biên Lai Đã Khớp Với Kế Hoạch**.
    - Hiển thị đầy đủ: Thanh tóm tắt (Dự toán vs Đã giải ngân vs Còn lại) và bảng chi tiết từng biên lai (STT, Mã biên lai, Ngày chi, Tài khoản, Log Sổ cái, Đơn vị thụ hưởng/NCC, Nội dung chi phí, Số tiền, Trạng thái).
    - Loại bỏ hoàn toàn phần tab `Nhật ký trao đổi` và form chat/email rườm rà.
  - **Backend Server Restart**: Đã dừng tiến trình Node cũ (`PID 18628`) và khởi động lại `node server/index.mjs`.
- **Kiểm tra đã chạy**:
  - `npm run build`: `tsc && vite build` biên dịch thành công trong **2.39s**, **0 lỗi**.
  - Kiểm chứng trực tiếp `GET http://localhost:3001/api/state`: `N0001` đã trả về chính xác `proposalId: 'PROP-02'`, `amt: 5800000` và `receipts: [{ code: 'BL-5800K', vendor: 'Nhà in Á Châu & Quà tặng VPM', ... }]`.



