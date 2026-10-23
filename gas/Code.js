/**
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
    .addItem('⚙️ Khởi tạo / Nạp lại 16 Tab Cơ sở dữ liệu', 'initDatabaseSheets')
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
var INITIAL_DATA = {
  "contracts": [
    {
      "id": "KH01",
      "kind": "KH",
      "customer": "Phạm Văn Phúc",
      "no": "8288152.0",
      "tv": "",
      "signed": "2026-04-24",
      "fee": 13500000,
      "disc": 0,
      "due": "2026-10-20",
      "terms": "Trả nhiều phần (Hàng tháng)",
      "note": "2 tháng 1 lần, (3tr)"
    },
    {
      "id": "KH02",
      "kind": "KH",
      "customer": "Nguyễn Thị Ngọc Yến",
      "no": "4201447.0",
      "tv": "",
      "signed": "2026-04-14",
      "fee": 8169000,
      "disc": 0,
      "due": "2026-09-15",
      "terms": "Trả nhiều phần (Hàng quý)",
      "note": "tháng 7, tháng 10"
    },
    {
      "id": "KH03",
      "kind": "KH",
      "customer": "Lưu Dương Thị Lệ Trân",
      "no": "4137212.0",
      "tv": "",
      "signed": "2025-03-21",
      "fee": 3550000,
      "disc": 0,
      "due": "2026-08-31",
      "terms": "Trả nhiều phần (Hàng tháng)",
      "note": "mỗi tháng 1 triệu"
    },
    {
      "id": "KH04",
      "kind": "KH",
      "customer": "Nguyễn Thị Ngọc Thanh",
      "no": "8291255.0",
      "tv": "",
      "signed": "2026-05-31",
      "fee": 16722000,
      "disc": 0,
      "due": "2026-08-31",
      "terms": "Trả nhiều phần (Hàng tháng)",
      "note": "mỗi tháng 1.5 triệu"
    },
    {
      "id": "KH05",
      "kind": "KH",
      "customer": "Nguyễn Thị Giỏi",
      "no": "8297896.0",
      "tv": "",
      "signed": "2026-07-31",
      "fee": 15030000,
      "disc": 3000000,
      "due": "2026-10-30",
      "terms": "Trả nhiều phần (Hàng quý)",
      "note": "tháng 10, tháng 1, tháng 4"
    },
    {
      "id": "KH06",
      "kind": "KH",
      "customer": "Tràn Thị Mai Anh",
      "no": "8300856, 8300875, 8301099",
      "tv": "",
      "signed": "2026-08-28",
      "fee": 64727750,
      "disc": 33077040,
      "due": "2026-09-10",
      "terms": "Trả trong tháng",
      "note": ""
    },
    {
      "id": "KH07",
      "kind": "KH",
      "customer": "Nguyễn Lê Thảo",
      "no": "",
      "tv": "",
      "signed": "2026-08-29",
      "fee": 24345000,
      "disc": 7303500,
      "due": "2026-09-10",
      "terms": "Trả trong tháng",
      "note": ""
    },
    {
      "id": "KH08",
      "kind": "KH",
      "customer": "Ngô Hoàng Giang",
      "no": "",
      "tv": "",
      "signed": "2026-08-30",
      "fee": 18730000,
      "disc": 7490000,
      "due": "2026-09-10",
      "terms": "Trả trong tháng",
      "note": ""
    },
    {
      "id": "KH09",
      "kind": "KH",
      "customer": "Tất Thuỳ Trang",
      "no": "",
      "tv": "",
      "signed": "2026-09-30",
      "fee": 25772000,
      "disc": 11000000,
      "due": "2026-10-15",
      "terms": "Trả nhiều phần (Hàng quý)",
      "note": ""
    },
    {
      "id": "KH10",
      "kind": "KH",
      "customer": "Huỳnh Thị Anh Thư",
      "no": "",
      "tv": "",
      "signed": "2026-09-30",
      "fee": 22736000,
      "disc": 2500000,
      "due": "2026-10-15",
      "terms": "Trả nhiều phần (Hàng quý)",
      "note": ""
    },
    {
      "id": "KH11",
      "kind": "KH",
      "customer": "Thái Quốc Anh",
      "no": "",
      "tv": "",
      "signed": "2026-09-30",
      "fee": 27630000,
      "disc": 8205000,
      "due": "2026-10-15",
      "terms": "Trả nhiều phần (Hàng quý)",
      "note": ""
    },
    {
      "id": "TV01",
      "kind": "TV",
      "customer": "Lê Thành Công",
      "no": "",
      "tv": "Nguyễn Hữu Thạch",
      "signed": "2026-04-01",
      "fee": 4300000,
      "disc": 0,
      "due": "2026-09-09",
      "terms": "Trả trong tháng",
      "note": ""
    },
    {
      "id": "TV02",
      "kind": "TV",
      "customer": "Nguyễn Thị Thuý Kiều",
      "no": "",
      "tv": "Đặng Thị Huyền Trân",
      "signed": "2026-05-01",
      "fee": 8700000,
      "disc": 0,
      "due": "2026-09-15",
      "terms": "Trả nhiều phần (Hàng tháng)",
      "note": ""
    },
    {
      "id": "TV03",
      "kind": "TV",
      "customer": "Đoàn Dương Hoàng Phúc",
      "no": "",
      "tv": "Thái Thị Thanh Thảo",
      "signed": "2026-07-31",
      "fee": 13550000,
      "disc": 0,
      "due": "2026-09-09",
      "terms": "Trả nhiều phần (Hàng tháng)",
      "note": ""
    },
    {
      "id": "TV04",
      "kind": "TV",
      "customer": "Vũ Ngọc Chiến",
      "no": "",
      "tv": "",
      "signed": "2026-05-01",
      "fee": 23534000,
      "disc": 0,
      "due": "2026-08-21",
      "terms": "Trả nhiều phần (Hàng tháng)",
      "note": ""
    },
    {
      "id": "TV05",
      "kind": "TV",
      "customer": "Dương Quân, Lê Gia Lệ",
      "no": "",
      "tv": "Nguyễn Hữu Thạch",
      "signed": "2026-08-25",
      "fee": 50000000,
      "disc": 0,
      "due": "2026-09-09",
      "terms": "Trả trong tháng",
      "note": ""
    },
    {
      "id": "TV06",
      "kind": "TV",
      "customer": "Huỳnh Ngọc Thanh",
      "no": "",
      "tv": "Nguyễn Hữu Thạch",
      "signed": "2026-09-28",
      "fee": 15000000,
      "disc": 0,
      "due": "2026-10-07",
      "terms": "Trả trong tháng",
      "note": ""
    },
    {
      "id": "TV07",
      "kind": "TV",
      "customer": "Trịnh Khánh Nhã",
      "no": "",
      "tv": "Thái Thị Thanh Thảo",
      "signed": "2026-09-29",
      "fee": 13535000,
      "disc": 0,
      "due": "2026-10-07",
      "terms": "Trả trong tháng",
      "note": ""
    }
  ],
  "tx": [
    {
      "id": "G0001",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 8",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 70000,
      "desc": "nước chụp ảnh",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0002",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 9",
      "date": "2026-08-01",
      "dir": "in",
      "amt": 2000000,
      "desc": "DFAM ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0003",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 10",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 1820000,
      "desc": "đi ăn đội ngũ",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0004",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 11",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 400000,
      "desc": "sinh nhật khách yến",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0005",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 12",
      "date": "2026-08-01",
      "dir": "in",
      "amt": 5000000,
      "desc": "DFAM ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0006",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 13",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 700000,
      "desc": "quà khách trang vĩnh long",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0007",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 14",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 500000,
      "desc": "khách minh vương",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0008",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 15",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 450000,
      "desc": "quà cháu khách chăm",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0009",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 16",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 215000,
      "desc": "trái cây họp",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0010",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 17",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 720000,
      "desc": "sn con khách lực",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0011",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 18",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 308000,
      "desc": "kệ điện thoại DFAM mua +ship",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0012",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 19",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 173000,
      "desc": "bảng đọc mc ht vip t7",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0013",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 20",
      "date": "2026-08-01",
      "dir": "in",
      "amt": 60000000,
      "desc": "Dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0014",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 21",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 26920000,
      "desc": "Lương staff",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0015",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "File cũ tính vào chi phí khác"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 22",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 33550000,
      "desc": "Khoản ứng tháng 7",
      "type": "HOAN_UNG",
      "cat": ""
    },
    {
      "id": "G0016",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 23",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 303000,
      "desc": "HT 9/08 HO",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0017",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch",
        "Thu và chi cùng dòng – kiểm tra bản chất"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 24",
      "date": "2026-08-01",
      "dir": "in",
      "amt": 3000000,
      "desc": "quảng cáo BHCG",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0018",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 24",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 3243000,
      "desc": "quảng cáo BHCG",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0019",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 25",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 700000,
      "desc": "Ăn Trưa WS",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0020",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 26",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 400000,
      "desc": "Hotline",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0021",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 27",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 425000,
      "desc": "Check vssid kh Mai anh,kh Ngọc",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0022",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 28",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 78000,
      "desc": "túi giấy",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0023",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 29",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 127000,
      "desc": "Ship hđ khách Giỏi, đầy",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0024",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 30",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 210000,
      "desc": "thuôc DFAM",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0025",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 31",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 190000,
      "desc": "WS 16/08, gói quà. bút",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0026",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 32",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 23000,
      "desc": "ship hđ anh Tươi",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0027",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 33",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 450000,
      "desc": "thay khay mực in",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0028",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 34",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 145000,
      "desc": "giấy a4",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0056",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thu và chi cùng dòng – kiểm tra bản chất"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 61",
      "date": "2026-08-01",
      "dir": "in",
      "amt": 4000000,
      "desc": "CHỤP ẢNH TEAM",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0057",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 61",
      "date": "2026-08-01",
      "dir": "out",
      "amt": 4000000,
      "desc": "CHỤP ẢNH TEAM",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0029",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 35",
      "date": "2026-08-19",
      "dir": "out",
      "amt": 15000,
      "desc": "nước cho khách mai anh",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0030",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 36",
      "date": "2026-08-19",
      "dir": "out",
      "amt": 100000,
      "desc": "ship quà từ hải an về",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0032",
      "acc": "QUY",
      "contract": "TV02",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 38",
      "date": "2026-08-20",
      "dir": "in",
      "amt": 2000000,
      "desc": "Trân ck",
      "type": "THU_TV",
      "cat": ""
    },
    {
      "id": "G0031",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 37",
      "date": "2026-08-21",
      "dir": "out",
      "amt": 152000,
      "desc": "Nhung, Trân, DFAM họp",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0211",
      "acc": "ACB",
      "contract": "TV04",
      "flags": [
        "Có trong sổ công nợ, không có trong sổ quỹ"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Công nợ đội ngũ (mới) · cột T08/2026",
      "date": "2026-08-21",
      "dir": "in",
      "amt": 23534000,
      "desc": "KH Vũ Ngọc Chiến trả",
      "type": "THU_TV",
      "cat": ""
    },
    {
      "id": "G0212",
      "acc": "BT",
      "contract": "TV01",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Công nợ đội ngũ (mới) · ghi chú dòng 6",
      "date": "2026-08-21",
      "dir": "in",
      "amt": 1000000,
      "desc": "Trừ tiền hoa của anh Thạch – bù trừ, không có tiền về",
      "type": "THU_TV",
      "cat": ""
    },
    {
      "id": "G0033",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 39",
      "date": "2026-08-24",
      "dir": "out",
      "amt": 55000,
      "desc": "Nước DFAM gặp khách Mai Anh",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0034",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 40",
      "date": "2026-08-24",
      "dir": "out",
      "amt": 15000,
      "desc": "BMH gặp kh Giang",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0035",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 41",
      "date": "2026-08-24",
      "dir": "out",
      "amt": 100000,
      "desc": "Check vssid con kh mai anh",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0036",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 42",
      "date": "2026-08-25",
      "dir": "in",
      "amt": 10000000,
      "desc": "DFAM ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0037",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 43",
      "date": "2026-08-25",
      "dir": "out",
      "amt": 1500000,
      "desc": "tri ân kh Nhung",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0038",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 44",
      "date": "2026-08-25",
      "dir": "out",
      "amt": 3220000,
      "desc": "Ws 16/8 hải an",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0039",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 45",
      "date": "2026-08-25",
      "dir": "out",
      "amt": 65000,
      "desc": "higland DFAM",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0040",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 46",
      "date": "2026-08-25",
      "dir": "out",
      "amt": 209000,
      "desc": "quà con khách giang",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0041",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 47",
      "date": "2026-08-25",
      "dir": "out",
      "amt": 75000,
      "desc": "nước suối",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0042",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 48",
      "date": "2026-08-25",
      "dir": "out",
      "amt": 220000,
      "desc": "in poster thời gian chờ",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0043",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 49",
      "date": "2026-08-25",
      "dir": "out",
      "amt": 475000,
      "desc": "quà khách bảo vương",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0044",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thu và chi cùng dòng – kiểm tra bản chất"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 50",
      "date": "2026-08-25",
      "dir": "in",
      "amt": 50000000,
      "desc": "phí năm kh Anh Thạch",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0045",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 50",
      "date": "2026-08-25",
      "dir": "out",
      "amt": 50000000,
      "desc": "phí năm kh Anh Thạch",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0046",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 51",
      "date": "2026-08-26",
      "dir": "out",
      "amt": 407000,
      "desc": "mời nước vp",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0047",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 52",
      "date": "2026-08-27",
      "dir": "in",
      "amt": 50000000,
      "desc": "DFAM ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0048",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 53",
      "date": "2026-08-27",
      "dir": "out",
      "amt": 18730000,
      "desc": "phí năm kh Giang",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0049",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 54",
      "date": "2026-08-27",
      "dir": "out",
      "amt": 47861000,
      "desc": "kh mai anh",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0050",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 55",
      "date": "2026-08-27",
      "dir": "in",
      "amt": 30000000,
      "desc": "dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0051",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 56",
      "date": "2026-08-27",
      "dir": "in",
      "amt": 20000000,
      "desc": "dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0052",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 57",
      "date": "2026-08-28",
      "dir": "out",
      "amt": 5445000,
      "desc": "Xuân Châu",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0053",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 58",
      "date": "2026-08-28",
      "dir": "out",
      "amt": 3000000,
      "desc": "Nguyễn Hữu Thạch memo",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0054",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 59",
      "date": "2026-08-28",
      "dir": "out",
      "amt": 110000,
      "desc": "mời nước BV",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0055",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 60",
      "date": "2026-08-28",
      "dir": "out",
      "amt": 6085000,
      "desc": "khách Lê Thảo",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0058",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 62",
      "date": "2026-08-28",
      "dir": "out",
      "amt": 6308000,
      "desc": "thu nhập chị Vân",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0061",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 64",
      "date": "2026-08-28",
      "dir": "out",
      "amt": 800000,
      "desc": "Quảng cáo",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0063",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "File cũ tính vào chi phí khác"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 66",
      "date": "2026-08-28",
      "dir": "out",
      "amt": 311000,
      "desc": "Tăng phí khách trứ",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0059",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thu và chi cùng dòng – kiểm tra bản chất"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 63",
      "date": "2026-08-29",
      "dir": "in",
      "amt": 20000000,
      "desc": "KH THẢO NĂM",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0060",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 63",
      "date": "2026-08-29",
      "dir": "out",
      "amt": 18260000,
      "desc": "KH THẢO NĂM",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0062",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "File cũ tính vào chi phí khác"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 65",
      "date": "2026-08-29",
      "dir": "out",
      "amt": 3792000,
      "desc": "hđ khách Khoa phí quý",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0064",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 67",
      "date": "2026-08-30",
      "dir": "in",
      "amt": 20000000,
      "desc": "Dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0065",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 68",
      "date": "2026-08-30",
      "dir": "out",
      "amt": 17700000,
      "desc": "Khách mai anh phí năm",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0066",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 69",
      "date": "2026-08-30",
      "dir": "out",
      "amt": 5040000,
      "desc": "Kh cường",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0067",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "File cũ tính vào chi phí khác"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 70",
      "date": "2026-08-31",
      "dir": "out",
      "amt": 1722000,
      "desc": "active chấn cường",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0068",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "File cũ tính vào chi phí khác"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 71",
      "date": "2026-08-31",
      "dir": "out",
      "amt": 1219000,
      "desc": "active quốc thái",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0069",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thu và chi cùng dòng – kiểm tra bản chất"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 72",
      "date": "2026-08-31",
      "dir": "in",
      "amt": 10000000,
      "desc": "Kh cường phí năm",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0070",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 72",
      "date": "2026-08-31",
      "dir": "out",
      "amt": 15200000,
      "desc": "Kh cường phí năm",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0071",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 73",
      "date": "2026-08-31",
      "dir": "in",
      "amt": 14880000,
      "desc": "Dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0072",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 8 · dòng 74",
      "date": "2026-08-31",
      "dir": "out",
      "amt": 254000,
      "desc": "mời nc cs",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0209",
      "acc": "ACB",
      "contract": "KH04",
      "flags": [
        "Có trong sổ công nợ, không có trong sổ quỹ"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Công nợ KH (mới) · cột T08/2026",
      "date": "2026-08-31",
      "dir": "in",
      "amt": 1500000,
      "desc": "KH Ngọc Thanh trả kỳ T8",
      "type": "THU_KH",
      "cat": ""
    },
    {
      "id": "G0073",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 8",
      "date": "2026-09-02",
      "dir": "out",
      "amt": 10867000,
      "desc": "bánh trung thu",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0074",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 9",
      "date": "2026-09-02",
      "dir": "out",
      "amt": 6871000,
      "desc": "đi ăn team 4/9",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0075",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thu và chi cùng dòng – kiểm tra bản chất"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 10",
      "date": "2026-09-04",
      "dir": "in",
      "amt": 5000000,
      "desc": "Quà sn kh an",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0076",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 10",
      "date": "2026-09-04",
      "dir": "out",
      "amt": 800000,
      "desc": "Quà sn kh an",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0077",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 11",
      "date": "2026-09-04",
      "dir": "out",
      "amt": 515000,
      "desc": "Sân pick",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0078",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 12",
      "date": "2026-09-04",
      "dir": "out",
      "amt": 300000,
      "desc": "Khung bằng khen",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0079",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 13",
      "date": "2026-09-05",
      "dir": "in",
      "amt": 11000000,
      "desc": "dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0080",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 14",
      "date": "2026-09-07",
      "dir": "out",
      "amt": 283000,
      "desc": "trái cây họp BKD",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0081",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 15",
      "date": "2026-09-07",
      "dir": "out",
      "amt": 3000000,
      "desc": "ck DFAM",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0082",
      "acc": "QUY",
      "contract": "TV01",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 16",
      "date": "2026-09-09",
      "dir": "in",
      "amt": 3300000,
      "desc": "Anh Thạch CK – KH Lê Thành Công",
      "type": "THU_TV",
      "cat": ""
    },
    {
      "id": "G0083",
      "acc": "QUY",
      "contract": "TV05",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 16",
      "date": "2026-09-09",
      "dir": "in",
      "amt": 50000000,
      "desc": "Anh Thạch CK – KH Dương Quân, Lê Gia Lệ",
      "type": "THU_TV",
      "cat": ""
    },
    {
      "id": "G0084",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 16",
      "date": "2026-09-09",
      "dir": "out",
      "amt": 53300000,
      "desc": "ANH THẠCH CK",
      "type": "CHUYEN_DFAM",
      "cat": ""
    },
    {
      "id": "G0085",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Chưa rõ khoản thu của ai, cho hợp đồng nào"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 17",
      "date": "2026-09-09",
      "dir": "in",
      "amt": 12000000,
      "desc": "NHUNG CK",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0086",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 18",
      "date": "2026-09-09",
      "dir": "in",
      "amt": 30000000,
      "desc": "dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0087",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 19",
      "date": "2026-09-09",
      "dir": "out",
      "amt": 25838518,
      "desc": "tri ân hải an",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0088",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 20",
      "date": "2026-09-09",
      "dir": "out",
      "amt": 64000,
      "desc": "grap cùng DFAM qua quán ăn",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0089",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 21",
      "date": "2026-09-09",
      "dir": "out",
      "amt": 450000,
      "desc": "quà sn con kh Hoàng",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0090",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 22",
      "date": "2026-09-09",
      "dir": "out",
      "amt": 26937000,
      "desc": "Thu nhập staff",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0091",
      "acc": "QUY",
      "contract": "TV03",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 23",
      "date": "2026-09-09",
      "dir": "in",
      "amt": 13550000,
      "desc": "Thảo ck",
      "type": "THU_TV",
      "cat": ""
    },
    {
      "id": "G0092",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 24",
      "date": "2026-09-09",
      "dir": "out",
      "amt": 1000000,
      "desc": "Ck Thảo tuyển t7",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0093",
      "acc": "QUY",
      "contract": "KH08",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 25",
      "date": "2026-09-10",
      "dir": "in",
      "amt": 11240000,
      "desc": "kh Giang ck",
      "type": "THU_KH",
      "cat": ""
    },
    {
      "id": "G0094",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 26",
      "date": "2026-09-10",
      "dir": "out",
      "amt": 11240000,
      "desc": "ck DFAM",
      "type": "CHUYEN_DFAM",
      "cat": ""
    },
    {
      "id": "G0095",
      "acc": "QUY",
      "contract": "TV02",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 27",
      "date": "2026-09-10",
      "dir": "in",
      "amt": 2000000,
      "desc": "Trân ck",
      "type": "THU_TV",
      "cat": ""
    },
    {
      "id": "G0096",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 28",
      "date": "2026-09-10",
      "dir": "out",
      "amt": 4000000,
      "desc": "Chụp ảnh team",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0097",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 29",
      "date": "2026-09-10",
      "dir": "in",
      "amt": 15000000,
      "desc": "Dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0098",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 30",
      "date": "2026-09-10",
      "dir": "out",
      "amt": 21000000,
      "desc": "Tri ân khách Kiều,Dũng",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0099",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 31",
      "date": "2026-09-10",
      "dir": "out",
      "amt": 300000,
      "desc": "hoa tặng Mỹ Danh",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0100",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 32",
      "date": "2026-09-10",
      "dir": "out",
      "amt": 1200000,
      "desc": "tham dự sự kiện Hội Doanh Nghiệp",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0101",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 33",
      "date": "2026-09-10",
      "dir": "out",
      "amt": 291000,
      "desc": "Ăn trưa SDFA",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0102",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 34",
      "date": "2026-09-10",
      "dir": "out",
      "amt": 150000,
      "desc": "Ship bánh trung thu",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0103",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 35",
      "date": "2026-09-11",
      "dir": "in",
      "amt": 5000000,
      "desc": "Dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0104",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 36",
      "date": "2026-09-11",
      "dir": "out",
      "amt": 4455000,
      "desc": "ấn phẩm",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0105",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 37",
      "date": "2026-09-11",
      "dir": "out",
      "amt": 185000,
      "desc": "Phụ kiện gói quà",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0109",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 41",
      "date": "2026-09-12",
      "dir": "out",
      "amt": 75000,
      "desc": "Nước suối WS12/9",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0110",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 42",
      "date": "2026-09-12",
      "dir": "out",
      "amt": 54000,
      "desc": "Ship quà hải an",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0106",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 38",
      "date": "2026-09-15",
      "dir": "out",
      "amt": 140000,
      "desc": "mực in",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0107",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 39",
      "date": "2026-09-15",
      "dir": "out",
      "amt": 30000,
      "desc": "ship hs khách trứ",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0108",
      "acc": "QUY",
      "contract": "KH02",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 40",
      "date": "2026-09-15",
      "dir": "in",
      "amt": 4000000,
      "desc": "kh yến chuyển",
      "type": "THU_KH",
      "cat": ""
    },
    {
      "id": "G0111",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 43",
      "date": "2026-09-15",
      "dir": "out",
      "amt": 192000,
      "desc": "Bút trình chiếu",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0112",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 44",
      "date": "2026-09-16",
      "dir": "out",
      "amt": 385000,
      "desc": "In 120 tờ rơi thẻ",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0113",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 45",
      "date": "2026-09-16",
      "dir": "out",
      "amt": 167000,
      "desc": "bìa lá, giấy, văn phòng phẩm",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0114",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 46",
      "date": "2026-09-16",
      "dir": "out",
      "amt": 410000,
      "desc": "hotline",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0115",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 47",
      "date": "2026-09-17",
      "dir": "out",
      "amt": 814000,
      "desc": "Sữa nc suối HT19/9,teabreak",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0116",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 48",
      "date": "2026-09-18",
      "dir": "out",
      "amt": 230000,
      "desc": "Hastag",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0117",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 49",
      "date": "2026-09-18",
      "dir": "out",
      "amt": 107000,
      "desc": "túi đựng quà",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0118",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 50",
      "date": "2026-09-18",
      "dir": "out",
      "amt": 200000,
      "desc": "Grap chuyển thiết bị HT 19/9",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0119",
      "acc": "QUY",
      "contract": "KH06",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 51",
      "date": "2026-09-18",
      "dir": "in",
      "amt": 16000000,
      "desc": "Kh Mai Anh Ck",
      "type": "THU_KH",
      "cat": ""
    },
    {
      "id": "G0120",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 52",
      "date": "2026-09-19",
      "dir": "out",
      "amt": 214000,
      "desc": "Giấy A4",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0121",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 53",
      "date": "2026-09-19",
      "dir": "out",
      "amt": 135000,
      "desc": "Ship đồ HT 19/9 ve",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0122",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 54",
      "date": "2026-09-19",
      "dir": "out",
      "amt": 429000,
      "desc": "Ăn trưa HT 19/9",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0123",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 55",
      "date": "2026-09-19",
      "dir": "out",
      "amt": 15000000,
      "desc": "ck DFAM",
      "type": "CHUYEN_DFAM",
      "cat": ""
    },
    {
      "id": "G0124",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 56",
      "date": "2026-09-22",
      "dir": "out",
      "amt": 100000,
      "desc": "nuoc suối",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0125",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 57",
      "date": "2026-09-22",
      "dir": "out",
      "amt": 200000,
      "desc": "quà tặng uv Mỹ Anh",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0126",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 58",
      "date": "2026-09-22",
      "dir": "out",
      "amt": 100000,
      "desc": "check vssid con khách trang",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0127",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 59",
      "date": "2026-09-23",
      "dir": "in",
      "amt": 5000000,
      "desc": "DFAm ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0128",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 60",
      "date": "2026-09-23",
      "dir": "out",
      "amt": 4405000,
      "desc": "thu nhâoh DFA Vân",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0129",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 61",
      "date": "2026-09-23",
      "dir": "out",
      "amt": 1000000,
      "desc": "rút tiền mặt",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0165",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thu và chi cùng dòng – kiểm tra bản chất"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 96",
      "date": "2026-09-23",
      "dir": "in",
      "amt": 15600000,
      "desc": "CRM",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0166",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 96",
      "date": "2026-09-23",
      "dir": "out",
      "amt": 15600000,
      "desc": "CRM",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0130",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 62",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 500000,
      "desc": "Bác sĩ chia sẻ",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0131",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 63",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 700000,
      "desc": "Vận chuyển 20 thùng quà",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0132",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 64",
      "date": "2026-09-24",
      "dir": "in",
      "amt": 5000000,
      "desc": "Dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0133",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 65",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 1050000,
      "desc": "Thu nhập cường",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0134",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 66",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 2199000,
      "desc": "Quà HT 19/9",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0135",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 67",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 200000,
      "desc": "Thưởng nhung",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0136",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 68",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 100000,
      "desc": "Ck kh thư",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0137",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 69",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 108000,
      "desc": "Mời nc kh Thuỳ Trang",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0138",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 70",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 125000,
      "desc": "Mờ nc cs bình dương",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0139",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 71",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 42000,
      "desc": "Ship quà khách Giỏi",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0140",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 72",
      "date": "2026-09-24",
      "dir": "out",
      "amt": 40000,
      "desc": "Ship huỷ thẻ kh trứ,quốc anh",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0141",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 73",
      "date": "2026-09-25",
      "dir": "out",
      "amt": 325000,
      "desc": "quà tặng khách cường",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0142",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 74",
      "date": "2026-09-25",
      "dir": "out",
      "amt": 1270000,
      "desc": "áo mưa WS tuyển dụng,stande",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0143",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 75",
      "date": "2026-09-25",
      "dir": "out",
      "amt": 400000,
      "desc": "Check vssid 3 con kh thư",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0144",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 76",
      "date": "2026-09-29",
      "dir": "in",
      "amt": 50000000,
      "desc": "DFAM CK",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0145",
      "acc": "QUY",
      "contract": "KH06",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 77",
      "date": "2026-09-29",
      "dir": "in",
      "amt": 16000000,
      "desc": "KH MAI ANH CK",
      "type": "THU_KH",
      "cat": ""
    },
    {
      "id": "G0146",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 77",
      "date": "2026-09-29",
      "dir": "out",
      "amt": 16000000,
      "desc": "KH MAI ANH CK",
      "type": "CHUYEN_DFAM",
      "cat": ""
    },
    {
      "id": "G0147",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 78",
      "date": "2026-09-29",
      "dir": "out",
      "amt": 15000000,
      "desc": "KH ANH THẠCH",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0148",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 79",
      "date": "2026-09-29",
      "dir": "out",
      "amt": 6384000,
      "desc": "HĐ KOL THANH",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0149",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 80",
      "date": "2026-09-29",
      "dir": "out",
      "amt": 6377000,
      "desc": "HĐ KOL NHƯ",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0150",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 81",
      "date": "2026-09-29",
      "dir": "out",
      "amt": 7541000,
      "desc": "HĐ KOL GIAO HUYỀN",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0151",
      "acc": "QUY",
      "contract": "KH04",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 82",
      "date": "2026-09-30",
      "dir": "in",
      "amt": 1500000,
      "desc": "kh Thanh chuyển",
      "type": "THU_KH",
      "cat": ""
    },
    {
      "id": "G0152",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 83",
      "date": "2026-09-30",
      "dir": "in",
      "amt": 80000000,
      "desc": "DFAM CK",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0153",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 84",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 18850000,
      "desc": "HĐ KOL THANH PHÍ NĂM",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0154",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 85",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 4683500,
      "desc": "HT 19/09",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0155",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 86",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 400000,
      "desc": "ăn tăng ca",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0156",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 87",
      "date": "2026-09-30",
      "dir": "in",
      "amt": 50000000,
      "desc": "DFAM CK",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0157",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 88",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 25772000,
      "desc": "HĐ KHÁCH THUỲ TRANG",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0158",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 89",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 22736000,
      "desc": "HĐ KHÁCH THƯ",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0159",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 90",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 13535000,
      "desc": "HĐ KHÁCH TV THẢO",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0160",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 91",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 22624000,
      "desc": "HĐ QUỲNH NHƯ",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0161",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 92",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 27630000,
      "desc": "KH QUỐC ANH",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0162",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 93",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 22624000,
      "desc": "KH HUYỀN",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0163",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 94",
      "date": "2026-09-30",
      "dir": "out",
      "amt": 25516000,
      "desc": "HĐ UYÊN",
      "type": "UNG_PHI",
      "cat": ""
    },
    {
      "id": "G0164",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 9 · dòng 95",
      "date": "2026-09-30",
      "dir": "in",
      "amt": 40000000,
      "desc": "DFAM CK",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0210",
      "acc": "ACB",
      "contract": "KH03",
      "flags": [
        "Có trong sổ công nợ, không có trong sổ quỹ"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Công nợ KH (mới) · cột T09/2026",
      "date": "2026-09-30",
      "dir": "in",
      "amt": 1000000,
      "desc": "KH Lệ Trân trả kỳ T9",
      "type": "THU_KH",
      "cat": ""
    },
    {
      "id": "G0167",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch",
        "Thu và chi cùng dòng – kiểm tra bản chất"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 7",
      "date": "2026-10-01",
      "dir": "in",
      "amt": 6500000,
      "desc": "Đi ăn team BHCG",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0168",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "Thiếu ngày giao dịch"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 7",
      "date": "2026-10-01",
      "dir": "out",
      "amt": 6237000,
      "desc": "Đi ăn team BHCG",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0169",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 8",
      "date": "2026-10-01",
      "dir": "out",
      "amt": 60000,
      "desc": "In giấy khen",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0170",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 9",
      "date": "2026-10-02",
      "dir": "out",
      "amt": 760000,
      "desc": "Sân pick+giải",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0171",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 10",
      "date": "2026-10-02",
      "dir": "out",
      "amt": 470000,
      "desc": "Họp đầu tháng",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0172",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 11",
      "date": "2026-10-05",
      "dir": "out",
      "amt": 150000,
      "desc": "Trái cây kick off",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0173",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 12",
      "date": "2026-10-05",
      "dir": "out",
      "amt": 315000,
      "desc": "bánh kem a Vinh",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0174",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 13",
      "date": "2026-10-05",
      "dir": "out",
      "amt": 300000,
      "desc": "Hoa tặng Tiên",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0175",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 14",
      "date": "2026-10-06",
      "dir": "out",
      "amt": 200000,
      "desc": "ck DFAM",
      "type": "OPEX",
      "cat": "KHAC"
    },
    {
      "id": "G0176",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 15",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 307000,
      "desc": "cước bán hàng",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0177",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 16",
      "date": "2026-10-07",
      "dir": "in",
      "amt": 10000000,
      "desc": "DFAM Ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0178",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 17",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 5683000,
      "desc": "tri ân kh trứ",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0179",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 18",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 42000,
      "desc": "ship quà tặng khách sáng",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0180",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 19",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 58000,
      "desc": "ship quà khách thương",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0181",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 20",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 85000,
      "desc": "ship thư tt khách quốc anh",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0182",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 21",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 49000,
      "desc": "thư thoả thuận khách thư",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0183",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 22",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 23000,
      "desc": "quà sn con kh liên",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0184",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 23",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 109000,
      "desc": "ship quà kh đầy",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0185",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 24",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 34000,
      "desc": "ship quà sn khách phương thanh",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0186",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 25",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 82000,
      "desc": "Cf gặp kh Huê",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0187",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 26",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 36000,
      "desc": "Ship quà hc khach Ngọc",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0188",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 27",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 34000,
      "desc": "Ship quà kh Huê",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0189",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 28",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 35000,
      "desc": "Ship quà hc+kqua ktyt khách hà",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0190",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 29",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 51000,
      "desc": "Ship hđ kh chi",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0191",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 30",
      "date": "2026-10-07",
      "dir": "out",
      "amt": 660000,
      "desc": "Tea break 10/10",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0213",
      "acc": "ACB",
      "contract": "TV06",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "File BKD · Khoản thu T10",
      "date": "2026-10-07",
      "dir": "in",
      "amt": 15000000,
      "desc": "Anh Thạch CK – KH Huỳnh Ngọc Thanh",
      "type": "THU_TV",
      "cat": ""
    },
    {
      "id": "G0214",
      "acc": "ACB",
      "contract": "TV07",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "File BKD · Khoản thu T10",
      "date": "2026-10-07",
      "dir": "in",
      "amt": 13535000,
      "desc": "Chị Thảo CK – KH Trịnh Khánh Nhã",
      "type": "THU_TV",
      "cat": ""
    },
    {
      "id": "G0215",
      "acc": "ACB",
      "contract": "",
      "flags": [
        "Chưa rõ khoản thu cho hợp đồng nào"
      ],
      "status": "migrated",
      "doc": "",
      "src": "File BKD · Khoản thu T10",
      "date": "2026-10-07",
      "dir": "in",
      "amt": 66082000,
      "desc": "Lương Ngọc Nhung chuyển (phân loại: đội ngũ)",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0216",
      "acc": "ACB",
      "contract": "",
      "flags": [
        "Cần thu 15.750.000, nhận 15.735.000 – lệch 15.000"
      ],
      "status": "migrated",
      "doc": "",
      "src": "File BKD · Khoản thu T10",
      "date": "2026-10-07",
      "dir": "in",
      "amt": 15735000,
      "desc": "Trần Thị Giao Uyên chuyển (phân loại: đội ngũ)",
      "type": "THU_KHAC",
      "cat": ""
    },
    {
      "id": "G0192",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 31",
      "date": "2026-10-09",
      "dir": "out",
      "amt": 155000,
      "desc": "Bìa lá",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0193",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 32",
      "date": "2026-10-09",
      "dir": "out",
      "amt": 230000,
      "desc": "Chuyển đồ HT",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0194",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 33",
      "date": "2026-10-10",
      "dir": "in",
      "amt": 5000000,
      "desc": "Dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0195",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 34",
      "date": "2026-10-10",
      "dir": "out",
      "amt": 3714500,
      "desc": "Phí xét nghiệm 10/10",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0196",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 35",
      "date": "2026-10-10",
      "dir": "out",
      "amt": 307000,
      "desc": "Hotline bán hàng",
      "type": "OPEX",
      "cat": "VP"
    },
    {
      "id": "G0197",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 36",
      "date": "2026-10-10",
      "dir": "out",
      "amt": 500000,
      "desc": "Bs chia sẻ",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0198",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 37",
      "date": "2026-10-10",
      "dir": "out",
      "amt": 5131000,
      "desc": "Quà HT thang 9",
      "type": "OPEX",
      "cat": "SUKIEN"
    },
    {
      "id": "G0199",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 38",
      "date": "2026-10-14",
      "dir": "out",
      "amt": 488000,
      "desc": "ăn trưa đội ngũ",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0200",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 39",
      "date": "2026-10-14",
      "dir": "out",
      "amt": 78000,
      "desc": "định hướng Daiichirise",
      "type": "OPEX",
      "cat": "NOIBO"
    },
    {
      "id": "G0201",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 40",
      "date": "2026-10-15",
      "dir": "out",
      "amt": 450000,
      "desc": "grap trao hđ khách quốc Anh",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0202",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 41",
      "date": "2026-10-15",
      "dir": "in",
      "amt": 6000000,
      "desc": "Dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0203",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 42",
      "date": "2026-10-15",
      "dir": "out",
      "amt": 6000000,
      "desc": "thu nhập Nhung",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0204",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 43",
      "date": "2026-10-15",
      "dir": "out",
      "amt": 126000,
      "desc": "ship quà khách Quang",
      "type": "OPEX",
      "cat": "CSKH"
    },
    {
      "id": "G0205",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 44",
      "date": "2026-10-15",
      "dir": "in",
      "amt": 30000000,
      "desc": "Dfam ck",
      "type": "DFAM_CAP",
      "cat": ""
    },
    {
      "id": "G0206",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 45",
      "date": "2026-10-15",
      "dir": "out",
      "amt": 23749000,
      "desc": "Thu nhập BHCG",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0207",
      "acc": "QUY",
      "contract": "",
      "flags": [],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 46",
      "date": "2026-10-15",
      "dir": "out",
      "amt": 8046000,
      "desc": "Thu nhập elite",
      "type": "OPEX",
      "cat": "LUONG"
    },
    {
      "id": "G0208",
      "acc": "QUY",
      "contract": "",
      "flags": [
        "File cũ để trống phân loại"
      ],
      "status": "migrated",
      "doc": "",
      "src": "Sổ quỹ Tháng 10 · dòng 47",
      "date": "2026-10-15",
      "dir": "out",
      "amt": 1930000,
      "desc": "Thu nhập Du Án KOL",
      "type": "OPEX",
      "cat": "LUONG"
    }
  ],
  "staff": [
    {
      "id": "NV01",
      "name": "Nguyễn Thị Mỹ Tiên",
      "role": "HR",
      "base": 12000000,
      "allow": {
        "phone": 0,
        "fuel": 0,
        "meal": 0,
        "travel": 0
      },
      "kpi": 0,
      "insSalary": 0,
      "deps": 0,
      "advance": 0,
      "oldDays": 24,
      "oldTax": 700000,
      "oldNet": 11300000,
      "oldGross": 12000000
    },
    {
      "id": "NV02",
      "name": "Lương Ngọc Nhung",
      "role": "CSKH Cao Cấp",
      "base": 8000000,
      "allow": {
        "phone": 0,
        "fuel": 0,
        "meal": 0,
        "travel": 1000000
      },
      "kpi": 2389516,
      "insSalary": 0,
      "deps": 0,
      "advance": 0,
      "oldDays": 23,
      "oldTax": 495748,
      "oldNet": 10419205,
      "oldGross": 10914953
    },
    {
      "id": "NV03",
      "name": "Trần Thị Giao Uyên",
      "role": "CSKH",
      "base": 7000000,
      "allow": {
        "phone": 0,
        "fuel": 0,
        "meal": 0,
        "travel": 0
      },
      "kpi": 0,
      "insSalary": 0,
      "deps": 0,
      "advance": 0,
      "oldDays": 24,
      "oldTax": 350000,
      "oldNet": 6650000,
      "oldGross": 7000000
    },
    {
      "id": "NV04",
      "name": "Lê Thị Hiền Thanh",
      "role": "CSKH",
      "base": 7000000,
      "allow": {
        "phone": 0,
        "fuel": 0,
        "meal": 0,
        "travel": 0
      },
      "kpi": 0,
      "insSalary": 0,
      "deps": 0,
      "advance": 0,
      "oldDays": 10,
      "oldTax": 145833,
      "oldNet": 2770834,
      "oldGross": 2916667
    },
    {
      "id": "NV05",
      "name": "Nguyễn Thị Quỳnh Như",
      "role": "CSKH",
      "base": 7000000,
      "allow": {
        "phone": 0,
        "fuel": 0,
        "meal": 0,
        "travel": 0
      },
      "kpi": 0,
      "insSalary": 0,
      "deps": 0,
      "advance": 0,
      "oldDays": 10,
      "oldTax": 145833,
      "oldNet": 2770834,
      "oldGross": 2916667
    }
  ],
  "att": {
    "Lương Ngọc Nhung": {
      "days": {
        "2026-09-01": 1,
        "2026-09-02": 1,
        "2026-09-03": 1,
        "2026-09-04": 1,
        "2026-09-05": 0.5,
        "2026-09-07": 1,
        "2026-09-08": 1,
        "2026-09-09": 1,
        "2026-09-10": 1,
        "2026-09-11": 1,
        "2026-09-12": 0.5,
        "2026-09-15": 1,
        "2026-09-16": 1,
        "2026-09-17": 1,
        "2026-09-18": 1,
        "2026-09-19": 0.5,
        "2026-09-21": 1,
        "2026-09-22": 1,
        "2026-09-23": 1,
        "2026-09-24": 1,
        "2026-09-25": 1,
        "2026-09-26": 0.5,
        "2026-09-27": 1,
        "2026-09-28": 1,
        "2026-09-29": 1,
        "2026-09-30": 1
      },
      "ghost31": true
    },
    "Trần Thị Giao Uyên": {
      "days": {
        "2026-09-01": 1,
        "2026-09-02": 1,
        "2026-09-03": 1,
        "2026-09-04": 1,
        "2026-09-05": 0.5,
        "2026-09-07": 1,
        "2026-09-08": 1,
        "2026-09-09": 1,
        "2026-09-10": 1,
        "2026-09-11": 1,
        "2026-09-12": 0.5,
        "2026-09-14": 1,
        "2026-09-15": 1,
        "2026-09-16": 1,
        "2026-09-17": 1,
        "2026-09-18": 1,
        "2026-09-19": 0.5,
        "2026-09-21": 1,
        "2026-09-22": 1,
        "2026-09-23": 1,
        "2026-09-24": 1,
        "2026-09-25": 1,
        "2026-09-26": 0.5,
        "2026-09-27": 1,
        "2026-09-28": 1,
        "2026-09-29": 1,
        "2026-09-30": 1
      },
      "ghost31": true
    },
    "Nguyễn Thị Mỹ Tiên": {
      "days": {
        "2026-09-01": 1,
        "2026-09-02": 1,
        "2026-09-03": 1,
        "2026-09-04": 1,
        "2026-09-05": 0.5,
        "2026-09-07": 1,
        "2026-09-08": 1,
        "2026-09-09": 1,
        "2026-09-10": 1,
        "2026-09-11": 1,
        "2026-09-12": 0.5,
        "2026-09-14": 1,
        "2026-09-15": 1,
        "2026-09-16": 1,
        "2026-09-17": 1,
        "2026-09-18": 1,
        "2026-09-19": 0.5,
        "2026-09-21": 1,
        "2026-09-22": 1,
        "2026-09-23": 1,
        "2026-09-24": 1,
        "2026-09-25": 1,
        "2026-09-26": 0.5,
        "2026-09-27": 1,
        "2026-09-28": 1,
        "2026-09-29": 1,
        "2026-09-30": 1
      },
      "ghost31": true
    },
    "Lê Thị Hiền Thanh": {
      "days": {
        "2026-09-17": 1,
        "2026-09-18": 1,
        "2026-09-19": 0.5,
        "2026-09-21": 1,
        "2026-09-22": 1,
        "2026-09-23": 1,
        "2026-09-24": 1,
        "2026-09-25": 1,
        "2026-09-26": 0.5,
        "2026-09-28": 1,
        "2026-09-29": 1,
        "2026-09-30": 1
      },
      "ghost31": false
    },
    "Nguyễn Thị Quỳnh Như": {
      "days": {
        "2026-09-17": 1,
        "2026-09-18": 1,
        "2026-09-19": 0.5,
        "2026-09-21": 1,
        "2026-09-22": 1,
        "2026-09-23": 1,
        "2026-09-24": 1,
        "2026-09-25": 1,
        "2026-09-26": 0.5,
        "2026-09-28": 1,
        "2026-09-29": 1,
        "2026-09-30": 1
      },
      "ghost31": false
    }
  },
  "attMonth": "2026-09",
  "holidays": [
    "2026-01-01",
    "2026-04-30",
    "2026-05-01",
    "2026-09-02"
  ],
  "gifts": {
    "items": [
      {
        "id": "Q01",
        "name": "Hộp bánh trung thu",
        "unit": "hộp",
        "price": 271675
      },
      {
        "id": "Q02",
        "name": "Quà bốc thăm hội thảo",
        "unit": "phần",
        "price": 666364
      },
      {
        "id": "Q03",
        "name": "Ấn phẩm, brochure",
        "unit": "cuốn",
        "price": 14850
      },
      {
        "id": "Q04",
        "name": "Tờ rơi thẻ",
        "unit": "tờ",
        "price": 3208
      },
      {
        "id": "Q05",
        "name": "Hashtag cầm tay",
        "unit": "cái",
        "price": 76667
      },
      {
        "id": "Q06",
        "name": "Túi đựng quà",
        "unit": "cái",
        "price": 5350
      }
    ],
    "mv": [
      {
        "d": "2026-09-02",
        "item": "Q01",
        "qty": 40,
        "kind": "in",
        "who": "Mua lô bánh trung thu",
        "tx": "G0073",
        "ex": true
      },
      {
        "d": "2026-09-11",
        "item": "Q03",
        "qty": 300,
        "kind": "in",
        "who": "In ấn phẩm",
        "tx": "G0104",
        "ex": true
      },
      {
        "d": "2026-09-16",
        "item": "Q04",
        "qty": 120,
        "kind": "in",
        "who": "In 120 tờ rơi thẻ",
        "tx": "G0112",
        "ex": false
      },
      {
        "d": "2026-09-18",
        "item": "Q05",
        "qty": 3,
        "kind": "in",
        "who": "Mua hashtag",
        "tx": "G0116",
        "ex": false
      },
      {
        "d": "2026-09-18",
        "item": "Q06",
        "qty": 20,
        "kind": "in",
        "who": "Mua túi đựng quà",
        "tx": "G0117",
        "ex": true
      },
      {
        "d": "2026-09-19",
        "item": "Q02",
        "qty": 11,
        "kind": "in",
        "who": "Quà bốc thăm HT 19/9 (cọc 30% + phần còn lại)",
        "tx": "G0134",
        "ex": false
      },
      {
        "d": "2026-09-08",
        "item": "Q01",
        "qty": 12,
        "kind": "out",
        "to": "TV",
        "who": "Nguyễn Hữu Thạch",
        "note": "Tặng khách dịp trung thu",
        "ex": true
      },
      {
        "d": "2026-09-08",
        "item": "Q01",
        "qty": 8,
        "kind": "out",
        "to": "TV",
        "who": "Thái Thị Thanh Thảo",
        "note": "Tặng khách dịp trung thu",
        "ex": true
      },
      {
        "d": "2026-09-12",
        "item": "Q01",
        "qty": 10,
        "kind": "out",
        "to": "SK",
        "who": "Workshop trung thu",
        "note": "",
        "ex": true
      },
      {
        "d": "2026-09-19",
        "item": "Q02",
        "qty": 11,
        "kind": "out",
        "to": "SK",
        "who": "Hội thảo 19/9",
        "note": "Bốc thăm 33 khách đăng ký",
        "ex": false
      },
      {
        "d": "2026-09-19",
        "item": "Q03",
        "qty": 120,
        "kind": "out",
        "to": "SK",
        "who": "Hội thảo 19/9",
        "note": "",
        "ex": true
      },
      {
        "d": "2026-09-19",
        "item": "Q04",
        "qty": 80,
        "kind": "out",
        "to": "SK",
        "who": "Hội thảo 19/9",
        "note": "",
        "ex": true
      },
      {
        "d": "2026-09-25",
        "item": "Q06",
        "qty": 6,
        "kind": "out",
        "to": "KH",
        "who": "Khách Cường",
        "note": "Gói quà tặng",
        "ex": true
      }
    ]
  },
  "budget": {
    "2026-08": {
      "LUONG": 33228000,
      "SUKIEN": 3000000
    },
    "2026-09": {},
    "2026-10": {}
  },
  "locks": {},
  "close": {},
  "log": [
    {
      "at": "2026-10-19 08:00",
      "role": "vpm",
      "what": "Khởi tạo hệ thống Sổ Gốc BKD TTNG"
    }
  ]
};

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

    // 11. Tab NguoiDung (Hệ thống người dùng & phân quyền RBAC)
    setupSheet(ss, 'NguoiDung', [
      'Mã NV (id)', 'Tên đăng nhập (username)', 'Mật khẩu (password)', 
      'Họ và tên (fullname)', 'Vai trò (role)', 'Chức danh (title)', 'Trạng thái (status)'
    ]);
    var uSheet = ss.getSheetByName('NguoiDung');
    if (uSheet.getLastRow() <= 1) {
      uSheet.getRange(2, 1, 3, 7).setValues([
        ['NV01', 'tien', '123456', 'Nguyễn Thị Tiên', 'tien', 'Thủ quỹ / Nhập liệu', 'Hoạt động'],
        ['NV02', 'vpm', '123456', 'Kế Toán VPM', 'vpm', 'Kế toán Kiểm soát', 'Hoạt động'],
        ['NV03', 'giau', '123456', 'Bùi Thị Giàu', 'giau', 'Giám đốc / Phê duyệt', 'Hoạt động']
      ]);
    }

    // 12-16: Các tab danh mục chuẩn hóa
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
    return { success: true, message: 'Đã khởi tạo thành công 16 tab cơ sở dữ liệu!' };
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

/**
 * API Đăng nhập & Xác thực Người dùng
 */
function apiLogin(username, password) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('NguoiDung');
  var fallbackUsers = [
    { username: 'tien', pass: '123456', fullname: 'Nguyễn Thị Tiên', role: 'tien', title: 'Thủ quỹ / Nhập liệu' },
    { username: 'vpm', pass: '123456', fullname: 'Kế Toán VPM', role: 'vpm', title: 'Kế toán Kiểm soát' },
    { username: 'giau', pass: '123456', fullname: 'Bùi Thị Giàu', role: 'giau', title: 'Giám đốc / Phê duyệt' }
  ];

  if (!sheet || sheet.getLastRow() <= 1) {
    var match = fallbackUsers.find(function(u) {
      return u.username.toLowerCase() === String(username).trim().toLowerCase() && u.pass === String(password).trim();
    });
    if (match) {
      return { success: true, user: { username: match.username, fullname: match.fullname, role: match.role, title: match.title } };
    }
    return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
  }

  var vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  for (var i = 0; i < vals.length; i++) {
    var r = vals[i];
    var uName = String(r[1]).trim().toLowerCase();
    var pass = String(r[2]).trim();
    var fName = String(r[3]).trim();
    var role = String(r[4]).trim();
    var title = String(r[5]).trim();
    var status = String(r[6]).trim();
    if (uName === String(username).trim().toLowerCase() && pass === String(password).trim()) {
      if (status && status !== 'Hoạt động') {
        return { success: false, message: 'Tài khoản đang bị tạm khóa!' };
      }
      return {
        success: true,
        user: { username: uName, fullname: fName, role: role, title: title }
      };
    }
  }
  return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
}
