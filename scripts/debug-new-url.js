import http from 'http';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const targetUrl = 'https://script.google.com/macros/s/AKfycbydUrQsYTEBiwGfjnpUKPtHe1AOWKbI0lljnhEBiJxGkZuGC5wyIrup1phmSjqVIBYCgA/exec';
const tempDir = path.join(os.tmpdir(), 'edge-debug-' + Date.now());
fs.mkdirSync(tempDir, { recursive: true });

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=9333',
  `--user-data-dir=${tempDir}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-sync',
  targetUrl
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9333/json', (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const iframeTarget = list.find((t) => t.url.includes('script.googleusercontent.com'));
    if (!iframeTarget) {
      console.log('iframeTarget not found');
      edge.kill();
      process.exit(1);
    }

    const ws = new WebSocket(iframeTarget.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(
        JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: {
            expression: `(() => {
              const f = document.getElementById('userHtmlFrame');
              const win = f.contentWindow;
              const doc = f.contentDocument;

              // Test compiling script 2 in win
              const code = doc.scripts[2].textContent;
              let compileError = null;
              try {
                new win.Function(code);
              } catch (e) {
                compileError = { msg: e.message, stack: e.stack };
              }

              // Let's see what happens if we manually execute the last few statements
              // in win:
              let manualRenderResult = null;
              try {
                // Check if React root is there
                const rootEl = doc.getElementById('root');
                manualRenderResult = {
                  rootElFound: !!rootEl,
                  readyState: doc.readyState,
                  docBodyChildNodesCount: doc.body.childNodes.length
                };
              } catch (e) {
                manualRenderResult = { err: e.message };
              }

              return {
                compileError,
                manualRenderResult,
                codeLength: code.length,
                tail: code.slice(-300)
              };
            })()`,
            returnByValue: true
          }
        })
      );
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === 2) {
        console.log('INNER INSPECT RESULT:', JSON.stringify(msg.result?.result?.value, null, 2));
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
}, 7000);
