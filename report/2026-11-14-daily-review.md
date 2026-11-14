# Báo Cáo Nghiệm Thu Hàng Ngày — 2026-11-14

## [00:35] Cấu hình Vercel Serverless, Vercel Postgres, `.env` và Push GitHub (`origin/main`)

- **Phạm vi**:
  - Thiết lập kiến trúc triển khai Vercel kết hợp Vite SPA (`dist/`) và Express 5 Serverless Function (`api/index.mjs`).
  - Cấu hình `pg.Pool` hỗ trợ đồng thời PostgreSQL Local và Vercel Postgres / Neon (`POSTGRES_URL`, `DATABASE_URL`, tự động bật SSL cho cloud DB).
  - Cập nhật `.env` và `.env.example` đầy đủ biến môi trường cho Local & Vercel.
  - Commit và push toàn bộ thay đổi lên GitHub `origin/main`.
- **Trạng thái nghiệm thu**: ✅ Đã hoàn thành cấu hình, build, kiểm thử và push GitHub `origin/main`. (Chờ xác thực tài khoản Vercel CLI/Dashboard để kích hoạt deploy hoặc kết nối Storage).
- **Thay đổi kỹ thuật**:
  - Tạo mới [vercel.json](file:///e:/Project/finance-vpm/vercel.json) định tuyến `/api/(.*)` về `/api/index.mjs` và SPA fallback về `/index.html`.
  - Tạo mới [api/index.mjs](file:///e:/Project/finance-vpm/api/index.mjs) re-export Express `app` cho Vercel Serverless.
  - Cập nhật [server/index.mjs](file:///e:/Project/finance-vpm/server/index.mjs) bổ sung `ensureServerInitialized()` tự động khởi tạo schema/seed PostgreSQL trên Vercel cold-start và export `app`.
  - Cập nhật [server/config/dbPool.mjs](file:///e:/Project/finance-vpm/server/config/dbPool.mjs) nhận diện `DATABASE_URL` / `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` và bật `ssl: { rejectUnauthorized: false }` khi kết nối cloud PostgreSQL.
  - Cập nhật [.env](file:///e:/Project/finance-vpm/.env) và [.env.example](file:///e:/Project/finance-vpm/.env.example).
- **Kiểm tra đã chạy**:
  - `npx tsc --noEmit` -> Pass (Exit code 0).
  - `npm run build` -> Pass (`✓ built in 2.57s`, Exit code 0).
  - Kiểm thử khởi tạo `api/index.mjs` + `ensureServerInitialized()` -> Pass (`API serverless entry & DB init OK`).

## [01:10] Hoàn tất Deploy Production trên Vercel & Đồng bộ dữ liệu lên Vercel Neon Postgres

- **Phạm vi**:
  - Khởi tạo project `finance-vpm` (`prj_uYijTrmFvC2RsVm3MjZpmzbue26p`) liên kết với GitHub `hungnln2102/finance-vpm`.
  - Thiết lập 8 biến môi trường (`DATABASE_URL`, `POSTGRES_URL`, `DB_SCHEMA`, `DB_SSL`, `GOOGLE_SHEET_API_URL`, `AUTH_BOOTSTRAP_USERNAME`, `AUTH_BOOTSTRAP_PASSWORD`, `AUTH_BOOTSTRAP_DISPLAY_NAME`) cho cả 3 môi trường (`production`, `preview`, `development`).
  - Khởi tạo schema `finance_vpm` trên Vercel Neon Postgres (`ep-lingering-moon-amgigamd-pooler.c-5.us-east-1.aws.neon.tech/neondb`) và migrate toàn bộ 21 bảng dữ liệu từ PostgreSQL Local lên Cloud.
  - Redeploy Production (`dpl_AyXHK376zQUrz2NVJuk6PEyJV4TP`) và kiểm tra live endpoint `/api/health`.
- **Trạng thái nghiệm thu**: ✅ Hoàn thành 100% (`READY` trên Production).
- **Kiểm tra đã chạy**:
  - `GET https://finance-vpm.vercel.app/api/health` -> `200 OK`: `{"status":"ok","database":"Vercel Postgres (Cloud)","schema":"finance_vpm","googleSheetSyncEnabled":true}`.

## [11:12] Clear toàn bộ dữ liệu nghiệp vụ trên Vercel Postgres (Neon Cloud)

- **Phạm vi**:
  - Thực thi `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` trong một transaction ACID trên Vercel Neon Postgres (`ep-lingering-moon-amgigamd-pooler.c-5.us-east-1.aws.neon.tech/neondb`, schema `finance_vpm`) đối với toàn bộ 19 bảng dữ liệu nghiệp vụ.
  - Khởi tạo lại bảng `monthly_balances` kỳ hiện tại (`2026-11`) với số dư đầu kỳ / cuối kỳ = `0 đ`.
  - Giữ nguyên bảng `user_accounts` (`admin`, `master`) và 4 tài khoản gốc trong `accounts` (`QUY`, `ACB`, `MB`, `TCB`) để duy trì đăng nhập và cấu trúc sổ quỹ.
- **Trạng thái nghiệm thu**: ✅ Hoàn thành 100%.
- **Kiểm tra đã chạy**:
  - Xác minh trực tiếp `COUNT(*)` trên Vercel Neon Postgres: toàn bộ 19 bảng nghiệp vụ = `0 rows`, `monthly_balances` = `1 row (0 đ)`, `accounts` = `4 rows`, `user_accounts` = `2 rows`.

## [11:35] Nâng cấp quyền tài khoản `admin` thành `master` trên Database

- **Phạm vi**:
  - Cập nhật trực tiếp trên Vercel Neon Postgres (`finance_vpm.user_accounts`) và Local Postgres: đặt `role = 'master'` cho user `admin`.
- **Trạng thái nghiệm thu**: ✅ Đã thực thi thành công.
- **Kiểm chứng**:
  - Cả 2 tài khoản `master` và `admin` hiện đều mang quyền tối cao `role: 'master'`, `is_active: true`.
  - Mọi thao tác ghi dữ liệu (`POST`, `PATCH`, `DELETE`) từ giao diện sẽ được thông qua mà không bị chặn quyền 403.
