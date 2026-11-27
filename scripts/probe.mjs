// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const get = async url => { const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) }); return { status: r.status, type: r.headers.get('content-type'), h: await r.text(), url: r.url }; };
const flat = s => s.replace(/\s+/g, ' ');
async function show(label, url, fn) {
  try { const r = await get(url); console.log(`\n######## ${label} ${url} HTTP ${r.status} ${r.type} ${r.h.length}`); await fn(r); } catch (e) { console.log(`\n######## ${label} ${url} erreur ${e.message}`); }
}
// Clisson: the agenda is filled by a script; find its data.
await show('Clisson', 'https://www.mairie-clisson.fr/agenda', async r => {
  const scripts = [...r.h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  for (const [, attrs, body] of scripts) {
    if (/src=/.test(attrs) && !/agenda|event|cl-/i.test(attrs)) continue;
    if (/agenda|event|fetch|json|cl-agenda/i.test(attrs + body)) console.log('--- script', flat(attrs), '\n', flat(body).slice(0, 2500));
  }
  console.log('data-* :', [...new Set(r.h.match(/data-[a-z-]+="[^"]{20,400}"/g) || [])].slice(0, 10).join('\n'));
  const i = r.h.search(/cl-agenda-(item|card|event|list|grid)/);
  console.log('liste :', i < 0 ? '(absent)' : flat(r.h.slice(i - 300, i + 2500)));
});
// Gorges: the list of agenda items.
await show('Gorges liste', 'https://www.gorges44.fr/ville-de-gorges/agenda', r => {
  const i = r.h.search(/vue-detaillee\/news/);
  console.log(flat(r.h.slice(Math.max(0, i - 1500), i + 2500)));
  console.log('pages :', [...new Set(r.h.match(/href="[^"]*(page|currentPage)[^"]*"/g) || [])].slice(0, 8).join(' '));
});
// Terres de Montaigu: place block of a detail page, and how many list pages.
await show('TdM détail lieu', 'https://www.terresdemontaigu.fr/evenement/les-pieds-au-plancher/', r => {
  const i = r.h.search(/panel-title">(Lieu|Adresse|Où)/);
  console.log(i < 0 ? '(pas de bloc lieu)' : flat(r.h.slice(i, i + 1500)));
  const j = r.h.search(/<address/);
  console.log('address :', j < 0 ? '-' : flat(r.h.slice(j, j + 600)));
  console.log('titres de panneaux :', (r.h.match(/panel-title">[^<]+/g) || []).join(' | '));
});
await show('TdM pages', 'https://www.terresdemontaigu.fr/agenda/', r => {
  console.log('pagination :', [...new Set(r.h.match(/agenda\/page\/\d+\//g) || [])].join(' '));
  console.log('cartes :', (r.h.match(/thumbnail-event/g) || []).length);
});
// Gétigné list: images.
await show('Gétigné', 'https://www.getigne.fr/sortir/agenda/', r => {
  console.log((r.h.match(/<article id="event_\d+"[\s\S]*?<\/article>/g) || []).slice(0, 2).map(flat).join('\n'));
});
