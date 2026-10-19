# Par Ici Sorties

Application web familiale qui rassemble les sorties autour de chez soi : concerts, expos, marchés, sport, spectacles, cinéma et sorties en famille. Filtres par catégorie, distance (5 à 50 km) et période (week-end, semaine, mois). Géolocalisation du téléphone, avec choix manuel de la commune en secours.

Site statique, sans dépendance ni étape de build.

## Fichiers

- `public/index.html` : l'application (design et logique).
- `public/data.js` : la partie manuelle (communes, sources, événements, marchés, cinémas, films). Pensez à changer `UPDATED` en haut du fichier.
- `public/auto.js` : la collecte automatique de la nuit. Ne pas modifier à la main.
- `public/manifest.webmanifest`, `public/icon*.png`, `public/icon.svg` : pour installer l'appli sur l'écran d'accueil du téléphone.
- `render.yaml` : configuration Render.

## Mise en ligne sur Render

1. Sur [dashboard.render.com](https://dashboard.render.com), cliquez **New → Static Site**.
2. Choisissez ce dépôt GitHub.
3. **Build Command** : `echo ok` · **Publish Directory** : `public`
4. Cliquez **Create Static Site**. L'adresse ressemble à `https://par-ici.onrender.com`.

Chaque `git push` sur `main` redéploie automatiquement le site.

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
