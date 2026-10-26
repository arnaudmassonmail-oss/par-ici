// Films showing in the cinemas around a point, from AlloCiné's programme of each cinema.
// The cinemas come from lib/cinemas.json (built monthly by scripts/build-cinemas.mjs).
// AlloCiné publishes no official API: if it stops answering, the nearby cinemas are still listed
// with a link to their programme, and the rest of the app is unaffected.
import fs from 'node:fs';
import path from 'node:path';
import { distKmBetween, isoDay, cut, strip } from './collect.mjs';

const FILE = path.join(path.dirname(new URL(import.meta.url).pathname), 'cinemas.json');
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const TTL_MS = 6 * 3600e3;
const MAX_PAGES = 4;

let LIST = null;
function cinemas() {
  if (!LIST) {
    try { LIST = JSON.parse(fs.readFileSync(FILE, 'utf8')).list.map(([n, city, lat, lon, ac, web]) => ({ n, city, lat, lon, ac, web })); } catch { LIST = []; }
  }
  return LIST;
}

// Few requests at once and spaced out: AlloCiné answers 429 to callers that ask too much,
// and is then left alone for a few minutes.
let running = 0, nextStart = 0, coolUntil = 0;
const queue = [];
async function limited(fn) {
  if (running >= 3) await new Promise(r => queue.push(r));
  running++;
  try {
    const wait = Math.max(0, nextStart - Date.now());
    nextStart = Math.max(Date.now(), nextStart) + 250;
    if (wait) await new Promise(r => setTimeout(r, wait));
    return await fn();
  } finally { running--; queue.shift()?.(); }
}
async function getJson(url) {
  if (Date.now() < coolUntil) throw new Error('AlloCiné en pause');
  return limited(async () => {
    if (Date.now() < coolUntil) throw new Error('AlloCiné en pause');
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(10000) });
    if (r.status === 429) coolUntil = Date.now() + 5 * 60e3;
    if (!r.ok) throw new Error('AlloCiné HTTP ' + r.status);
    return r.json();
  });
}

// Today (films showing) and next Wednesday (the week's new releases): two days keep the requests few.
function days() {
  const now = new Date(), today = isoDay(now);
  const wd = new Date(today + 'T12:00:00Z').getUTCDay();
  return [today, isoDay(new Date(now.getTime() + ((3 - wd + 7) % 7 || 7) * 864e5))];
}

// One cinema's films: Map of AlloCiné movie id → { movie, from }. Kept a few hours per cinema.
const programmes = new Map();
async function programme(ac) {
  const hit = programmes.get(ac);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  const dates = days();
  const films = new Map();
  await Promise.all(dates.map(async d => {
    const base = `https://www.allocine.fr/_/showtimes/theater-${ac}/d-${d}/`;
    const first = await getJson(base);
    const pages = [first];
    const total = Math.min(first.pagination?.totalPages || 1, MAX_PAGES);
    for (let p = 2; p <= total; p++) pages.push(await getJson(`${base}p-${p}/`));
    for (const r of pages.flatMap(p => p.results || [])) {
      const m = r.movie;
      if (!m?.internalId || !Object.values(r.showtimes || {}).some(v => v?.length)) continue;
      const f = films.get(m.internalId);
      if (!f) films.set(m.internalId, { movie: m, from: d });
      else if (d < f.from) f.from = d;
    }
  }));
  programmes.set(ac, { at: Date.now(), data: films });
  if (programmes.size > 800) programmes.delete(programmes.keys().next().value);
  return films;
}

const runtime = s => (s || '').replace(/(\d+)h (\d+)min/, (_, h, m) => `${h}h${m.padStart(2, '0')}`).replace(/^0h/, '') || undefined;

// → { C, CINEMAS, FILMS } in the shape of public/data.js.
export async function filmsAround({ lat, lon, radiusKm = 50, max = 12, log = () => {} }) {
  const near = cinemas().map(c => ({ ...c, km: distKmBetween(lat, lon, c.lat, c.lon) })).filter(c => c.km <= radiusKm).sort((a, b) => a.km - b.km);
  const withAc = near.filter(c => c.ac).slice(0, max);
  const others = near.filter(c => !c.ac && c.km <= (withAc.at(-1)?.km ?? radiusKm)).slice(0, 10);
  const C = {}, CINEMAS = {}, films = new Map();
  let failed = 0;
  await Promise.all([...withAc, ...others].map(async (cin, i) => {
    const cid = cin.ac ? 'ac' + cin.ac : 'cn' + i;
    C[cid] = { n: cin.city, lat: cin.lat, lon: cin.lon };
    CINEMAS[cid] = { n: cin.n, c: cid, url: cin.web || (cin.ac ? `https://www.allocine.fr/seance/salle_gen_csalle=${cin.ac}.html` : '') };
    if (!cin.ac) return;
    let prog;
    try { prog = await programme(cin.ac); } catch (e) { failed++; log('AlloCiné', cin.n, '→', e.message); return; }
    for (const [id, { movie: m, from }] of prog) {
      let f = films.get(id);
      if (!f) {
        const genres = (m.genres || []).map(g => g.translate).filter(Boolean);
        const kids = (m.genres || []).some(g => /ANIMATION|FAMILY/.test(g.tag || ''));
        f = {
          id: 'a' + id, t: m.title, g: genres[0] || 'Film', dur: runtime(m.runtime), kids: kids || undefined, age: kids ? 'En famille' : undefined,
          desc: cut(strip(m.synopsis || m.synopsisFull || ''), 320) || 'Synopsis à venir.',
          poster: m.poster?.url ? [m.poster.url, 'AlloCiné'] : undefined, src: 'AlloCiné', s: {}
        };
        films.set(id, f);
      }
      f.s[cid] = from;
    }
  }));
  log(`Cinémas : ${withAc.length} avec AlloCiné (${failed} sans réponse), ${others.length} sans, ${films.size} films`);
  return { C, CINEMAS, FILMS: [...films.values()], failed };
}
