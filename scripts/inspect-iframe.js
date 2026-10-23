import http from 'http';
import { spawn } from 'child_process';

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  'https://script.google.com/macros/s/AKfycbxq1TQwoKtWNXNs7FHaQkyXTUmroPsCu38jbzzfen5VX2lIT-JOFW0ejMziQ3fvQu-OQw/exec'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9222/json', (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const iframeTarget = list.find((t) => t.url.includes('script.googleusercontent.com'));
    if (!iframeTarget) {
      edge.kill();
      process.exit(1);
    }

    const ws = new WebSocket(iframeTarget.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `(() => {
              const f = document.getElementById('userHtmlFrame');
              const win = f.contentWindow;
              const doc = f.contentDocument;
              const code = doc.scripts[2].textContent;
              
              // Find where the syntax error starts
              let low = 0;
              let high = code.length;
              let badIndex = -1;

              // Line-by-line check
              const lines = code.split('\\n');
              let cumulative = 0;
              let badLine = -1;
              let badLineContent = '';

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Check if any character has unusual unicode or unescaped entity
                if (line.includes('</script>') || line.includes('<!--')) {
                  return { foundSpecial: true, lineIndex: i, snippet: line.slice(0, 100) };
                }
              }

              // Let's do binary search on substring compile
              // But JavaScript requires complete expressions, so let's see how Google Apps Script sanitizes
              return {
                linesCount: lines.length,
                firstLine: lines[0].slice(0, 200),
                lastLine: lines[lines.length - 1].slice(0, 200),
                containsBadChars: /[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u2028\\u2029]/.test(code)
              };
            })()`,
            returnByValue: true
          }
        })
      );
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        console.log('Error Location:', JSON.stringify(msg.result?.result?.value, null, 2));
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
}, 8000);
