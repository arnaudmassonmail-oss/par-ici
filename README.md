# Par Ici Sorties

Application web familiale qui rassemble les sorties autour de chez soi : concerts, expos, marchés, sport, spectacles, cinéma et sorties en famille. Filtres par catégorie, distance (5 à 50 km) et période (week-end, semaine, mois). Géolocalisation du téléphone, avec choix manuel de la commune en secours.

Site statique, sans dépendance ni étape de build.

## Fonctionnement

- **Partout en France** : `server/index.mjs` sert l'appli et répond à `/api/events?lat=…&lon=…`. Il interroge DATAtourisme puis OpenAgenda (agendas cherchés avec la commune, le département et les communes où DATAtourisme trouve des sorties) dans un rayon de 50 km, et garde la réponse 6 h par zone d'environ 10 km. La collecte elle-même est dans `lib/collect.mjs`.
- **Autour de Cugand**, en plus : `public/data.js` (partie manuelle : cinéma, Clisson, Gétigné…) et `public/auto.js` (collecte de nuit et images des sorties manuelles), mis à jour par la tâche GitHub « Collecte automatique des sorties ».
- La page fusionne tout et masque les doublons. Sans serveur (copie statique), elle garde `auto.js`.
- Recherche de commune ou de code postal et nom de la commune après géolocalisation : Géoplateforme IGN (`data.geopf.fr`, gratuit, sans clé).

## Fichiers

- `public/index.html` : l'application.
- `public/data.js` : partie manuelle. `public/auto.js` : collecte de nuit, ne pas modifier à la main.
- `lib/collect.mjs` : collecte OpenAgenda + DATAtourisme autour d'un point.
- `server/index.mjs` : serveur (appli + `/api/events`).
- `scripts/auto-update.mjs` : collecte de nuit (Cugand). `scripts/test-zone.mjs` : test de la collecte à Lyon, Rennes, Gap et Clisson (tâche GitHub « Test de la collecte ailleurs en France », compte rendu dans `scripts/test-zone.log`).
- `render.yaml` : configuration Render.

## Mise en ligne sur Render (service web)

1. Sur [dashboard.render.com](https://dashboard.render.com) : **New → Web Service**, dépôt `par-ici`.
2. **Runtime** : Node · **Build Command** : `echo ok` · **Start Command** : `node server/index.mjs` · **Instance Type** : Free.
3. **Environment** : ajouter `OPENAGENDA_KEY` et `DATATOURISME_KEY` (les mêmes clés que dans les secrets GitHub).
4. **Create Web Service**. Sur l'offre gratuite, le serveur s'endort après 15 min sans visite : la première ouverture suivante prend 30 à 60 s.

## Installer sur le téléphone

Ouvrez l'adresse du site, puis :
- **iPhone (Safari)** : bouton Partager → « Sur l'écran d'accueil ».
- **Android (Chrome)** : menu ⋮ → « Ajouter à l'écran d'accueil ».

## Tester en local

```sh
python3 -m http.server 8000 -d public
```
puis ouvrir http://localhost:8000. La géolocalisation fonctionne sur `localhost` et en HTTPS.

## Collecte automatique gratuite

Chaque nuit, la tâche GitHub « Collecte automatique des sorties » lance `scripts/auto-update.mjs`, qui interroge OpenAgenda et DATAtourisme (clés gratuites dans les secrets `OPENAGENDA_KEY` et `DATATOURISME_KEY`) et écrit `public/auto.js`. La page fusionne ce fichier avec `public/data.js`, la partie manuelle (cinéma, Clisson, Gétigné, Gorges…). Le compte rendu de la dernière collecte est dans `scripts/last-run.log`.

Pour relancer la collecte à la main : onglet Actions → « Collecte automatique des sorties » → Run workflow.
