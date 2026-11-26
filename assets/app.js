/* Chicnuit — interactions communes aux 3 modèles */
(function () {
  "use strict";

  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var theme = document.body.getAttribute("data-theme") || "A";

  /* --- menu téléphone -------------------------------------------------- */
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu-mobile");
  function fermerMenu() {
    if (!burger || !menu) return;
    burger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    document.body.classList.remove("menu-ouvert");
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var ouvert = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!ouvert));
      menu.hidden = ouvert;
      document.body.classList.toggle("menu-ouvert", !ouvert);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) fermerMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fermerMenu();
    });
  }

  /* --- apparition au roulement ----------------------------------------- */
  var cibles = document.querySelectorAll(
    ".addr, .ess, .g, .promesse, .faq-item, .fiche, .detail-texte > *, " +
    ".ou-texte > *, .ou-carte, .manifeste-in > *, .adresses-tete > *, " +
    ".galerie-tete > *, .cta-in > *, .bientot-in > *"
  );
  if (cibles.length && "IntersectionObserver" in window && motionOK) {
    Array.prototype.forEach.call(cibles, function (el, i) {
      el.classList.add("reveal");
      el.style.setProperty("--d", (Math.min(i % 6, 5) * 0.07).toFixed(2) + "s");
    });
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("est-visible"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(cibles, function (el) { obs.observe(el); });
  } else {
    Array.prototype.forEach.call(cibles, function (el) { el.classList.add("est-visible"); });
  }

  /* --- diaporama du héros ---------------------------------------------- */
  /* Une diapositive toutes les 3 secondes, toujours (même en mouvement réduit :
     un fondu n'est pas un grand déplacement). Décision Bolton 26/11/2026 :
     « 3 secondes, comme ça les gens voient tous les appartements ». */
  var slides = document.querySelectorAll(".hero-media .slide");
  if (slides.length > 1) {
    var i = 0;
    window.setInterval(function () {
      slides[i].classList.remove("is-on");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-on");
    }, 3000);
  }

  /* --- parallaxe douce du héros --------------------------------------- */
  var heroMedia = document.querySelector(".hero-media");
  if (heroMedia && motionOK) {
    var ticking = false;
    var appliquer = function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.4) {
        heroMedia.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0)";
      }
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(appliquer); }
    }, { passive: true });
  }

  /* --- inclinaison légère des cartes (modèle B) ------------------------ */
  if (theme === "B" && motionOK && window.matchMedia("(pointer: fine)").matches) {
    Array.prototype.forEach.call(document.querySelectorAll(".addr-cadre"), function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* --- anneau 3D des logements ---------------------------------------- */
  var piste3d = document.querySelector("[data-anneau]");
  if (piste3d) {
    var scene = piste3d.parentElement;
    var angle = 0, vitesse = motionOK ? 0.10 : 0;   // degrés par image (~6°/s)
    var survol = false, appui = false, dernierX = 0, dernierT = 0, elan = 0;

    var rendre = function () {
      piste3d.style.transform = "rotateY(" + angle.toFixed(2) + "deg)";
    };
    var boucle = function () {
      if (!appui) {
        if (!survol) angle += vitesse;
        angle += elan;
        elan *= 0.94;
        if (angle > 360) angle -= 360;
        if (angle < 0) angle += 360;
        rendre();
      }
      window.requestAnimationFrame(boucle);
    };

    if (motionOK) {
      window.requestAnimationFrame(boucle);
      scene.addEventListener("mouseenter", function () { survol = true; });
      scene.addEventListener("mouseleave", function () { survol = false; appui = false; });

      var debut = function (x) {
        appui = true; dernierX = x; dernierT = Date.now(); elan = 0;
        if (scene.setPointerCapture && window.PointerEvent) { /* gardé simple */ }
      };
      var mouvement = function (x) {
        if (!appui) return;
        var dx = x - dernierX;
        angle += dx * 0.35;
        dernierX = x;
        var t = Date.now();
        elan = dx * 0.35 * 0.6;
        dernierT = t;
        rendre();
      };
      var fin = function () { appui = false; };

      scene.addEventListener("pointerdown", function (e) { debut(e.clientX); e.preventDefault(); });
      window.addEventListener("pointermove", function (e) { mouvement(e.clientX); });
      window.addEventListener("pointerup", fin);
      window.addEventListener("pointercancel", fin);

      // clavier : flèches pour tourner
      scene.setAttribute("tabindex", "0");
      scene.setAttribute("role", "region");
      scene.setAttribute("aria-label", "Les logements — flèches gauche et droite pour faire tourner");
      scene.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { angle -= 72; rendre(); e.preventDefault(); }
        if (e.key === "ArrowRight") { angle += 72; rendre(); e.preventDefault(); }
      });
    } else {
      // mouvement réduit : on présente les 5 cartes à plat
      piste3d.style.transform = "none";
      piste3d.classList.add("est-statique");
    }
  }

  /* --- mur d'images qui s'aplanit (modèle C) --------------------------- */
  var piste = document.querySelector(".galerie-piste");
  if (piste && theme === "C" && "IntersectionObserver" in window) {
    var obsPiste = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        piste.classList.toggle("est-aplatie", e.isIntersecting);
      });
    }, { rootMargin: "-20% 0px -20% 0px" });
    obsPiste.observe(piste);
  }
})();


/* ---------------------------------------------------------------- vos dates
   Dates choisies par le visiteur -> moteur de réservation Beds24 chargé dans un
   cadre avec les dates et le nombre de voyageurs : c'est LUI qui affiche le prix
   exact et la disponibilité (aucun prix recalculé côté site). */
document.querySelectorAll("form[data-reserver]").forEach((f) => {
  const fenetre = document.querySelector("[data-fenetre]");
  if (!fenetre) return;
  const cadre = fenetre.querySelector("iframe");
  const rouleau = fenetre.querySelector("[data-rouleau]");
  const boutonFermer = fenetre.querySelector(".moteur-fermer");
  const retour = f.querySelector(".reserver-retour") || f.parentElement.querySelector(".reserver-retour");
  const bouton = f.querySelector('button[type="submit"]');
  const arrivee = f.elements.arrivee, depart = f.elements.depart, voyageurs = f.elements.voyageurs;
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  arrivee.min = iso(aujourdhui);
  depart.min = iso(aujourdhui);
  let minuteur = null;

  const enDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const enTexte = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  const afficher = () => {
    if (!arrivee.value || !depart.value) {
      retour.textContent = "Le prix dépend des dates\u00a0: il s\u2019affiche dès que vos deux dates sont choisies.";
      retour.classList.remove("est-erreur");
      return false;
    }
    const da = enDate(arrivee.value), dd = enDate(depart.value);
    const nuits = Math.round((dd - da) / 86400000);
    retour.classList.add("est-erreur");
    if (da < aujourdhui) { retour.textContent = "Choisissez une arrivée à partir d\u2019aujourd\u2019hui."; return false; }
    if (nuits < 1) { retour.textContent = "Le départ doit être après l\u2019arrivée."; return false; }
    if (nuits > 28) { retour.textContent = "Pour un séjour de plus de 28 nuits, écrivez-nous avec le formulaire en bas de page."; return false; }
    retour.classList.remove("est-erreur");
    const pluriel = voyageurs.value === "1" ? "voyageur" : "voyageurs";
    retour.textContent = nuits + (nuits > 1 ? " nuits" : " nuit") + " · du " + enTexte(da) + " au " + enTexte(dd)
      + " · " + voyageurs.value + "\u00a0" + pluriel;
    const url = "https://www.beds24.com/booking.php?propid=" + encodeURIComponent(f.dataset.propid)
      + "&checkin=" + arrivee.value + "&checkout=" + depart.value + "&adults=" + voyageurs.value;
    if (cadre.getAttribute("src") !== url) cadre.src = url;
    else aPlacer = true;
    // les dates choisies préremplissent le formulaire de contact
    const dates = document.querySelector("form[data-contact] input[name=\"dates\"]");
    if (dates) dates.value = "Du " + enTexte(da) + " au " + enTexte(dd) + " · " + voyageurs.value + "\u00a0" + pluriel;
    return true;
  };

  /* La page du moteur Beds24 commence par un grand diaporama : le prix se trouve plus bas
     (mesuré le 26/11/2026 : 567 px de haut au bureau ; sur téléphone, selon la largeur).
     On fait donc défiler la fenêtre jusqu'à la barre de recherche et le prix. Si la
     disposition de Beds24 change, ce défilement tombe simplement un peu à côté :
     rien n'est masqué, tout reste accessible en défilant. */
  const positionPrix = (largeur) => {
    if (largeur >= 768) return 567;
    if (largeur <= 414) return Math.round(2.667 * largeur + 235);
    return null;
  };
  let aPlacer = false, touche = false;
  const placer = () => {
    aPlacer = false;
    if (fenetre.hidden) return;
    const largeur = rouleau.clientWidth;
    const y = positionPrix(largeur);
    if (y === null) { rouleau.scrollTo(0, 0); return; }
    rouleau.scrollTo(0, Math.max(0, y - (largeur < 621 ? 500 : 265)));
  };
  cadre.addEventListener("load", () => {
    window.setTimeout(() => { if (!touche) placer(); }, 1500);
    window.setTimeout(() => { if (!touche && aPlacer === false && !fenetre.hidden && rouleau.scrollTop === 0) placer(); }, 4500);
  });
  fenetre.addEventListener("wheel", () => { touche = true; }, { passive: true });
  fenetre.addEventListener("touchstart", () => { touche = true; }, { passive: true });

  const ouvrir = () => {
    fenetre.hidden = false;
    document.body.classList.add("moteur-ouvert");
    boutonFermer.focus();
    touche = false;
    window.requestAnimationFrame(placer);
  };
  const fermer = () => {
    fenetre.hidden = true;
    document.body.classList.remove("moteur-ouvert");
    if (bouton) bouton.focus();
  };
  fenetre.querySelectorAll("[data-fermer]").forEach((el) => el.addEventListener("click", fermer));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !fenetre.hidden) fermer(); });

  f.addEventListener("submit", (e) => { e.preventDefault(); if (afficher()) ouvrir(); });
  f.addEventListener("change", (e) => {
    clearTimeout(minuteur);
    const champ = e.target;
    minuteur = setTimeout(() => {
      const ok = afficher();
      if (ok && (champ === arrivee || champ === depart)) ouvrir();
    }, 350);
  });
});


/* ---------------------------------------------------------------- contact
   Formulaire « Écrivez-nous, on répond vite » : POST vers le service de contact
   (nestreply-contact :8119 -> e-mail dans la boîte personnelle de Kano + Telegram).
   Cors simple : text/plain. */
document.querySelectorAll("form[data-contact]").forEach((f) => {
  const t0 = f.querySelector('input[name="t0"]');
  if (t0) t0.value = Date.now();
  const retour = f.querySelector(".contact-retour");
  const bouton = f.querySelector('button[type="submit"]');
  const libelle = bouton ? bouton.textContent : "Envoyer";
  const mail = f.dataset.mail || "";

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    if (d.website) return;                       // champ piège rempli = robot
    if (!d.nom || !d.email || !d.message) {
      retour.textContent = "Merci de remplir votre nom, votre e-mail et un message.";
      retour.classList.add("est-erreur");
      return;
    }
    bouton.disabled = true;
    bouton.textContent = "Envoi…";
    retour.classList.remove("est-erreur");
    try {
      const r = await fetch("https://nestreply.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          nom: d.nom,
          email: d.email,
          message: (d.dates ? "Dates souhaitées : " + d.dates + "\n\n" : "") + d.message,
          entreprise: "Chicnuit — " + f.dataset.logement,
          offre: f.dataset.logement,
          site: location.href,
          origine: "chicnuit",
          t0: d.t0,
          website2: d.website2 || ""
        })
      });
      const j = await r.json();
      if (j.ok) {
        retour.textContent = "Merci ! Votre demande est partie\u00a0: on vous répond par e-mail.";
        f.reset();
      } else {
        throw new Error("refus " + r.status);
      }
    } catch (err) {
      retour.textContent = "Cela n\u2019a pas fonctionné. Écrivez-nous directement à " + mail + ".";
      retour.classList.add("est-erreur");
    } finally {
      bouton.disabled = false;
      bouton.textContent = libelle;
    }
  });
});

/* ---------------------------------------------------------------- dates prises
   Kano 26/11 : les dates déjà réservées sont barrées tout de suite dans le calendrier.
   dispo.json (racine du site) = nuits indisponibles par logement, exporté de Beds24
   toutes les 30 min (dispo_export.py). Sans ce fichier : calendrier normal, le moteur
   Beds24 reste juge de la disponibilité. */
(function () {
  var f = document.querySelector("form[data-reserver][data-slug]");
  if (!f || !window.fetch || !window.Promise) return;
  var V = "https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/";
  var charger = function (src, css) {
    return new Promise(function (ok, ko) {
      var e = document.createElement(css ? "link" : "script");
      if (css) { e.rel = "stylesheet"; e.href = src; } else { e.src = src; }
      e.onload = ok; e.onerror = ko; document.head.appendChild(e);
    });
  };
  var iso = function (d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  var dispo = fetch("../dispo.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  Promise.all([dispo, charger(V + "flatpickr.min.css", true), charger(V + "themes/dark.css", true),
               charger(V + "flatpickr.min.js")])
    .then(function (r) { return charger(V + "l10n/fr.js").then(function () { return r[0]; }); })
    .then(function (d) {
      if (!window.flatpickr) return;
      var pris = {};
      ((d && d.logements && d.logements[f.dataset.slug]) || []).forEach(function (s) { pris[s] = 1; });
      var nuitPrise = function (x) { return !!pris[iso(x)]; };
      var arr = f.elements.arrivee, dep = f.elements.depart;
      var commun = { locale: flatpickr.l10ns.fr, dateFormat: "Y-m-d", altInput: true, altFormat: "j M Y",
                     disableMobile: true, minDate: "today", maxDate: (d && d.jusqu_au) || null };
      var departOk = function (x) {
        if (!arr.value) return true;
        var a = new Date(arr.value + "T00:00:00");
        if (x <= a) return false;
        for (var n = new Date(a); n < x; n.setDate(n.getDate() + 1)) if (nuitPrise(n)) return false;
        return true;
      };
      var fpDep = flatpickr(dep, Object.assign({}, commun, { disable: [function (x) { return !departOk(x); }] }));
      flatpickr(arr, Object.assign({}, commun, {
        disable: [nuitPrise],
        onChange: function (sel) {
          if (!sel[0]) return;
          fpDep.set("disable", [function (x) { return !departOk(x); }]);
          if (dep.value && !departOk(new Date(dep.value + "T00:00:00"))) fpDep.clear();
          fpDep.jumpToDate(sel[0]);
          window.setTimeout(function () { fpDep.open(); }, 80);
        }
      }));
      if (d && d.logements) {
        var p = document.createElement("p");
        p.className = "reserver-legende";
        p.textContent = "Les dates barrées sont déjà réservées.";
        var ret = f.parentElement.querySelector(".reserver-retour");
        (ret || f).insertAdjacentElement("afterend", p);
      }
    }).catch(function () { /* CDN injoignable : les champs de date d'origine restent */ });
})();
