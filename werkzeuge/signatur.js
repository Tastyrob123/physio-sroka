/* signatur.js · E-Mail-Signatur der Praxis (Auftrag Punkt 4: «E-Mail-Signatur als HTML mit Kopier-Knopf»). Gehört zu den Drucksachen,
   steht aber als eigene Seite im Rahmen, weil die Werkstatt nur Papier setzt. Nur Angaben aus dem Auftrag, ohne Bild (sieht in jedem
   E-Mail-Programm gleich aus und lädt nichts nach). Standort wählbar als eigene Knöpfe. Kopiert als Signatur (text/html und Text) oder als HTML-Code.
   Ändert nichts Dauerhaftes, deshalb ohne Speichern und ohne Leiste (R08); die Wahl des Standorts merkt sich die Sitzung. */
(function () {
  'use strict';
  var esc = WZ.esc, $ = WZ.$;
  var TINTE = '#1b1915', NACHT = '#0e0d0b', LEISE = '#6d665b', GOLD = '#b1996a', GOLD_T = '#8a7348';
  var ORTE = {
    hannover: { name: 'Privatpraxis Physiotherapie Sylvia Sroka', adr: 'Dieterichsstraße 25 · 30159 Hannover', tel: '0511 260 74 14', fax: '0511 260 74 13' },
    hemmingen: { name: 'Physio Rosenpark · Praxis für Physio- und Körperpsychotherapie', adr: 'Berliner Straße 16 · 30966 Hemmingen', tel: '0511 234 46 67', fax: '0511 655 06 827' }
  };
  var WAHL = [['beide', 'Beide Standorte'], ['hannover', 'Nur Hannover'], ['hemmingen', 'Nur Hemmingen']];
  var MAIL = 'info@physio-sroka.de';
  var wahl = 'beide';
  try { var w0 = sessionStorage.getItem('sr-signatur-wahl'); if (w0 && /^(beide|hannover|hemmingen)$/.test(w0)) wahl = w0; } catch (e) {}

  function orte() { return wahl === 'beide' ? ['hannover', 'hemmingen'] : [wahl]; }
  function html() {
    var td = 'font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:' + TINTE + ';';
    var s = '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">'
      + '<tr><td style="padding:0 0 2px 0;font-family:\'Cormorant Garamond\',Georgia,\'Times New Roman\',serif;font-size:21px;line-height:1.2;font-weight:normal;color:' + NACHT + ';">Sylvia Sroka</td></tr>'
      + '<tr><td style="padding:0 0 10px 0;' + td + 'color:' + LEISE + ';">Physiotherapeutin · Heilpraktikerin für Physiotherapie und Psychotherapie</td></tr>';
    orte().forEach(function (k, i) {
      var o = ORTE[k];
      s += '<tr><td style="padding:' + (i ? '8px' : '10px') + ' 0 0 0;' + (i ? '' : 'border-top:1px solid ' + GOLD + ';') + td + '">'
        + '<span style="color:' + NACHT + ';">' + esc(o.name) + '</span><br>' + esc(o.adr) + '<br>Telefon ' + esc(o.tel) + ' · Fax ' + esc(o.fax) + '</td></tr>';
    });
    s += '<tr><td style="padding:8px 0 0 0;' + td + '"><a href="mailto:' + MAIL + '" style="color:' + GOLD_T + ';text-decoration:none;">' + MAIL + '</a></td></tr>'
      + '<tr><td style="padding:2px 0 0 0;' + td + 'color:' + LEISE + ';">Termine nach Vereinbarung · Hausbesuche nach Absprache · nur Privatpatienten</td></tr></table>';
    return s;
  }
  function text() {
    var z = ['Sylvia Sroka', 'Physiotherapeutin · Heilpraktikerin für Physiotherapie und Psychotherapie', ''];
    orte().forEach(function (k) { var o = ORTE[k]; z.push(o.name, o.adr, 'Telefon ' + o.tel + ' · Fax ' + o.fax, ''); });
    z.push(MAIL, 'Termine nach Vereinbarung · Hausbesuche nach Absprache · nur Privatpatienten');
    return z.join('\n');
  }

  var WEGE = [
    { t: 'Apple Mail', s: ['Mail öffnen, im Menü «Mail» die «Einstellungen» wählen, dann «Signaturen».', 'Links das Konto wählen und mit «+» eine neue Signatur anlegen.', 'Den Beispieltext rechts löschen und mit Cmd V einfügen.', 'Das Häkchen «Immer meiner Standardschrift entsprechen» abwählen, damit Schrift und Farben bleiben.'] },
    { t: 'Outlook', s: ['«Einstellungen» öffnen, dann «Konten» und «Signaturen» (in älteren Fassungen: «Datei», «Optionen», «E-Mail», «Signaturen»).', 'Eine neue Signatur anlegen und benennen.', 'In das Feld klicken und mit Strg V oder Cmd V einfügen, dann speichern.'] },
    { t: 'Gmail', s: ['Oben rechts das Zahnrad, dann «Alle Einstellungen aufrufen».', 'Im Reiter «Allgemein» zum Abschnitt «Signatur» gehen und «Neu erstellen» wählen.', 'Einfügen, ganz unten «Änderungen speichern».'] }
  ];

  function zeichneRand() {
    WZ.rand([
      { titel: 'Drucksachen', eintraege: [{ text: 'Werkstatt', href: WO_HAUS.wege.druck }, { text: 'E-Mail-Signatur', an: true, attr: 'data-oben' }] },
      { titel: 'Standort', eintraege: WAHL.map(function (x) { return { text: x[1], an: wahl === x[0], attr: 'data-wahl="' + x[0] + '"' }; }) }
    ]);
  }
  function zeige() {
    var code = html();
    $('#raum').innerHTML = WO.startbild({ werkzeug: 'druck', art: 'buehne', foto: WZ.foto('echt-gespraech').url, zier: esc('Drucksachen · E-Mail-Signatur'),
        h1: 'Deine <em class="sr-nw">E-Mail-Signatur</em>', satz: 'Ohne Bild, damit sie in jedem E-Mail-Programm gleich aussieht. Standort wählen, «Signatur kopieren» und im E-Mail-Programm bei den Signaturen einfügen.',
        knoepfe: WO.knopf('Signatur kopieren', 'kopie', 'gold', { attr: 'data-kopiere="signatur"' }) + WO.knopf('Zur Werkstatt', 'druck', 'glas', { href: WO_HAUS.wege.druck }) })
      + '<section class="sr-karte sg-karte"><div class="sr-karte__kopf"><div><h2>Vorschau</h2><p>So erscheint die Signatur unter jeder E-Mail.</p></div></div>'
      + '<div class="sg-wahl" role="group" aria-label="Standort">' + WAHL.map(function (x) {
        return WO.knopf(x[1], wahl === x[0] ? 'haken' : 'pfeil', wahl === x[0] ? 'dunkel' : 'hell', { klein: true, attr: 'data-wahl="' + x[0] + '" aria-pressed="' + (wahl === x[0]) + '"' });
      }).join('') + '</div>'
      + '<div class="sg-post"><div class="sg-post__kopf"><span>An: </span><span>Betreff: </span></div><p class="sg-post__gruss">Mit freundlichen Grüßen</p><div class="sg-vorschau" id="sg-vorschau">' + code + '</div></div>'
      + '<div class="sg-kn">' + WO.knopf('Signatur kopieren', 'kopie', 'dunkel', { attr: 'data-kopiere="signatur"' }) + WO.knopf('HTML-Code kopieren', 'kopie', 'hell', { attr: 'data-kopiere="code"' }) + '</div>'
      + '<p class="sg-leise">«Signatur kopieren» legt sie mit Schrift und Farben in die Zwischenablage. Den HTML-Code braucht nur, wer die Signatur als Datei hinterlegt.</p>'
      + '<textarea class="sg-code" id="sg-code" readonly rows="6" aria-label="HTML-Code der Signatur">' + esc(code) + '</textarea></section>'
      + '<h2 class="wo-zw">Wohin <em>sie kommt</em></h2><div class="sr-raster sg-wege" style="--n:3">' + WEGE.map(function (w) {
        return '<div class="sr-karte"><div class="sr-karte__kopf"><div><p class="wo-mk">E-Mail-Programm</p><h3>' + esc(w.t) + '</h3></div></div><ol class="sg-weg">' + w.s.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>';
      }).join('') + '</div>';
    WZ.titel('E-Mail-Signatur', WAHL.filter(function (x) { return x[0] === wahl; })[0][1]);
    zeichneRand();
  }

  function kopieren(t, h) {
    var alt = function () {
      var f = document.createElement('textarea'); f.value = t; f.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'; document.body.appendChild(f); f.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} f.remove();
      return ok ? Promise.resolve() : Promise.reject(new Error('Kopieren nicht möglich'));
    };
    try {
      if (h && window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        return navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([h], { type: 'text/html' }), 'text/plain': new Blob([t], { type: 'text/plain' }) })]).catch(function () { return reichText(h, t); });
      }
      if (h) return reichText(h, t);
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).catch(alt);
    } catch (e) {}
    return alt();
  }
  /* Rückfall für Browser ohne ClipboardItem: die Vorschau markieren und kopieren, so bleibt die Gestaltung */
  function reichText(h, t) {
    var v = $('#sg-vorschau'); if (!v) return Promise.reject(new Error('keine Vorschau'));
    var r = document.createRange(); r.selectNodeContents(v); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} s.removeAllRanges();
    return ok ? Promise.resolve() : Promise.reject(new Error('Kopieren nicht möglich'));
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-wahl],[data-kopiere],[data-oben]'); if (!t) return;
    if (t.dataset.oben != null && !t.dataset.wahl) { scrollTo(0, 0); return; }
    if (t.dataset.wahl) {
      wahl = t.dataset.wahl; try { sessionStorage.setItem('sr-signatur-wahl', wahl); } catch (e2) {}
      var y = scrollY; zeige(); scrollTo(0, y); return;
    }
    var code = t.dataset.kopiere === 'code';
    kopieren(code ? html() : text(), code ? null : html()).then(function () {
      WZ.meldung('Kopiert', code ? 'Der HTML-Code liegt in der Zwischenablage.' : 'Die Signatur liegt in der Zwischenablage. Jetzt im E-Mail-Programm bei den Signaturen einfügen.');
      var s = t.querySelector('span'); if (s) { var alt = s.textContent; s.textContent = 'Kopiert'; setTimeout(function () { s.textContent = alt; }, 1800); }
    }).catch(function () {
      if (code) { var f = $('#sg-code'); if (f) { f.focus(); f.select(); } }
      WZ.meldung('Nicht kopiert', code ? 'Der Code ist markiert. Jetzt mit Cmd C oder Strg C kopieren.' : 'Der Browser lässt das Kopieren nicht zu. Die Vorschau markieren und mit Cmd C kopieren.', { fehler: true });
    });
  });

  WZ.kopf({ werkzeug: 'druck', unter: 'E-Mail-Signatur', titel: 'E-Mail-Signatur', stand: '', markeHref: WO_HAUS.wege.druck });
  zeige();
  var l = $('#leiste'); if (l) l.remove();
  window.__srBereit = true;
})();
