import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const fileUrl = 'file:///' + path.resolve('gas/index.html').replace(/\\/g, '/');
const screenshotPath = 'C:\\Users\\hungn\\.gemini\\antigravity-ide\\brain\\f116e043-bd81-4177-b3cd-e500bcfc8e5b\\gas_render_masterpiece.png';

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=9333',
  '--window-size=1440,900',
  '--disable-gpu',
  'about:blank'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9333/json', (r) => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find((t) => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Page.navigate', params: { url: fileUrl } }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.method === 'Page.loadEventFired') {
        setTimeout(() => {
          ws.send(
            JSON.stringify({
              id: 10,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            })
          );
        }, 800);
      } else if (msg.id === 10 && msg.result?.data) {
        fs.writeFileSync(screenshotPath, Buffer.from(msg.result.data, 'base64'));
        console.log('📸 Screenshot captured successfully:', screenshotPath);
        ws.close();
        edge.kill();
        process.exit(0);
      }
    };
  } catch (err) {
    console.error(err);
    edge.kill();
    process.exit(1);
  }
}, 2000);
