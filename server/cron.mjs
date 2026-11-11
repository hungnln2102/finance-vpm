import cron from 'node-cron';
import { recalculateMonthlyBalances, getMonthlyBalances, rolloverNewMonth, pool } from './db.mjs';
import { syncToGoogleSheet } from './sheetSync.mjs';

const SCHEMA = process.env.DB_SCHEMA || 'finance_vpm';

/**
 * Đảm bảo tháng hiện tại luôn tồn tại trong bảng monthly_balances khi server khởi động
 */
export async function ensureCurrentMonthInitialized() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  try {
    const res = await pool.query(
      `SELECT month FROM ${SCHEMA}.monthly_balances WHERE month = $1;`,
      [currentMonth]
    );

    if (res.rows.length === 0) {
      console.log(`ℹ️ [InitCheck] Kỳ ${currentMonth} chưa tồn tại. Đang khởi tạo kỳ mới...`);
      const balances = await rolloverNewMonth(currentMonth);
      await syncToGoogleSheet('syncMonthlyBalances', { balances });
      console.log(`✅ [InitCheck] Đã khởi tạo và đồng bộ kỳ ${currentMonth} sang Google Sheet!`);
    } else {
      console.log(`✅ [InitCheck] Kỳ ${currentMonth} đã sẵn sàng trong cơ sở dữ liệu.`);
    }
  } catch (err) {
    console.error(`❌ [InitCheck] Lỗi kiểm tra khởi tạo kỳ ${currentMonth}:`, err.message);
  }
}

/**
 * Hàm thực thi nghiệp vụ chuyển kỳ kế toán tháng mới:
 * 1. Tính toán lại số dư cuối kỳ của tháng vừa qua
 * 2. Đóng sổ tháng cũ (status = 'closed')
 * 3. Chuyển số dư cuối kỳ tháng cũ sang số dư đầu kỳ tháng mới
 * 4. Tạo dòng tháng mới (status = 'open')
 * 5. Bắn Webhook đồng bộ ngay lập tức sang tab 00_SODU_KY trên Google Sheet
 */
export async function executeMonthRollover(explicitTargetMonth = null) {
  const now = new Date();
  const targetMonth = explicitTargetMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  console.log(`\n======================================================`);
  console.log(`⏰ [CRON-ROLLOVER] Bắt đầu kích hoạt tạo dòng tháng mới: ${targetMonth}`);
  console.log(`⏰ Thời gian hệ thống: ${now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
  console.log(`======================================================`);

  try {
    // 1. Chạy rollover trong DB: tính toán cuối kỳ tháng trước -> đầu kỳ tháng này
    const balances = await rolloverNewMonth(targetMonth);

    // 2. Tự động đồng bộ số dư sang tab 00_SODU_KY trên Google Sheet
    console.log(`📤 [CRON-ROLLOVER] Đang đồng bộ số dư kỳ mới sang Google Sheet...`);
    const sheetSyncRes = await syncToGoogleSheet('syncMonthlyBalances', { balances });
    
    console.log(`✅ [CRON-ROLLOVER] Hoàn tất chuyển kỳ ${targetMonth}!`);
    console.log(`   - Google Sheet: ${sheetSyncRes.success ? 'Đồng bộ thành công' : 'Chưa đồng bộ được'}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      targetMonth,
      balances,
      sheetSyncRes
    };
  } catch (err) {
    console.error(`❌ [CRON-ROLLOVER] Lỗi chuyển kỳ kế toán:`, err);
    throw err;
  }
}

/**
 * Khởi tạo lịch trình Cron tự động:
 * - Đúng 00:01 ngày 01 của mỗi tháng: '1 0 1 * *'
 * - Múi giờ: Asia/Ho_Chi_Minh (+07:00)
 */
export function initCronJobs() {
  console.log('⏳ [Cron] Đang cài đặt lịch trình chuyển kỳ kế toán tự động...');

  // Lịch chạy: Phút 01, Giờ 00, Ngày 01 hàng tháng
  const CRON_SCHEDULE = '1 0 1 * *';

  cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`🔔 [Cron] Đã nhận tín hiệu chuyển giao tháng mới (00:01 ngày 01 hàng tháng)!`);
    try {
      await executeMonthRollover();
    } catch (err) {
      console.error(`❌ [Cron] Lỗi khi chạy chuyển tháng tự động:`, err);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Ho_Chi_Minh'
  });

  console.log(`🚀 [Cron] Lịch trình đã kích hoạt thành công: "${CRON_SCHEDULE}" (00:01 ngày 01 hàng tháng, timezone: Asia/Ho_Chi_Minh)`);
}
