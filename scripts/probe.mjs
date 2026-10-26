// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const get = async (url, opt = {}) => { const t = Date.now(); const r = await fetch(url, { headers: UA, ...opt }); return { status: r.status, ms: Date.now() - t, text: await r.text() }; };
const q = '[out:json][timeout:300];area["ISO3166-1"="FR"][admin_level=2]->.fr;nwr["amenity"="cinema"](area.fr);out center tags;';
for (const ep of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
  try {
    const r = await get(ep, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { ...UA, 'content-type': 'application/x-www-form-urlencoded' } });
    const j = JSON.parse(r.text);
    const els = j.elements;
    const tag = k => els.filter(e => e.tags?.[k]).length;
    console.log(`## ${ep} HTTP ${r.status} en ${r.ms} ms : ${els.length} cinémas ; nom ${tag('name')}, addr:city ${tag('addr:city')}, addr:postcode ${tag('addr:postcode')}, website ${tag('website')}, ref:FR:CNC ${tag('ref:FR:CNC')}`);
    console.log(els.filter(e => /Clisson|Pornic|Brevin|Montaigu/i.test(JSON.stringify(e.tags))).map(e => JSON.stringify({ lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon, ...e.tags })).join('\n'));
    break;
  } catch (e) { console.log(`## ${ep} erreur ${e.message}`); }
}
for (const c of ['Nantes', 'Paris', 'Saint-Brevin-les-Pins', 'Pornic', 'Saint-Michel-Chef-Chef', 'Montaigu-Vendée', 'Arles']) {
  const r = await get(`https://www.allocine.fr/_/localization_city/${encodeURIComponent(c)}`);
  try {
    const v = JSON.parse(r.text).values;
    console.log(`\n## ville ${c} HTTP ${r.status} ${r.ms} ms : villes ${v.cities.map(x => x.node.name + ' ' + x.node.zip).join(', ')} ; salles (${v.theaters.length}) ${v.theaters.map(x => `${x.node.internalId} ${x.node.name} ${x.node.location.zip} ${x.node.location.city}`).join(' | ')}`);
  } catch { console.log(`\n## ville ${c} HTTP ${r.status}`, r.text.slice(0, 200)); }
}
const d = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
for (const u of [`https://www.allocine.fr/_/showtimes/theater-P0671/d-${d}/p-2/`, `https://www.allocine.fr/_/showtimes/theater-P0671/d-${d}/?page=2`, `https://www.allocine.fr/_/showtimes/theater-P0377/d-${d}/`, 'https://www.allocine.fr/seance/salle_gen_csalle=P0377.html']) {
  const r = await get(u);
  let info = r.text.slice(0, 150).replace(/\s+/g, ' ');
  try { const j = JSON.parse(r.text); info = `pagination ${JSON.stringify(j.pagination)} films ${j.results.map(x => x.movie?.title).join(' · ')}`; } catch {}
  console.log(`\n## ${u} HTTP ${r.status} ${r.ms} ms ${info}`);
}
