/**
 * Script tự động sinh mã nguồn Backend Google Apps Script (gas/Code.js)
 * Tích hợp toàn bộ Schema 15 tab, Seed Data 216+ giao dịch, 18 hợp đồng, nhân sự, chấm công và API endpoints.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_DATA } from '../src/data/seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const gasDir = path.resolve(rootDir, 'gas');

function generateGasBackend() {
  console.log('⚙️ Đang tạo mã nguồn Google Apps Script (gas/Code.js)...');

  const seedGifts = [
    { id: 'Q01', name: 'Hộp bánh trung thu', unit: 'hộp', price: 271675 },
    { id: 'Q02', name: 'Quà bốc thăm hội thảo', unit: 'phần', price: 666364 },
    { id: 'Q03', name: 'Ấn phẩm, brochure', unit: 'cuốn', price: 14850 },
    { id: 'Q04', name: 'Tờ rơi thẻ', unit: 'tờ', price: 3208 },
    { id: 'Q05', name: 'Hashtag cầm tay', unit: 'cái', price: 76667 },
    { id: 'Q06', name: 'Túi đựng quà', unit: 'cái', price: 5350 }
  ];

  const seedMovements = [
    { d: '2026-09-02', item: 'Q01', qty: 40, kind: 'in', who: 'Mua lô bánh trung thu', tx: 'G0073', ex: true },
    { d: '2026-09-11', item: 'Q03', qty: 300, kind: 'in', who: 'In ấn phẩm', tx: 'G0104', ex: true },
    { d: '2026-09-16', item: 'Q04', qty: 120, kind: 'in', who: 'In 120 tờ rơi thẻ', tx: 'G0112', ex: false },
    { d: '2026-09-18', item: 'Q05', qty: 3, kind: 'in', who: 'Mua hashtag', tx: 'G0116', ex: false },
    { d: '2026-09-18', item: 'Q06', qty: 20, kind: 'in', who: 'Mua túi đựng quà', tx: 'G0117', ex: true },
    { d: '2026-09-19', item: 'Q02', qty: 11, kind: 'in', who: 'Quà bốc thăm HT 19/9 (cọc 30% + phần còn lại)', tx: 'G0134', ex: false },
    { d: '2026-09-08', item: 'Q01', qty: 12, kind: 'out', to: 'TV', who: 'Nguyễn Hữu Thạch', note: 'Tặng khách dịp trung thu', ex: true },
    { d: '2026-09-08', item: 'Q01', qty: 8, kind: 'out', to: 'TV', who: 'Thái Thị Thanh Thảo', note: 'Tặng khách dịp trung thu', ex: true },
    { d: '2026-09-12', item: 'Q01', qty: 10, kind: 'out', to: 'SK', who: 'Workshop trung thu', note: '', ex: true },
    { d: '2026-09-19', item: 'Q02', qty: 11, kind: 'out', to: 'SK', who: 'Hội thảo 19/9', note: 'Bốc thăm 33 khách đăng ký', ex: false },
    { d: '2026-09-19', item: 'Q03', qty: 120, kind: 'out', to: 'SK', who: 'Hội thảo 19/9', note: '', ex: true },
    { d: '2026-09-19', item: 'Q04', qty: 80, kind: 'out', to: 'SK', who: 'Hội thảo 19/9', note: '', ex: true },
    { d: '2026-09-25', item: 'Q06', qty: 6, kind: 'out', to: 'KH', who: 'Khách Cường', note: 'Gói quà tặng', ex: true }
  ];

  const seedPayload = {
    contracts: SEED_DATA.contracts,
    tx: SEED_DATA.tx,
    staff: SEED_DATA.staff,
    att: SEED_DATA.att,
    attMonth: SEED_DATA.attMonth,
    holidays: SEED_DATA.holidays,
    gifts: {
      items: seedGifts,
      mv: seedMovements
    },
    budget: {
      '2026-08': { LUONG: 33228000, SUKIEN: 3000000 },
      '2026-09': {},
      '2026-10': {}
    },
    locks: {},
    close: {},
    log: [
      { at: '2026-10-19 08:00', role: 'vpm', what: 'Khởi tạo hệ thống Sổ Gốc BKD TTNG' }
    ]
  };

  const codeContent = `/**
 * =========================================================================
 * SỔ GỐC BKD TTNG · BẢO HIỂM CÓ GIÀU (VPM)
 * BACKEND GOOGLE APPS SCRIPT (GAS) - SINGLE SOURCE OF TRUTH
 * =========================================================================
 * Spreadsheet ID: 1hGhhLGBo4XaUMS1VTjElJMqxxx-50KA7EIhTV3w7vto
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
 * Tạo Menu tiện ích trên Google Sheet
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('👑 Sổ Quỹ VPM')
    .addItem('🚀 Mở Ứng Dụng Sổ Quỹ (Cửa sổ lớn)', 'showWebAppDialog')
    .addItem('📱 Mở Ứng Dụng Sổ Quỹ (Thanh bên Sidebar)', 'showWebAppSidebar')
    .addSeparator()
    .addItem('⚙️ Khởi tạo / Nạp lại 15 Tab Cơ sở dữ liệu', 'initDatabaseSheets')
    .addToUi();
}

/**
 * Phục vụ Web App dạng Single-Page Application (SPA)
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Sổ Gốc BKD TTNG · Bảo Hiểm Có Giàu')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/**
 * Hiển thị ứng dụng dạng Dialog toàn màn hình bên trong Sheet
 */
function showWebAppDialog() {
  var html = HtmlService.createHtmlOutputFromFile('index')
    .setWidth(1280)
    .setHeight(820)
    .setTitle('Sổ Gốc BKD TTNG · Bảo Hiểm Có Giàu (VPM)');
  SpreadsheetApp.getUi().showModalDialog(html, '👑 Hệ Thống Quản Lý Tài Chính & Sổ Quỹ VPM');
}

/**
 * Hiển thị ứng dụng dạng Sidebar bên phải Google Sheet
 */
function showWebAppSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Sổ Gốc VPM');
  SpreadsheetApp.getUi().showSidebar(html);
}

// DỮ LIỆU BAN ĐẦU CHUẨN HOÁ
var INITIAL_DATA = ${JSON.stringify(seedPayload, null, 2)};

/**
 * Tự động tạo và chuẩn hóa 15 Tab Cơ sở dữ liệu
 */
function initDatabaseSheets() {
  var ss = getSpreadsheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    // 1. Tab Transactions
    setupSheet(ss, 'Transactions', [
      'Mã GD (id)', 'Ngày (date)', 'Tài khoản (acc)', 'Chiều (dir)', 'Số tiền (amt)', 
      'Nội dung (desc)', 'Phân loại (type)', 'Nhóm CP (cat)', 'Hợp đồng (contract)', 
      'Trạng thái (status)', 'Cảnh báo (flags)', 'Chứng từ (doc)', 'Nguồn dữ liệu (src)'
    ]);
    var txSheet = ss.getSheetByName('Transactions');
    if (txSheet.getLastRow() <= 1) {
      var txRows = INITIAL_DATA.tx.map(function(t) {
        return [
          t.id || '', t.date || '', t.acc || '', t.dir || '', t.amt || 0,
          t.desc || '', t.type || '', t.cat || '', t.contract || '',
          t.status || 'pending', (t.flags || []).join('; '), t.doc || '', t.src || ''
        ];
      });
      if (txRows.length > 0) {
        txSheet.getRange(2, 1, txRows.length, txRows[0].length).setValues(txRows);
        txSheet.getRange(2, 5, txRows.length, 1).setNumberFormat('#,##0');
      }
    }

    // 2. Tab Contracts
    setupSheet(ss, 'Contracts', [
      'Mã HĐ (id)', 'Loại (kind)', 'Khách hàng (customer)', 'Số HĐ (no)', 'Tư vấn (tv)',
      'Ngày ký (signed)', 'Phí bảo hiểm (fee)', 'Chiết khấu (disc)', 'Duyệt CK (discApproved)',
      'Hạn thanh toán (due)', 'Kỳ hạn (terms)', 'Ghi chú (note)'
    ]);
    var cSheet = ss.getSheetByName('Contracts');
    if (cSheet.getLastRow() <= 1) {
      var cRows = INITIAL_DATA.contracts.map(function(c) {
        return [
          c.id || '', c.kind || '', c.customer || '', c.no || '', c.tv || '',
          c.signed || '', c.fee || 0, c.disc || 0, c.discApproved ? 'TRUE' : 'FALSE',
          c.due || '', c.terms || '', c.note || ''
        ];
      });
      if (cRows.length > 0) {
        cSheet.getRange(2, 1, cRows.length, cRows[0].length).setValues(cRows);
        cSheet.getRange(2, 7, cRows.length, 2).setNumberFormat('#,##0');
      }
    }

    // 3. Tab Gifts
    setupSheet(ss, 'Gifts', ['Mã quà (id)', 'Tên quà tặng (name)', 'Đơn vị tính (unit)', 'Đơn giá (price)']);
    var gSheet = ss.getSheetByName('Gifts');
    if (gSheet.getLastRow() <= 1) {
      var gRows = INITIAL_DATA.gifts.items.map(function(g) {
        return [g.id || '', g.name || '', g.unit || '', g.price || 0];
      });
      if (gRows.length > 0) {
        gSheet.getRange(2, 1, gRows.length, gRows[0].length).setValues(gRows);
        gSheet.getRange(2, 4, gRows.length, 1).setNumberFormat('#,##0');
      }
    }

    // 4. Tab StockMovements
    setupSheet(ss, 'StockMovements', [
      'Ngày (d)', 'Mã quà (item)', 'Số lượng (qty)', 'Loại phiếu (kind)', 
      'Người nhận/giao (who)', 'Đối tượng (to)', 'Ghi chú (note)', 'Mã GD (tx)', 'Đã trừ lương TV (ex)'
    ]);
    var mvSheet = ss.getSheetByName('StockMovements');
    if (mvSheet.getLastRow() <= 1) {
      var mvRows = INITIAL_DATA.gifts.mv.map(function(m) {
        return [
          m.d || '', m.item || '', m.qty || 0, m.kind || '',
          m.who || '', m.to || '', m.note || '', m.tx || '', m.ex ? 'TRUE' : 'FALSE'
        ];
      });
      if (mvRows.length > 0) {
        mvSheet.getRange(2, 1, mvRows.length, mvRows[0].length).setValues(mvRows);
      }
    }

    // 5. Tab Staff
    setupSheet(ss, 'Staff', [
      'Mã NV (id)', 'Họ và tên (name)', 'Vị trí (role)', 'Lương cứng (base)', 
      'Điện thoại (phone)', 'Xăng xe (fuel)', 'Ăn trưa (meal)', 'Công tác (travel)',
      'KPI (kpi)', 'Lương BH (insSalary)', 'Người phụ thuộc (deps)', 'Tạm ứng (advance)'
    ]);
    var stSheet = ss.getSheetByName('Staff');
    if (stSheet.getLastRow() <= 1) {
      var stRows = INITIAL_DATA.staff.map(function(s) {
        var al = s.allow || {};
        return [
          s.id || '', s.name || '', s.role || '', s.base || 0,
          al.phone || 0, al.fuel || 0, al.meal || 0, al.travel || 0,
          s.kpi || 0, s.insSalary || 0, s.deps || 0, s.advance || 0
        ];
      });
      if (stRows.length > 0) {
        stSheet.getRange(2, 1, stRows.length, stRows[0].length).setValues(stRows);
        stSheet.getRange(2, 4, stRows.length, 9).setNumberFormat('#,##0');
      }
    }

    // 6. Tab Attendance
    setupSheet(ss, 'Attendance', ['Nhân viên (staff)', 'Ngày (date)', 'Số công (val)']);
    var attSheet = ss.getSheetByName('Attendance');
    if (attSheet.getLastRow() <= 1) {
      var attRows = [];
      Object.keys(INITIAL_DATA.att).forEach(function(staffName) {
        var days = INITIAL_DATA.att[staffName].days || {};
        Object.keys(days).forEach(function(dIso) {
          attRows.push([staffName, dIso, String(days[dIso])]);
        });
      });
      if (attRows.length > 0) {
        attSheet.getRange(2, 1, attRows.length, attRows[0].length).setValues(attRows);
      }
    }

    // 7. Tab Budget
    setupSheet(ss, 'Budget', ['Tháng (month)', 'Danh mục (category)', 'Số tiền dự toán (amount)']);
    var bSheet = ss.getSheetByName('Budget');
    if (bSheet.getLastRow() <= 1) {
      var bRows = [];
      Object.keys(INITIAL_DATA.budget).forEach(function(mon) {
        var cats = INITIAL_DATA.budget[mon] || {};
        Object.keys(cats).forEach(function(cat) {
          bRows.push([mon, cat, cats[cat]]);
        });
      });
      if (bRows.length > 0) {
        bSheet.getRange(2, 1, bRows.length, bRows[0].length).setValues(bRows);
        bSheet.getRange(2, 3, bRows.length, 1).setNumberFormat('#,##0');
      }
    }

    // 8. Tab Locks
    setupSheet(ss, 'Locks', ['Tháng (month)', 'Đã khóa (locked)', 'Thời gian khóa (lockedAt)', 'Người khóa (lockedBy)']);

    // 9. Tab ClosingChecklist
    setupSheet(ss, 'ClosingChecklist', ['Tháng (month)', 'Mục kiểm tra (key)', 'Trạng thái/Giá trị (value)']);

    // 10. Tab AuditLogs
    setupSheet(ss, 'AuditLogs', ['Thời gian (at)', 'Vai trò (role)', 'Hành động (what)']);
    var lSheet = ss.getSheetByName('AuditLogs');
    if (lSheet.getLastRow() <= 1) {
      var lRows = INITIAL_DATA.log.map(function(l) { return [l.at, l.role, l.what]; });
      if (lRows.length > 0) {
        lSheet.getRange(2, 1, lRows.length, lRows[0].length).setValues(lRows);
      }
    }

    // 11-15: Các tab danh mục chuẩn hóa
    setupSheet(ss, 'Accounts', ['Mã tài khoản', 'Tên hiển thị']);
    var accSheet = ss.getSheetByName('Accounts');
    if (accSheet.getLastRow() <= 1) {
      accSheet.getRange(2, 1, 4, 2).setValues([
        ['QUY', 'Hộp tiền mặt (QUY)'],
        ['ACB', 'Tài khoản ACB (ACB)'],
        ['TCB', 'Tài khoản Techcombank (TCB)'],
        ['BT', 'Bù trừ không về tài khoản (BT)']
      ]);
    }

    setupSheet(ss, 'CostCategories', ['Mã nhóm chi', 'Tên diễn giải']);
    var catSheet = ss.getSheetByName('CostCategories');
    if (catSheet.getLastRow() <= 1) {
      catSheet.getRange(2, 1, 6, 2).setValues([
        ['NOIBO', 'Vận hành & nội bộ văn phòng'],
        ['CSKH', 'Chăm sóc khách hàng'],
        ['VP', 'Văn phòng phẩm & tiện ích'],
        ['SUKIEN', 'Hội thảo, sự kiện & Workshop'],
        ['LUONG', 'Lương, thù lao nhân viên & tư vấn'],
        ['KHAC', 'Chi phí vận hành khác']
      ]);
    }

    setupSheet(ss, 'RevenueCategories', ['Mã loại thu', 'Tên nhóm thu']);
    var revSheet = ss.getSheetByName('RevenueCategories');
    if (revSheet.getLastRow() <= 1) {
      revSheet.getRange(2, 1, 4, 2).setValues([
        ['DFAM_CAP', 'DFAM chuyển vốn cấp'],
        ['THU_KH', 'Thu hồi nợ từ Khách hàng'],
        ['THU_TV', 'Thu hồi nợ từ Tư vấn'],
        ['THU_KHAC', 'Các khoản thu bổ sung khác']
      ]);
    }

    setupSheet(ss, 'ExpenseCategories', ['Mã loại chi', 'Tên nhóm chi đặc thù']);
    var expSheet = ss.getSheetByName('ExpenseCategories');
    if (expSheet.getLastRow() <= 1) {
      expSheet.getRange(2, 1, 4, 2).setValues([
        ['UNG_PHI', 'Ứng nộp phí bảo hiểm cho KH/TV'],
        ['HOAN_UNG', 'Hoàn trả tiền ứng trước'],
        ['CHUYEN_DFAM', 'Chuyển tiền trả về DFAM'],
        ['TAM_UNG', 'Nhân viên tạm ứng tiền']
      ]);
    }

    setupSheet(ss, 'Settings', ['Tham số', 'Giá trị cấu hình']);
    var setSheet = ss.getSheetByName('Settings');
    if (setSheet.getLastRow() <= 1) {
      setSheet.getRange(2, 1, 4, 2).setValues([
        ['APPROVAL_THRESHOLD', '2000000'],
        ['STANDARD_WORKING_DAYS', '24'],
        ['OVERTIME_RATE_HOLIDAY', '300%'],
        ['OVERTIME_RATE_SUNDAY', '200%']
      ]);
    }

    // Xóa tab mặc định "Trang tính1" hoặc "Sheet1" nếu có
    var defaultSheet = ss.getSheetByName('Trang tính1') || ss.getSheetByName('Sheet1');
    if (defaultSheet && ss.getSheets().length > 1) {
      ss.deleteSheet(defaultSheet);
    }

    SpreadsheetApp.flush();
    return { success: true, message: 'Đã khởi tạo thành công 15 tab cơ sở dữ liệu!' };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper tạo và định dạng tab đẹp mắt
 */
function setupSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#172430')
               .setFontColor('#ffffff')
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
 * API ĐỌC & GHI DỮ LIỆU TỪ REACT FRONTEND
 * =========================================================================
 */

/**
 * Tải toàn bộ AppState từ 15 tab Sheets
 */
function getInitialState() {
  var ss = getSpreadsheet();
  
  // Nếu chưa có tab Transactions, tự động khởi tạo dữ liệu
  if (!ss.getSheetByName('Transactions')) {
    initDatabaseSheets();
  }

  try {
    var state = JSON.parse(JSON.stringify(INITIAL_DATA));

    // 1. Đọc Transactions
    var txSheet = ss.getSheetByName('Transactions');
    if (txSheet && txSheet.getLastRow() > 1) {
      var txVals = txSheet.getRange(2, 1, txSheet.getLastRow() - 1, 13).getValues();
      state.tx = txVals.map(function(r) {
        return {
          id: String(r[0]),
          date: r[1] instanceof Date ? Utilities.formatDate(r[1], 'GMT+7', 'yyyy-MM-dd') : String(r[1]),
          acc: String(r[2]),
          dir: String(r[3]),
          amt: Number(r[4]) || 0,
          desc: String(r[5]),
          type: String(r[6]),
          cat: String(r[7]),
          contract: String(r[8]),
          status: String(r[9]),
          flags: r[10] ? String(r[10]).split('; ') : [],
          doc: String(r[11]),
          src: String(r[12])
        };
      });
    }

    // 2. Đọc Contracts
    var cSheet = ss.getSheetByName('Contracts');
    if (cSheet && cSheet.getLastRow() > 1) {
      var cVals = cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 12).getValues();
      state.contracts = cVals.map(function(r) {
        return {
          id: String(r[0]),
          kind: String(r[1]),
          customer: String(r[2]),
          no: String(r[3]),
          tv: String(r[4]),
          signed: r[5] instanceof Date ? Utilities.formatDate(r[5], 'GMT+7', 'yyyy-MM-dd') : String(r[5]),
          fee: Number(r[6]) || 0,
          disc: Number(r[7]) || 0,
          discApproved: String(r[8]).toUpperCase() === 'TRUE',
          due: r[9] instanceof Date ? Utilities.formatDate(r[9], 'GMT+7', 'yyyy-MM-dd') : String(r[9]),
          terms: String(r[10]),
          note: String(r[11])
        };
      });
    }

    // 3. Đọc Gifts & Movements
    var gSheet = ss.getSheetByName('Gifts');
    if (gSheet && gSheet.getLastRow() > 1) {
      var gVals = gSheet.getRange(2, 1, gSheet.getLastRow() - 1, 4).getValues();
      state.gifts.items = gVals.map(function(r) {
        return { id: String(r[0]), name: String(r[1]), unit: String(r[2]), price: Number(r[3]) || 0 };
      });
    }

    var mvSheet = ss.getSheetByName('StockMovements');
    if (mvSheet && mvSheet.getLastRow() > 1) {
      var mvVals = mvSheet.getRange(2, 1, mvSheet.getLastRow() - 1, 9).getValues();
      state.gifts.mv = mvVals.map(function(r) {
        return {
          d: r[0] instanceof Date ? Utilities.formatDate(r[0], 'GMT+7', 'yyyy-MM-dd') : String(r[0]),
          item: String(r[1]),
          qty: Number(r[2]) || 0,
          kind: String(r[3]),
          who: String(r[4]),
          to: String(r[5]),
          note: String(r[6]),
          tx: String(r[7]),
          ex: String(r[8]).toUpperCase() === 'TRUE'
        };
      });
    }

    // 4. Đọc Staff
    var stSheet = ss.getSheetByName('Staff');
    if (stSheet && stSheet.getLastRow() > 1) {
      var stVals = stSheet.getRange(2, 1, stSheet.getLastRow() - 1, 12).getValues();
      state.staff = stVals.map(function(r) {
        return {
          id: String(r[0]),
          name: String(r[1]),
          role: String(r[2]),
          base: Number(r[3]) || 0,
          allow: { phone: Number(r[4]) || 0, fuel: Number(r[5]) || 0, meal: Number(r[6]) || 0, travel: Number(r[7]) || 0 },
          kpi: Number(r[8]) || 0,
          insSalary: Number(r[9]) || 0,
          deps: Number(r[10]) || 0,
          advance: Number(r[11]) || 0
        };
      });
    }

    // 5. Đọc Attendance
    var attSheet = ss.getSheetByName('Attendance');
    if (attSheet && attSheet.getLastRow() > 1) {
      var attVals = attSheet.getRange(2, 1, attSheet.getLastRow() - 1, 3).getValues();
      var attMap = {};
      attVals.forEach(function(r) {
        var staff = String(r[0]);
        var dIso = r[1] instanceof Date ? Utilities.formatDate(r[1], 'GMT+7', 'yyyy-MM-dd') : String(r[1]);
        var rawVal = r[2];
        var val = (rawVal === 'L' || rawVal === 'X') ? rawVal : Number(rawVal);
        if (!attMap[staff]) attMap[staff] = { days: {} };
        attMap[staff].days[dIso] = val;
      });
      state.att = attMap;
    }

    // 6. Đọc Budget
    var bSheet = ss.getSheetByName('Budget');
    if (bSheet && bSheet.getLastRow() > 1) {
      var bVals = bSheet.getRange(2, 1, bSheet.getLastRow() - 1, 3).getValues();
      var bMap = {};
      bVals.forEach(function(r) {
        var mon = String(r[0]);
        var cat = String(r[1]);
        var amt = Number(r[2]) || 0;
        if (!bMap[mon]) bMap[mon] = {};
        bMap[mon][cat] = amt;
      });
      state.budget = bMap;
    }

    // 7. Đọc Locks
    var lockSheet = ss.getSheetByName('Locks');
    if (lockSheet && lockSheet.getLastRow() > 1) {
      var lkVals = lockSheet.getRange(2, 1, lockSheet.getLastRow() - 1, 4).getValues();
      var lkMap = {};
      lkVals.forEach(function(r) {
        if (String(r[1]).toUpperCase() === 'TRUE') {
          lkMap[String(r[0])] = String(r[2]);
        }
      });
      state.locks = lkMap;
    }

    return state;
  } catch (err) {
    Logger.log('Lỗi đọc getInitialState: ' + err.toString());
    return INITIAL_DATA;
  }
}

/**
 * Thêm 1 giao dịch mới vào Sheet Transactions
 */
function apiAddTransaction(txJson) {
  var t = typeof txJson === 'string' ? JSON.parse(txJson) : txJson;
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Transactions') || setupSheet(ss, 'Transactions', []);
  
  var row = [
    t.id || '', t.date || '', t.acc || '', t.dir || '', t.amt || 0,
    t.desc || '', t.type || '', t.cat || '', t.contract || '',
    t.status || 'pending', (t.flags || []).join('; '), t.doc || '', t.src || ''
  ];
  sheet.appendRow(row);
  return { success: true };
}

/**
 * Cập nhật giao dịch
 */
function apiUpdateTransaction(id, updatesJson) {
  var updates = typeof updatesJson === 'string' ? JSON.parse(updatesJson) : updatesJson;
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  if (!sheet) return { success: false };

  var vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === String(id)) {
      var rIdx = i + 2;
      if (updates.status !== undefined) sheet.getRange(rIdx, 10).setValue(updates.status);
      if (updates.cat !== undefined) sheet.getRange(rIdx, 8).setValue(updates.cat);
      if (updates.contract !== undefined) sheet.getRange(rIdx, 9).setValue(updates.contract);
      if (updates.desc !== undefined) sheet.getRange(rIdx, 6).setValue(updates.desc);
      if (updates.note !== undefined) sheet.getRange(rIdx, 13).setValue(updates.note);
      break;
    }
  }
  return { success: true };
}

/**
 * Thêm hợp đồng
 */
function apiAddContract(cJson) {
  var c = typeof cJson === 'string' ? JSON.parse(cJson) : cJson;
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Contracts') || setupSheet(ss, 'Contracts', []);
  var row = [
    c.id || '', c.kind || '', c.customer || '', c.no || '', c.tv || '',
    c.signed || '', c.fee || 0, c.disc || 0, c.discApproved ? 'TRUE' : 'FALSE',
    c.due || '', c.terms || '', c.note || ''
  ];
  sheet.appendRow(row);
  return { success: true };
}

/**
 * Thêm phiếu xuất/nhập quà
 */
function apiAddGiftMovement(mvJson) {
  var m = typeof mvJson === 'string' ? JSON.parse(mvJson) : mvJson;
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('StockMovements') || setupSheet(ss, 'StockMovements', []);
  var row = [
    m.d || '', m.item || '', m.qty || 0, m.kind || '',
    m.who || '', m.to || '', m.note || '', m.tx || '', m.ex ? 'TRUE' : 'FALSE'
  ];
  sheet.appendRow(row);
  return { success: true };
}

/**
 * Lưu chấm công
 */
function apiSaveAttendance(staffName, dateIso, val) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Attendance') || setupSheet(ss, 'Attendance', ['Nhân viên', 'Ngày', 'Số công']);
  var lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    var vals = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < vals.length; i++) {
      var d = vals[i][1] instanceof Date ? Utilities.formatDate(vals[i][1], 'GMT+7', 'yyyy-MM-dd') : String(vals[i][1]);
      if (String(vals[i][0]) === String(staffName) && d === String(dateIso)) {
        if (val === '' || val === undefined) {
          sheet.deleteRow(i + 2);
        } else {
          sheet.getRange(i + 2, 3).setValue(val);
        }
        return { success: true };
      }
    }
  }

  if (val !== '' && val !== undefined) {
    sheet.appendRow([staffName, dateIso, val]);
  }
  return { success: true };
}

/**
 * Cập nhật ngân sách
 */
function apiUpdateBudget(month, category, amount) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Budget') || setupSheet(ss, 'Budget', ['Tháng', 'Danh mục', 'Số tiền dự toán']);
  var lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    var vals = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < vals.length; i++) {
      if (String(vals[i][0]) === String(month) && String(vals[i][1]) === String(category)) {
        if (amount > 0) {
          sheet.getRange(i + 2, 3).setValue(amount);
        } else {
          sheet.deleteRow(i + 2);
        }
        return { success: true };
      }
    }
  }

  if (amount > 0) {
    sheet.appendRow([month, category, amount]);
  }
  return { success: true };
}

/**
 * Khóa sổ tháng
 */
function apiSetMonthLock(month, locked, lockedBy) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Locks') || setupSheet(ss, 'Locks', ['Tháng', 'Đã khóa', 'Thời gian khóa', 'Người khóa']);
  var lastRow = sheet.getLastRow();
  var nowStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm');

  if (lastRow > 1) {
    var vals = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < vals.length; i++) {
      if (String(vals[i][0]) === String(month)) {
        sheet.getRange(i + 2, 2).setValue(locked ? 'TRUE' : 'FALSE');
        sheet.getRange(i + 2, 3).setValue(locked ? nowStr : '');
        sheet.getRange(i + 2, 4).setValue(locked ? lockedBy : '');
        return { success: true };
      }
    }
  }

  sheet.appendRow([month, locked ? 'TRUE' : 'FALSE', locked ? nowStr : '', locked ? lockedBy : '']);
  return { success: true };
}

/**
 * Đồng bộ toàn bộ state JSON (Backup khẩn cấp)
 */
function apiSyncFullState(stateJson) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('BackupState') || ss.insertSheet('BackupState');
  sheet.getRange('A1').setValue(stateJson);
  sheet.getRange('A2').setValue(new Date());
  return { success: true };
}
`;

  if (!fs.existsSync(gasDir)) {
    fs.mkdirSync(gasDir, { recursive: true });
  }

  const codeJsPath = path.resolve(gasDir, 'Code.js');
  fs.writeFileSync(codeJsPath, codeContent, 'utf8');
  console.log(`✅ Đã xuất bản mã nguồn Google Apps Script: ${codeJsPath}`);
}

generateGasBackend();
