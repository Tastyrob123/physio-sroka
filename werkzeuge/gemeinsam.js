/* gemeinsam.js · was Übungspläne, Rechnungen, Profiltexte und die Übersicht gleich haben, gebaut aus dem Rahmen der Vorlage (rahmen/oberflaeche.js):
   Kopf, Rand, Leiste, Speichern mit Zuständen (R09: grau, gelb, grün mit Haken 2,6 s), Quittung (R11, höchstens drei, 9 s), Fenster (Escape schliesst),
   Nachfrage beim Verlassen mit offenen Eingaben (R13), letzte Ansicht gemerkt (R15), Speicher im Browser mit try/catch, Fotos der Website.
   Alles bleibt im Browser; kein Dienst, keine Kosten. */
(function () {
  'use strict';
  var H = window.WO_HAUS || {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var $ = function (s, w) { return (w || document).querySelector(s); };

  /* Fotos, die auf der Website stehen (gleiche Liste wie drucksachen/bau.py); Beschreibung aus den alt-Texten der Website */
  var FOTOS = [
    ['echt-hero-a', 'Zwei Hände liegen ruhig auf dem Rücken'], ['echt-fenster-a', 'Die Therapeutin tastet die Schulter ab'], ['echt-fenster-b', 'Behandlung an der Schulter im Liegen'],
    ['echt-cranio', 'Sanfte Behandlung an Schulter und Nacken'], ['echt-bobath', 'Der Therapeut führt den Arm der Patientin'], ['echt-neurologie', 'Der Therapeut hält und führt den Unterarm einer Patientin'],
    ['termin-behandeln', 'Behandlung am Rücken mit beiden Händen'], ['termin-untersuchen', 'Untersuchung am Knie'], ['echt-haende-warm', 'Ältere Hände in warmem Licht'],
    ['echt-haende-halten', 'Zwei Hände halten einander'], ['echt-gespraech', 'Ein heller Raum mit Sessel am Fenster'], ['termin-ankommen', 'Ein Gespräch im Sitzen, mit Notizen'],
    ['echt-alltag', 'Eine Hand hält die Hand eines Patienten'], ['echt-angehoerige', 'Ältere Hände ruhen auf einem Gehstock'],
    ['uebung-ruecken', 'Rückenübung im Liegen'], ['uebung-nacken', 'Nackenübung im Sitzen'], ['uebung-atem', 'Atemübung auf der Matte, von oben'],
    ['uebung-gleichgewicht', 'Übung für das Gleichgewicht am Strand'], ['termin-ueben', 'Übung auf der Matte mit dem Band'],
    ['echt-ruhe', 'Ein Mensch sitzt im Abendlicht auf einer Bank'], ['echt-yoga', 'Ein Mensch sitzt ruhig im Abendlicht'], ['unternehmen', 'Ein Team steht gemeinsam vor einer Wand mit Notizen']
  ].map(function (f) { return { key: f[0], alt: f[1], url: (H.site || '../') + 'media/' + f[0] + '.jpg' }; });
  var foto = function (k) { for (var i = 0; i < FOTOS.length; i++) if (FOTOS[i].key === k) return FOTOS[i]; return null; };

  /* Speicher im Browser (localStorage), nie ohne try/catch */
  var speicher = {
    ok: true,
    lies: function (k, ersatz) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : ersatz; } catch (e) { speicher.ok = false; return ersatz; } },
    schreib: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { speicher.ok = false; return false; } }
  };

  /* Kopf, Rand, Leiste aus dem Paket */
  function kopf(o) {
    var k = $('#kopf'); if (!k) return;
    k.innerHTML = WO.kopf({ werkzeug: o.werkzeug, unter: o.unter, titel: o.titel, stand: o.stand, website: H.wege.website, markeHref: o.markeHref || '#', marke: 'data-gehe="start"' });
    var m = $('.wo-marke-w', k); if (m) m.addEventListener('click', function (e) { if (o.marke) { e.preventDefault(); o.marke(); } });
  }
  function titel(t, stand) { var b = $('.wo-kopf__mitte b'), s = $('.wo-kopf__mitte small'); if (b) b.textContent = t; if (s && stand != null) s.textContent = stand; }
  function rand(gruppen) {
    var r = $('#rand'); if (!r) return;
    r.innerHTML = WO.rand(gruppen, { website: H.wege.website }) + '<div class="wo-rand__wege sr-weg-zurueck"><a href="' + H.wege.zentrale + '">Alle Werkzeuge' + WO.ic('pfeil') + '</a></div>';
  }

  /* Speichern-Knopf mit drei Zuständen und der Leiste unten */
  var offen = 0, fertigUhr = 0;
  function leiste(o) {
    var l = $('#leiste'); if (!l) return;
    var art = offen ? 'wartet' : (l.__fertig ? 'fertig' : 'glas');
    l.innerHTML = WO.leiste({ titel: o.titel, satz: o.satz, entwurf: !!offen,
      knoepfe: (o.knoepfe || '') + (o.speichern === false ? '' : WO.knopf(art === 'fertig' ? 'Gespeichert' : 'Speichern', 'haken', art, { id: 'l-sp', klein: true, titel: 'Speichern (Cmd S)' })) });
  }
  function aenderung(n) { offen = n == null ? offen + 1 : n; }
  function gespeichert(zeichne) {
    offen = 0; var l = $('#leiste'); if (l) { l.__fertig = 1; clearTimeout(fertigUhr); fertigUhr = setTimeout(function () { l.__fertig = 0; zeichne && zeichne(); }, 2600); }
    zeichne && zeichne();
  }
  addEventListener('beforeunload', function (e) { if (offen) { e.preventDefault(); e.returnValue = ''; } });

  /* Quittung (R11): höchstens drei übereinander, verschwindet nach 9 s, schliessen mit × */
  function meldung(titelT, satz, o) {
    o = o || {};
    var box = $('#meldung'); if (!box) { box = document.createElement('div'); box.id = 'meldung'; box.className = 'sr-meldungen'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    var q = document.createElement('div'); q.className = 'wo-quittung' + (o.fehler ? ' sr-quittung--fehler' : ''); q.setAttribute('role', 'status');
    q.innerHTML = '<i>' + WO.ic(o.fehler ? 'x' : 'haken') + '</i><span><b>' + esc(titelT) + '</b>' + esc(satz || '') + '</span>' + (o.zurueck ? '<a href="#" data-zurueck>Rückgängig</a>' : '') + '<button type="button" aria-label="Schließen">' + WO.ic('x') + '</button>';
    box.appendChild(q);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    var weg = function () { if (q.parentNode) q.parentNode.removeChild(q); };
    q.querySelector('button').addEventListener('click', weg);
    var z = q.querySelector('[data-zurueck]'); if (z) z.addEventListener('click', function (e) { e.preventDefault(); weg(); o.zurueck(); });
    setTimeout(weg, 9000);
  }

  /* Fenster: Escape schliesst, Klick daneben schliesst */
  function fenster(inhalt, o) {
    o = o || {};
    zu();
    var f = document.createElement('div'); f.id = 'fenster'; f.className = 'sr-fenster'; f.setAttribute('role', 'dialog'); f.setAttribute('aria-modal', 'true');
    f.innerHTML = '<div class="sr-fenster__karte' + (o.breit ? ' sr-fenster__karte--breit' : '') + '"><button type="button" class="sr-fenster__x" aria-label="Schließen">' + WO.ic('x') + '</button>' + inhalt + '</div>';
    document.body.appendChild(f); document.documentElement.classList.add('sr-fenster-auf');
    f.addEventListener('click', function (e) { if (e.target === f || e.target.closest('.sr-fenster__x')) zu(); });
    var erstes = f.querySelector('input,textarea,button:not(.sr-fenster__x)'); if (erstes) setTimeout(function () { erstes.focus({ preventScroll: true }); }, 30);
    return f;
  }
  function zu() { var f = $('#fenster'); if (f) f.remove(); document.documentElement.classList.remove('sr-fenster-auf'); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });

  /* Letzte Ansicht gemerkt (R15): aus der Übersicht geöffnet beginnt das Werkzeug immer vorne */
  function ansichtMerken(werkzeug, a) { try { sessionStorage.setItem('sr-ansicht-' + werkzeug, a); } catch (e) {} }
  function ansichtLesen(werkzeug) { try { if (/[?&]von=uebersicht/.test(location.search)) return null; return sessionStorage.getItem('sr-ansicht-' + werkzeug); } catch (e) { return null; } }

  function heute() { var d = new Date(); return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear(); }
  function id() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* Fehlermelder-Liste lesen (Werkzeug schreibt im Kopf der Seite nach sroka-werkzeuge-fehler) */
  window.WZ = { esc: esc, $: $, FOTOS: FOTOS, foto: foto, speicher: speicher, kopf: kopf, titel: titel, rand: rand, leiste: leiste, aenderung: aenderung, gespeichert: gespeichert,
    offen: function () { return offen; }, meldung: meldung, fenster: fenster, zu: zu, ansichtMerken: ansichtMerken, ansichtLesen: ansichtLesen, heute: heute, id: id };

  /* Blätter (A4) wie die Drucksachen der Werkstatt: Licht, feiner Goldrahmen, Zeichen, Titel in Cormorant, kleine Zeilen, Fuss mit Adresse.
     Seiten werden gemessen gesetzt: ein Block (Übung, Abschnittskopf, Rechnungszeile) bricht nie über eine Seite (Fehlerbuch F96, F34).
     Bildschirm und Druck zeigen dieselben Seiten. */
  function blaetter(ziel, o) {
    ziel.innerHTML = '';
    var seiten = [];
    function neueSeite() {
      var s = document.createElement('article'); s.className = 'sr-blatt' + (o.klasse ? ' ' + o.klasse : '');
      s.innerHTML = '<div class="sr-blatt__rahmen"></div><div class="sr-blatt__in"><div class="sr-blatt__inhalt"></div></div><footer class="sr-blatt__fuss"></footer>';
      ziel.appendChild(s); seiten.push(s);
      var inh = s.querySelector('.sr-blatt__inhalt');
      if (seiten.length === 1 && o.kopf) inh.insertAdjacentHTML('beforeend', o.kopf);
      else if (o.folgekopf) inh.insertAdjacentHTML('beforeend', o.folgekopf);
      return inh;
    }
    var inh = neueSeite();
    var box = function () { return inh.parentNode; };
    (o.bloecke || []).forEach(function (html) {
      inh.insertAdjacentHTML('beforeend', html);
      var neu = inh.lastElementChild;
      if (box().scrollHeight > box().clientHeight + 1 && inh.children.length > 1) {
        inh.removeChild(neu);
        var mit = inh.lastElementChild && inh.lastElementChild.classList.contains('sr-mitnaechstem') && inh.children.length > 1 ? inh.lastElementChild : null;   // Titel nie allein am Seitenende (F85)
        inh = neueSeite(); if (mit) inh.appendChild(mit); inh.appendChild(neu);
      }
    });
    if (o.schluss) {
      inh.insertAdjacentHTML('beforeend', o.schluss);
      var sc = inh.lastElementChild;
      if (box().scrollHeight > box().clientHeight + 1 && inh.children.length > 1) { inh.removeChild(sc); inh = neueSeite(); inh.appendChild(sc); }
    }
    seiten.forEach(function (s, i) { s.querySelector('.sr-blatt__fuss').innerHTML = (o.fuss || '') + (seiten.length > 1 ? '<span class="sr-blatt__nr">Seite ' + (i + 1) + ' von ' + seiten.length + '</span>' : ''); });
    return seiten;
  }
  /* Drucken: nur die Blätter, A4 ohne Rand (das Blatt bringt seinen Rand mit). Strg+P druckt dasselbe (beforeprint). */
  var druckQuelle = null;
  function druckBereit() {
    druckAus();
    if (!druckQuelle) return;
    var seiten = druckQuelle(); if (!seiten || !seiten.length) return;
    var d = document.createElement('div'); d.id = 'sr-druckbereich';
    seiten.forEach(function (x) { var k = x.cloneNode(true); k.removeAttribute('id'); d.appendChild(k); });
    document.body.appendChild(d); document.documentElement.classList.add('sr-druckt');
  }
  function druckAus() { var d = document.getElementById('sr-druckbereich'); if (d) d.remove(); document.documentElement.classList.remove('sr-druckt'); }
  addEventListener('beforeprint', druckBereit); addEventListener('afterprint', druckAus);
  function drucken() { druckBereit(); window.print(); setTimeout(druckAus, 600); }
  window.WZ.druckQuelle = function (f) { druckQuelle = f; };
  /* Massstab: die Blätter in echter Breite (210 mm), auf schmalen Schirmen verkleinert (transform, Platz mitgerechnet) */
  function massstab(huelle) {
    var stapel = huelle.firstElementChild; if (!stapel) return;
    stapel.style.transform = ''; huelle.style.height = '';
    var b = huelle.clientWidth, w = stapel.offsetWidth, k = Math.min(1, b / w);
    stapel.style.transform = k < 1 ? 'scale(' + k + ')' : ''; stapel.style.transformOrigin = '0 0';
    huelle.style.height = Math.ceil(stapel.offsetHeight * k) + 'px';
    return k;
  }
  window.WZ.blaetter = blaetter; window.WZ.drucken = drucken; window.WZ.massstab = massstab;
})();

/* Auftritt beim Hereinscrollen (Fehlerbuch F241): Karten, Zeilen und Kacheln unter dem ersten Bildschirm schweben 40 px an ihren Platz,
   nur transform, gestaffelt höchstens vier, nicht bei reduzierter Bewegung, nie auf den Blättern (die werden für den Druck geklont). */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var WAHL = '.sr-karte, .sr-zeile, .wo-ag, .ub-bk, .wo-lg';
  var io = new IntersectionObserver(function (es) {
    var n = 0;
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      el.style.transitionDelay = (Math.min(n++, 3) * 70) + 'ms';
      el.classList.add('sr-da');
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  function beobachte(wurzel) {
    [].forEach.call((wurzel || document).querySelectorAll(WAHL), function (el) {
      if (el.__srAuf || el.closest('.sr-blatt, #fenster, #sr-druckbereich')) return;
      el.__srAuf = 1;
      if (el.getBoundingClientRect().top < innerHeight) return;   // im ersten Bildschirm: steht sofort
      el.classList.add('sr-auf'); io.observe(el);
    });
  }
  function los() {
    var raum = document.getElementById('raum'); if (!raum) return;
    beobachte(raum);
    new MutationObserver(function () { beobachte(raum); }).observe(raum, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
