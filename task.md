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
