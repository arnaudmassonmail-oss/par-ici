// Nightly collection for Par Ici: writes public/auto.js, merged by the page with the hand-made data.js.
// Sources: OpenAgenda (OPENAGENDA_KEY) and DATAtourisme (DATATOURISME_KEY), both free.
// Run: node scripts/auto-update.mjs   (Node 18+, no dependencies)
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HOME = { lat: 47.0603, lon: -1.2525 }; // Cugand
const RADIUS_KM = 50;
const DAYS = 31;
const TZ = 'Europe/Paris';
const OA_CDN = 'https://img.openagenda.com/main/';

const OA_KEY = process.env.OPENAGENDA_KEY || '';
const DT_KEY = process.env.DATATOURISME_KEY || '';
// Agendas found by name search; OPENAGENDA_AGENDAS can pin extra agenda UIDs (comma separated).
const OA_SEARCHES = (process.env.OPENAGENDA_SEARCHES || 'Terres de Montaigu,Clisson,Vignoble de Nantes,Cholet,Les Herbiers,Vendée,Loire-Atlantique,Nantes').split(',').map(s => s.trim()).filter(Boolean);
const OA_PINNED = (process.env.OPENAGENDA_AGENDAS || '').split(',').map(s => s.trim()).filter(Boolean);

// Everything logged also goes to scripts/last-run.log, committed so the run can be read back.
const LOG = [];
const log = (...a) => { console.log(...a); LOG.push(a.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')); };
// Agendas aimed at professionals, not outings.
const SKIP_AGENDA = /formation|orientation|chambre d.agriculture|pr[ée]vention|emploi|agri.mouv|entreprise/i;
// Titles that are not outings.
const SKIP_TITLE = /c.est quoi ton entreprise|job ?dating|recrutement|conseil municipal|r[ée]union publique|assembl[ée]e g[ée]n[ée]rale|formation professionnelle/i;
// Ongoing listings (a market "from 2018 to 2030") are not dated outings.
const MAX_SPAN_DAYS = 90;

// ---------- helpers ----------
const rad = x => x * Math.PI / 180;
function distKm(lat, lon) {
  const dLat = rad(lat - HOME.lat), dLon = rad(lon - HOME.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(HOME.lat)) * Math.cos(rad(lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const fr = v => (v && typeof v === 'object' ? (v.fr ?? v['@fr'] ?? Object.values(v)[0]) : v) || '';
const strip = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

const dayFmt = new Intl.DateTimeFormat('fr-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const isoDay = d => dayFmt.format(d); // YYYY-MM-DD in Paris time
const hm = d => timeFmt.format(d).replace(':', 'h');

const now = new Date();
const today = isoDay(now);
const horizon = isoDay(new Date(now.getTime() + DAYS * 864e5));

// Category from words in the title, keywords and description. Order matters.
const CAT_RULES = [
  ['cinema', /\b(cin[ée]ma|cin[ée]-|film|projection|court[s]?-m[ée]trage)/i],
  ['expo', /\b(expo\b|exposition|vernissage|mus[ée]e)/i],
  ['sport', /\b(course|trail|match|randonn[ée]e|rando\b|marche nordique|tournoi|cross\b|cyclo|v[ée]lo|football|foot\b|basket|handball|rugby|tennis|natation|sport)/i],
  ['marche', /\b(march[ée]|brocante|vide[- ]grenier|bourse|braderie|foire|salon|vide[- ]dressing|vide[- ]biblioth)/i],
  ['concert', /\b(concert|musique|musical|chorale|chant|jazz|rock|orchestre|fanfare|dj|r[ée]cital|festival)/i],
  ['expo', /\b(visite|patrimoine|galerie)/i],
  ['spectacle', /\b(th[ée][âa]tre|spectacle|conte|danse|cirque|humour|one[- ]man|marionnette|lecture|impro|cabaret|op[ée]ra)/i],
  ['famille', /./]
];
const KIDS_RE = /\b(enfant|famille|familial|jeune public|d[èe]s \d+ ans|ados?\b|b[ée]b[ée]|kids?|parent)/i;
const FREE_RE = /\b(gratuit|entr[ée]e libre|libre et gratuit|acc[èe]s libre)/i;
// The title decides first; keywords and description only when the title says nothing.
const categorize = (title, rest) => {
  const hit = CAT_RULES.slice(0, -1).find(([, re]) => re.test(title));
  return hit ? hit[0] : CAT_RULES.find(([, re]) => re.test(rest))[0];
};

// ---------- base data from the hand-made version ----------
function loadBase() {
  const code = fs.readFileSync(path.join(ROOT, 'public/data.js'), 'utf8');
  const ctx = {};
  vm.runInNewContext(code + '\n;Object.assign(this, { C, MARKETS, POSTERS: typeof POSTERS === "undefined" ? [] : POSTERS });', ctx);
  return ctx;
}

// ---------- normalised event ----------
// { title, desc, start: Date, end: Date, dates: ['YYYY-MM-DD'...], place, city, lat, lon, price, kids, url, source, words }
// DATAtourisme types, used only when the title and description say nothing.
const DT_TYPES = [['cinema', /ScreeningEvent/], ['concert', /Concert/], ['expo', /Exhibition|Visit/], ['marche', /Market|SaleEvent|Fair/], ['spectacle', /TheaterEvent|ShowEvent|Dance/], ['sport', /SportsCompetition|SportsEvent/]];
function toEvent(ev) {
  const text = `${ev.title} ${ev.words || ''} ${ev.desc}`;
  let cat = categorize(ev.title, `${ev.words || ''} ${ev.desc}`);
  if (cat === 'famille' && ev.types) cat = (DT_TYPES.find(([, re]) => re.test(ev.types)) || ['famille'])[0];
  return { ...ev, cat, kids: ev.kids ?? KIDS_RE.test(text) };
}

// ---------- OpenAgenda ----------
async function oaGet(url) {
  const res = await fetch(url, { headers: { key: OA_KEY, accept: 'application/json' } });
  if (!res.ok) throw new Error(`OpenAgenda ${res.status} ${url.replace(OA_KEY, '***')}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}
// OpenAgenda image: { base, filename, variants: [{ filename, type }] } or a plain URL.
let oaImageLogged = false;
function oaImage(e) {
  const im = e.image;
  if (!im) return {};
  if (!oaImageLogged) { oaImageLogged = true; log('OpenAgenda: exemple d\'image →', JSON.stringify({ image: im, imageCredits: e.imageCredits }).slice(0, 600)); }
  if (typeof im === 'string') return { img: im, imgL: im };
  const base = im.base || OA_CDN;
  const full = im.filename ? base + im.filename : '';
  const thumb = (im.variants || []).find(v => /thumb/i.test(v.type || ''))?.filename;
  return { img: thumb ? base + thumb : full, imgL: full, credit: strip(fr(e.imageCredits)) };
}

async function openAgenda() {
  if (!OA_KEY) { log('OpenAgenda: pas de clé OPENAGENDA_KEY, source ignorée.'); return []; }
  const agendas = new Map(OA_PINNED.map(uid => [uid, { uid, title: uid, slug: '' }]));
  for (const q of OA_SEARCHES) {
    try {
      const r = await oaGet(`https://api.openagenda.com/v2/agendas?search=${encodeURIComponent(q)}&size=10`);
      for (const a of r.agendas || []) if (!agendas.has(String(a.uid)) && !SKIP_AGENDA.test(a.title || '')) agendas.set(String(a.uid), { uid: String(a.uid), title: a.title, slug: a.slug });
    } catch (e) { log('  recherche', q, '→', e.message); }
  }
  log(`OpenAgenda: ${agendas.size} agendas candidats`);
  const out = [];
  for (const a of agendas.values()) {
    let after = null, kept = 0, seen = 0;
    for (let page = 0; page < 20; page++) {
      const u = new URL(`https://api.openagenda.com/v2/agendas/${a.uid}/events`);
      u.searchParams.set('size', '100');
      u.searchParams.set('detailed', '1');
      u.searchParams.set('timings[gte]', new Date(`${today}T00:00:00Z`).toISOString());
      u.searchParams.set('timings[lte]', new Date(`${horizon}T23:59:59Z`).toISOString());
      if (after) for (const v of [].concat(after)) u.searchParams.append('after[]', v);
      let r;
      try { r = await oaGet(u.toString()); } catch (e) { log('  agenda', a.title, '→', e.message); break; }
      for (const e of r.events || []) {
        seen++;
        const loc = e.location || {};
        if (typeof loc.latitude !== 'number' || distKm(loc.latitude, loc.longitude) > RADIUS_KM) continue;
        const timings = (e.timings || []).map(t => ({ b: new Date(t.begin || t.start), e: new Date(t.end || t.begin || t.start) }))
          .filter(t => isoDay(t.e) >= today && isoDay(t.b) <= horizon).sort((x, y) => x.b - y.b);
        if (!timings.length) continue;
        const kw = [].concat(fr(e.keywords) || []).join(' ');
        const age = e.age || {};
        out.push(toEvent({
          title: strip(fr(e.title)), desc: cut(strip(fr(e.description)) || strip(fr(e.longDescription)), 260),
          timings, place: loc.name || '', city: loc.city || '', lat: loc.latitude, lon: loc.longitude,
          price: strip(fr(e.conditions)), words: kw,
          kids: (typeof age.min === 'number' && age.min <= 12) || undefined,
          ...oaImage(e),
          url: `https://openagenda.com/${a.slug || 'agendas/' + a.uid}/events/${e.slug || e.uid}`,
          source: `OpenAgenda · ${strip(fr(a.title))}`
        }));
        kept++;
      }
      after = r.after;
      if (!after || !(r.events || []).length) break;
    }
    if (seen) log(`  ${a.title}: ${seen} événements lus, ${kept} à moins de ${RADIUS_KM} km`);
  }
  return out;
}

// ---------- DATAtourisme ----------
// The API answers JSON-LD-like objects; dates and places are read tolerantly.
function findAll(obj, keyRe, acc = [], depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 8) return acc;
  for (const [k, v] of Object.entries(obj)) {
    if (keyRe.test(k)) acc.push(v);
    if (v && typeof v === 'object') findAll(v, keyRe, acc, depth + 1);
  }
  return acc;
}
const first = (obj, re) => { const v = findAll(obj, re)[0]; return Array.isArray(v) ? v[0] : v; };
// DATAtourisme image: the first picture URL found under hasMainRepresentation.
let dtImageLogged = false;
function dtImage(it) {
  const rep = it.hasMainRepresentation || it.hasRepresentation;
  if (!rep) return {};
  if (!dtImageLogged) { dtImageLogged = true; log('DATAtourisme: exemple d\'image →', JSON.stringify(rep).slice(0, 800)); }
  const url = findAll(rep, /locator$/i).flat().map(String).find(u => /^https?:\/\/.+\.(jpe?g|png|webp)(\?|$)/i.test(u))
    || findAll(rep, /locator$/i).flat().map(String).find(u => /^https?:\/\//.test(u));
  if (!url) return {};
  return { img: url, imgL: url, credit: strip(fr(first(rep, /credits?$/i) || '')) };
}
async function dataTourisme() {
  if (!DT_KEY) { log('DATAtourisme: pas de clé DATATOURISME_KEY, source ignorée.'); return []; }
  const out = [];
  let noDate = 0;
  let url = `https://api.datatourisme.fr/v1/entertainmentAndEvent?geo_distance=${HOME.lat},${HOME.lon},${RADIUS_KM}km&page_size=100&lang=fr&fields=uuid,uri,label,type,isLocatedAt,takesPlaceAt,hasDescription,offers,hasMainRepresentation,hasRepresentation`;
  for (let page = 0; page < 30 && url; page++) {
    const res = await fetch(url, { headers: { 'X-API-Key': DT_KEY, accept: 'application/json' } });
    if (!res.ok) { log(`DATAtourisme ${res.status}: ${(await res.text()).slice(0, 500)}`); break; }
    log(`DATAtourisme page ${page + 1}: HTTP ${res.status}`);
    const body = await res.json();
    const items = body.objects || body.results || body.data || body['@graph'] || (Array.isArray(body) ? body : []);
    if (page === 0) log('DATAtourisme: clés de la réponse →', Object.keys(body).join(', '), '| exemple →', JSON.stringify(items[0] || body).slice(0, 2500));
    for (const it of items) {
      const starts = findAll(it, /^(schema:)?startDate$/).flat().map(String);
      const ends = findAll(it, /^(schema:)?endDate$/).flat().map(String);
      if (!starts.length) { noDate++; continue; }
      const pairs = starts.map((s, i) => ({ b: new Date(s.length === 10 ? `${s}T12:00:00Z` : s), e: new Date((ends[i] || s).length === 10 ? `${ends[i] || s}T12:00:00Z` : (ends[i] || s)) }))
        .filter(t => !isNaN(t.b) && isoDay(t.e) >= today && isoDay(t.b) <= horizon).sort((x, y) => x.b - y.b);
      if (!pairs.length) continue;
      const startTime = first(it, /^(schema:)?startTime$/), endTime = first(it, /^(schema:)?endTime$/);
      const lat = Number(first(it, /^(schema:)?latitude$/)), lon = Number(first(it, /^(schema:)?longitude$/));
      if (!lat || !lon || distKm(lat, lon) > RADIUS_KM) continue;
      const types = [].concat(it['@type'] || it.type || []).join(' ');
      out.push(toEvent({
        title: strip(fr(it.label || it['rdfs:label'] || it.name)),
        desc: cut(strip(fr(first(it, /^(dc:|rdfs:)?(shortDescription|description|comment)$/))), 260),
        timings: pairs, timeText: startTime ? String(startTime).slice(0, 5).replace(':', 'h') + (endTime ? ' – ' + String(endTime).slice(0, 5).replace(':', 'h') : '') : '',
        place: strip(fr(first(it, /^(schema:)?(name|legalName)$/) || '')).slice(0, 80),
        city: strip(fr(first(it, /^(schema:)?addressLocality$/) || '')), lat, lon,
        price: strip(fr(first(it, /^additionalInformation$/) || '')), types,
        ...dtImage(it),
        url: String(it.uri || it['@id'] || 'https://www.datatourisme.fr/'),
        source: 'DATAtourisme'
      }));
    }
    url = body.meta?.next || body.next || null;
  }
  log(`DATAtourisme: ${out.length} événements à moins de ${RADIUS_KM} km (${noDate} fiches sans date)`);
  return out;
}

// ---------- build data.js ----------
function build(events, base, posters) {
  const C = { ...base.C };
  const keyFor = (city, lat, lon) => {
    const k = slug(city || 'lieu');
    const known = Object.entries(C).find(([, c]) => slug(c.n) === k);
    if (known) return known[0];
    if (!C[k]) C[k] = { n: city || 'Lieu', lat: +lat.toFixed(4), lon: +lon.toFixed(4) };
    return k;
  };
  // Deduplicate across sources on title + first day.
  const seen = new Set();
  const EV = [], SRC = {};
  // A few separate dates become one card per date; many dates (an expo open daily) become one ranged card.
  const consecutive = t => t.length > 2 && t.every((x, i) => !i || (new Date(isoDay(x.b)) - new Date(isoDay(t[i - 1].b))) / 864e5 <= 1);
  const occurrences = events.flatMap(e => (e.timings.length <= 6 && !consecutive(e.timings)
    ? e.timings.map(t => ({ ...e, timings: [t], ranged: false }))
    : [{ ...e, ranged: true }]));
  for (const e of occurrences.sort((a, b) => isoDay(a.timings[0].b).localeCompare(isoDay(b.timings[0].b)))) {
    const id = slug(e.title).slice(0, 40) + isoDay(e.timings[0].b);
    if (!e.title || seen.has(id)) continue;
    seen.add(id);
    const s = 's' + EV.length;
    SRC[s] = [e.source, e.url];
    const t0 = e.timings[0];
    const d = isoDay(t0.b), to = isoDay(e.timings[e.timings.length - 1].e);
    const timed = isoDay(t0.b) === isoDay(t0.e) && hm(t0.b) !== '00h00';
    let h = e.timeText || (timed ? hm(t0.b) + (+t0.e > +t0.b ? ' – ' + hm(t0.e) : '') : 'Voir la fiche');
    if (e.ranged) h = `Plusieurs dates · ${h}`;
    const free = FREE_RE.test(e.price) || FREE_RE.test(e.desc);
    EV.push({
      cat: e.cat, t: cut(e.title, 90), c: keyFor(e.city, e.lat, e.lon), d, ...(to !== d ? { to } : {}),
      h, p: free ? 'Gratuit' : (e.price ? cut(e.price, 40) : 'Voir la fiche'), ...(e.kids ? { kids: true } : {}),
      place: e.place || e.city, desc: e.desc || 'Voir la fiche de l\'événement.', s,
      // OpenAgenda images share one CDN prefix; '~' keeps auto.js small, the page expands it.
      ...(e.img ? { img: e.img.replace(OA_CDN, '~') } : {}),
      ...(e.imgL && e.imgL !== e.img ? { imgL: e.imgL.replace(OA_CDN, '~') } : {}),
      ...(e.credit ? { credit: cut(e.credit, 80) } : {})
    });
  }
  // Only communes the hand-made data.js does not already know.
  const newC = Object.fromEntries(Object.entries(C).filter(([k]) => !base.C[k]));
  const js = `// Collecte automatique de Par Ici (OpenAgenda + DATAtourisme), générée chaque nuit par scripts/auto-update.mjs.
// Ne pas modifier à la main : la page la fusionne avec data.js, qui reste la partie manuelle.
const AUTO = ${JSON.stringify({ updated: today, C: newC, SRC, EV, POSTERS: posters })};
`;
  return { js, EV };
}

// DATAtourisme has shipped dates shifted by one day. Pair its events with OpenAgenda ones
// (similar title words, same place), measure the gap, and correct when most pairs agree.
const words = t => new Set(t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 3 && !/^(les|des|une|pour|avec|dans|sur|par|festival|concert|spectacle)$/.test(w)));
function similar(a, b) {
  const A = words(a.title), B = words(b.title);
  if (!A.size || !B.size) return false;
  let common = 0;
  for (const w of A) if (B.has(w)) common++;
  const near = 6371 * Math.hypot(rad(a.lat - b.lat), rad(a.lon - b.lon) * Math.cos(rad(a.lat))) < 3;
  return near && common / Math.min(A.size, B.size) >= 0.6;
}
const dayGap = (a, b) => Math.round((new Date(isoDay(a.timings[0].b)) - new Date(isoDay(b.timings[0].b))) / 864e5);
function fixDataTourismeShift(oa, dt) {
  const diffs = {};
  for (const e of dt) {
    const m = oa.find(o => Math.abs(dayGap(o, e)) <= 2 && similar(o, e));
    if (m) diffs[dayGap(m, e)] = (diffs[dayGap(m, e)] || 0) + 1;
  }
  log('DATAtourisme: écart de dates mesuré sur les événements communs →', JSON.stringify(diffs));
  const [shift, n] = Object.entries(diffs).sort((a, b) => b[1] - a[1])[0] || ['0', 0];
  const total = Object.values(diffs).reduce((a, b) => a + b, 0);
  if (+shift !== 0 && n >= 3 && n / total >= 0.6) {
    log(`DATAtourisme: dates corrigées de ${shift} jour(s)`);
    const ms = +shift * 864e5;
    for (const e of dt) e.timings = e.timings.map(t => ({ b: new Date(+t.b + ms), e: new Date(+t.e + ms) }));
  }
}

// Official posters: the preview image (og:image) declared by the event's official page.
async function resolvePosters(list) {
  const out = {};
  for (const p of list) {
    const key = p.page + (p.find ? '#' + p.find : '');
    try {
      const res = await fetch(p.page, { headers: { 'user-agent': 'Mozilla/5.0 (ParIciSorties; +https://par-ici.onrender.com)' } });
      const html = await res.text();
      const url = p.find ? imageNear(html, p.find) : previewImage(html);
      if (url) { out[key] = new URL(url.replace(/&amp;/g, '&'), p.page).href; log('Affiche', p.t, '→', out[key]); }
      else log('Affiche', p.t, '→ aucune image trouvée sur', p.page, `(HTTP ${res.status})`);
    } catch (e) { log('Affiche', p.t, '→', e.message); }
  }
  return out;
}
// The page's own preview image: og:image, then structured data, then the WordPress featured image.
function previewImage(html) {
  const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i)
    || html.match(/"image"\s*:\s*(?:\{[^}]*"url"\s*:\s*)?"(https?:[^"]+\.(?:jpe?g|png|webp))"/i)
    || html.match(/<img[^>]+class=["'][^"']*wp-post-image[^"']*["'][^>]*src=["']([^"']+)["']/i)
    || html.match(/<img[^>]+src=["']([^"']+)["'][^>]*class=["'][^"']*wp-post-image/i);
  return m && m[1];
}
// On a listing page (a town agenda), the event's image is the picture closest to its title.
// The title can appear several times in a card (link text, heading), before or after the image.
function imageNear(html, title) {
  const clean = html.replace(/&#0?39;|&rsquo;|&#8217;|’/g, "'").replace(/&amp;/g, '&');
  const norm = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const text = norm(clean), want = norm(title.replace(/’/g, "'"));
  const hits = [];
  for (let i = text.indexOf(want); i >= 0; i = text.indexOf(want, i + 1)) hits.push(i);
  if (!hits.length) return null;
  const pics = [...clean.matchAll(/(?:data-src|src)=["']([^"']+\.(?:jpe?g|png|webp)(?:\?[^"']*)?)["']|url\(["']?([^"')]+\.(?:jpe?g|png|webp))/gi)]
    .map(m => ({ url: m[1] || m[2], at: m.index }))
    .filter(p => !/logo|icon|sprite|picto|header/i.test(p.url));
  let best = null, bestGap = 2500;
  for (const p of pics) for (const h of hits) {
    const gap = Math.abs(p.at - h);
    if (gap < bestGap) { best = p.url; bestGap = gap; }
  }
  return best;
}

const base = loadBase();
const [oaRes, dtRes] = await Promise.allSettled([openAgenda(), dataTourisme()]);
[oaRes, dtRes].filter(r => r.status === 'rejected').forEach(r => log('Erreur :', r.reason?.message || r.reason));
const oaEvents = oaRes.status === 'fulfilled' ? oaRes.value : [];
const dtEvents = dtRes.status === 'fulfilled' ? dtRes.value : [];
fixDataTourismeShift(oaEvents, dtEvents);
// OpenAgenda first, so its version wins the deduplication.
// A DATAtourisme event OpenAgenda already lists on the same day is a duplicate.
const dtOnly = dtEvents.filter(e => !oaEvents.some(o => dayGap(o, e) === 0 && similar(o, e)));
log(`Doublons DATAtourisme retirés : ${dtEvents.length - dtOnly.length}`);
const events = [...oaEvents, ...dtOnly].filter(e => {
  const span = (e.timings[e.timings.length - 1].e - e.timings[0].b) / 864e5;
  return !SKIP_TITLE.test(e.title) && span <= MAX_SPAN_DAYS;
});
const posters = await resolvePosters(base.POSTERS);
const { js, EV } = build(events, base, posters);
fs.writeFileSync(path.join(ROOT, 'public/auto.js'), js);
log(`Terminé : ${EV.length} événements écrits dans public/auto.js (${today} → ${horizon}).`);
const byCat = {};
for (const e of EV) byCat[e.cat] = (byCat[e.cat] || 0) + 1;
log('Par catégorie :', JSON.stringify(byCat));
log(`Avec photo : ${EV.filter(e => e.img).length} sur ${EV.length}`);
fs.writeFileSync(path.join(ROOT, 'scripts/last-run.log'), LOG.join('\n') + '\n');
