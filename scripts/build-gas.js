/**
 * Script đóng gói bản build React thành 1 file HTML duy nhất (Inlined CSS & JS)
 * để triển khai trực tiếp vào Google Apps Script HtmlService
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const gasDir = path.resolve(rootDir, 'gas');

function bundleForGas() {
  console.log('🚀 Bắt đầu đóng gói Web App cho Google Apps Script...');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Thư mục dist không tồn tại! Vui lòng chạy npm run build trước.');
    process.exit(1);
  }

  const distHtmlPath = path.resolve(distDir, 'index.html');
  if (!fs.existsSync(distHtmlPath)) {
    console.error('❌ File dist/index.html không tồn tại!');
    process.exit(1);
  }

  let html = fs.readFileSync(distHtmlPath, 'utf8');

  // 1. Thu thập tất cả CSS trong dist/assets/
  let inlinedStyles = '';
  const assetsDir = path.resolve(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    const cssFiles = assetFiles.filter((f) => f.endsWith('.css'));
    for (const cssFile of cssFiles) {
      console.log(`📦 Nhúng CSS: assets/${cssFile}`);
      const cssContent = fs.readFileSync(path.resolve(assetsDir, cssFile), 'utf8');
      inlinedStyles += cssContent + '\n';
    }
  }

  // Xóa các thẻ <link rel="stylesheet" ...> và <link rel="modulepreload" ...>
  html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '');
  html = html.replace(/<link[^>]+rel=["']modulepreload["'][^>]*>/gi, '');

  // Chèn thẻ <style> vào trước </head> bằng slice an toàn
  if (inlinedStyles) {
    const headCloseIdx = html.lastIndexOf('</head>');
    if (headCloseIdx !== -1) {
      html = html.slice(0, headCloseIdx) + `<style>\n${inlinedStyles}</style>\n` + html.slice(headCloseIdx);
    }
  }

  // 2. Thu thập file JavaScript bundle
  let jsContent = '';
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    const jsFiles = assetFiles.filter((f) => f.endsWith('.js'));
    for (const jsFile of jsFiles) {
      console.log(`📦 Nhúng JavaScript: assets/${jsFile}`);
      jsContent += fs.readFileSync(path.resolve(assetsDir, jsFile), 'utf8') + '\n';
    }
  }

  // Xóa các thẻ <script src="..."> cũ trong HTML
  html = html.replace(/<script[^>]+src=["'][^"']+["'][^>]*><\/script>/gi, '');

  // KIỂM TRA CÚ PHÁP JAVASCRIPT TRƯỚC KHI NHÚNG
  try {
    new Function(jsContent);
    console.log('✅ Cú pháp JavaScript bundle hợp lệ 100% (Syntax check passed)');
  } catch (err) {
    console.error('❌ Lỗi cú pháp trong JavaScript bundle:', err.message);
    process.exit(1);
  }

  // 3. Chèn JavaScript vào ngay trước </body> bằng slice an toàn
  const inlinedScripts = `<script>\n${jsContent}</script>\n`;
  const bodyCloseIdx = html.lastIndexOf('</body>');
  if (bodyCloseIdx !== -1) {
    html = html.slice(0, bodyCloseIdx) + inlinedScripts + html.slice(bodyCloseIdx);
  } else {
    html += inlinedScripts;
  }

  if (!fs.existsSync(gasDir)) {
    fs.mkdirSync(gasDir, { recursive: true });
  }

  const gasHtmlPath = path.resolve(gasDir, 'index.html');
  fs.writeFileSync(gasHtmlPath, html, 'utf8');

  // KIỂM TRA LẠI FILE gas/index.html VỪA GHI ĐỂ BẢO ĐẢM KHÔNG BỊ BIẾN DẠNG
  const verifiedContent = fs.readFileSync(gasHtmlPath, 'utf8');
  const sOpen = verifiedContent.indexOf('<script>');
  const sClose = verifiedContent.lastIndexOf('</script>');
  const extractedJs = verifiedContent.slice(sOpen + 8, sClose);

  try {
    new Function(extractedJs);
    console.log('✅ Xác thực file gas/index.html: Cú pháp JavaScript hoàn toàn hợp lệ!');
  } catch (err) {
    console.error('❌ Xác thực thất bại: JavaScript trong file HTML bị biến dạng:', err.message);
    process.exit(1);
  }

  const stats = fs.statSync(gasHtmlPath);
  console.log(`✅ Đóng gói thành công file: ${gasHtmlPath}`);
  console.log(`📊 Dung lượng file HTML: ${(stats.size / 1024).toFixed(2)} KB`);
}

bundleForGas();
