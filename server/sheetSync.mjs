import 'dotenv/config';
import { recordAuditLog } from './db.mjs';

/**
 * Module đồng bộ dữ liệu hai chiều sang Google Sheet qua Webhook REST API
 * Chạy bất đồng bộ ngầm (Background Worker Non-blocking)
 */

export async function syncToGoogleSheet(action, data) {
  const url = process.env.GOOGLE_SHEET_API_URL;
  if (!url || !url.trim()) {
    console.log(`ℹ️ [SheetSync] GOOGLE_SHEET_API_URL chưa được cấu hình trong .env. Dữ liệu đã lưu an toàn vào PostgreSQL.`);
    return { skipped: true, reason: 'NO_URL' };
  }

  try {
    const payload = {
      action,
      ...data,
      syncedAt: new Date().toISOString()
    };

    // Dùng text/plain để vượt qua CORS preflight của Google Apps Script
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    if (!response.ok) {
      console.warn(`⚠️ [SheetSync] Google Sheet trả về mã lỗi HTTP: ${response.status}`);
      return { success: false, status: response.status };
    }

    const resJson = await response.json();
    return { success: true, result: resJson };
  } catch (err) {
    console.error(`❌ [SheetSync] Lỗi khi gửi dữ liệu sang Google Sheet (${action}):`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Dispatcher Đồng Bộ Realtime & Ghi Vết Audit Log (Realtime Dual-Sync Pipeline)
 * 1. Ghi vết kiểm toán vào PostgreSQL bảng finance_vpm.audit_logs
 * 2. Đẩy Webhook sang Google Sheet:
 *    - syncRow (Thêm/Sửa) hoặc deleteRow (Xóa) trên Tab nghiệp vụ tương ứng
 *    - logActivity trên Tab 09_NHATKY_HOATDONG
 */
export async function dispatchRealtimeSync({
  table,
  action, // 'CREATE' | 'UPDATE' | 'DELETE'
  id,
  data = {},
  actor = 'System',
  details = ''
}) {
  // 1. Ghi log kiểm toán vào PostgreSQL
  try {
    await recordAuditLog({
      action,
      tableName: table,
      recordId: id,
      actor,
      details: details || `${action} ${table} ID: ${id}`,
      payload: data
    });
  } catch (dbLogErr) {
    console.warn(`⚠️ [AuditLog] Không thể ghi audit log vào DB:`, dbLogErr.message);
  }

  // 2. Gửi Webhook Realtime sang Google Sheet (Non-blocking)
  const url = process.env.GOOGLE_SHEET_API_URL;
  if (!url || !url.trim()) return;

  // Thực thi ngầm không chặn luồng chính
  (async () => {
    try {
      if (action === 'DELETE') {
        await syncToGoogleSheet('deleteRow', { table, id });
      } else {
        // CREATE hoặc UPDATE
        await syncToGoogleSheet('syncRow', { table, id, data });
      }

      // Đẩy log sang tab 09_NHATKY_HOATDONG của Google Sheet
      await syncToGoogleSheet('logActivity', {
        logData: {
          timestamp: new Date().toISOString(),
          action,
          tableName: table,
          recordId: id,
          actor,
          details: details || `${action} ${table} ID: ${id}`
        }
      });
    } catch (sheetErr) {
      console.warn(`⚠️ [RealtimeSync] Lỗi gửi realtime sang Google Sheet:`, sheetErr.message);
    }
  })();
}

