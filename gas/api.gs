/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - HEADLESS DATABASE & REALTIME WEBHOOK API (DUAL-SYNC)
 * DỰ ÁN: SỔ GỐC BKD TTNG · BẢO HIỂM CÓ GIÀU (VPM)
 * =========================================================================
 * 
 * MA TRẬN 10 BẢNG NGHIỆP VỤ TƯƠNG ỨNG 1-1 POSTGRESQL <=> GOOGLE SHEET:
 * 1.  monthly_balances  <=> Tab 00_SODU_KY
 * 2.  transactions      <=> Tab 01_SOGOC_2026
 * 3.  contracts         <=> Tab 02_HOPDONG_2026
 * 4.  gift_items & mv   <=> Tab 03_QUATANG
 * 5.  attendance        <=> Tab 04_CHAMCONG_2026
 * 6.  staff             <=> Tab 05_NHANSU
 * 7.  cost_adjustments  <=> Tab 06_NGANSACH_2026
 * 8.  proposals         <=> Tab 07_DEXUAT_KEHOACH
 * 9.  accounts          <=> Tab 08_TAIKHOAN_QUY
 * 10. audit_logs        <=> Tab 09_NHATKY_HOATDONG
 * 
 * HƯỚNG DẪN DÀNH CHO MASTER:
 * 1. Mở Google Sheet: Tiện ích mở rộng (Extensions) > Apps Script.
 * 2. Dán toàn bộ nội dung file này vào tệp Mã.gs và bấm Lưu (Ctrl + S).
 * 3. TẠO KHUNG BẢNG SẠCH (10 Tab Chuẩn Hóa):
 *    - Trên thanh công cụ Apps Script, chọn hàm: 👉 [ initAllDatabaseSheets ]
 *    - Bấm nút: ▷ Chạy (Run)
 *    -> Hệ thống sẽ tự động khởi tạo 10 Tab bảng nghiệp vụ chuẩn giao diện.
 * 4. ĐỒNG BỘ DỮ LIỆU THẬT TỪ POSTGRESQL:
 *    - Mở Web App, vào mục "Theo Dõi Số Dư Đầu Kỳ & Cuối Kỳ"
 *    - Bấm nút: [ 📤 Đồng bộ DB → Sheet ]
 *    -> Toàn bộ dữ liệu 10 bảng từ PostgreSQL sẽ được đẩy lên Google Sheet!
 * 5. TRIỂN KHAI PHIÊN BẢN MỚI:
 *    - Bấm Triển khai (Deploy) > Quản lý bản triển khai (Manage deployments)
 *    - Bấm Chỉnh sửa (Edit) > Phiên bản: Phiên bản mới (New version) > Triển khai.
 * =========================================================================
 */

var SPREADSHEET_ID = '1rcoCrWhtXpwP9kGyOXzwLSxd_KRuYJPEyJOvwjStujw';

function getSpreadsheet() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
}

// Bảng ánh xạ Tên bảng PostgreSQL sang Tên Tab Google Sheet
var TABLE_SHEET_MAP = {
  'monthly_balances': '00_SODU_KY',
  'transactions': '01_SOGOC_2026',
  'contracts': '02_HOPDONG_2026',
  'gifts': '03_QUATANG',
  'gift_items': '03_QUATANG',
  'gift_movements': '03_QUATANG',
  'attendance': '04_CHAMCONG_2026',
  'staff': '05_NHANSU',
  'cost_adjustments': '06_NGANSACH_2026',
  'proposals': '07_DEXUAT_KEHOACH',
  'accounts': '08_TAIKHOAN_QUY',
  'audit_logs': '09_NHATKY_HOATDONG'
};

/**
 * Xử lý yêu cầu HTTP GET
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';

  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      service: 'Google Sheet 10-Table Realtime Database Webhook',
      spreadsheetId: SPREADSHEET_ID,
      time: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'init' || action === 'initAllDatabaseSheets') {
    var initRes = initAllDatabaseSheets();
    return ContentService.createTextOutput(JSON.stringify(initRes))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'exportAllData') {
    return ContentService.createTextOutput(JSON.stringify(exportAllData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'unknown_action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý yêu cầu HTTP POST ghi/xóa/đồng bộ realtime từ Backend & Web App
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // Khóa 20s bảo vệ ACID
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Google Sheet đang bận, vui lòng thử lại sau giây lát: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var payload = JSON.parse(raw);
    var action = payload.action;
    var result = { success: true };

    if (action === 'initAllDatabaseSheets') {
      result = initAllDatabaseSheets();
    } else if (action === 'syncFullDatabase' || action === 'syncFullState') {
      result = apiSyncFullDatabase(payload);
    } else if (action === 'syncRow') {
      // Đồng bộ Realtime 1 dòng (Thêm mới hoặc Cập nhật)
      result = apiSyncRow(payload.table, payload.id, payload.data);
    } else if (action === 'deleteRow') {
      // Xóa Realtime 1 dòng theo ID
      result = apiDeleteRow(payload.table, payload.id);
    } else if (action === 'logActivity') {
      // Ghi vết vào Tab 09_NHATKY_HOATDONG
      result = apiLogActivity(payload.logData);
    } else if (action === 'syncMonthlyBalances') {
      result = apiSyncMonthlyBalances(payload.balances);
    } else if (action === 'addTransaction') {
      result = apiSyncRow('transactions', payload.data ? payload.data.id : null, payload.data);
    } else if (action === 'updateTransaction') {
      result = apiUpdateTransaction(payload.id, payload.updates);
    } else if (action === 'addContract') {
      result = apiSyncRow('contracts', payload.data ? payload.data.id : null, payload.data);
    } else if (action === 'saveAttendance') {
      result = apiSaveAttendance(payload.staffId, payload.dateIso, payload.val);
    } else if (action === 'clearTransactions') {
      result = apiClearTransactions();
    } else if (action === 'exportAllData') {
      result = exportAllData();
    } else {
      result = { success: false, error: 'Hành động không xác định: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Chuẩn hóa tạo và định dạng Tab trên Google Sheet (Dark Header, Cyan Text, Freeze Row 1)
 */
function setupSheetWithStyle(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0f172a')
               .setFontColor('#38bdf8')
               .setFontWeight('bold')
               .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 32);
    for (var i = 1; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 160);
    }
  }
  return sheet;
}

/**
 * =========================================================================
 * KHỞI TẠO KHUNG 10 TAB CƠ SỞ DỮ LIỆU SẠCH (CHUẨN HÓA 1-1 POSTGRESQL)
 * =========================================================================
 */
function initAllDatabaseSheets() {
  var ss = getSpreadsheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    // 0. Tab 00_SODU_KY: Số Dư Đầu Kỳ & Cuối Kỳ Theo Tháng
    setupSheetWithStyle(ss, '00_SODU_KY', [
      'KỲ THÁNG', 
      'QUỸ ĐẦU KỲ (01/MM)', 'QUỸ CUỐI KỲ', 
      'ACB ĐẦU KỲ (01/MM)', 'ACB CUỐI KỲ', 
      'TỔNG ĐẦU KỲ', 'TỔNG CUỐI KỲ', 
      'BIẾN ĐỘNG RÒNG', 'TRẠNG THÁI', 'CẬP NHẬT LÚC'
    ]);

    // 1. Tab 01_SOGOC_2026: Sổ Giao Dịch Gốc
    setupSheetWithStyle(ss, '01_SOGOC_2026', [
      'Mã GD', 'Ngày GD', 'Tài khoản', 'Chiều tiền', 'Số tiền (VND)', 
      'Nội dung chứng từ', 'Phân loại', 'Nhóm chi phí', 'Mã hợp đồng', 
      'Trạng thái', 'Cảnh báo', 'Chứng từ đính kèm', 'Nguồn dữ liệu'
    ]);

    // 2. Tab 02_HOPDONG_2026: Sổ Hợp Đồng
    setupSheetWithStyle(ss, '02_HOPDONG_2026', [
      'Mã HĐ', 'Loại HĐ', 'Tên khách hàng', 'Số hợp đồng', 'Tư vấn viên',
      'Ngày ký', 'Phí bảo hiểm (VND)', 'Chiết khấu (VND)', 'Duyệt CK',
      'Hạn thanh toán', 'Kỳ hạn thanh toán', 'Ghi chú'
    ]);

    // 3. Tab 03_QUATANG: Danh Mục Quà Tặng
    setupSheetWithStyle(ss, '03_QUATANG', [
      'Mã quà', 'Tên quà tặng / Ấn phẩm', 'Đơn vị tính', 'Đơn giá xuất kho (VND)',
      'Số lượng tồn', 'Mục đích sử dụng', 'Ghi chú'
    ]);

    // 4. Tab 04_CHAMCONG_2026: Chấm Công Nhân Sự
    setupSheetWithStyle(ss, '04_CHAMCONG_2026', [
      'Mã NV', 'Họ và tên nhân sự', 'Ngày chấm công', 'Số công (1/0.5/L/X/2)', 'Trạng thái'
    ]);

    // 5. Tab 05_NHANSU: Nhân Sự & Định Mức Lương
    setupSheetWithStyle(ss, '05_NHANSU', [
      'Mã NV', 'Họ và tên nhân sự', 'Chức vụ', 'Lương cơ bản (VND)',
      'Phụ cấp ĐT', 'Phụ cấp Xăng', 'Phụ cấp Ăn', 'Phụ cấp Công tác',
      'KPI dự kiến', 'Lương đóng BH', 'Số người phụ thuộc', 'Tạm ứng'
    ]);

    // 6. Tab 06_NGANSACH_2026: Dự Toán Ngân Sách
    setupSheetWithStyle(ss, '06_NGANSACH_2026', [
      'Mã điều chỉnh', 'Kỳ tháng', 'Danh mục chi phí', 'Định mức cũ (VND)', 'Định mức mới (VND)', 'Lý do điều chỉnh', 'Trạng thái'
    ]);

    // 7. Tab 07_DEXUAT_KEHOACH: Kế Hoạch & Đệ Trình
    setupSheetWithStyle(ss, '07_DEXUAT_KEHOACH', [
      'Mã đề xuất', 'Tiêu đề kế hoạch', 'Người lập', 'Email người lập', 'Bộ phận',
      'Số tiền đề xuất (VND)', 'Ngày lập', 'Nội dung chi tiết', 'Trạng thái'
    ]);

    // 8. Tab 08_TAIKHOAN_QUY: Danh Mục Tài Khoản & Sổ Quỹ
    var accSheet = setupSheetWithStyle(ss, '08_TAIKHOAN_QUY', [
      'Mã tài khoản', 'Tên tài khoản / Quỹ', 'Phân loại', 'Số tài khoản', 'Ngân hàng', 'Trạng thái'
    ]);
    if (accSheet.getLastRow() <= 1) {
      var accRows = [
        ['QUY', 'Sổ quỹ văn phòng (Tiền mặt)', 'cash', '', '', 'active'],
        ['ACB', 'Tài khoản ACB (Ngân hàng Á Châu)', 'bank', '0378304963', 'ACB', 'active'],
        ['MB', 'Tài khoản MB Bank (Ngân hàng Quân Đội)', 'bank', '0378304963', 'MB Bank', 'active'],
        ['TCB', 'Tài khoản Techcombank', 'bank', '', 'Techcombank', 'active']
      ];
      accSheet.getRange(2, 1, accRows.length, accRows[0].length).setValues(accRows);
      accSheet.getRange(2, 1, accRows.length, 1).setHorizontalAlignment('center');
      accSheet.getRange(2, 6, accRows.length, 1).setHorizontalAlignment('center');
      accSheet.autoResizeColumns(1, 6);
    }

    // 9. Tab 09_NHATKY_HOATDONG: Nhật Ký Kiểm Toán (Audit Logs)
    setupSheetWithStyle(ss, '09_NHATKY_HOATDONG', [
      'ID Log', 'Thời gian (Giờ VN)', 'Hành động', 'Bảng dữ liệu', 'Mã bản ghi', 'Người thực hiện', 'Chi tiết hoạt động'
    ]);

    // Xóa tab mặc định "Trang tính1" hoặc "Sheet1" nếu có
    var defaultSheet = ss.getSheetByName('Trang tính1') || ss.getSheetByName('Sheet1');
    if (defaultSheet && ss.getSheets().length > 1) {
      try { ss.deleteSheet(defaultSheet); } catch (e) {}
    }

    SpreadsheetApp.flush();
    return { 
      success: true, 
      message: 'Đã tạo thành công khung 10 Tab cơ sở dữ liệu trên Google Sheet!', 
      totalTabsCreated: 10 
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * REALTIME SYNC: THÊM HOẶC CẬP NHẬT 1 DÒNG DỮ LIỆU THEO ID
 * =========================================================================
 */
function apiSyncRow(table, id, data) {
  var ss = getSpreadsheet();
  var sheetName = TABLE_SHEET_MAP[table] || table;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initAllDatabaseSheets();
    sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Không tìm thấy tab ' + sheetName };
  }

  var rowData = formatRowByTable(table, id, data);
  if (!rowData || rowData.length === 0) {
    return { success: false, error: 'Không thể định dạng dòng dữ liệu cho bảng ' + table };
  }

  var targetId = String(id || (rowData[0] || '')).trim();
  var lastRow = sheet.getLastRow();
  var foundRowIdx = -1;

  if (lastRow > 1 && targetId) {
    var idColVals = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < idColVals.length; i++) {
      if (String(idColVals[i][0]).trim() === targetId) {
        foundRowIdx = i + 2;
        break;
      }
    }
  }

  if (foundRowIdx !== -1) {
    // Cập nhật dòng đã có
    sheet.getRange(foundRowIdx, 1, 1, rowData.length).setValues([rowData]);
    formatSheetRowStyle(table, sheet, foundRowIdx);
    return { success: true, action: 'UPDATED', table: table, id: targetId, row: foundRowIdx };
  } else {
    // Thêm dòng mới
    sheet.appendRow(rowData);
    var newRowIdx = sheet.getLastRow();
    formatSheetRowStyle(table, sheet, newRowIdx);
    return { success: true, action: 'CREATED', table: table, id: targetId, row: newRowIdx };
  }
}

/**
 * =========================================================================
 * REALTIME SYNC: XÓA 1 DÒNG DỮ LIỆU THEO ID
 * =========================================================================
 */
function apiDeleteRow(table, id) {
  var ss = getSpreadsheet();
  var sheetName = TABLE_SHEET_MAP[table] || table;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'Không tìm thấy tab ' + sheetName };

  var targetId = String(id).trim();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: true, message: 'Tab rỗng' };

  var idColVals = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < idColVals.length; i++) {
    if (String(idColVals[i][0]).trim() === targetId) {
      sheet.deleteRow(i + 2);
      SpreadsheetApp.flush();
      return { success: true, action: 'DELETED', table: table, id: targetId, rowDeleted: i + 2 };
    }
  }

  return { success: false, message: 'Không tìm thấy ID: ' + targetId + ' trong ' + sheetName };
}

/**
 * =========================================================================
 * REALTIME SYNC: GHI VẾT KIỂM TOÁN VÀO TAB 09_NHATKY_HOATDONG
 * =========================================================================
 */
function apiLogActivity(logData) {
  if (!logData) return { success: false };
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('09_NHATKY_HOATDONG');
  if (!sheet) {
    setupSheetWithStyle(ss, '09_NHATKY_HOATDONG', [
      'ID Log', 'Thời gian (Giờ VN)', 'Hành động', 'Bảng dữ liệu', 'Mã bản ghi', 'Người thực hiện', 'Chi tiết hoạt động'
    ]);
    sheet = ss.getSheetByName('09_NHATKY_HOATDONG');
  }

  var nowStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  var logId = logData.id || ('LOG-' + Date.now().toString().slice(-6));
  var row = [
    logId,
    logData.timestamp || nowStr,
    logData.action || 'MUTATION',
    logData.tableName || '',
    String(logData.recordId || ''),
    logData.actor || 'System',
    logData.details || ''
  ];

  sheet.appendRow(row);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, 5).setHorizontalAlignment('center');
  return { success: true, logId: logId };
}

/**
 * Chuyển đổi đối tượng data theo đúng cột của từng bảng
 */
function formatRowByTable(table, id, d) {
  d = d || {};
  switch (table) {
    case 'transactions':
      return [
        id || d.id || '',
        d.date || '',
        d.acc || 'QUY',
        d.dir === 'in' ? 'Thu (+)' : 'Chi (-)',
        Number(d.amt) || 0,
        d.desc || d.description || '',
        d.type || '',
        d.cat || '',
        d.contract || '',
        d.status || 'posted',
        Array.isArray(d.flags) ? d.flags.join('; ') : (d.flags || ''),
        d.doc || '',
        d.src || 'Web App'
      ];

    case 'contracts':
      return [
        id || d.id || '',
        d.kind || 'KH',
        d.customer || '',
        d.no || '',
        d.tv || '',
        d.signed || '',
        Number(d.fee) || 0,
        Number(d.disc) || 0,
        d.discApproved ? 'ĐÃ DUYỆT' : 'CHƯA DUYỆT',
        d.due || '',
        d.terms || '',
        d.note || ''
      ];

    case 'accounts':
      return [
        id || d.id || '',
        d.name || '',
        d.type || 'bank',
        d.accountNo || d.account_no || '',
        d.bankName || d.bank_name || '',
        d.status || 'active'
      ];

    case 'attendance':
      return [
        d.staffId || d.staff_id || id || '',
        d.staffName || '',
        d.date || '',
        String(d.val !== undefined ? d.val : '1'),
        d.status || 'Cập nhật từ Web'
      ];

    case 'staff':
      var al = d.allow || {};
      return [
        id || d.id || '',
        d.name || '',
        d.role || '',
        Number(d.baseSalary || d.base_salary || 0),
        Number(al.phone || 0),
        Number(al.fuel || 0),
        Number(al.meal || 0),
        Number(al.travel || 0),
        Number(d.kpi || 0),
        Number(d.insSalary || d.ins_salary || 0),
        Number(d.deps || 0),
        Number(d.advance || 0)
      ];

    case 'cost_adjustments':
      return [
        id || d.id || '',
        d.month || '',
        d.category || '',
        Number(d.oldBudget || d.old_budget || 0),
        Number(d.newBudget || d.new_budget || 0),
        d.reason || '',
        d.status || 'pending'
      ];

    case 'proposals':
      return [
        id || d.id || '',
        d.title || '',
        d.creator || '',
        d.creatorEmail || d.creator_email || '',
        d.department || '',
        Number(d.amount) || 0,
        d.date || '',
        d.description || '',
        d.status || 'pending'
      ];

    case 'gift_items':
    case 'gifts':
      return [
        id || d.id || '',
        d.name || '',
        d.unit || '',
        Number(d.price) || 0,
        Number(d.stock || 0),
        d.purpose || '',
        d.note || ''
      ];

    default:
      return [id || d.id || '', JSON.stringify(d)];
  }
}

/**
 * Định dạng số tiền và căn chỉnh cột cho từng dòng
 */
function formatSheetRowStyle(table, sheet, rowIdx) {
  try {
    if (table === 'transactions') {
      sheet.getRange(rowIdx, 5).setNumberFormat('#,##0 \"đ\"');
      sheet.getRange(rowIdx, 1, 1, 4).setHorizontalAlignment('center');
      sheet.getRange(rowIdx, 10).setHorizontalAlignment('center');
    } else if (table === 'contracts') {
      sheet.getRange(rowIdx, 7, 1, 2).setNumberFormat('#,##0 \"đ\"');
      sheet.getRange(rowIdx, 1, 1, 2).setHorizontalAlignment('center');
    } else if (table === 'accounts') {
      sheet.getRange(rowIdx, 1).setHorizontalAlignment('center');
      sheet.getRange(rowIdx, 6).setHorizontalAlignment('center');
    } else if (table === 'cost_adjustments') {
      sheet.getRange(rowIdx, 4, 1, 2).setNumberFormat('#,##0 \"đ\"');
      sheet.getRange(rowIdx, 1, 1, 2).setHorizontalAlignment('center');
    } else if (table === 'proposals') {
      sheet.getRange(rowIdx, 6).setNumberFormat('#,##0 \"đ\"');
      sheet.getRange(rowIdx, 1).setHorizontalAlignment('center');
      sheet.getRange(rowIdx, 9).setHorizontalAlignment('center');
    } else if (table === 'staff') {
      sheet.getRange(rowIdx, 4, 1, 9).setNumberFormat('#,##0 \"đ\"');
      sheet.getRange(rowIdx, 1).setHorizontalAlignment('center');
    }
  } catch (e) {}
}

/**
 * =========================================================================
 * ĐỒNG BỘ TOÀN BỘ DỮ LIỆU TỪ POSTGRESQL VÀO 10 TAB TRÊN GOOGLE SHEET
 * =========================================================================
 */
function apiSyncFullDatabase(payload) {
  var ss = getSpreadsheet();
  var state = payload.state || {};
  var balances = payload.balances || [];

  // Khởi tạo khung 10 tab nếu chưa đủ
  initAllDatabaseSheets();

  // 1. Tab 00_SODU_KY
  if (balances && balances.length > 0) {
    apiSyncMonthlyBalances(balances);
  }

  // 2. Tab 01_SOGOC_2026
  if (state.tx && Array.isArray(state.tx)) {
    var txSheet = ss.getSheetByName('01_SOGOC_2026');
    if (txSheet) {
      if (txSheet.getLastRow() > 1) {
        txSheet.getRange(2, 1, txSheet.getLastRow() - 1, 13).clearContent();
      }
      if (state.tx.length > 0) {
        var txRows = state.tx.map(function(t) {
          return formatRowByTable('transactions', t.id, t);
        });
        txSheet.getRange(2, 1, txRows.length, txRows[0].length).setValues(txRows);
        txSheet.getRange(2, 5, txRows.length, 1).setNumberFormat('#,##0 \"đ\"');
        txSheet.getRange(2, 1, txRows.length, 4).setHorizontalAlignment('center');
        txSheet.getRange(2, 10, txRows.length, 1).setHorizontalAlignment('center');
        txSheet.autoResizeColumns(1, 13);
      }
    }
  }

  // 3. Tab 02_HOPDONG_2026
  if (state.contracts && Array.isArray(state.contracts)) {
    var cSheet = ss.getSheetByName('02_HOPDONG_2026');
    if (cSheet) {
      if (cSheet.getLastRow() > 1) {
        cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 12).clearContent();
      }
      if (state.contracts.length > 0) {
        var cRows = state.contracts.map(function(c) {
          return formatRowByTable('contracts', c.id, c);
        });
        cSheet.getRange(2, 1, cRows.length, cRows[0].length).setValues(cRows);
        cSheet.getRange(2, 7, cRows.length, 2).setNumberFormat('#,##0 \"đ\"');
        cSheet.getRange(2, 1, cRows.length, 2).setHorizontalAlignment('center');
        cSheet.autoResizeColumns(1, 12);
      }
    }
  }

  // 4. Tab 03_QUATANG
  if (state.gifts && state.gifts.items && Array.isArray(state.gifts.items)) {
    var gSheet = ss.getSheetByName('03_QUATANG');
    if (gSheet) {
      if (gSheet.getLastRow() > 1) {
        gSheet.getRange(2, 1, gSheet.getLastRow() - 1, 7).clearContent();
      }
      if (state.gifts.items.length > 0) {
        var gRows = state.gifts.items.map(function(g) {
          return [g.id || '', g.name || '', g.unit || '', Number(g.price) || 0, 100, 'Quà tặng hội thảo', ''];
        });
        gSheet.getRange(2, 1, gRows.length, gRows[0].length).setValues(gRows);
        gSheet.getRange(2, 4, gRows.length, 1).setNumberFormat('#,##0 \"đ\"');
        gSheet.getRange(2, 1, gRows.length, 1).setHorizontalAlignment('center');
        gSheet.autoResizeColumns(1, 7);
      }
    }
  }

  // 5. Tab 04_CHAMCONG_2026
  if (state.attendanceRows && Array.isArray(state.attendanceRows) && state.attendanceRows.length > 0) {
    var attSheet = ss.getSheetByName('04_CHAMCONG_2026');
    if (attSheet) {
      if (attSheet.getLastRow() > 1) {
        attSheet.getRange(2, 1, attSheet.getLastRow() - 1, 5).clearContent();
      }
      var attRows = state.attendanceRows.map(function(a) {
        return [a.staffId || '', a.staffName || '', a.date || '', String(a.val || '1'), a.status || 'posted'];
      });
      attSheet.getRange(2, 1, attRows.length, attRows[0].length).setValues(attRows);
      attSheet.getRange(2, 1, attRows.length, 5).setHorizontalAlignment('center');
      attSheet.autoResizeColumns(1, 5);
    }
  }

  // 6. Tab 05_NHANSU
  if (state.staff && Array.isArray(state.staff) && state.staff.length > 0) {
    var stSheet = ss.getSheetByName('05_NHANSU');
    if (stSheet) {
      if (stSheet.getLastRow() > 1) {
        stSheet.getRange(2, 1, stSheet.getLastRow() - 1, 12).clearContent();
      }
      var stRows = state.staff.map(function(s) {
        return formatRowByTable('staff', s.id, s);
      });
      stSheet.getRange(2, 1, stRows.length, stRows[0].length).setValues(stRows);
      stSheet.getRange(2, 4, stRows.length, 9).setNumberFormat('#,##0 \"đ\"');
      stSheet.getRange(2, 1, stRows.length, 1).setHorizontalAlignment('center');
      stSheet.autoResizeColumns(1, 12);
    }
  }

  // 7. Tab 06_NGANSACH_2026
  if (state.costAdjustments && Array.isArray(state.costAdjustments) && state.costAdjustments.length > 0) {
    var adjSheet = ss.getSheetByName('06_NGANSACH_2026');
    if (adjSheet) {
      if (adjSheet.getLastRow() > 1) {
        adjSheet.getRange(2, 1, adjSheet.getLastRow() - 1, 7).clearContent();
      }
      var adjRows = state.costAdjustments.map(function(adj) {
        return formatRowByTable('cost_adjustments', adj.id, adj);
      });
      adjSheet.getRange(2, 1, adjRows.length, adjRows[0].length).setValues(adjRows);
      adjSheet.getRange(2, 4, adjRows.length, 2).setNumberFormat('#,##0 \"đ\"');
      adjSheet.getRange(2, 1, adjRows.length, 2).setHorizontalAlignment('center');
      adjSheet.autoResizeColumns(1, 7);
    }
  }

  // 8. Tab 07_DEXUAT_KEHOACH
  if (state.proposals && Array.isArray(state.proposals) && state.proposals.length > 0) {
    var propSheet = ss.getSheetByName('07_DEXUAT_KEHOACH');
    if (propSheet) {
      if (propSheet.getLastRow() > 1) {
        propSheet.getRange(2, 1, propSheet.getLastRow() - 1, 9).clearContent();
      }
      var pRows = state.proposals.map(function(p) {
        return formatRowByTable('proposals', p.id, p);
      });
      propSheet.getRange(2, 1, pRows.length, pRows[0].length).setValues(pRows);
      propSheet.getRange(2, 6, pRows.length, 1).setNumberFormat('#,##0 \"đ\"');
      propSheet.getRange(2, 1, pRows.length, 1).setHorizontalAlignment('center');
      propSheet.getRange(2, 9, pRows.length, 1).setHorizontalAlignment('center');
      propSheet.autoResizeColumns(1, 9);
    }
  }

  // 9. Tab 08_TAIKHOAN_QUY
  if (state.accounts && Array.isArray(state.accounts) && state.accounts.length > 0) {
    var accSheet = ss.getSheetByName('08_TAIKHOAN_QUY');
    if (accSheet) {
      if (accSheet.getLastRow() > 1) {
        accSheet.getRange(2, 1, accSheet.getLastRow() - 1, 6).clearContent();
      }
      var aRows = state.accounts.map(function(a) {
        return formatRowByTable('accounts', a.id, a);
      });
      accSheet.getRange(2, 1, aRows.length, aRows[0].length).setValues(aRows);
      accSheet.getRange(2, 1, aRows.length, 1).setHorizontalAlignment('center');
      accSheet.getRange(2, 6, aRows.length, 1).setHorizontalAlignment('center');
      accSheet.autoResizeColumns(1, 6);
    }
  }

  // 10. Tab 09_NHATKY_HOATDONG
  if (state.log && Array.isArray(state.log) && state.log.length > 0) {
    var logSheet = ss.getSheetByName('09_NHATKY_HOATDONG');
    if (logSheet) {
      if (logSheet.getLastRow() > 1) {
        logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 7).clearContent();
      }
      var logRows = state.log.map(function(l) {
        return [
          l.id || '',
          l.at || '',
          l.action || 'LOG',
          l.tableName || 'finance_vpm',
          String(l.recordId || ''),
          l.role || l.actor || 'System',
          l.what || l.details || ''
        ];
      });
      logSheet.getRange(2, 1, logRows.length, logRows[0].length).setValues(logRows);
      logSheet.getRange(2, 1, logRows.length, 5).setHorizontalAlignment('center');
      logSheet.autoResizeColumns(1, 7);
    }
  }

  SpreadsheetApp.flush();
  return {
    success: true,
    message: 'Đã đồng bộ toàn bộ 10 Bảng nghiệp vụ từ PostgreSQL sang Google Sheet!',
    tablesSynced: 10,
    txCount: (state.tx || []).length,
    contractsCount: (state.contracts || []).length,
    balancesCount: balances.length
  };
}

/**
 * Cập nhật giao dịch theo ID (Tương thích ngược)
 */
function apiUpdateTransaction(id, updates) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('01_SOGOC_2026') || ss.getSheetByName('Transactions');
  if (!sheet) return { success: false, message: 'Không tìm thấy tab 01_SOGOC_2026' };

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: false, message: 'Sheet rỗng' };

  var vals = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim() === String(id).trim()) {
      var rIdx = i + 2;
      if (updates.desc !== undefined) sheet.getRange(rIdx, 6).setValue(updates.desc);
      if (updates.cat !== undefined) sheet.getRange(rIdx, 8).setValue(updates.cat);
      if (updates.contract !== undefined) sheet.getRange(rIdx, 9).setValue(updates.contract);
      if (updates.status !== undefined) sheet.getRange(rIdx, 10).setValue(updates.status);
      if (updates.amt !== undefined) sheet.getRange(rIdx, 5).setValue(Number(updates.amt));
      if (updates.acc !== undefined) sheet.getRange(rIdx, 3).setValue(updates.acc);
      return { success: true, updatedRow: rIdx, id: id };
    }
  }
  return { success: false, message: 'Không tìm thấy ID: ' + id };
}

/**
 * Lưu chấm công (Tương thích ngược)
 */
function apiSaveAttendance(staffId, dateIso, val) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('04_CHAMCONG_2026');
  if (!sheet) {
    sheet = setupSheetWithStyle(ss, '04_CHAMCONG_2026', [
      'Mã NV', 'Họ và tên nhân sự', 'Ngày chấm công', 'Số công (1/0.5/L/X/2)', 'Trạng thái'
    ]);
  }
  sheet.appendRow([staffId, '', dateIso, String(val), 'Cập nhật từ Web']);
  return { success: true };
}

/**
 * Đồng bộ Số dư đầu kỳ & cuối kỳ vào Tab 00_SODU_KY
 */
function apiSyncMonthlyBalances(balances) {
  if (!balances || !Array.isArray(balances)) {
    return { success: false, error: 'Danh sách số dư không hợp lệ' };
  }

  var ss = getSpreadsheet();
  var sheetName = '00_SODU_KY';
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName, 0);
  }

  sheet.clear();

  var headers = [
    'KỲ THÁNG', 
    'QUỸ ĐẦU KỲ (01/MM)', 'QUỸ CUỐI KỲ', 
    'ACB ĐẦU KỲ (01/MM)', 'ACB CUỐI KỲ', 
    'TỔNG ĐẦU KỲ', 'TỔNG CUỐI KỲ', 
    'BIẾN ĐỘNG RÒNG', 'TRẠNG THÁI', 'CẬP NHẬT LÚC'
  ];
  sheet.getRange(1, 1, 1, 10).setValues([headers]);

  var headerRange = sheet.getRange(1, 1, 1, 10);
  headerRange.setBackground('#0f172a');
  headerRange.setFontColor('#38bdf8');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);

  var rows = balances.map(function(b) {
    return [
      b.month || '',
      b.startQuy || 0,
      b.endQuy || 0,
      b.startAcb || 0,
      b.endAcb || 0,
      b.startTotal || 0,
      b.endTotal || 0,
      b.netChange || 0,
      b.status === 'closed' ? 'Đã chốt cuối tháng' : 'Cập nhật Realtime',
      new Date().toLocaleString('vi-VN')
    ];
  });

  if (rows.length > 0) {
    var dataRange = sheet.getRange(2, 1, rows.length, 10);
    dataRange.setValues(rows);

    var numRange = sheet.getRange(2, 2, rows.length, 7);
    numRange.setNumberFormat('#,##0 \"đ\"');
    numRange.setHorizontalAlignment('right');
    
    sheet.getRange(2, 1, rows.length, 1).setHorizontalAlignment('center').setFontWeight('bold');
    sheet.getRange(2, 9, rows.length, 2).setHorizontalAlignment('center');
  }

  sheet.autoResizeColumns(1, 10);
  return { success: true, count: rows.length, sheetName: sheetName };
}

/**
 * Xóa toàn bộ dữ liệu giao dịch trên Tab 01_SOGOC_2026 (giữ nguyên dòng tiêu đề)
 */
function apiClearTransactions() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('01_SOGOC_2026') || ss.getSheetByName('Transactions');
  if (sheet && sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  SpreadsheetApp.flush();
  return { success: true, message: 'Đã xóa sạch giao dịch trên tab 01_SOGOC_2026' };
}

/**
 * Xuất dữ liệu từ Google Sheet để đồng bộ về PostgreSQL khi cần
 */
function exportAllData() {
  var ss = getSpreadsheet();
  var result = {
    success: true,
    exportedAt: new Date().toISOString(),
    tx: [],
    contracts: []
  };

  var txSheet = ss.getSheetByName('01_SOGOC_2026') || ss.getSheetByName('Transactions');
  if (txSheet && txSheet.getLastRow() > 1) {
    var lastRow = txSheet.getLastRow();
    var values = txSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var rawId = String(row[0] || '').trim();
      var rawDate = row[1];
      var rawAcc = String(row[2] || '').trim();
      var rawDir = String(row[3] || '').trim();
      var rawAmt = row[4];
      var rawDesc = String(row[5] || '').trim();
      var rawType = String(row[6] || '').trim();
      var rawCat = String(row[7] || '').trim();
      var rawContract = String(row[8] || '').trim();
      var rawStatus = String(row[9] || '').trim();
      var rawFlags = String(row[10] || '').trim();
      var rawDoc = String(row[11] || '').trim();
      var rawSrc = String(row[12] || '').trim();

      if (!rawDate && !rawAmt && !rawDesc) continue;

      var dateStr = '';
      if (rawDate instanceof Date && !isNaN(rawDate)) {
        dateStr = Utilities.formatDate(rawDate, 'Asia/Bangkok', 'yyyy-MM-dd');
      } else if (rawDate) {
        var str = String(rawDate).trim();
        if (str.indexOf('/') !== -1) {
          var parts = str.split('/');
          if (parts.length === 3) {
            dateStr = parts[2] + '-' + ('0' + parts[1]).slice(-2) + '-' + ('0' + parts[0]).slice(-2);
          }
        } else {
          dateStr = str.substring(0, 10);
        }
      }

      var dir = 'out';
      if (rawDir.indexOf('Thu') !== -1 || rawDir.indexOf('in') !== -1 || rawDir === '+') {
        dir = 'in';
      }

      var amt = 0;
      if (typeof rawAmt === 'number') {
        amt = rawAmt;
      } else if (rawAmt) {
        amt = parseFloat(String(rawAmt).replace(/[^0-9.-]/g, '')) || 0;
      }

      result.tx.push({
        id: rawId,
        date: dateStr,
        acc: rawAcc || 'QUY',
        dir: dir,
        amt: Math.abs(amt),
        desc: rawDesc,
        type: rawType,
        cat: rawCat,
        contract: rawContract,
        status: rawStatus || 'posted',
        flags: rawFlags ? rawFlags.split(';').map(function(s) { return s.trim(); }) : [],
        doc: rawDoc,
        src: rawSrc || 'Google Sheet'
      });
    }
  }

  var cSheet = ss.getSheetByName('02_HOPDONG_2026') || ss.getSheetByName('Contracts');
  if (cSheet && cSheet.getLastRow() > 1) {
    var cLastRow = cSheet.getLastRow();
    var cValues = cSheet.getRange(2, 1, cLastRow - 1, 12).getValues();
    for (var j = 0; j < cValues.length; j++) {
      var cRow = cValues[j];
      var cId = String(cRow[0] || '').trim();
      var cKind = String(cRow[1] || 'KH').trim();
      var cCust = String(cRow[2] || '').trim();
      var cNo = String(cRow[3] || '').trim();
      var cTv = String(cRow[4] || '').trim();
      var cSigned = cRow[5];
      var cFee = cRow[6];
      var cDisc = cRow[7];
      var cDiscApproved = String(cRow[8] || '').toUpperCase();
      var cDue = cRow[9];
      var cTerms = String(cRow[10] || '').trim();
      var cNote = String(cRow[11] || '').trim();

      if (!cCust && !cId && !cFee) continue;

      var signedStr = '';
      if (cSigned instanceof Date && !isNaN(cSigned)) {
        signedStr = Utilities.formatDate(cSigned, 'Asia/Bangkok', 'yyyy-MM-dd');
      } else if (cSigned) {
        signedStr = String(cSigned).substring(0, 10);
      }

      var dueStr = '';
      if (cDue instanceof Date && !isNaN(cDue)) {
        dueStr = Utilities.formatDate(cDue, 'Asia/Bangkok', 'yyyy-MM-dd');
      } else if (cDue) {
        dueStr = String(cDue).substring(0, 10);
      }

      var fee = typeof cFee === 'number' ? cFee : (parseFloat(String(cFee).replace(/[^0-9.-]/g, '')) || 0);
      var disc = typeof cDisc === 'number' ? cDisc : (parseFloat(String(cDisc).replace(/[^0-9.-]/g, '')) || 0);

      result.contracts.push({
        id: cId,
        kind: cKind || 'KH',
        customer: cCust,
        no: cNo,
        tv: cTv,
        signed: signedStr,
        fee: fee,
        disc: disc,
        discApproved: cDiscApproved === 'TRUE' || cDiscApproved === 'ĐÃ DUYỆT',
        due: dueStr,
        terms: cTerms,
        note: cNote
      });
    }
  }

  result.txCount = result.tx.length;
  result.contractsCount = result.contracts.length;
  return result;
}
