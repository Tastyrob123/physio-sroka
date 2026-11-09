/* Gemeinsames für alle Werkzeuge: Praxisdaten, Zeichen, Pfeil-Knauf, Kopieren, Drucken, Massstab. */
(function () {
  'use strict';

  var PRAXIS = {
    name: 'Sylvia Sroka',
    beruf: 'Physiotherapie',
    email: 'info@physio-sroka.de',
    zeiten: 'Montag bis Freitag 8 bis 19 Uhr',
    zeitenKurz: 'Mo – Fr · 8 – 19 Uhr',
    termine: 'Termine nach Vereinbarung, Hausbesuche nach Absprache',
    standorte: {
      hannover: {
        ort: 'Hannover',
        praxis: 'Privatpraxis Physiotherapie Sylvia Sroka',
        kurz: 'Privatpraxis Sylvia Sroka',
        strasse: 'Dieterichsstraße 25',
        plzOrt: '30159 Hannover',
        telefon: '0511 260 74 14',
        tel: '+495112607414',
        fax: '0511 260 74 13'
      },
      hemmingen: {
        ort: 'Hemmingen',
        praxis: 'Physio Rosenpark, Praxis für Physio- und Körperpsychotherapie',
        kurz: 'Physio Rosenpark',
        strasse: 'Berliner Straße 16',
        plzOrt: '30966 Hemmingen',
        telefon: '0511 234 46 67',
        tel: '+495112344667',
        fax: '0511 655 06 827'
      }
    }
  };

  var PFEIL = '<span class="knauf"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></span>';
  var PFEIL_LINKS = '<span class="knauf"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4"/></svg></span>';

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function heute() {
    var d = new Date();
    return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear();
  }

  /* Zeichen und Pfeile einsetzen */
  function einsetzen(wurzel) {
    wurzel = wurzel || document;
    wurzel.querySelectorAll('[data-zeichen]').forEach(function (el) {
      if (!el.querySelector('svg') && window.ZEICHEN) el.insertAdjacentHTML('afterbegin', window.ZEICHEN);
    });
    wurzel.querySelectorAll('.knopf[data-pfeil]').forEach(function (el) {
      if (!el.querySelector('.knauf')) el.insertAdjacentHTML('beforeend', el.getAttribute('data-pfeil') === 'links' ? PFEIL_LINKS : PFEIL);
    });
  }

  /* Text oder HTML in die Zwischenablage */
  function kopieren(text, html) {
    function altweg() {
      var ok = false;
      var feld;
      if (html) {
        feld = document.createElement('div');
        feld.innerHTML = html;
        feld.contentEditable = 'true';
      } else {
        feld = document.createElement('textarea');
        feld.value = text;
      }
      feld.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(feld);
      try {
        if (html) {
          var r = document.createRange();
          r.selectNodeContents(feld);
          var s = window.getSelection();
          s.removeAllRanges();
          s.addRange(r);
        } else {
          feld.select();
        }
        ok = document.execCommand('copy');
      } catch (e) { ok = false; }
      if (window.getSelection) window.getSelection().removeAllRanges();
      feld.remove();
      return ok ? Promise.resolve() : Promise.reject(new Error('Kopieren nicht möglich'));
    }
    try {
      if (html && navigator.clipboard && window.ClipboardItem) {
        var item = new window.ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' })
        });
        return navigator.clipboard.write([item]).catch(altweg);
      }
      if (!html && navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(altweg);
      }
    } catch (e) { /* weiter mit dem alten Weg */ }
    return altweg();
  }

  /* Knopf meldet kurz «Kopiert» */
  function melden(knopf, wort) {
    var text = knopf.querySelector('.wort');
    if (!text) return;
    var alt = text.getAttribute('data-alt') || text.textContent;
    text.setAttribute('data-alt', alt);
    text.textContent = wort;
    knopf.classList.add('gemeldet');
    clearTimeout(knopf._zeit);
    knopf._zeit = setTimeout(function () {
      text.textContent = alt;
      knopf.classList.remove('gemeldet');
    }, 1800);
  }

  /* Drucken: das Blatt wird in einen eigenen Bereich kopiert, die Seitengrösse kommt aus @page */
  var vorbereitet = false;
  function druckVorbereiten(blaetter, groesse, rand) {
    druckAufraeumen();
    var bereich = document.createElement('div');
    bereich.id = 'w-druckbereich';
    (Array.isArray(blaetter) ? blaetter : [blaetter]).forEach(function (blatt) {
      var kopie = blatt.cloneNode(true);
      kopie.removeAttribute('id');
      kopie.style.zoom = '';
      kopie.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      bereich.appendChild(kopie);
    });
    document.body.appendChild(bereich);
    var stil = document.createElement('style');
    stil.id = 'w-druckseite';
    stil.textContent = '@page{size:' + groesse + ';margin:' + (rand || '0') + '}';
    document.head.appendChild(stil);
    document.body.classList.add('w-druckt');
    vorbereitet = true;
  }
  function druckAufraeumen() {
    var b = document.getElementById('w-druckbereich');
    var s = document.getElementById('w-druckseite');
    if (b) b.remove();
    if (s) s.remove();
    document.body.classList.remove('w-druckt');
    vorbereitet = false;
  }
  function drucken(blaetter, groesse, rand) {
    druckVorbereiten(blaetter, groesse, rand);
    window.print();
  }
  window.addEventListener('afterprint', druckAufraeumen);
  /* Drucken über das Browser-Menü: Seite kann ein Standardblatt angeben */
  window.addEventListener('beforeprint', function () {
    if (vorbereitet || typeof W.standardDruck !== 'function') return;
    W.standardDruck();
  });

  /* Blätter in echter Grösse, auf schmalen Schirmen verkleinert */
  function massstab() {
    document.querySelectorAll('[data-massstab]').forEach(function (huelle) {
      var blatt = huelle.firstElementChild;
      if (!blatt) return;
      blatt.style.zoom = '';
      var breite = blatt.offsetWidth;
      var platz = huelle.clientWidth;
      var z = breite > platz ? platz / breite : 1;
      blatt.style.zoom = z < 1 ? String(Math.floor(z * 1000) / 1000) : '';
      var hinweis = huelle.parentNode.querySelector('.w-verkleinert');
      if (hinweis) hinweis.hidden = !(z < 1);
    });
  }
  var warte;
  window.addEventListener('resize', function () { clearTimeout(warte); warte = setTimeout(massstab, 80); });

  /* Sicheres Merken im Browser */
  function merken(schluessel, wert) {
    try { localStorage.setItem(schluessel, JSON.stringify(wert)); return true; } catch (e) { return false; }
  }
  function holen(schluessel) {
    try {
      var t = localStorage.getItem(schluessel);
      return t ? JSON.parse(t) : null;
    } catch (e) { return null; }
  }
  function vergessen(schluessel) {
    try { localStorage.removeItem(schluessel); } catch (e) { /* nichts */ }
  }

  /* Kopfzeile mit Zeichen und Praxisdaten (für Übungsplan und Rechnung) */
  function briefkopf(standort) {
    var h = PRAXIS.standorte.hannover;
    var m = PRAXIS.standorte.hemmingen;
    function block(s, haupt) {
      return '<div class="w-bk-ort' + (haupt ? ' haupt' : '') + '"><p class="w-bk-name">' + esc(s.kurz) + '</p><p>' + esc(s.strasse) + ', ' + esc(s.plzOrt) +
        '</p><p>Telefon ' + esc(s.telefon) + ' · Fax ' + esc(s.fax) + '</p></div>';
    }
    var erst = standort === 'hemmingen' ? m : h;
    var zweit = standort === 'hemmingen' ? h : m;
    return '<header class="w-briefkopf"><div class="w-bk-marke"><span class="w-bk-zeichen" data-zeichen></span><div><p class="w-bk-titel">Sylvia Sroka</p><p class="w-bk-beruf">Physiotherapie · Privatpraxis</p></div></div>' +
      '<div class="w-bk-orte">' + block(erst, true) + block(zweit, false) + '<p class="w-bk-mail">' + esc(PRAXIS.email) + '</p></div></header>';
  }

  var W = window.W = {
    PRAXIS: PRAXIS,
    PFEIL: PFEIL,
    esc: esc,
    heute: heute,
    einsetzen: einsetzen,
    kopieren: kopieren,
    melden: melden,
    drucken: drucken,
    druckVorbereiten: druckVorbereiten,
    druckAufraeumen: druckAufraeumen,
    massstab: massstab,
    merken: merken,
    holen: holen,
    vergessen: vergessen,
    briefkopf: briefkopf,
    standardDruck: null
  };

  document.addEventListener('DOMContentLoaded', function () {
    einsetzen();
    massstab();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(massstab);
  });
})();
