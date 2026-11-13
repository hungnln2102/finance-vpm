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
