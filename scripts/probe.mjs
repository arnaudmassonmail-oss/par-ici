// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const text = h => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'").replace(/\s+/g, ' ');
for (const url of ['https://www.getigne.fr/sortir/agenda/', 'https://www.getigne.fr/sortir/agenda/page/2/']) {
  try {
    const r = await fetch(url, { headers: UA });
    const h = await r.text();
    console.log(`\n### ${url} HTTP ${r.status} ${h.length} car.`);
    const t = text(h);
    for (const m of t.matchAll(/(chorale|chant|no[eë]l|fournil|concert|t[ée]l[ée]thon)/gi)) console.log('…', t.slice(Math.max(0, m.index - 220), m.index + 260));
    console.log('liens :', [...new Set([...h.matchAll(/href="(https:\/\/www\.getigne\.fr\/[^"]*(agenda|evenement|event)[^"]*)"/gi)].map(m => m[1]))].slice(0, 40).join('\n'));
  } catch (e) { console.log(url, 'erreur', e.message); }
}
