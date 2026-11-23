import fs from 'fs';

const r = JSON.parse(fs.readFileSync('./lh-v3.json', 'utf8'));
console.log('Long tasks:', r.audits['long-tasks']?.details?.items);
console.log('Bootup time:', r.audits['bootup-time']?.details?.items?.slice(0, 5));
