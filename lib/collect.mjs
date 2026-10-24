// Collects outings around any point in France from OpenAgenda and DATAtourisme.
// Used by the nightly job (scripts/auto-update.mjs) and by the server (server/index.mjs).
export const TZ = 'Europe/Paris';
export const OA_CDN = 'https://img.openagenda.com/main/';

// Agendas aimed at professionals, not outings.
const SKIP_AGENDA = /formation|orientation|chambre d.agriculture|pr[ée]vention|emploi|agri.mouv|entreprise/i;
// Titles that are not outings.
const SKIP_TITLE = /c.est quoi ton entreprise|job ?dating|recrutement|conseil municipal|r[ée]union publique|assembl[ée]e g[ée]n[ée]rale|formation professionnelle/i;
// Ongoing listings (a market "from 2018 to 2030") are not dated outings.
const MAX_SPAN_DAYS = 90;

// ---------- helpers ----------
export const rad = x => x * Math.PI / 180;
export function distKmBetween(lat1, lon1, lat2, lon2) {
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
export const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
export const fr = v => (v && typeof v === 'object' ? (v.fr ?? v['@fr'] ?? Object.values(v)[0]) : v) || '';
export const strip = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
export const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

const dayFmt = new Intl.DateTimeFormat('fr-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
export const isoDay = d => dayFmt.format(d); // YYYY-MM-DD in Paris time
const hm = d => timeFmt.format(d).replace(':', 'h');
export function window(days) {
  const now = new Date();
  return { today: isoDay(now), horizon: isoDay(new Date(now.getTime() + days * 864e5)) };
}

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
// DATAtourisme types, used only when the title and description say nothing.
const DT_TYPES = [['cinema', /ScreeningEvent/], ['concert', /Concert/], ['expo', /Exhibition|Visit/], ['marche', /Market|SaleEvent|Fair/], ['spectacle', /TheaterEvent|ShowEvent|Dance/], ['sport', /SportsCompetition|SportsEvent/]];
function toEvent(ev) {
  const text = `${ev.title} ${ev.words || ''} ${ev.desc}`;
  let cat = categorize(ev.title, `${ev.words || ''} ${ev.desc}`);
  if (cat === 'famille' && ev.types) cat = (DT_TYPES.find(([, re]) => re.test(ev.types)) || ['famille'])[0];
  return { ...ev, cat, kids: ev.kids ?? KIDS_RE.test(text) };
}

export const words = t => new Set(t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 3 && !/^(les|des|une|pour|avec|dans|sur|par|festival|concert|spectacle)$/.test(w)));
function similar(a, b) {
  const A = words(a.title), B = words(b.title);
  if (!A.size || !B.size) return false;
  let common = 0;
  for (const w of A) if (B.has(w)) common++;
  const near = 6371 * Math.hypot(rad(a.lat - b.lat), rad(a.lon - b.lon) * Math.cos(rad(a.lat))) < 3;
  return near && common / Math.min(A.size, B.size) >= 0.6;
}
const dayGap = (a, b) => Math.round((new Date(isoDay(a.timings[0].b)) - new Date(isoDay(b.timings[0].b))) / 864e5);

// ---------- OpenAgenda ----------
// OpenAgenda image: { base, filename, variants: [{ filename, type }] } or a plain URL.
function oaImage(e) {
  const im = e.image;
  if (!im) return {};
  if (typeof im === 'string') return { img: im, imgL: im };
  const base = im.base || OA_CDN;
  const full = im.filename ? base + im.filename : '';
  const thumb = (im.variants || []).find(v => /thumb/i.test(v.type || ''))?.filename;
  return { img: thumb ? base + thumb : full, imgL: full, credit: strip(fr(e.imageCredits)) };
}

async function openAgenda(ctx, { searches = [], pinned = [], maxAgendas = 40, maxPages = 20 }) {
  const { key, log, lat, lon, radiusKm, today, horizon } = ctx;
  if (!key) { log('OpenAgenda: pas de clé OPENAGENDA_KEY, source ignorée.'); return []; }
  const get = async url => {
    const res = await fetch(url, { headers: { key, accept: 'application/json' } });
    if (!res.ok) throw new Error(`OpenAgenda ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  };
  const agendas = new Map(pinned.map(uid => [uid, { uid, title: uid, slug: '' }]));
  // Searches run together; results are kept in the order of the search terms (closest place first).
  const found = await Promise.all(searches.map(q => get(`https://api.openagenda.com/v2/agendas?search=${encodeURIComponent(q)}&size=10`)
    .then(r => r.agendas || []).catch(e => { log('  recherche', q, '→', e.message); return []; })));
  for (const a of found.flat()) if (!agendas.has(String(a.uid)) && !SKIP_AGENDA.test(a.title || '')) agendas.set(String(a.uid), { uid: String(a.uid), title: a.title, slug: a.slug });
  const list = [...agendas.values()].slice(0, maxAgendas);
  log(`OpenAgenda: ${list.length} agendas candidats`);
  const out = [];
  // Several agendas at a time keeps the server's answer quick without hammering the API.
  for (let i = 0; i < list.length; i += 8) {
    await Promise.all(list.slice(i, i + 8).map(async a => {
      let after = null, kept = 0, seen = 0;
      for (let page = 0; page < maxPages; page++) {
        const u = new URL(`https://api.openagenda.com/v2/agendas/${a.uid}/events`);
        u.searchParams.set('size', '100');
        u.searchParams.set('detailed', '1');
        u.searchParams.set('timings[gte]', new Date(`${today}T00:00:00Z`).toISOString());
        u.searchParams.set('timings[lte]', new Date(`${horizon}T23:59:59Z`).toISOString());
        if (after) for (const v of [].concat(after)) u.searchParams.append('after[]', v);
        let r;
        try { r = await get(u.toString()); } catch (e) { log('  agenda', a.title, '→', e.message); break; }
        for (const e of r.events || []) {
          seen++;
          const loc = e.location || {};
          if (typeof loc.latitude !== 'number' || distKmBetween(lat, lon, loc.latitude, loc.longitude) > radiusKm) continue;
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
        // A name search also finds far-away agendas: nothing nearby on the first page means none further on.
        if (!after || !(r.events || []).length || (page === 0 && !kept)) break;
      }
      if (seen) log(`  ${a.title}: ${seen} événements lus, ${kept} à moins de ${radiusKm} km`);
    }));
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
function dtImage(it) {
  const rep = it.hasMainRepresentation || it.hasRepresentation;
  if (!rep) return {};
  const url = findAll(rep, /locator$/i).flat().map(String).find(u => /^https?:\/\/.+\.(jpe?g|png|webp)(\?|$)/i.test(u))
    || findAll(rep, /locator$/i).flat().map(String).find(u => /^https?:\/\//.test(u));
  if (!url) return {};
  return { img: url, imgL: url, credit: strip(fr(first(rep, /credits?$/i) || '')) };
}
async function dataTourisme(ctx, { maxPages = 30 }) {
  const { key, log, lat, lon, radiusKm, today, horizon } = ctx;
  if (!key) { log('DATAtourisme: pas de clé DATATOURISME_KEY, source ignorée.'); return []; }
  const out = [];
  let noDate = 0;
  const first_url = `https://api.datatourisme.fr/v1/entertainmentAndEvent?geo_distance=${lat},${lon},${radiusKm}km&page_size=100&lang=fr&fields=uuid,uri,label,type,isLocatedAt,takesPlaceAt,hasDescription,offers,hasMainRepresentation,hasRepresentation`;
  const getPage = async url => {
    const res = await fetch(url, { headers: { 'X-API-Key': key, accept: 'application/json' } });
    if (!res.ok) { log(`DATAtourisme ${res.status}: ${(await res.text()).slice(0, 300)}`); return null; }
    const body = await res.json();
    return { items: body.objects || body.results || body.data || body['@graph'] || (Array.isArray(body) ? body : []), next: body.meta?.next || body.next || null };
  };
  // Page 1 tells how pages are numbered; the following pages are then read five at a time, which matters
  // in big towns (a dozen pages). Without a page number in the "next" link, pages are followed one by one.
  const pages = [];
  const p1 = await getPage(first_url);
  if (p1) {
    pages.push(p1.items);
    const numbered = p1.next && /[?&]page=\d+/.test(p1.next);
    if (numbered) {
      for (let n = 2; n <= maxPages; n += 5) {
        const batch = await Promise.all(Array.from({ length: Math.min(5, maxPages - n + 1) }, (_, i) => getPage(p1.next.replace(/([?&]page=)\d+/, `$1${n + i}`))));
        batch.forEach(b => b && pages.push(b.items));
        if (batch.some(b => !b || !b.items.length || !b.next)) break;
      }
    } else {
      for (let url = p1.next, n = 1; url && n < maxPages; n++) {
        const p = await getPage(url);
        if (!p) break;
        pages.push(p.items);
        url = p.next;
      }
    }
  }
  for (const items of pages) {
    for (const it of items) {
      const starts = findAll(it, /^(schema:)?startDate$/).flat().map(String);
      const ends = findAll(it, /^(schema:)?endDate$/).flat().map(String);
      if (!starts.length) { noDate++; continue; }
      const pairs = starts.map((s, i) => ({ b: new Date(s.length === 10 ? `${s}T12:00:00Z` : s), e: new Date((ends[i] || s).length === 10 ? `${ends[i] || s}T12:00:00Z` : (ends[i] || s)) }))
        .filter(t => !isNaN(t.b) && isoDay(t.e) >= today && isoDay(t.b) <= horizon).sort((x, y) => x.b - y.b);
      if (!pairs.length) continue;
      const startTime = first(it, /^(schema:)?startTime$/), endTime = first(it, /^(schema:)?endTime$/);
      const elat = Number(first(it, /^(schema:)?latitude$/)), elon = Number(first(it, /^(schema:)?longitude$/));
      if (!elat || !elon || distKmBetween(lat, lon, elat, elon) > radiusKm) continue;
      const types = [].concat(it['@type'] || it.type || []).join(' ');
      out.push(toEvent({
        title: strip(fr(it.label || it['rdfs:label'] || it.name)),
        desc: cut(strip(fr(first(it, /^(dc:|rdfs:)?(shortDescription|description|comment)$/))), 260),
        timings: pairs, timeText: startTime ? String(startTime).slice(0, 5).replace(':', 'h') + (endTime ? ' – ' + String(endTime).slice(0, 5).replace(':', 'h') : '') : '',
        place: strip(fr(first(it, /^(schema:)?(name|legalName)$/) || '')).slice(0, 80),
        city: strip(fr(first(it, /^(schema:)?addressLocality$/) || '')), lat: elat, lon: elon,
        price: strip(fr(first(it, /^additionalInformation$/) || '')), types,
        ...dtImage(it),
        url: String(it.uri || it['@id'] || 'https://www.datatourisme.fr/'),
        source: 'DATAtourisme'
      }));
    }
  }
  log(`DATAtourisme: ${out.length} événements à moins de ${radiusKm} km (${noDate} fiches sans date, ${pages.length} pages)`);
  return out;
}

// DATAtourisme has shipped dates shifted by one day. Pair its events with OpenAgenda ones
// (similar title words, same place), measure the gap, and correct when most pairs agree.
function fixDataTourismeShift(oa, dt, log) {
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

// Names that find the local OpenAgenda agendas: the commune, its intercommunality and those about 20 km
// around (a town's events are often in its neighbours' agendas), and the département (geo.api.gouv.fr, free).
export async function searchTermsAround(lat, lon) {
  const get = async (url, ms) => {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(ms) });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  };
  // Commune and département from the IGN Géoplateforme (the national geocoder, open to servers).
  // The nearest address carries its commune and "dept number, dept name, region" context.
  const rev = await get(`https://data.geopf.fr/geocodage/reverse?lon=${lon}&lat=${lat}&index=address&limit=1`, 6000);
  const props = rev?.features?.[0]?.properties || {};
  const commune = props.city || props.name || '';
  const departement = (props.context || '').split(',')[1]?.trim() || '';
  // The intercommunality, when geo.api.gouv.fr answers (it refuses some servers); agenda titles drop "CC" / "CA".
  const geo = await get(`https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&fields=epci&format=json`, 2500);
  const epci = (geo?.[0]?.epci?.nom || '').replace(/^(CC|CA|CU|Métropole)\s+(de la |de l'|du |des |de |d')?/i, '').replace(/\s*\(.*\)$/, '');
  return { commune, searches: [...new Set([commune, epci, departement].filter(Boolean))] };
}

// Everything around (lat, lon): both sources, date fix, duplicates removed.
export async function collectAround({ lat, lon, radiusKm = 50, days = 31, oaKey, dtKey, log = () => {}, oa = {}, dt = {} }) {
  const ctx = { lat, lon, radiusKm, log, ...window(days) };
  // DATAtourisme first: the towns where it finds outings name the local OpenAgenda agendas to look for
  // (oa.addTowns of them, the busiest first), which works in any region without a list of places.
  const dtEvents = await dataTourisme({ ...ctx, key: dtKey }, dt).catch(e => { log('Erreur :', e.message); return []; });
  let searches = oa.searches || [];
  if (oa.addTowns) {
    const count = {};
    for (const e of dtEvents) if (e.city) count[e.city] = (count[e.city] || 0) + 1;
    const towns = Object.entries(count).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    searches = [...new Set([...searches, ...towns])].slice(0, searches.length + oa.addTowns);
    log('OpenAgenda: recherches →', searches.join(' | '));
  }
  const oaEvents = await openAgenda({ ...ctx, key: oaKey }, { ...oa, searches }).catch(e => { log('Erreur :', e.message); return []; });
  fixDataTourismeShift(oaEvents, dtEvents, log);
  // OpenAgenda first, so its version wins: a DATAtourisme event OpenAgenda already lists on the same day is a duplicate.
  const dtOnly = dtEvents.filter(e => !oaEvents.some(o => dayGap(o, e) === 0 && similar(o, e)));
  log(`Doublons DATAtourisme retirés : ${dtEvents.length - dtOnly.length}`);
  return [...oaEvents, ...dtOnly].filter(e => {
    const span = (e.timings[e.timings.length - 1].e - e.timings[0].b) / 864e5;
    return !SKIP_TITLE.test(e.title) && span <= MAX_SPAN_DAYS;
  });
}

// The page's data shape: communes C, sources SRC, cards EV. knownC: communes the page already has.
export function toCards(events, knownC = {}) {
  const C = {};
  const keyFor = (city, lat, lon) => {
    const k = slug(city || 'lieu') || 'lieu';
    const known = Object.entries(knownC).find(([, c]) => slug(c.n) === k);
    if (known) return known[0];
    if (!C[k]) C[k] = { n: city || 'Lieu', lat: +lat.toFixed(4), lon: +lon.toFixed(4) };
    return k;
  };
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
      // OpenAgenda images share one CDN prefix; '~' keeps the data small, the page expands it.
      ...(e.img ? { img: e.img.replace(OA_CDN, '~') } : {}),
      ...(e.imgL && e.imgL !== e.img ? { imgL: e.imgL.replace(OA_CDN, '~') } : {}),
      ...(e.credit ? { credit: cut(e.credit, 80) } : {})
    });
  }
  return { C, SRC, EV };
}

// ---------- images on web pages ----------
export const SKIP_IMG = /logo|icon|favicon|sprite|picto|placeholder|default|header|banner|avatar/i;
// The page's own preview image: og:image, then structured data, then the WordPress featured image.
export function previewImage(html) {
  const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i)
    || html.match(/"image"\s*:\s*(?:\{[^}]*"url"\s*:\s*)?"(https?:[^"]+\.(?:jpe?g|png|webp))"/i)
    || html.match(/<img[^>]+class=["'][^"']*wp-post-image[^"']*["'][^>]*src=["']([^"']+)["']/i)
    || html.match(/<img[^>]+src=["']([^"']+)["'][^>]*class=["'][^"']*wp-post-image/i);
  return m && m[1];
}
// On a listing page (a town agenda), the event's image is the picture closest to its title.
// The title can appear several times in a card (link text, heading), before or after the image.
// `accept(textAfterTitle)` can reject some occurrences (e.g. a search result from another year).
export function imageNear(html, title, accept = () => true) {
  const clean = html.replace(/&#0?39;|&rsquo;|&#8217;|’/g, "'").replace(/&amp;/g, '&');
  const norm = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const text = norm(clean), want = norm(title.replace(/’/g, "'"));
  const hits = [];
  for (let i = text.indexOf(want); i >= 0; i = text.indexOf(want, i + 1)) if (accept(text.slice(i, i + 1500))) hits.push(i);
  if (!hits.length) return null;
  // Lazy-loading sites put a "loading" picture in src and the real one in data-src / data-original.
  const pics = [...clean.matchAll(/(?:data-src|data-original|data-lazy-src|data-lazy|src)=["']([^"'\s]+\.(?:jpe?g|png|webp)(?:\?[^"'\s]*)?)[^"']*["']|url\(["']?([^"')]+\.(?:jpe?g|png|webp))/gi)]
    .map(m => ({ url: m[1] || m[2], at: m.index }))
    .filter(p => !/logo|icon|sprite|picto|header|chargement|loading|lazy|blank|spacer|pixel|transparent/i.test(p.url));
  let best = null, bestGap = 2500;
  for (const p of pics) for (const h of hits) {
    const gap = Math.abs(p.at - h);
    if (gap < bestGap) { best = p.url; bestGap = gap; }
  }
  return best;
}
