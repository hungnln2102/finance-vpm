# Checklist

- [x] Bổ sung dữ liệu mô phỏng giao dịch chi 5.800.000 đồng với số đã chi/tổng số chi.
- [x] Hiển thị cột Thu/Chi theo dạng `đã thu hoặc chi/tổng`.
- [x] Loại bỏ cột Mã khỏi bảng Sổ Giao Dịch.
- [x] Chạy `npm run build` thành công.
- [x] Ghi giao dịch mô phỏng vào PostgreSQL local để màn hình đang kết nối backend hiển thị dữ liệu.
- [x] Đối chiếu nguyên nhân số lượng giao dịch DB → Sheet tăng lên 217.

- [x] Chuyển realtime ghi DB → Sheet sang chờ kết quả Sheet trước khi trả thành công.
- [x] Chuyển Sheet → DB thành import snapshot giao dịch, xóa bản ghi DB không còn trong Sheet trong cùng transaction.
- [x] Giữ PostgreSQL → Sheet là luồng chuẩn hóa/ghi đè toàn bộ dữ liệu qua `syncFullDatabase`.

- [x] ??a c?m ??ng b? to?n h? th?ng l?n header d?ng chung cho m?i trang.

- [x] Bỏ ô thông báo trạng thái góc trái và chuyển huy hiệu tài khoản xuống chân thanh menu.
- [x] Thêm menu tài khoản mở rộng với nút Đăng xuất, không dùng thao tác xóa dữ liệu.
- [x] Kiểm tra responsive và `npm run build` sau thay đổi giao diện.

- [x] Cho phép nhập và lưu diễn giải tùy biến bắt buộc cho nguồn thu "Thu khác" trong `LedgerDataTable.tsx`.
- [x] Tinh gọn cột "Diễn giải & Chứng từ": gom cảnh báo, bỏ tag kế hoạch/trạng thái lặp và chuyển mã kế hoạch sang cột Phân loại.
- [x] Chạy `npm run build` thành công sau thay đổi giao diện và logic.

- [x] Tách luồng tạo danh mục cost khỏi phiếu điều chỉnh định mức; form tạo cost gồm mã, tên danh mục và số tiền.

- [x] Hiển thị nút phê duyệt hoặc từ chối trong cột thao tác của kế hoạch theo đúng trạng thái và quyền duyệt.

- [x] Thay role mô phỏng bằng đăng nhập bắt buộc, session server-side và tài khoản Master PostgreSQL.

- [x] Bỏ nút số lượng biên lai; mở danh sách biên lai bằng click dòng kế hoạch hoặc chevron.

- [x] Tạo tài khoản quản trị PostgreSQL `admin` theo yêu cầu; lưu mật khẩu dưới dạng hash `scrypt` và xác minh đăng nhập thành công.
- [x] Chuẩn hóa dữ liệu cost: tạo bảng `cost_categories` và `cost_budgets`, chuyển định mức khỏi `app_metadata.budget`, xóa seed/hard-code và xác minh PostgreSQL.
- [x] Luôn hiển thị nút xổ hóa đơn tại mỗi dòng Công nợ; panel hiển thị số hóa đơn/hợp đồng, ngày ký, hạn thanh toán, giá trị phải thu/chi và các giao dịch đã khớp.
- [x] Xác minh trực tiếp trên `KH01` qua trình duyệt và chạy `npx tsc --noEmit`, `npm run build`, `git diff --check` thành công.
- [x] Thêm form tạo hóa đơn ngay trong dropdown Công nợ; hóa đơn mới dùng cùng khách/tư vấn nhưng có số HĐ, giá trị và hạn thanh toán độc lập.
- [x] Nâng cấp trang Quà & Ấn Phẩm (`GiftsView.tsx`): tách `GiftItemCard.tsx` hiển thị 3 chỉ số Nhập - Xuất - Tồn, `GiftDetailModal.tsx` xem lịch sử riêng từng vật phẩm khi click thẻ, và `GiftMovementModal.tsx` mở form tạo phiếu xuất/nhập qua nút bấm.
- [x] Chuẩn hóa lưu trữ 100% sản phẩm và phiếu xuất/nhập kho vào PostgreSQL (`finance_vpm.gift_items`, `finance_vpm.gift_movements`), bỏ lưu dữ liệu thô trong `localStorage`, và bổ sung nút `+ Tạo sản phẩm` kèm `GiftCreateItemModal.tsx` ngay phía trên lưới thẻ vật phẩm.
- [x] Bổ sung cụm 3 tab phân loại sản phẩm (`Tất cả`, `Còn hàng`, `Hết hàng`) kèm bộ đếm số lượng realtime tại thanh công cụ phía trên lưới thẻ vật phẩm trong `GiftsView.tsx`.
- [x] Tái thiết kế toàn diện trang Báo cáo tháng (`ReportView.tsx`): phân rã thành 4 components (`ReportKpiCards`, `ReportAccountBalanceTable`, `ReportOpexVsBudgetCard`, `ReportCashflowBreakdown`), đối soát toàn bộ tài khoản PostgreSQL và hiển thị độ lệch âm chuẩn quy tắc ngân sách.
- [x] Gỡ bỏ tab `Báo cáo tháng` trùng lặp trên thanh menu (`RailNav.tsx`) và hợp nhất toàn bộ các bảng nghiệp vụ báo cáo tháng (`ReportAccountBalanceTable`, `ReportOpexVsBudgetCard`, `ReportCashflowBreakdown`) trực tiếp vào trang `Tổng quan` (`OverviewView.tsx`).
- [x] Sửa trang Chấm Công & Lương: chuẩn hóa state nhân sự/chấm công theo `staffId`, lưu chấm công đơn và hàng loạt vào PostgreSQL, lưu tạm ứng, và hiển thị tháng động.
- [x] Cấu hình `npm run dev` chạy trực tiếp `src/` qua Vite và tự reload backend bằng `node --watch`, không cần build `dist` trước khi kiểm tra.
- [x] Thiết kế và triển khai DB Chấm Công & Lương chuẩn hóa: `attendance_periods`, `attendance_holidays`, `attendance_entries`, `payroll_records`; backfill dữ liệu cũ và chuyển runtime sang bảng mới.
- [x] Khắc phục lưu chấm công báo lỗi giả khi đồng bộ Google Sheet lỗi: giữ PostgreSQL là kết quả lưu thành công và chỉ ghi cảnh báo đồng bộ.
- [x] Chuẩn hóa dữ liệu nhân sự, chấm công log và phúc lợi: thêm phòng ban/ngày nhận việc; ghi `attendance_logs`; cập nhật `staff_benefits` khi làm Lễ/Chủ nhật trong cùng transaction.
- [x] Cấu hình Vercel Serverless (`vercel.json`, `api/index.mjs`, `server/index.mjs`), tương thích Vercel Postgres / Neon (`server/config/dbPool.mjs`), cập nhật `.env` & `.env.example`, và push lên GitHub `origin/main`.
