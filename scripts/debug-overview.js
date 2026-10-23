import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(path.resolve('gas/index.html'), 'utf8');

// Tạo môi trường DOM giả lập
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const window = dom.window;

window.addEventListener('error', (event) => {
  console.error('🔥 Runtime Error in DOM:', event.error);
});

console.log('App title in DOM:', window.document.querySelector('#title')?.textContent);
console.log('User profile:', window.document.querySelector('#userProfile')?.innerHTML);
console.log('View content length:', window.document.querySelector('#view')?.innerHTML?.length);
console.log('View content HTML:', window.document.querySelector('#view')?.innerHTML?.slice(0, 300));
