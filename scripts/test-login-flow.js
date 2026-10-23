import fs from 'fs';
import path from 'path';
import vm from 'vm';
import http from 'http';
import { spawn } from 'child_process';

const gasHtmlPath = path.resolve('gas/index.html');
const content = fs.readFileSync(gasHtmlPath, 'utf8');

// 1. Kiểm tra syntax của block <script>
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('❌ Không tìm thấy thẻ <script>!');
  process.exit(1);
}

try {
  // Thay thế các đối tượng DOM giả lập để test syntax
  const scriptContent = scriptMatch[1];
  new vm.Script(scriptContent);
  console.log('✅ Cú pháp JavaScript trong gas/index.html hoàn toàn hợp lệ!');
} catch (e) {
  console.error('❌ Lỗi cú pháp JavaScript:', e.message);
  process.exit(1);
}

// 2. Chạy headless Edge để chụp ảnh màn hình Login Screen
const fileUrl = 'file:///' + gasHtmlPath.replace(/\\/g, '/');
const brainDir = 'C:\\Users\\hungn\\.gemini\\antigravity-ide\\brain\\f116e043-bd81-4177-b3cd-e500bcfc8e5b';
const loginScreenshot = path.join(brainDir, 'login_screen_preview.png');
const appScreenshot = path.join(brainDir, 'app_logged_in_preview.png');

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=9444',
  '--window-size=1440,900',
  '--disable-gpu',
  'about:blank'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9444/json', (r) => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find((t) => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let step = 0;

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      // Xóa sessionStorage/localStorage để đảm bảo vào Login Screen
      ws.send(JSON.stringify({
        id: 3,
        method: 'Page.navigate',
        params: { url: fileUrl }
      }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('🔥 BROWSER EXCEPTION:', JSON.stringify(msg.params?.exceptionDetails));
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('📢 BROWSER CONSOLE:', msg.params?.args?.map(a => a.value || a.description).join(' '));
      }

      if (msg.method === 'Page.loadEventFired') {
        setTimeout(() => {
          // Xóa session storage trong browser rồi reload nếu có
          ws.send(JSON.stringify({
            id: 20,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                sessionStorage.clear();
                localStorage.removeItem('vpm_active_user');
                checkAuth();
              `
            }
          }));
        }, 500);
      } else if (msg.id === 20) {
        // Chụp screenshot Login screen
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 30,
            method: 'Page.captureScreenshot',
            params: { format: 'png' }
          }));
        }, 600);
      } else if (msg.id === 30 && msg.result?.data) {
        fs.writeFileSync(loginScreenshot, Buffer.from(msg.result.data, 'base64'));
        console.log('📸 1. Đã chụp ảnh Login Screen:', loginScreenshot);

        // Click vào nút demo "tien"
        ws.send(JSON.stringify({
          id: 40,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              const btn = document.querySelector('[data-login-user="tien"]');
              if (btn) btn.click();
              document.querySelector('#userProfile')?.innerText;
            `
          }
        }));
      } else if (msg.id === 40) {
        console.log('👉 2. Đã kích hoạt click vào tài khoản demo Thủ quỹ Tiên. Kết quả:', msg.result?.result?.value);
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 50,
            method: 'Page.captureScreenshot',
            params: { format: 'png' }
          }));
        }, 800);
      } else if (msg.id === 50 && msg.result?.data) {
        fs.writeFileSync(appScreenshot, Buffer.from(msg.result.data, 'base64'));
        console.log('📸 3. Đã chụp ảnh Dashboard sau khi đăng nhập:', appScreenshot);
        ws.close();
        edge.kill();
        process.exit(0);
      }
    };
  } catch (err) {
    console.error('Lỗi kiểm thử:', err);
    edge.kill();
    process.exit(1);
  }
}, 2000);
