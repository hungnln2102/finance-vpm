import fs from 'fs';
import path from 'path';

const legacyPath = path.resolve('index.legacy.html');
const gasHtmlPath = path.resolve('gas/index.html');

let content = fs.readFileSync(legacyPath, 'utf8');

// 1. Tối ưu hóa biến SEED: Loại bỏ 100% dữ liệu tĩnh cứng (Dữ liệu do 16 tab Google Sheets quản lý)
const minimalSeed = {
  contracts: [],
  tx: [],
  staff: [],
  att: {},
  attMonth: "2026-09",
  holidays: ["2026-01-01", "2026-04-30", "2026-05-01", "2026-09-02"],
  gifts: { items: [], mv: [] },
  budget: { "2026-08": {}, "2026-09": {}, "2026-10": {} },
  locks: {},
  close: {},
  log: []
};

content = content.replace(/const SEED = {[\s\S]*?};\n/, 'const SEED = ' + JSON.stringify(minimalSeed, null, 2) + ';\n');
console.log('✅ Đã loại bỏ 100% dữ liệu mẫu tĩnh, SEED hoàn toàn rỗng chuẩn Client-Server');

// Làm rỗng hàm seedGifts vì dữ liệu quà đã nằm trên Google Sheets
content = content.replace(
  /function seedGifts\(tx\) \{[\s\S]*?\n  return \{items, mv\};\n\}/,
  'function seedGifts() { return { items: [], mv: [] }; }'
);

// Chống crash attDays khi attMonth hoặc holidays chưa nạp
content = content.replace(
  'const [y, m] = S.attMonth.split("-").map(Number), n = new Date(Date.UTC(y, m, 0)).getUTCDate(), out = [];',
  'const [y, m] = (S.attMonth || "2026-09").split("-").map(Number), n = new Date(Date.UTC(y, m, 0)).getUTCDate(), out = [];'
);
content = content.replace(
  'hol: S.holidays.includes(iso)',
  'hol: (S.holidays || []).includes(iso)'
);



// 2. Chèn CSS cho Login Screen và Header User Profile
const authCss = `
/* ---------- login screen & user profile ---------- */
.login-screen{position:fixed;inset:0;background:radial-gradient(circle at top,#1e293b 0%,#0a0f18 100%);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto}
.login-box{background:rgba(23,32,48,0.92);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);border-radius:18px;max-width:440px;width:100%;padding:32px 28px;box-shadow:0 24px 48px rgba(0,0,0,0.6)}
.login-header{text-align:center;margin-bottom:24px}
.login-header .logo-badge{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--teal),#0284c7);color:#fff;font-size:28px;margin-bottom:12px;box-shadow:0 8px 20px rgba(13,148,136,0.35)}
.login-header h1{font-size:19px;color:#f8fafc;margin:0 0 6px;font-weight:700;letter-spacing:-0.3px}
.login-header p{font-size:13px;color:var(--muted);margin:0}
.login-form{display:flex;flex-direction:column;gap:14px}
.login-form .input-group{display:flex;flex-direction:column;gap:6px}
.login-form label{font-size:12.5px;color:#cbd5e1;font-weight:500}
.login-form input{background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:10px 14px;color:#f8fafc;font-size:14px;outline:none;transition:border-color 0.2s}
.login-form input:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(13,148,136,0.25)}
.login-btn{background:linear-gradient(135deg,var(--teal),#0d9488);color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;margin-top:6px;transition:all 0.2s;box-shadow:0 4px 12px rgba(13,148,136,0.3)}
.login-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}
.login-err{background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.4);color:#fca5a5;padding:9px 12px;border-radius:8px;font-size:12.5px;display:none}
.quick-users{margin-top:24px;border-top:1px solid rgba(255,255,255,0.08);padding-top:18px}
.quick-users-title{font-size:11.5px;text-transform:uppercase;letter-spacing:0.8px;color:var(--muted);margin-bottom:12px;text-align:center}
.quick-user-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.quick-user-btn{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px 6px;text-align:center;cursor:pointer;transition:all 0.2s;color:#e2e8f0;display:flex;flex-direction:column;align-items:center}
.quick-user-btn:hover{background:rgba(13,148,136,0.18);border-color:var(--teal);transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.3)}
.quick-user-btn .avatar{width:32px;height:32px;border-radius:50%;margin-bottom:6px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
.avatar-tien{background:#10b981;color:#fff}
.avatar-vpm{background:#0284c7;color:#fff}
.avatar-giau{background:#f59e0b;color:#1e293b}
.quick-user-btn .qu-name{font-size:11.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.quick-user-btn .qu-role{font-size:10px;color:var(--muted);margin-top:2px}

/* Header User Profile Badge */
.user-profile{display:inline-flex;align-items:center;gap:10px;padding:4px 12px 4px 8px;border-radius:24px;background:var(--panel);border:1px solid var(--line)}
.user-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
.user-info{display:flex;flex-direction:column;line-height:1.2}
.user-info .user-name{font-size:12.5px;font-weight:600;color:#f8fafc}
.user-info .user-role-badge{font-size:10.5px;color:var(--muted)}
.logout-btn{background:transparent;border:none;cursor:pointer;padding:4px 8px;border-radius:6px;color:#94a3b8;font-size:12px;transition:all 0.2s;display:inline-flex;align-items:center;gap:4px}
.logout-btn:hover{color:#ef4444;background:rgba(239,68,68,0.12)}
`;
content = content.replace('</style>', `${authCss}\n</style>`);

// 3. Chèn Login Screen HTML và bọc App Layout
const loginHtml = `
<div id="loginScreen" class="login-screen">
  <div class="login-box">
    <div class="login-header">
      <div class="logo-badge">👑</div>
      <h1>Sổ Gốc BKD TTNG</h1>
      <p>Bảo Hiểm Có Giàu · Quản Trị Dòng Tiền & Kế Toán</p>
    </div>
    <form id="loginForm" class="login-form">
      <div id="loginError" class="login-err"></div>
      <div class="input-group">
        <label for="loginUsername">Tên đăng nhập</label>
        <input type="text" id="loginUsername" placeholder="tien / vpm / giau" required autocomplete="username">
      </div>
      <div class="input-group">
        <label for="loginPassword">Mật khẩu</label>
        <input type="password" id="loginPassword" placeholder="Nhập mật khẩu (mặc định: 123456)" required autocomplete="current-password">
      </div>
      <button type="submit" class="login-btn" id="loginSubmitBtn">Đăng nhập vào hệ thống</button>
    </form>
    <div class="quick-users">
      <div class="quick-users-title">⚡ Chọn nhanh tài khoản demo</div>
      <div class="quick-user-grid">
        <button type="button" class="quick-user-btn" data-login-user="tien">
          <div class="avatar avatar-tien">T</div>
          <div class="qu-name">Nguyễn Thị Tiên</div>
          <div class="qu-role">Thủ quỹ</div>
        </button>
        <button type="button" class="quick-user-btn" data-login-user="vpm">
          <div class="avatar avatar-vpm">V</div>
          <div class="qu-name">Kế Toán VPM</div>
          <div class="qu-role">Kiểm soát</div>
        </button>
        <button type="button" class="quick-user-btn" data-login-user="giau">
          <div class="avatar avatar-giau">G</div>
          <div class="qu-name">Bùi Thị Giàu</div>
          <div class="qu-role">Giám đốc</div>
        </button>
      </div>
    </div>
  </div>
</div>
`;

content = content.replace('<div class="app">', `${loginHtml}\n<div class="app" id="appLayout" style="display:none">`);

// 4. Thay thế thanh 3 nút chọn vai trò bằng Profile Badge trên Header
content = content.replace(
  '<div class="role" role="group" aria-label="Đang làm việc với vai trò" id="roles"></div>',
  '<div id="userProfile" class="user-profile"></div>'
);

// 5. Thêm cấu trúc Users DB và hệ thống Authentication vào script
const authJsCode = `
/* ---------- authentication & rbac system ---------- */
const USERS_DB = {
  tien: { username: "tien", pass: "123456", fullname: "Nguyễn Thị Tiên", role: "tien", title: "Thủ quỹ / Nhập liệu" },
  vpm: { username: "vpm", pass: "123456", fullname: "Kế Toán VPM", role: "vpm", title: "Kế toán Kiểm soát" },
  giau: { username: "giau", pass: "123456", fullname: "Bùi Thị Giàu", role: "giau", title: "Giám đốc / Phê duyệt" }
};

const USER_SESSION_KEY = "vpm_active_user";

function getCurrentUser() {
  try {
    const s = sessionStorage.getItem(USER_SESSION_KEY) || localStorage.getItem(USER_SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(u) {
  try {
    if (u) {
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(u));
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(u));
    } else {
      sessionStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (e) {}
}

function checkAuth() {
  const u = getCurrentUser();
  const loginScr = $("#loginScreen");
  const appLayout = $("#appLayout");
  if (!u) {
    if (loginScr) loginScr.style.display = "flex";
    if (appLayout) appLayout.style.display = "none";
    return false;
  }
  if (loginScr) loginScr.style.display = "none";
  if (appLayout) appLayout.style.display = "";
  UI.role = u.role;
  return true;
}

function doLogin(username, password) {
  const uKey = String(username).trim().toLowerCase();
  const pass = String(password).trim();
  const errEl = $("#loginError");
  if (errEl) errEl.style.display = "none";

  if (isGas()) {
    try {
      const btn = $("#loginSubmitBtn");
      if (btn) btn.textContent = "Đang xác thực...";
      window.google.script.run
        .withSuccessHandler(function(res) {
          if (btn) btn.textContent = "Đăng nhập vào hệ thống";
          if (res && res.success && res.user) {
            setCurrentUser(res.user);
            UI.role = res.user.role;
            checkAuth();
            render();
            toast("Xin chào " + res.user.fullname + " (" + (res.user.title || ROLES[res.user.role] || res.user.role) + ")");
          } else {
            showLoginError((res && res.message) || "Sai tên đăng nhập hoặc mật khẩu");
          }
        })
        .withFailureHandler(function(err) {
          if (btn) btn.textContent = "Đăng nhập vào hệ thống";
          localAuth(uKey, pass);
        })
        .apiLogin(uKey, pass);
      return;
    } catch (e) {
      // fallback local auth
    }
  }

  localAuth(uKey, pass);
}

function localAuth(uKey, pass) {
  const u = USERS_DB[uKey];
  if (u && u.pass === pass) {
    setCurrentUser(u);
    UI.role = u.role;
    checkAuth();
    render();
    toast("Xin chào " + u.fullname + " (" + u.title + ")");
  } else {
    showLoginError("Sai tên đăng nhập hoặc mật khẩu! (Mật khẩu mặc định: 123456)");
  }
}

function showLoginError(msg) {
  const errEl = $("#loginError");
  if (errEl) {
    errEl.textContent = msg;
    errEl.style.display = "block";
  } else {
    alert(msg);
  }
}

function doLogout() {
  if (confirm("Master có chắc chắn muốn đăng xuất khỏi hệ thống không?")) {
    setCurrentUser(null);
    checkAuth();
    toast("Đã đăng xuất khỏi hệ thống");
  }
}
`;

content = content.replace('/* ---------- helpers ---------- */', `${authJsCode}\n/* ---------- helpers ---------- */`);

// 6. Cập nhật hàm canDo(action) để khóa cứng quyền hạn theo currentUser.role
const updatedCanDo = `function canDo(action) {
  const u = getCurrentUser();
  const r = (u && u.role) || UI.role;
  return ({
    add: r === "tien" || r === "vpm",
    check: r === "vpm",
    return: r === "vpm",
    approve: r === "giau",
    lock: r === "vpm",
    edit: r === "vpm",
    att: r === "tien" || r === "vpm",
    gift: r === "tien" || r === "vpm",
    contract: r === "tien" || r === "vpm",
    budget: r === "giau"
  })[action];
}`;

content = content.replace(/function canDo\(action\) \{[\s\S]*?\n\}/, updatedCanDo);

// 7. Cập nhật renderNav() để render profile badge thay cho 3 nút roles
const updatedRenderNav = `function renderNav() {
  const n = allIssues().filter(i => i.lvl === "bad").length;
  const pend = S.tx.filter(t => t.status === "pending" || (t.status === "checked" && needsApproval(t))).length;
  const counts = {overview: n, ledger: pend};
  $("#nav").innerHTML = Object.entries(VIEWS).map(([k, v]) => \`<button type="button" data-view="\${k}" \${UI.view === k ? 'aria-current="page"' : ""}>\${v.t}\${counts[k] ? \`<span class="cnt">\${counts[k]}</span>\` : ""}</button>\`).join("");
  
  const u = getCurrentUser();
  if (u) {
    const avLetter = u.fullname ? u.fullname.slice(0, 1).toUpperCase() : u.username.slice(0, 1).toUpperCase();
    const avCls = u.role === "tien" ? "avatar-tien" : u.role === "vpm" ? "avatar-vpm" : "avatar-giau";
    const roleTitle = USERS_DB[u.role] ? USERS_DB[u.role].title : (u.title || ROLES[u.role] || u.role);
    $("#userProfile").innerHTML = \`
      <div class="user-avatar \${avCls}">\${avLetter}</div>
      <div class="user-info">
        <span class="user-name">\${esc(u.fullname || u.username)}</span>
        <span class="user-role-badge">\${esc(roleTitle)}</span>
      </div>
      <button type="button" class="logout-btn" id="btnLogout" title="Đăng xuất khỏi hệ thống">Đăng xuất</button>
    \`;
  }

  $("#month").value = UI.month;
  $("#title").textContent = VIEWS[UI.view].t;
  $("#subtitle").textContent = VIEWS[UI.view].s();
}`;

content = content.replace(/function renderNav\(\) \{[\s\S]*?\n\}/, updatedRenderNav);

// 8. Tích hợp tầng đồng bộ Google Apps Script hai chiều vào mã nguồn JavaScript
const gasBridgeCode = `
/* ---------- google apps script bridge ---------- */
const isGas = () => typeof window !== "undefined" && Boolean(window.google && window.google.script && window.google.script.run);

function syncGasInitial() {
  if (!isGas()) return;
  try {
    toast("Đang đồng bộ dữ liệu từ Google Sheets...");
    window.google.script.run
      .withSuccessHandler(function(res) {
        if (!res) return;
        var data = typeof res === "string" ? JSON.parse(res) : res;
        if (data) {
          S = Object.assign(S, data);
          render();
          if (data.tx && data.tx.length) {
            toast("Đã đồng bộ " + data.tx.length + " giao dịch từ Google Sheets!");
          } else {
            toast("Đã kết nối thành công với Google Sheets!");
          }
        }
      })
      .withFailureHandler(function(err) {
        console.warn("[GAS] Lỗi tải dữ liệu từ Sheets:", err);
      })
      .getInitialState();
  } catch (e) {
    console.warn("[GAS] Không thể kết nối Apps Script:", e);
  }
}

function gasSaveTx(tx) {
  if (isGas()) {
    try { window.google.script.run.apiAddTransaction(JSON.stringify(tx)); } catch(e){}
  }
}

function gasUpdateTx(id, updates) {
  if (isGas()) {
    try { window.google.script.run.apiUpdateTransaction(id, JSON.stringify(updates)); } catch(e){}
  }
}

function gasSaveContract(c) {
  if (isGas()) {
    try { window.google.script.run.apiAddContract(JSON.stringify(c)); } catch(e){}
  }
}

function gasSaveGift(mv) {
  if (isGas()) {
    try { window.google.script.run.apiAddGiftMovement(JSON.stringify(mv)); } catch(e){}
  }
}

function gasSaveAtt(staffId, dateIso, val) {
  if (isGas()) {
    try { window.google.script.run.apiSaveAttendance(staffId, dateIso, val); } catch(e){}
  }
}

function gasSetLock(month, locked) {
  if (isGas()) {
    try { window.google.script.run.apiSetMonthLock(month, locked, "VPM"); } catch(e){}
  }
}
`;

content = content.replace('/* ---------- events ---------- */', `${gasBridgeCode}\n/* ---------- events ---------- */`);

// Gắn các lệnh gọi GAS vào các sự kiện tương ứng:
// 1. Chấm công
content = content.replace(
  'if (nx === undefined) delete a.days[d]; else a.days[d] = nx; save(); render(); return;',
  'if (nx === undefined) delete a.days[d]; else a.days[d] = nx; gasSaveAtt(s.id, d, nx); save(); render(); return;'
);

// 2. Thao tác giao dịch
content = content.replace(
  'if (act === "check") { t.status = "checked"; log("Kiểm tra " + t.id + " · " + t.desc); save(); render(); toast(needsApproval(t) ? "Đã kiểm, chuyển chị Giàu duyệt" : "Đã kiểm, giao dịch hoàn tất"); }',
  'if (act === "check") { t.status = "checked"; gasUpdateTx(t.id, {status: "checked"}); log("Kiểm tra " + t.id + " · " + t.desc); save(); render(); toast(needsApproval(t) ? "Đã kiểm, chuyển chị Giàu duyệt" : "Đã kiểm, giao dịch hoàn tất"); }'
);
content = content.replace(
  'if (act === "return") { t.status = "returned"; t.note = "VPM yêu cầu bổ sung chứng từ"; log("Trả lại " + t.id); save(); render(); toast("Đã trả lại cho Tiên"); }',
  'if (act === "return") { t.status = "returned"; t.note = "VPM yêu cầu bổ sung chứng từ"; gasUpdateTx(t.id, {status: "returned", note: t.note}); log("Trả lại " + t.id); save(); render(); toast("Đã trả lại cho Tiên"); }'
);
content = content.replace(
  'if (act === "approve") { t.status = "approved"; log("Duyệt chi " + t.id + " · " + fmt(t.amt) + " đ"); save(); render(); toast("Đã duyệt chi"); }',
  'if (act === "approve") { t.status = "approved"; gasUpdateTx(t.id, {status: "approved"}); log("Duyệt chi " + t.id + " · " + fmt(t.amt) + " đ"); save(); render(); toast("Đã duyệt chi"); }'
);

// 3. Khóa sổ
content = content.replace(
  'if (act === "lock") { S.locks[UI.month] = TODAY; log("Khóa sổ " + monthLabel(UI.month)); save(); render(); toast("Đã khóa sổ " + monthLabel(UI.month).toLowerCase()); }',
  'if (act === "lock") { S.locks[UI.month] = TODAY; gasSetLock(UI.month, true); log("Khóa sổ " + monthLabel(UI.month)); save(); render(); toast("Đã khóa sổ " + monthLabel(UI.month).toLowerCase()); }'
);
content = content.replace(
  'if (act === "unlock") { delete S.locks[UI.month]; log("Mở khóa " + monthLabel(UI.month)); save(); render(); toast("Đã mở khóa"); }',
  'if (act === "unlock") { delete S.locks[UI.month]; gasSetLock(UI.month, false); log("Mở khóa " + monthLabel(UI.month)); save(); render(); toast("Đã mở khóa"); }'
);

// 4. Submit form giao dịch mới
content = content.replace(
  'S.tx.push(t); S.tx.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)); log("Ghi " + t.id + " · " + t.desc + " · " + fmt(amt) + " đ"); save(); UI.month = mon(date); render();',
  'S.tx.push(t); S.tx.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)); gasSaveTx(t); log("Ghi " + t.id + " · " + t.desc + " · " + fmt(amt) + " đ"); save(); UI.month = mon(date); render();'
);

// 5. Submit hợp đồng mới
content = content.replace(
  'S.contracts.push(c); log("Thêm hợp đồng " + c.id + " · " + c.customer); save(); render(); toast(fee && disc / fee > DISC_LIMIT ? "Đã thêm, chiết khấu chờ chị Giàu duyệt" : "Đã thêm hợp đồng");',
  'S.contracts.push(c); gasSaveContract(c); log("Thêm hợp đồng " + c.id + " · " + c.customer); save(); render(); toast(fee && disc / fee > DISC_LIMIT ? "Đã thêm, chiết khấu chờ chị Giàu duyệt" : "Đã thêm hợp đồng");'
);

// 6. Submit quà tặng mới
content = content.replace(
  'S.gifts.mv.push({d: TODAY, item, qty, kind, to: $("#g-to").value, who: $("#g-who").value.trim(), note: "", ex: false, tx: ""});',
  'const mvItem = {d: TODAY, item, qty, kind, to: $("#g-to").value, who: $("#g-who").value.trim(), note: "", ex: false, tx: ""};\n    S.gifts.mv.push(mvItem); gasSaveGift(mvItem);'
);

// 7. Cập nhật xử lý sự kiện click & submit cho Login/Logout
content = content.replace(
  'if (b.dataset.role) { UI.role = b.dataset.role; UI.editTx = null; render(); toast("Đang làm việc với vai trò " + ROLES[UI.role]); return; }',
  'if (b.id === "btnLogout") { doLogout(); return; }\n  if (b.dataset.loginUser) { const lu = b.dataset.loginUser; $("#loginUsername").value = lu; $("#loginPassword").value = "123456"; doLogin(lu, "123456"); return; }'
);

content = content.replace(
  'e.preventDefault();\n  const f = e.target;',
  'e.preventDefault();\n  const f = e.target;\n  if (f.id === "loginForm") { doLogin($("#loginUsername").value, $("#loginPassword").value); return; }'
);

// 8. Cập nhật nút reset
content = content.replace(
  'if ($("#reset").dataset.armed) { try { localStorage.removeItem(KEY); } catch (e) {} S = load(); delete $("#reset").dataset.armed; $("#reset").textContent = "Khôi phục dữ liệu ban đầu"; render(); toast("Đã khôi phục dữ liệu từ file khách"); }',
  'if ($("#reset").dataset.armed) { try { localStorage.removeItem(KEY); } catch (e) {} if (isGas()) { syncGasInitial(); } else { S = load(); render(); } delete $("#reset").dataset.armed; $("#reset").textContent = "Khôi phục dữ liệu ban đầu"; toast("Đã nạp lại dữ liệu từ Google Sheets"); }'
);

// 9. Khởi động ứng dụng có kiểm tra phiên đăng nhập
content = content.replace(
  'render();\n</script>',
  `if (checkAuth()) {\n  render();\n  syncGasInitial();\n} else {\n  checkAuth();\n}\n</script>`
);

fs.writeFileSync(gasHtmlPath, content, 'utf8');

const lines = content.split('\n');
const maxLineLen = Math.max(...lines.map(l => l.length));
console.log(`✅ Xuất bản thành công file: ${gasHtmlPath}`);
console.log(`📊 Tổng số dòng: ${lines.length}`);
console.log(`📏 Chiều dài dòng tối đa: ${maxLineLen} ký tự (TUYỆT ĐỐI AN TOÀN, không có dòng nào dài)`);
console.log(`📦 Dung lượng file: ${(Buffer.byteLength(content, 'utf8') / 1024).toFixed(2)} KB`);
