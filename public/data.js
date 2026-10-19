// Données de Par Ici. Ce fichier est le seul à modifier pour mettre à jour les sorties.
const UPDATED = '2026-10-19';

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
  nantes: { n: 'Nantes', lat: 47.2184, lon: -1.5536 }
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
  imn: ['Infos Média Nantes', 'https://infos-media-nantes.fr/halloween-2026-nantes-sorties-eclipsium-naudieres-nefs-savenay/']
};

// Real events collected on 19 October 2026. d = date, to = last day of a multi-day event.
const EV = [
  // Cugand-la-Bernardière
  { cat: 'famille', t: 'Atelier polar numérique', c: 'cugand', d: '2026-10-20', h: 'Horaire à confirmer', p: 'Gratuit', kids: true, place: 'Médiathèque de Cugand', desc: 'Découverte d\'applications ludiques et de jeux vidéo autour de l\'univers du polar.', s: 'tm' },
  { cat: 'marche', t: 'Vide Bibliothèques #5', c: 'cugand', d: '2026-10-25', h: '9h00 – 17h00', p: 'Entrée libre', kids: true, place: 'Espace culturel du Doué', desc: 'Grand déstockage de livres organisé par les bénévoles de la médiathèque de Cugand.', s: 'cub' },
  { cat: 'famille', t: 'Soirée frisson : lectures et dessins', c: 'cugand', d: '2026-10-30', h: 'Horaire à confirmer', p: 'Gratuit', kids: true, place: 'Médiathèque de Cugand', desc: 'Lectures qui font frissonner pour les 3-8 ans et dessins pour les 8-11 ans, juste avant Halloween.', s: 'tm' },
  { cat: 'famille', t: 'Soirée des 14-17 ans', c: 'cugand', d: '2026-10-30', h: 'En soirée', p: 'À confirmer', place: 'Espace culturel du Doué', desc: 'Soirée réservée aux ados, organisée par La Bringuerie de Cugand-la-Bernardière.', s: 'cub' },
  { cat: 'spectacle', t: 'Lecture musicale : La Forêt millénaire', c: 'bernardiere', d: '2026-11-06', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Médiathèque de La Bernardière', desc: 'La compagnie Waï Waï met en musique le manga de Jirō Taniguchi.', s: 'tm' },
  // Gétigné, Gorges, Clisson
  { cat: 'famille', t: 'Atelier de fabrication de cartes', c: 'getigne', d: '2026-10-16', to: '2026-10-25', h: 'Voir l\'agenda de la commune', p: 'À confirmer', kids: true, place: 'Gétigné', desc: 'Atelier créatif de fabrication de cartes pendant la première semaine des vacances.', s: 'getigne' },
  { cat: 'famille', t: 'Soirée pyjama à la médiathèque', c: 'gorges', d: '2026-10-27', h: 'En soirée', p: 'Gratuit', kids: true, place: 'Médiathèque de Gorges', desc: 'Histoires du soir pour les enfants, en pyjama et doudou sous le bras.', s: 'gorges' },
  { cat: 'expo', t: 'Château de Clisson : visite pour les familles', c: 'clisson', d: '2026-10-17', to: '2026-10-31', h: '16h00, sauf le mardi', p: '8 € · réduit 5 €', kids: true, place: 'Château de Clisson', desc: 'Visite guidée de la forteresse pensée pour les enfants pendant les vacances de la Toussaint. Réservation au 02 40 54 02 22.', s: 'chateau' },
  { cat: 'expo', t: 'Château de Clisson : Au cœur de la forteresse', c: 'clisson', d: '2026-11-07', to: '2026-11-29', h: 'Sam. et dim. 14h30 et 16h00', p: '8 € · réduit 5 €', kids: true, place: 'Château de Clisson', desc: 'Visite guidée d\'une heure de la forteresse médiévale. Château ouvert du mercredi au dimanche, 14h – 17h30.', s: 'chateau' },
  // Montaigu-Vendée et alentours
  { cat: 'famille', t: 'Après-midi jeux de société', c: 'montaigu', d: '2026-10-21', h: 'L\'après-midi', p: 'Gratuit', kids: true, place: 'Montaigu-Vendée', desc: 'Jeux de société pour petits et grands.', s: 'tm' },
  { cat: 'famille', t: 'Atelier créatif : coloriages animés', c: 'montaigu', d: '2026-10-21', h: 'Horaire à confirmer', p: 'Gratuit', kids: true, place: 'Médiathèque, Terres de Montaigu', desc: 'Les coloriages des enfants prennent vie grâce à une application.', s: 'tm' },
  { cat: 'concert', t: 'Ô Fest\', 3e édition', c: 'guyonniere', d: '2026-10-24', h: '19h00 – 2h00', p: '10 € · gratuit moins de 12 ans', place: 'Espace Agapé', desc: 'Festival de DJ sets et de concerts live. Bar et restauration sur place.', s: 'ofest' },
  { cat: 'marche', t: 'Bourse aux jouets, livres et puériculture', c: 'montaigu', d: '2026-10-24', h: 'Horaire à confirmer', p: 'Entrée libre', kids: true, place: 'Montaigu-Vendée', desc: 'Jouets, livres et matériel de puériculture d\'occasion.', s: 'jdsM' },
  { cat: 'spectacle', t: 'Contes à frémir', c: 'montaigu', d: '2026-10-25', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Montaigu-Vendée', desc: 'Contes d\'Halloween pour les enfants.', s: 'jdsM' },
  { cat: 'spectacle', t: 'Carmen', c: 'montaigu', d: '2026-11-04', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre de Thalie', desc: 'Spectacle de danse.', s: 'thalie' },
  { cat: 'spectacle', t: 'La disparition de Josef Mengele', c: 'montaigu', d: '2026-11-06', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre de Thalie', desc: 'Théâtre, d\'après le roman d\'Olivier Guez.', s: 'thalie' },
  { cat: 'marche', t: 'Bourse aux jouets', c: 'montaigu', d: '2026-11-07', h: 'Horaire à confirmer', p: 'Entrée libre', kids: true, place: 'Montaigu-Vendée', desc: 'Jouets d\'occasion avant les fêtes de fin d\'année.', s: 'jdsM' },
  { cat: 'spectacle', t: '4211 km', c: 'montaigu', d: '2026-11-10', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre de Thalie', desc: 'Théâtre.', s: 'thalie' },
  { cat: 'expo', t: 'Exposition Raphaël Toussaint', c: 'chabotterie', d: '2026-10-19', to: '2026-11-15', h: 'Aux heures d\'ouverture', p: 'À confirmer', place: 'Logis de la Chabotterie', desc: 'Peintures du Vendéen Raphaël Toussaint, connu pour ses scènes de la vie rurale.', s: 'jdsM' },
  // Choletais et Haut-Bocage
  { cat: 'spectacle', t: 'Peregrinale', c: 'cholet', d: '2026-10-22', to: '2026-10-25', h: 'En soirée', p: 'Voir la billetterie', place: 'Balcon Café Théâtre', desc: 'Spectacle au café-théâtre de Cholet.', s: 'cholet' },
  { cat: 'expo', t: 'Salon Maison & Déco', c: 'cholet', d: '2026-10-23', to: '2026-10-25', h: 'En journée', p: 'À confirmer', place: 'Parc des expositions de la Meilleraie', desc: 'Salon de l\'habitat, de l\'aménagement et de la décoration.', s: 'cholet' },
  { cat: 'spectacle', t: 'La FIV du samedi soir', c: 'cholet', d: '2026-11-06', to: '2026-11-07', h: 'En soirée', p: '21 €', place: 'Balcon Café Théâtre', desc: 'Comédie.', s: 'cholet' },
  { cat: 'spectacle', t: 'ADN', c: 'cholet', d: '2026-11-12', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre Saint-Louis', desc: 'Théâtre.', s: 'stlouis' },
  { cat: 'spectacle', t: 'La Noce d\'Alphonse', c: 'cholet', d: '2026-11-17', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre Saint-Louis', desc: 'Théâtre.', s: 'stlouis' },
  { cat: 'spectacle', t: 'Rond Rond', c: 'cholet', d: '2026-11-18', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Théâtre Saint-Louis', desc: 'Spectacle de la saison du Théâtre Saint-Louis.', s: 'stlouis' },
  { cat: 'concert', t: 'Daoud', c: 'herbiers', d: '2026-11-05', h: '20h30', p: 'Voir la billetterie', place: 'Saison culturelle des Herbiers', desc: 'Concert de la saison culturelle.', s: 'herbiers' },
  { cat: 'famille', t: 'Fête de la fressure', c: 'herbiers', d: '2026-11-07', h: 'Horaire à confirmer', p: 'À confirmer', place: 'Salle Ferchault', desc: 'Fête traditionnelle autour de la fressure, plat vendéen de saison.', s: 'alentoorH' },
  { cat: 'concert', t: 'Thanda Choir', c: 'herbiers', d: '2026-11-10', h: '20h30', p: 'Complet', place: 'Saison culturelle des Herbiers', desc: 'Concert de chœur. Annoncé complet.', s: 'herbiers' },
  { cat: 'spectacle', t: 'ADN', c: 'herbiers', d: '2026-11-13', h: '20h30', p: 'Complet', place: 'Saison culturelle des Herbiers', desc: 'Théâtre. Annoncé complet.', s: 'herbiers' },
  { cat: 'expo', t: 'Quand l\'art s\'envisage', c: 'stlaurent', d: '2026-10-19', to: '2026-11-14', h: 'Aux heures d\'ouverture', p: 'À confirmer', place: 'Saint-Laurent-sur-Sèvre', desc: 'Exposition consacrée au portrait.', s: 'alentoorH' },
  { cat: 'marche', t: 'Brocante', c: 'mortagne', d: '2026-11-01', h: 'En journée', p: 'Entrée libre', kids: true, place: 'Mortagne-sur-Sèvre', desc: 'Brocante et vide-greniers.', s: 'mortagne' },
  { cat: 'sport', t: 'Montfor\'trail', c: 'stlaurent', d: '2026-11-08', h: 'Le matin', p: 'Inscription', place: 'Saint-Laurent-sur-Sèvre', desc: 'Trail de 5 km, 14 km et semi-marathon.', s: 'trail' },
  { cat: 'sport', t: 'Trail de Maulévrier', c: 'maulevrier', d: '2026-11-08', h: 'Le matin', p: 'Inscription', place: 'Maulévrier', desc: 'Course nature autour du parc oriental.', s: 'trail' },
  { cat: 'sport', t: 'Trail du druide landais', c: 'landes', d: '2026-11-15', h: 'Le matin', p: 'Inscription', place: 'Les Landes-Genusson', desc: 'Trail nature dans le bocage vendéen.', s: 'trail' },
  // Vers Nantes
  { cat: 'famille', t: 'Halloween au zoo', c: 'boissiere', d: '2026-10-29', to: '2026-10-31', h: 'Aux heures d\'ouverture', p: 'Billet du zoo', kids: true, place: 'Zoo de la Boissière-du-Doré', desc: 'Animations spéciales Halloween pour les familles.', s: 'kidi' },
  { cat: 'sport', t: 'Handball : HBC Nantes contre Chambéry', c: 'nantes', d: '2026-10-24', h: '19h00', p: 'Voir la billetterie', kids: true, place: 'Nantes', desc: 'Match de Liqui Moly Starligue.', s: 'san' },
  { cat: 'concert', t: 'Soirée Collectif Frénésie', c: 'nantes', d: '2026-10-24', h: '22h00 – 1h30', p: 'Gratuit', place: 'Le Lieu Unique', desc: 'Soirée musicale gratuite.', s: 'san' },
  { cat: 'spectacle', t: 'La chèvre de Monsieur Seguin', c: 'nantes', d: '2026-10-25', h: '15h00', p: 'Voir la billetterie', kids: true, place: 'Théâtre de Jeanne', desc: 'Le conte d\'Alphonse Daudet sur scène, dès 4 ans.', s: 'san' },
  { cat: 'famille', t: 'Tap Tap Boom Boom', c: 'nantes', d: '2026-10-25', h: '15h00', p: '5 €', kids: true, place: 'Aérofab', desc: 'Après-midi festive et musicale pensée pour les enfants.', s: 'san' },
  { cat: 'spectacle', t: 'L\'Été indien aux Nefs', c: 'nantes', d: '2026-10-19', to: '2026-10-31', h: 'Voir le programme', p: 'Gratuit', kids: true, place: 'Les Nefs, île de Nantes', desc: 'Spectacle gratuit en plein air sous les Nefs.', s: 'san' },
  { cat: 'expo', t: 'Les Machines de l\'île', c: 'nantes', d: '2026-10-17', to: '2026-11-02', h: '10h00 – 19h00', p: '12 € · 8 € de 4 à 12 ans', kids: true, place: 'Parc des Chantiers', desc: 'Galerie des Machines et Carrousel des Mondes marins, ouverts tous les jours pendant les vacances.', s: 'imn' },
  { cat: 'famille', t: 'Tout feu tout flamme (4-6 ans)', c: 'nantes', d: '2026-10-10', to: '2026-11-18', h: 'Voir les horaires', p: 'Voir la billetterie', kids: true, place: 'Château des ducs de Bretagne', desc: 'Animation pour les 4-6 ans au château.', s: 'cdb' },
  { cat: 'famille', t: 'Visite nocturne spéciale Halloween (11-13 ans)', c: 'nantes', d: '2026-10-27', to: '2026-10-31', h: '18h15', p: 'Voir la billetterie', kids: true, place: 'Château des ducs de Bretagne', desc: 'Visite du château à la tombée de la nuit, sur le thème d\'Halloween.', s: 'cdb' },
  { cat: 'sport', t: 'Football : FC Nantes contre Clermont', c: 'nantes', d: '2026-10-30', h: '20h00 (à confirmer)', p: 'Voir la billetterie', kids: true, place: 'Stade de la Beaujoire', desc: 'Match de Ligue 2.', s: 'fcn' },
  { cat: 'famille', t: 'Parade d\'Halloween sous les Nefs', c: 'nantes', d: '2026-10-31', h: 'Portes 19h00, défilé 20h00', p: 'Gratuit', kids: true, place: 'Les Nefs, île de Nantes', desc: 'Grande parade gratuite. Déguisement fortement conseillé.', s: 'imn' }
];

// Weekly markets, expanded into dated occurrences below. wd: 0 = Sunday … 6 = Saturday.
const MARKETS = [
  { t: 'Marché alimentaire sous les Halles', c: 'clisson', wd: 2, h: '8h30 – 13h00', place: 'Halles de Clisson', desc: 'Marché alimentaire hebdomadaire sous les halles médiévales.', s: 'clissonMkt' },
  { t: 'Grand marché du vendredi', c: 'clisson', wd: 5, h: 'Le matin', place: 'Centre historique de Clisson', desc: 'Alimentation, vêtements, outillage et jardinage. Les stands vont jusqu\'à la place Lemot et au parking du château.', s: 'clissonMkt' },
  { t: 'Marché du samedi', c: 'montaigu', wd: 6, h: 'Le matin', place: 'Place de l\'Hôtel de Ville', desc: 'Marché hebdomadaire de Montaigu.', s: 'montaiguMkt' }
];

const CINEMAS = {
  connetable: { n: 'Le Connétable', c: 'clisson', url: 'https://www.allocine.fr/seance/salle_gen_csalle=P0377.html' },
  montaigu: { n: 'Cinéma Montaigu-Vendée', c: 'montaigu', url: 'https://www.allocine.fr/seance/salle_gen_csalle=W8560.html' }
};
// Films announced by each cinema. from = first screening announced there.
const FILMS = [
  { id: 'shaun', t: 'Shaun le Mouton : La Bêêête d\'Halloween', g: 'Animation', dur: '1h31', age: 'En famille', kids: true, s: { connetable: '2026-10-21' }, desc: 'Le troisième long métrage des studios Aardman avec Shaun et le troupeau, spécial Halloween.' },
  { id: 'mochy', t: 'Mochy', g: 'Animation', age: 'En famille', kids: true, s: { montaigu: '2026-10-14' }, desc: 'Film d\'animation belge sorti le 14 octobre.' },
  { id: 'marius', t: 'Marius et le Royaume des mers', g: 'Film', s: { connetable: '2026-10-18' }, desc: 'À l\'affiche au Connétable.' },
  { id: 'miserables', t: 'Les Misérables', g: 'Drame', s: { connetable: '2026-10-18', montaigu: '2026-10-14' }, desc: 'Nouvelle adaptation du roman de Victor Hugo, réalisée par Fred Cavayé.' },
  { id: 'karma', t: 'Karma', g: 'Thriller', s: { connetable: '2026-10-21' }, desc: 'Thriller de Guillaume Canet avec Marion Cotillard, dans le nord de l\'Espagne.' },
  { id: 'englouti', t: 'Englouti', g: 'Thriller', s: { montaigu: '2026-10-14' }, desc: 'Thriller américain sorti le 14 octobre.' },
  { id: 'nivue', t: 'Ni vue, ni connue', g: 'Film', s: { connetable: '2026-10-18' }, desc: 'À l\'affiche au Connétable.' },
  { id: 'salut', t: 'Notre salut', g: 'Film', s: { connetable: '2026-10-23' }, desc: 'Annoncé au Connétable à partir du 23 octobre.' },
  { id: 'garance', t: 'Garance', g: 'Film', s: { connetable: '2026-10-25' }, desc: 'Annoncé au Connétable à partir du 25 octobre.' },
  { id: 'minotaure', t: 'Minotaure', g: 'Film', s: { connetable: '2026-10-28' }, desc: 'Annoncé au Connétable à partir du 28 octobre.' },
  { id: 'fantome', t: 'Le Fantôme de l\'Opéra', g: 'Film', s: { connetable: '2026-10-28' }, desc: 'Annoncé au Connétable à partir du 28 octobre.' }
];
