/* uebungsplan.js · Übungspläne je Patientin und Patient (Robert 09.11.2026: «individueller gestalten und nicht ein Vorlagendeck»).
   Im Rahmen der Vorlage (rahmen/oberflaeche.js): Kopf, Rand, Startbild, Leiste mit Speichern, Quittung, Fenster.
   Ein Plan: Patient, Datum, Standort, Ziel, persönliche Notiz, Abschnitte (zum Beispiel «Woche 1 und 2», «ab Woche 3»), darin Übungen mit Name, Schritten,
   Menge, Häufigkeit am Tag, Hinweis und Foto (Foto der Website oder eigenes Foto, das nur im Browser bleibt). Übungen der Website (daten/uebungen.json)
   sind der Ausgangspunkt und werden als Kopie frei umgeschrieben. Pläne liegen im Browser (localStorage «sroka-uebungsplaene», eigene Fotos in IndexedDB).
   Das Blatt ist gestaltet wie die Drucksachen der Werkstatt und wird in A4-Seiten gesetzt, keine Übung bricht über eine Seite. Drucken oder als PDF sichern
   über den Druck des Browsers. Ansprache hier Du (Sylvia), auf dem Blatt Sie (Patient). */
(function () {
  'use strict';
  var esc = WZ.esc, $ = WZ.$, H = WO_HAUS;
  var K = 'sroka-uebungsplaene';
  var ST = { plaene: {}, offen: null, ansicht: 'start', bib: null, entwurf: null };
  var STANDORT = {
    hannover: { name: 'Privatpraxis Sylvia Sroka', zeile: 'Dieterichsstraße 25 · 30159 Hannover', tel: '0511 260 74 14' },
    hemmingen: { name: 'Physio Rosenpark', zeile: 'Berliner Straße 16 · 30966 Hemmingen', tel: '0511 234 46 67' }
  };
  var HAEUFIG = ['1 Mal am Tag', '2 Mal am Tag', '3 Mal am Tag', 'jeden zweiten Tag'];
  var GRUPPENFOTO = {};

  /* ---------- eigene Fotos: IndexedDB, nur in diesem Browser ---------- */
  var fotoDb = null, fotoCache = {};
  function db() {
    if (fotoDb) return fotoDb;
    fotoDb = new Promise(function (ok) {
      try {
        var r = indexedDB.open('sroka-uebungsfotos', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('fotos'); };
        r.onsuccess = function () { ok(r.result); }; r.onerror = function () { ok(null); };
      } catch (e) { ok(null); }
    });
    return fotoDb;
  }
  function fotoLegen(k, daten) { fotoCache[k] = daten; return db().then(function (d) { if (!d) return false; return new Promise(function (ok) { try { var t = d.transaction('fotos', 'readwrite'); t.objectStore('fotos').put(daten, k); t.oncomplete = function () { ok(true); }; t.onerror = function () { ok(false); }; } catch (e) { ok(false); } }); }); }
  function fotoHolen(k) { if (fotoCache[k]) return Promise.resolve(fotoCache[k]); return db().then(function (d) { if (!d) return null; return new Promise(function (ok) { try { var q = d.transaction('fotos').objectStore('fotos').get(k); q.onsuccess = function () { if (q.result) fotoCache[k] = q.result; ok(q.result || null); }; q.onerror = function () { ok(null); }; } catch (e) { ok(null); } }); }); }
  function fotoUrl(f) { if (!f) return ''; if (f.art === 'eigen') return fotoCache[f.key] || ''; var w = WZ.foto(f.key); return w ? w.url : ''; }
  function eigeneFotosLaden(plan) {
    var ks = []; (plan ? [plan] : Object.values(ST.plaene)).forEach(function (p) { p.abschnitte.forEach(function (a) { a.uebungen.forEach(function (u) { if (u.foto && u.foto.art === 'eigen' && !fotoCache[u.foto.key]) ks.push(u.foto.key); }); }); });
    return Promise.all(ks.map(fotoHolen));
  }
  function verkleinern(datei) {
    return new Promise(function (ok, nein) {
      var r = new FileReader();
      r.onload = function () { var i = new Image(); i.addEventListener('load', function () { var m = 1200, k = Math.min(1, m / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = Math.round(i.width * k); c.height = Math.round(i.height * k); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', .84)); }, { once: true }); i.addEventListener('error', function () { nein(new Error('Diese Datei ist kein Bild, das der Browser lesen kann.')); }, { once: true }); i.src = r.result; };
      r.onerror = function () { nein(new Error('Die Datei ließ sich nicht lesen.')); };
      r.readAsDataURL(datei);
    });
  }

  /* ---------- Daten ---------- */
  function lesen() { var d = WZ.speicher.lies(K, null); ST.plaene = (d && d.plaene) || {}; }
  function schreiben() { return WZ.speicher.schreib(K, { plaene: ST.plaene }); }
  function kopie(o) { return JSON.parse(JSON.stringify(o)); }
  function neuePlan() {
    return { id: WZ.id(), patient: '', datum: WZ.heute(), standort: 'hannover', ziel: '', notiz: '', abschnitte: [{ id: WZ.id(), titel: 'Woche 1 und 2', uebungen: [] }], geaendert: Date.now() };
  }
  function ausBibliothek(u, g) {
    return { id: WZ.id(), name: u.name, schritte: u.schritte.slice(), menge: u.menge, haeufig: '2 Mal am Tag', hinweis: '', foto: g && g.bild && g.uebungen[0] === u ? { art: 'web', key: g.bild.replace(/^media\//, '').replace(/\.jpg$/, '') } : null, quelle: u.id };
  }
  function beispiel() {
    var p = neuePlan(), B = ST.bib, g = function (id) { return B.gruppen.filter(function (x) { return x.id === id; })[0]; }, u = function (gid, uid) { var gg = g(gid); return ausBibliothek(gg.uebungen.filter(function (x) { return x.id === uid; })[0], gg); };
    p.patient = 'Frau Muster'; p.beispiel = true;   // Kennzeichnung nur über p.beispiel (Leiste), nie auf dem Blatt (F184)
    p.ziel = 'Den Rücken im Alltag beweglich halten und den Nacken entlasten.';
    p.notiz = 'Üben Sie lieber jeden Tag ein wenig als einmal lange. Wenn eine Übung zieht oder schmerzt, lassen Sie sie weg und sprechen Sie mich beim nächsten Termin darauf an.';
    var a1 = p.abschnitte[0]; a1.uebungen = [u('ruecken', 'katze-kuh'), u('ruecken', 'becken-kippen'), u('atem', 'bauchatmung')];
    a1.uebungen[1].menge = '8 Mal, langsam'; a1.uebungen[1].hinweis = 'Nur so weit, wie es angenehm bleibt.';
    var a2 = { id: WZ.id(), titel: 'Ab Woche 3', uebungen: [u('nacken', 'kinn-einziehen'), u('nacken', 'schulterkreisen'), u('gleichgewicht', 'einbeinstand')] };
    a2.uebungen[2].haeufig = '1 Mal am Tag';
    p.abschnitte.push(a2);
    return p;
  }

  /* ---------- Blatt ---------- */
  function blattHtml(p) {
    var s = STANDORT[p.standort] || STANDORT.hannover, Z = window.ZEICHEN || '';
    var zeichen = Z.replace('<svg ', '<svg class="sr-b-zeichen" ');
    var kopf = '<header class="ub-kopf">' + zeichen + '<p class="sr-b-zeile">Übungen für zu Hause</p><h1 class="sr-b-titel">' + esc(p.patient || 'Ihr Übungsplan') + '</h1><div class="sr-b-strich"></div>'
      + '<p class="ub-datum">' + esc([p.datum ? 'Stand ' + p.datum : '', s.name].filter(Boolean).join(' · ')) + '</p>'
      + (p.ziel ? '<div class="ub-ziel"><p class="sr-b-zeile">Ziel</p><p>' + esc(p.ziel) + '</p></div>' : '') + '</header>';
    var bloecke = [];
    p.abschnitte.forEach(function (a) {
      if (!a.uebungen.length && !a.titel) return;
      bloecke.push('<h2 class="ub-abschnitt sr-mitnaechstem">' + esc(a.titel || 'Übungen') + '</h2>');
      a.uebungen.forEach(function (u, i) {
        var f = fotoUrl(u.foto);
        bloecke.push('<section class="ub-uebung' + (f ? '' : ' ub-uebung--ohne') + '">' + (f ? '<div class="ub-foto"><img src="' + esc(f) + '" alt=""></div>' : '')
          + '<div class="ub-text"><h3><span class="ub-nr">' + (i + 1) + '</span>' + esc(u.name || 'Übung') + '</h3>'
          + '<p class="ub-menge">' + esc([u.menge, u.haeufig].filter(Boolean).join(' · ')) + '</p>'
          + (u.schritte && u.schritte.length ? '<ol>' + u.schritte.filter(Boolean).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' : '')
          + (u.hinweis ? '<p class="ub-hinweis">' + esc(u.hinweis) + '</p>' : '') + '</div></section>');
      });
    });
    var schluss = '<footer class="ub-schluss">' + (p.notiz ? '<div class="ub-notiz"><p class="sr-b-zeile">Persönlich</p><p>' + esc(p.notiz) + '</p></div>' : '')
      + '<p class="ub-wichtig">' + esc((ST.bib && ST.bib.hinweis) || '') + '</p><p class="ub-gruss">Sylvia Sroka</p></footer>';
    var fuss = '<span>' + esc(s.name) + ' · ' + esc(s.zeile) + ' · ' + esc(s.tel) + '</span>';
    return { kopf: kopf, folgekopf: '<div class="sr-b-kopfzeile">' + Z + '<span>' + esc(p.patient || 'Übungsplan') + ' · Fortsetzung</span></div>', bloecke: bloecke, schluss: schluss, fuss: fuss };
  }
  function zeichneBlatt() {
    var h = $('#ub-huelle'); if (!h || !ST.offen) return;
    var st = h.querySelector('.sr-stapel');
    var o = blattHtml(ST.offen); o.klasse = 'ub-blatt';
    WZ.blaetter(st, o);
    var n = st.children.length; var z = $('#ub-seiten'); if (z) z.textContent = n === 1 ? 'Eine Seite A4' : n + ' Seiten A4';
    requestAnimationFrame(function () { WZ.massstab(h); });
  }

  /* ---------- Rahmen: Kopf, Rand, Leiste ---------- */
  function zeichneRand() {
    var liste = Object.values(ST.plaene).sort(function (a, b) { return b.geaendert - a.geaendert; });
    WZ.rand([
      { eintraege: [{ text: 'Übersicht', an: ST.ansicht === 'start', attr: 'data-gehe="start"' }] },
      { titel: 'Pläne', eintraege: liste.slice(0, 8).map(function (p) { return { text: p.patient || 'Ohne Namen', zahl: zahlUebungen(p), an: ST.ansicht === 'plan' && ST.offen && ST.offen.id === p.id, attr: 'data-oeffne="' + p.id + '"' }; })
        .concat([{ text: 'Neuer Plan', attr: 'data-gehe="neu"' }]) },
      { titel: 'Bibliothek', eintraege: [{ text: 'Übungen der Website', zahl: ST.bib ? ST.bib.gruppen.reduce(function (m, g) { return m + g.uebungen.length; }, 0) : 0, an: ST.ansicht === 'bib', attr: 'data-gehe="bib"' }] }
    ]);
  }
  function zahlUebungen(p) { return p.abschnitte.reduce(function (m, a) { return m + a.uebungen.length; }, 0); }
  function zeichneLeiste() {
    var n = WZ.offen(), p = ST.offen && ST.ansicht === 'plan';
    WZ.leiste({
      titel: n ? (n === 1 ? '1 Änderung nicht gespeichert' : n + ' Änderungen nicht gespeichert') : p && !ST.gespeichert ? (ST.offen.beispiel ? 'Beispiel, nicht gespeichert' : 'Noch nicht gespeichert') : p ? 'Plan gespeichert' : 'Alles gespeichert',
      satz: n || (p && !ST.gespeichert) ? 'Speichern legt den Plan in diesem Browser ab.' : 'Pläne bleiben nur in diesem Browser.',
      knoepfe: p ? WO.knopf('Kopie', 'kopie', 'glas', { id: 'l-kopie', klein: true }) + WO.knopf('Drucken oder PDF', 'druck', 'glas', { id: 'l-druck', klein: true }) : '',
      speichern: !!p || !!n
    });
  }
  function rahmen(titel, stand) { WZ.titel(titel, stand); zeichneRand(); zeichneLeiste(); }

  /* ---------- Ansichten ---------- */
  function zeige(a, o) {
    if (a !== 'plan' && WZ.offen() && ST.offen && !(o && o.ohneFrage)) {
      if (!confirm('Der Plan hat Änderungen, die nicht gespeichert sind. Ohne Speichern weitergehen?')) return;
      if (ST.gespeichert) ST.offen = kopie(ST.gespeichert); WZ.aenderung(0);
    }
    ST.ansicht = a; WZ.ansichtMerken('uebungen', a === 'plan' && ST.offen ? 'plan:' + ST.offen.id : a);
    var r = $('#raum'); r.innerHTML = '';
    if (a === 'start') start(r); else if (a === 'bib') bibliothek(r); else if (a === 'plan') planAnsicht(r);
    scrollTo(0, 0);
  }
  function start(r) {
    var liste = Object.values(ST.plaene).sort(function (a, b) { return b.geaendert - a.geaendert; });
    var letzter = liste[0];
    r.innerHTML = WO.startbild({ werkzeug: 'uebungen', art: 'voll', foto: WZ.foto('uebung-atem').url,
        h1: '<span data-wo-gruss>' + WO.gruss() + '</span> <em>Wer übt als Nächstes?</em>',
        satz: 'Für jede Patientin und jeden Patienten ein eigener Plan: Übungen aus der Bibliothek der Website als Ausgang, frei umgeschrieben oder ganz neu, in Abschnitten wie «Woche 1 und 2». Das Blatt ist gesetzt wie die Drucksachen der Praxis.',
        knoepfe: WO.knopf('Neuer Plan', 'plus', 'gold', { attr: 'data-gehe="neu"' }) + WO.knopf('Übungen ansehen', 'blatt', 'glas', { attr: 'data-gehe="bib"' }) })
      + '<div class="wo-lage">'
      + '<div class="wo-lg"><i class="wo-lg__z">' + WO.ic('person') + '</i><span class="wo-mk">Pläne</span><b>' + (liste.length ? liste.length + (liste.length === 1 ? ' Plan' : ' Pläne') : 'Noch keiner') + '</b><p>' + (liste.length ? 'Gespeichert in diesem Browser.' : 'Ein Beispiel zeigt, wie ein Plan aussieht.') + '</p>' + (liste.length ? '' : '<a class="wo-lk" href="#" data-gehe="beispiel">Beispiel ansehen</a>') + '</div>'
      + '<div class="wo-lg"><i class="wo-lg__z">' + WO.ic('uhr') + '</i><span class="wo-mk">Zuletzt</span><b>' + esc(letzter ? (letzter.patient || 'Ohne Namen') : 'Noch nichts') + '</b><p>' + (letzter ? zahlUebungen(letzter) + ' Übungen · ' + esc(letzter.datum || '') : 'Was du speicherst, steht hier.') + '</p>' + (letzter ? '<a class="wo-lk" href="#" data-oeffne="' + letzter.id + '">Öffnen</a>' : '') + '</div>'
      + '<div class="wo-lg"><i class="wo-lg__z">' + WO.ic('buch') + '</i><span class="wo-mk">Bibliothek</span><b>' + ST.bib.gruppen.reduce(function (m, g) { return m + g.uebungen.length; }, 0) + ' Übungen</b><p>Aus «Übungen für zu Hause» der Website, zum Umschreiben.</p><a class="wo-lk" href="#" data-gehe="bib">Ansehen</a></div>'
      + '</div>'
      + '<h2 class="wo-zw">Pläne <em>je Patient</em></h2>'
      + (liste.length ? '<div class="sr-liste" id="ub-plaene">' + liste.map(function (p) { return planZeile(p, false); }).join('') + '</div>'
        : '<div class="sr-liste">' + planZeile(Object.assign(beispiel(), { id: 'beispiel' }), true) + '</div><p class="sr-leise ub-unter">Noch kein eigener Plan. Das Beispiel oben zeigt einen fertigen Plan mit zwei Abschnitten; «Neuer Plan» beginnt leer.</p>');
  }
  function planZeile(p, istBsp) {
    var u = null; p.abschnitte.some(function (a) { return a.uebungen.some(function (x) { if (x.foto) { u = x; return true; } }); });
    var f = u ? fotoUrl(u.foto) : '';
    return '<div class="sr-zeile"><div class="sr-zeile__b">' + (f ? '<img src="' + esc(f) + '" alt="">' : WO.zeichen()) + '</div>'
      + '<div class="sr-zeile__t"><b>' + esc(p.patient || 'Ohne Namen') + '</b><small>' + zahlUebungen(p) + ' Übungen in ' + p.abschnitte.length + (p.abschnitte.length === 1 ? ' Abschnitt' : ' Abschnitten') + ' · ' + esc(p.datum || '') + (p.ziel ? ' · ' + esc(p.ziel) : '') + '</small></div>'
      + '<div class="sr-zeile__k">' + (istBsp ? WO.knopf('Beispiel ansehen', 'auge', 'hell', { klein: true, attr: 'data-gehe="beispiel"' })
        : WO.knopf('Öffnen', 'pfeil', 'dunkel', { klein: true, attr: 'data-oeffne="' + p.id + '"' }) + '<button class="sr-rund" type="button" title="Kopie anlegen" aria-label="Kopie anlegen" data-kopiere="' + p.id + '">' + WO.ic('kopie') + '</button><button class="sr-rund" type="button" title="Löschen" aria-label="Löschen" data-loesche="' + p.id + '">' + WO.ic('x') + '</button>')
      + '</div></div>';
  }
  function bibliothek(r) {
    var B = ST.bib, offen = ST.offen && ST.offen.abschnitte;
    r.innerHTML = WO.startbild({ werkzeug: 'uebungen', art: 'buehne', foto: WZ.foto('termin-ueben').url, h1: 'Übungen <em>der Website</em>',
      satz: offen ? 'Ein Klick auf «In den Plan» legt eine Kopie in «' + esc(ST.offen.patient || 'den offenen Plan') + '». Dort schreibst du sie frei um.' : 'Die Übungen aus «Übungen für zu Hause». Öffne einen Plan oder leg einen neuen an, dann kommen sie mit einem Klick hinein.',
      knoepfe: offen ? WO.knopf('Zurück zum Plan', 'links', 'gold', { attr: 'data-gehe="plan"' }) : WO.knopf('Neuer Plan', 'plus', 'gold', { attr: 'data-gehe="neu"' }) })
      + B.gruppen.map(function (g) {
        /* Gruppenfoto einmal je Gruppe, die Übungen als Zeilen daneben (F120: kein Foto zweimal, F185/F205: keine Restreihe, Text breit genug) */
        return '<h2 class="wo-zw">' + esc(g.name) + '</h2><p class="sr-leise ub-gsatz">' + esc(g.satz || '') + '</p><div class="ub-gruppe"><div class="ub-gruppe__b"><img src="' + esc(H.site + g.bild) + '" alt=""></div><div class="ub-gruppe__l">'
          + g.uebungen.map(function (u) {
            return '<div class="ub-bk"><div class="ub-bk__t"><b>' + esc(u.name) + '</b><small>' + esc(u.menge) + '</small><p class="ub-schritte">' + u.schritte.map(esc).join(' ') + '</p></div>'
              + '<div class="ub-bk__k">' + WO.knopf(offen ? 'In den Plan' : 'Mit neuem Plan', 'plus', 'gold', { klein: true, attr: 'data-nimm="' + g.id + '|' + u.id + '"' }) + '</div></div>';
          }).join('') + '</div></div>';
      }).join('');
  }
  function planAnsicht(r) {
    var p = ST.offen;
    r.innerHTML = WO.startbild({ werkzeug: 'uebungen', art: 'buehne', foto: WZ.foto('termin-ueben').url, zier: esc('Übungsplan · ' + (STANDORT[p.standort] || STANDORT.hannover).name),
        h1: esc(p.patient || 'Neuer Plan'), satz: 'Links schreibst du, rechts steht das Blatt so, wie es gedruckt wird. Nichts wird still gespeichert: «Speichern» unten legt den Plan ab.',
        knoepfe: WO.knopf('Drucken oder als PDF sichern', 'druck', 'gold', { attr: 'data-akt="druck"' }) + WO.knopf('Übung aus der Bibliothek', 'buch', 'glas', { attr: 'data-gehe="bib"' }) })
      + '<div class="sr-arbeit"><div class="sr-arbeit__eingabe">'
      + '<section class="sr-karte"><div class="sr-karte__kopf"><div><h2>Für wen</h2><p>Name, Datum und Standort stehen oben auf dem Blatt.</p></div></div><div class="sr-felder">'
      + '<label class="wo-feld sr-breit"><span>Patientin oder Patient</span><input data-f="patient" value="' + esc(p.patient) + '" placeholder="Vor- und Nachname" autocomplete="off"></label>'
      + '<label class="wo-feld"><span>Datum</span><input data-f="datum" value="' + esc(p.datum) + '" inputmode="numeric" placeholder="TT.MM.JJJJ" autocomplete="off"></label>'
      + '<div class="wo-feld"><span>Standort</span><div class="wo-wahl" role="group">' + ['hannover', 'hemmingen'].map(function (k) { return '<button type="button" data-standort="' + k + '" aria-pressed="' + (p.standort === k) + '">' + (k === 'hannover' ? 'Hannover' : 'Hemmingen') + '</button>'; }).join('') + '</div></div>'
      + '<label class="wo-feld sr-breit"><span>Ziel des Plans</span><textarea data-f="ziel" rows="2" placeholder="Zum Beispiel: sicher Treppen steigen">' + esc(p.ziel) + '</textarea></label>'
      + '<label class="wo-feld sr-breit"><span>Persönliche Notiz (steht am Ende des Blatts)</span><textarea data-f="notiz" rows="3" placeholder="Ein paar Sätze nur für diese Person, in der Sie-Form">' + esc(p.notiz) + '</textarea></label>'
      + '</div></section>'
      + p.abschnitte.map(abschnittHtml).join('')
      + '<div class="sr-knoepfe ub-unten">' + WO.knopf('Abschnitt hinzufügen', 'plus', 'hell', { attr: 'data-akt="abschnitt"' }) + '</div>'
      + '</div><aside class="sr-arbeit__blatt"><div class="sr-blattkopf"><b>Das Blatt</b><small id="ub-seiten"></small></div><div class="sr-huelle sr-druck" id="ub-huelle"><div class="sr-stapel"></div></div></aside></div>';
    eigeneFotosLaden(p).then(zeichneBlatt);
    zeichneBlatt();
    rahmen(p.patient || 'Neuer Plan', 'Übungsplan · ' + zahlUebungen(p) + ' Übungen');
  }
  function abschnittHtml(a, ai) {
    var p = ST.offen;
    return '<section class="sr-karte ub-abschnitt-karte" data-abschnitt="' + a.id + '"><div class="sr-karte__kopf"><label class="wo-feld ub-atitel"><span>Abschnitt ' + (ai + 1) + '</span><input data-a="' + a.id + '" value="' + esc(a.titel) + '" placeholder="Zum Beispiel: Woche 1 und 2"></label>'
      + '<div class="sr-zeile__k"><button class="sr-rund" type="button" title="Abschnitt nach oben" aria-label="Abschnitt nach oben" data-ahoch="' + a.id + '"' + (ai ? '' : ' disabled') + '>' + WO.ic('hoch') + '</button>'
      + '<button class="sr-rund" type="button" title="Abschnitt entfernen" aria-label="Abschnitt entfernen" data-aweg="' + a.id + '"' + (p.abschnitte.length > 1 ? '' : ' disabled') + '>' + WO.ic('x') + '</button></div></div>'
      + (a.uebungen.length ? '<div class="sr-liste">' + a.uebungen.map(function (u, i) {
        var f = fotoUrl(u.foto);
        return '<div class="sr-zeile"><div class="sr-zeile__b">' + (f ? '<img src="' + esc(f) + '" alt="">' : WO.zeichen()) + '</div><div class="sr-zeile__t"><b>' + esc(u.name || 'Übung ohne Namen') + '</b><small>' + esc([u.menge, u.haeufig].filter(Boolean).join(' · ')) + '</small></div>'
          + '<div class="sr-zeile__k"><button class="sr-rund" type="button" title="Nach oben" aria-label="Nach oben" data-hoch="' + a.id + '|' + u.id + '"' + (i ? '' : ' disabled') + '>' + WO.ic('hoch') + '</button>'
          + '<button class="sr-rund ub-runter" type="button" title="Nach unten" aria-label="Nach unten" data-runter="' + a.id + '|' + u.id + '"' + (i < a.uebungen.length - 1 ? '' : ' disabled') + '>' + WO.ic('hoch') + '</button>'
          + '<button class="sr-rund" type="button" title="Ändern" aria-label="Ändern" data-aendere="' + a.id + '|' + u.id + '">' + WO.ic('stift') + '</button>'
          + '<button class="sr-rund" type="button" title="Entfernen" aria-label="Entfernen" data-weg="' + a.id + '|' + u.id + '">' + WO.ic('x') + '</button></div></div>';
      }).join('') + '</div>' : '<p class="sr-leise">Noch keine Übung in diesem Abschnitt.</p>')
      + '<div class="sr-knoepfe">' + WO.knopf('Eigene Übung', 'stift', 'dunkel', { klein: true, attr: 'data-eigene="' + a.id + '"' }) + WO.knopf('Aus der Bibliothek', 'buch', 'hell', { klein: true, attr: 'data-ausbib="' + a.id + '"' }) + '</div></section>';
  }

  /* ---------- Übung ändern oder neu anlegen (Fenster) ---------- */
  function uebungFenster(aid, u, neu) {
    var e = kopie(u || { id: WZ.id(), name: '', schritte: [], menge: '', haeufig: '2 Mal am Tag', hinweis: '', foto: null });
    var f = WZ.fenster('<h2>' + (neu ? 'Eigene Übung' : 'Übung ändern') + '</h2><p>Alles, was hier steht, liest die Patientin oder der Patient auf dem Blatt: bitte in der Sie-Form.</p>'
      + '<div class="sr-felder">'
      + '<label class="wo-feld sr-breit"><span>Name</span><input id="ue-name" value="' + esc(e.name) + '" placeholder="Zum Beispiel: Treppe hinauf, Stufe für Stufe"></label>'
      + '<label class="wo-feld sr-breit"><span>Schritte, je Zeile ein Schritt</span><textarea id="ue-schritte" rows="5" placeholder="Stellen Sie sich …">' + esc((e.schritte || []).join('\n')) + '</textarea></label>'
      + '<label class="wo-feld"><span>Menge, Wiederholungen</span><input id="ue-menge" value="' + esc(e.menge) + '" placeholder="Zum Beispiel: 10 Mal langsam"></label>'
      + '<div class="wo-feld"><span>Wie oft am Tag</span><div class="wo-wahl" role="group" id="ue-oft">' + HAEUFIG.map(function (h) { return '<button type="button" aria-pressed="' + (e.haeufig === h) + '">' + h + '</button>'; }).join('') + '</div>'
      + '<input id="ue-oft-frei" value="' + esc(HAEUFIG.indexOf(e.haeufig) < 0 ? e.haeufig : '') + '" placeholder="oder frei, zum Beispiel: vor dem Schlafen" aria-label="Häufigkeit frei"></div>'
      + '<label class="wo-feld sr-breit"><span>Hinweis (freiwillig)</span><input id="ue-hinweis" value="' + esc(e.hinweis) + '" placeholder="Zum Beispiel: Nur so weit, wie es angenehm bleibt."></label>'
      + '</div><h3 class="ub-fotokopf">Foto</h3><p class="sr-leise">Ein Foto der Website oder ein eigenes Foto. Eigene Fotos bleiben nur in diesem Browser.</p>'
      + '<div class="sr-fotos" id="ue-fotos"><button type="button" class="sr-foto-leer" data-foto="" aria-pressed="' + !e.foto + '">Kein Foto</button>'
      + '<label class="sr-foto-leer ub-hoch" tabindex="0"><input type="file" accept="image/*" id="ue-datei" hidden>Eigenes Foto wählen</label>'
      + (e.foto && e.foto.art === 'eigen' && fotoCache[e.foto.key] ? '<button type="button" data-foto="eigen:' + e.foto.key + '" aria-pressed="true"><img src="' + fotoCache[e.foto.key] + '" alt=""><span>Eigenes Foto</span></button>' : '')
      + WZ.FOTOS.map(function (x) { return '<button type="button" data-foto="web:' + x.key + '" aria-pressed="' + !!(e.foto && e.foto.art === 'web' && e.foto.key === x.key) + '" title="' + esc(x.alt) + '"><img src="' + esc(x.url) + '" alt="" loading="lazy"><span>' + esc(x.alt) + '</span></button>'; }).join('')
      + '</div><div class="sr-knoepfe">' + WO.knopf('Übernehmen', 'haken', 'dunkel', { id: 'ue-ok' }) + WO.knopf('Abbrechen', 'x', 'hell', { id: 'ue-ab' }) + '</div>', { breit: true });
    var oft = e.haeufig;
    f.querySelector('#ue-oft').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; oft = b.textContent; [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', x === b); }); f.querySelector('#ue-oft-frei').value = ''; });
    f.querySelector('#ue-oft-frei').addEventListener('input', function () { if (this.value.trim()) { oft = this.value.trim(); [].forEach.call(f.querySelectorAll('#ue-oft button'), function (x) { x.setAttribute('aria-pressed', 'false'); }); } });
    var wahlFoto = e.foto;
    f.querySelector('#ue-fotos').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-foto]'); if (!b) return;
      var v = b.dataset.foto; wahlFoto = v ? { art: v.split(':')[0], key: v.split(':')[1] } : null;
      [].forEach.call(this.querySelectorAll('button[data-foto]'), function (x) { x.setAttribute('aria-pressed', x === b); });
    });
    f.querySelector('.ub-hoch').addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); f.querySelector('#ue-datei').click(); } });
    f.querySelector('#ue-datei').addEventListener('change', function () {
      var d = this.files && this.files[0]; if (!d) return;
      verkleinern(d).then(function (url) {
        var k = 'e' + Date.now().toString(36);
        return fotoLegen(k, url).then(function (ok) {
          wahlFoto = { art: 'eigen', key: k };
          var b = document.createElement('button'); b.type = 'button'; b.dataset.foto = 'eigen:' + k; b.innerHTML = '<img src="' + url + '" alt=""><span>Eigenes Foto</span>';
          var box = f.querySelector('#ue-fotos'); box.insertBefore(b, f.querySelector('.ub-hoch').nextSibling);
          [].forEach.call(box.querySelectorAll('button[data-foto]'), function (x) { x.setAttribute('aria-pressed', x === b); });
          if (!ok) WZ.meldung('Foto nur für diese Sitzung', 'Dieser Browser legt keine Fotos ab (zum Beispiel im privaten Fenster). Das Foto steht auf dem Blatt, bis du die Seite schließt.');
        });
      }).catch(function (x) { WZ.meldung('Foto nicht übernommen', x.message, { fehler: true }); });
    });
    f.querySelector('#ue-ab').addEventListener('click', WZ.zu);
    f.querySelector('#ue-ok').addEventListener('click', function () {
      var n = f.querySelector('#ue-name').value.trim();
      if (!n) { f.querySelector('#ue-name').focus(); WZ.meldung('Name fehlt', 'Jede Übung braucht einen Namen.', { fehler: true }); return; }
      e.name = n; e.schritte = f.querySelector('#ue-schritte').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      e.menge = f.querySelector('#ue-menge').value.trim(); e.haeufig = oft; e.hinweis = f.querySelector('#ue-hinweis').value.trim(); e.foto = wahlFoto;
      var a = abschnitt(aid);
      if (neu) a.uebungen.push(e); else a.uebungen = a.uebungen.map(function (x) { return x.id === e.id ? e : x; });
      WZ.zu(); geaendert(); zeige('plan');
    });
  }
  function bibFenster(aid) {
    var B = ST.bib;
    var f = WZ.fenster('<h2>Aus der Bibliothek</h2><p>Eine Übung der Website als Ausgang. Sie kommt als Kopie in den Abschnitt «' + esc(abschnitt(aid).titel || 'ohne Titel') + '», danach schreibst du sie frei um.</p>'
      + B.gruppen.map(function (g) { return '<h3 class="ub-fotokopf ub-fotokopf--bild"><img src="' + esc(H.site + g.bild) + '" alt="">' + esc(g.name) + '</h3><div class="sr-liste">' + g.uebungen.map(function (u) {
        return '<div class="sr-zeile ub-zeile-ohne"><div class="sr-zeile__t"><b>' + esc(u.name) + '</b><small>' + esc(u.menge) + '</small></div><div class="sr-zeile__k">' + WO.knopf('Hinein', 'plus', 'gold', { klein: true, attr: 'data-bibnimm="' + g.id + '|' + u.id + '"' }) + '</div></div>'; }).join('') + '</div>'; }).join(''), { breit: true });
    f.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-bibnimm]'); if (!b) return;
      var x = b.dataset.bibnimm.split('|'); nimm(x[0], x[1], aid); WZ.zu();
    });
  }
  function abschnitt(id) { return ST.offen.abschnitte.filter(function (a) { return a.id === id; })[0]; }
  function nimm(gid, uid, aid) {
    var g = ST.bib.gruppen.filter(function (x) { return x.id === gid; })[0], u = g.uebungen.filter(function (x) { return x.id === uid; })[0];
    if (!ST.offen) { ST.offen = neuePlan(); ST.gespeichert = null; }
    var a = aid ? abschnitt(aid) : ST.offen.abschnitte[ST.offen.abschnitte.length - 1];
    a.uebungen.push(ausBibliothek(u, g)); geaendert();
    WZ.meldung('In den Plan gelegt', '«' + u.name + '» steht jetzt in «' + (a.titel || 'Abschnitt') + '».');
    zeige('plan');
  }

  /* ---------- Ändern, Speichern ---------- */
  function geaendert() { WZ.aenderung(); zeichneLeiste(); }
  function speichern() {
    if (!ST.offen) return;
    if (!WZ.offen() && ST.gespeichert) { WZ.meldung('Nichts geändert', 'Nichts geändert, nichts gespeichert.'); return; }
    var p = ST.offen; delete p.beispiel; if (/^Beispiel: /.test(p.patient)) p.patient = p.patient.replace(/^Beispiel: /, '');
    p.geaendert = Date.now(); var vorher = ST.plaene[p.id] ? kopie(ST.plaene[p.id]) : null;
    ST.plaene[p.id] = kopie(p);
    if (!schreiben()) { if (vorher) ST.plaene[p.id] = vorher; else delete ST.plaene[p.id]; WZ.meldung('Nicht gespeichert', 'Dieser Browser lässt nichts ablegen (zum Beispiel im privaten Fenster). Der Plan bleibt offen, du kannst ihn drucken.', { fehler: true }); return; }
    ST.gespeichert = kopie(p);
    WZ.gespeichert(zeichneLeiste);
    WZ.meldung('Gespeichert', 'Der Plan für ' + (p.patient || 'ohne Namen') + ' liegt in diesem Browser.', { zurueck: vorher ? function () { ST.plaene[p.id] = vorher; schreiben(); ST.offen = kopie(vorher); ST.gespeichert = kopie(vorher); zeige('plan', { ohneFrage: true }); } : null });
    rahmen(p.patient || 'Neuer Plan', 'Übungsplan · ' + zahlUebungen(p) + ' Übungen');
    var h1 = $('.wo-sb__h'); if (h1) h1.textContent = p.patient || 'Neuer Plan';
  }
  function oeffne(id) {
    if (id === 'beispiel') { ST.offen = beispiel(); ST.gespeichert = null; WZ.aenderung(0); zeige('plan', { ohneFrage: true }); return; }
    var p = ST.plaene[id]; if (!p) return;
    if (WZ.offen() && ST.offen && ST.offen.id !== id && !confirm('Der offene Plan hat Änderungen, die nicht gespeichert sind. Trotzdem wechseln?')) return;
    ST.offen = kopie(p); ST.gespeichert = kopie(p); WZ.aenderung(0); zeige('plan', { ohneFrage: true });
  }
  function kopiere(id) {
    var q = id ? ST.plaene[id] : ST.offen; if (!q) return;
    var p = kopie(q); p.id = WZ.id(); p.patient = (q.patient ? q.patient + ' ' : '') + '(Kopie)'; p.datum = WZ.heute(); delete p.beispiel;
    p.abschnitte.forEach(function (a) { a.id = WZ.id(); a.uebungen.forEach(function (u) { u.id = WZ.id(); }); });
    ST.offen = p; ST.gespeichert = null; WZ.aenderung(0); WZ.aenderung();
    WZ.meldung('Kopie angelegt', 'Name eintragen und speichern, dann liegt sie neben dem Original.');
    zeige('plan', { ohneFrage: true });
  }
  function loesche(id) {
    var p = ST.plaene[id]; if (!p) return;
    if (!confirm('Den Plan für ' + (p.patient || 'ohne Namen') + ' löschen?')) return;
    delete ST.plaene[id]; schreiben();
    WZ.meldung('Gelöscht', 'Der Plan für ' + (p.patient || 'ohne Namen') + ' ist entfernt.', { zurueck: function () { ST.plaene[id] = p; schreiben(); zeige('start', { ohneFrage: true }); } });
    if (ST.offen && ST.offen.id === id) { ST.offen = null; WZ.aenderung(0); }
    zeige('start', { ohneFrage: true }); rahmen('Übersicht', 'Übungspläne');
  }
  function schiebe(liste, id, d) { var i = liste.findIndex(function (x) { return x.id === id; }), j = i + d; if (i < 0 || j < 0 || j >= liste.length) return; var t = liste[i]; liste[i] = liste[j]; liste[j] = t; }

  /* ---------- Handgriffe ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-gehe],[data-oeffne],[data-kopiere],[data-loesche],[data-nimm],[data-akt],[data-standort],[data-hoch],[data-runter],[data-aendere],[data-weg],[data-eigene],[data-ausbib],[data-ahoch],[data-aweg],#l-sp,#l-druck,#l-kopie');
    if (!t || t.closest('#fenster')) return;
    if (t.tagName === 'A') e.preventDefault();
    var d = t.dataset;
    if (t.id === 'l-sp') return speichern();
    if (t.id === 'l-druck' || d.akt === 'druck') return WZ.drucken();
    if (t.id === 'l-kopie') return kopiere();
    if (d.gehe === 'start') { zeige('start'); return rahmen('Übersicht', 'Übungspläne'); }
    if (d.gehe === 'bib') { zeige('bib'); return rahmen('Bibliothek', 'Übungen der Website'); }
    if (d.gehe === 'plan') return ST.offen && zeige('plan');
    if (d.gehe === 'neu') { if (WZ.offen() && ST.offen && !confirm('Der offene Plan hat Änderungen, die nicht gespeichert sind. Trotzdem neu beginnen?')) return; ST.offen = neuePlan(); ST.gespeichert = null; WZ.aenderung(0); return zeige('plan', { ohneFrage: true }); }
    if (d.gehe === 'beispiel') return oeffne('beispiel');
    if (d.oeffne) return oeffne(d.oeffne);
    if (d.kopiere) return kopiere(d.kopiere);
    if (d.loesche) return loesche(d.loesche);
    if (d.nimm) { var x = d.nimm.split('|'); return nimm(x[0], x[1]); }
    var p = ST.offen; if (!p) return;
    if (d.akt === 'abschnitt') { p.abschnitte.push({ id: WZ.id(), titel: p.abschnitte.length === 1 ? 'Ab Woche 3' : '', uebungen: [] }); geaendert(); return zeige('plan'); }
    if (d.standort) { p.standort = d.standort; [].forEach.call(t.parentNode.children, function (b) { b.setAttribute('aria-pressed', b === t); }); geaendert(); return zeichneBlatt(); }
    var ab = function (s) { return s.split('|'); };
    if (d.hoch || d.runter) { var v = ab(d.hoch || d.runter); schiebe(abschnitt(v[0]).uebungen, v[1], d.hoch ? -1 : 1); geaendert(); return zeige('plan'); }
    if (d.aendere) { var w = ab(d.aendere); return uebungFenster(w[0], abschnitt(w[0]).uebungen.filter(function (u) { return u.id === w[1]; })[0], false); }
    if (d.weg) { var y = ab(d.weg), a = abschnitt(y[0]), alt = a.uebungen.slice(); a.uebungen = a.uebungen.filter(function (u) { return u.id !== y[1]; }); geaendert(); zeige('plan');
      return WZ.meldung('Übung entfernt', 'Sie steht nicht mehr im Plan.', { zurueck: function () { a.uebungen = alt; geaendert(); zeige('plan'); } }); }
    if (d.eigene) return uebungFenster(d.eigene, null, true);
    if (d.ausbib) return bibFenster(d.ausbib);
    if (d.ahoch) { schiebe(p.abschnitte, d.ahoch, -1); geaendert(); return zeige('plan'); }
    if (d.aweg) { var b = abschnitt(d.aweg); if (b.uebungen.length && !confirm('Den Abschnitt «' + (b.titel || 'ohne Titel') + '» mit ' + b.uebungen.length + ' Übungen entfernen?')) return; p.abschnitte = p.abschnitte.filter(function (q) { return q.id !== d.aweg; }); geaendert(); return zeige('plan'); }
  });
  var tippUhr = 0;
  document.addEventListener('input', function (e) {
    var t = e.target; if (!ST.offen || t.closest('#fenster')) return;
    if (t.dataset.f) ST.offen[t.dataset.f] = t.value;
    else if (t.dataset.a) abschnitt(t.dataset.a).titel = t.value;
    else return;
    geaendert(); clearTimeout(tippUhr); tippUhr = setTimeout(zeichneBlatt, 180);
    if (t.dataset.f === 'patient') WZ.titel(t.value || 'Neuer Plan');
  });
  document.addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); speichern(); } });
  addEventListener('resize', function () { var h = $('#ub-huelle'); if (h) WZ.massstab(h); });

  /* ---------- Start ---------- */
  function los(B) {
    ST.bib = B; lesen();
    B.gruppen.forEach(function (g) { GRUPPENFOTO[g.id] = g.bild; });
    WZ.kopf({ werkzeug: 'uebungen', unter: 'Übungspläne', titel: 'Übersicht', stand: 'Übungspläne', marke: function () { zeige('start'); rahmen('Übersicht', 'Übungspläne'); } });
    WZ.druckQuelle(function () { return document.querySelectorAll('#ub-huelle .sr-blatt'); });
    var m = WZ.ansichtLesen('uebungen');
    eigeneFotosLaden().then(function () {
      if (m && /^plan:/.test(m) && ST.plaene[m.slice(5)]) { ST.offen = kopie(ST.plaene[m.slice(5)]); ST.gespeichert = kopie(ST.offen); zeige('plan', { ohneFrage: true }); }
      else if (m === 'bib') { zeige('bib'); rahmen('Bibliothek', 'Übungen der Website'); }
      else { zeige('start'); rahmen('Übersicht', 'Übungspläne'); }
      window.__srBereit = true;
    });
  }
  fetch('../daten/uebungen.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(function () { return window.UEBUNGEN_ERSATZ; })
    .then(function (B) { if (!B) throw new Error('Die Übungen der Website kamen nicht an.'); los(B); })
    .catch(function (e) { window.__srFehler = (e && e.message) || 'Die Übungspläne starten nicht.'; });   // F171: die Startfehler-Seite zeigt den Grund
})();
