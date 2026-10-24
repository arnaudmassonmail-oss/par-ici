// Tries the server's collection for a few places in France with the real sources; writes scripts/test-zone.log.
// Run: node scripts/test-zone.mjs   (needs OPENAGENDA_KEY and DATATOURISME_KEY)
import fs from 'node:fs';
import path from 'node:path';
import { collectAround, toCards, searchTermsAround } from '../lib/collect.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PLACES = [['Lyon', 45.758, 4.835], ['Rennes', 48.111, -1.68], ['Gap', 44.559, 6.079], ['Clisson', 47.087, -1.282]];
const out = [];
for (const [name, lat, lon] of PLACES) {
  const t0 = Date.now();
  const { searches } = await searchTermsAround(lat, lon);
  const lines = [];
  const events = await collectAround({
    lat, lon, radiusKm: 50, days: 31, oaKey: process.env.OPENAGENDA_KEY, dtKey: process.env.DATATOURISME_KEY,
    log: (...a) => lines.push(a.join(' ')), oa: { searches, maxAgendas: 40, maxPages: 3 }, dt: { maxPages: 15 }
  });
  const { EV } = toCards(events);
  out.push(`## ${name} — ${EV.length} sorties, ${EV.filter(e => e.img).length} avec photo, ${Math.round((Date.now() - t0) / 1000)} s ; recherches OpenAgenda : ${searches.join(' | ')}`);
  out.push(...lines.filter(l => /agendas candidats|à moins de 50 km|Doublons|Erreur/.test(l) && !/: \d+ événements lus, 0 à moins/.test(l)).map(l => '  ' + l.slice(0, 160)));
  out.push('  exemples : ' + EV.slice(0, 5).map(e => `${e.d} ${e.t}`).join(' · '));
}
fs.writeFileSync(path.join(ROOT, 'scripts/test-zone.log'), out.join('\n') + '\n');
console.log(out.join('\n'));
