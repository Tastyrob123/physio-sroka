/* rechnung.js · Rechnung für Privatpatienten, umgezogen in den Rahmen der Vorlage (rahmen/oberflaeche.js). Funktion wie in der ersten Fassung:
   Standort Hannover oder Hemmingen, Patient und Anschrift, Rechnungsnummer, Rechnungsdatum, Zusatz, Positionen (Datum, Leistung, Anzahl, Einzelpreis)
   hinzufügen und entfernen, Summe automatisch, Steuernummer und Bankverbindung (bleiben für die nächste Rechnung), «Umsatzsteuerfrei nach § 4 Nr. 14 UStG».
   Keine Preise vorbelegt. Eingaben nur im Browser (localStorage «sroka-werkzeuge-rechnung», mit try/catch); gespeichert wird mit «Speichern» (R10).
   Das Blatt ist gesetzt wie die Drucksachen der Werkstatt, Positionen brechen nie mitten in der Zeile über eine Seite. */
(function () {
  'use strict';
  var esc = WZ.esc, $ = WZ.$;
  var K = 'sroka-werkzeuge-rechnung';
  var euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  var S = {
    hannover: { ort: 'Hannover', name: 'Privatpraxis Sylvia Sroka', strasse: 'Dieterichsstraße 25', plzOrt: '30159 Hannover', tel: '0511 260 74 14', fax: '0511 260 74 13' },
    hemmingen: { ort: 'Hemmingen', name: 'Physio Rosenpark', strasse: 'Berliner Straße 16', plzOrt: '30966 Hemmingen', tel: '0511 234 46 67', fax: '0511 655 06 827' }
  };
  var MAIL = 'info@physio-sroka.de';
  var leer = function () { return { datum: '', leistung: '', anzahl: '1', preis: '' }; };
  var z, gesichert, ansicht = 'rechnung';

  function lesen() {
    z = WZ.speicher.lies(K, null) || {};
    z.standort = z.standort === 'hemmingen' ? 'hemmingen' : 'hannover';
    if (!Array.isArray(z.positionen) || !z.positionen.length) z.positionen = [leer()];
    if (!z.datum) z.datum = WZ.heute();
    ['patient', 'anschrift', 'nummer', 'zusatz', 'steuernummer', 'bank'].forEach(function (k) { if (typeof z[k] !== 'string') z[k] = ''; });
    gesichert = JSON.stringify(z);
  }
  function zahl(t) { t = String(t || '').trim().replace(/\s|€/g, ''); if (!t) return 0; if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.'); var n = parseFloat(t); return isFinite(n) ? n : 0; }
  function betrag(p) { return Math.round(zahl(p.anzahl) * zahl(p.preis) * 100) / 100; }
  function summe() { return z.positionen.reduce(function (s, p) { return s + betrag(p); }, 0); }

  /* ---------- Blatt ---------- */
  function zeichneBlatt() {
    var h = $('#re-huelle'); if (!h) return;
    var s = S[z.standort], Z = window.ZEICHEN || '';
    var kopf = '<header class="re-kopf"><div class="re-marke">' + Z.replace('<svg ', '<svg class="re-zeichen" ') + '<div><h1>Physiotherapie Sylvia Sroka</h1><p>' + esc(s.name) + '</p></div></div>'
      + '<p class="re-absender">' + esc(s.name + ' · ' + s.strasse + ' · ' + s.plzOrt) + '</p>'
      + '<div class="re-oben"><p class="re-an">' + (esc([z.patient, z.anschrift].filter(function (x) { return x && x.trim(); }).join('\n')) || '<span class="re-luecke"></span><span class="re-luecke"></span><span class="re-luecke"></span>') + '</p>'
      + '<dl class="re-daten"><dt>Rechnungsnummer</dt><dd>' + (esc(z.nummer) || '<span class="re-luecke re-luecke--kurz"></span>') + '</dd><dt>Rechnungsdatum</dt><dd>' + esc(z.datum) + '</dd><dt>Ort</dt><dd>' + esc(s.ort) + '</dd></dl></div>'
      + '<h2 class="re-titel">Rechnung</h2>' + (z.zusatz.trim() ? '<p class="re-zusatz">' + esc(z.zusatz.trim()) + '</p>' : '')
      + '<div class="re-zeile re-zeile--kopf"><span>Datum</span><span>Leistung</span><span class="z">Anzahl</span><span class="z">Einzelpreis</span><span class="z">Betrag</span></div></header>';
    var zeilen = z.positionen.filter(function (p) { return p.leistung.trim() || p.datum.trim() || zahl(p.preis); });
    var bloecke = zeilen.length ? zeilen.map(function (p) {
      return '<div class="re-zeile"><span>' + esc(p.datum) + '</span><span>' + esc(p.leistung) + '</span><span class="z">' + esc(p.anzahl) + '</span><span class="z">' + euro.format(zahl(p.preis)) + '</span><span class="z">' + euro.format(betrag(p)) + '</span></div>';
    }) : ['Physiotherapie nach Bobath', 'CranioSacral-Therapie', 'Hausbesuch'].map(function (l) {   // leeres Blatt zeigt, wie es aussieht: Leistungen der Website, Preise trägt Sylvia selbst ein (keine erfundenen Preise)
      return '<div class="re-zeile re-zeile--beispiel"><span>Beispiel</span><span>' + l + '</span><span class="z">1</span><span class="z re-frei">Preis eintragen</span><span class="z re-frei">–</span></div>';
    });
    var schluss = '<footer class="re-schluss"><div class="re-summe"><span>Summe</span><b>' + euro.format(summe()) + '</b></div>'
      + '<p class="re-ust">Umsatzsteuerfrei nach § 4 Nr. 14 UStG.</p><p class="re-bitte">Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer.</p><p class="re-gruss">Mit freundlichen Grüßen<span>Sylvia Sroka</span></p>'   /* gestalteter Schluss (F95) */
      + '<div class="re-unten"><div><p class="sr-b-zeile">Steuernummer</p>' + (z.steuernummer.trim() ? '<p>' + esc(z.steuernummer.trim()) + '</p>' : '<span class="re-luecke"></span>') + '</div>'
      + '<div><p class="sr-b-zeile">Bankverbindung</p>' + (z.bank.trim() ? '<p>' + esc(z.bank.trim()) + '</p>' : '<span class="re-luecke"></span><span class="re-luecke"></span>') + '</div>'
      + '<div><p class="sr-b-zeile">Kontakt</p><p>Telefon ' + esc(s.tel) + '\n' + esc(MAIL) + '</p></div></div></footer>';
    WZ.blaetter(h.querySelector('.sr-stapel'), { klasse: 're-blatt', kopf: kopf,
      folgekopf: '<div class="sr-b-kopfzeile">' + Z + '<span>Rechnung ' + esc(z.nummer || '') + ' · Fortsetzung</span></div><div class="re-zeile re-zeile--kopf"><span>Datum</span><span>Leistung</span><span class="z">Anzahl</span><span class="z">Einzelpreis</span><span class="z">Betrag</span></div>',
      bloecke: bloecke, schluss: schluss, fuss: '<span>' + [s.name, s.strasse, s.plzOrt, 'Telefon ' + s.tel, MAIL].map(function (x) { return '<span class="sr-nw">' + esc(x) + '</span>'; }).join(' · ') + '</span>' });   // Teile brechen nicht in sich (E-Mail-Adresse, Gegenprüfung 09.11.)
    var n = h.querySelectorAll('.sr-blatt').length, sz = $('#re-seiten'); if (sz) sz.textContent = n === 1 ? 'Eine Seite A4' : n + ' Seiten A4';
    var su = $('#re-summe'); if (su) su.textContent = euro.format(summe());
    requestAnimationFrame(function () { WZ.massstab(h); });
  }

  /* ---------- Rahmen ---------- */
  function offen() { return JSON.stringify(z) !== gesichert; }
  function zeichneLeiste() {
    WZ.aenderung(offen() ? 1 : 0);
    WZ.leiste({ titel: offen() ? 'Eingaben nicht gespeichert' : 'Alles gespeichert', satz: offen() ? 'Speichern legt die Rechnung in diesem Browser ab.' : 'Die Eingaben bleiben nur in diesem Browser.',
      knoepfe: WO.knopf('Neue Rechnung', 'plus', 'glas', { id: 'l-neu', klein: true }) + WO.knopf('Drucken oder PDF', 'druck', 'glas', { id: 'l-druck', klein: true }) });
  }
  function zeichneRand() {
    WZ.rand([{ eintraege: [{ text: 'Rechnung', an: ansicht === 'rechnung', attr: 'data-gehe="rechnung"' }, { text: 'Angaben der Praxis', an: ansicht === 'angaben', attr: 'data-gehe="angaben"', zahl: (z.steuernummer.trim() ? 0 : 1) + (z.bank.trim() ? 0 : 1) }] }]);
  }
  function feld(k, t, o) {
    o = o || {};
    return '<label class="wo-feld' + (o.breit ? ' sr-breit' : '') + '"><span>' + t + '</span>' + (o.mehr ? '<textarea data-feld="' + k + '" rows="' + (o.zeilen || 3) + '" placeholder="' + esc(o.platz || '') + '">' + esc(z[k]) + '</textarea>'
      : '<input data-feld="' + k + '" value="' + esc(z[k]) + '" placeholder="' + esc(o.platz || '') + '" autocomplete="off"' + (o.num ? ' inputmode="numeric"' : '') + '>') + '</label>';
  }
  function positionen() {
    return z.positionen.map(function (p, i) {
      return '<div class="re-pos" data-i="' + i + '"><label class="wo-feld"><span>Datum</span><input data-p="datum" value="' + esc(p.datum) + '" placeholder="TT.MM.JJJJ" inputmode="numeric" autocomplete="off"></label>'
        + '<label class="wo-feld re-pos__l"><span>Leistung</span><input data-p="leistung" value="' + esc(p.leistung) + '" placeholder="zum Beispiel Krankengymnastik" autocomplete="off"></label>'
        + '<label class="wo-feld"><span>Anzahl</span><input data-p="anzahl" value="' + esc(p.anzahl) + '" inputmode="decimal" autocomplete="off"></label>'
        + '<label class="wo-feld"><span>Einzelpreis in €</span><input data-p="preis" value="' + esc(p.preis) + '" placeholder="0,00" inputmode="decimal" autocomplete="off"></label>'
        + '<button class="sr-rund re-pos__x" type="button" data-weg title="Leistung entfernen" aria-label="Leistung entfernen">' + WO.ic('x') + '</button>'
        + '<p class="re-pos__b">Betrag <b>' + euro.format(betrag(p)) + '</b></p></div>';
    }).join('');
  }
  function zeige(a) {
    ansicht = a; WZ.ansichtMerken('rechnung', a);
    var r = $('#raum');
    if (a === 'angaben') {
      r.innerHTML = WO.startbild({ werkzeug: 'rechnung', art: 'buehne', foto: WZ.foto('echt-gespraech').url, h1: 'Angaben <em>der Praxis</em>', satz: 'Steuernummer und Bankverbindung stehen auf jeder Rechnung und bleiben für die nächste stehen. Leer gelassen, druckt das Blatt Linien zum Ausfüllen.' })
        + '<section class="sr-karte"><div class="sr-karte__kopf"><div><h2>Steuer und Bank</h2><p>Nur in diesem Browser. Nichts verlässt den Rechner.</p></div></div><div class="sr-felder">'
        + feld('steuernummer', 'Steuernummer', { platz: 'wie auf dem Bescheid des Finanzamts', breit: true }) + feld('bank', 'Bankverbindung', { mehr: true, zeilen: 3, platz: 'Kontoinhaber, IBAN, Bank', breit: true })
        + '</div><div class="sr-knoepfe">' + WO.knopf('Zur Rechnung', 'pfeil', 'dunkel', { attr: 'data-gehe="rechnung"' }) + '</div></section>';
      WZ.titel('Angaben der Praxis', 'Rechnungen');
    } else {
      r.innerHTML = WO.startbild({ werkzeug: 'rechnung', art: 'voll', foto: WZ.foto('termin-ankommen').url, h1: '<span data-wo-gruss>' + WO.gruss() + '</span> <em>Eine Rechnung schreiben.</em>',
          satz: 'Für Privatpatienten: Standort wählen, Leistungen eintragen, die Summe rechnet sich. Keine Preise vorbelegt. Das Blatt rechts wird so gedruckt, wie es dort steht.',
          knoepfe: WO.knopf('Drucken oder als PDF sichern', 'druck', 'gold', { attr: 'data-akt="druck"' }) + WO.knopf('Angaben der Praxis', 'stift', 'glas', { attr: 'data-gehe="angaben"' }) })
        + '<div class="sr-arbeit"><div class="sr-arbeit__eingabe">'
        + '<section class="sr-karte"><div class="sr-karte__kopf"><div><h2>Standort und Patient</h2><p>Der Standort bestimmt Absender und Kontakt auf dem Blatt.</p></div></div><div class="sr-felder">'
        + '<div class="wo-feld sr-breit"><span>Standort</span><div class="wo-wahl" role="group">' + ['hannover', 'hemmingen'].map(function (k) { return '<button type="button" data-standort="' + k + '" aria-pressed="' + (z.standort === k) + '">' + S[k].ort + '</button>'; }).join('') + '</div></div>'
        + feld('patient', 'Patientin oder Patient', { platz: 'Vor- und Nachname', breit: true }) + feld('anschrift', 'Anschrift', { mehr: true, zeilen: 2, platz: 'Straße und Hausnummer\nPostleitzahl und Ort', breit: true })
        + feld('nummer', 'Rechnungsnummer', { platz: 'zum Beispiel 2026-014' }) + '<div class="wo-feld"><span>Rechnungsdatum</span><div class="re-mit"><input data-feld="datum" value="' + esc(z.datum) + '" inputmode="numeric" autocomplete="off" aria-label="Rechnungsdatum"><button type="button" class="sr-rund re-heute" data-akt="heute" title="Heute" aria-label="Heute">' + WO.ic('uhr') + '</button></div></div>'
        + feld('zusatz', 'Zusatz (freiwillig)', { platz: 'zum Beispiel Behandlungszeitraum', breit: true })
        + '</div></section>'
        + '<section class="sr-karte"><div class="sr-karte__kopf"><div><h2>Leistungen</h2><p>Leistung, Anzahl und Einzelpreis; der Betrag rechnet sich.</p></div><p class="re-summe-kopf">Summe <b id="re-summe">' + euro.format(summe()) + '</b></p></div>'
        + '<div id="re-positionen">' + positionen() + '</div><div class="sr-knoepfe">' + WO.knopf('Leistung hinzufügen', 'plus', 'dunkel', { attr: 'data-akt="hinzu"' }) + '</div></section>'
        + '</div><aside class="sr-arbeit__blatt"><div class="sr-blattkopf"><b>Das Blatt</b><small id="re-seiten"></small></div><div class="sr-huelle" id="re-huelle"><div class="sr-stapel"></div></div></aside></div>';
      zeichneBlatt();
      WZ.titel(z.patient || 'Neue Rechnung', 'Rechnung' + (z.nummer ? ' ' + z.nummer : ''));
    }
    zeichneRand(); zeichneLeiste(); scrollTo(0, 0);
  }
  function speichern() {
    if (!offen()) { WZ.meldung('Nichts geändert', 'Nichts geändert, nichts gespeichert.'); return; }
    var vorher = gesichert;
    if (!WZ.speicher.schreib(K, z)) { WZ.meldung('Nicht gespeichert', 'Dieser Browser lässt nichts ablegen (zum Beispiel im privaten Fenster). Drucken geht trotzdem.', { fehler: true }); return; }
    gesichert = JSON.stringify(z);
    WZ.gespeichert(zeichneLeiste); zeichneRand();
    WZ.meldung('Gespeichert', 'Die Rechnung' + (z.patient ? ' für ' + z.patient : '') + ' liegt in diesem Browser.', { zurueck: function () { z = JSON.parse(vorher); WZ.speicher.schreib(K, z); gesichert = vorher; zeige(ansicht); } });
  }

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset.feld) { z[t.dataset.feld] = t.value; if (t.dataset.feld === 'patient') WZ.titel(t.value || 'Neue Rechnung'); }
    else if (t.dataset.p) { var r = t.closest('.re-pos'), p = z.positionen[+r.dataset.i]; p[t.dataset.p] = t.value; r.querySelector('.re-pos__b b').textContent = euro.format(betrag(p)); }
    else return;
    zeichneLeiste(); zeichneBlatt();
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-gehe],[data-akt],[data-standort],[data-weg],#l-sp,#l-druck,#l-neu'); if (!t) return;
    if (t.tagName === 'A') e.preventDefault();
    var d = t.dataset;
    if (t.id === 'l-sp') return speichern();
    if (t.id === 'l-druck' || d.akt === 'druck') { if (ansicht !== 'rechnung') zeige('rechnung'); return WZ.drucken(); }
    if (d.gehe) return zeige(d.gehe);
    if (t.id === 'l-neu') {
      var alt = JSON.stringify(z);
      ['patient', 'anschrift', 'nummer', 'zusatz'].forEach(function (k) { z[k] = ''; }); z.datum = WZ.heute(); z.positionen = [leer()];
      WZ.meldung('Neue Rechnung', 'Patient, Nummer und Leistungen sind leer. Standort, Steuernummer und Bank bleiben.', { zurueck: function () { z = JSON.parse(alt); zeige(ansicht); } });
      return zeige('rechnung');
    }
    if (d.standort) { z.standort = d.standort; [].forEach.call(t.parentNode.children, function (b) { b.setAttribute('aria-pressed', b === t); }); zeichneLeiste(); return zeichneBlatt(); }
    if (d.akt === 'heute') { z.datum = WZ.heute(); var f = $('[data-feld="datum"]'); if (f) f.value = z.datum; zeichneLeiste(); return zeichneBlatt(); }
    if (d.akt === 'hinzu') {
      var letzte = z.positionen[z.positionen.length - 1], n = leer(); if (letzte) n.leistung = letzte.leistung; z.positionen.push(n);
      $('#re-positionen').innerHTML = positionen(); zeichneLeiste(); zeichneBlatt();
      var fs = document.querySelectorAll('#re-positionen [data-p="datum"]'); fs[fs.length - 1].focus(); return;
    }
    if (d.weg !== undefined && t.closest('.re-pos')) {
      z.positionen.splice(+t.closest('.re-pos').dataset.i, 1); if (!z.positionen.length) z.positionen.push(leer());
      $('#re-positionen').innerHTML = positionen(); zeichneLeiste(); zeichneBlatt();
    }
  });
  document.addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); speichern(); } });
  addEventListener('resize', function () { var h = $('#re-huelle'); if (h) WZ.massstab(h); });

  lesen();
  WZ.kopf({ werkzeug: 'rechnung', unter: 'Rechnungen', titel: 'Rechnung', stand: 'Rechnungen', marke: function () { zeige('rechnung'); } });
  WZ.druckQuelle(function () { return document.querySelectorAll('#re-huelle .sr-blatt'); });
  zeige(WZ.ansichtLesen('rechnung') === 'angaben' ? 'angaben' : 'rechnung');
  if (!WZ.speicher.ok) WZ.meldung('Nur für diese Sitzung', 'Dieser Browser lässt nichts ablegen. Die Eingaben gehen beim Schließen verloren.', { fehler: true });
  window.__srBereit = true;
})();
