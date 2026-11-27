// Town-hall agendas around Cugand that no open source (OpenAgenda, DATAtourisme) carries in full.
// Each site is read like a visitor reads it: the list of events, then each event's own page.
//   Terres de Montaigu (Montaigu-Vendée, Cugand-la-Bernardière, La Bruffière… one shared agenda)
//   Boussay, Gorges, Gétigné
// Clisson shows its agenda through the IntraMuros widget, whose data service refuses robots: not read.
// Returns events in the shape collectAround() gives (title, timings, place, city, lat, lon…), before toEvent().
import { TZ, isoDay, strip, cut, distKmBetween } from './collect.mjs';

const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const MAX_SPAN_DAYS = 90;
// Notices that are not outings.
const NOT_OUTING = /inscriptions? scolaires?|broyage|eau potable|restrictions? d.eau|don du sang|conseil municipal|permanence|enqu[êe]te publique|recensement|portes ouvertes (du |de l.|des )?(coll[èe]ge|lyc[ée]e|[ée]cole)|sensibilisation aux violences|collecte des d[ée]chets|^fermeture|^annul[ée]/i;

const ENT = { amp: '&', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', laquo: '«', raquo: '»', euro: '€', deg: '°',
  agrave: 'à', acirc: 'â', eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', icirc: 'î', iuml: 'ï', ocirc: 'ô', ucirc: 'û', ugrave: 'ù', ccedil: 'ç', oelig: 'œ',
  Agrave: 'À', Eacute: 'É', Egrave: 'È', Ecirc: 'Ê', Ccedil: 'Ç' };
const decode = s => String(s || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, k) => k[0] === '#'
  ? String.fromCodePoint(k[1].toLowerCase() === 'x' ? parseInt(k.slice(2), 16) : +k.slice(1))
  : ENT[k] ?? m);
const text = h => decode(strip(String(h || '').replace(/<br\s*\/?>|<\/p>|<\/li>/gi, ' \n ')));
const attr = (h, re) => decode((h.match(re) || [])[1] || '');
const ogImage = h => attr(h, /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);

async function get(url, log) {
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
    if (!r.ok) { if (r.status !== 404) log('  Mairies :', url, '→ HTTP', r.status); return ''; }
    return await r.text();
  } catch (e) { log('  Mairies :', url, '→', e.message); return ''; }
}
async function pool(items, n, fn) {
  const out = [];
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i]); } }));
  return out;
}

// ---------- dates and times ----------
const MONTHS = [['janv', 1], ['fevr', 2], ['mars', 3], ['avr', 4], ['mai', 5], ['juin', 6], ['juil', 7], ['aout', 8], ['sept', 9], ['oct', 10], ['nov', 11], ['dec', 12]];
const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const monthOf = w => (MONTHS.find(([p]) => plain(w).startsWith(p)) || [])[1];
const MONTH_RE = '(janv\\w*|f[ée]vr\\w*|mars|avr\\w*|mai|juin|juil\\w*|ao[uû]t|sept\\w*|oct\\w*|nov\\w*|d[ée]c\\w*)\\.?';
const DATE_RE = new RegExp(`\\b(\\d{1,2})(?:er)?\\s+${MONTH_RE}\\s+(20\\d\\d)\\b`, 'gi');
const pad = n => String(n).padStart(2, '0');
// Every "21 novembre 2026" in a text, as YYYY-MM-DD.
const datesIn = s => [...String(s).matchAll(DATE_RE)].map(m => `${m[3]}-${pad(monthOf(m[2]))}-${pad(m[1])}`);
// Same, where a date may leave out its year ("Du 05 décembre au 12 décembre 2026"): it takes the next year written.
const LOOSE_RE = new RegExp(`\\b(\\d{1,2})(?:er)?\\s+${MONTH_RE}(?:\\s+(20\\d\\d))?\\b`, 'gi');
function datesLoose(s) {
  const found = [...String(s).matchAll(LOOSE_RE)].map(m => ({ d: +m[1], mo: monthOf(m[2]), y: m[3] }));
  return found.map((f, i) => {
    const y = f.y || found.slice(i + 1).find(g => g.y)?.y || String(new Date().getFullYear());
    return `${y}-${pad(f.mo)}-${pad(f.d)}`;
  }).filter(d => !d.includes('undefined'));
}
const addDays = (day, n) => { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
// A wall-clock time in Paris as a Date.
function parisDate(day, hm = '00:00') {
  const guess = new Date(`${day}T${hm}:00Z`);
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(guess).map(x => [x.type, x.value]));
  const seen = Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute);
  return new Date(guess - (seen - guess));
}
// "18h", "18h30", "18 h 30", "18:30", optionally "à 22h" — minutes never taken from the next time ("22h 18h").
const TIME_RE = /(?:^|[^\d])([01]?\d|2[0-3])\s*(?:h|:)(?:\s?([0-5]\d)(?![\d:]|\s*h))?(?:\s*(?:à|-|–|jusqu.à)\s*([01]?\d|2[0-3])\s*(?:h|:)(?:\s?([0-5]\d)(?![\d:]|\s*h))?)?/i;
const hhmm = (h, m) => `${pad(h)}:${m || '00'}`;
// The hours written just after a day's mention ("Samedi 5 décembre : de 18h à 22h"), if any.
function hoursAfter(s, day) {
  const [, mo, d] = day.split('-').map(Number);
  const name = MONTHS.find(([, n]) => n === mo)[0].replace('fevr', 'f[ée]vr').replace('aout', 'ao[uû]t').replace('dec', 'd[ée]c');
  // The first mention followed closely by hours: the heading's dates often come before the programme's.
  for (const at of [...String(s).matchAll(new RegExp(`\\b0?${d}(?:er)?\\s+${name}\\S*(\\s+20\\d\\d)?`, 'gi'))]) {
    // Only up to the next date, so a day never takes the hours written for the following one.
    const near = String(s).slice(at.index + at[0].length, at.index + at[0].length + 80);
    const next = near.search(LOOSE_RE);
    const m = (next >= 0 ? near.slice(0, next) : near).match(TIME_RE);
    if (m) return { start: hhmm(m[1], m[2]), end: m[3] ? hhmm(m[3], m[4]) : null };
  }
  return null;
}
// The only time a short text gives ("…à 10h30"), when it names no day: a single distinct time is the event's.
function onlyTime(s) {
  const all = [...String(s).matchAll(new RegExp(TIME_RE.source, 'gi'))].map(m => hhmm(m[1], m[2]) + (m[3] ? '-' + hhmm(m[3], m[4]) : ''));
  if (new Set(all).size !== 1) return null;
  const [start, end] = all[0].split('-');
  return { start, end: end || null };
}
// One timing per day, with its hours when known.
function timingsFor(days, s, given) {
  return days.map(day => {
    const t = given || hoursAfter(s, day) || (days.length === 1 ? onlyTime(s) : null);
    return t ? { b: parisDate(day, t.start), e: parisDate(day, t.end || t.start) } : { b: parisDate(day, '00:00'), e: parisDate(day, '23:59') };
  });
}
// The price as the page states it ("Tarifs : 3 € la carte…", "Entrée : 8 euros"), else "gratuit" / "entrée libre".
// A bare amount is not taken: it is as often a prize or a donation as a price.
function priceIn(s) {
  // (No \b before the keyword: in these regular expressions "É" does not count as a letter.)
  const m = String(s).match(/(?:^|[^A-Za-zÀ-ÿ])(?:[Tt]arifs?|[Pp]rix d.entr[ée]e|[EÉeé]ntr[ée]e(?: sur place)?)\s*:\s*(.{2,70}?)(?=\s+[A-ZÉ][a-zé]+\s|$)/)
    || String(s).match(/(gratuit|entr[ée]e libre)/i);
  return m ? m[1].trim() : '';
}
// A venue named in the text: a place word followed by its proper name ("Église Sainte Radegonde", "Espace Bellevue").
const PLACE_RE = /\b((?:[ÉE]glise|Espace|Salle|Biblioth[èe]que|M[ée]diath[èe]que|Complexe|Auditorium|Place|Th[ée][âa]tre|Halles?|Parc|Gymnase|R[ée]sidence)(?:\s+(?:de|du|des|la|le|l[’']|d[’']|[A-ZÉÈÀ][\wÀ-ÿ’'-]*|\d+))*)/;
const PLACE_TAIL = /\s+(?:de|du|des|la|le|l[’']|d[’']|Entr[ée]e|Tout|Tous|Gratuit|Ouvert|R[ée]servations?|Billetterie|Infos?|Plus|À|A|Le|La|Les|Du|De|Pour|Sur)$/;
function placeIn(s) {
  let p = (String(s).match(PLACE_RE) || [])[1] || '';
  for (let before = ''; before !== p;) { before = p; p = p.replace(PLACE_TAIL, ''); }
  return p.trim();
}
// The communes of Terres de Montaigu, so "85600 Montaigu-Vendée Montaigu" reads "Montaigu-Vendée".
const TDM_TOWNS = ['Montaigu-Vendée', 'Cugand-la-Bernardière', 'La Bruffière', 'Treize-Septiers', 'La Boissière-de-Montaigu', "L'Herbergement", 'Rocheservière', 'Saint-Philbert-de-Bouaine', 'Montréverd'];
function townOf(s) {
  const p = plain(s).replace(/[’']/g, "'");
  const known = TDM_TOWNS.find(t => p.includes(plain(t)));
  if (known) return known;
  const w = s.trim().split(/\s+/);
  for (let i = 1; i < w.length; i++) if (plain(w.slice(0, i).join(' ')) === plain(w.slice(i).join(' '))) return w.slice(i).join(' ');
  return s.trim();
}

// An event from a town's page: days, text to find hours, place and price in.
function event({ title, days, body, given, place, city, lat, lon, img, url, source, desc }) {
  if (!title || !days.length || NOT_OUTING.test(title)) return null;
  const span = (new Date(days[days.length - 1]) - new Date(days[0])) / 864e5;
  if (span > MAX_SPAN_DAYS) return null;
  const timings = span > 7 ? [{ b: parisDate(days[0]), e: parisDate(days[days.length - 1], '23:59') }] : timingsFor(days, body, given);
  return {
    title: cut(title, 120), desc: cut(desc || body.replace(/\s+/g, ' ').trim(), 260), timings,
    place: place || placeIn(body) || city, city, lat, lon,
    price: priceIn(body), img: img || undefined, imgL: img || undefined, url, source
  };
}
const daysBetween = (a, b) => { const out = []; for (let d = a; d <= b && out.length < 400; d = addDays(d, 1)) out.push(d); return out; };

// ---------- Terres de Montaigu (WordPress, events imported from its OpenAgenda) ----------
async function terresDeMontaigu(log) {
  const base = 'https://www.terresdemontaigu.fr/agenda/';
  const links = new Set();
  for (let p = 1; p <= 15; p++) {
    const h = await get(p === 1 ? base : `${base}page/${p}/`, log);
    const found = [...h.matchAll(/href="(https:\/\/www\.terresdemontaigu\.fr\/evenement\/[^"]+)"[^>]*class="thumbnail thumbnail-event/g)].map(m => m[1]);
    if (!found.length) break;
    found.forEach(u => links.add(u));
  }
  const events = await pool([...links], 4, async url => {
    const h = await get(url, log);
    if (!h) return null;
    const title = text(attr(h, /<h1 class="article-title">([\s\S]*?)<\/h1>/));
    // "Le samedi 21 novembre 2026 de 20:30 à 23:59", one line per date.
    const dates = h.slice(h.indexOf('panel-title">Dates'), h.indexOf('panel-title">Dates') + 20000);
    const lines = h.includes('panel-title">Dates') ? [...dates.matchAll(/list-group-item">\s*([^<]+)/g)].map(m => decode(m[1]).trim()) : [];
    let timings = lines.map(l => {
      const day = datesIn(l)[0];
      const t = l.match(/(\d{2}):(\d{2}) à (\d{2}):(\d{2})/);
      return day && (t ? { b: parisDate(day, `${t[1]}:${t[2]}`), e: parisDate(day, `${t[3]}:${t[4]}`) } : { b: parisDate(day), e: parisDate(day, '23:59') });
    }).filter(Boolean);
    if (!timings.length) {
      const head = text(attr(h, /<div class="article-date">([\s\S]*?)<\/div>/));
      const ds = datesIn(head);
      if (!ds.length) return null;
      timings = [{ b: parisDate(ds[0]), e: parisDate(ds[ds.length - 1], '23:59') }];
    }
    const loc = h.slice(h.indexOf('panel-title">Localisation'));
    const where = attr(loc, /<p class="strong[^"]*">([\s\S]*?)<\/p>/).split(/<br\s*\/?>/i).map(text);
    const lat = +attr(loc, /data-lat="([^"]+)"/), lon = +attr(loc, /data-lng="([^"]+)"/);
    const city = townOf(((where[1] || '').match(/\d{5}\s+(.+)$/) || [])[1] || where[1] || 'Montaigu-Vendée');
    const content = h.slice(h.indexOf('<div class="article-content">'), h.indexOf('<div class="panel panel-article'));
    const body = text(content);
    return {
      title, desc: cut(body.replace(/\s+/g, ' ').trim(), 260), timings, place: where[0] || city, city,
      lat: lat || undefined, lon: lon || undefined, price: priceIn(body),
      img: ogImage(h) || undefined, imgL: ogImage(h) || undefined, url, source: 'Agenda Terres de Montaigu'
    };
  });
  return events.filter(e => e && e.lat && !NOT_OUTING.test(e.title));
}

// ---------- Boussay (WordPress) ----------
const BOUSSAY = { lat: 47.045, lon: -1.184 };
async function boussay(log) {
  const base = 'https://www.boussay.fr/agenda/';
  const list = await get(base, log);
  const links = [...new Set([...list.matchAll(/href="(https:\/\/www\.boussay\.fr\/agenda\/[a-z0-9-]+\/)"/g)].map(m => m[1]))].filter(u => !/\/page\//.test(u));
  const events = await pool(links, 3, async url => {
    const h = await get(url, log);
    if (!h) return null;
    const head = text(attr(h, /<div class="article-date">([\s\S]*?)<\/div>/));
    const ds = datesLoose(head);
    if (!ds.length) return null;
    const aside = h.slice(h.indexOf('card-panel-event'), h.indexOf('card-panel-event') + 6000);
    const hours = text(aside).match(TIME_RE);
    const address = text(attr(aside, /<address>([\s\S]*?)<\/address>/));
    const body = text(h.slice(h.indexOf('</aside>'), h.indexOf('</article>')));
    return event({
      title: text(attr(h, /<h1 class="article-title">([\s\S]*?)<\/h1>/)), days: daysBetween(ds[0], ds[ds.length - 1]), body,
      given: hours ? { start: hhmm(hours[1], hours[2]), end: hours[3] ? hhmm(hours[3], hours[4]) : null } : null,
      place: address.split(',')[0] || 'Boussay', city: 'Boussay', ...BOUSSAY, img: ogImage(h), url, source: 'Agenda de la mairie de Boussay',
      desc: attr(h, /<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i)
    });
  });
  return events.filter(Boolean);
}

// ---------- Gorges (TYPO3: agenda items shown on the home page) ----------
const GORGES = { lat: 47.1003, lon: -1.3 };
async function gorges(log) {
  const site = 'https://www.gorges44.fr';
  const pages = await Promise.all([`${site}/`, `${site}/ville-de-gorges/actualites`, `${site}/ville-de-gorges/actualites/2`].map(u => get(u, log)));
  const links = [...new Set(pages.flatMap(h => [...h.matchAll(/href="(\/ville-de-gorges\/agenda\/vue-detaillee\/news\/[a-z0-9-]+)"/g)].map(m => site + m[1])))];
  const events = await pool(links, 3, async url => {
    const h = await get(url, log);
    if (!h) return null;
    const when = text(attr(h, /<div class="post-info">([\s\S]*?)<\/div>/));
    const ds = datesLoose(when);
    if (!ds.length) return null;
    const body = text(attr(h, /<div class="news-text-wrap"[^>]*>([\s\S]*?)<\/div>/));
    return event({
      title: text(attr(h, /<h1 class="page-title"[^>]*>([\s\S]*?)<\/h1>/)), days: daysBetween(ds[0], ds[ds.length - 1]), body,
      city: 'Gorges', ...GORGES, img: ogImage(h), url, source: 'Agenda de la mairie de Gorges'
    });
  });
  return events.filter(Boolean);
}

// ---------- Gétigné ----------
const GETIGNE = { lat: 47.0772, lon: -1.2537 };
async function getigne(log) {
  const base = 'https://www.getigne.fr/sortir/agenda/';
  const lists = [await get(base, log), await get(base + 'page-2.html', log)];
  const items = lists.flatMap(h => [...h.matchAll(/<article id="event_\d+"[\s\S]*?<\/article>/g)].map(m => m[0]));
  const events = await pool(items, 3, async item => {
    const url = new URL(attr(item, /href="([^"]+)"/), base).href;
    const ds = datesIn(text(attr(item, /<time[^>]*>([\s\S]*?)<\/time>/)));
    if (!ds.length) return null;
    const img = attr(item, /<img src="([^"]+)"/);
    const h = await get(url, log);
    const page = h.slice(h.indexOf('Retour'), h.indexOf('Contactez-nous'));
    const body = text(page);
    return event({
      title: text(attr(item, /card-title">([\s\S]*?)<\/h2>/)), days: daysBetween(ds[0], ds[ds.length - 1]), body,
      city: 'Gétigné', ...GETIGNE, img: img ? new URL(img, base).href : '', url, source: 'Agenda de la mairie de Gétigné',
      desc: body.replace(/^.*?(\d{4})\s*-\s*\S+(\s*-\s*\S+)?\s*/, '')
    });
  });
  return events.filter(Boolean);
}

// All town-hall events between today and the horizon within radiusKm of the point.
export async function townHallEvents({ lat, lon, radiusKm = 50, today, horizon, log = () => {} }) {
  const sources = { 'Terres de Montaigu': terresDeMontaigu, Boussay: boussay, Gorges: gorges, 'Gétigné': getigne };
  const out = [], seen = new Set();
  for (const [name, fn] of Object.entries(sources)) {
    const events = await fn(log).catch(e => { log('  Mairies :', name, '→', e.message); return []; });
    const kept = events.map(e => ({ ...e, timings: e.timings.filter(t => isoDay(t.e) >= today && isoDay(t.b) <= horizon) }))
      .filter(e => e.timings.length && distKmBetween(lat, lon, e.lat, e.lon) <= radiusKm)
      // A site can show the same event twice (Gorges lists some both as news and agenda).
      .filter(e => { const k = plain(e.title).replace(/[^a-z0-9]/g, '') + isoDay(e.timings[0].b); return !seen.has(k) && seen.add(k); });
    log(`Mairies : ${name}, ${events.length} événements lus, ${kept.length} dans la période`);
    out.push(...kept);
  }
  return out;
}
