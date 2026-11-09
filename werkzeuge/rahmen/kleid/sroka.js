/* kleid/sroka.js · Hauswerte für oberflaeche.js (Physiotherapie Sylvia Sroka, Hannover und Hemmingen, 09.11.2026). Im <head> VOR allen Stilen laden (ohne defer).
   Umgekleidet aus _vorlage/oberflaeche/kleid/varone.js. Rahmen «Die Bühne» wie in der Vorlage Gilles Varone.
   Die Werkzeuge liegen auf GitHub Pages ohne Server und unter einem Unterordner: alle Wege werden deshalb aus der Lage dieser Datei gerechnet
   (nie /assets/…), die Tapete wird als volle Adresse in die Variable gelegt (UMSTELLUNG.md: url() in Variablen löst sich dort auf, wo sie benutzt wird). */
(function () {
  var s = document.currentScript, hier = s ? s.src : location.href;
  var RAHMEN = new URL('../', hier).href;            // werkzeuge/rahmen/
  var WZ = new URL('../../', hier).href;             // werkzeuge/
  var SITE = new URL('../../../', hier).href;        // die Website
  window.WO_HAUS = { kurz: 'sroka', name: 'Sylvia Sroka', voll: 'Physiotherapie Sylvia Sroka', ort: 'Hannover · Hemmingen', welt: 'land', rahmen: 'buehne',
    foto: SITE + 'media/echt-hero-a.jpg', fotoAlt: 'Zwei Hände liegen ruhig auf einem Rücken', zeichen: RAHMEN + 'kleid/sroka-zeichen.svg', zeichenMass: 1110 / 700,
    site: SITE, wz: WZ, rahmenWeg: RAHMEN,
    /* Namen der Werkzeuge: nach dem Zweck (Fehlerbuch F198, F228). Die EINE Stelle; Dateien und Adressen bleiben. */
    reihe: ['uebungen', 'rechnung', 'druck', 'profile'],
    namen: { zentrale: 'Deine Werkzeuge', uebungen: 'Übungspläne', rechnung: 'Rechnungen', druck: 'Drucksachen', profile: 'Profiltexte' },
    akk: { zentrale: 'Die Werkzeuge öffnen', uebungen: 'Die Übungspläne öffnen', rechnung: 'Die Rechnungen öffnen', druck: 'Die Drucksachen öffnen', profile: 'Die Profiltexte öffnen' },
    wege: { zentrale: WZ + 'index.html', uebungen: WZ + 'uebungsplan.html', rechnung: WZ + 'rechnung.html', druck: WZ + 'drucksachen/index.html', profile: WZ + 'profiltexte.html', website: SITE + 'index.html' } };
  var d = document.documentElement;
  d.setAttribute('data-wo-haus', 'sroka');
  d.setAttribute('data-wo-rahmen', 'buehne');
  d.style.setProperty('--wo-tapete', 'url("' + SITE + 'media/tapete-dunkel.png") 0 0/360px 360px,var(--wo-tief)');
  d.style.setProperty('--wo-tapete-fein', 'url("' + SITE + 'media/tapete-dunkel.png") 0 0/360px 360px');
  d.style.setProperty('--sr-tapete-hell', 'url("' + SITE + 'media/tapete-hell.png") 0 0/360px 360px');
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
})();
