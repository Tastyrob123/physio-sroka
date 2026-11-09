/* profiltexte.js · fertige Texte für Google Unternehmensprofil (Hannover, Hemmingen) und jameda, jeder mit dem Bezug, wo er hinkommt
   (Robert 09.11.2026: «da fehlt der Bezug zu wo»): Plattform, genaues Feld, Weg Schritt für Schritt, Link, Zeichengrenze, nachgezeichnete Stelle, Quelle.
   Wege und Grenzen nur, wo eine offizielle Hilfeseite sie nennt (pruefen/quellen-profiltexte.md, Recherche 09.11.2026); was sich nicht belegen liess,
   steht als «nicht belegt» da und wird nicht behauptet. Die Texte selbst stammen aus der ersten Fassung (Ich-Form, nur Fakten der Website).
   Im Rahmen der Vorlage; die Texte ändern sich hier nicht, deshalb ohne Speichern (R08 nur für Werkzeuge, die ändern). */
(function () {
  'use strict';
  var esc = WZ.esc, $ = WZ.$;
  var G = 'https://support.google.com/business/answer/';
  var Q = {
    bearbeiten: { t: 'Google-Hilfe: Unternehmensprofil bearbeiten', u: G + '3039617?hl=de' },
    beschreibung: { t: 'Google-Hilfe: Beschreibung des Unternehmensprofils verwalten', u: G + '13682007?hl=de' },
    richtlinien: { t: 'Google-Hilfe: Richtlinien für die Präsentation Ihres Unternehmens', u: G + '3038177?hl=de' },
    kategorie: { t: 'Google-Hilfe: Unternehmenskategorie verwalten', u: G + '7249669?hl=de' },
    dienste: { t: 'Google-Hilfe: Dienstleistungen verwalten', u: G + '9455399?hl=de' },
    api: { t: 'Google Business Profile API: ServiceList (Empfehlung 140 / 250 Zeichen)', u: 'https://developers.google.com/my-business/reference/rest/v4/ServiceList' },
    zeiten: { t: 'Google-Hilfe: Öffnungszeiten bearbeiten', u: G + '15300403?hl=de' },
    sonder: { t: 'Google-Hilfe: Spezielle Öffnungszeiten festlegen', u: G + '6303076?hl=de' },
    fotos: { t: 'Google-Hilfe: Fotos oder Videos verwalten', u: G + '6103862?hl=de' },
    fototipps: { t: 'Google-Hilfe: Tipps für unternehmensspezifische Fotos', u: G + '6123536?hl=de' },
    anspruch: { t: 'Google-Hilfe: Unternehmensprofil hinzufügen oder Anspruch erheben', u: G + '2911778?hl=de' },
    bestaetigen: { t: 'Google-Hilfe: Unternehmen bei Google bestätigen', u: G + '7107242?hl=de' },
    standorte: { t: 'Google-Hilfe: Einstieg in Google Unternehmensprofile (mehrere Standorte)', u: G + '7039811?hl=de' },
    rezension: { t: 'Google-Hilfe: Link oder QR-Code zum Anfordern von Rezensionen', u: G + '16816815?hl=de' },
    jameda: { t: 'jameda-Hilfe (Docplanner): Anmelden und Profildaten bearbeiten', u: 'https://help.docplanner.com/10/doc/wie-sie-sich-bei-jameda-anmelden-und-profildaten-bearbeiten' }
  };
  var MEIN = { t: 'Google Suche «mein Unternehmen» öffnen', u: 'https://www.google.com/search?q=mein+Unternehmen' };
  var ADD = { t: 'business.google.com/add öffnen', u: 'https://business.google.com/add' };
  var JAMEDA = { t: 'jameda.de öffnen', u: 'https://www.jameda.de/' };
  var WEG_PROFIL = ['Mit dem Google-Konto anmelden, das mit dem Profil verknüpft ist.', 'In der Google Suche «mein Unternehmen» eingeben (oder das Profil in Google Maps aufrufen).', 'Den richtigen Standort wählen: Hannover und Hemmingen sind zwei eigene Profile.', '«Profil bearbeiten» klicken.'];

  var BESCHR_HAN = 'Ich bin Sylvia Sroka, Physiotherapeutin seit 1986 und Heilpraktikerin für Physiotherapie und Psychotherapie. In meiner Privatpraxis in der Dieterichsstraße 25 in Hannover behandle ich ausschließlich Privatpatienten. Mein Schwerpunkt sind neurologisch schwer und schwerst betroffene Menschen, etwa nach einem Schlaganfall, bei Parkinson, MS, ALS, Querschnitt oder Wachkoma. Ich arbeite unter anderem mit Bobath, CranioSacral-Therapie und Massagen. Außerdem biete ich Körperpsychotherapie und Gespräche an und begleite Menschen bei Überforderung, zum Beispiel bei der Pflege eines Angehörigen. Termine nach Vereinbarung, Montag bis Freitag 8 bis 19 Uhr, Hausbesuche nach Absprache. Ich spreche Deutsch, Englisch und Spanisch.';
  var BESCHR_HEM = 'Seit 2009 führe ich den Physio Rosenpark in Hemmingen, eine Praxis für Physio- und Körperpsychotherapie in der Berliner Straße 16. Ich bin Sylvia Sroka, Physiotherapeutin seit 1986 und Heilpraktikerin für Physiotherapie und Psychotherapie, und behandle ausschließlich Privatpatienten. Mein Schwerpunkt sind neurologisch schwer und schwerst betroffene Menschen. Dazu kommen Bobath, CranioSacral-Therapie, Massagen sowie Körperpsychotherapie und Gesprächstherapie. Als Stressmanagement- und Entspannungstherapeutin und Achtsamkeitstrainerin biete ich Seminare und Prävention an, auch zur Betreuung von Mitarbeitern. Termine nach Vereinbarung, Montag bis Freitag 8 bis 19 Uhr, Hausbesuche nach Absprache. Ich spreche Deutsch, Englisch und Spanisch.';
  var KATEG = 'Hauptkategorie: Physiotherapeut\nWeitere Kategorien: Heilpraktiker, Massagetherapeut';
  var ZEITEN = 'Montag bis Freitag: 08:00 bis 19:00\nSamstag und Sonntag: geschlossen';
  var LEIST = ['Physiotherapie', 'Neurologische Physiotherapie', 'Bobath', 'CranioSacral-Therapie', 'Massage', 'Hausbesuche', 'Körperpsychotherapie', 'Gesprächstherapie', 'Begleitung bei Überforderung, zum Beispiel bei der Pflege eines Angehörigen', 'Stressmanagement und Entspannung', 'Achtsamkeitstraining'];

  function google(ort) {
    var han = ort === 'hannover';
    return [
      { k: 'beschreibung', titel: 'Beschreibung', text: han ? BESCHR_HAN : BESCHR_HEM, grenze: 750, grenzeSatz: 'Höchstens 750 Zeichen, keine Links, keine Preise oder Aktionen.',
        feld: 'Profil bearbeiten · Beschreibung', weg: WEG_PROFIL.concat(['Neben «Beschreibung» auf «Bearbeiten» klicken.', 'Den Text einfügen und «Speichern» klicken.']),
        bild: 'beschreibung', links: [MEIN], quellen: [Q.beschreibung, Q.richtlinien, Q.bearbeiten], hinweis: 'Google zeigt Änderungen meist nach etwa zehn Minuten, in einigen Fällen erst nach Tagen.' },
      { k: 'kategorien', titel: 'Kategorien', text: KATEG, grenze: 0, grenzeSatz: 'Eine Hauptkategorie und bis zu neun weitere, nur aus der Liste von Google.',
        feld: 'Profil bearbeiten · Info · Unternehmenskategorie', weg: WEG_PROFIL.concat(['Unter «Info» die Option «Unternehmenskategorie» wählen.', 'Im Feld «Primäre Kategorie» die ersten Buchstaben eintippen und den Vorschlag wählen, der am besten passt.', '«Weitere Kategorie hinzufügen» für die zweite und dritte, dann speichern.']),
        bild: 'kategorie', links: [MEIN], quellen: [Q.kategorie], hinweis: 'Die Namen oben sind Vorschläge; Google bietet nur Kategorien aus der eigenen Liste an, dann die nächstliegende wählen. Beide Standorte brauchen dieselbe Hauptkategorie.' },
      { k: 'leistungen', titel: 'Leistungen', text: (han ? LEIST : LEIST.concat(['Seminare und Prävention', 'Betreuung von Mitarbeitern'])).join('\n'), grenze: 0, zeilenGrenze: 140,
        grenzeSatz: 'Die Hilfe nennt keine Grenze. Die Schnittstelle von Google empfiehlt bis 140 Zeichen je Name einer eigenen Leistung; jede Zeile hier bleibt darunter.',
        feld: 'Profil bearbeiten · Dienstleistungen', weg: WEG_PROFIL.concat(['«Dienstleistungen bearbeiten» wählen.', '«Weitere Dienstleistungen hinzufügen»; steht eine Leistung nicht in der Liste, «Benutzerdefinierte Dienstleistung hinzufügen».', 'Jede Zeile oben als eigene Leistung anlegen, dann speichern.']),
        bild: 'dienste', links: [MEIN], quellen: [Q.dienste, Q.api], hinweis: 'Keine Preise und keine Telefonnummern in den Namen; solche Leistungen lehnt Google ab.' },
      { k: 'zeiten', titel: 'Öffnungszeiten', text: ZEITEN, grenze: 0, grenzeSatz: 'Keine Zeichengrenze; je Tag eine Angabe.',
        feld: 'Profil bearbeiten · Öffnungszeiten', weg: WEG_PROFIL.concat(['«Öffnungszeiten» wählen.', 'Montag bis Freitag 08:00 bis 19:00 eintragen, Samstag und Sonntag als geschlossen.', 'Speichern. Für Urlaub oder Feiertage im selben Bereich neben «Spezielle Öffnungszeiten» auf «Bearbeiten».']),
        bild: 'zeiten', links: [MEIN], quellen: [Q.zeiten, Q.sonder], hinweis: '«Termine nach Vereinbarung, Hausbesuche nach Absprache» passt in kein Zeitfeld; es steht schon in der Beschreibung.' }
    ];
  }
  var JAM = [
    { k: 'ueber', titel: 'Über mich', text: 'Ich bin Physiotherapeutin seit 1986. Mein Schwerpunkt sind Menschen, die neurologisch schwer und schwerst betroffen sind. In diesem Bereich bilde ich mich laufend fort, zu Wachkoma, Bandscheibenvorfall, Schlaganfall, Parkinson, MS, ALS und Querschnitt.\n\nAußerdem bin ich Heilpraktikerin für Physiotherapie und Psychotherapie, CranioSacral-Therapeutin, Stressmanagement- und Entspannungstherapeutin und Achtsamkeitstrainerin. Neben der Physiotherapie biete ich deshalb auch Körperpsychotherapie und Gesprächstherapie an. Ich begleite Menschen, die überfordert sind, zum Beispiel bei der Pflege eines Angehörigen.\n\nIch behandle in meiner Privatpraxis in Hannover und im Physio Rosenpark in Hemmingen, dessen Inhaberin ich seit 2009 bin. Freiberuflich arbeite ich außerdem für The Balance Luxury Rehab auf Mallorca.\n\nIch behandle ausschließlich Privatpatienten, eine Abrechnung über die gesetzliche Krankenversicherung ist nicht möglich. Termine gibt es nach Vereinbarung, Hausbesuche nach Absprache. Ich spreche Deutsch, Englisch und Spanisch.',
      grenze: 0, grenzeSatz: 'Zeichengrenze nicht belegt: die jameda-Hilfe nennt keine. Der Editor zeigt sie beim Einfügen.',
      feld: 'Mein Profil · Über mich', weg: ['Auf jameda mit E-Mail-Adresse und Passwort anmelden («Einloggen»).', 'Im linken Menü des Kalenders «Mein Profil» wählen.', 'Zum Abschnitt «Über mich» gehen und den Text einfügen.', 'Unten «Änderungen speichern» klicken; mit «Öffentliches Profil» prüfen, wie Patienten es sehen.'],
      bild: 'jameda', links: [JAMEDA], quellen: [Q.jameda], hinweis: 'Die genaue Adresse der Anmeldeseite ist nicht belegt; der Link öffnet die Startseite von jameda.' },
    { k: 'erkrankungen', titel: 'Behandelte Erkrankungen', text: 'Schlaganfall\nParkinson\nMultiple Sklerose\nALS\nQuerschnittlähmung\nWachkoma\nBandscheibenvorfall',
      grenze: 0, grenzeSatz: 'Zeichengrenze nicht belegt. Vermutlich wählt man aus einer Liste; dann die gleichnamigen Einträge wählen.',
      feld: 'Mein Profil · behandelte Erkrankungen', weg: ['Anmelden und im linken Menü «Mein Profil» wählen.', 'Zum Abschnitt «behandelte Erkrankungen» gehen.', 'Die Erkrankungen oben eintragen oder aus der Liste wählen.', 'Unten «Änderungen speichern».'],
      bild: 'jameda', links: [JAMEDA], quellen: [Q.jameda], hinweis: 'Die Hilfe nennt den Abschnitt «behandelte Erkrankungen»; ein Feld «Behandlungsschwerpunkte» nennt sie nicht, deshalb steht es hier nicht mehr.' },
    { k: 'sprachen', titel: 'Gesprochene Sprachen', text: 'Deutsch\nEnglisch\nSpanisch', grenze: 0, grenzeSatz: 'Keine Zeichengrenze; Sprachen werden gewählt.',
      feld: 'Mein Profil · gesprochene Sprachen', weg: ['Anmelden und im linken Menü «Mein Profil» wählen.', 'Zum Abschnitt «gesprochene Sprachen» gehen und Deutsch, Englisch und Spanisch wählen.', 'Unten «Änderungen speichern».'],
      bild: 'jameda', links: [JAMEDA], quellen: [Q.jameda], hinweis: '' }
  ];
  var BEREICHE = {
    hannover: { titel: 'Google, Hannover', unter: 'Unternehmensprofil der Privatpraxis Sylvia Sroka, Dieterichsstraße 25', foto: 'echt-fenster-a', texte: google('hannover') },
    hemmingen: { titel: 'Google, Hemmingen', unter: 'Unternehmensprofil von Physio Rosenpark, Berliner Straße 16', foto: 'echt-cranio', texte: google('hemmingen') },
    jameda: { titel: 'jameda', unter: 'Profil auf jameda, für beide Standorte', foto: 'echt-haende-halten', texte: JAM }
  };
  var SELBST = [
    { t: 'Profile beanspruchen', s: 'Auf business.google.com/add das Unternehmen suchen. Gibt es den Eintrag schon, «Inhaberschaft für dieses Unternehmen geltend machen» oder «Zugriff anfordern»; Google bestätigt per Telefon, SMS, E-Mail, Postkarte oder Videoanruf. Hannover und Hemmingen sind zwei Profile.', links: [ADD], quellen: [Q.anspruch, Q.bestaetigen, Q.standorte] },
    { t: 'Texte einfügen', s: 'Beschreibung, Kategorien, Leistungen und Öffnungszeiten aus den Bereichen links kopieren, jeder Text sagt, wohin er kommt.', links: [], quellen: [Q.bearbeiten] },
    { t: 'Fotos hochladen', s: 'Eigene Fotos von Eingang, Behandlungsraum und ein Porträt. JPG oder PNG, 10 KB bis 5 MB, empfohlen 720 × 720 Pixel, ohne starke Filter. Keine Patienten zeigen, außer sie haben schriftlich zugestimmt. Fotos erscheinen erst, wenn das Profil bestätigt ist.', links: [MEIN], quellen: [Q.fotos, Q.fototipps] },
    { t: 'Karte für Bewertungen auslegen', s: 'Die Karten aus den Drucksachen drucken. Ihr QR-Code öffnet die Praxis in Google Maps. Ist das Profil bestätigt, gibt es unter «Rezensionen lesen» beim Teilen-Symbol von «Mehr Rezensionen erhalten» einen eigenen Link mit QR-Code (nur am Computer); er kann den Code der Karte ersetzen. Für Bewertungen nie eine Gegenleistung anbieten, das verbietet Google.', links: [{ t: 'Drucksachen öffnen', u: 'drucksachen/index.html', hier: true }], quellen: [Q.rezension] },
    { t: 'Auf Bewertungen antworten', s: 'Kurz und freundlich antworten, ohne Angaben zur Behandlung. Auch dort gilt die Schweigepflicht.', links: [], quellen: [] }
  ];

  /* ---------- nachgezeichnete Stellen (keine Bildschirmfotos): nur die Bezeichnungen, die die Hilfe nennt ---------- */
  function skizze(art) {
    var feld = function (t, an) { return '<div class="pt-sk__feld' + (an ? ' pt-sk__an' : '') + '"><span>' + t + '</span>' + (an ? '<i>hier einfügen</i>' : '') + '</div>'; };
    if (art === 'jameda') return '<div class="pt-sk pt-sk--jameda" aria-hidden="true"><div class="pt-sk__menue"><span>Kalender</span><span class="pt-sk__an">Mein Profil</span><span>Mein Konto</span></div><div class="pt-sk__seite"><b>Mein Profil</b>'
      + feld('Über mich', true) + feld('Unterspezialisierungen') + feld('behandelte Erkrankungen') + feld('gesprochene Sprachen') + '<div class="pt-sk__knopf">Änderungen speichern</div></div></div>';
    var ziel = { beschreibung: 'Beschreibung', kategorie: 'Unternehmenskategorie', dienste: 'Dienstleistungen', zeiten: 'Öffnungszeiten' }[art];
    return '<div class="pt-sk" aria-hidden="true"><div class="pt-sk__suche"><span>mein Unternehmen</span></div><div class="pt-sk__karte"><b>Physiotherapie Sylvia Sroka</b><div class="pt-sk__knopf pt-sk__an">Profil bearbeiten</div></div>'
      + '<div class="pt-sk__fenster"><div class="pt-sk__reiter"><span' + (art !== 'zeiten' ? ' class="pt-sk__an"' : '') + '>Info</span><span' + (art === 'zeiten' ? ' class="pt-sk__an"' : '') + '>Öffnungszeiten</span></div>'
      + ['Unternehmenskategorie', 'Beschreibung', 'Dienstleistungen', 'Öffnungszeiten'].map(function (t) { return feld(t + (t === ziel ? ' · Bearbeiten' : ''), t === ziel); }).join('') + '</div></div>';
  }

  /* ---------- Ansichten ---------- */
  var ansicht = 'start';
  function zeichneRand() {
    WZ.rand([
      { eintraege: [{ text: 'Übersicht', an: ansicht === 'start', attr: 'data-gehe="start"' }] },
      { titel: 'Wohin', eintraege: Object.keys(BEREICHE).map(function (k) { return { text: BEREICHE[k].titel, zahl: BEREICHE[k].texte.length, an: ansicht === k, attr: 'data-gehe="' + k + '"' }; }) },
      { titel: 'Für dich', eintraege: [{ text: 'Was du selbst tust', zahl: SELBST.length, an: ansicht === 'selbst', attr: 'data-gehe="selbst"' }, { text: 'Quellen', an: ansicht === 'quellen', attr: 'data-gehe="quellen"' }] }
    ]);
  }
  function laenge(t) { return Array.from(t).length; }
  function textKarte(b, x, n) {
    var L = laenge(x.text), zu = x.grenze && L > x.grenze, lang = x.zeilenGrenze ? Math.max.apply(null, x.text.split('\n').map(laenge)) : 0;
    return '<article class="sr-karte pt-text" id="t-' + b + '-' + x.k + '"><div class="sr-karte__kopf"><div><p class="wo-mk">' + esc(BEREICHE[b].titel) + ' · Text ' + (n + 1) + '</p><h3>' + esc(x.titel) + '</h3></div>'
      + WO.knopf('Kopieren', 'kopie', 'dunkel', { klein: true, attr: 'data-kopiere="' + b + '|' + x.k + '"' }) + '</div>'
      + '<div class="pt-oben"><pre class="pt-wortlaut">' + esc(x.text) + '</pre>'
      + '<p class="pt-zaehler' + (zu ? ' pt-zaehler--zu' : '') + '">' + (x.grenze ? L + ' von ' + x.grenze + ' Zeichen' : x.zeilenGrenze ? 'Längste Zeile ' + lang + ' von ' + x.zeilenGrenze + ' Zeichen' : L + ' Zeichen') + ' · ' + esc(x.grenzeSatz) + '</p></div>'
      + '<div class="pt-wohin"><div class="pt-wohin__t"><p class="wo-mk">Wohin</p><p class="pt-feld">' + esc(x.feld) + '</p><ol class="pt-weg">' + x.weg.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>'
      + '<div class="pt-links-kn">' + x.links.map(function (l) { return WO.knopf(l.t, 'pfeil', 'gold', { href: l.u, neu: !l.hier, klein: true }); }).join('') + '</div>'
      + (x.hinweis ? '<p class="pt-hinweis">' + esc(x.hinweis) + '</p>' : '')
      + '<p class="pt-quelle">Quelle: ' + x.quellen.map(function (q) { return '<a href="' + q.u + '" target="_blank" rel="noopener">' + esc(q.t) + '</a>'; }).join(' · ') + '</p></div>'
      + '<figure class="pt-wohin__bild"><figcaption class="wo-mk">Die Stelle, nachgezeichnet</figcaption>' + skizze(x.bild) + '</figure></div></article>';
  }
  function zeige(a) {
    ansicht = a; WZ.ansichtMerken('profile', a);
    var r = $('#raum'), B = BEREICHE[a];
    if (B) {
      r.innerHTML = WO.startbild({ werkzeug: 'profile', art: 'buehne', foto: WZ.foto(B.foto).url, h1: esc(B.titel), satz: esc(B.unter) + '. Zu jedem Text steht daneben, in welches Feld er kommt und wie du dorthin findest.' })
        + B.texte.map(function (x, n) { return textKarte(a, x, n); }).join('');
      WZ.titel(B.titel, B.texte.length + ' Texte');
    } else if (a === 'selbst') {
      r.innerHTML = WO.startbild({ werkzeug: 'profile', art: 'buehne', foto: WZ.foto('termin-ankommen').url, h1: 'Was du <em>selbst tust</em>', satz: 'Diese Schritte gehen nur mit deinem eigenen Zugang bei Google und jameda.' })
        + '<div class="sr-liste pt-selbst">' + SELBST.map(function (x, i) {
          return '<div class="sr-karte"><div class="sr-karte__kopf"><div><p class="wo-mk">Schritt ' + (i + 1) + '</p><h3>' + esc(x.t) + '</h3></div></div><p class="pt-satz">' + esc(x.s) + '</p>'
            + (x.links.length ? '<div class="pt-links-kn">' + x.links.map(function (l) { return WO.knopf(l.t, 'pfeil', 'gold', { href: l.u, neu: !l.hier, klein: true }); }).join('') + '</div>' : '')
            + (x.quellen.length ? '<p class="pt-quelle">Quelle: ' + x.quellen.map(function (q) { return '<a href="' + q.u + '" target="_blank" rel="noopener">' + esc(q.t) + '</a>'; }).join(' · ') + '</p>' : '') + '</div>';
        }).join('') + '</div>';
      WZ.titel('Was du selbst tust', SELBST.length + ' Schritte');
    } else if (a === 'quellen') {
      var alle = Object.keys(Q).map(function (k) { return Q[k]; });
      r.innerHTML = WO.startbild({ werkzeug: 'profile', art: 'buehne', foto: WZ.foto('echt-gespraech').url, h1: 'Woher <em>die Wege stammen</em>', satz: 'Alle Wege und Grenzen stammen aus den offiziellen Hilfeseiten, geprüft am 09.11.2026. Menüs ändern sich; stimmt eine Bezeichnung nicht mehr, gilt, was Google oder jameda gerade zeigen.' })
        + '<section class="sr-karte"><div class="sr-karte__kopf"><div><h2>Offizielle Hilfeseiten</h2><p>Die Seiten selbst waren beim Prüfen nicht direkt erreichbar; belegt ist über die Suche mit Titel, Adresse und Auszug der jeweiligen Hilfeseite.</p></div></div><ul class="pt-qliste">'
        + alle.map(function (q) { return '<li><a href="' + q.u + '" target="_blank" rel="noopener">' + esc(q.t) + '</a><small>' + esc(q.u.replace(/^https:\/\//, '')) + '</small></li>'; }).join('') + '</ul></section>'
        + '<section class="sr-karte"><div class="sr-karte__kopf"><div><h2>Nicht belegt</h2><p>Darum steht es im Werkzeug nicht als Tatsache.</p></div></div><ul class="pt-nicht"><li>Eine Adresse, die den Profil-Editor von Google direkt öffnet. Deshalb führt der Link über die Google Suche «mein Unternehmen».</li><li>Die genaue Klickfolge für Fotos bei Google.</li><li>Die Adresse der Anmeldeseite von jameda und Zeichengrenzen der jameda-Felder.</li><li>Ein jameda-Feld «Behandlungsschwerpunkte» und welche Felder nur in bezahlten Paketen frei sind.</li></ul></section>';
      WZ.titel('Quellen', 'Profiltexte');
    } else {
      var n = Object.keys(BEREICHE).reduce(function (m, k) { return m + BEREICHE[k].texte.length; }, 0);
      r.innerHTML = WO.startbild({ werkzeug: 'profile', art: 'voll', foto: WZ.foto('echt-haende-halten').url, h1: '<span data-wo-gruss>' + WO.gruss() + '</span> <em>Wohin kommt welcher Text?</em>',
          satz: n + ' fertige Texte für Google und jameda. Zu jedem steht das genaue Feld, der Weg dorthin Schritt für Schritt, ein Link, die Zeichengrenze und eine Skizze der Stelle.',
          knoepfe: WO.knopf('Google, Hannover', 'pfeil', 'gold', { attr: 'data-gehe="hannover"' }) + WO.knopf('Was du selbst tust', 'haken', 'glas', { attr: 'data-gehe="selbst"' }) })
        + '<div class="wo-lage">' + Object.keys(BEREICHE).map(function (k) { var B2 = BEREICHE[k]; return '<div class="wo-lg"><i class="wo-lg__z">' + WO.ic(k === 'jameda' ? 'person' : 'welt') + '</i><span class="wo-mk">' + B2.texte.length + ' Texte</span><b>' + esc(B2.titel) + '</b><p>' + esc(B2.unter) + '.</p><a class="wo-lk" href="#" data-gehe="' + k + '">Texte und Wege</a></div>'; }).join('') + '</div>'
        + '<h2 class="wo-zw">Alle Texte <em>und ihr Ort</em></h2><div class="sr-liste">' + Object.keys(BEREICHE).map(function (k) {
          return BEREICHE[k].texte.map(function (x) {
            return '<div class="sr-zeile"><div class="sr-zeile__b"><img src="' + esc(WZ.foto(BEREICHE[k].foto).url) + '" alt=""></div><div class="sr-zeile__t"><b>' + esc(x.titel) + ' · ' + esc(BEREICHE[k].titel) + '</b><small>' + esc(x.feld) + ' · ' + (x.grenze ? laenge(x.text) + ' von ' + x.grenze + ' Zeichen' : esc(x.grenzeSatz.split('.')[0])) + '</small></div>'
              + '<div class="sr-zeile__k">' + WO.knopf('Ansehen', 'pfeil', 'hell', { klein: true, attr: 'data-gehe="' + k + '" data-ziel="t-' + k + '-' + x.k + '"' }) + '</div></div>';
          }).join('');
        }).join('') + '</div>';
      WZ.titel('Übersicht', 'Profiltexte');
    }
    zeichneRand(); scrollTo(0, 0);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-gehe],[data-kopiere]'); if (!t) return;
    if (t.tagName === 'A' && t.getAttribute('href') === '#') e.preventDefault();
    if (t.dataset.gehe) { zeige(t.dataset.gehe); var z = t.dataset.ziel && document.getElementById(t.dataset.ziel); if (z) setTimeout(function () { z.scrollIntoView({ block: 'start' }); }, 30); return; }
    var k = t.dataset.kopiere.split('|'), x = BEREICHE[k[0]].texte.filter(function (y) { return y.k === k[1]; })[0];
    kopieren(x.text).then(function () { WZ.meldung('Kopiert', '«' + x.titel + '» liegt in der Zwischenablage. Einfügen in: ' + x.feld + '.'); var s = t.querySelector('span'); if (s) { s.textContent = 'Kopiert'; setTimeout(function () { s.textContent = 'Kopieren'; }, 1800); } })
      .catch(function () { WZ.meldung('Nicht kopiert', 'Der Browser lässt das Kopieren nicht zu. Den Text markieren und mit Cmd C kopieren.', { fehler: true }); });
  });
  function kopieren(text) {
    var alt = function () { var f = document.createElement('textarea'); f.value = text; f.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'; document.body.appendChild(f); f.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} f.remove(); return ok ? Promise.resolve() : Promise.reject(new Error('nein')); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).catch(alt); } catch (e) {}
    return alt();
  }

  WZ.kopf({ werkzeug: 'profile', unter: 'Profiltexte', titel: 'Übersicht', stand: 'Profiltexte', marke: function () { zeige('start'); } });
  var m = WZ.ansichtLesen('profile'); zeige(m && (BEREICHE[m] || m === 'selbst' || m === 'quellen') ? m : 'start');
  var l = $('#leiste'); if (l) l.remove();   // R08: die Leiste haben nur Werkzeuge, die etwas ändern
  window.__srBereit = true;
})();
