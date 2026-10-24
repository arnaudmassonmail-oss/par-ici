// Nightly collection for Par Ici: writes public/auto.js, merged by the page with the hand-made data.js.
// It covers the area around Cugand (the hand-made part's home) and the images of hand-made events and films;
// any other place in France is collected on demand by server/index.mjs.
// Sources: OpenAgenda (OPENAGENDA_KEY) and DATAtourisme (DATATOURISME_KEY), both free.
// Run: node scripts/auto-update.mjs   (Node 18+, no dependencies)
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { collectAround, toCards, window, words, previewImage, imageNear, SKIP_IMG } from '../lib/collect.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HOME = { lat: 47.0603, lon: -1.2525 }; // Cugand
const RADIUS_KM = 50;
const DAYS = 31;
const UA = { 'user-agent': 'Mozilla/5.0 (ParIciSorties; +https://par-ici.onrender.com)' };

// Agendas found by name search; OPENAGENDA_AGENDAS can pin extra agenda UIDs (comma separated).
const OA_SEARCHES = (process.env.OPENAGENDA_SEARCHES || 'Terres de Montaigu,Clisson,Vignoble de Nantes,Cholet,Les Herbiers,Vendée,Loire-Atlantique,Nantes').split(',').map(s => s.trim()).filter(Boolean);
const OA_PINNED = (process.env.OPENAGENDA_AGENDAS || '').split(',').map(s => s.trim()).filter(Boolean);

// Everything logged also goes to scripts/last-run.log, committed so the run can be read back.
const LOG = [];
const log = (...a) => { console.log(...a); LOG.push(a.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')); };
const { today, horizon } = window(DAYS);

// ---------- base data from the hand-made version ----------
function loadBase() {
  const code = fs.readFileSync(path.join(ROOT, 'public/data.js'), 'utf8');
  const ctx = {};
  vm.runInNewContext(code + '\n;Object.assign(this, { C, SRC, EV, MARKETS, CINEMAS, FILMS, POSTERS: typeof POSTERS === "undefined" ? [] : POSTERS });', ctx);
  return ctx;
}

// Official posters: the preview image (og:image) declared by the event's official page.
async function resolvePosters(list) {
  const out = {};
  for (const p of list.filter(p => p.page)) {
    const key = p.page + (p.find ? '#' + p.find : '');
    try {
      const res = await fetch(p.page, { headers: UA });
      const html = await res.text();
      const url = p.find ? imageNear(html, p.find) : previewImage(html);
      if (url) { out[key] = new URL(url.replace(/&amp;/g, '&'), p.page).href; log('Affiche', p.t, '→', out[key]); }
      else log('Affiche', p.t, '→ aucune image trouvée sur', p.page, `(HTTP ${res.status})`);
    } catch (e) { log('Affiche', p.t, '→', e.message); }
  }
  return out;
}

// The image each hand-made event's source page shows for it. On a listing (a town agenda) it is
// the picture next to the event's title; on a page about the event, the page's preview image.
async function sourceImages(base) {
  const pages = new Map();
  const out = {};
  let found = 0;
  for (const e of base.EV) {
    const src = base.SRC[e.s];
    if (!src) continue;
    const url = src[1];
    if (!pages.has(url)) pages.set(url, fetch(url, { headers: UA }).then(r => (r.ok ? r.text() : '')).catch(() => ''));
    const html = await pages.get(url);
    if (!html) continue;
    const pageTitle = (html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || html.match(/<title>([^<]+)<\/title>/i) || [])[1] || '';
    const A = words(e.t), B = words(pageTitle);
    let n = 0;
    for (const w of A) if (B.has(w)) n++;
    const img = (A.size && n / A.size >= 0.6 && previewImage(html)) || imageNear(html, e.t);
    // JDS puts generic stock pictures on its listings; "ad-…" files are advertisements.
    if (img && !SKIP_IMG.test(img) && !/(^|\/)ad[-_]|advert|publicite/i.test(img) && !/(^|\.)jds\.fr$/.test(new URL(url).hostname)) { out[e.t + '|' + e.d] = new URL(img.replace(/&amp;/g, '&'), url).href; found++; }
  }
  log(`Images des sources manuelles : ${found} sur ${base.EV.length} sorties (${pages.size} pages lues)`);
  return out;
}

// Film posters, as shown next to each title on the cinema's own pages; AlloCiné search otherwise.
async function filmPosters(base) {
  const out = {};
  for (const [cid, cin] of Object.entries(base.CINEMAS || {})) {
    for (const url of cin.pages || []) {
      let html = '';
      try { const r = await fetch(url, { headers: UA }); html = r.ok ? await r.text() : ''; } catch {}
      if (!html) { log('Cinéma', cin.n, '→ page illisible', url); continue; }
      for (const f of base.FILMS.filter(f => f.s[cid] && !out[f.id])) {
        const img = imageNear(html, f.t);
        if (img && !SKIP_IMG.test(img)) out[f.id] = [new URL(img.replace(/&amp;/g, '&'), url).href, cin.n];
      }
    }
  }
  // Keep only an AlloCiné result from this year, so an older film with the same title is not picked.
  const year = today.slice(0, 4);
  for (const f of base.FILMS.filter(f => !out[f.id])) {
    const url = `https://www.allocine.fr/rechercher/movie/?q=${encodeURIComponent(f.t)}`;
    try {
      const r = await fetch(url, { headers: { ...UA, 'accept-language': 'fr-FR' } });
      const html = r.ok ? await r.text() : '';
      const img = html && imageNear(html, f.t, after => after.includes(year));
      if (img && !SKIP_IMG.test(img)) out[f.id] = [new URL(img, url).href, 'AlloCiné'];
      else log('Affiche de film introuvable :', f.t, `(AlloCiné HTTP ${r.status})`);
    } catch (e) { log('Affiche de film', f.t, '→', e.message); }
  }
  log(`Affiches de films : ${Object.keys(out).length} sur ${base.FILMS.length}`);
  return out;
}

const base = loadBase();
const events = await collectAround({
  ...HOME, radiusKm: RADIUS_KM, days: DAYS, log,
  oaKey: process.env.OPENAGENDA_KEY || '', dtKey: process.env.DATATOURISME_KEY || '',
  oa: { searches: OA_SEARCHES, pinned: OA_PINNED, maxAgendas: 80 }
});
const { C, SRC, EV } = toCards(events, base.C);
const AUTO = {
  updated: today, C, SRC, EV,
  POSTERS: await resolvePosters(base.POSTERS),
  SRCIMG: await sourceImages(base),
  FILMIMG: await filmPosters(base)
};
fs.writeFileSync(path.join(ROOT, 'public/auto.js'), `// Collecte automatique de Par Ici (OpenAgenda + DATAtourisme), générée chaque nuit par scripts/auto-update.mjs.
// Ne pas modifier à la main : la page la fusionne avec data.js, qui reste la partie manuelle.
const AUTO = ${JSON.stringify(AUTO)};
`);
log(`Terminé : ${EV.length} événements écrits dans public/auto.js (${today} → ${horizon}).`);
const byCat = {};
for (const e of EV) byCat[e.cat] = (byCat[e.cat] || 0) + 1;
log('Par catégorie :', JSON.stringify(byCat));
log(`Avec photo : ${EV.filter(e => e.img).length} sur ${EV.length}`);
fs.writeFileSync(path.join(ROOT, 'scripts/last-run.log'), LOG.join('\n') + '\n');
