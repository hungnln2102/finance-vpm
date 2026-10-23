/**
 * Debug Google Apps Script Web App execution via Chrome DevTools Protocol
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const targetUrl = 'https://script.google.com/macros/s/AKfycbxq1TQwoKtWNXNs7FHaQkyXTUmroPsCu38jbzzfen5VX2lIT-JOFW0ejMziQ3fvQu-OQw/exec';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotPath = 'C:\\Users\\hungn\\.gemini\\antigravity-ide\\brain\\f116e043-bd81-4177-b3cd-e500bcfc8e5b\\gas_live_screenshot.png';

async function main() {
  console.log('🚀 Launching Edge with remote debugging...');
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  console.log('📡 Fetching DevTools targets...');
  const json = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = json.find(t => t.type === 'page');
  if (!page || !page.webSocketDebuggerUrl) {
    console.error('❌ Could not find page target!');
    edge.kill();
    return;
  }

  console.log('🔌 Connecting to WebSocket:', page.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let msgId = 1;
  const send = (method, params = {}, sessionId = undefined) => {
    const id = msgId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    ws.send(JSON.stringify(payload));
    return id;
  };

  const sessions = new Set();

  ws.onopen = () => {
    console.log('✅ Connected! Enabling domains...');
    send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
    send('Runtime.enable');
    send('Page.enable');
    send('Log.enable');

    console.log('🌐 Navigating to:', targetUrl);
    send('Page.navigate', { url: targetUrl });
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    
    if (msg.method === 'Target.attachedToTarget') {
      const { sessionId, targetInfo } = msg.params;
      console.log(`🎯 [ATTACHED TARGET] (${targetInfo.type}) url: ${targetInfo.url}`);
      sessions.add(sessionId);
      send('Runtime.enable', {}, sessionId);
      send('Log.enable', {}, sessionId);
      send('Page.enable', {}, sessionId);
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      const args = (msg.params.args || []).map(a => a.value ?? a.description ?? JSON.stringify(a)).join(' ');
      console.log(`[CONSOLE ${msg.params.type.toUpperCase()}]`, args);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      console.log('❌ [EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description || '');
    } else if (msg.method === 'Log.entryAdded') {
      console.log(`[LOG ${msg.params.entry.level}]`, msg.params.entry.text);
    }
  };

  await new Promise(r => setTimeout(r, 10000));

  // Take screenshot
  console.log('📸 Taking screenshot...');
  const captureId = send('Page.captureScreenshot', { format: 'png' });
  
  await new Promise((resolve) => {
    const origHandler = ws.onmessage;
    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === captureId && msg.result?.data) {
        fs.writeFileSync(screenshotPath, Buffer.from(msg.result.data, 'base64'));
        console.log(`✅ Screenshot saved to: ${screenshotPath}`);
        resolve();
      } else {
        origHandler(evt);
      }
    };
    setTimeout(resolve, 3000);
  });

  console.log('⏱️ Closing browser...');
  ws.close();
  edge.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
