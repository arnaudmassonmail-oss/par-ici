// Données de Par Ici. Ce fichier est le seul à modifier pour mettre à jour les sorties.
const UPDATED = '2026-10-21';

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
  bravoh: ['Bravoh!, saison culturelle de Clisson Sèvre et Maine', 'https://bravoh.fr/2026/06/02/par-ici-la-saison-26-27/']
};

// Real events collected on 19 October 2026. d = date, to = last day of a multi-day event.
const EV = [
  // Cugand-la-Bernardière
  { cat: 'marche', t: 'Vide Bibliothèques #5', c: 'cugand', d: '2026-10-25', h: '9h00 – 17h00', p: 'Entrée libre', kids: true, place: 'Espace culturel du Doué', desc: 'Grand déstockage de livres organisé par les bénévoles de la médiathèque de Cugand.', s: 'cub' },
  { cat: 'famille', t: 'Soirée frisson : lectures et dessins', c: 'cugand', d: '2026-10-30', h: 'Horaire à confirmer', p: 'Gratuit', kids: true, place: 'Médiathèque de Cugand', desc: 'Lectures qui font frissonner pour les 3-8 ans et dessins pour les 8-11 ans, juste avant Halloween.', s: 'tm' },
  { cat: 'famille', t: 'Soirée des 14-17 ans', c: 'cugand', d: '2026-10-30', h: 'En soirée', p: 'À confirmer', place: 'Espace culturel du Doué', desc: 'Soirée réservée aux ados, organisée par La Bringuerie de Cugand-la-Bernardière.', s: 'cub' },
  { cat: 'spectacle', t: 'Lecture musicale : La Forêt millénaire', c: 'bernardiere', d: '2026-11-06', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Médiathèque de La Bernardière', desc: 'La compagnie Waï Waï met en musique le manga de Jirō Taniguchi.', s: 'tm' },
  // Gétigné, Gorges, Clisson
  { cat: 'famille', t: 'Atelier de fabrication de cartes', c: 'getigne', d: '2026-10-16', to: '2026-10-25', h: 'Voir l\'agenda de la commune', p: 'À confirmer', kids: true, place: 'Gétigné', desc: 'Atelier créatif de fabrication de cartes pendant la première semaine des vacances.', s: 'getigne' },
  { cat: 'expo', t: 'Hors des sentiers battus', c: 'getigne', d: '2026-10-07', to: '2026-10-31', h: 'Aux heures d\'ouverture de la bibliothèque', p: 'À confirmer', place: 'Bibliothèque des Changes', desc: 'Exposition photographique de la bibliothèque.', s: 'getigne' },
  { cat: 'expo', t: 'À la découverte de carnets de voyage', c: 'getigne', d: '2026-10-02', to: '2026-10-31', h: 'Aux heures d\'ouverture de la bibliothèque', p: 'À confirmer', place: 'Bibliothèque des Changes', desc: 'Une sélection de carnets de voyage à découvrir à la bibliothèque.', s: 'getigne' },
  { cat: 'famille', t: 'Prix des Bébés Lecteurs', c: 'getigne', d: '2026-10-03', to: '2027-05-15', h: 'Aux heures d\'ouverture de la bibliothèque', p: 'À confirmer', kids: true, place: 'Bibliothèque des Changes', desc: 'Prix littéraire pour les tout-petits proposé par la bibliothèque des Changes : on lit les livres en lice et on vote.', s: 'getigne' },
  { cat: 'spectacle', t: 'Un chapeau de paille d\'Italie', c: 'getigne', d: '2026-10-16', to: '2026-10-25', h: 'Plusieurs représentations, horaires à confirmer', p: 'À confirmer', place: 'Espace Bellevue', desc: 'Le nouveau spectacle de la SVVC (Spectacle Vivant de la Vallée de Clisson), d\'après la comédie d\'Eugène Labiche.', s: 'getigne' },
  { cat: 'famille', t: 'Atelier cyanotype enfants', c: 'getigne', d: '2026-10-21', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Bibliothèque des Changes', desc: 'Atelier de la bibliothèque pour les 6-11 ans : impressions de plantes au cyanotype, la photo révélée au soleil.', s: 'getigne' },
  { cat: 'famille', t: 'Soirée jeux de société', c: 'getigne', d: '2026-11-06', h: 'En soirée, horaire à confirmer', p: 'À confirmer', kids: true, place: 'Bibliothèque des Changes', desc: 'Animation de la bibliothèque : venez profiter d\'une soirée jeux.', s: 'getigne' },
  { cat: 'spectacle', t: 'Petits rendez-vous contes', c: 'getigne', d: '2026-11-18', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Bibliothèque des Changes', desc: 'Lectures de contes pour les enfants à la bibliothèque.', s: 'getigne' },
  { cat: 'expo', t: 'Garenne Lemot : Histoire d\'un jardin pittoresque', c: 'getigne', d: '2026-10-17', to: '2026-11-01', h: 'Visite guidée, horaire à confirmer', p: 'À confirmer', kids: true, place: 'Domaine de la Garenne Lemot', desc: 'Visite guidée du parc à l\'italienne créé par le sculpteur François Frédéric Lemot. Reprise du 7 au 29 novembre.', s: 'garenne' },
  { cat: 'expo', t: 'Garenne Lemot : Histoire d\'un jardin pittoresque', c: 'getigne', d: '2026-11-07', to: '2026-11-29', h: 'Visite guidée, horaire à confirmer', p: 'À confirmer', kids: true, place: 'Domaine de la Garenne Lemot', desc: 'Visite guidée du parc à l\'italienne créé par le sculpteur François Frédéric Lemot.', s: 'garenne' },
  { cat: 'expo', t: 'Le rêve italien de François Frédéric Lemot', c: 'getigne', d: '2026-10-20', to: '2026-12-31', h: 'Aux heures d\'ouverture du domaine', p: 'À confirmer', place: 'Maison du Jardinier, Domaine de la Garenne Lemot', desc: 'Exposition permanente de la Maison du Jardinier, ouverte de février à décembre. Le parc est en accès libre et gratuit.', s: 'garenne' },
  { cat: 'famille', t: 'Atelier scrapbooking', c: 'gorges', d: '2026-10-28', h: 'Horaire à confirmer', p: 'Complet', place: 'Médiathèque Au fil des mots', desc: 'Atelier créatif de la médiathèque. Annoncé complet.', s: 'gorgesMed' },
  { cat: 'famille', t: 'Atelier Bookface', c: 'gorges', d: '2026-10-29', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Médiathèque Au fil des mots', desc: 'Se prendre en photo en prolongeant une couverture de livre : un atelier photo ludique.', s: 'gorgesMed' },
  { cat: 'spectacle', t: 'Raconte-moi une histoire', c: 'gorges', d: '2026-11-04', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Médiathèque Au fil des mots', desc: 'Lecture d\'histoires pour les enfants.', s: 'gorgesMed' },
  { cat: 'concert', t: 'Soirée celtique et bal folk (Celtomania)', c: 'gorges', d: '2026-11-10', h: 'En soirée, horaire à confirmer', p: 'Voir la billetterie', place: 'Gorges', desc: 'Soirée cabaret irlandais et bal folk dans le cadre du festival Celtomania.', s: 'gorges' },
  { cat: 'spectacle', t: 'Histoires pour petites oreilles', c: 'gorges', d: '2026-11-18', h: 'Horaire à confirmer', p: 'À confirmer', kids: true, place: 'Médiathèque Au fil des mots', desc: 'Histoires et comptines pour les moins de 3 ans.', s: 'gorgesMed' },
  { cat: 'spectacle', t: 'Scène ouverte slam et poésie', c: 'gorges', d: '2026-11-20', h: 'En soirée, horaire à confirmer', p: 'À confirmer', place: 'Médiathèque Au fil des mots', desc: 'Soirée scène ouverte : venez dire vos textes ou simplement écouter.', s: 'gorgesMed' },
  { cat: 'expo', t: 'Exposition de champignons', c: 'boussay', d: '2026-10-24', to: '2026-10-25', h: 'Sam. 14h – 19h, dim. 10h – 13h et 14h – 18h', p: 'Gratuit', kids: true, place: 'Centre régional d\'accueil, 9 rue du Val-de-Sèvre', desc: 'Exposition de champignons de la région par la section de Boussay de l\'Association mycologique de l\'Ouest.', s: 'boussayChamp' },
  { cat: 'sport', t: 'Basket : Cholet contre Spartak Subotica', c: 'cholet', d: '2026-10-28', h: '20h00', p: 'Voir la billetterie', kids: true, place: 'La Meilleraie', desc: 'Basketball Champions League.', s: 'choletBasket' },
  { cat: 'concert', t: 'Florent Pagny : La Suite du Retour', c: 'saintherblain', d: '2026-11-06', h: '20h00', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert de la tournée 65 Tour. Une date est aussi annoncée le 5 novembre selon certaines billetteries.', s: 'zenith' },
  { cat: 'concert', t: 'Patrick Bruel', c: 'saintherblain', d: '2026-11-07', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert au Zénith.', s: 'zenith' },
  { cat: 'concert', t: 'Christophe Maé', c: 'saintherblain', d: '2026-11-08', h: '18h00', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Concert au Zénith.', s: 'zenith' },
  { cat: 'concert', t: 'Ben Mazué', c: 'saintherblain', d: '2026-11-12', h: '20h00', p: 'Voir la billetterie', place: 'Zénith Nantes Métropole', desc: 'Tournée des Zénith 2026.', s: 'zenith' },
  { cat: 'spectacle', t: 'Je-ne-sais-quoi', c: 'clisson', d: '2026-11-05', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Lieu à confirmer, agglo de Clisson', desc: 'Danse : nouvelle création du chorégraphe Laurent Cèbe, pour trois danseurs. Saison Bravoh!.', s: 'bravoh' },
  { cat: 'concert', t: 'Multitude', c: 'monnieres', d: '2026-11-14', h: 'Horaire à confirmer', p: 'Voir la billetterie', kids: true, place: 'Monnières', desc: 'Voyage musical de Thierry Combe et Damien Félix. Saison Bravoh!, aussi le 15 novembre à Boussay.', s: 'bravoh' },
  { cat: 'concert', t: 'Multitude', c: 'boussay', d: '2026-11-15', h: 'Horaire à confirmer', p: 'Voir la billetterie', kids: true, place: 'Boussay', desc: 'Voyage musical de Thierry Combe et Damien Félix. Saison Bravoh!.', s: 'bravoh' },
  { cat: 'spectacle', t: 'Titre définitif (titre provisoire)', c: 'clisson', d: '2026-11-20', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Lieu à confirmer, agglo de Clisson', desc: 'Concert de mentalisme de la compagnie Raoul Lambert. Saison Bravoh!.', s: 'bravoh' },
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
  { cat: 'spectacle', t: 'Rond-Rond', c: 'cholet', d: '2026-11-18', h: '10h00 et 16h30', p: 'Voir la billetterie', kids: true, place: 'Théâtre Saint-Louis, salle Gene Kelly', desc: 'Spectacle tout-petits de la compagnie Piment, Langue d\'Oiseau, pour les 1-5 ans.', s: 'stlouis' },
  { cat: 'spectacle', t: 'Mesdemoiselles', c: 'cholet', d: '2026-11-15', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Jardin de Verre', desc: 'Spectacle de la saison du Jardin de Verre.', s: 'jardinVerre' },
  { cat: 'concert', t: 'Plateau partagé : Coline Linder', c: 'cholet', d: '2026-11-19', h: 'Horaire à confirmer', p: 'Voir la billetterie', place: 'Jardin de Verre', desc: 'Soirée plateau partagé avec Coline Linder.', s: 'jardinVerre' },
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
// Films announced by each cinema. from = first screening announced there.
const FILMS = [
  { id: 'shaun', t: 'Shaun le Mouton : La Bêêête d\'Halloween', g: 'Animation', dur: '1h31', age: 'En famille', kids: true, s: { connetable: '2026-10-21' }, desc: 'Le troisième long métrage des studios Aardman avec Shaun et le troupeau, spécial Halloween.' },
  { id: 'mochy', t: 'Mochy', g: 'Animation', age: 'En famille', kids: true, s: { montaigu: '2026-10-14' }, desc: 'Film d\'animation belge sorti le 14 octobre.' },
  { id: 'marius', t: 'Marius et le Royaume des mers', g: 'Film', s: { connetable: '2026-10-18' }, desc: 'À l\'affiche au Connétable.' },
  { id: 'miserables', t: 'Les Misérables', g: 'Drame', s: { connetable: '2026-10-18', montaigu: '2026-10-14' }, desc: 'Nouvelle adaptation du roman de Victor Hugo, réalisée par Fred Cavayé.' },
  { id: 'karma', t: 'Karma', g: 'Thriller', s: { connetable: '2026-10-21' }, desc: 'Thriller de Guillaume Canet avec Marion Cotillard, dans le nord de l\'Espagne.' },
  { id: 'englouti', t: 'Englouti', g: 'Thriller', s: { montaigu: '2026-10-14' }, desc: 'Thriller américain sorti le 14 octobre.' },
  { id: 'ducobu', t: 'Ducobu et le fantôme de Saint-Potache', g: 'Comédie', age: 'En famille', kids: true, s: { montaigu: '2026-10-19', connetable: '2026-10-21' }, desc: 'Nouvelle aventure du cancre préféré des enfants, à l\'affiche pour les vacances.' },
  { id: 'residentevil', t: 'Resident Evil', g: 'Horreur', s: { montaigu: '2026-10-19' }, desc: 'À l\'affiche au cinéma de Montaigu-Vendée.' },
  { id: 'beauxjours', t: 'Les Beaux Jours', g: 'Film', s: { connetable: '2026-10-21' }, desc: 'À l\'affiche au Connétable.' },
  { id: 'femme', t: 'Une femme aujourd\'hui', g: 'Drame', s: { connetable: '2026-10-28' }, desc: 'Le nouveau film de Robert Guédiguian, annoncé au Connétable à partir du 28 octobre.' },
  { id: 'congoboy', t: 'Congo Boy', g: 'Film', s: { connetable: '2026-10-27' }, desc: 'Annoncé au Connétable à partir du 27 octobre.' },
  { id: 'moulin', t: 'Moulin', g: 'Drame historique', dur: '2h10', s: { connetable: '2026-10-28' }, desc: 'László Nemes raconte l\'arrestation de Jean Moulin en 1943 et son interrogatoire par Klaus Barbie. Avec Gilles Lellouche et Lars Eidinger. En compétition à Cannes 2026.' },
  { id: 'nivue', t: 'Ni vue, ni connue', g: 'Film', s: { connetable: '2026-10-18' }, desc: 'À l\'affiche au Connétable.' },
  { id: 'salut', t: 'Notre salut', g: 'Film', s: { connetable: '2026-10-23' }, desc: 'Annoncé au Connétable à partir du 23 octobre.' },
  { id: 'garance', t: 'Garance', g: 'Film', s: { connetable: '2026-10-25', montaigu: '2026-10-19' }, desc: 'Annoncé au Connétable à partir du 25 octobre, déjà à l\'affiche à Montaigu-Vendée.' },
  { id: 'minotaure', t: 'Minotaure', g: 'Film', s: { connetable: '2026-10-28' }, desc: 'Annoncé au Connétable à partir du 28 octobre.' },
  { id: 'fantome', t: 'Le Fantôme de l\'Opéra', g: 'Film', s: { connetable: '2026-10-28' }, desc: 'Annoncé au Connétable à partir du 28 octobre.' }
];

// Official posters for events whose source gives no photo. `page` is the organiser's or venue's
// own page for the event; the nightly collection reads the preview image that page declares.
// With `find`, `page` is a listing (a town agenda) and the image is the one shown next to that title.
const POSTERS = [
  { t: 'Kanine Parjure', d: '2026-10-24', c: 'montaigu', page: 'https://zinor.fr/a-faire/kanine-parjure-montaigu-amarok/', credit: 'Affiche : Le Zinor' },
  { t: 'Hors des sentiers battus', d: '2026-10-07', c: 'getigne', page: 'https://www.getigne.fr/sortir/agenda/', find: 'Hors des sentiers battus', credit: 'Image : mairie de Gétigné' },
  { t: 'À la découverte de carnets de voyage', d: '2026-10-02', c: 'getigne', page: 'https://www.getigne.fr/sortir/agenda/', find: 'À la découverte de carnets de voyage', credit: 'Image : mairie de Gétigné' },
  { t: 'Prix des Bébés Lecteurs', d: '2026-10-03', c: 'getigne', page: 'https://www.getigne.fr/sortir/agenda/', find: 'Prix des Bébés Lecteurs', credit: 'Image : mairie de Gétigné' },
  { t: 'Un chapeau de paille d\'Italie', d: '2026-10-16', c: 'getigne', page: 'https://www.getigne.fr/sortir/agenda/', find: 'Un chapeau de paille d\'Italie', credit: 'Image : mairie de Gétigné' },
  { t: 'Atelier cyanotype enfants', d: '2026-10-21', c: 'getigne', page: 'https://www.getigne.fr/sortir/agenda/', find: 'Atelier cyanotype enfants', credit: 'Image : mairie de Gétigné' },
  { t: 'Soirée jeux de société', d: '2026-11-06', c: 'getigne', page: 'https://www.getigne.fr/sortir/agenda/', find: 'Soirée jeux de société', credit: 'Image : mairie de Gétigné' }
];
