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
  var slides = document.querySelectorAll(".hero-media .slide");
  if (slides.length > 1 && motionOK) {
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


/* ---------------------------------------------------------------- contact
   Formulaire « une date en tête ? » : POST vers le service de contact
   (nestreply-contact :8119 -> e-mail + Telegram). Cors simple : text/plain. */
document.querySelectorAll("form[data-contact]").forEach((f) => {
  const t0 = f.querySelector('input[name="t0"]');
  if (t0) t0.value = Date.now();
  const retour = f.querySelector(".contact-retour");
  const bouton = f.querySelector('button[type="submit"]');
  const liberate = "Envoyer la demande";

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
        retour.textContent = "Merci ! Votre demande est partie, nous vous répondons par e-mail.";
        f.reset();
      } else {
        retour.textContent = "Cela n'a pas fonctionné. Écrivez-nous directement sur Airbnb.";
        retour.classList.add("est-erreur");
      }
    } catch (err) {
      retour.textContent = "Cela n'a pas fonctionné. Écrivez-nous directement sur Airbnb.";
      retour.classList.add("est-erreur");
    } finally {
      bouton.disabled = false;
      bouton.textContent = liberate;
    }
  });
});
