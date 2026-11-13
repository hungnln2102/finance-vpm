# 📐 BẢN QUY HOẠCH SPEC-KIT & PRE-FLIGHT CHECK: Nâng Cấp Trang Quà & Ấn Phẩm (`GiftsView`) — v1.1 (DB Persistence & Tạo Sản Phẩm Mới)

> **Dự án:** `finance-vpm` (`admin_orderlist`)  
> **Phiên bản:** 1.2  
> **Tác giả:** 📝 Lead Planner & Chronicler · ⚙️ Backend Specialist · 🎨 Frontend Lead  
> **Thẩm định:** 👑 Orchestrator Agent & 👑 Master (Sếp)  
> **Trạng thái:** ✅ Đã hoàn thành triển khai & Nghiệm thu (Phase 1, 2 & 3: Lưu trữ 100% PostgreSQL, Button `+ Tạo sản phẩm` & Bộ lọc `Tất cả` · `Còn hàng` · `Hết hàng`)

---

## 📋 1. SPEC-KIT: ĐẶC TẢ NGHIỆP VỤ & PHẠM VI (SDD)

### 1.1. User Stories & Bóc Tách Phạm Vi

1. **Lưu trữ 100% dữ liệu Sản phẩm & Xuất/Nhập kho trong PostgreSQL (Không dùng dữ liệu thô)**:
   - **Là** Master, **tôi muốn** toàn bộ danh mục sản phẩm quà tặng (`gift_items`) và lịch sử xuất/nhập kho (`gift_movements`) đều được đọc/ghi trực tiếp từ PostgreSQL (`schema: finance_vpm`), **để** dữ liệu nhất quán tuyệt đối, không phụ thuộc dữ liệu thô (raw/hard-code) hay chỉ lưu tạm ở client.
   - **Backend & Database**:
     - Chuẩn hóa bảng `finance_vpm.gift_items` (`id`, `name`, `unit`, `price`, `created_at`, `updated_at`) và `finance_vpm.gift_movements` trong `dbSchema.mjs` & `initDbService.mjs`.
     - Bổ sung API `GET /api/gifts/items` và `POST /api/gifts/items` trong `giftsRoutes.mjs` / `giftsService.mjs` (hỗ trợ tạo sản phẩm mới và nếu có số lượng tồn đầu `initialQty > 0` thì ghi nhận phiếu nhập kho khởi tạo trong cùng 1 PostgreSQL ACID transaction `withTransaction`).
     - Cập nhật `POST /api/gifts/movements` kiểm tra sự tồn tại của sản phẩm và kiểm soát tồn kho trực tiếp trong PostgreSQL trước khi trừ kho.
   - **Frontend State**:
     - Khi tải trang (`AppContext.tsx`), đồng bộ trực tiếp `gifts.items` và `gifts.mv` từ `/api/state` (PostgreSQL).
     - Mọi thao tác **Tạo sản phẩm mới** (`addGiftItem`) và **Tạo phiếu xuất/nhập** (`addGiftMovement`) đều gọi API ghi trực tiếp xuống PostgreSQL và cập nhật lại state từ kết quả trả về của server.

2. **Bổ sung Button `+ Tạo sản phẩm` ngay phía trên khu vực các thẻ sản phẩm (`GiftCreateItemModal.tsx`)**:
   - **Là** Master / Quản trị viên, **tôi muốn** có một nút **`+ Tạo sản phẩm`** nằm ngay phía trên lưới các thẻ vật phẩm (khu vực đóng khung đỏ), **để** thêm nhanh sản phẩm/ấn phẩm mới vào hệ thống và lưu thẳng vào PostgreSQL.
   - **Giao diện trên `GiftsView.tsx`**:
     - Thiết kế thanh tiêu đề khu vực sản phẩm: Bên trái hiển thị tiêu đề **"Danh mục quà tặng & ấn phẩm"** kèm badge tổng số sản phẩm; bên phải đặt nút **`+ Tạo sản phẩm`** nổi bật.
   - **Modal Tạo Sản Phẩm Mới (`GiftCreateItemModal.tsx`)**:
     - Tự động gợi ý **Mã sản phẩm** tiếp theo (ví dụ: đang có `Q01`..`Q06` sẽ tự động gợi ý `Q07`, cho phép sửa tay và chặn trùng mã).
     - Nhập **Tên sản phẩm / ấn phẩm** (bắt buộc, VD: *Lịch để bàn 2027*).
     - Nhập **Đơn vị tính** (bắt buộc, VD: *hộp, phần, cuốn, cái, tờ, bộ*).
     - Nhập **Đơn giá (đ)** (bắt buộc, `>= 0`).
     - Nhập **Số lượng nhập kho ban đầu** (tùy chọn, mặc định `0` — nếu `> 0` sẽ tự động tạo luôn phiếu nhập kho đầu kỳ trong DB).

3. **Bộ lọc phân loại trạng thái tồn kho sản phẩm (`Tất cả` / `Còn hàng` / `Hết hàng`) trên thanh tiêu đề danh mục**:
   - **Là** Master, **tôi muốn** tại vị trí phía trên bên trái của lưới thẻ sản phẩm hiển thị bộ tab phân loại gồm 3 hạng mục: **Tất cả**, **Còn hàng** (`balance > 0`), và **Hết hàng** (`balance <= 0`) kèm số lượng sản phẩm tương ứng, **để** lọc nhanh các vật phẩm đang còn hoặc đã hết trong kho.
   - Khi chọn tab nào, lưới thẻ sản phẩm bên dưới chỉ hiển thị đúng các sản phẩm thuộc nhóm đó (nếu danh sách rỗng thì hiển thị thông báo trạng thái trống trực quan).

4. **Các tính năng đã hoàn thành ở Phase 1 & Phase 2 (Giữ nguyên & Kết nối đồng bộ)**:
   - Thẻ vật phẩm hiển thị 3 chỉ số **Nhập - Đã Xuất - Tồn kho** (`GiftItemCard.tsx`).
   - Click vào thẻ mở Modal lịch sử xuất/nhập riêng của sản phẩm đó (`GiftDetailModal.tsx`).
   - Nút **`+ Tạo phiếu xuất / nhập`** mở Modal tạo phiếu (`GiftMovementModal.tsx`).

---

### 1.2. Reuse Audit & Ranh Giới An Toàn (Redlines)

#### ♻️ Tái sử dụng tài nguyên có sẵn (Reuse Audit)
- **Backend**:
  - Tái sử dụng `pool`, `withTransaction` từ [server/config/dbPool.mjs](file:///e:/Project/finance-vpm/server/config/dbPool.mjs).
  - Tái sử dụng `TABLES.GIFT_ITEMS`, `TABLES.GIFT_MOVEMENTS`, `tableName` từ [server/config/dbSchema.mjs](file:///e:/Project/finance-vpm/server/config/dbSchema.mjs#L16-L17).
  - Tái sử dụng `recordAuditLog` từ [server/db.mjs](file:///e:/Project/finance-vpm/server/db.mjs) và `dispatchRealtimeSync` từ [server/sheetSync.mjs](file:///e:/Project/finance-vpm/server/sheetSync.mjs).
- **Frontend**:
  - Tái sử dụng chuẩn `.modal-backdrop`, `.modal-window`, `.modal-header`, `.modal-body`, `.modal-footer`, `.card-box`, `.btn.primary` từ [src/index.css](file:///e:/Project/finance-vpm/src/index.css).
  - Tái sử dụng `calculateGiftStock` từ [src/services/inventoryService.ts](file:///e:/Project/finance-vpm/src/services/inventoryService.ts) và `fmt` từ [src/utils/formatters.ts](file:///e:/Project/finance-vpm/src/utils/formatters.ts).

#### 🚫 Ranh giới an toàn (Redlines — CẤM LÀM)
- ❌ **CẤM** lưu dữ liệu sản phẩm mới hoặc phiếu xuất/nhập chỉ ở state/localStorage mà không ghi vào PostgreSQL.
- ❌ **CẤM** hard-code danh sách sản phẩm trong code frontend hoặc backend.
- ❌ **CẤM** để lỗi đồng bộ Google Sheet (khi chưa cấu hình URL) làm rollback hoặc thất bại việc lưu vào PostgreSQL.

---

### 1.3. Tiêu Chí Nghiệm Thu Gherkin (Acceptance Criteria)

```gherkin
Feature: Lưu trữ PostgreSQL toàn diện và Tạo sản phẩm mới tại Kho Quà Tặng & Ấn Phẩm

  Scenario: Hiển thị nút "+ Tạo sản phẩm" phía trên danh sách thẻ vật phẩm
    Given Người dùng đang ở màn hình "Kho Quà Tặng & Ấn Phẩm"
    Then Phía trên lưới các thẻ sản phẩm hiển thị thanh tiêu đề "Danh mục quà tặng & ấn phẩm"
    And Hiển thị nút "+ Tạo sản phẩm" rõ ràng bên góc phải phía trên các thẻ sản phẩm

  Scenario: Tạo sản phẩm mới lưu trực tiếp vào PostgreSQL
    Given Người dùng bấm vào nút "+ Tạo sản phẩm"
    When Modal "Tạo Sản Phẩm / Ấn Phẩm Mới" mở ra với mã gợi ý tự động (VD: Q07)
    And Người dùng nhập Tên sản phẩm, Đơn vị tính, Đơn giá và bấm "Lưu sản phẩm"
    Then Hệ thống gọi API POST /api/gifts/items lưu bản ghi mới vào bảng finance_vpm.gift_items trong PostgreSQL
    And Thẻ sản phẩm mới xuất hiện ngay lập tức trên lưới thẻ vật phẩm và giữ nguyên sau khi tải lại trang (F5)

  Scenario: Tạo sản phẩm mới kèm số lượng nhập kho ban đầu (ACID Transaction)
    Given Người dùng đang ở trong Modal "Tạo Sản Phẩm / Ấn Phẩm Mới"
    When Người dùng nhập thông tin sản phẩm mới kèm "Số lượng nhập kho ban đầu" > 0
    Then Hệ thống lưu đồng thời sản phẩm vào bảng finance_vpm.gift_items và phiếu nhập vào finance_vpm.gift_movements trong cùng 1 transaction
    And Thẻ sản phẩm mới hiển thị ngay số lượng Nhập và Tồn kho tương ứng
```

---

## 🛑 2. PRE-FLIGHT CHECK KỸ THUẬT & PHƯƠNG ÁN THỰC THI

### 2.1. Vấn Đề / Nguyên Nhân Gốc (Root Cause)
1. **Thiếu API & luồng lưu trữ sản phẩm vào PostgreSQL**:
   - Bảng `finance_vpm.gift_items` hiện chỉ có 6 dòng dữ liệu cũ (`Q01`..`Q06`) được nạp từ thời còn seed data.
   - Tại [server/domains/gifts/giftsRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsRoutes.mjs) và [server/domains/gifts/giftsService.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsService.mjs), mới chỉ có hàm `insertGiftMovement` (`POST /api/gifts/movements`), hoàn toàn chưa có API `POST /api/gifts/items` để thêm sản phẩm mới vào DB.
   - Ngoài ra, trong `giftsRoutes.mjs`, lệnh `await dispatchRealtimeSync(...)` đang gọi trực tiếp không bọc xử lý khi `GOOGLE_SHEET_API_URL` trống, dễ gây trả về HTTP 500 dù DB đã ghi xong.
2. **Thiếu nút & Modal tạo sản phẩm trên giao diện `GiftsView.tsx`**:
   - Khu vực lưới thẻ sản phẩm (`Q01`..`Q06`) trong [src/features/gifts/GiftsView.tsx](file:///e:/Project/finance-vpm/src/features/gifts/GiftsView.tsx#L87-L99) hiện chưa có thanh header và chưa có nút **`+ Tạo sản phẩm`**.

### 2.2. Phương Án Đề Xuất (Checklist Tuần Tự)
- [x] **Task 1 — Nâng cấp Backend Service & Routes (`giftsService.mjs` & `giftsRoutes.mjs`)**:
  - Bổ sung `getGiftItems()`, `createGiftItem({ id, name, unit, price, initialQty, who, note })` sử dụng `withTransaction` chuẩn ACID trong [server/domains/gifts/giftsService.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsService.mjs).
  - Kiểm tra tồn kho khả dụng ngay trong `insertGiftMovement` (chặn xuất âm kho ở tầng DB).
  - Bổ sung route `GET /api/gifts/items` và `POST /api/gifts/items` trong [server/domains/gifts/giftsRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsRoutes.mjs).
  - Đảm bảo `SELECT ... FROM gift_items ORDER BY id ASC` trong [server/domains/state/stateService.mjs](file:///e:/Project/finance-vpm/server/domains/state/stateService.mjs#L36).
- [x] **Task 2 — Kết nối API Client & Context Actions (`apiClient.ts`, `useOperationsActions.ts`, `AppContext.tsx`)**:
  - Thêm `apiClient.addGiftItem(...)` và nâng cấp `apiClient.addGiftMovement(...)` trả về dữ liệu chuẩn từ PostgreSQL trong [src/services/apiClient.ts](file:///e:/Project/finance-vpm/src/services/apiClient.ts).
  - Thêm hàm `addGiftItem` vào [src/context/actions/useOperationsActions.ts](file:///e:/Project/finance-vpm/src/context/actions/useOperationsActions.ts) và khai báo trong [src/context/AppContextInstance.ts](file:///e:/Project/finance-vpm/src/context/AppContextInstance.ts).
  - Chuẩn hóa việc nạp `gifts` từ PostgreSQL trong [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx#L65-L76) và loại bỏ việc lưu `gifts` thô vào `localStorage`.
- [x] **Task 3 — Tạo Modal `GiftCreateItemModal.tsx` & Bổ sung nút `+ Tạo sản phẩm` trên `GiftsView.tsx`**:
  - Tạo [src/features/gifts/components/GiftCreateItemModal.tsx](file:///e:/Project/finance-vpm/src/features/gifts/components/GiftCreateItemModal.tsx) với form tạo sản phẩm mới (Mã tự động gợi ý, Tên sản phẩm, Đơn vị tính, Đơn giá, Số lượng nhập ban đầu).
  - Cập nhật [src/features/gifts/GiftsView.tsx](file:///e:/Project/finance-vpm/src/features/gifts/GiftsView.tsx) thêm thanh tiêu đề phía trên khu vực thẻ vật phẩm kèm nút **`+ Tạo sản phẩm`**.

### 2.3. Các File Dự Kiến Tác Động
1. [server/domains/gifts/giftsService.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsService.mjs)
2. [server/domains/gifts/giftsRoutes.mjs](file:///e:/Project/finance-vpm/server/domains/gifts/giftsRoutes.mjs)
3. [server/domains/state/stateService.mjs](file:///e:/Project/finance-vpm/server/domains/state/stateService.mjs)
4. [src/services/apiClient.ts](file:///e:/Project/finance-vpm/src/services/apiClient.ts)
5. [src/context/AppContextInstance.ts](file:///e:/Project/finance-vpm/src/context/AppContextInstance.ts)
6. [src/context/AppContext.tsx](file:///e:/Project/finance-vpm/src/context/AppContext.tsx)
7. [src/context/actions/useOperationsActions.ts](file:///e:/Project/finance-vpm/src/context/actions/useOperationsActions.ts)
8. [src/features/gifts/components/GiftCreateItemModal.tsx](file:///e:/Project/finance-vpm/src/features/gifts/components/GiftCreateItemModal.tsx) *(Mới)*
9. [src/features/gifts/GiftsView.tsx](file:///e:/Project/finance-vpm/src/features/gifts/GiftsView.tsx)

### 2.4. Rủi Ro (Side Effects) & Đối Sách
- **Rủi ro 1**: Trùng mã sản phẩm (`id` khóa chính trong `finance_vpm.gift_items`) khi người dùng nhập mã đã tồn tại.
  - *Đối sách*: Kiểm tra trùng mã ngay trên form (`existingIds`) và dùng `SELECT 1 FROM gift_items WHERE id = $1` trong transaction Backend để trả thông báo lỗi rõ ràng.
- **Rủi ro 2**: Khi tạo sản phẩm mới có kèm số lượng tồn đầu (`initialQty > 0`), nếu lưu rời rạc 2 request có thể lệch dữ liệu.
  - *Đối sách*: Bọc cả lệnh `INSERT INTO gift_items` và `INSERT INTO gift_movements` trong cùng 1 transaction `withTransaction` tại `giftsService.mjs`.

### 2.5. Kế Hoạch Kiểm Thử (Testing Plan)
- Kiểm thử API `POST /api/gifts/items` và kiểm tra trực tiếp bảng `finance_vpm.gift_items` & `finance_vpm.gift_movements` trong PostgreSQL.
- Kiểm thử nút **`+ Tạo sản phẩm`** trên giao diện, tạo sản phẩm mới và kiểm tra dữ liệu vẫn giữ nguyên từ PostgreSQL khi reload.
- Chạy `npx tsc --noEmit` và `npm run build` đảm bảo không có lỗi biên dịch.
