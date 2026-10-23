import fs from 'fs';
const content = fs.readFileSync('index.legacy.html', 'utf8');
const match = content.match(/const SEED = ({[\s\S]*?});\n/);
const seed = JSON.parse(match[1]);
console.log('SEED KEYS:', Object.keys(seed));
console.log('attMonth:', seed.attMonth);
console.log('holidays:', seed.holidays);
