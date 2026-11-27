// Scratch probe of an outside source, run by the "Exploration d'une source" workflow; prints to scripts/probe.log.
import { townHallEvents } from '../lib/townhalls.mjs';
import { window, isoDay, toEvent } from '../lib/collect.mjs';

const { today, horizon } = window(31);
const hm = d => d.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' });
const events = (await townHallEvents({ lat: 47.0603, lon: -1.2525, radiusKm: 50, today, horizon, log: console.log })).map(toEvent);
for (const e of events.sort((a, b) => a.timings[0].b - b.timings[0].b)) {
  console.log(`${isoDay(e.timings[0].b)} ${e.timings.length > 1 ? '(+' + (e.timings.length - 1) + ' dates) ' : ''}${hm(e.timings[0].b)}–${hm(e.timings[0].e)} | ${e.cat} | ${e.title} | ${e.city} · ${e.place} | ${e.price || '-'} | ${e.img ? 'image' : 'sans image'} | ${e.desc.slice(0, 90)}`);
}
