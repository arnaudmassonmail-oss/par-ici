// Données de Par Ici. Ce fichier est le seul à modifier pour mettre à jour les sorties.
const UPDATED = '2026-11-17';

// Communes with GPS coordinates. Distances are computed from the viewer's position.
const C = {
  cugand: { n: 'Cugand', lat: 47.0603, lon: -1.2525 },
  bernardiere: { n: 'La Bernardière', lat: 47.0453, lon: -1.2726 },
  clisson: { n: 'Clisson', lat: 47.0869, lon: -1.2823 },
  getigne: { n: 'Gétigné', lat: 47.0772, lon: -1.2537 },
  gorges: { n: 'Gorges', lat: 47.1003, lon: -1.3000 },
  boussay: { n: 'Boussay', lat: 47.0450, lon: -1.1840 },
  treize: { n: 'Treize-Septiers', lat: 46.9861, lon: -1.2283 },
  pallet: { n: 'Le Pallet', lat: 47.1378, lon: -1.3367 },
  montaigu: { n: 'Montaigu-Vendée', lat: 46.9737, lon: -1.3083 },
  guyonniere: { n: 'La Guyonnière', lat: 46.9667, lon: -1.2500 },
  chabotterie: { n: 'Montréverd', lat: 46.9036, lon: -1.4033 },
  cholet: { n: 'Cholet', lat: 47.0600, lon: -0.8790 },
  herbiers: { n: 'Les Herbiers', lat: 46.8706, lon: -1.0136 },
  stlaurent: { n: 'Saint-Laurent-sur-Sèvre', lat: 46.9578, lon: -0.8917 },
  maulevrier: { n: 'Maulévrier', lat: 47.0097, lon: -0.7428 },
  landes: { n: 'Les Landes-Genusson', lat: 46.9658, lon: -1.1203 },
  mortagne: { n: 'Mortagne-sur-Sèvre', lat: 46.9917, lon: -0.9494 },
  boissiere: { n: 'La Boissière-du-Doré', lat: 47.2369, lon: -1.2156 },
  nantes: { n: 'Nantes', lat: 47.2184, lon: -1.5536 },
  saintherblain: { n: 'Saint-Herblain', lat: 47.2122, lon: -1.6497 },
  vallet: { n: 'Vallet', lat: 47.1617, lon: -1.2660 },
  monnieres: { n: 'Monnières', lat: 47.1131, lon: -1.3478 }
};

const SRC = {
  tm: ['Agenda Terres de Montaigu', 'https://www.terresdemontaigu.fr/agenda/'],
  cub: ['Agenda de Cugand-la-Bernardière', 'https://www.cugandlabernardiere.fr/agenda/'],
  getigne: ['Agenda de Gétigné', 'https://www.getigne.fr/sortir/agenda/'],
  gorges: ['Ville de Gorges', 'https://www.gorges44.fr/'],
  chateau: ['Château de Clisson', 'https://www.chateau-clisson.fr/44/l-agenda/l-agenda-du-chateau-de-clisson/cli_5209'],
  clissonMkt: ['Alentoor, Clisson', 'https://www.alentoor.fr/clisson/agenda'],
  montaiguMkt: ['Vendée Bocage', 'https://www.vendeebocage.fr/en/?p=12557'],
  ofest: ['Festivals en France', 'https://www.festivalenfrance.com/festival/o-fest'],
  thalie: ['Théâtre de Thalie', 'https://thalie.terresdemontaigu.fr/'],
  jdsM: ['JDS Montaigu-Vendée', 'https://www.jds.fr/montaigu-vendee/agenda/'],
  cholet: ['Agenda culturel de Cholet', 'https://49.agendaculturel.fr/agenda-culturel/cholet/'],
  stlouis: ['Théâtre Saint-Louis, Cholet', 'https://49.agendaculturel.fr/theatre-saint-louis-cholet'],
  herbiers: ['Saison culturelle des Herbiers', 'https://www.lesherbiers.fr/sortir/culture/saison-culturelle/'],
  alentoorH: ['Alentoor, Les Herbiers', 'https://www.alentoor.fr/les-herbiers/agenda'],
  trail: ['GoTrail', 'https://gotrail.run/trail-running-calendar/france/pays-de-la-loire/les-herbiers'],
  mortagne: ['eTerritoire, Mortagne-sur-Sèvre', 'https://www.eterritoire.fr/territoires/pays-de-la-loire/vendee/mortagne-sur-sevre/85151/34374?agenda='],
  kidi: ['Kidiklik Loire-Atlantique', 'https://44.kidiklik.fr/articles/335197-le-top-des-sorties-halloween-nantes-et-en-loire-atlantique.html'],
  san: ['Sorties à Nantes', 'https://sortiesanantes.fr/que-faire-a-nantes-cette-semaine-du-19-au-25-octobre-2026/'],
  bcn: ['Big City Nantes', 'https://www.bigcitynantes.fr/actu/que-faire-a-nantes-pendant-les-vacances-de-la-toussaint-2026-le-top-des-activites-pour-les-familles/'],
  fcn: ['Billetterie FC Nantes', 'https://billetterie.fcnantes.com/fr/prochains-matchs/calendrier'],
  cdb: ['Château des ducs de Bretagne', 'https://www.chateaunantes.fr/evenements/special-halloween/'],
  imn: ['Infos Média Nantes', 'https://infos-media-nantes.fr/halloween-2026-nantes-sorties-eclipsium-naudieres-nefs-savenay/'],
  gorgesMed: ['Ville de Gorges, médiathèque Au fil des mots', 'https://www.gorges44.fr/sport-culture-loisirs/culture'],
  boussayChamp: ['Infos Média Nantes, Boussay', 'https://infos-media-nantes.fr/boussay-exposition-champignons-24-25-octobre-2026/'],
  garenne: ['Domaine de la Garenne Lemot', 'https://www.domaine-garenne-lemot.fr/44/l-agenda/agenda-du-domaine-de-la-garenne-lemot/lem_5209'],
  zenith: ['Zénith Nantes Métropole', 'https://www.zenith-nantesmetropole.com/program'],
  choletBasket: ['Billetterie Cholet Basket', 'https://www.biletwise.com/fr/cholet-basket-tickets'],
  jardinVerre: ['Jardin de Verre, Cholet', 'https://www.cholet.fr/agenda/agenda_cat_12_8_10_jardin+verre.html'],
  valletMkt: ['Alentoor, Vallet', 'https://www.alentoor.fr/vallet/agenda'],
  bravoh: ['Bravoh!, saison culturelle de Clisson Sèvre et Maine', 'https://bravoh.fr/2026/06/02/par-ici-la-saison-26-27/'],
  vgTaChambre: ['Vide-greniers.org, Vide ta chambre à Clisson', 'https://vide-greniers.org/evenement/1025853'],
  vgLutins: ['Vide-greniers.org, vide-greniers des Lutins', 'https://vide-greniers.org/evenement/1007961'],
  vgTwirling: ['Vide-greniers.org, vide-grenier du Twirling de Gétigné', 'https://vide-greniers.org/evenement/1034818'],
  orelsan: ['Fnac Spectacles, tournée d\'Orelsan', 'https://www.fnacspectacles.com/magazine/concerts/orelsan-en-tournee-2026'],
  capeo: ['Fnac Spectacles, Claudio Capéo en concert', 'https://www.fnacspectacles.com/magazine/concerts/claudio-capeo-concert'],
  choletSalons: ['AllEvents, salons à Cholet', 'https://allevents.in/cholet/exhibitions'],
  noelNantes: ['Le Bonbon Nantes, marché de Noël 2026', 'https://lebonbon.fr/nantes/news/plus-grand-marche-noel-l-ouest-est-retour-2026-plus-150-chalets/'],
  adams: ['Stereoboard, Bryan Adams à Nantes', 'https://www.stereoboard.com/bryan-adams-tickets/nantes/2026-12-01'],
  chatterton: ['Songkick, Feu! Chatterton au Zénith de Nantes', 'https://tickets.songkick.com/concerts/42777107-feu-chatterton-at-zenith-de-nantes-metropole'],
  superbus: ['Songkick, Superbus au Zénith de Nantes', 'https://songkick.com/fr/concerts/42846655-superbus-at-zenith-de-nantes-metropole']
};

// Real events collected on 17 November 2026. d = date, to = last day of a multi-day event.
const EV = [
  // Cugand-la-Bernardière
  // Gétigné, Gorges, Clisson
  { cat: 'famille', t: 'Prix des Bébés Lecteurs', c: 'getigne', d: '2026-10-03', to: '2027-05-15', h: 'Aux heures d\'ouverture de la bibliothèque', p: 'À confirmer', kids: true, place: 'Bibliothèque des Changes', desc: 'Prix littéraire pour les tout-petits proposé par la bibliothèque des Changes : on lit les livres en lice et on vote.', s: 'getigne' },
  { cat: 'spectacle', t: 'Petits rendez-vous contes', c: 'getigne', d: '2026-11-18', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Bibliothèque des Changes', desc: 'Lectures de contes pour les enfants à la bibliothèque.', s: 'getigne' },
  { cat: 'expo', t: 'Garenne Lemot : Histoire d\'un jardin pittoresque', c: 'getigne', d: '2026-11-07', to: '2026-11-29', h: 'Visite guidée, horaire à confirmer', p: 'À confirmer', kids: true, place: 'Domaine de la Garenne Lemot', desc: 'Visite guidée du parc à l\'italienne créé par le sculpteur François Frédéric Lemot.', s: 'garenne' },
  { cat: 'expo', t: 'Le rêve italien de François Frédéric Lemot', c: 'getigne', d: '2026-10-20', to: '2026-12-31', h: 'Aux heures d\'ouverture du domaine', p: 'À confirmer', place: 'Maison du Jardinier, Domaine de la Garenne Lemot', desc: 'Exposition permanente de la Maison du Jardinier, ouverte de février à décembre. Le parc est en accès libre et gratuit.', s: 'garenne' },
  { cat: 'spectacle', t: 'Histoires pour petites oreilles', c: 'gorges', d: '2026-11-18', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Médiathèque Au fil des mots', desc: 'Histoires et comptines pour les moins de 3 ans.', s: 'gorgesMed' },
  { cat: 'spectacle', t: 'Scène ouverte slam et poésie', c: 'gorges', d: '2026-11-20', h: 'En soirée, horaire à confirmer', p: 'À confirmer', place: 'Médiathèque Au fil des mots', desc: 'Soirée scène ouverte : venez dire vos textes ou simplement écouter.', s: 'gorgesMed' },
  { cat: 'concert', t: 'Bryan Adams', c: 'saintherblain', d: '2026-12-01', h: 'En soirée, horaire à confirmer', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert de la tournée Roll With The Punches.', s: 'adams' },
  { cat: 'concert', t: 'Feu! Chatterton', c: 'saintherblain', d: '2026-12-15', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert de la tournée des Zénith. Certaines billetteries annoncent le 16 décembre : à vérifier avant d\'acheter.', s: 'chatterton' },
  { cat: 'concert', t: 'Superbus', c: 'saintherblain', d: '2026-12-16', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert au Zénith.', s: 'superbus' },
  { cat: 'concert', t: 'Orelsan', c: 'saintherblain', d: '2026-11-23', to: '2026-11-24', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Deux concerts de sa tournée 2026, les 23 et 24 novembre.', s: 'orelsan' },
  { cat: 'concert', t: 'Claudio Capéo', c: 'saintherblain', d: '2026-11-26', h: '20h00 (à confirmer)', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert de sa tournée 2026.', s: 'capeo' },
  { cat: 'spectacle', t: 'Titre définitif (titre provisoire)', c: 'clisson', d: '2026-11-20', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Lieu à confirmer, agglo de Clisson', desc: 'Concert de mentalisme de la compagnie Raoul Lambert. Saison Bravoh!.', s: 'bravoh' },
  { cat: 'marche', t: 'Vide-grenier des Lutins', c: 'clisson', d: '2026-11-22', h: '8h00 – 18h00', p: 'Entrée libre', kids: true, place: 'Gymnase Cacault', desc: 'Vide-greniers d\'environ 80 exposants.', s: 'vgLutins' },
  { cat: 'expo', t: 'Château de Clisson : Au cœur de la forteresse', c: 'clisson', d: '2026-11-07', to: '2026-11-29', h: 'Sam. et dim. 14h30 et 16h00', p: '8 € · réduit 5 €', kids: true, place: 'Château de Clisson', desc: 'Visite guidée d\'une heure de la forteresse médiévale. Château ouvert du mercredi au dimanche, 14h – 17h30.', s: 'chateau' },
  // Montaigu-Vendée et alentours
  // Choletais et Haut-Bocage
  { cat: 'spectacle', t: 'La Noce d\'Alphonse', c: 'cholet', d: '2026-11-17', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre Saint-Louis', desc: 'Théâtre.', s: 'stlouis' },
  { cat: 'spectacle', t: 'Rond-Rond', c: 'cholet', d: '2026-11-18', h: '10h00 et 16h30', p: 'Voir la billetterie', kids: true, place: 'Théâtre Saint-Louis, salle Gene Kelly', desc: 'Spectacle tout-petits de la compagnie Piment, Langue d\'Oiseau, pour les 1-5 ans.', s: 'stlouis' },
  { cat: 'concert', t: 'Plateau partagé : Coline Linder', c: 'cholet', d: '2026-11-19', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Jardin de Verre', desc: 'Soirée plateau partagé avec Coline Linder.', s: 'jardinVerre' },
  { cat: 'marche', t: 'Salon du Mariage et de la Fête', c: 'cholet', d: '2026-11-21', to: '2026-11-22', h: 'De 10h00 le samedi à 18h30 le dimanche', p: 'À confirmer', place: 'Parc des expositions de la Meilleraie', desc: 'Salon des prestataires du mariage et des fêtes de famille.', s: 'choletSalons' },
  // Vers Nantes
  { cat: 'marche', t: 'Marché de Noël de Nantes', c: 'nantes', d: '2026-11-19', to: '2026-12-27', h: 'Tous les jours, horaires à confirmer', p: 'Entrée libre', kids: true, place: 'Places Royale et du Commerce', desc: 'Le grand marché de Noël nantais, avec plus de 150 chalets.', s: 'noelNantes' },
  { cat: 'famille', t: 'Tout feu tout flamme (4-6 ans)', c: 'nantes', d: '2026-10-10', to: '2026-11-18', h: 'Voir les horaires', p: 'Voir la billetterie', kids: true, place: 'Château des ducs de Bretagne', desc: 'Animation pour les 4-6 ans au château.', s: 'cdb' },
];

// Weekly markets, expanded into dated occurrences below. wd: 0 = Sunday … 6 = Saturday.
const MARKETS = [
  { t: 'Marché du dimanche', c: 'vallet', wd: 0, h: 'Le matin', place: 'Place Charles de Gaulle', desc: 'Grand marché du dimanche matin, près de 80 commerçants.', s: 'valletMkt' },
  { t: 'Marché alimentaire sous les Halles', c: 'clisson', wd: 2, h: '8h30 – 13h00', place: 'Halles de Clisson', desc: 'Marché alimentaire hebdomadaire sous les halles médiévales.', s: 'clissonMkt' },
  { t: 'Grand marché du vendredi', c: 'clisson', wd: 5, h: 'Le matin', place: 'Centre historique de Clisson', desc: 'Alimentation, vêtements, outillage et jardinage. Les stands vont jusqu\'à la place Lemot et au parking du château.', s: 'clissonMkt' },
  { t: 'Marché du samedi', c: 'montaigu', wd: 6, h: 'Le matin', place: 'Place de l\'Hôtel de Ville', desc: 'Marché hebdomadaire de Montaigu.', s: 'montaiguMkt' }
];

const CINEMAS = {
  // url: the cinema's own programme page; pages: where the nightly collection looks for film posters.
  connetable: { n: 'Le Connétable', c: 'clisson', url: 'https://cinema-leconnetable.fr/FR/42/les-films-le-connetable-clisson.html',
    pages: ['https://cinema-leconnetable.fr/FR/42/les-films-le-connetable-clisson.html', 'https://cinema-leconnetable.fr/FR/12/prochainement-cinema-le-connetable.html', 'https://cinema-leconnetable.fr/'] },
  montaigu: { n: 'Cinéma Montaigu-Vendée', c: 'montaigu', url: 'https://www.ticketingcine.com/cine/P6AJ45EB.html',
    pages: ['https://www.ticketingcine.com/cine/P6AJ45EB.html'] }
};
// Films now come from the server (AlloCiné, cinemas around the chosen position). Hand-made films are only
// shown when the server does not answer; left empty, the cinemas above then show with their programme link.
const FILMS = [];

// Official posters for events whose source gives no photo. `page` is the organiser's or venue's
// own page for the event; the nightly collection reads the preview image that page declares.
// With `find`, `page` is a listing (a town agenda) and the image is the one shown next to that title.
const POSTERS = [
  { t: 'Prix des Bébés Lecteurs', d: '2026-10-03', c: 'getigne', page: 'https://www.getigne.fr/sortir/agenda/', find: 'Prix des Bébés Lecteurs', credit: 'Image : mairie de Gétigné' },
];
