# 📐 BẢN QUY HOẠCH SPEC-KIT & PRE-FLIGHT CHECK: Tái Thiết Kế Toàn Diện Trang Báo Cáo Tháng (`ReportView`)

> **Dự án:** `finance-vpm` (`admin_orderlist`)  
> **Phiên bản:** 1.0  
> **Tác giả:** 📝 Lead Planner & Chronicler · 💰 Finance Specialist · 🎨 Frontend Lead  
> **Thẩm định:** 👑 Orchestrator Agent & 👑 Master (Sếp)  
> **Trạng thái:** ✅ Đã hoàn thành triển khai & Nghiệm thu (Implemented & Verified)

---

## 📋 1. SPEC-KIT: ĐẶC TẢ NGHIỆP VỤ & PHẠM VI (SDD)

### 1.1. User Stories & Bóc Tách Phạm Vi

1. **Cụm 4 Thẻ KPI Tài Chính Cấp Cao (`ReportKpiCards.tsx`)**:
   - **Là** Master, **tôi muốn** nhìn thấy ngay bức tranh tổng quát P&L và lưu chuyển tiền tệ của tháng đang chọn thông qua 4 thẻ KPI hiện đại (`ledger-kpi-grid`), **để** nắm bắt tức thì sức khỏe dòng tiền trong 5 giây:
     1. **Tổng Thu Trong Kỳ (`Total Cash In`)**: Tổng dòng tiền vào trong tháng, số lượng giao dịch thu và % so với tháng trước.
     2. **Tổng Chi Trong Kỳ (`Total Cash Out`)**: Tổng dòng tiền ra trong tháng (tách rõ Chi vận hành OPEX và Chi ứng phí/khác) kèm số lượng giao dịch chi.
     3. **Lưu Chuyển Tiền Thuần (`Net Cashflow = Thu − Chi`)**: Hiển thị rõ Thặng dư (`+X đ`, màu xanh `var(--good)`) hoặc Thâm hụt (`−X đ`, màu đỏ `var(--bad)`).
     4. **Kiểm Soát Ngân Sách OPEX (`OPEX vs Budget`)**: Thực chi OPEX trên Tổng định mức ngân sách tháng, kèm thanh mini progress bar và độ lệch (chỉ tính độ lệch khi âm/vượt định mức).

2. **Bảng Đối Soát Số Dư Toàn Bộ Tài Khoản Từ PostgreSQL (`ReportAccountBalanceTable.tsx`)**:
   - **Là** Master, **tôi muốn** xem bảng cân đối số dư của **toàn bộ tài khoản thực tế trong PostgreSQL (`state.accounts`)** gồm cả Tiền mặt và các Ngân hàng (`QUY`, `ACB`, `MB`, `TCB`...), **để** đối soát chính xác:
     - **Số dư đầu kỳ (`Opening`)**
     - **Tổng Thu trong kỳ (`+ Cash In`)**
     - **Tổng Chi trong kỳ (`− Cash Out`)**
     - **Biến động ròng (`Net Change`)**
     - **Số dư cuối kỳ (`Closing = Opening + In − Out`)**
   - Loại bỏ hoàn toàn việc chỉ hard-code 2 tài khoản `QUY`, `ACB` và gỡ bỏ dòng ghi chú cũ từ thời file Excel.

3. **Báo Cáo Kiểm Soát Chi Phí Vận Hành (OPEX) So Với Ngân Sách (`ReportOpexVsBudgetCard.tsx`)**:
   - **Là** Master, **tôi muốn** theo dõi từng danh mục chi phí OPEX (`state.costCategories` từ PostgreSQL) với thanh tiến độ trực quan, tỷ trọng `%` trên tổng OPEX, định mức được duyệt và độ lệch âm khi vượt trần, **để** biết danh mục nào đang tiêu tốn nhiều ngân sách nhất.
   - Gỡ bỏ form nhập ngân sách inline trùng lặp (thay bằng nút chuyển nhanh sang phân hệ **Ngân sách & Cost**).

4. **Phân Tích Dòng Tiền Theo Loại Nghiệp Vụ & Tóm Tắt Hoạt Động Tháng (`ReportCashflowBreakdown.tsx`)**:
   - **Bảng Phân Tích Dòng Tiền Theo Nghiệp Vụ**:
     - Cho phép lọc theo 3 tab: **`Tất cả`**, **`Nguồn Thu (+)`**, **`Khoản Chi (−)`**.
     - Hiển thị thêm cột **Số giao dịch**, **Tỷ trọng (%)**, **Thu**, **Chi** và dòng tổng kết **Dòng tiền ròng**.
   - **Khối Tóm Tắt Hoạt Động Liên Phân Hệ Trong Tháng**:
     - Tổng hợp nhanh số liệu **Kế hoạch đã duyệt**, **Công nợ Hợp đồng phát sinh**, và **Quà tặng & Khấu trừ TV 50%**.

---

### 1.2. Reuse Audit & Ranh Giới An Toàn (Redlines)

#### ♻️ Tái sử dụng tài nguyên có sẵn (Reuse Audit)
- Tái sử dụng các hàm tính toán chuẩn trong [src/services/financeService.ts](file:///e:/Project/finance-vpm/src/services/financeService.ts): `monthTx`, `opexBy`, `calculateBalance`.
- Tái sử dụng bộ formatters trong [src/utils/formatters.ts](file:///e:/Project/finance-vpm/src/utils/formatters.ts): `fmt`, `fm`, `mil`, `monthLabel`, `lastDay`, `prevMonth`.
- Tái sử dụng hệ thống CSS Design System trong [src/index.css](file:///e:/Project/finance-vpm/src/index.css): `.ledger-kpi-grid`, `.ledger-kpi-card`, `.ledger-kpi-badge`, `.card-box`, `.grid-2col`, `.table-scroll`, `.chip`.

#### 🚫 Ranh giới an toàn (Redlines — CẤM LÀM)
- ❌ **CẤM** giữ lại dữ liệu hoặc dòng chữ chú thích hard-code cũ của file Excel.
- ❌ **CẤM** hiển thị độ lệch dương khi chi phí chưa vượt định mức (tuân thủ quy tắc: *"Chưa âm sẽ không tính độ lệch"*).
- ❌ **CẤM** dồn toàn bộ code vào 1 file `ReportView.tsx` độc bản khổng lồ (bắt buộc tách thành các sub-components theo Feature-Driven Architecture).

---

### 1.3. Tiêu Chí Nghiệm Thu Gherkin (Acceptance Criteria)

```gherkin
Feature: Tái thiết kế trang Báo Cáo Tháng (ReportView)

  Scenario: Hiển thị 4 thẻ KPI tài chính cấp cao của tháng
    Given Người dùng mở trang "Báo cáo tháng"
    Then Hệ thống hiển thị 4 thẻ KPI trên lưới 4 cột cân đối:
      | Tổng Thu Trong Kỳ (kèm số giao dịch & so sánh tháng trước) |
      | Tổng Chi Trong Kỳ (tách rõ OPEX và Chi khác)               |
      | Lưu Chuyển Tiền Thuần (Net Cashflow = Thu - Chi)           |
      | Kiểm Soát Ngân Sách OPEX (Thực chi / Định mức & Độ lệch)   |

  Scenario: Đối soát số dư Đầu kỳ - Thu - Chi - Cuối kỳ của toàn bộ tài khoản PostgreSQL
    Given Hệ thống có danh sách tài khoản trong PostgreSQL (state.accounts)
    When Người dùng xem bảng "Đối Soát Số Dư & Biến Động Theo Tài Khoản"
    Then Bảng hiển thị đầy đủ các cột: Đầu kỳ, Tổng Thu (+), Tổng Chi (-), Biến động ròng, Cuối kỳ cho từng tài khoản và dòng Tổng cộng

  Scenario: Phân tích chi phí OPEX so với Ngân sách và Dòng tiền theo nghiệp vụ
    Given Người dùng xem phần phân tích chi phí và dòng tiền trong tháng
    Then Bảng OPEX hiển thị thanh tiến độ màu, tỷ trọng % và chỉ hiển thị Độ lệch khi vượt định mức (số âm)
    And Bảng Dòng tiền theo loại hỗ trợ lọc Tất cả / Nguồn Thu / Khoản Chi kèm số lượng giao dịch và tỷ trọng %
```

---

## 🛑 2. PRE-FLIGHT CHECK KỸ THUẬT & PHƯƠNG ÁN THỰC THI

### 2.1. Vấn Đề / Nguyên Nhân Gốc (Root Cause)
1. **Giao diện `ReportView.tsx` hiện tại cũ kỹ và monolithic**:
   - Toàn bộ 270 dòng code nằm chung trong 1 file [src/features/report/ReportView.tsx](file:///e:/Project/finance-vpm/src/features/report/ReportView.tsx), chưa tách sub-components.
   - 4 ô đầu trang dùng `.metric-tile` đơn sơ, thiếu hẳn chỉ số cốt lõi quan trọng nhất của báo cáo tháng là **Tổng Thu**, **Tổng Chi** và **Lưu chuyển tiền thuần (Net Cashflow)**.
2. **Hard-code tài khoản & chú thích cũ**:
   - Bảng số dư tại [src/features/report/ReportView.tsx](file:///e:/Project/finance-vpm/src/features/report/ReportView.tsx#L245-L265) chỉ lặp qua `(['QUY', 'ACB'] as const)`, bỏ sót các tài khoản ngân hàng khác trong `state.accounts` (`MB`, `TCB`...), thiếu cột phát sinh `Thu` / `Chi` trong kỳ và vẫn còn dòng text nhắc file Excel cũ.
3. **Trùng lặp form giao ngân sách**:
   - Form `Giao ngân sách` inline tại [src/features/report/ReportView.tsx](file:///e:/Project/finance-vpm/src/features/report/ReportView.tsx#L156-L185) bị trùng lặp với trang `BudgetControlView.tsx`.

### 2.2. Phương Án Đề Xuất (Checklist Tuần Tự Theo Feature-Driven Architecture)
- [x] **Task 1 — Tạo `ReportKpiCards.tsx`**:
  - Thiết kế 4 thẻ KPI chuẩn `ledger-kpi-grid`: Tổng Thu Trong Kỳ, Tổng Chi Trong Kỳ, Lưu Chuyển Tiền Thuần (Net Cashflow), và Thực Chi OPEX / Ngân Sách.
- [x] **Task 2 — Tạo `ReportAccountBalanceTable.tsx`**:
  - Bảng đối soát thanh khoản toàn bộ tài khoản từ `state.accounts` với 6 cột: Tài khoản, Đầu kỳ, Thu trong kỳ (`+`), Chi trong kỳ (`−`), Biến động ròng, Cuối kỳ + dòng Tổng cộng.
- [x] **Task 3 — Tạo `ReportOpexVsBudgetCard.tsx`**:
  - Biểu đồ thanh tiến độ kết hợp bảng đối soát OPEX vs Định mức ngân sách (chỉ hiển thị độ lệch khi âm) + nút chuyển nhanh sang trang Ngân sách & Cost.
- [x] **Task 4 — Tạo `ReportCashflowBreakdown.tsx`**:
  - Bảng phân tích dòng tiền theo loại nghiệp vụ (`TYPES`) có bộ lọc `Tất cả / Thu / Chi`, cột số lượng giao dịch, tỷ trọng `%` và khối tóm tắt hoạt động liên phân hệ (Kế hoạch, Công nợ, Quà tặng).
- [x] **Task 5 — Nâng cấp `ReportView.tsx` (Thin Orchestrator)**:
  - Kết nối các components, thêm thanh tiêu đề kỳ báo cáo với trạng thái Khóa sổ / Mở sổ và nút In / Xuất báo cáo.

### 2.3. Các File Dự Kiến Tác Động
1. [src/features/report/components/ReportKpiCards.tsx](file:///e:/Project/finance-vpm/src/features/report/components/ReportKpiCards.tsx) *(Mới)*
2. [src/features/report/components/ReportAccountBalanceTable.tsx](file:///e:/Project/finance-vpm/src/features/report/components/ReportAccountBalanceTable.tsx) *(Mới)*
3. [src/features/report/components/ReportOpexVsBudgetCard.tsx](file:///e:/Project/finance-vpm/src/features/report/components/ReportOpexVsBudgetCard.tsx) *(Mới)*
4. [src/features/report/components/ReportCashflowBreakdown.tsx](file:///e:/Project/finance-vpm/src/features/report/components/ReportCashflowBreakdown.tsx) *(Mới)*
5. [src/features/report/ReportView.tsx](file:///e:/Project/finance-vpm/src/features/report/ReportView.tsx) *(Cập nhật)*

### 2.4. Rủi Ro (Side Effects) & Đối Sách
- **Rủi ro**: Khi `state.accounts` chưa kịp tải hoặc rỗng, bảng số dư tài khoản có thể thiếu dòng.
- **Đối sách**: Fallback an toàn từ `state.accounts` (lọc `status !== 'inactive'`) sang danh sách `ACC` mặc định nếu `state.accounts` trống, đồng thời hiển thị mọi tài khoản có phát sinh giao dịch trong kỳ.

### 2.5. Kế Hoạch Kiểm Thử (Testing Plan)
- Chạy `npx tsc --noEmit` và `npm run build` kiểm tra không có lỗi TypeScript hoặc bundle.
- Kiểm tra tính đúng đắn của công thức: `Số dư cuối kỳ = Số dư đầu kỳ + Tổng Thu trong kỳ - Tổng Chi trong kỳ`.
