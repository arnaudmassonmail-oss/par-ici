// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const get = async url => { const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) }); return { status: r.status, type: r.headers.get('content-type'), h: await r.text(), url: r.url }; };
const flat = s => s.replace(/\s+/g, ' ');
async function show(label, url, fn) {
  try { const r = await get(url); console.log(`\n######## ${label} ${url} HTTP ${r.status} ${r.type} ${r.h.length}`); await fn(r); } catch (e) { console.log(`\n######## ${label} ${url} erreur ${e.message}`); }
}
const js = (await get('https://widget.intramuros.org/js/5.1.0/agenda.js')).h;
for (const m of js.matchAll(/_public/g)) console.log('… _public :', flat(js.slice(Math.max(0, m.index - 300), m.index + 500)));
for (const m of [...js.matchAll(/["'`]\/?(events|event|agendas?)[\/?][^"'`]{0,80}["'`]/g)].slice(0, 12)) console.log('… chemin :', flat(js.slice(Math.max(0, m.index - 250), m.index + 250)));
for (const u of [
  'https://api.appli-intramuros.com/_public/events/?city-id=93',
  'https://api.appli-intramuros.com/_public/events?city-id=93',
  'https://api.appli-intramuros.com/_public/events/?agglo-id=27',
  'https://api.appli-intramuros.com/_public/events/?city=93'
]) await show('IntraMuros', u, r => console.log(r.h.slice(0, 2500)));
// Gorges: event teasers on the home page and the news list.
for (const u of ['https://www.gorges44.fr/', 'https://www.gorges44.fr/ville-de-gorges/actualites']) await show('Gorges', u, r => {
  const body = r.h.slice(r.h.indexOf('<body'));
  console.log('nb liens :', (body.match(/vue-detaillee\/news\/[a-z0-9-]+/g) || []).length);
  const i = body.search(/vue-detaillee\/news/);
  console.log(flat(body.slice(Math.max(0, i - 1200), i + 1500)));
});
