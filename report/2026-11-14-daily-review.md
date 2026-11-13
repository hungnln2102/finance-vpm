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
