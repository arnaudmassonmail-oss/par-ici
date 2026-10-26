// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const UA = { 'user-agent': 'par-ici/1.0 (https://github.com/arnaudmassonmail-oss/par-ici)' };
const q = '[out:json][timeout:180];area["ISO3166-1"="FR"][admin_level=2]->.fr;nwr["amenity"="cinema"](area.fr);out center tags;';
for (const ep of ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']) {
  const t = Date.now();
  try {
    const r = await fetch(ep, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { ...UA, 'content-type': 'application/x-www-form-urlencoded' } });
    const s = await r.text();
    let n = '';
    try { const els = JSON.parse(s).elements; n = `${els.length} cinémas, website ${els.filter(e => e.tags?.website).length}, addr:city ${els.filter(e => e.tags?.['addr:city']).length}`; } catch { n = s.slice(0, 400).replace(/\s+/g, ' '); }
    console.log(`## ${ep} HTTP ${r.status} en ${Date.now() - t} ms : ${n}`);
  } catch (e) { console.log(`## ${ep} erreur ${e.message}`); }
}
const url = 'https://www.cnc.fr/documents/36995/158946/exploitation+-+liste+des+%C3%A9tablissements+actifs+-.xlsx/785df5b6-8c1d-fd61-6a72-548ecafa382a';
fs.writeFileSync('/tmp/cnc.xlsx', Buffer.from(await (await fetch(url, { headers: UA })).arrayBuffer()));
const x = f => execSync(`unzip -p /tmp/cnc.xlsx ${f}`, { maxBuffer: 1e8 }).toString();
console.log(x('xl/workbook.xml').match(/<sheet [^>]+>/g).join('\n'));
const strs = [...x('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => m[1].replace(/<[^>]+>/g, ''));
const sheet = x('xl/worksheets/sheet2.xml');
const rows = [...sheet.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map(row => Object.fromEntries([...row[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>(?:<f>[^<]*<\/f>)?(?:<v>([^<]*)<\/v>|<is><t>([^<]*)<\/t><\/is>)?<\/c>)/g)].map(c => [c[1], /t="s"/.test(c[2]) ? strs[+c[3]] : (c[3] ?? c[4])])));
console.log('sheet2 lignes', rows.length);
for (const r of rows.slice(0, 8)) console.log(JSON.stringify(r));
console.log(rows.filter(r => /Clisson|Pornic|Saint-Michel-Chef|Montaigu/i.test(JSON.stringify(r))).map(r => JSON.stringify(r)).join('\n'));
