/**
 * Module đồng bộ dữ liệu sang Google Sheet qua Webhook REST API
 * Chạy bất đồng bộ ngầm (Background Worker)
 */

export async function syncToGoogleSheet(action, data) {
  const url = process.env.GOOGLE_SHEET_API_URL;
  if (!url || !url.trim()) {
    console.log(`ℹ️ [SheetSync] GOOGLE_SHEET_API_URL chưa được cấu hình trong .env. Dữ liệu đã lưu an toàn vào PostgreSQL.`);
    return { skipped: true, reason: 'NO_URL' };
  }

  try {
    console.log(`📤 [SheetSync] Đang đồng bộ hành động "${action}" sang Google Sheet...`);
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
    console.log(`✅ [SheetSync] Đồng bộ sang Google Sheet thành công!`, resJson);
    return { success: true, result: resJson };
  } catch (err) {
    console.error(`❌ [SheetSync] Lỗi khi gửi dữ liệu sang Google Sheet:`, err.message);
    return { success: false, error: err.message };
  }
}

