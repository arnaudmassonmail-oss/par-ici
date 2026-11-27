// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const get = async url => { const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) }); return { status: r.status, type: r.headers.get('content-type'), h: await r.text(), url: r.url }; };
const flat = s => s.replace(/\s+/g, ' ');
async function show(label, url, fn) {
  try { const r = await get(url); console.log(`\n######## ${label} ${url} HTTP ${r.status} ${r.type} ${r.h.length}`); await fn(r); } catch (e) { console.log(`\n######## ${label} ${url} erreur ${e.message}`); }
}
// IntraMuros widget: which API it calls.
let apiHints = [];
await show('IntraMuros widget', 'https://widget.intramuros.org/js/5.1.0/agenda.js', r => {
  apiHints = [...new Set(r.h.match(/https?:\/\/[a-z0-9.-]*intramuros[a-z0-9.-]*\/[^"'`\s)]*/gi) || [])];
  console.log('URLs :', apiHints.join('\n'));
  for (const m of r.h.matchAll(/(city-id|city_id|cityId|agglo|events\/)/g)) { console.log('…', flat(r.h.slice(Math.max(0, m.index - 200), m.index + 300))); if (m.index > 0) break; }
  const i = r.h.search(/api\/v\d/);
  console.log('api :', i < 0 ? '-' : flat(r.h.slice(Math.max(0, i - 400), i + 600)));
});
for (const u of ['https://appli-intramuros.fr/api/v5/events/?city-id=93', 'https://appli.intramuros.org/api/v5/events/?city-id=93', 'https://appli.intramuros.org/api/v5/events/?city-id=93&agglo-id=27']) {
  await show('IntraMuros essai', u, r => console.log(r.h.slice(0, 1500)));
}
// Gorges: list items of the agenda page.
await show('Gorges liste', 'https://www.gorges44.fr/ville-de-gorges/agenda', r => {
  const body = r.h.slice(r.h.indexOf('<body'));
  const i = body.search(/vue-detaillee\/news/);
  console.log(flat(body.slice(Math.max(0, i - 1200), i + 1800)));
  console.log('nb liens :', (body.match(/vue-detaillee\/news\/[a-z0-9-]+/g) || []).length, '| pagination :', [...new Set(body.match(/href="[^"]*(%5BcurrentPage%5D|currentPage|page=)[^"]*"/g) || [])].slice(0, 5).join(' '));
});
// Terres de Montaigu: the Localisation panel.
await show('TdM localisation', 'https://www.terresdemontaigu.fr/evenement/les-pieds-au-plancher/', r => {
  const i = r.h.search(/panel-title">Localisation/);
  console.log(flat(r.h.slice(i, i + 1500)));
});
