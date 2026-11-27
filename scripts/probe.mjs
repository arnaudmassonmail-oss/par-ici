// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const get = async url => { const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) }); return { status: r.status, type: r.headers.get('content-type'), h: await r.text(), url: r.url }; };
const flat = s => s.replace(/\s+/g, ' ');
const around = (h, re, before = 600, after = 1500) => { const i = h.search(re); return i < 0 ? '(absent)' : flat(h.slice(Math.max(0, i - before), i + after)); };
async function show(label, url, fn) {
  try { const r = await get(url); console.log(`\n######## ${label} ${url} HTTP ${r.status} ${r.type} ${r.h.length}`); fn(r); } catch (e) { console.log(`\n######## ${label} ${url} erreur ${e.message}`); }
}
// Terres de Montaigu family: REST API and one list item and one detail page.
await show('TdM types', 'https://www.terresdemontaigu.fr/wp-json/wp/v2/types', r => console.log(r.h.slice(0, 1500)));
await show('TdM evenement API', 'https://www.terresdemontaigu.fr/wp-json/wp/v2/evenement?per_page=2', r => console.log(r.h.slice(0, 3000)));
await show('TdM liste', 'https://www.terresdemontaigu.fr/agenda/', r => console.log(around(r.h, /Rando-philo/, 1500, 1500)));
await show('TdM liste p2', 'https://www.terresdemontaigu.fr/agenda/page/2/', r => console.log(r.status, flat(r.h).match(/Le \d{2} \w+ 2026/g)?.slice(0, 5)));
await show('TdM détail', 'https://www.terresdemontaigu.fr/evenement/les-pieds-au-plancher/', r => {
  console.log('og:image', (r.h.match(/property="og:image"[^>]+content="([^"]+)"/) || [])[1]);
  console.log('ld+json', (r.h.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/) || [])[1]?.slice(0, 1500));
  console.log(around(r.h, /<h1/, 100, 5000));
});
// Boussay (WordPress).
await show('Boussay types', 'https://www.boussay.fr/wp-json/wp/v2/types', r => console.log(r.h.slice(0, 1500)));
await show('Boussay liste', 'https://www.boussay.fr/agenda/', r => console.log(around(r.h, /Marché de Noël/, 1500, 2000)));
await show('Boussay détail', 'https://www.boussay.fr/agenda/marche-de-noel-2026/', r => {
  console.log('og:image', (r.h.match(/property="og:image"[^>]+content="([^"]+)"/) || [])[1]);
  console.log(around(r.h, /<h1/, 100, 4000));
});
// Gorges (TYPO3 news).
await show('Gorges agenda', 'https://www.gorges44.fr/ville-de-gorges/agenda', r => console.log(around(r.h, /Nuit de No/, 1500, 1500)));
await show('Gorges détail', 'https://www.gorges44.fr/ville-de-gorges/agenda/vue-detaillee/news/spectacle-nuit-de-noel', r => {
  console.log('og:image', (r.h.match(/property="og:image"[^>]+content="([^"]+)"/) || [])[1]);
  console.log(around(r.h, /<h1/, 100, 3000));
});
// Clisson (TYPO3): where the agenda items are.
await show('Clisson agenda', 'https://www.mairie-clisson.fr/agenda', r => {
  console.log('2026 :', (r.h.match(/.{0,120}2026.{0,120}/g) || []).slice(0, 8).map(flat).join('\n'));
  console.log('fetch/ajax :', [...new Set(r.h.match(/(https?:)?\/\/[^"' ]*(api|ajax|json|feed|ics|rss)[^"' ]*/gi) || [])].slice(0, 15).join(' '));
  console.log(around(r.h, /class="[^"]*(event|agenda)[^"]*"/i, 200, 2500));
});
