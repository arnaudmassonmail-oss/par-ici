// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
async function show(url, n = 600, re) {
  try {
    const r = await fetch(url, { headers: UA });
    const t = await r.text();
    console.log(`\n### ${url}\nHTTP ${r.status} ${r.headers.get('content-type')} ${t.length} car.`);
    if (re) console.log('trouvé :', [...new Set(t.match(re) || [])].slice(0, 30).join(' | '));
    console.log(t.slice(0, n).replace(/\s+/g, ' '));
  } catch (e) { console.log(`\n### ${url}\nerreur ${e.message} ${e.cause?.code || ''}`); }
}
await show('https://www.data.gouv.fr/api/1/datasets/?q=etablissements+cinematographiques&page_size=5', 3000, /https:[^"]+\.(csv|json|xlsx|geojson)/g);
await show('https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets?where=search(%22cinema%22)&limit=10&select=dataset_id', 1500);
await show('https://www.allocine.fr/rechercher/theater/?q=clisson', 300, /salle_gen_csalle=[A-Z0-9]+/g);
await show('https://www.allocine.fr/rechercher/theater/?q=pornic', 300, /salle_gen_csalle=[A-Z0-9]+/g);
await show('https://www.allocine.fr/_/showtimes/theater-P0671/d-2026-10-27/', 1500);
