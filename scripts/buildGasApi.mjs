import fs from 'fs';
import path from 'path';

const fullSeed = JSON.parse(fs.readFileSync('server/fullSeed.json', 'utf8'));

const codeTemplate = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - HEADLESS DATABASE & REALTIME WEBHOOK API
 * SỔ GỐC BKD TTNG · BẢO HIỂM CÓ GIÀU (VPM)
 * =========================================================================
 * 
 * HƯỚNG DẪN DÀNH CHO MASTER:
 * 1. Mở Google Sheet: Tiện ích mở rộng (Extensions) > Apps Script.
 * 2. Dán toàn bộ nội dung file này vào tệp Mã.gs và bấm Lưu (Ctrl + S).
 * 3. ĐỂ KHỞI TẠO ĐẦY ĐỦ 9 BẢNG CƠ SỞ DỮ LIỆU:
 *    - Trên thanh công cụ trên cùng, tại ô chọn hàm (đang hiện getSpreadsheet), chọn:
 *      👉 [ initAllDatabaseSheets ]
 *    - Bấm nút: ▷ Chạy (Run)
 *    -> Sau 3-5 giây, toàn bộ 9 Tab cơ sở dữ liệu sẽ được tạo và điền sẵn
 *       216 giao dịch, 18 hợp đồng, 5 nhân sự, quà tặng, chấm công, ngân sách...
 * 4. TRIỂN KHAI WEBHOOK (Nếu cập nhật bản mới):
 *    - Bấm Triển khai (Deploy) > Quản lý bản triển khai (Manage deployments) > Chỉnh sửa (Edit)
 *    - Phiên bản: Phiên bản mới (New version) > Triển khai.
 * =========================================================================
 */

var SPREADSHEET_ID = '1hGhhLGBo4XaUMS1VTjElJMqxxx-50KA7EIhTV3w7vto';

function getSpreadsheet() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
}

/**
 * Xử lý yêu cầu HTTP GET từ Web
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';

  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      service: 'Google Sheet Database Webhook API',
      spreadsheetId: SPREADSHEET_ID,
      time: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'init') {
    var initRes = initAllDatabaseSheets();
    return ContentService.createTextOutput(JSON.stringify(initRes))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getState') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: getSheetState()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'exportAllData') {
    return ContentService.createTextOutput(JSON.stringify(exportAllData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'unknown_action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý yêu cầu HTTP POST ghi dữ liệu từ Web/Backend
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Khóa 15s bảo vệ ACID
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Google Sheet đang bận, vui lòng thử lại: ' + err.toString()
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
    } else if (action === 'syncMonthlyBalances') {
      result = apiSyncMonthlyBalances(payload.balances);
    } else if (action === 'addTransaction') {
      result = apiAddTransaction(payload.data);
    } else if (action === 'updateTransaction') {
      result = apiUpdateTransaction(payload.id, payload.updates);
    } else if (action === 'addContract') {
      result = apiAddContract(payload.data);
    } else if (action === 'saveAttendance') {
      result = apiSaveAttendance(payload.staffId, payload.dateIso, payload.val);
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
 * Chuẩn hóa tạo và định dạng Tab trên Google Sheet (Giao diện chuẩn Dark/Cyan)
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
 * TÊN MÃ CHI PHÍ QUY CHUẨN
 */
function getCategoryName(cat) {
  var map = {
    'NOIBO': 'Vận hành & nội bộ văn phòng',
    'CSKH': 'Chăm sóc khách hàng',
    'VP': 'Văn phòng phẩm & tiện ích',
    'SUKIEN': 'Hội thảo, sự kiện & Workshop',
    'LUONG': 'Lương, thù lao nhân viên & TV',
    'KHAC': 'Chi phí vận hành khác'
  };
  return map[cat] || cat;
}

/**
 * =========================================================================
 * KHỞI TẠO ĐẦY ĐỦ 9 BẢNG CƠ SỞ DỮ LIỆU TRÊN GOOGLE SHEET (1-CLICK RUN)
 * =========================================================================
 */
function initAllDatabaseSheets() {
  var ss = getSpreadsheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    // 0. Tab 00_SODU_KY: Số Dư Đầu Kỳ & Cuối Kỳ Theo Tháng
    var initialBalances = [
      { month: 'Tháng 8/2026', startQuy: -1487000, endQuy: 14828000, startAcb: 0, endAcb: 25034000, startTotal: -1487000, endTotal: 39862000, netChange: 41349000, status: 'closed' },
      { month: 'Tháng 9/2026', startQuy: 14828000, endQuy: 252982, startAcb: 25034000, endAcb: 26034000, startTotal: 39862000, endTotal: 26286982, netChange: -13575018, status: 'closed' },
      { month: 'Tháng 10/2026', startQuy: 252982, endQuy: -9081518, startAcb: 26034000, endAcb: 136386000, startTotal: 26286982, endTotal: 127304482, netChange: 101017500, status: 'open' }
    ];
    apiSyncMonthlyBalances(initialBalances);

    // 1. Tab 01_SOGOC_2026: Sổ Giao Dịch Gốc (216 giao dịch)
    var txHeaders = [
      'Mã GD', 'Ngày GD', 'Tài khoản', 'Chiều tiền', 'Số tiền (VND)', 
      'Nội dung chứng từ', 'Phân loại', 'Nhóm chi phí', 'Mã hợp đồng', 
      'Trạng thái', 'Cảnh báo', 'Chứng từ đính kèm', 'Nguồn dữ liệu'
    ];
    var txSheet = setupSheetWithStyle(ss, '01_SOGOC_2026', txHeaders);
    if (txSheet.getLastRow() <= 1 && INITIAL_DATA.tx && INITIAL_DATA.tx.length > 0) {
      var txRows = INITIAL_DATA.tx.map(function(t) {
        return [
          t.id || '', t.date || '', t.acc || '', t.dir === 'in' ? 'Thu (+)' : 'Chi (-)', t.amt || 0,
          t.desc || '', t.type || '', t.cat || '', t.contract || '',
          t.status || 'migrated', (t.flags || []).join('; '), t.doc || '', t.src || ''
        ];
      });
      txSheet.getRange(2, 1, txRows.length, txRows[0].length).setValues(txRows);
      txSheet.getRange(2, 5, txRows.length, 1).setNumberFormat('#,##0 "đ"');
      txSheet.getRange(2, 1, txRows.length, 4).setHorizontalAlignment('center');
      txSheet.getRange(2, 10, txRows.length, 1).setHorizontalAlignment('center');
      txSheet.autoResizeColumns(1, 13);
    }

    // 2. Tab 02_HOPDONG_2026: Hợp Đồng (18 hợp đồng)
    var cHeaders = [
      'Mã HĐ', 'Loại HĐ', 'Tên khách hàng', 'Số hợp đồng', 'Tư vấn viên',
      'Ngày ký', 'Phí bảo hiểm (VND)', 'Chiết khấu (VND)', 'Duyệt CK',
      'Hạn thanh toán', 'Kỳ hạn thanh toán', 'Ghi chú'
    ];
    var cSheet = setupSheetWithStyle(ss, '02_HOPDONG_2026', cHeaders);
    if (cSheet.getLastRow() <= 1 && INITIAL_DATA.contracts && INITIAL_DATA.contracts.length > 0) {
      var cRows = INITIAL_DATA.contracts.map(function(c) {
        return [
          c.id || '', c.kind || '', c.customer || '', c.no || '', c.tv || '',
          c.signed || '', c.fee || 0, c.disc || 0, c.discApproved ? 'ĐÃ DUYỆT' : 'CHƯA DUYỆT',
          c.due || '', c.terms || '', c.note || ''
        ];
      });
      cSheet.getRange(2, 1, cRows.length, cRows[0].length).setValues(cRows);
      cSheet.getRange(2, 7, cRows.length, 2).setNumberFormat('#,##0 "đ"');
      cSheet.getRange(2, 1, cRows.length, 2).setHorizontalAlignment('center');
      cSheet.getRange(2, 6, cRows.length, 1).setHorizontalAlignment('center');
      cSheet.getRange(2, 9, cRows.length, 2).setHorizontalAlignment('center');
      cSheet.autoResizeColumns(1, 12);
    }

    // 3. Tab 03_QUATANG: Danh Mục Quà Tặng
    var gHeaders = [
      'Mã quà', 'Tên quà tặng / Ấn phẩm', 'Đơn vị tính', 'Đơn giá xuất kho (VND)',
      'Số lượng tồn ban đầu', 'Mục đích sử dụng', 'Ghi chú'
    ];
    var gSheet = setupSheetWithStyle(ss, '03_QUATANG', gHeaders);
    if (gSheet.getLastRow() <= 1 && INITIAL_DATA.gifts && INITIAL_DATA.gifts.items) {
      var gRows = INITIAL_DATA.gifts.items.map(function(g) {
        return [g.id || '', g.name || '', g.unit || '', g.price || 0, 100, 'Quà tặng & Hội thảo', ''];
      });
      gSheet.getRange(2, 1, gRows.length, gRows[0].length).setValues(gRows);
      gSheet.getRange(2, 4, gRows.length, 1).setNumberFormat('#,##0 "đ"');
      gSheet.getRange(2, 1, gRows.length, 1).setHorizontalAlignment('center');
      gSheet.getRange(2, 3, gRows.length, 1).setHorizontalAlignment('center');
      gSheet.autoResizeColumns(1, 7);
    }

    // 4. Tab 04_CHAMCONG_2026: Chấm Công Nhân Sự
    var attHeaders = ['Họ và tên nhân sự', 'Ngày chấm công', 'Số công ghi nhận (1 / 0.5 / P)', 'Trạng thái'];
    var attSheet = setupSheetWithStyle(ss, '04_CHAMCONG_2026', attHeaders);
    if (attSheet.getLastRow() <= 1 && INITIAL_DATA.att) {
      var attRows = [];
      Object.keys(INITIAL_DATA.att).forEach(function(staffName) {
        var days = INITIAL_DATA.att[staffName].days || {};
        Object.keys(days).forEach(function(dIso) {
          attRows.push([staffName, dIso, String(days[dIso]), 'Đã chốt công']);
        });
      });
      if (attRows.length > 0) {
        attSheet.getRange(2, 1, attRows.length, attRows[0].length).setValues(attRows);
        attSheet.getRange(2, 2, attRows.length, 3).setHorizontalAlignment('center');
        attSheet.autoResizeColumns(1, 4);
      }
    }

    // 5. Tab 05_NHANSU: Nhân Sự & Định Mức Lương
    var stHeaders = [
      'Mã NV', 'Họ và tên nhân sự', 'Chức vụ', 'Lương cơ bản (VND)',
      'Phụ cấp ĐT', 'Phụ cấp Xăng', 'Phụ cấp Ăn trưa', 'Phụ cấp Công tác',
      'KPI dự kiến', 'Lương đóng BH', 'Số người phụ thuộc', 'Tạm ứng'
    ];
    var stSheet = setupSheetWithStyle(ss, '05_NHANSU', stHeaders);
    if (stSheet.getLastRow() <= 1 && INITIAL_DATA.staff && INITIAL_DATA.staff.length > 0) {
      var stRows = INITIAL_DATA.staff.map(function(s) {
        var al = s.allow || {};
        return [
          s.id || '', s.name || '', s.role || '', s.base || 0,
          al.phone || 0, al.fuel || 0, al.meal || 0, al.travel || 0,
          s.kpi || 0, s.insSalary || 0, s.deps || 0, s.advance || 0
        ];
      });
      stSheet.getRange(2, 1, stRows.length, stRows[0].length).setValues(stRows);
      stSheet.getRange(2, 4, stRows.length, 9).setNumberFormat('#,##0 "đ"');
      stSheet.getRange(2, 1, stRows.length, 1).setHorizontalAlignment('center');
      stSheet.getRange(2, 3, stRows.length, 1).setHorizontalAlignment('center');
      stSheet.autoResizeColumns(1, 12);
    }

    // 6. Tab 06_NGANSACH_2026: Dự Toán Ngân Sách
    var bHeaders = ['Tháng áp dụng', 'Mã danh mục', 'Tên nhóm ngân sách', 'Hạn mức phê duyệt (VND)', 'Ghi chú'];
    var bSheet = setupSheetWithStyle(ss, '06_NGANSACH_2026', bHeaders);
    if (bSheet.getLastRow() <= 1 && INITIAL_DATA.budget) {
      var bRows = [];
      Object.keys(INITIAL_DATA.budget).forEach(function(mon) {
        var cats = INITIAL_DATA.budget[mon] || {};
        Object.keys(cats).forEach(function(cat) {
          bRows.push([mon, cat, getCategoryName(cat), cats[cat], 'Dự toán hàng tháng']);
        });
      });
      if (bRows.length > 0) {
        bSheet.getRange(2, 1, bRows.length, bRows[0].length).setValues(bRows);
        bSheet.getRange(2, 4, bRows.length, 1).setNumberFormat('#,##0 "đ"');
        bSheet.getRange(2, 1, bRows.length, 2).setHorizontalAlignment('center');
        bSheet.autoResizeColumns(1, 5);
      }
    }

    // 7. Tab 07_DEXUAT_KEHOACH: Kế Hoạch & Đệ Trình
    setupSheetWithStyle(ss, '07_DEXUAT_KEHOACH', [
      'Mã tờ trình', 'Tiêu đề đề xuất', 'Người lập', 'Bộ phận',
      'Số tiền đề xuất (VND)', 'Ngày lập', 'Nội dung chi tiết', 'Trạng thái phê duyệt', 'Cập nhật'
    ]);

    // 8. Tab 08_DANHMUC_CHUNG: Danh Mục Chuẩn Hóa
    var dmHeaders = ['Phân nhóm', 'Mã danh mục', 'Tên gọi quy chuẩn', 'Diễn giải / Ý nghĩa', 'Trạng thái'];
    var dmSheet = setupSheetWithStyle(ss, '08_DANHMUC_CHUNG', dmHeaders);
    if (dmSheet.getLastRow() <= 1) {
      var dmRows = [
        ['Tài khoản quỹ', 'QUY', 'Hộp tiền mặt (QUY)', 'Quỹ tiền mặt quản lý trực tiếp tại văn phòng', 'Đang sử dụng'],
        ['Tài khoản ngân hàng', 'ACB', 'Tài khoản ACB', 'Tài khoản ngân hàng Á Châu chính', 'Đang sử dụng'],
        ['Tài khoản ngân hàng', 'TCB', 'Tài khoản Techcombank', 'Tài khoản ngân hàng phụ', 'Đang sử dụng'],
        ['Tài khoản đối trừ', 'BT', 'Bù trừ không qua tài khoản', 'Dùng hạch toán khấu trừ / cấn trừ', 'Đang sử dụng'],
        ['Chi phí vận hành', 'NOIBO', 'Vận hành & nội bộ', 'Chi phí ăn uống, tiếp khách, họp nội bộ', 'Đang sử dụng'],
        ['Chi phí khách hàng', 'CSKH', 'Chăm sóc khách hàng', 'Quà tặng, tri ân khách hàng', 'Đang sử dụng'],
        ['Chi phí văn phòng', 'VP', 'Văn phòng phẩm & tiện ích', 'In ấn, văn phòng phẩm, tiện ích', 'Đang sử dụng'],
        ['Chi phí sự kiện', 'SUKIEN', 'Hội thảo, sự kiện & Workshop', 'Chi phí tổ chức workshop, talkshow', 'Đang sử dụng'],
        ['Chi phí nhân sự', 'LUONG', 'Lương, thù lao nhân viên & TV', 'Chi trả lương cứng, hoa hồng, thù lao', 'Đang sử dụng'],
        ['Doanh thu & Vốn', 'DFAM_CAP', 'DFAM chuyển vốn cấp', 'Nguồn vốn cấp định kỳ từ công ty mẹ', 'Đang sử dụng'],
        ['Doanh thu & Thu hồi', 'THU_KH', 'Thu hồi nợ từ Khách hàng', 'Tiền hoàn ứng hoặc thanh toán từ KH', 'Đang sử dụng'],
        ['Doanh thu & Thu hồi', 'THU_TV', 'Thu hồi nợ từ Tư vấn', 'Tiền hoàn trả tạm ứng từ tư vấn viên', 'Đang sử dụng']
      ];
      dmSheet.getRange(2, 1, dmRows.length, dmRows[0].length).setValues(dmRows);
      dmSheet.getRange(2, 1, dmRows.length, 2).setHorizontalAlignment('center');
      dmSheet.getRange(2, 5, dmRows.length, 1).setHorizontalAlignment('center');
      dmSheet.autoResizeColumns(1, 5);
    }

    // Xóa tab mặc định "Trang tính1" hoặc "Sheet1" nếu có
    var defaultSheet = ss.getSheetByName('Trang tính1') || ss.getSheetByName('Sheet1');
    if (defaultSheet && ss.getSheets().length > 1) {
      ss.deleteSheet(defaultSheet);
    }

    SpreadsheetApp.flush();
    return { success: true, message: 'Đã khởi tạo thành công toàn bộ 9 tab cơ sở dữ liệu trên Google Sheet!', totalTabsCreated: 9 };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * ĐỒNG BỘ TOÀN BỘ CƠ SỞ DỮ LIỆU TỪ POSTGRESQL (API PUSH)
 * =========================================================================
 */
function apiSyncFullDatabase(payload) {
  var ss = getSpreadsheet();
  var state = payload.state || {};
  var balances = payload.balances || [];

  // 1. Đồng bộ số dư các kỳ
  if (balances && balances.length > 0) {
    apiSyncMonthlyBalances(balances);
  }

  // 2. Đồng bộ giao dịch sang 01_SOGOC_2026
  if (state.tx && Array.isArray(state.tx)) {
    var txSheet = setupSheetWithStyle(ss, '01_SOGOC_2026', [
      'Mã GD', 'Ngày GD', 'Tài khoản', 'Chiều tiền', 'Số tiền (VND)', 
      'Nội dung chứng từ', 'Phân loại', 'Nhóm chi phí', 'Mã hợp đồng', 
      'Trạng thái', 'Cảnh báo', 'Chứng từ đính kèm', 'Nguồn dữ liệu'
    ]);
    if (state.tx.length > 0) {
      if (txSheet.getLastRow() > 1) {
        txSheet.getRange(2, 1, txSheet.getLastRow() - 1, 13).clearContent();
      }
      var rows = state.tx.map(function(t) {
        return [
          t.id || '', t.date || '', t.acc || '', t.dir === 'in' ? 'Thu (+)' : 'Chi (-)', t.amt || 0,
          t.desc || '', t.type || '', t.cat || '', t.contract || '',
          t.status || 'migrated', (t.flags || []).join('; '), t.doc || '', t.src || ''
        ];
      });
      txSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
      txSheet.getRange(2, 5, rows.length, 1).setNumberFormat('#,##0 "đ"');
      txSheet.getRange(2, 1, rows.length, 4).setHorizontalAlignment('center');
      txSheet.getRange(2, 10, rows.length, 1).setHorizontalAlignment('center');
    }
  }

  // 3. Đồng bộ hợp đồng sang 02_HOPDONG_2026
  if (state.contracts && Array.isArray(state.contracts)) {
    var cSheet = setupSheetWithStyle(ss, '02_HOPDONG_2026', [
      'Mã HĐ', 'Loại HĐ', 'Tên khách hàng', 'Số hợp đồng', 'Tư vấn viên',
      'Ngày ký', 'Phí bảo hiểm (VND)', 'Chiết khấu (VND)', 'Duyệt CK',
      'Hạn thanh toán', 'Kỳ hạn thanh toán', 'Ghi chú'
    ]);
    if (state.contracts.length > 0) {
      if (cSheet.getLastRow() > 1) {
        cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 12).clearContent();
      }
      var cRows = state.contracts.map(function(c) {
        return [
          c.id || '', c.kind || '', c.customer || '', c.no || '', c.tv || '',
          c.signed || '', c.fee || 0, c.disc || 0, c.discApproved ? 'ĐÃ DUYỆT' : 'CHƯA DUYỆT',
          c.due || '', c.terms || '', c.note || ''
        ];
      });
      cSheet.getRange(2, 1, cRows.length, cRows[0].length).setValues(cRows);
      cSheet.getRange(2, 7, cRows.length, 2).setNumberFormat('#,##0 "đ"');
      cSheet.getRange(2, 1, cRows.length, 2).setHorizontalAlignment('center');
    }
  }

  SpreadsheetApp.flush();
  return { success: true, message: 'Đã đồng bộ toàn bộ cơ sở dữ liệu từ PostgreSQL sang Google Sheet!' };
}

/**
 * Thêm giao dịch vào Sheet 01_SOGOC_2026
 */
function apiAddTransaction(t) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('01_SOGOC_2026') || ss.getSheetByName('Transactions') || ss.getSheets()[0];
  
  var row = [
    t.id || '',
    t.date || '',
    t.acc || '',
    t.dir === 'in' ? 'Thu (+)' : 'Chi (-)',
    t.amt || 0,
    t.desc || '',
    t.type || '',
    t.cat || '',
    t.contract || '',
    t.status || 'posted',
    (t.flags || []).join('; '),
    t.doc || '',
    t.src || 'Web App'
  ];
  sheet.appendRow(row);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 5).setNumberFormat('#,##0 "đ"');
  sheet.getRange(lastRow, 1, 1, 4).setHorizontalAlignment('center');
  sheet.getRange(lastRow, 10).setHorizontalAlignment('center');
  return { success: true, id: t.id };
}

/**
 * Cập nhật giao dịch theo ID
 */
function apiUpdateTransaction(id, updates) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('01_SOGOC_2026') || ss.getSheetByName('Transactions') || ss.getSheets()[0];
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
      return { success: true, updatedRow: rIdx };
    }
  }
  return { success: false, message: 'Không tìm thấy ID: ' + id };
}

/**
 * Thêm hợp đồng vào Sheet 02_HOPDONG_2026
 */
function apiAddContract(c) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('02_HOPDONG_2026') || ss.getSheetByName('Contracts');
  if (!sheet) {
    sheet = setupSheetWithStyle(ss, '02_HOPDONG_2026', [
      'Mã HĐ', 'Loại HĐ', 'Tên khách hàng', 'Số hợp đồng', 'Tư vấn viên',
      'Ngày ký', 'Phí bảo hiểm (VND)', 'Chiết khấu (VND)', 'Duyệt CK',
      'Hạn thanh toán', 'Kỳ hạn thanh toán', 'Ghi chú'
    ]);
  }

  var row = [
    c.id || '',
    c.kind || '',
    c.customer || '',
    c.no || '',
    c.tv || '',
    c.signed || '',
    c.fee || 0,
    c.disc || 0,
    c.discApproved ? 'ĐÃ DUYỆT' : 'CHƯA DUYỆT',
    c.due || '',
    c.terms || '',
    c.note || ''
  ];
  sheet.appendRow(row);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 7, 1, 2).setNumberFormat('#,##0 "đ"');
  return { success: true, id: c.id };
}

/**
 * Lưu chấm công
 */
function apiSaveAttendance(staffId, dateIso, val) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('04_CHAMCONG_2026') || ss.getSheetByName('Attendance');
  if (!sheet) {
    sheet = setupSheetWithStyle(ss, '04_CHAMCONG_2026', ['Họ và tên nhân sự', 'Ngày chấm công', 'Số công ghi nhận (1 / 0.5 / P)', 'Trạng thái']);
  }
  sheet.appendRow([staffId, dateIso, String(val), 'Cập nhật từ Web']);
  return { success: true };
}

/**
 * Đồng bộ Số dư đầu kỳ & cuối kỳ theo từng tháng vào Tab 00_SODU_KY
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
    numRange.setNumberFormat('#,##0 "đ"');
    numRange.setHorizontalAlignment('right');
    
    sheet.getRange(2, 1, rows.length, 1).setHorizontalAlignment('center').setFontWeight('bold');
    sheet.getRange(2, 9, rows.length, 2).setHorizontalAlignment('center');
  }

  sheet.autoResizeColumns(1, 10);
  return { success: true, count: rows.length, sheetName: sheetName };
}

function getSheetState() {
  return { status: 'ok', message: 'Sheet online', time: new Date().toISOString() };
}

/**
 * =========================================================================
 * XUẤT TOÀN BỘ DỮ LIỆU TỪ GOOGLE SHEET ĐỂ ĐỒNG BỘ VỀ POSTGRESQL (SHEET -> DB)
 * =========================================================================
 */
function exportAllData() {
  var ss = getSpreadsheet();
  var result = {
    success: true,
    exportedAt: new Date().toISOString(),
    tx: [],
    contracts: []
  };

  // 1. Quét Tab Giao dịch (01_SOGOC_2026 hoặc Transactions)
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

      // Bỏ qua dòng trống
      if (!rawDate && !rawAmt && !rawDesc) continue;

      // Chuẩn hóa ngày ISO YYYY-MM-DD
      var dateStr = '';
      if (rawDate instanceof Date && !isNaN(rawDate)) {
        dateStr = Utilities.formatDate(rawDate, 'Asia/Bangkok', 'yyyy-MM-dd');
      } else if (rawDate) {
        var str = String(rawDate).trim();
        // Xử lý dạng dd/MM/yyyy hoặc yyyy-MM-dd
        if (str.indexOf('/') !== -1) {
          var parts = str.split('/');
          if (parts.length === 3) {
            dateStr = parts[2] + '-' + ('0' + parts[1]).slice(-2) + '-' + ('0' + parts[0]).slice(-2);
          }
        } else {
          dateStr = str.substring(0, 10);
        }
      }

      // Chuẩn hóa chiều tiền
      var dir = 'out';
      if (rawDir.indexOf('Thu') !== -1 || rawDir.indexOf('in') !== -1 || rawDir === '+') {
        dir = 'in';
      }

      // Chuẩn hóa số tiền
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

  // 2. Quét Tab Hợp đồng (02_HOPDONG_2026 hoặc Contracts)
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

/**
 * CƠ SỞ DỮ LIỆU BAN ĐẦU (SEED DATA TÍCH HỢP)
 */
var INITIAL_DATA = ` + JSON.stringify(fullSeed, null, 2) + `;
`;

fs.writeFileSync('gas/api.gs', codeTemplate, 'utf8');
console.log('Successfully written gas/api.gs, file size:', fs.statSync('gas/api.gs').size);

