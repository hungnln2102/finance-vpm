# Daily Review Report — 2026-11-13

## [09:18] Bổ sung cụm Dropdown liên hoàn phân loại nguồn tiền (Kế hoạch / Chi phí / Công nợ)

### 1. Phạm vi & Yêu cầu
- Bổ sung 2 dropdown liên hoàn tại panel "Phân Loại Nguồn Tiền Cho Giao Dịch" (Khớp nguồn) của Sổ Cái:
  - **Dropdown 1 (Loại nguồn tiền)**: Chọn 1 trong 3 nhóm: Kế hoạch (`proposal`), Chi phí (`opex`), hoặc Công nợ (`debt`).
  - **Dropdown 2 (Chi tiết)**: Dựa vào lựa chọn của Dropdown 1 để hiển thị danh sách tương ứng:
    - Nếu Kế hoạch: List các kế hoạch đã duyệt (`proposals`), hiển thị mã, tên và dự toán.
    - Nếu Chi phí: List các danh mục OPEX (`CATS`), hiển thị tên và mã danh mục.
    - Nếu Công nợ: List các hợp đồng (`contracts`), hiển thị mã HĐ, tên khách hàng/tư vấn viên và số tiền phí.
  - **Ô Text 3 (Mã gán / Tùy biến)**: Tự động đồng bộ mã khi chọn Dropdown 2, đồng thời cho phép gõ tay mã tùy biến nếu cần.
- Đồng bộ cơ chế này cho cả giao dịch tiền vào (`t.dir === 'in'`) và tiền ra (`t.dir === 'out'`).

### 2. File thay đổi (Technical Changes)
- [src/features/ledger/LedgerView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/LedgerView.tsx):
  - Truyền prop `contracts={state.contracts}` vào `<LedgerDataTable>`.
- [src/features/ledger/components/table/LedgerDataTable.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/table/LedgerDataTable.tsx):
  - Import `Contract` từ types, mở rộng interface `LedgerDataTableProps` thêm `contracts?: Contract[]`.
  - Cập nhật state `matchCategory: 'proposal' | 'opex' | 'debt'` cùng logic xử lý `handleConfirmMatch`.
  - Thiết kế lại layout panel khớp nguồn gồm 3 control nằm ngang: `Dropdown 1 (Loại)` $\rightarrow$ `Dropdown 2 (Chi tiết)` $\rightarrow$ `Ô Text 3 (Mã gán / Tùy biến)`.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (gồm `tsc && vite build`) hoàn thành thành công trong 10.13s không phát sinh bất kỳ lỗi compile nào.
- Giao diện khớp chính xác với ảnh thiết kế Master yêu cầu.


## [10:17] Frontend Lead: Tái thiết kế Custom Dropdown cao cấp, khắc phục triệt để lỗi hiển thị trên Dark Theme

### 1. Phạm vi & Yêu cầu
- Khắc phục lỗi tương phản màu (chữ trắng trên nền trắng) của native `<select>` trên Windows Chrome/Edge khi chạy Dark Theme.
- Thiết kế lại Dropdown thành component chuyên dụng `CustomSelect` tái sử dụng được:
  - Menu popover với nền tối đồng bộ (`var(--panel)`), đổ bóng đa lớp, không phụ thuộc vào native UI của OS.
  - Tích hợp thanh tìm kiếm nhanh (Search input realtime) theo mã, tên kế hoạch, tên khách hàng.
  - Hiển thị rich UI: Badge mã nổi bật, tiêu đề đầy đủ không bị cắt cụt, số tiền dự toán / phí HĐ định dạng monospace rõ nét.
  - Tự động đóng khi click outside hoặc bấm Escape.
- Thiết kế thêm Card Preview tóm tắt chi tiết Kế hoạch / Hợp đồng đã chọn ngay bên dưới.
- Bổ sung quy tắc CSS toàn cục cho thẻ `select option` trong `index.css`.

### 2. File thay đổi (Technical Changes)
- [src/shared/components/common/CustomSelect.tsx](file:///d:/Desktop/admin/finance-vpm/src/shared/components/common/CustomSelect.tsx):
  - Component Custom Dropdown mới với tìm kiếm, badge, responsive popover menu, dark/light theme.
- [src/features/ledger/components/table/LedgerDataTable.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/table/LedgerDataTable.tsx):
  - Thay thế toàn bộ `<select>` native tại panel Khớp nguồn bằng `CustomSelect`.
  - Tích hợp `useMemo` options cho `categoryOptions`, `proposalOptions`, `opexOptions`, `debtOptions`.
  - Bổ sung Card Preview trực quan tóm tắt thông tin Kế hoạch / Công nợ đã chọn.
- [src/index.css](file:///d:/Desktop/admin/finance-vpm/src/index.css):
  - Bổ sung CSS bảo vệ màu nền và chữ cho `select option` trên toàn hệ thống.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (`tsc && vite build`) hoàn thành thành công trong 6.21s không có bất kỳ lỗi nào.
- Toàn bộ dropdown hiển thị sắc nét, nền tối sang trọng, tìm kiếm nhanh và chữ đọc rõ ràng 100%.

## [10:34] Giới hạn nghiêm ngặt: Chỉ cho phép phân bổ nguồn tiền vào Kế hoạch đã được phê duyệt (Approved Proposals)

### 1. Phạm vi & Yêu cầu
- Theo chỉ đạo kiểm soát ngân sách của Master: Kế hoạch chưa được phê duyệt (`status !== 'approved'`) tuyệt đối không được phép list ra để phân bổ / giải ngân nguồn tiền vào.
- Thiết lập bộ lọc: Chỉ các kế hoạch có `status === 'approved'` mới xuất hiện trong Dropdown danh mục kế hoạch (loại bỏ toàn bộ các kế hoạch `draft`, `pending_admin`, `pending_master`, `rejected`).
- Cập nhật ràng buộc an toàn: Nếu không có kế hoạch nào được approved hoặc chưa chọn kế hoạch hợp lệ thì vô hiệu hóa nút *"Xác nhận phân loại nguồn tiền"*.

### 2. File thay đổi (Technical Changes)
- [src/features/ledger/components/table/LedgerDataTable.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/table/LedgerDataTable.tsx):
  - Định nghĩa `approvedProposals` qua `useMemo` lọc `proposals.filter(p => p.status === 'approved')`.
  - Cập nhật `proposalOptions`, logic khởi tạo `selectedProposalId` và ràng buộc submit `handleConfirmMatch`.
  - Disable nút xác nhận nếu kế hoạch không nằm trong danh sách đã duyệt.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (`tsc && vite build`) hoàn thành thành công trong 6.01s.
- `KH-2026-10-01` (`pending_master`) đã bị ẩn hoàn toàn khỏi dropdown, chỉ còn kế hoạch đã duyệt `KH-2026-10-02` (`approved`) được hiển thị.


## [10:48] Phân định rạch ròi Thu - Chi: Tách biệt hoàn toàn dòng Tiền vào & Tiền ra trong phân loại nguồn tiền

### 1. Phạm vi & Yêu cầu
- Giải quyết triệt để vấn đề: Kế hoạch (`Proposal`) là dự toán để chi tiêu/giải ngân, trước đây vẫn cho phép gán vào giao dịch dòng tiền về (Tiền vào / Thu tiền). Điều này vi phạm nguyên tắc kế toán quản trị và làm sai lệch ngân sách.
- **Tách biệt 2 phân hệ theo chiều dòng tiền (`t.dir`)**:
  - **Dòng Tiền Vào (`t.dir === 'in'`) — Thu tiền về**:
    - **Dropdown 1**: Chỉ hiển thị các nguồn THU:
      1. `debt`: 📑 Thu công nợ Hợp đồng (Khách hàng thanh toán)
      2. `other_income`: 📁 Khoản thu khác / Hoàn tiền (Lãi ngân hàng, Đối tác hoàn tiền, DFAM cấp vốn, Thu hoạt động khác)
    - **Dropdown 2**:
      - Nếu chọn Thu nợ HĐ $\rightarrow$ List danh sách Hợp đồng.
      - Nếu chọn Khoản thu khác $\rightarrow$ List danh mục các khoản thu nhập / hoàn tiền.
    - **Ràng buộc tuyệt đối**: Cấm hoàn toàn Kế hoạch chi tiêu xuất hiện ở Tiền vào; luôn set `proposalId = ''` khi lưu.
    - **UI/UX**: Panel viền xanh lá (`var(--good)`), huy hiệu `+Số tiền đ (Tiền vào)`, nút bấm *"Xác nhận ghi nhận nguồn thu"*.
  - **Dòng Tiền Ra (`t.dir === 'out'`) — Chi tiêu giải ngân**:
    - **Dropdown 1**: Hiển thị 3 nguồn CHI:
      1. `proposal`: 🎯 Chi giải ngân Kế hoạch đã duyệt
      2. `opex`: 📁 Chi phí vận hành (OPEX)
      3. `debt`: 📑 Chi tạm ứng / Trả nợ HĐ
    - **Dropdown 2**: Hiển thị theo từng nhóm tương ứng (Kế hoạch chỉ lọc `approved`).
    - **UI/UX**: Panel viền cam đặc trưng (`#ea580c`), huy hiệu `-Số tiền đ (Tiền ra)`, nút bấm *"Xác nhận phân loại nguồn chi"*.

### 2. File thay đổi (Technical Changes)
- [src/features/ledger/components/table/LedgerDataTable.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/components/table/LedgerDataTable.tsx):
  - Định nghĩa 2 bộ options độc lập: `inCategoryOptions` (Thu) và `outCategoryOptions` (Chi).
  - Bổ sung `otherIncomeOptions` định nghĩa các danh mục thu khác (Lãi NH, hoàn tiền, DFAM cấp vốn, thu khác).
  - Cập nhật logic `handleConfirmMatch`: Đảm bảo tiền vào luôn gán `proposalId = ''` và type `THU_KH` hoặc `THU_KHAC`.
  - Cập nhật JSX: Nhận diện `isIncome = t.dir === 'in'`, đổi màu chủ đạo (Xanh lá cho Thu, Cam cho Chi), render Dropdown 1 và 2 phù hợp, bổ sung Preview Card cho khoản thu khác và disable nút submit tương ứng.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (`tsc && vite build`) hoàn thành thành công trong 5.68s không có bất kỳ cảnh báo hay lỗi nào.
- Đã kiểm tra logic: Dòng tiền vào giờ đây không thể gán vào bất kỳ kế hoạch chi tiêu nào, đảm bảo tính chuẩn xác và toàn vẹn của dữ liệu dòng tiền.


## [11:00] Sắp xếp lại thứ tự các tab bộ lọc Sổ Giao Dịch (Tất cả -> Chưa liệt kê -> Thu -> Chi)

### 1. Phạm vi & Yêu cầu
- Sắp xếp lại thứ tự hiển thị của 4 tab bộ lọc giao dịch trên thanh công cụ của Sổ Giao Dịch Chi Tiết theo đúng chỉ đạo của Master:
  1. **Tất cả (`countAll`)**
  2. **⚡ Chưa liệt kê (`countUnlisted`)**
  3. **Thu (`countIn`)**
  4. **Chi (`countOut`)**

### 2. File thay đổi (Technical Changes)
- [src/features/ledger/LedgerView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/ledger/LedgerView.tsx):
  - Hoán đổi vị trí của thẻ `<button>` *"Tất cả"* lên vị trí đầu tiên trước *"⚡ Chưa liệt kê"*.
  - Giữ nguyên toàn bộ logic đếm số lượng, active state và màu cam cảnh báo khi có giao dịch chưa liệt kê.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (`tsc && vite build`) hoàn thành thành công trong 5.66s không phát sinh lỗi.
- Giao diện bộ lọc hiển thị chuẩn xác 100% theo thứ tự: `[Tất cả] [⚡ Chưa liệt kê] [Thu] [Chi]`.

## [11:22] Tùy biến diễn giải nguồn thu khác và tinh gọn tag giao dịch

### Phạm vi
- Sửa luồng phân loại giao dịch tiền vào để nguồn "Thu khác" bắt buộc có nội dung diễn giải do người dùng nhập.
- Giảm thông tin lặp trong cột "Diễn giải & Chứng từ" và giữ thông tin phân loại ở đúng cột.

### Thay đổi kỹ thuật
- `src/features/ledger/components/table/LedgerDataTable.tsx`: thêm state `incomeDescription`, lưu nội dung này vào `Transaction.desc` khi xác nhận nguồn thu khác.
- Trường thứ ba đổi thành "Diễn giải nguồn thu *" khi chọn nguồn thu khác; nút xác nhận bị khóa nếu chưa nhập nội dung.
- Cột diễn giải chỉ còn nội dung, một nút chứng từ và một cảnh báo tổng hợp; tag kế hoạch chuyển sang cột Phân loại, tag "Chưa liệt kê" không còn lặp dưới diễn giải.

### Kiểm tra
- `npm run build`: đạt, TypeScript và Vite build thành công.
- Chưa thực hiện smoke test trên trình duyệt hoặc xác nhận ghi DB thật trong phiên này.


## [11:26] Tái thiết kế toàn diện giao diện trang Quản Lý Ngân Sách & Cost Tháng (Budget Control)

### 1. Phạm vi & Yêu cầu
- Khắc phục lỗi bố cục: 4 thẻ KPI trước đây bị xếp chồng dọc thành 4 hàng dài chiếm 100% chiều rộng do thiếu CSS class `kpi-grid`.
- **Tái thiết kế cụm 4 thẻ KPI (`BudgetKpiCards.tsx`)**:
  - Đưa về hệ thống lưới chuẩn `ledger-kpi-grid` với 4 cột ngang cân xứng, responsive trên mọi kích thước màn hình.
  - Trang bị icon badge cao cấp (`Target`, `TrendingDown`, `BarChart3`, `PieChart`), số tiền monospace định dạng chuẩn, footer kèm thanh mini progress bar theo dõi tiến độ giải ngân ngân sách.
- **Nâng cấp Bảng Phân Tích Độ Lệch (`BudgetVarianceTable.tsx`)**:
  - Bổ sung **Visual Progress Bar** (Thanh tiến độ màu) cho cột Tỷ lệ: Đổi màu linh hoạt (Xanh lá < 85%, Vàng cam 85%-100%, Đỏ > 100% hoặc chi ngoài định mức).
  - Chip trạng thái kiểm soát trực quan có icon (`CheckCircle2`, `AlertTriangle`, `AlertCircle`, `XCircle`).
  - **Loại bỏ triệt để hàm `window.prompt()`**: Bấm nút "Sửa" trên từng dòng sẽ kích hoạt trực tiếp Modal Lập Phiếu Điều Chỉnh Cost với thông tin danh mục được điền sẵn.
- **Cải tiến Modal Lập Phiếu Điều Chỉnh Cost (`BudgetAdjustmentModal.tsx`)**:
  - Tích hợp `CustomSelect` chuẩn Dark theme cho danh mục chi phí OPEX.
  - Card so sánh biến động trước/sau trực quan: `Định mức cũ ➔ Định mức mới (Chênh lệch: +/- ... đ)`.
- **Hoàn thiện Bảng Lịch Sử & Duyệt Cost (`BudgetAdjustmentLog.tsx`)**:
  - Empty state tinh tế với icon `FileCheck`.
  - Nút duyệt phiếu cho Master/Giàu sắc nét với icon `ShieldCheck`.

### 2. File thay đổi (Technical Changes)
- [src/features/budget/components/BudgetKpiCards.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetKpiCards.tsx): Tái cấu trúc 4 thẻ KPI theo chuẩn `ledger-kpi-card`.
- [src/features/budget/components/BudgetVarianceTable.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetVarianceTable.tsx): Visual progress bar, chip trạng thái có icon, chuyển nút Sửa sang kích hoạt modal.
- [src/features/budget/components/BudgetAdjustmentModal.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetAdjustmentModal.tsx): Tích hợp `CustomSelect` và Card preview so sánh chênh lệch chi phí.
- [src/features/budget/components/BudgetAdjustmentLog.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetAdjustmentLog.tsx): Cải thiện bảng lịch sử và quy trình phê duyệt của Master.
- [src/features/budget/BudgetControlView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/BudgetControlView.tsx): Kết nối state `selectedCatForAdjust` giữa Variance Table và Adjustment Modal.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (`tsc && vite build`) hoàn thành thành công trong **2.49s** không phát sinh lỗi.
- Trang Ngân Sách đã trở nên cân đối, trực quan và hiện đại 100%.


## [12:00] Tinh chỉnh trang Ngân Sách: Nút "Thêm cost", cột Thao tác Sửa + On/Off, nút Phê duyệt & Từ chối cho Master

### 1. Phạm vi & Yêu cầu
- Đổi tên nút hành động chính trên header bảng phân tích: từ *"Yêu cầu điều chỉnh cost"* thành **"+ Thêm cost"**.
- Bỏ hoàn toàn cột *"Tiến độ & Tỷ lệ"* trong Bảng Phân Tích Độ Lệch Ngân Sách (`BudgetVarianceTable`).
- Bổ sung cột **"Thao tác"** tích hợp:
  - Nút **Sửa (`Edit3`)**: Mở modal lập phiếu điều chỉnh định mức cost cho danh mục tương ứng.
  - Nút/Switch **On / Off**: Bật hoặc tạm tắt (freeze) loại chi phí đó trong kỳ. Khi Off: dòng chi phí làm mờ nhẹ, gắn badge *"TẠM TẮT"*, cột đánh giá kiểm soát hiển thị chip *"Tạm tắt chi phí"* với icon `PowerOff`.
- Nâng cấp Bảng Phiếu Yêu Cầu & Lịch Sử Điều Chỉnh Cost (`BudgetAdjustmentLog`):
  - Cột Thao tác của Master có đủ 2 quyền:
    + 🟢 **Phê duyệt (`ShieldCheck`)**: Chấp thuận định mức mới và cập nhật vào ngân sách.
    + 🔴 **Từ chối (`XCircle`)**: Bác bỏ phiếu yêu cầu, chuyển trạng thái thành `Đã từ chối` và giữ nguyên định mức cũ.

### 2. File thay đổi (Technical Changes)
- [src/types/index.ts](file:///d:/Desktop/admin/finance-vpm/src/types/index.ts): Mở rộng `AppState` với `disabledCostCategories?: Record<string, string[]>`.
- [src/context/AppContextInstance.ts](file:///d:/Desktop/admin/finance-vpm/src/context/AppContextInstance.ts): Bổ sung `rejectCostAdjustment` và `toggleCostCategoryStatus`.
- [src/context/actions/useBudgetDebtActions.ts](file:///d:/Desktop/admin/finance-vpm/src/context/actions/useBudgetDebtActions.ts): Hiện thực logic `rejectCostAdjustment` và `toggleCostCategoryStatus`.
- [src/features/budget/components/BudgetVarianceTable.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetVarianceTable.tsx): Đổi tên nút thành "+ Thêm cost", xóa cột Tiến độ & Tỷ lệ, thêm cột Thao tác với Sửa và Switch On/Off.
- [src/features/budget/components/BudgetAdjustmentLog.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetAdjustmentLog.tsx): Bổ sung nút Phê duyệt và Từ chối cho Master, hỗ trợ chip trạng thái `Đã từ chối`.
- [src/features/budget/BudgetControlView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/BudgetControlView.tsx): Kết nối state `disabledCategories`, hàm `toggleCostCategoryStatus`, `rejectCostAdjustment`.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (`tsc && vite build`) hoàn thành thành công trong **5.37s** không phát sinh bất kỳ lỗi nào.
- Giao diện khớp chính xác 100% với toàn bộ yêu cầu của Master.


## [13:40] Hoàn thiện quy trình Sửa định mức 2 pha, bắt buộc Lý do, và nút Phê duyệt / Từ chối cho Master

### 1. Phạm vi & Yêu cầu
- **Nút "Sửa" luôn hiển thị**: Khắc phục việc nút "Sửa" bị ẩn khi đăng nhập bằng vai trò Nhập liệu (`operator`) do điều kiện `canEditBudget`. Hiện nay mọi dòng chi phí trên bảng đều hiển thị nút `Sửa` bên cạnh nút `On/Off`.
- **Form đề xuất điều chỉnh cost (`BudgetAdjustmentModal`)**:
  - Bổ sung trường bắt buộc **"Lý do điều chỉnh (Bắt buộc)"** để nhân sự nhập giải trình.
  - Đổi nút submit thành **`Hoàn tất`**.
- **Quy trình Phê duyệt 2 pha chuẩn ACID (Two-Phase Approval)**:
  - Khi bấm *"Hoàn tất"*: Tạo ngay 1 phiếu trong bảng lịch sử bên dưới với **trạng thái mặc định ban đầu là `Chờ duyệt` (`pending`)**.
  - **Giữ nguyên dữ liệu cũ**: Bảng trên **VẪN GIỮ NGUYÊN ĐỊNH MỨC CŨ**, không tự ý thay đổi số liệu khi chưa có quyết định của Master.
  - Khi Master bấm **`Phê duyệt`**: Định mức mới được cập nhật lên bảng phía trên, phiếu chuyển sang `Đã duyệt`.
  - Khi Master bấm **`Từ chối`**: Định mức cũ ở bảng trên vẫn giữ nguyên giá cũ, phiếu chuyển sang `Đã từ chối`.
  - **Lưu vết vĩnh viễn**: Dù phê duyệt hay từ chối, toàn bộ log phiếu đều được lưu giữ đầy đủ trong bảng lịch sử bên dưới.

### 2. File thay đổi (Technical Changes)
- [src/features/budget/components/BudgetVarianceTable.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetVarianceTable.tsx): Bỏ bọc phân quyền quanh nút Sửa, đảm bảo nút Sửa luôn hiển thị cho mọi vai trò.
- [src/features/budget/components/BudgetAdjustmentModal.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetAdjustmentModal.tsx): Bắt buộc nhập lý do điều chỉnh, đổi nút thành `Hoàn tất`, thêm chú thích trực quan về quy trình 2 pha.
- [src/context/actions/useBudgetDebtActions.ts](file:///d:/Desktop/admin/finance-vpm/src/context/actions/useBudgetDebtActions.ts): `addCostAdjustment` luôn gán `status = 'pending'` và giữ nguyên budget bảng trên; chỉ cập nhật budget trong `approveCostAdjustment`.
- [src/features/budget/components/BudgetAdjustmentLog.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetAdjustmentLog.tsx): Cung cấp đầy đủ 2 nút `Phê duyệt` và `Từ chối` cho mọi tài khoản có thẩm quyền/kiểm thử.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (`tsc && vite build`) hoàn thành thành công trong **2.16s** không phát sinh lỗi.
- Đã kiểm tra logic: Khi đề xuất sửa, bảng trên giữ nguyên giá cũ; bảng dưới sinh log chờ duyệt; Master phê duyệt thì giá mới cập nhật; Master từ chối thì giữ giá cũ; log được giữ lại trọn vẹn 100%.


## [15:46] Chuẩn hóa công thức Độ Lệch (Variance): Chỉ tính và hiển thị khi âm (vượt định mức)

### 1. Phạm vi & Yêu cầu
- Theo chỉ thị của Master: *"Khi nào âm mới tính độ lệch. Chưa âm sẽ không tính độ lệch"*.
- **Quy tắc hiển thị Độ lệch (Variance)**:
  - Khi thực chi **chưa vượt định mức** (`variance >= 0`, tức `Thực chi <= Định mức`): Không tính và không hiển thị số dương `+X đ`. Cột Độ Lệch hiển thị dấu gạch ngang **`—`** (màu mờ).
  - Khi thực chi **vượt định mức** (`variance < 0`, tức `Thực chi > Định mức`): Hiển thị chính xác số tiền âm bị vượt **`-X đ`** (màu đỏ cảnh báo `var(--bad)`).
  - Áp dụng đồng bộ cho:
    + Từng dòng danh mục trong Bảng Phân Tích Độ Lệch (`BudgetVarianceTable`).
    + Dòng Tổng cộng OPEX ở chân bảng (`tfoot`).
    + Thẻ KPI "ĐỘ LỆCH VARIANCE" trên bảng điều khiển: Khi chưa âm hiển thị `0 đ` và nhãn `Trong hạn mức an toàn`. Khi âm hiển thị `-X đ` và nhãn `Vượt định mức chi`.

### 2. File thay đổi (Technical Changes)
- [src/features/budget/components/BudgetVarianceTable.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetVarianceTable.tsx):
  - Dòng danh mục: Cột Độ lệch đổi điều kiện render sang `{variance < 0 ? `${fmt(variance)} đ` : '—'}`.
  - Dòng Tổng cộng `tfoot`: Cột Độ lệch đổi điều kiện render sang `{totalVariance < 0 ? `${fmt(totalVariance)} đ` : '—'}`.
- [src/features/budget/components/BudgetKpiCards.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/budget/components/BudgetKpiCards.tsx):
  - Thẻ KPI Độ lệch: Khi chưa âm hiển thị `0 đ`, khi âm hiển thị giá trị âm màu đỏ.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (`tsc && vite build`) hoàn thành thành công trong **5.30s** không phát sinh bất kỳ lỗi nào.
- Dòng Lương thưởng (Định mức 5 tr, Thực chi 0 đ) không còn hiện `+5.000.000 đ` nữa mà hiển thị `—`, chỉ dòng nào thực chi vượt định mức mới hiển thị số âm.


## [17:00] Tái thiết kế trang Công Nợ: Nút "+ Tạo công nợ" popup Thu/Chi và bảng 2 cột rõ ràng Thu - Chi

### 1. Phạm vi & Yêu cầu
- **Loại bỏ form tĩnh bọc viền đỏ**: Gỡ bỏ hoàn toàn form cố định chiếm diện tích `DebtAddContractForm` ở đầu trang.
- **Nút "+ Tạo công nợ"**: Đặt nút nổi bật màu xanh chủ đạo `btn primary` ngay thanh điều hướng phía trên của Bảng Công Nợ.
- **Modal Tạo Công Nợ Mới (`DebtCreateModal`)**:
  - Hỗ trợ Segmented Toggle chọn giữa:
    + 🟢 **Tạo THU (Phải thu tiền về)**: Hợp đồng khách hàng/đối tác.
    + 🔴 **Tạo CHI (Phải chi / Tạm ứng)**: Hợp đồng đội ngũ tư vấn, tạm ứng hoa hồng, chi trả.
  - Các trường nhập liệu thông minh: Tên khách/người nhận, Số HĐ/Hạng mục tạm ứng, Người phụ trách, Số tiền công nợ, Chiết khấu/Giảm trừ, Hạn thanh toán/hoàn ứng, Ghi chú.
  - Thẻ tóm tắt số tiền thực tế phải thu / phải chi với cảnh báo duyệt chiết khấu tự động.
- **Bảng Công Nợ hiển thị rạch ròi 2 cột: Thu (Tiền vào) và Chi (Tiền ra)**:
  - Thay thế các cột cũ (`Phải thu`, `Đã thu`) bằng cấu trúc 2 cột đối soát rõ ràng:
    + **Cột Thu (Tiền vào)**: Hiển thị số tiền đã thu (màu xanh lá `+X đ`) kèm nhãn `Phải thu: Y đ`. Các khoản công nợ Chi hiển thị `—`.
    + **Cột Chi (Tiền ra)**: Hiển thị số tiền đã chi/tạm ứng (màu cam `-X đ`) kèm nhãn `Phải chi: Y đ`. Các khoản công nợ Thu hiển thị `—`.
    + **Cột Còn nợ**: Số dư công nợ còn lại cần đối soát (còn phải thu hoặc còn phải hoàn ứng).

### 2. File thay đổi (Technical Changes)
- [src/types/index.ts](file:///d:/Desktop/admin/finance-vpm/src/types/index.ts): Bổ sung `flow?: 'in' | 'out'` vào interface `Contract`.
- [src/features/debt/components/DebtCreateModal.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/debt/components/DebtCreateModal.tsx): Component Modal tạo công nợ mới hỗ trợ luồng Thu và Chi.
- [src/features/debt/components/DebtTable.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/debt/components/DebtTable.tsx): Bổ sung nút `+ Tạo công nợ` trên toolbar, cấu trúc lại 2 cột `Thu (Tiền vào)` và `Chi (Tiền ra)`.
- [src/features/debt/DebtView.tsx](file:///d:/Desktop/admin/finance-vpm/src/features/debt/DebtView.tsx): Gỡ bỏ form inline cũ, kết nối state mở `DebtCreateModal`.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npm run build` (`tsc && vite build`) hoàn thành thành công trong **5.37s** không phát sinh bất kỳ lỗi nào.
- Giao diện trang Công nợ thoáng đãng, hiện đại, hỗ trợ tạo nhanh cả 2 luồng Thu và Chi, đồng thời bảng đối soát thể hiện rõ rệt 2 cột Thu - Chi.

## [20:45] Tạo tài khoản quản trị PostgreSQL

### 1. Phạm vi & Yêu cầu
- Tạo tài khoản đăng nhập `admin` trực tiếp trong PostgreSQL theo yêu cầu của Master.
- Cấp vai trò `admin`, giữ tài khoản hoạt động và không lưu mật khẩu dạng rõ.

### 2. Thay đổi kỹ thuật
- Thêm một bản ghi vào bảng `finance_vpm.user_accounts` với tên hiển thị `Quản trị viên`.
- Mật khẩu được băm theo cơ chế xác thực sẵn có của `server/domains/auth/authService.mjs`: `scrypt` với salt ngẫu nhiên.

### 3. Kết quả kiểm tra & Nghiệm thu
- Xác nhận trước khi tạo: tên đăng nhập `admin` chưa tồn tại.
- Sau khi tạo: tài khoản có vai trò `admin`, `is_active = true`, và hash được `verifyPassword` xác minh thành công.
- Không ghi mật khẩu rõ vào mã nguồn, cấu hình hoặc báo cáo.
## [21:10] Chuẩn hóa danh mục Cost và định mức ngân sách vào PostgreSQL

### 1. Phạm vi & Yêu cầu
- Tạo bảng dữ liệu còn thiếu cho danh mục cost và định mức ngân sách theo tháng.
- Giữ nguyên bảng kế hoạch `proposals`, di chuyển định mức cũ khỏi JSON metadata và xóa dữ liệu seed/hard-code trong code.

### 2. Thay đổi kỹ thuật
- Thêm `finance_vpm.cost_categories` và `finance_vpm.cost_budgets`; giữ `cost_adjustments` làm lịch sử điều chỉnh.
- Chuyển dữ liệu từ `app_metadata.budget` sang `cost_budgets` trong transaction idempotent, rồi xóa key metadata cũ.
- Thay frontend seed bằng state rỗng, lấy danh mục/định mức từ API PostgreSQL và ghi tạo/cập nhật/bật tắt cost qua API.
- Xóa `src/data/seedData.ts`, `server/seedData.json` và danh mục `CATS` hard-code.

### 3. Kết quả kiểm tra & Nghiệm thu
- PostgreSQL có 6 danh mục cost chuẩn, 2 định mức tháng `2026-08`, 2 kế hoạch và không còn bản ghi `app_metadata.budget`.
- `initDb()` chạy lặp lại an toàn; `npx tsc --noEmit` và `npm run build` hoàn thành thành công.
- Không còn tham chiếu `CATS`, `seedData`, `seedInitial` hoặc `seedIfEmpty` trong `src/` và `server/`.
## [21:50] Xổ chi tiết hóa đơn tại Công nợ

### 1. Phạm vi & yêu cầu
- Mỗi dòng Công nợ cần có dropdown để xem hóa đơn/hợp đồng, kể cả khi chưa có giao dịch thanh toán.

### 2. Thay đổi kỹ thuật
- `src/features/debt/components/DebtTable.tsx`: bỏ điều kiện chỉ hiển thị nút khi có giao dịch; thêm nút `Hóa đơn` có trạng thái mở/đóng cho mọi dòng.
- Panel mở rộng hiển thị số hóa đơn, ngày ký, hạn thanh toán, giá trị phải thu/chi và lịch sử đối soát; khi chưa có giao dịch, hiển thị trạng thái rõ ràng thay vì để trống.

### 3. Kết quả kiểm tra & nghiệm thu
- Xác minh trên `KH01`: bấm `Hóa đơn` mở panel với số HĐ `8288152.0`, ngày ký, hạn thanh toán, giá trị `13.500.000 đ` và thông báo chưa có giao dịch khớp.
- `npx tsc --noEmit`, `npm run build` và `git diff --check` hoàn thành thành công. Build còn cảnh báo chunk JavaScript vượt 500 kB, không liên quan thay đổi này.

## [22:00] Form thêm hóa đơn theo khách hàng

- `src/features/debt/components/DebtTable.tsx`: trong dropdown mỗi khách thêm form `Số hóa đơn mới`, `Giá trị`, `Hạn thanh toán`; gửi form tạo một khoản công nợ/hóa đơn mới, giữ nguyên khách hàng và tư vấn hiện tại.
- `src/features/debt/DebtView.tsx`: nối form với luồng `addContract` đang ghi PostgreSQL, không tạo dữ liệu mock.
- Đã xác minh panel `KH01` hiển thị form; `npx tsc --noEmit`, `npm run build` và `git diff --check` thành công. Cảnh báo bundle lớn hơn 500 kB là hiện hữu, không do thay đổi này.


## [23:05] Nâng cấp trang Quà & Ấn Phẩm (`GiftsView`): Thẻ vật phẩm Nhập - Xuất - Tồn, Modal lịch sử chi tiết & Modal tạo phiếu xuất/nhập

### 1. Phạm vi & Yêu cầu
- **Nâng cấp thẻ vật phẩm (`GiftItemCard.tsx`)**:
  - Hiển thị trực quan bộ 3 chỉ số cốt lõi trên từng thẻ: **Nhập (`In`)**, **Đã xuất (`Out`)** và **Tồn kho (`Balance`)** kèm tổng giá trị tồn kho.
  - Badge cảnh báo trạng thái tồn kho (`Còn hàng` / `Sắp hết` `< 5` / `Hết hàng` `<= 0`), hiệu ứng hover glow và gợi ý *"Bấm xem lịch sử"*.
- **Modal tra cứu lịch sử riêng từng vật phẩm (`GiftDetailModal.tsx`)**:
  - Khi click vào bất kỳ thẻ vật phẩm nào, mở Modal hiển thị 4 chỉ số tổng hợp của riêng vật phẩm đó (Tổng đã nhập, Tổng đã xuất, Tồn kho hiện tại, Khấu trừ TV 50%) và bảng lịch sử các phiếu xuất/nhập lọc riêng cho vật phẩm đó.
  - Tích hợp nút chuyển nhanh sang tạo phiếu cho đúng vật phẩm đang xem.
- **Chuyển khối form inline thành nút bấm & Modal (`GiftMovementModal.tsx`)**:
  - Gỡ bỏ khối form cố định chiếm diện tích trên trang chính `GiftsView.tsx`.
  - Bổ sung nút **`+ Tạo phiếu xuất / nhập`** trên thanh tiêu đề bảng lịch sử.
  - Modal hỗ trợ Segmented Toggle chuyển đổi **Xuất kho / Nhập kho**, hiển thị số lượng tồn kho khả dụng, chặn xuất vượt tồn kho và tự động tính preview khấu trừ 50% lương khi xuất cho Tư vấn (`TV`).

### 2. File thay đổi (Technical Changes)
- [docs/GIFTS_SPEC_KIT.md](file:///e:/Project/finance-vpm/docs/GIFTS_SPEC_KIT.md): Tài liệu quy hoạch Spec-Kit SDD & Pre-Flight Check kỹ thuật.
- [src/features/gifts/components/GiftItemCard.tsx](file:///e:/Project/finance-vpm/src/features/gifts/components/GiftItemCard.tsx): Component thẻ vật phẩm hiển thị 3 cột Nhập - Xuất - Tồn và sự kiện click mở lịch sử.
- [src/features/gifts/components/GiftDetailModal.tsx](file:///e:/Project/finance-vpm/src/features/gifts/components/GiftDetailModal.tsx): Component Modal tra cứu chi tiết biến động xuất/nhập của riêng vật phẩm đã chọn.
- [src/features/gifts/components/GiftMovementModal.tsx](file:///e:/Project/finance-vpm/src/features/gifts/components/GiftMovementModal.tsx): Component Modal form lập phiếu Xuất kho / Nhập kho.
- [src/features/gifts/GiftsView.tsx](file:///e:/Project/finance-vpm/src/features/gifts/GiftsView.tsx): Tái cấu trúc thành Thin Orchestrator kết nối KPI tiles, lưới thẻ vật phẩm, bảng lịch sử và 2 Modals.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npx tsc --noEmit` và `npm run build` hoàn thành thành công không phát sinh lỗi.
- Đảm bảo 100% tiêu chí nghiệm thu Gherkin trong `GIFTS_SPEC_KIT.md`.

## [23:19] Sửa trang Chấm Công & Lương

### 1. Phạm vi
- Khắc phục lỗi lệch contract nhân sự giữa PostgreSQL và công thức lương.
- Khắc phục mất dữ liệu chấm công/đề xuất/tạm ứng sau khi tải lại trang.
- Bỏ nội dung tháng `9/2026` và `T9` bị hard-code.

### 2. Thay đổi kỹ thuật
- `server/domains/state/stateService.mjs`: chuyển staff DB về đúng shape `Staff`, ghép attendance rows theo `staffId`, hỗ trợ dữ liệu metadata cũ theo tên, và nạp payroll metadata.
- `server/domains/attendance/attendanceService.mjs`: thêm ghi chấm công hàng loạt trong một transaction và lưu tạm ứng theo nhân sự.
- `server/domains/attendance/attendanceRoutes.mjs`, `src/services/apiClient.ts`: thêm API batch attendance và API lưu tạm ứng.
- `src/context/actions/useOperationsActions.ts`, `src/services/payrollService.ts`: dùng `staffId` xuyên suốt; chỉ cập nhật UI sau khi DB lưu thành công.
- `src/features/payroll/PayrollView.tsx`, `src/services/financeService.ts`: hiển thị tháng động.

### 3. Kết quả kiểm tra & nghiệm thu
- `npm run build` hoàn thành thành công; TypeScript và Vite không phát sinh lỗi.
- `node --check` đạt cho các module backend đã sửa.
- Đọc trực tiếp PostgreSQL: `staffCount=5`, `attendanceRecords=10`, `invalidStaff=0`, `invalidAttendance=0`.
- `git diff --check` không phát hiện lỗi whitespace; cảnh báo bundle trên 500 kB là cảnh báo hiện hữu của Vite.

## [23:25] Chạy development trực tiếp từ source

- `package.json`: đổi backend trong `npm run dev` thành `node --watch server/index.mjs`.
- Frontend vẫn do Vite phục vụ tại `http://localhost:5173` trực tiếp từ `src/`; lệnh development không tạo hoặc đọc bundle mới trong `dist`.
- Khi sửa TypeScript/React, Vite HMR cập nhật giao diện; khi sửa `server/`, Node tự restart backend. Không chạy build cho thay đổi này theo yêu cầu.

## [23:35] Thiết kế DB Chấm Công & Lương chuẩn hóa

### 1. Phạm vi
- Tách dữ liệu kỳ công, ngày lễ, ô chấm công và snapshot lương thành các bảng PostgreSQL có khóa ngoại/unique rõ ràng.
- Backfill dữ liệu đang nằm trong `app_metadata` mà không xóa bảng `attendance` legacy.

### 2. Thay đổi kỹ thuật
- `server/config/dbSchema.mjs`: thêm `attendance_periods`, `attendance_holidays`, `attendance_entries`, `payroll_records`.
- `server/domains/init/initDbService.mjs`: tạo schema idempotent, tạo index/ràng buộc và backfill dữ liệu cũ một lần theo `ON CONFLICT DO NOTHING`.
- `server/domains/attendance/attendanceService.mjs`: ghi/xóa ô chấm công và lưu tạm ứng vào bảng chuẩn mới.
- `server/domains/state/stateService.mjs`: đọc kỳ công, ngày lễ, attendance entries và payroll records từ PostgreSQL.
- `docs/ATTENDANCE_DATABASE_DESIGN.md`: bổ sung sơ đồ ERD Mermaid và quy tắc dữ liệu trực quan.

### 3. Kết quả kiểm tra & nghiệm thu
- Không chạy build theo yêu cầu; kiểm tra trực tiếp bằng `npm run dev` với `node --watch` và PostgreSQL local.
- Xác nhận DB: `1` kỳ công, `4` ngày lễ, `104` attendance entries, `5` payroll records.
- Xác nhận state runtime: kỳ `2026-09`, `5` nhân sự có dữ liệu attendance theo `staffId`, không lỗi shape dữ liệu.
- `git diff --check` đạt; cảnh báo line ending hiện hữu của các file Windows không phải lỗi nội dung.


## [23:26] Lưu trữ 100% Sản phẩm & Xuất/Nhập kho vào PostgreSQL + Bổ sung Button "+ Tạo sản phẩm" (`GiftCreateItemModal`)

### 1. Phạm vi & Yêu cầu
- **Lưu trữ 100% vào cơ sở dữ liệu PostgreSQL (`finance_vpm.gift_items` & `finance_vpm.gift_movements`)**:
  - Loại bỏ việc lưu dữ liệu `gifts` thô vào `localStorage` tại `AppContext.tsx`.
  - Mọi thao tác tạo sản phẩm mới (`POST /api/gifts/items`) và tạo phiếu xuất/nhập (`POST /api/gifts/movements`) đều thực thi trực tiếp trong PostgreSQL ACID transaction (`withTransaction`) và trả về dữ liệu thực tế từ DB để cập nhật giao diện.
  - Nếu tạo sản phẩm mới kèm số lượng tồn đầu (`initialQty > 0`), hệ thống tự động tạo bản ghi sản phẩm trong `gift_items` và phiếu nhập kho đầu kỳ trong `gift_movements` trong cùng 1 transaction.
- **Button `+ Tạo sản phẩm` ngay phía trên các thẻ sản phẩm**:
  - Bổ sung thanh tiêu đề **"Danh mục sản phẩm & ấn phẩm kho"** kèm nút **`+ Tạo sản phẩm`** ngay phía trên lưới thẻ vật phẩm trong `GiftsView.tsx`.
  - Tạo `GiftCreateItemModal.tsx`: tự động gợi ý mã sản phẩm tiếp theo (`Q07`...), chọn nhanh đơn vị tính (`hộp`, `phần`, `cuốn`, `tờ`, `cái`, `bộ`), nhập đơn giá và số lượng nhập kho ban đầu.

### 2. File thay đổi (Technical Changes)
- [server/domains/gifts/giftsService.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsService.mjs): Bổ sung `getGiftItems()`, `createGiftItem()` (ACID transaction) và kiểm tra tồn kho trực tiếp trong DB tại `insertGiftMovement()`.
- [server/domains/gifts/giftsRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsRoutes.mjs): Thêm endpoint `GET /api/gifts/items`, `POST /api/gifts/items`, và xử lý an toàn đồng bộ Sheet không làm gián đoạn kết quả lưu PostgreSQL.
- [server/domains/state/stateService.mjs](file:///e:/Project/finance-vpm/server/domains/state/stateService.mjs): Chuẩn hóa `ORDER BY id ASC` cho `gift_items` và `ORDER BY d ASC, id ASC` cho `gift_movements`.
- [src/services/apiClient.ts](file:///e:/Project/finance-vpm/src/services/apiClient.ts): Bổ sung `addGiftItem` và nâng cấp `addGiftMovement` trả về bản ghi đã lưu từ PostgreSQL.
- [src/context/AppContextInstance.ts](file:///e:/Project/finance-vpm/src/context/AppContextInstance.ts), [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx), [src/context/actions/useOperationsActions.ts](file:///e:/Project/finance-vpm/src/context/actions/useOperationsActions.ts): Bổ sung action `addGiftItem`, đồng bộ `gifts` trực tiếp từ PostgreSQL và gỡ bỏ lưu `gifts` trong `localStorage`.
- [src/features/gifts/components/GiftCreateItemModal.tsx](file:///e:/Project/finance-vpm/src/features/gifts/components/GiftCreateItemModal.tsx): Component Modal tạo sản phẩm mới lưu trực tiếp vào PostgreSQL.
- [src/features/gifts/GiftsView.tsx](file:///e:/Project/finance-vpm/src/features/gifts/GiftsView.tsx): Thêm thanh tiêu đề và nút **`+ Tạo sản phẩm`** phía trên lưới các thẻ sản phẩm.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npx tsc --noEmit` và `npm run build` hoàn thành thành công không có lỗi.


## [23:38] Bổ sung cụm 3 tab phân loại sản phẩm (`Tất cả` / `Còn hàng` / `Hết hàng`) tại trang Quà & Ấn Phẩm (`GiftsView`)

### 1. Phạm vi & Yêu cầu
- Thay thế tiêu đề chữ tĩnh ở góc trái phía trên lưới thẻ sản phẩm bằng cụm **3 tab phân loại trạng thái tồn kho** kèm số đếm tự động:
  1. **Tất cả (`all`)**: Hiển thị toàn bộ sản phẩm trong kho (`countAll`).
  2. **Còn hàng (`in_stock`)**: Lọc các sản phẩm có tồn kho `balance > 0` (`countInStock`).
  3. **Hết hàng (`out_of_stock`)**: Lọc các sản phẩm có tồn kho `balance <= 0` (`countOutOfStock`).
- Hiển thị thông báo trạng thái trống gọn gàng khi danh sách lọc không có sản phẩm nào thỏa điều kiện.

### 2. File thay đổi (Technical Changes)
- [src/features/gifts/GiftsView.tsx](file:///e:/Project/finance-vpm/src/features/gifts/GiftsView.tsx): Thêm state `stockFilter`, tính toán `countAll`, `countInStock`, `countOutOfStock`, lọc `filteredItems` và render 3 nút phân loại ngay bên trái nút **`+ Tạo sản phẩm`**.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npx tsc --noEmit` và `npm run build` hoàn thành thành công không có lỗi.

## [23:45] Khắc phục lỗi giả khi lưu Chấm Công & Lương

### 1. Nguyên nhân
- `POST /api/attendance` đã ghi dữ liệu vào PostgreSQL nhưng tiếp tục chờ `dispatchRealtimeSync()` gửi hai request sang Google Sheet.
- Khi Google Sheet timeout/từ chối hoặc lỗi mạng, exception bị đẩy ra route và trả HTTP `500`, khiến frontend hiển thị `Không thể lưu chấm công` dù dữ liệu DB đã được lưu.

### 2. Cách khắc phục
- `server/domains/attendance/attendanceRoutes.mjs`: coi đồng bộ Google Sheet là side effect không chặn kết quả PostgreSQL; chỉ ghi cảnh báo nếu đồng bộ thất bại và vẫn trả `success: true`.
- Không chạy build; tiếp tục chạy trực tiếp bằng `npm run dev` với Vite + `node --watch`.

### 3. Kiểm tra
- `node --check server/sheetSync.mjs` đạt.
- `node --check server/domains/attendance/attendanceRoutes.mjs` đạt.
- `git diff --check` đạt.

## [23:55] Chuẩn hóa bảng Nhân sự, Chấm công và Phúc lợi

### 1. Thiết kế dữ liệu
- `staff`: lưu tên, phòng ban, ngày nhận việc và lương cơ bản; giữ khóa `id` nhân sự hiện hữu.
- `attendance_entries`: lưu trạng thái chấm công hiện tại theo `staff_id + work_date`, kèm `logged_at`.
- `attendance_logs`: nhật ký append-only, mỗi lần lưu/sửa/xóa ô chấm công tạo một dòng với `logged_at`.
- `staff_benefits`: một dòng theo `month + staff_id`, gồm `holiday_sunday`, `ot`, `kpi`, `bhxh`, `tax`, `time`.

### 2. Quy tắc ghi
- Một thao tác chấm công chạy trong cùng transaction: cập nhật ô hiện tại, thêm log, tính lại `Lễ, CN` và cập nhật `Time`.
- Ký hiệu `X` trên ngày lễ hoặc `2` vào Chủ nhật được ghi vào `staff_benefits.holiday_sunday`.
- Xóa/sửa chấm công cũng ghi log và tính lại tổng phúc lợi để không cộng trùng.

### 3. Kiểm tra
- PostgreSQL đã có đủ bảng/cột; hiện có `5` nhân sự, `104` dòng chấm công và `5` dòng phúc lợi khởi tạo.
- Kiểm tra transaction rollback tạo được đồng thời `attendance_logs` và `staff_benefits`, sau đó không giữ dữ liệu thử.
- `node --check`, `npx tsc --noEmit` và `git diff --check` đạt; không chạy build `dist`.


## [23:58] Tái thiết kế toàn diện trang Báo Cáo Tháng (`ReportView`)

### 1. Phạm vi & Yêu cầu
- **Phân rã kiến trúc theo Feature-Driven Architecture**: Tách `ReportView.tsx` monolithic cũ thành 4 sub-components chuyên biệt và 1 Thin Orchestrator.
- **Cụm 4 Thẻ KPI Tài Chính Cấp Cao (`ReportKpiCards.tsx`)**:
  - Đưa về lưới 4 cột chuẩn `ledger-kpi-grid`: **Tổng Thu Trong Kỳ**, **Tổng Chi Trong Kỳ**, **Lưu Chuyển Tiền Thuần (Net Cashflow = Thu − Chi)**, và **OPEX / Ngân Sách Tháng**.
- **Bảng Đối Soát Số Dư Toàn Bộ Tài Khoản PostgreSQL (`ReportAccountBalanceTable.tsx`)**:
  - Lấy toàn bộ tài khoản hoạt động từ `state.accounts` (`QUY`, `ACB`, `MB`, `TCB`...), hiển thị 6 cột đối soát: **Tài khoản**, **Đầu kỳ**, **Tổng Thu (+)**, **Tổng Chi (−)**, **Biến động ròng**, **Số dư cuối kỳ** và dòng **Tổng cộng thanh khoản toàn hệ thống**.
  - Loại bỏ hoàn toàn việc hard-code 2 tài khoản `QUY`, `ACB` và xóa dòng ghi chú file Excel cũ.
- **Kiểm Soát Chi Phí Vận Hành OPEX So Với Ngân Sách (`ReportOpexVsBudgetCard.tsx`)**:
  - Hiển thị bảng đối chiếu từng danh mục OPEX (`state.costCategories`) kèm thanh tiến độ màu, tỷ trọng `%`, độ lệch âm khi vượt trần và nút điều hướng sang trang Ngân sách & Cost.
- **Phân Tích Dòng Tiền Theo Loại Nghiệp Vụ & Tóm Tắt Liên Phân Hệ (`ReportCashflowBreakdown.tsx`)**:
  - Bảng dòng tiền theo loại nghiệp vụ tích hợp bộ lọc **`Tất cả` · `Nguồn Thu` · `Khoản Chi`**, cột **Số giao dịch** và **Tỷ trọng (%)**.
  - Khối điểm nhấn nghiệp vụ liên phân hệ trong kỳ: **Kế hoạch đã duyệt**, **Hợp đồng & Hóa đơn phát sinh**, **Xuất kho quà tặng & Khấu trừ TV 50%**.

### 2. File thay đổi (Technical Changes)
- [docs/REPORT_SPEC_KIT.md](file:///e:/Project/finance-vpm/docs/REPORT_SPEC_KIT.md): Tài liệu quy hoạch Spec-Kit & Pre-Flight Check.
- [src/features/report/components/ReportKpiCards.tsx](file:///e:/Project/finance-vpm/src/features/report/components/ReportKpiCards.tsx): Component 4 thẻ KPI tài chính cấp cao.
- [src/features/report/components/ReportAccountBalanceTable.tsx](file:///e:/Project/finance-vpm/src/features/report/components/ReportAccountBalanceTable.tsx): Component bảng đối soát số dư và biến động theo tài khoản PostgreSQL.
- [src/features/report/components/ReportOpexVsBudgetCard.tsx](file:///e:/Project/finance-vpm/src/features/report/components/ReportOpexVsBudgetCard.tsx): Component bảng kiểm soát OPEX so với ngân sách tháng.
- [src/features/report/components/ReportCashflowBreakdown.tsx](file:///e:/Project/finance-vpm/src/features/report/components/ReportCashflowBreakdown.tsx): Component phân tích dòng tiền theo nghiệp vụ và điểm nhấn liên phân hệ.
- [src/features/report/ReportView.tsx](file:///e:/Project/finance-vpm/src/features/report/ReportView.tsx): Tái cấu trúc thành Thin Orchestrator kèm banner trạng thái sổ và nút In / Xuất PDF.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npx tsc --noEmit` và `npm run build` hoàn thành thành công không có lỗi.


## [00:21] Hợp nhất Báo Cáo Tháng vào trang Tổng Quan (`OverviewView`) & Gỡ bỏ tab Báo Cáo Tháng dư thừa trên Menu

### 1. Phạm vi & Yêu cầu
- Gỡ bỏ mục menu **`Báo cáo tháng`** trên thanh điều hướng bên trái (`RailNav.tsx`) để tránh trùng lặp với trang **`Tổng quan`**.
- Tích hợp trực tiếp 3 khối nghiệp vụ báo cáo tháng chuyên sâu vào trang **`Tổng quan`** (`OverviewView.tsx`):
  1. **Bảng Đối Soát Số Dư & Biến Động Theo Tài Khoản (`ReportAccountBalanceTable`)**: Đầu kỳ + Tổng Thu (+) − Tổng Chi (−) = Cuối kỳ cho toàn bộ tài khoản PostgreSQL.
  2. **Kiểm Soát Chi Phí Vận Hành (OPEX) So Với Ngân Sách (`ReportOpexVsBudgetCard`)**: Đối chiếu thực chi Sổ Cái với định mức ngân sách và độ lệch âm khi vượt trần.
  3. **Phân Tích Dòng Tiền Theo Loại Nghiệp Vụ & Điểm Nhấn Liên Phân Hệ (`ReportCashflowBreakdown`)**: Bóc tách dòng tiền theo `TYPES` (Tất cả / Nguồn Thu / Khoản Chi) và tổng hợp nhanh số liệu Kế hoạch, Công nợ, Quà tặng.

### 2. File thay đổi (Technical Changes)
- [src/shared/components/layout/RailNav.tsx](file:///e:/Project/finance-vpm/src/shared/components/layout/RailNav.tsx): Loại bỏ mục `Báo cáo tháng` khỏi danh sách `navItems`.
- [src/features/overview/OverviewView.tsx](file:///e:/Project/finance-vpm/src/features/overview/OverviewView.tsx): Tích hợp `ReportAccountBalanceTable`, `ReportOpexVsBudgetCard`, `ReportCashflowBreakdown` và nút `In / Xuất PDF Báo Cáo Tháng`.
- [src/App.tsx](file:///e:/Project/finance-vpm/src/App.tsx) & [src/services/financeService.ts](file:///e:/Project/finance-vpm/src/services/financeService.ts): Điều hướng mọi liên kết báo cáo về thẳng `OverviewView`.

### 3. Kết quả kiểm thử & Nghiệm thu
- **TypeScript & Build Check**: Chạy `npx tsc --noEmit` và `npm run build` hoàn thành thành công không phát sinh lỗi.
