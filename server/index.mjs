// Par Ici server: serves the app (public/) and finds outings around any point in France.
//   GET /api/events?lat=47.06&lon=-1.25  →  { updated, place, C, SRC, EV, CINEMAS, FILMS } (shapes of public/auto.js and data.js)
// Keys come from the environment (OPENAGENDA_KEY, DATATOURISME_KEY) and never reach the browser.
// Run: node server/index.mjs   (Node 18+, no dependencies)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { collectAround, toCards, window, searchTermsAround } from '../lib/collect.mjs';
import { filmsAround } from '../lib/films.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT) || 3000;
const OA_KEY = process.env.OPENAGENDA_KEY || '';
const DT_KEY = process.env.DATATOURISME_KEY || '';
const RADIUS_KM = 50;
const DAYS = 31;
const TTL_MS = 6 * 3600e3;

// Answers are cached per ~10 km square, so neighbours and repeat visits are instant.
const cache = new Map();
const cellOf = (lat, lon) => `${lat.toFixed(1)},${lon.toFixed(1)}`;

async function eventsAround(lat, lon) {
  const key = cellOf(lat, lon);
  const hit = cache.get(key);
  if (hit && (hit.pending || Date.now() - hit.at < TTL_MS)) return hit.pending || hit.data;
  const [clat, clon] = key.split(',').map(Number);
  const pending = (async () => {
    const t0 = Date.now();
    let peak = 0;
    const watch = setInterval(() => { peak = Math.max(peak, process.memoryUsage().rss); }, 200);
    let commune, searches, events;
    // Films come from another source: they are looked up meanwhile, and never hold up or break the outings.
    const films = filmsAround({ lat: clat, lon: clon, radiusKm: RADIUS_KM, log: console.log })
      .catch(e => { console.error('Films :', e.message); return { C: {}, CINEMAS: {}, FILMS: [], failed: 1 }; });
    try {
      ({ commune, searches } = await searchTermsAround(clat, clon));
      events = await collectAround({
        lat: clat, lon: clon, radiusKm: RADIUS_KM, days: DAYS, oaKey: OA_KEY, dtKey: DT_KEY,
        oa: { searches, addTowns: 8, maxAgendas: 40, maxPages: 3 }, dt: { maxPages: 15 }
      });
    } finally { clearInterval(watch); }
    const cards = toCards(events), cine = await films;
    const data = { updated: window(DAYS).today, place: commune, ...cards, C: { ...cine.C, ...cards.C }, CINEMAS: cine.CINEMAS, FILMS: cine.FILMS };
    console.log(`${key} (${commune || '?'}) : ${data.EV.length} sorties et ${data.FILMS.length} films en ${Math.round((Date.now() - t0) / 1000)} s, mémoire max ${Math.round(peak / 1e6)} Mo`);
    // When some cinemas did not answer, the zone is asked again sooner.
    cache.set(key, { at: Date.now() - (cine.failed ? TTL_MS - 20 * 60e3 : 0), data });
    return data;
  })();
  cache.set(key, { pending });
  try { return await pending; } catch (e) { cache.delete(key); throw e; }
}

// A stray error in one collection must not take the whole service down.
process.on('unhandledRejection', e => console.error('Erreur non rattrapée :', e));
process.on('uncaughtException', e => console.error('Exception non rattrapée :', e));

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/events') {
    const lat = Number(url.searchParams.get('lat')), lon = Number(url.searchParams.get('lon'));
    // Metropolitan France and Corsica.
    if (!(lat > 41 && lat < 51.5 && lon > -5.5 && lon < 10)) {
      res.writeHead(400, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Position hors de France métropolitaine.' }));
    }
    try {
      const data = await eventsAround(lat, lon);
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' });
      res.end(JSON.stringify(data));
    } catch (e) {
      console.error(e);
      res.writeHead(502, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Les agendas ne répondent pas pour le moment.' }));
    }
    return;
  }
  // Static files from public/, never outside it.
  const file = path.join(PUBLIC, path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));
  const target = file.endsWith(path.sep) || url.pathname === '/' ? path.join(PUBLIC, 'index.html') : file;
  if (!target.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(target, (err, body) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Page introuvable'); }
    const type = TYPES[path.extname(target)] || 'application/octet-stream';
    const noCache = /\/(data|auto)\.js$|index\.html$/.test(target);
    res.writeHead(200, { 'content-type': type, 'cache-control': noCache ? 'no-cache' : 'public, max-age=86400' });
    res.end(body);
  });
}).listen(PORT, () => console.log(`Par Ici sur http://localhost:${PORT}`));
