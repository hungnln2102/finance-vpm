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

