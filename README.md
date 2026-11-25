# Chicnuit — site officiel

Appartements meublés en location courte durée en Alsace (Strasbourg, Colmar, Erstein,
Schiltigheim, Illkirch-Graffenstaden). Réservation en direct ou sur Airbnb.

## Structure
- `index.html` — accueil (diaporama, adresses, anneau 3D, questions)
- `apartments/*.html` — une page par logement (photos, équipements, quartier, carte)
- `faq.html` — questions fréquentes et formulaire de contact
- `assets/` — feuille de style et scripts (sans dépendance, sans tracker)
- `img/` — photos des annonces, servies localement

## Mise en ligne
Site statique publié par GitHub Pages. Aucun back-office, aucune base de données :
le visiteur choisit ses dates et le moteur de réservation Beds24 affiche le prix
exact (aucun prix n'est écrit en dur) ; sinon, renvoi vers Airbnb.

Généré par le moteur `chicnuit_redesign/v3` (source unique des textes : `v2/CONTENU_V2.md`).
