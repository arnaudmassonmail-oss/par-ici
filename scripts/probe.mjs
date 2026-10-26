// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const url = 'https://www.cnc.fr/documents/36995/158946/exploitation+-+liste+des+%C3%A9tablissements+actifs+-.xlsx/785df5b6-8c1d-fd61-6a72-548ecafa382a';
const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
const buf = Buffer.from(await r.arrayBuffer());
console.log('HTTP', r.status, r.headers.get('content-type'), buf.length, 'octets');
fs.writeFileSync('/tmp/cnc.xlsx', buf);
console.log(execSync('unzip -l /tmp/cnc.xlsx').toString());
const ss = execSync('unzip -p /tmp/cnc.xlsx xl/sharedStrings.xml', { maxBuffer: 1e8 }).toString();
const strs = [...ss.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => m[1].replace(/<[^>]+>/g, ''));
console.log('chaînes', strs.length, ':', strs.slice(0, 60).join(' | '));
const sheet = execSync('unzip -p /tmp/cnc.xlsx xl/worksheets/sheet1.xml', { maxBuffer: 1e8 }).toString();
const rows = [...sheet.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)];
console.log('lignes', rows.length);
for (const row of rows.slice(0, 8)) console.log([...row[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*)>(?:<f>[^<]*<\/f>)?(?:<v>([^<]*)<\/v>|<is><t>([^<]*)<\/t><\/is>)?/g)].map(c => `${c[1]}=${/t="s"/.test(c[2]) ? strs[+c[3]] : (c[3] ?? c[4])}`).join(' ; '));
