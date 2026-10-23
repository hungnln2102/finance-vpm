import fs from 'fs';
const content = fs.readFileSync('gas/index.html', 'utf8');
const pos = content.indexOf('accept:"image');
console.log('Position of accept:"image:', pos);
console.log('Total file length:', content.length);
console.log('Remaining chars after this pos:', content.length - pos);
console.log('Snippet around this pos:');
console.log(content.slice(pos - 100, pos + 200));
