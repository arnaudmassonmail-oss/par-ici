# Par Ici Sorties

Application web statique (aucun build) publiée sur Render depuis `public/`. Chaque push sur `main` redéploie le site.

Les sorties viennent de deux fichiers, fusionnés par la page :
- `public/auto.js` : collecte automatique de la nuit (OpenAgenda + DATAtourisme), écrite par `scripts/auto-update.mjs` via la tâche GitHub `.github/workflows/auto-update.yml`. Ne jamais le modifier à la main.
- `public/data.js` : partie manuelle, mise à jour par Claude à la demande. Un événement de `auto.js` qui reprend un événement manuel (même jour, titre proche, même commune) est masqué.

## « mets à jour les événements de par-ici »

Quand l'utilisateur demande cette mise à jour :

1. Ne modifie que `public/data.js`. Le design et la logique (`public/index.html`) ne changent pas.
   La collecte automatique couvre déjà bien Terres de Montaigu (dont Cugand), Sèvremoine, Cholet et Nantes. Concentre la recherche manuelle sur ce qu'elle rate : le cinéma (`FILMS`), Clisson (château, Connétable), Gétigné, Gorges, Boussay et les grandes salles. Regarde `public/auto.js` pour ne pas ajouter ce qui y est déjà.
2. Cherche les événements des 31 prochains jours dans un rayon de 50 km autour de Cugand (85610) : Cugand-la-Bernardière, Clisson, Gétigné, Gorges, Boussay, Terres de Montaigu, Cholet, Les Herbiers, Mortagne-sur-Sèvre, Saint-Laurent-sur-Sèvre, vignoble nantais, Nantes. Catégories : `cinema`, `concert`, `expo`, `marche`, `sport`, `spectacle`, `famille`. Utilise WebSearch (WebFetch est souvent bloqué par le réseau de la session).
3. Dans `data.js` : retire les événements terminés, ajoute les nouveaux, corrige ceux qui ont changé, et mets `UPDATED` à la date du jour. Garde le format des objets (`cat, t, c, d, to, h, p, kids, place, desc, s`). Toute nouvelle commune va dans `C` avec ses vraies coordonnées GPS, toute nouvelle source dans `SRC` avec son URL.
4. Films : `FILMS` liste les films annoncés au Connétable (Clisson) et au cinéma de Montaigu-Vendée, avec seulement la date de début par cinéma. Pas d'horaires de séances.
5. N'invente jamais un événement, un horaire, un prix ou un film. Si une information manque : « Horaire à confirmer » ou « À confirmer ».
6. Vérifie la syntaxe (`node --check public/data.js`), commit, push sur `main`, puis résume en français : événements ajoutés, retirés, total, et sources inaccessibles.
