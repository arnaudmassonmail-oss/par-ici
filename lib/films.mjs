// Films showing in the cinemas around a point, from AlloCiné's programme of each cinema.
// The cinemas come from lib/cinemas.json (built monthly by scripts/build-cinemas.mjs).
// AlloCiné publishes no official API: if it stops answering (or FILMS_SOURCE=tmdb), plan B is TMDB's free API,
// which knows the films showing in France but not which cinema shows them; the nearby cinemas are then
// listed with a link to their programme. Without a TMDB key, only those cinemas show.
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

// Plan B: films in French cinemas, from TMDB (free key in TMDB_KEY: an API key or a read access token).
// One national list, kept a few hours.
let tmdbCache = null;
async function tmdbFilms(key, log) {
  if (tmdbCache && Date.now() - tmdbCache.at < TTL_MS) return tmdbCache.data;
  const bearer = key.length > 40;
  const get = async (p, q = '') => {
    const r = await fetch(`https://api.themoviedb.org/3${p}?language=fr-FR${q}${bearer ? '' : '&api_key=' + key}`,
      { headers: bearer ? { authorization: 'Bearer ' + key, accept: 'application/json' } : { accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error('TMDB HTTP ' + r.status);
    return r.json();
  };
  const today = isoDay(new Date());
  const since = isoDay(new Date(Date.now() - 42 * 864e5)), until = isoDay(new Date(Date.now() + 7 * 864e5));
  const [genres, ...pages] = await Promise.all([
    get('/genre/movie/list'),
    ...[1, 2, 3].map(n => get('/discover/movie', `&region=FR&with_release_type=2|3&release_date.gte=${since}&release_date.lte=${until}&sort_by=popularity.desc&page=${n}`))
  ]);
  const gname = Object.fromEntries((genres.genres || []).map(g => [g.id, g.name]));
  const list = [...new Map(pages.flatMap(p => p.results || []).map(m => [m.id, m])).values()];
  // The French release date (the list's own date is the first release anywhere).
  const data = await Promise.all(list.map(async m => {
    let rel = m.release_date;
    try {
      const fr = (await get(`/movie/${m.id}/release_dates`)).results?.find(r => r.iso_3166_1 === 'FR');
      const d = (fr?.release_dates || []).filter(x => x.type === 2 || x.type === 3).map(x => x.release_date.slice(0, 10)).sort()[0];
      if (d) rel = d;
    } catch {}
    const kids = (m.genre_ids || []).some(g => g === 16 || g === 10751);
    return {
      id: 't' + m.id, t: m.title, g: gname[m.genre_ids?.[0]] || 'Film', kids: kids || undefined, age: kids ? 'En famille' : undefined,
      desc: cut(strip(m.overview || ''), 320) || 'Synopsis à venir.',
      poster: m.poster_path ? ['https://image.tmdb.org/t/p/w342' + m.poster_path, 'TMDB'] : undefined,
      src: 'TMDB', nat: rel || today, s: {}
    };
  }));
  const films = data.filter(f => f.nat >= since && f.nat <= until);
  log(`TMDB : ${films.length} films au cinéma en France`);
  tmdbCache = { at: Date.now(), data: films };
  return films;
}

const runtime = s => (s || '').replace(/(\d+)h (\d+)min/, (_, h, m) => `${h}h${m.padStart(2, '0')}`).replace(/^0h/, '') || undefined;

// → { C, CINEMAS, FILMS } in the shape of public/data.js.
export async function filmsAround({ lat, lon, radiusKm = 50, max = 12, source = 'allocine', tmdbKey = '', log = () => {} }) {
  const all = cinemas().map(c => ({ ...c, km: distKmBetween(lat, lon, c.lat, c.lon) })).filter(c => c.km <= radiusKm).sort((a, b) => a.km - b.km);
  // Plan B by choice: no AlloCiné at all, every nearby cinema with its programme link.
  const near = source === 'tmdb' ? all.map(c => ({ ...c, ac: '', acId: c.ac })) : all;
  const withAc = near.filter(c => c.ac).slice(0, max);
  const others = near.filter(c => !c.ac && c.km <= (withAc.at(-1)?.km ?? radiusKm)).slice(0, source === 'tmdb' ? max : 10);
  const C = {}, CINEMAS = {}, films = new Map();
  let failed = 0;
  await Promise.all([...withAc, ...others].map(async (cin, i) => {
    const cid = cin.ac ? 'ac' + cin.ac : 'cn' + i;
    C[cid] = { n: cin.city, lat: cin.lat, lon: cin.lon };
    CINEMAS[cid] = { n: cin.n, c: cid, url: cin.web || (cin.ac || cin.acId ? `https://www.allocine.fr/seance/salle_gen_csalle=${cin.ac || cin.acId}.html` : '') };
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
  // Plan B when AlloCiné gave nothing at all: the films showing in France, from TMDB.
  if (!films.size && (source === 'tmdb' || failed) && tmdbKey) {
    try { return { C, CINEMAS, FILMS: await tmdbFilms(tmdbKey, log), failed: source === 'tmdb' ? 0 : failed }; } catch (e) { log('TMDB →', e.message); }
  }
  return { C, CINEMAS, FILMS: [...films.values()], failed };
}
