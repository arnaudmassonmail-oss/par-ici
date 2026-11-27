// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'fr-FR,fr' };
const text = h => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<header[\s\S]*?<\/header>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'").replace(/&egrave;/g, 'è').replace(/&eacute;/g, 'é').replace(/\s+/g, ' ');
const base = 'https://www.getigne.fr/sortir/agenda/';
const list = await (await fetch(base, { headers: UA })).text();
const links = ['https://www.getigne.fr/sortir/agenda/event-845-getigne-fete-noel.html'];
console.log('pages :', links.join(' '));
for (const url of links) {
  try {
    const h = await (await fetch(url, { headers: UA })).text();
    const t = text(h);
    const i = t.search(/(chorale|no[eë]l|loto|contes|empreinte|clochers|sang)/i);
    console.log(`\n### ${url}\n`, t.slice(Math.max(0, i - 100), i + 4000));
    const og = h.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    console.log('og:image', og ? og[1] : '-');
  } catch (e) { console.log(url, 'erreur', e.message); }
}
