// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const SITES = {
  Clisson: ['https://www.mairie-clisson.fr/', 'https://www.mairie-clisson.fr/agenda'],
  Gorges: ['https://www.gorges44.fr/', 'https://www.gorges44.fr/agenda/'],
  Boussay: ['https://www.boussay.fr/', 'https://www.boussay.fr/agenda/'],
  Cugand: ['https://www.cugandlabernardiere.fr/', 'https://www.cugandlabernardiere.fr/agenda/'],
  'La Bruffière': ['https://www.labruffiere.fr/', 'https://www.labruffiere.fr/agenda/'],
  Montaigu: ['https://www.montaigu-vendee.com/', 'https://www.montaigu-vendee.com/agenda/'],
  'Terres de Montaigu': ['https://www.terresdemontaigu.fr/agenda/']
};
const DATE = /\b(\d{1,2})(?:er)?\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+(2026|2027)\b|\b\d{2}\/\d{2}\/(2026|2027)\b/gi;
const text = h => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
for (const [town, urls] of Object.entries(SITES)) {
  console.log(`\n######## ${town}`);
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      const h = await r.text();
      const t = text(h);
      const dates = t.match(DATE) || [];
      console.log(`## ${url} → ${r.url} HTTP ${r.status} ${h.length} car., ${dates.length} dates`);
      console.log('liens agenda :', [...new Set([...h.matchAll(/href="([^"#]+)"/gi)].map(m => { try { return new URL(m[1], r.url).href; } catch { return ''; } })
        .filter(u => /agenda|evenement|événement|event|manifestation|sortir/i.test(u)))].slice(0, 15).join(' '));
      const gen = h.match(/<meta name="generator" content="([^"]+)"/i);
      console.log('générateur :', gen ? gen[1] : '-', '| JSON-LD Event :', (h.match(/"@type"\s*:\s*"Event"/g) || []).length, '| openagenda :', /openagenda/i.test(h), '| iframe :', (h.match(/<iframe[^>]+src="([^"]+)"/i) || [])[1] || '-');
      if (dates.length) { const i = t.search(DATE); console.log('extrait :', t.slice(Math.max(0, i - 300), i + 900)); }
    } catch (e) { console.log(`## ${url} erreur ${e.message}`); }
  }
}
