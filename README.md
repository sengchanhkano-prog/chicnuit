# Chicnuit — site officiel

Appartements meublés en location courte durée en Alsace (Strasbourg, Colmar, Erstein,
Schiltigheim, Illkirch-Graffenstaden). Réservation sur Airbnb.

## Structure
- `index.html` — accueil (diaporama, adresses, anneau 3D, questions)
- `apartments/*.html` — une page par logement (photos, équipements, quartier, carte)
- `faq.html` — questions fréquentes
- `assets/` — feuille de style et scripts (sans dépendance, sans tracker)
- `img/` — photos des annonces, servies localement

## Mise en ligne
Site statique publié par GitHub Pages. Aucun back-office, aucune base de données :
les dates et le paiement passent par Airbnb.

Généré par le moteur `chicnuit_redesign/v3` (source unique des textes : `v2/CONTENU_V2.md`).
