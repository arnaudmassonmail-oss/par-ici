// Builds lib/cinemas.json, the list of every cinema in France the server looks up films for.
//   CNC (data.gouv.fr): the official list of active cinemas, with their commune.
//   OpenStreetMap (Overpass): exact position and website of each cinema.
//   AlloCiné: the cinema's id, which gives its films (see lib/films.mjs).
// Run monthly by .github/workflows/cinemas.yml; writes scripts/cinemas.log. Needs `unzip`.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { distKmBetween } from '../lib/collect.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const UA = { 'user-agent': 'par-ici/1.0 (https://github.com/arnaudmassonmail-oss/par-ici)' };
const LOG = [];
const log = (...a) => { const s = a.join(' '); LOG.push(s); console.log(s); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJson(url, opt = {}, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { ...opt, headers: { ...UA, ...opt.headers } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) { if (i >= tries) throw e; await sleep(2000 * i); }
  }
}
// Runs fn over items, n at a time.
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); } }));
  return out;
}

// Names compared without accents, case or the words every cinema shares.
const COMMON = new Set('cinema cinemas cine le la les l de du des d salle espace st saint the et a au aux en sur centre culturel'.split(' '));
const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const tokens = s => norm(s).split(' ').filter(w => w && !COMMON.has(w));
function likeness(a, b) {
  const x = tokens(a), y = new Set(tokens(b));
  if (!x.length || !y.size) return 0;
  return x.filter(w => y.has(w)).length / Math.min(x.length, y.size);
}
// Pairs each item of `as` with at most one of `bs`, best names first; when both sides hold a single cinema they go together.
function pair(as, bs, nameA, nameB) {
  const res = new Map();
  if (as.length === 1 && bs.length === 1) { res.set(as[0], bs[0]); return res; }
  const cand = [];
  for (const a of as) for (const b of bs) { const s = likeness(nameA(a), nameB(b)); if (s >= 0.5) cand.push([s, a, b]); }
  const used = new Set();
  for (const [, a, b] of cand.sort((x, y) => y[0] - x[0])) if (!res.has(a) && !used.has(b)) { res.set(a, b); used.add(b); }
  return res;
}

// 1. CNC list: the newest yearly sheet of the spreadsheet.
async function cncCinemas() {
  const ds = await getJson('https://www.data.gouv.fr/api/1/datasets/5437eb4e88ee387cb58f5e86/');
  const res = ds.resources.find(r => /xlsx/i.test(r.format || r.url));
  const file = path.join(ROOT, 'scripts/.cnc.xlsx');
  fs.writeFileSync(file, Buffer.from(await (await fetch(res.url, { headers: UA })).arrayBuffer()));
  const part = p => execFileSync('unzip', ['-p', file, p], { maxBuffer: 1e8 }).toString();
  try {
    const sheets = [...part('xl/workbook.xml').matchAll(/<sheet name="(\d{4})"[^>]*r:id="(rId\d+)"/g)].sort((a, b) => b[1] - a[1]);
    const target = part('xl/_rels/workbook.xml.rels').match(new RegExp(`Id="${sheets[0][2]}"[^>]*Target="([^"]+)"|Target="([^"]+)"[^>]*Id="${sheets[0][2]}"`));
    const strs = [...part('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&apos;/g, '\'').trim());
    const rows = [...part('xl/' + (target[1] || target[2]).replace(/^\/?xl\//, '')).matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)]
      .map(row => Object.fromEntries([...row[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>(?:<f>[^<]*<\/f>)?(?:<v>([^<]*)<\/v>|<is><t>([^<]*)<\/t><\/is>)?<\/c>)/g)]
        .map(c => [c[1], /t="s"/.test(c[2]) ? strs[+c[3]] : (c[3] ?? c[4])])));
    const head = rows.findIndex(r => Object.values(r).includes('DEPCOM'));
    const col = Object.fromEntries(Object.entries(rows[head]).map(([k, v]) => [v, k]));
    const list = rows.slice(head + 1).filter(r => r[col.DEPCOM] && r[col.NomEtab])
      .map(r => ({ name: r[col.NomEtab].trim(), insee: String(r[col.DEPCOM]).padStart(5, '0'), city: r[col.COMMUNE].trim() }));
    log(`CNC (${sheets[0][1]}) : ${list.length} cinémas actifs`);
    return list;
  } finally { fs.rmSync(file, { force: true }); }
}

// 2. OpenStreetMap: every amenity=cinema in France.
async function osmCinemas() {
  const q = '[out:json][timeout:240];area["ISO3166-1"="FR"][admin_level=2]->.fr;nwr["amenity"="cinema"](area.fr);out center tags;';
  for (const ep of ['https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']) {
    try {
      const j = await getJson(ep, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'content-type': 'application/x-www-form-urlencoded' } }, 2);
      const list = j.elements.map(e => ({ name: e.tags?.name || '', lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon, web: e.tags?.website || e.tags?.['contact:website'] || '' }))
        .filter(e => typeof e.lat === 'number');
      log(`OpenStreetMap : ${list.length} cinémas`);
      return list;
    } catch (e) { log('OpenStreetMap', ep, '→', e.message); }
  }
  return [];
}

// Centre of a commune, from its INSEE code (IGN Géoplateforme).
async function communeCentre(insee, city) {
  try {
    const j = await getJson(`https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(city)}&type=municipality&citycode=${insee}&limit=1`);
    const f = j.features?.[0];
    if (f) return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
  } catch {}
  return null;
}

// AlloCiné cinemas of a commune. Paris, Lyon and Marseille are looked up per arrondissement (by postcode).
async function allocineIn(insee, city) {
  const plm = { 75: 'Paris', 69: 'Lyon', 13: 'Marseille' }[insee.slice(0, 2)];
  const arr = plm && /arrondissement/i.test(city);
  const j = await getJson(`https://www.allocine.fr/_/localization_city/${encodeURIComponent(city)}`, { headers: { 'accept-language': 'fr-FR' } });
  const zipOf = arr ? (insee.startsWith('75') ? '750' + insee.slice(3) : insee.startsWith('69') ? '6900' + insee.slice(4) : '130' + insee.slice(3)) : null;
  return (j.values?.theaters || []).map(t => t.node).filter(t => arr
    ? t.location?.zip === zipOf
    : norm(t.location?.city) === norm(city) && String(t.location?.zip || '').slice(0, 2) === (insee.startsWith('2A') || insee.startsWith('2B') ? '20' : insee.slice(0, 2)));
}

// Ids found by earlier runs, kept when AlloCiné does not answer this time.
const before = new Map();
try { for (const c of JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/cinemas.json'), 'utf8')).list) if (c[4]) before.set(c[1] + '|' + c[0], c[4]); } catch {}
const cnc = await cncCinemas();
const osm = await osmCinemas();
const towns = [...new Map(cnc.map(c => [c.insee, c])).values()];
log(`${towns.length} communes à interroger`);
// AlloCiné slows down callers that ask too fast: one commune at a time, then a second pass for those that failed.
const acOf = new Map(), errors = {};
for (const pass of [1, 2]) {
  const todo = towns.filter(t => !acOf.has(t.insee));
  if (pass === 2) { log(`Deuxième passage AlloCiné : ${todo.length} communes`); await sleep(60000); }
  await pool(todo, 2, async town => {
    try { acOf.set(town.insee, await allocineIn(town.insee, town.city)); } catch (e) { errors[e.message] = (errors[e.message] || 0) + 1; }
    await sleep(pass === 1 ? 400 : 1000);
  });
}
log('Erreurs AlloCiné :', JSON.stringify(errors));
let acFound = 0, osmFound = 0, kept = 0;
const failed = towns.filter(t => !acOf.has(t.insee)).length;
const out = [];
await pool(towns, 4, async town => {
  const here = cnc.filter(c => c.insee === town.insee);
  const centre = await communeCentre(town.insee, town.city);
  const ac = acOf.get(town.insee) || [];
  const nearOsm = centre ? osm.filter(o => distKmBetween(centre.lat, centre.lon, o.lat, o.lon) < 12) : [];
  const toAc = pair(here, ac, c => c.name, t => t.name);
  const toOsm = pair(here, nearOsm.filter(o => distKmBetween(centre.lat, centre.lon, o.lat, o.lon) < 6), c => c.name, o => o.name);
  // OSM names often follow AlloCiné's better than the CNC's capitals: try those too.
  for (const c of here) if (!toOsm.has(c) && toAc.get(c)) {
    const o = nearOsm.find(o => distKmBetween(centre.lat, centre.lon, o.lat, o.lon) < 6 && likeness(toAc.get(c).name, o.name) >= 0.5 && ![...toOsm.values()].includes(o));
    if (o) toOsm.set(c, o);
  }
  for (const c of here) {
    const a = toAc.get(c), o = toOsm.get(c);
    if (!o && !centre) continue;
    const name = a?.name || o?.name || c.name;
    const id = a?.internalId || (!acOf.has(town.insee) && before.get(c.city + '|' + name)) || '';
    if (a) acFound++; else if (id) kept++;
    if (o) osmFound++;
    out.push([name, c.city, +(o?.lat ?? centre.lat).toFixed(5), +(o?.lon ?? centre.lon).toFixed(5), id, o?.web || '']);
  }
});
out.sort((x, y) => x[1].localeCompare(y[1]) || x[0].localeCompare(y[0]));
log(`Écrits : ${out.length} cinémas ; avec AlloCiné ${acFound} (+ ${kept} gardés du mois précédent), avec position OpenStreetMap ${osmFound} ; communes AlloCiné en erreur ${failed}`);
for (const c of out.filter(c => /Clisson|Montaigu|Pornic|Saint-Michel-Chef|Arles$/.test(c[1]))) log('  exemple :', JSON.stringify(c));
if (out.length < 1000) { log('Trop peu de cinémas : lib/cinemas.json n\'est pas remplacé.'); process.exitCode = 1; }
else fs.writeFileSync(path.join(ROOT, 'lib/cinemas.json'), JSON.stringify({ updated: new Date().toISOString().slice(0, 10), cols: ['nom', 'commune', 'lat', 'lon', 'allocine', 'site'], list: out }) + '\n');
fs.writeFileSync(path.join(ROOT, 'scripts/cinemas.log'), LOG.join('\n') + '\n');
