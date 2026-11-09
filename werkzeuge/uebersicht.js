/* uebersicht.js · «Deine Werkzeuge»: die vier Werkzeuge der Praxis im Rahmen der Vorlage. Je Werkzeug ein Bild, Name, ein Satz, Knopf «… öffnen» (F237: richtiger Fall),
   dazu was im Browser liegt (Pläne, Rechnung, Drucksachen). Keine Bildschirmfotos. Rückweg zur Website im Kopf und im Rand. */
(function () {
  'use strict';
  var esc = WZ.esc, H = WO_HAUS;
  var lies = function (k) { return WZ.speicher.lies(k, null); };
  var plaene = Object.keys((lies('sroka-uebungsplaene') || {}).plaene || {}).length;
  var rech = lies('sroka-werkzeuge-rechnung');
  var docs = 0; try { var d = JSON.parse(localStorage.getItem('ds-sroka-docs') || 'null'); if (d) docs = Object.values(d).filter(function (x) { return !x.beispiel; }).length; } catch (e) {}
  var W = [
    { k: 'uebungen', foto: 'uebung-atem', ic: 'blatt', satz: 'Für jede Patientin und jeden Patienten ein eigener Plan: eigene Übungen oder die der Website als Ausgang, Abschnitte nach Wochen, Ziel und persönliche Notiz, gedruckt wie die Drucksachen.', stand: plaene ? plaene + (plaene === 1 ? ' Plan' : ' Pläne') + ' gespeichert' : 'Noch kein Plan, ein Beispiel liegt bereit' },
    { k: 'druck', foto: 'echt-fenster-a', ic: 'druck', satz: 'Die Werkstatt: Visitenkarte, Terminkarte, Übungsblatt, Aushang, Faltblatt, Briefpapier mit Umschlag, Karten für Bewertungen und die E-Mail-Signatur, bearbeiten wie in Canva und druckfertig als PDF.', stand: docs ? docs + ' eigene Drucksachen' : '74 fertige Vorlagen' },
    { k: 'rechnung', foto: 'termin-ankommen', ic: 'karte', satz: 'Rechnung für Privatpatienten: Standort, Leistungen und Summe, Steuernummer und Bankverbindung, «Umsatzsteuerfrei nach § 4 Nr. 14 UStG», gedruckt als A4.', stand: rech && rech.patient ? 'Zuletzt: ' + rech.patient : 'Keine Preise vorbelegt' },
    { k: 'profile', foto: 'echt-haende-halten', ic: 'welt', satz: 'Fertige Texte für Google in Hannover und Hemmingen und für jameda, zu jedem das genaue Feld, der Weg dorthin, ein Link, die Zeichengrenze und eine Skizze der Stelle.', stand: '12 Texte, 5 Schritte für dich' }
  ];
  WZ.kopf({ werkzeug: 'zentrale', unter: 'Werkzeuge', titel: 'Übersicht', stand: 'Vier Werkzeuge', markeHref: H.wege.zentrale });
  WZ.rand([{ eintraege: [{ text: 'Übersicht', an: true, href: H.wege.zentrale }] }, { titel: 'Werkzeuge', eintraege: W.map(function (w) { return { text: WO.name(w.k), href: H.wege[w.k] + '?von=uebersicht' }; }) }]);
  var l = document.getElementById('leiste'); if (l) l.remove();
  document.getElementById('raum').innerHTML = WO.startbild({ werkzeug: 'zentrale', art: 'buehne', zier: esc('Physiotherapie Sylvia Sroka · Hannover und Hemmingen'),
      h1: '<span data-wo-gruss>' + WO.gruss() + '</span> <em>Womit fangen wir an?</em>',
      satz: 'Vier Werkzeuge für die Praxis, gestaltet wie die Website. Alles, was du hier einträgst, bleibt in diesem Browser; nichts wird verschickt, nichts kostet etwas.',
      knoepfe: WO.knopf(H.akk.uebungen, 'pfeil', 'gold', { href: H.wege.uebungen + '?von=uebersicht' }) + WO.knopf('Zur Website', 'welt', 'glas', { href: H.wege.website }) })
    + '<h2 class="wo-zw">Deine <em>Werkzeuge</em></h2><div class="sr-raster uw-raster" style="--n:2">'
    + W.map(function (w) {
      return '<a class="wo-ag uw-karte" href="' + H.wege[w.k] + '?von=uebersicht"><span class="wo-ag__b"><img src="' + esc(WZ.foto(w.foto).url) + '" alt=""></span><span class="wo-ag__t"><i class="wo-ag__z">' + WO.ic(w.ic) + '</i>'
        + '<b>' + esc(WO.name(w.k)) + '</b><span>' + esc(w.satz) + '</span><small class="uw-stand">' + esc(w.stand) + '</small><span class="uw-kn">' + WO.knopf(H.akk[w.k], 'pfeil', 'gold', { klein: true }).replace(/^<button/, '<span').replace(/<\/button>$/, '</span>').replace(' type="button"', '') + '</span></span></a>';
    }).join('') + '</div>';
  window.__srBereit = true;
})();
