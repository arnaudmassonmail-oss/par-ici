// Données de Par Ici. Ce fichier est le seul à modifier pour mettre à jour les sorties.
const UPDATED = '2026-11-06';

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
  noelNantes: ['Le Bonbon Nantes, marché de Noël 2026', 'https://lebonbon.fr/nantes/news/plus-grand-marche-noel-l-ouest-est-retour-2026-plus-150-chalets/']
};

// Real events collected on 6 November 2026. d = date, to = last day of a multi-day event.
const EV = [
  // Cugand-la-Bernardière
  { cat: 'spectacle', t: 'Lecture musicale : La Forêt millénaire', c: 'bernardiere', d: '2026-11-06', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Médiathèque de La Bernardière', desc: 'La compagnie Waï Waï met en musique le manga de Jirō Taniguchi.', s: 'tm' },
  // Gétigné, Gorges, Clisson
  { cat: 'famille', t: 'Prix des Bébés Lecteurs', c: 'getigne', d: '2026-10-03', to: '2027-05-15', h: 'Aux heures d\'ouverture de la bibliothèque', p: 'À confirmer', kids: true, place: 'Bibliothèque des Changes', desc: 'Prix littéraire pour les tout-petits proposé par la bibliothèque des Changes : on lit les livres en lice et on vote.', s: 'getigne' },
  { cat: 'famille', t: 'Soirée jeux de société', c: 'getigne', d: '2026-11-06', h: 'En soirée, horaire à confirmer', p: 'À confirmer', kids: true, place: 'Bibliothèque des Changes', desc: 'Animation de la bibliothèque : venez profiter d\'une soirée jeux.', s: 'getigne' },
  { cat: 'spectacle', t: 'Petits rendez-vous contes', c: 'getigne', d: '2026-11-18', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Bibliothèque des Changes', desc: 'Lectures de contes pour les enfants à la bibliothèque.', s: 'getigne' },
  { cat: 'expo', t: 'Garenne Lemot : Histoire d\'un jardin pittoresque', c: 'getigne', d: '2026-11-07', to: '2026-11-29', h: 'Visite guidée, horaire à confirmer', p: 'À confirmer', kids: true, place: 'Domaine de la Garenne Lemot', desc: 'Visite guidée du parc à l\'italienne créé par le sculpteur François Frédéric Lemot.', s: 'garenne' },
  { cat: 'expo', t: 'Le rêve italien de François Frédéric Lemot', c: 'getigne', d: '2026-10-20', to: '2026-12-31', h: 'Aux heures d\'ouverture du domaine', p: 'À confirmer', place: 'Maison du Jardinier, Domaine de la Garenne Lemot', desc: 'Exposition permanente de la Maison du Jardinier, ouverte de février à décembre. Le parc est en accès libre et gratuit.', s: 'garenne' },
  { cat: 'concert', t: 'Soirée celtique et bal folk (Celtomania)', c: 'gorges', d: '2026-11-10', h: 'En soirée, horaire à confirmer', p: 'Voir la billetterie', place: 'Gorges', desc: 'Soirée cabaret irlandais et bal folk dans le cadre du festival Celtomania.', s: 'gorges' },
  { cat: 'spectacle', t: 'Histoires pour petites oreilles', c: 'gorges', d: '2026-11-18', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Médiathèque Au fil des mots', desc: 'Histoires et comptines pour les moins de 3 ans.', s: 'gorgesMed' },
  { cat: 'spectacle', t: 'Scène ouverte slam et poésie', c: 'gorges', d: '2026-11-20', h: 'En soirée, horaire à confirmer', p: 'À confirmer', place: 'Médiathèque Au fil des mots', desc: 'Soirée scène ouverte : venez dire vos textes ou simplement écouter.', s: 'gorgesMed' },
  { cat: 'concert', t: 'Florent Pagny : La Suite du Retour', c: 'saintherblain', d: '2026-11-06', h: '20h00', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert de la tournée 65 Tour. Une date est aussi annoncée le 5 novembre selon certaines billetteries.', s: 'zenith' },
  { cat: 'concert', t: 'Patrick Bruel', c: 'saintherblain', d: '2026-11-07', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert au Zénith.', s: 'zenith' },
  { cat: 'concert', t: 'Christophe Maé', c: 'saintherblain', d: '2026-11-08', h: '18h00', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert au Zénith.', s: 'zenith' },
  { cat: 'concert', t: 'Ben Mazué', c: 'saintherblain', d: '2026-11-12', h: '20h00', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Tournée des Zénith 2026.', s: 'zenith' },
  { cat: 'concert', t: 'Orelsan', c: 'saintherblain', d: '2026-11-23', to: '2026-11-24', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Deux concerts de sa tournée 2026, les 23 et 24 novembre.', s: 'orelsan' },
  { cat: 'concert', t: 'Claudio Capéo', c: 'saintherblain', d: '2026-11-26', h: '20h00 (à confirmer)', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert de sa tournée 2026.', s: 'capeo' },
  { cat: 'concert', t: 'Multitude', c: 'monnieres', d: '2026-11-14', h: 'Horaire à confirmer', p: 'Voir la billetterie', kids: true, place: 'Monnières', desc: 'Voyage musical de Thierry Combe et Damien Félix. Saison Bravoh!, aussi le 15 novembre à Boussay.', s: 'bravoh' },
  { cat: 'concert', t: 'Multitude', c: 'boussay', d: '2026-11-15', h: 'Horaire à confirmer', p: 'Voir la billetterie', kids: true, place: 'Boussay', desc: 'Voyage musical de Thierry Combe et Damien Félix. Saison Bravoh!.', s: 'bravoh' },
  { cat: 'spectacle', t: 'Titre définitif (titre provisoire)', c: 'clisson', d: '2026-11-20', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Lieu à confirmer, agglo de Clisson', desc: 'Concert de mentalisme de la compagnie Raoul Lambert. Saison Bravoh!.', s: 'bravoh' },
  { cat: 'marche', t: 'Vide ta chambre', c: 'clisson', d: '2026-11-08', h: '9h00 – 17h00', p: 'Entrée libre', kids: true, place: 'Gymnase Saint-Jean-Baptiste de la Salle, rue des Hauts de Gervaux', desc: 'Vide-greniers organisé par l\'APEL du collège Immaculée Conception, avec une centaine d\'exposants.', s: 'vgTaChambre' },
  { cat: 'marche', t: 'Vide-grenier du Twirling', c: 'getigne', d: '2026-11-15', h: '9h00 – 17h30', p: 'Entrée libre', kids: true, place: 'Rue de la Goisloterie, Le Gatz', desc: 'Vide-greniers en intérieur organisé par le Twirling de Gétigné, environ 90 exposants.', s: 'vgTwirling' },
  { cat: 'marche', t: 'Vide-grenier des Lutins', c: 'clisson', d: '2026-11-22', h: '8h00 – 18h00', p: 'Entrée libre', kids: true, place: 'Gymnase Cacault', desc: 'Vide-greniers d\'environ 80 exposants.', s: 'vgLutins' },
  { cat: 'expo', t: 'Château de Clisson : Au cœur de la forteresse', c: 'clisson', d: '2026-11-07', to: '2026-11-29', h: 'Sam. et dim. 14h30 et 16h00', p: '8 € · réduit 5 €', kids: true, place: 'Château de Clisson', desc: 'Visite guidée d\'une heure de la forteresse médiévale. Château ouvert du mercredi au dimanche, 14h – 17h30.', s: 'chateau' },
  // Montaigu-Vendée et alentours
  { cat: 'spectacle', t: 'La disparition de Josef Mengele', c: 'montaigu', d: '2026-11-06', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre de Thalie', desc: 'Théâtre, d\'après le roman d\'Olivier Guez.', s: 'thalie' },
  { cat: 'marche', t: 'Bourse aux jouets', c: 'montaigu', d: '2026-11-07', h: 'Horaire à confirmer', p: 'Entrée libre', kids: true, place: 'Montaigu-Vendée', desc: 'Jouets d\'occasion avant les fêtes de fin d\'année.', s: 'jdsM' },
  { cat: 'spectacle', t: '4211 km', c: 'montaigu', d: '2026-11-10', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre de Thalie', desc: 'Théâtre.', s: 'thalie' },
  { cat: 'expo', t: 'Exposition Raphaël Toussaint', c: 'chabotterie', d: '2026-10-19', to: '2026-11-15', h: 'Aux heures d\'ouverture', p: 'À confirmer', place: 'Logis de la Chabotterie', desc: 'Peintures du Vendéen Raphaël Toussaint, connu pour ses scènes de la vie rurale.', s: 'jdsM' },
  // Choletais et Haut-Bocage
  { cat: 'spectacle', t: 'La FIV du samedi soir', c: 'cholet', d: '2026-11-06', to: '2026-11-07', h: 'En soirée', p: '21 €', place: 'Balcon Café Théâtre', desc: 'Comédie.', s: 'cholet' },
  { cat: 'spectacle', t: 'ADN', c: 'cholet', d: '2026-11-12', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre Saint-Louis', desc: 'Théâtre.', s: 'stlouis' },
  { cat: 'spectacle', t: 'La Noce d\'Alphonse', c: 'cholet', d: '2026-11-17', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre Saint-Louis', desc: 'Théâtre.', s: 'stlouis' },
  { cat: 'spectacle', t: 'Rond-Rond', c: 'cholet', d: '2026-11-18', h: '10h00 et 16h30', p: 'Voir la billetterie', kids: true, place: 'Théâtre Saint-Louis, salle Gene Kelly', desc: 'Spectacle tout-petits de la compagnie Piment, Langue d\'Oiseau, pour les 1-5 ans.', s: 'stlouis' },
  { cat: 'spectacle', t: 'Mesdemoiselles', c: 'cholet', d: '2026-11-15', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Jardin de Verre', desc: 'Spectacle de la saison du Jardin de Verre.', s: 'jardinVerre' },
  { cat: 'concert', t: 'Plateau partagé : Coline Linder', c: 'cholet', d: '2026-11-19', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Jardin de Verre', desc: 'Soirée plateau partagé avec Coline Linder.', s: 'jardinVerre' },
  { cat: 'marche', t: 'Salon du Mariage et de la Fête', c: 'cholet', d: '2026-11-21', to: '2026-11-22', h: 'De 10h00 le samedi à 18h30 le dimanche', p: 'À confirmer', place: 'Parc des expositions de la Meilleraie', desc: 'Salon des prestataires du mariage et des fêtes de famille.', s: 'choletSalons' },
  { cat: 'famille', t: 'Fête de la fressure', c: 'herbiers', d: '2026-11-07', h: 'Horaire à confirmer', p: 'À confirmer', place: 'Salle Ferchault', desc: 'Fête traditionnelle autour de la fressure, plat vendéen de saison.', s: 'alentoorH' },
  { cat: 'concert', t: 'Thanda Choir', c: 'herbiers', d: '2026-11-10', h: '20h30', p: 'Complet', place: 'Saison culturelle des Herbiers', desc: 'Concert de chœur. Annoncé complet.', s: 'herbiers' },
  { cat: 'spectacle', t: 'ADN', c: 'herbiers', d: '2026-11-13', h: '20h30', p: 'Complet', place: 'Saison culturelle des Herbiers', desc: 'Théâtre. Annoncé complet.', s: 'herbiers' },
  { cat: 'expo', t: 'Quand l\'art s\'envisage', c: 'stlaurent', d: '2026-10-19', to: '2026-11-14', h: 'Aux heures d\'ouverture', p: 'À confirmer', place: 'Saint-Laurent-sur-Sèvre', desc: 'Exposition consacrée au portrait.', s: 'alentoorH' },
  { cat: 'sport', t: 'Montfor\'trail', c: 'stlaurent', d: '2026-11-08', h: 'Le matin', p: 'Inscription', place: 'Saint-Laurent-sur-Sèvre', desc: 'Trail de 5 km, 14 km et semi-marathon.', s: 'trail' },
  { cat: 'sport', t: 'Trail de Maulévrier', c: 'maulevrier', d: '2026-11-08', h: 'Le matin', p: 'Inscription', place: 'Maulévrier', desc: 'Course nature autour du parc oriental.', s: 'trail' },
  { cat: 'sport', t: 'Trail du druide landais', c: 'landes', d: '2026-11-15', h: 'Le matin', p: 'Inscription', place: 'Les Landes-Genusson', desc: 'Trail nature dans le bocage vendéen.', s: 'trail' },
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
  { t: 'Soirée jeux de société', d: '2026-11-06', c: 'getigne', page: 'https://www.getigne.fr/sortir/agenda/', find: 'Soirée jeux de société', credit: 'Image : mairie de Gétigné' }
];
