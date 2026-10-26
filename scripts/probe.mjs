// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const get = async url => { const r = await fetch(url, { headers: UA }); return { status: r.status, type: r.headers.get('content-type'), text: await r.text() }; };
const shape = (o, d = 0) => d > 3 || o === null || typeof o !== 'object' ? (typeof o === 'string' ? JSON.stringify(o.slice(0, 60)) : String(o))
  : Array.isArray(o) ? `[${o.length}× ${shape(o[0], d + 1)}]` : `{${Object.entries(o).filter(([k]) => !/json|__typename/.test(k)).map(([k, v]) => `${k}: ${shape(v, d + 1)}`).join(', ')}}`;
try {
  const g = await get('https://hydra.s3.rbx.io.cloud.ovh.net/geojson/75ed4730-9ab3-4498-b16b-856db838c17b.geojson');
  const j = JSON.parse(g.text);
  console.log('## CNC geojson', g.status, g.text.length, 'car.,', j.features?.length, 'cinémas');
  console.log(JSON.stringify(j.features[0]).slice(0, 1500));
  console.log(j.features.filter(f => /CLISSON|MONTAIGU|PORNIC|BREVIN/i.test(JSON.stringify(f.properties))).map(f => JSON.stringify(f.properties).slice(0, 400)).join('\n'));
} catch (e) { console.log('CNC geojson erreur', e.message); }
try {
  const d = await get('https://www.data.gouv.fr/api/1/datasets/5437eb4e88ee387cb58f5e86/');
  const j = JSON.parse(d.text);
  console.log('\n## CNC ressources', j.title, j.last_update);
  for (const r of j.resources) console.log(' -', r.title, r.format, r.url, r.last_modified);
} catch (e) { console.log('CNC dataset erreur', e.message); }
for (const q of ['clisson', 'pornic']) {
  const s = await get(`https://www.allocine.fr/rechercher/theater/?q=${q}`);
  const i = s.text.search(/Connétable|Connetable|Saint-Gilles|Pornic/i);
  console.log(`\n## recherche salle ${q}`, s.status, 'ids :', [...new Set(s.text.match(/[A-Z]\d{4}\b/g) || [])].slice(0, 20).join(' '));
  console.log(s.text.slice(Math.max(0, i - 800), i + 600).replace(/\s+/g, ' '));
}
for (const u of ['https://www.allocine.fr/_/localization_city/clisson', 'https://www.allocine.fr/_/autocomplete/clisson', 'https://www.allocine.fr/salle/']) {
  const s = await get(u).catch(e => ({ status: e.message, text: '' }));
  console.log(`\n## ${u}`, s.status, s.type, s.text.slice(0, 700).replace(/\s+/g, ' '));
}
const t = await get('https://www.allocine.fr/_/showtimes/theater-P0671/d-2026-10-27/');
const j = JSON.parse(t.text);
console.log('\n## séances P0671, clés :', Object.keys(j).join(' '), '| page', JSON.stringify(j.pagination || j.page || null), 'résultats', j.results.length);
console.log(shape(j.results[0]).slice(0, 3000));
console.log('films :', j.results.map(r => `${r.movie?.title} (${r.movie?.releases?.[0]?.releaseDate?.date || '?'})`).join(' · '));
console.log('autres clés :', JSON.stringify(Object.fromEntries(Object.entries(j).filter(([k]) => k !== 'results'))).slice(0, 800));
