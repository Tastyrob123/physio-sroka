/* Prüfung der Praxis-Werkzeuge nach dem Umbau in den Rahmen der Vorlage (09.11.2026), Playwright Chromium.
   Aufruf im Stamm:  timeout 900 node pruefen/werkzeuge.js [ausgabeordner]
   Startet selbst einen kleinen Server (python3 -m http.server), legt Bilder und PDFs im Ausgabeordner ab
   und meldet jede Einzelprüfung. Endet mit Code 1, wenn etwas fehlschlägt.
   WebKit: wird geprüft, wenn ein WebKit für dieses Playwright da ist (PRUEF_WEBKIT=1); in der Cloud war der Download gesperrt. */
'use strict';
const { chromium, webkit } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const STAMM = path.resolve(__dirname, '..');
const AUS = path.resolve(process.argv[2] || path.join(require('os').tmpdir(), 'werkzeuge-pruefung'));
const PORT = 8765 + Math.floor(Math.random() * 200);
const BASIS = 'http://127.0.0.1:' + PORT + '/werkzeuge/';
fs.mkdirSync(AUS, { recursive: true });

let ok = 0, fehl = 0;
const fehler = [];
function pruefe(bed, was) {
  if (bed) { ok++; console.log('  ok   ' + was); }
  else { fehl++; fehler.push(was); console.log('  FEHL ' + was); }
}
/* Rand ist am Handy eingeklappt: Wege im Rand per Element-Klick */
async function rk(page, sel) { await page.$eval(sel, e => e.click()); }
function warte(ms) { return new Promise(r => setTimeout(r, ms)); }

async function neueSeite(browser, breite, extra) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: breite, height: 900 }, deviceScaleFactor: 1 }, extra || {}));
  const page = await ctx.newPage();
  const meldungen = [];
  page.on('console', m => { if (m.type() === 'error') meldungen.push('console: ' + m.text()); });
  page.on('pageerror', e => meldungen.push('pageerror: ' + e.message));
  page.on('requestfailed', r => { if (r.url().startsWith('http://127.0.0.1')) meldungen.push('requestfailed: ' + r.url()); });
  page.on('response', r => { if (r.status() >= 400) meldungen.push('http ' + r.status() + ': ' + r.url()); });
  page.on('dialog', d => d.accept());
  return { ctx, page, meldungen };
}
async function bereit(page) {
  await page.waitForFunction(() => window.__srBereit === true, null, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await warte(250);
}

/* Grundregeln je Ansicht (Auftrag, Fehlerbuch 10a): kein Überlauf, kein select/Datumsfeld, nichts fett/kursiv, keine Emojis, Schrift ab 12 px */
async function grundpruefung(page, name, breite) {
  const b = await page.evaluate(() => {
    const doc = document.documentElement, W = doc.clientWidth;
    const ueber = doc.scrollWidth - W;
    const zuBreit = [], fett = [], kursiv = [], klein = [];
    document.querySelectorAll('body *').forEach(el => {
      if (el.closest('.sr-huelle, .sr-blatt, #sr-druckbereich, svg, .pt-sk')) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      let p = el, verborgen = false; while (p && p !== document.body) { const c = getComputedStyle(p); if (c.overflowX === 'hidden' || c.overflowX === 'auto' || c.overflowX === 'scroll' || c.overflow === 'hidden') { const pr = p.getBoundingClientRect(); if (r.right > pr.right + 1 || r.left < pr.left - 1) { verborgen = true; break; } } p = p.parentElement; }
      if (!verborgen && (r.right > W + 1 || r.left < -1) && !el.closest('[aria-hidden="true"]')) zuBreit.push(el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 40) + ' ' + Math.round(r.left) + '–' + Math.round(r.right));
      const hatText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
      if (!hatText) return;
      if (+cs.fontWeight >= 600) fett.push(el.tagName + '.' + el.className + ' ' + cs.fontWeight);
      if (cs.fontStyle !== 'normal') kursiv.push(el.tagName + '.' + el.className + ' «' + el.textContent.trim().slice(0, 20) + '»');
      if (parseFloat(cs.fontSize) < 12) klein.push(el.tagName + '.' + el.className + ' ' + cs.fontSize);
    });
    const auswahl = document.querySelectorAll('select, input[type=date], input[type=datetime-local], input[type=month], input[type=week], input[type=time], datalist').length;
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(document.body.innerText);
    return { ueber, zuBreit: zuBreit.slice(0, 4), fett: fett.slice(0, 3), kursiv: kursiv.slice(0, 3), klein: klein.slice(0, 3), auswahl, emoji };
  });
  const t = name + ' @' + breite + ': ';
  pruefe(b.ueber <= 0, t + 'kein waagrechter Überlauf (' + b.ueber + ' px)');
  pruefe(b.zuBreit.length === 0, t + 'kein Element ragt aus dem Schirm ' + JSON.stringify(b.zuBreit));
  pruefe(b.fett.length === 0, t + 'nichts fett ' + JSON.stringify(b.fett));
  pruefe(b.kursiv.length === 0, t + 'nichts kursiv ' + JSON.stringify(b.kursiv));
  pruefe(b.klein.length === 0, t + 'keine Schrift unter 12 px ' + JSON.stringify(b.klein));
  pruefe(b.auswahl === 0, t + 'kein select und kein Datumsfeld');
  pruefe(!b.emoji, t + 'keine Emojis');
}

async function pdfVon(page, datei) {
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: datei, preferCSSPageSize: true, printBackground: true });
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  const info = execFileSync('pdfinfo', ['-f', '1', '-l', '99', datei]).toString();
  const seiten = +(/Pages:\s+(\d+)/.exec(info) || [0, 0])[1];
  const groessen = [];
  info.replace(/Page\s+\d+ size:\s+([\d.]+) x ([\d.]+) pts/g, (_, w, h) => { groessen.push([+(w * 25.4 / 72).toFixed(1), +(h * 25.4 / 72).toFixed(1)]); });
  const text = execFileSync('pdftotext', ['-layout', datei, '-']).toString();
  return { seiten, groessen, text };
}
function pdfBilder(datei, praefix) { execFileSync('pdftoppm', ['-r', '60', '-png', datei, praefix]); }
const istA4 = g => Math.abs(g[0] - 210) < 1 && Math.abs(g[1] - 297) < 1;

/* Blätter: kein Inhalt läuft über den Rand einer Seite (ein Block bricht nie über eine Seite) */
async function blaetterSauber(page, huelle) {
  return page.evaluate(h => Array.from(document.querySelectorAll(h + ' .sr-blatt')).map(s => { const b = s.querySelector('.sr-blatt__in'); return b.scrollHeight - b.clientHeight; }), huelle);
}

async function ansichten(browser, name, datei, wege) {
  for (const breite of [1440, 390]) {
    const { ctx, page, meldungen } = await neueSeite(browser, breite);
    await page.goto(BASIS + datei + '?von=uebersicht', { waitUntil: 'load' });
    await bereit(page);
    for (const w of wege) {
      if (w.klick) { await rk(page, w.klick); await warte(400); }
      await page.evaluate(() => document.fonts.ready);
      await grundpruefung(page, name + ' · ' + w.n, breite);
      await page.screenshot({ path: path.join(AUS, 'ansicht-' + name + '-' + w.n.replace(/\W+/g, '_') + '-' + breite + '.png'), fullPage: true });
    }
    pruefe(meldungen.length === 0, name + ' @' + breite + ': keine Konsolenfehler und keine fehlgeschlagenen Anfragen ' + JSON.stringify(meldungen.slice(0, 4)));
    await ctx.close();
  }
}

async function lauf(browser, bname) {
  console.log('\n== ' + bname + ' ==');
  /* 1. Ansichten bei 1440 und 390 */
  await ansichten(browser, 'uebersicht', 'index.html', [{ n: 'start' }]);
  await ansichten(browser, 'uebungsplan', 'uebungsplan.html', [{ n: 'start' }, { n: 'beispiel', klick: '[data-gehe="beispiel"] >> nth=0' }, { n: 'bibliothek', klick: '#rand [data-gehe="bib"]' }]);
  await ansichten(browser, 'rechnung', 'rechnung.html', [{ n: 'rechnung' }, { n: 'angaben', klick: '#rand [data-gehe="angaben"]' }]);
  await ansichten(browser, 'profiltexte', 'profiltexte.html', ['start', 'hannover', 'hemmingen', 'jameda', 'selbst', 'quellen'].map((k, i) => ({ n: k, klick: i ? '#rand [data-gehe="' + k + '"]' : null })));
  /* Drucksachen: Werkstatt (eigene Oberfläche), Weiterleitung aus drucksachen.html */
  for (const breite of [1440, 390]) {
    const { ctx, page, meldungen } = await neueSeite(browser, breite);
    await page.goto(BASIS + 'drucksachen.html', { waitUntil: 'load' });
    await page.waitForURL(/drucksachen\/index\.html/, { timeout: 10000 });
    await page.waitForFunction(() => window.DSStart && window.DSStudio, null, { timeout: 20000 });
    await warte(1500);
    const ueber = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    pruefe(ueber <= 0, 'drucksachen @' + breite + ': kein waagrechter Überlauf (' + ueber + ' px)');
    pruefe(await page.evaluate(() => Array.from(document.querySelectorAll('select, input[type=date]')).filter(e => !(e.classList.contains('hwahl-nativ') && e.getAttribute('aria-hidden') === 'true' && e._gw)).length) === 0, 'drucksachen @' + breite + ': kein sichtbares select und kein Datumsfeld (die Werkstatt legt eigene Wahlknöpfe über verborgene Felder)');
    const text = await page.evaluate(() => document.body.innerText);
    pruefe(!/Gilles|Varone|Restaurant|Savi[eè]se/i.test(text), 'drucksachen @' + breite + ': kein Wort der Vorlage sichtbar ' + ((/Gilles|Varone|Restaurant|Savi[eè]se/i.exec(text) || [])[0] || ''));
    pruefe(/Sroka/.test(text), 'drucksachen @' + breite + ': Praxis im Kopf');
    await page.screenshot({ path: path.join(AUS, 'ansicht-drucksachen-' + breite + '.png'), fullPage: false });
    pruefe(meldungen.length === 0, 'drucksachen @' + breite + ': keine Konsolenfehler und keine fehlgeschlagenen Anfragen ' + JSON.stringify(meldungen.slice(0, 4)));
    await ctx.close();
  }

  /* 2. Übersicht: vier Werkzeuge, Wege */
  {
    const { ctx, page, meldungen } = await neueSeite(browser, 1440);
    await page.goto(BASIS + 'index.html', { waitUntil: 'load' }); await bereit(page);
    const karten = await page.$$eval('.uw-karte', ks => ks.map(k => ({ href: k.getAttribute('href'), name: k.querySelector('b').textContent, img: !!k.querySelector('img') })));
    pruefe(karten.length === 4, 'Übersicht: vier Werkzeuge ' + JSON.stringify(karten.map(k => k.name)));
    for (const k of karten) { const r = await page.request.get(new URL(k.href, BASIS + 'index.html').href); pruefe(r.ok(), 'Übersicht: Ziel ' + k.href + ' erreichbar'); }
    const bilder = await page.$$eval('.uw-karte img', is => is.map(i => i.naturalWidth > 0 && /\/media\//.test(i.src)));
    pruefe(bilder.length === 4 && bilder.every(Boolean), 'Übersicht: Fotos der Website, keine Bildschirmfotos');
    const web = await page.$$eval('a:not(.uw-karte)', as => as.filter(a => /Website/.test(a.textContent)).map(a => a.href));
    pruefe(web.length > 0 && web.every(h => /\/index\.html$|\/$/.test(h) && !/\/werkzeuge\//.test(h)), 'Übersicht: Rückweg zur Website ' + JSON.stringify(web.slice(0, 2)));
    await page.click('.uw-karte >> nth=0'); await page.waitForLoadState();
    pruefe(/uebungsplan\.html/.test(page.url()), 'Übersicht: Karte öffnet die Übungspläne');
    pruefe(meldungen.length === 0, 'Übersicht: keine Fehler ' + JSON.stringify(meldungen));
    await ctx.close();
  }

  /* 3. Übungsplan */
  for (const breite of [1440, 390]) {
    const { ctx, page, meldungen } = await neueSeite(browser, breite);
    const t = 'Übungsplan @' + breite + ': ';
    await page.goto(BASIS + 'uebungsplan.html?von=uebersicht', { waitUntil: 'load' }); await bereit(page);
    const daten = JSON.parse(fs.readFileSync(path.join(STAMM, 'daten/uebungen.json'), 'utf8'));
    const alle = daten.gruppen.reduce((a, g) => a.concat(g.uebungen.map(u => Object.assign({ g: g.id }, u))), []);
    /* Beispiel */
    await page.click('[data-gehe="beispiel"] >> nth=0'); await warte(400);
    pruefe(await page.$$eval('#ub-huelle .ub-uebung', x => x.length) === 6, t + 'Beispiel mit sechs Übungen in zwei Abschnitten');
    /* neuer Plan */
    await rk(page, '#rand [data-gehe="neu"]'); await warte(300);
    await page.fill('[data-f="patient"]', 'Erika Muster');
    await page.fill('[data-f="ziel"]', 'Sicher Treppen steigen');
    await page.fill('[data-f="notiz"]', 'Langsam beginnen und auf die Atmung achten.');
    const aid = await page.getAttribute('[data-abschnitt]', 'data-abschnitt');
    /* drei Übungen aus der Bibliothek */
    for (const u of alle.slice(0, 3)) {
      await page.click('[data-ausbib="' + aid + '"]'); await warte(200);
      await page.click('#fenster [data-bibnimm="' + u.g + '|' + u.id + '"]'); await warte(300);
    }
    pruefe(await page.$$eval('[data-abschnitt] [data-aendere]', x => x.length) === 3, t + 'drei Übungen aus der Bibliothek im Plan');
    /* eigene Übung */
    await page.click('[data-eigene="' + aid + '"]'); await warte(200);
    await page.click('#ue-ok'); await warte(200);
    pruefe(await page.$('#fenster') !== null, t + 'eigene Übung ohne Namen wird nicht übernommen');
    await page.fill('#ue-name', 'Treppe hinauf, Stufe für Stufe');
    await page.fill('#ue-schritte', 'Stellen Sie sich an das Geländer.\nSetzen Sie den Fuss ganz auf die Stufe.');
    await page.fill('#ue-menge', '5 Stufen');
    await page.click('#ue-oft button >> nth=2');
    await page.fill('#ue-hinweis', 'Nur mit Geländer.');
    await page.click('#ue-fotos button[data-foto^="web:"] >> nth=0');
    await page.click('#ue-ok'); await warte(300);
    pruefe(await page.$('#fenster') === null && await page.$$eval('[data-abschnitt] [data-aendere]', x => x.length) === 4, t + 'eigene Übung im Plan');
    /* zweiter Abschnitt, Standort */
    await page.click('[data-akt="abschnitt"]'); await warte(300);
    pruefe(await page.$$eval('[data-abschnitt]', x => x.length) === 2, t + 'Abschnitt hinzufügen');
    const aid2 = await page.getAttribute('[data-abschnitt] >> nth=1', 'data-abschnitt');
    await page.click('[data-ausbib="' + aid2 + '"]'); await warte(200);
    await page.click('#fenster [data-bibnimm="' + alle[5].g + '|' + alle[5].id + '"]'); await warte(300);
    await page.click('[data-standort="hemmingen"]'); await warte(400);
    let blatt = await page.textContent('#ub-huelle');
    pruefe(['Erika Muster', 'Sicher Treppen steigen', 'Langsam beginnen', 'Treppe hinauf, Stufe für Stufe', 'Setzen Sie den Fuss ganz auf die Stufe.', '5 Stufen · 3 Mal am Tag', 'Nur mit Geländer.', 'Ab Woche 3', alle[0].name, alle[5].name, 'Physio Rosenpark', 'Berliner Straße 16', '0511 234 46 67'].every(x => blatt.includes(x)), t + 'alle Eingaben und Standort Hemmingen auf dem Blatt');
    pruefe(blatt.includes(daten.hinweis), t + 'Hinweis aus der JSON-Datei auf dem Blatt');
    pruefe(await page.$('#ub-huelle .sr-b-zeichen') !== null, t + 'Zeichen im Kopf des Blatts');
    /* verschieben, entfernen mit Rückgängig */
    const namen = async () => page.$$eval('[data-abschnitt] >> nth=0', () => 0).catch(() => 0) && page.$$eval('#ub-huelle .ub-uebung h3', x => x.map(e => e.textContent));
    const vorher = await page.$$eval('#ub-huelle .ub-uebung h3', x => x.map(e => e.textContent.replace(/^\d+/, '')));
    await page.click('[data-runter] >> nth=0'); await warte(300);
    const nachher = await page.$$eval('#ub-huelle .ub-uebung h3', x => x.map(e => e.textContent.replace(/^\d+/, '')));
    pruefe(nachher[0] === vorher[1] && nachher[1] === vorher[0], t + 'Übung nach unten schieben');
    await page.click('[data-abschnitt] [data-weg] >> nth=0'); await warte(300);
    pruefe(await page.$$eval('#ub-huelle .ub-uebung', x => x.length) === 4, t + 'Übung entfernen');
    await page.click('.wo-quittung [data-zurueck] >> nth=-1'); await warte(300);
    pruefe(await page.$$eval('#ub-huelle .ub-uebung', x => x.length) === 5, t + 'Entfernen rückgängig');
    /* speichern, neu laden */
    await page.click('#l-sp'); await warte(300);
    pruefe((await page.textContent('#l-sp')).includes('Gespeichert'), t + 'Speichern meldet «Gespeichert»');
    const gesp = await page.evaluate(() => JSON.parse(localStorage.getItem('sroka-uebungsplaene') || '{}'));
    pruefe(Object.values(gesp.plaene || {}).some(p => p.patient === 'Erika Muster'), t + 'Plan liegt im Browser (localStorage)');
    await page.goto(BASIS + 'uebungsplan.html?von=uebersicht', { waitUntil: 'load' }); await bereit(page);
    pruefe((await page.textContent('#raum')).includes('Erika Muster'), t + 'Plan nach Neuladen in der Liste');
    await page.click('#raum [data-oeffne] >> nth=0'); await warte(400);
    pruefe(await page.inputValue('[data-f="patient"]') === 'Erika Muster' && await page.$$eval('#ub-huelle .ub-uebung', x => x.length) === 5, t + 'Plan öffnen');
    /* Druck */
    await page.evaluate(() => { window.__gedruckt = 0; window.print = () => { window.__gedruckt++; }; });
    await page.click('[data-akt="druck"]');
    pruefe(await page.evaluate(() => window.__gedruckt) === 1, t + '«Drucken oder als PDF sichern» ruft das Druckfenster');
    await warte(700);
    if (breite === 1440) {
      /* viele Übungen für mehrere Seiten */
      for (const u of alle.slice(6)) { await page.click('[data-ausbib="' + aid2 + '"]'); await warte(150); await page.click('#fenster [data-bibnimm="' + u.g + '|' + u.id + '"]'); await warte(250); }
      await warte(500);
      const ueberlauf = await blaetterSauber(page, '#ub-huelle');
      pruefe(ueberlauf.length >= 2 && ueberlauf.every(x => x <= 1), t + 'Blatt in ' + ueberlauf.length + ' Seiten gesetzt, keine Seite läuft über ' + JSON.stringify(ueberlauf));
      const pdf = path.join(AUS, 'uebungsplan.pdf');
      const r = await pdfVon(page, pdf);
      pruefe(r.seiten === ueberlauf.length && r.groessen.every(istA4), t + 'PDF in A4, gleich viele Seiten wie am Schirm (' + r.seiten + ')');
      pruefe(r.text.includes('Erika Muster') && r.text.includes('Seite 1 von'), t + 'PDF enthält Name und Seitenzahlen');
      pdfBilder(pdf, path.join(AUS, 'uebungsplan-pdf'));
    }
    /* Kopie und Löschen */
    await page.click('#l-sp').catch(() => {}); await warte(200);
    await rk(page, '#rand [data-gehe="start"]'); await warte(300);
    const zahl = async () => page.$$eval('#ub-plaene [data-loesche]', x => x.length);
    const z0 = await zahl();
    await page.click('#ub-plaene [data-kopiere] >> nth=0'); await warte(300);
    await page.click('#l-sp'); await warte(300);
    await rk(page, '#rand [data-gehe="start"]'); await warte(300);
    pruefe(await zahl() === z0 + 1, t + 'Kopie anlegen und speichern');
    await page.click('#ub-plaene [data-loesche] >> nth=0'); await warte(300);
    pruefe(await zahl() === z0, t + 'Plan löschen');
    pruefe(meldungen.length === 0, t + 'keine Konsolenfehler beim Bedienen ' + JSON.stringify(meldungen.slice(0, 4)));
    await page.screenshot({ path: path.join(AUS, 'bedient-uebungsplan-' + breite + '.png'), fullPage: true });
    await ctx.close();
  }

  /* 4. Rechnung */
  for (const breite of [1440, 390]) {
    const { ctx, page, meldungen } = await neueSeite(browser, breite);
    const t = 'Rechnung @' + breite + ': ';
    await page.goto(BASIS + 'rechnung.html?von=uebersicht', { waitUntil: 'load' }); await bereit(page);
    pruefe(await page.inputValue('[data-p="preis"]') === '', t + 'kein Preis vorbelegt');
    pruefe((await page.textContent('#re-huelle')).includes('Umsatzsteuerfrei nach § 4 Nr. 14 UStG'), t + 'Satz zur Umsatzsteuer auf dem Blatt');
    pruefe(/^\d\d\.\d\d\.\d{4}$/.test(await page.inputValue('[data-feld="datum"]')), t + 'Rechnungsdatum vorbelegt mit heute');
    await page.click('[data-standort="hemmingen"]'); await warte(200);
    pruefe((await page.textContent('#re-huelle')).includes('Berliner Straße 16'), t + 'Standort Hemmingen auf dem Blatt');
    await page.click('[data-standort="hannover"]'); await warte(200);
    pruefe((await page.textContent('#re-huelle')).includes('Dieterichsstraße 25'), t + 'Standort Hannover auf dem Blatt');
    await page.fill('[data-feld="patient"]', 'Max Beispiel');
    await page.fill('[data-feld="anschrift"]', 'Lindenweg 3\n30159 Hannover');
    await page.fill('[data-feld="nummer"]', '2026-017');
    await page.fill('.re-pos >> nth=0 >> [data-p="datum"]', '03.11.2026');
    await page.fill('.re-pos >> nth=0 >> [data-p="leistung"]', 'Krankengymnastik');
    await page.fill('.re-pos >> nth=0 >> [data-p="anzahl"]', '2');
    await page.fill('.re-pos >> nth=0 >> [data-p="preis"]', '30,25');
    await page.click('[data-akt="hinzu"]');
    pruefe(await page.$$eval('.re-pos', x => x.length) === 2, t + 'Leistung hinzufügen');
    await page.fill('.re-pos >> nth=1 >> [data-p="leistung"]', 'Hausbesuch');
    await page.fill('.re-pos >> nth=1 >> [data-p="preis"]', '1.000,10');
    await page.click('[data-akt="hinzu"]');
    await page.fill('.re-pos >> nth=2 >> [data-p="preis"]', '99');
    const summe = async () => (await page.textContent('#re-summe')).replace(/\s/g, ' ');
    pruefe(/1\.159,60 €/.test(await summe()), t + 'Summe 2 × 30,25 + 1.000,10 + 99 = 1.159,60 € (' + await summe() + ')');
    await page.click('.re-pos >> nth=2 >> [data-weg]');
    pruefe(await page.$$eval('.re-pos', x => x.length) === 2 && /1\.060,60 €/.test(await summe()), t + 'Leistung entfernen, Summe 1.060,60 €');
    await warte(200);
    const blatt = await page.textContent('#re-huelle');
    pruefe(['Max Beispiel', 'Lindenweg 3', '2026-017', '03.11.2026', 'Krankengymnastik', 'Hausbesuch', '60,50', '1.060,60'].every(x => blatt.includes(x)), t + 'Eingaben und Summe auf dem Blatt');
    /* Angaben der Praxis */
    await rk(page, '#rand [data-gehe="angaben"]'); await warte(300);
    pruefe(await page.inputValue('[data-feld="steuernummer"]') === '' && await page.inputValue('[data-feld="bank"]') === '', t + 'Steuernummer und Bank leer zum Ausfüllen');
    await page.fill('[data-feld="steuernummer"]', '25/123/45678');
    await rk(page, '#rand [data-gehe="rechnung"]'); await warte(300);
    pruefe((await page.textContent('#re-huelle')).includes('25/123/45678'), t + 'Steuernummer auf dem Blatt');
    await page.click('#l-sp'); await warte(300);
    pruefe((await page.textContent('#l-sp')).includes('Gespeichert'), t + 'Speichern meldet «Gespeichert»');
    await page.goto(BASIS + 'rechnung.html?von=uebersicht', { waitUntil: 'load' }); await bereit(page);
    pruefe(await page.inputValue('[data-feld="patient"]') === 'Max Beispiel' && await page.$$eval('.re-pos', x => x.length) === 2, t + 'merkt sich die Eingaben nach Neuladen');
    pruefe(((await page.evaluate(() => localStorage.getItem('sroka-werkzeuge-rechnung'))) || '').includes('25/123/45678'), t + 'Speicher nur im Browser (localStorage)');
    await page.evaluate(() => { window.__gedruckt = 0; window.print = () => { window.__gedruckt++; }; });
    await page.click('[data-akt="druck"]');
    pruefe(await page.evaluate(() => window.__gedruckt) === 1, t + '«Drucken oder als PDF sichern» ruft das Druckfenster');
    await warte(700);
    if (breite === 1440) {
      for (let i = 0; i < 24; i++) await page.click('[data-akt="hinzu"]');
      await page.evaluate(() => document.querySelectorAll('[data-p="preis"]').forEach(f => { if (!f.value) { f.value = '45,50'; f.dispatchEvent(new Event('input', { bubbles: true })); } }));
      await warte(500);
      const ueberlauf = await blaetterSauber(page, '#re-huelle');
      pruefe(ueberlauf.length >= 2 && ueberlauf.every(x => x <= 1), t + '26 Leistungen auf ' + ueberlauf.length + ' Seiten, keine Seite läuft über ' + JSON.stringify(ueberlauf));
      const pdf = path.join(AUS, 'rechnung.pdf');
      const r = await pdfVon(page, pdf);
      pruefe(r.seiten === ueberlauf.length && r.groessen.every(istA4), t + 'PDF in A4, gleich viele Seiten wie am Schirm (' + r.seiten + ')');
      pruefe(r.text.includes('Umsatzsteuerfrei nach § 4 Nr. 14 UStG'), t + 'PDF mit Satz zur Umsatzsteuer');
      pdfBilder(pdf, path.join(AUS, 'rechnung-pdf'));
    }
    await page.click('#l-neu'); await warte(300);
    pruefe(await page.inputValue('[data-feld="patient"]') === '' && await page.$$eval('.re-pos', x => x.length) === 1, t + '«Neue Rechnung» leert Patient und Leistungen');
    await rk(page, '#rand [data-gehe="angaben"]'); await warte(300);
    pruefe(await page.inputValue('[data-feld="steuernummer"]') === '25/123/45678', t + '«Neue Rechnung» behält die Steuernummer');
    pruefe(meldungen.length === 0, t + 'keine Konsolenfehler beim Bedienen ' + JSON.stringify(meldungen.slice(0, 4)));
    await page.screenshot({ path: path.join(AUS, 'bedient-rechnung-' + breite + '.png'), fullPage: true });
    await ctx.close();
  }
  /* gesperrter Speicher (privates Fenster) */
  for (const datei of ['rechnung.html', 'uebungsplan.html', 'index.html', 'profiltexte.html']) {
    const { ctx, page, meldungen } = await neueSeite(browser, 1440);
    await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('gesperrt'); } }); });
    await page.goto(BASIS + datei + '?von=uebersicht', { waitUntil: 'load' });
    let gestartet = true; try { await bereit(page); } catch (e) { gestartet = false; }
    pruefe(gestartet && meldungen.length === 0, datei + ': startet bei gesperrtem Speicher ohne Fehler ' + JSON.stringify(meldungen.slice(0, 3)));
    if (datei === 'rechnung.html') {
      await page.fill('.re-pos >> nth=0 >> [data-p="preis"]', '12');
      await page.click('#l-sp'); await warte(300);
      pruefe(/12,00/.test(await page.textContent('#re-summe')) && /Nicht gespeichert|nicht/i.test(await page.textContent('#meldung')), 'Rechnung: rechnet bei gesperrtem Speicher und sagt, dass nichts gespeichert ist');
    }
    await ctx.close();
  }

  /* 5. Profiltexte */
  {
    const { ctx, page, meldungen } = await neueSeite(browser, 1440, browser === global.__chromium ? { permissions: ['clipboard-read', 'clipboard-write'] } : {});
    await page.goto(BASIS + 'profiltexte.html?von=uebersicht', { waitUntil: 'load' }); await bereit(page);
    const werbung = /(beste[nr]?\b|einzigartig|garantiert|Heilung|heilt|schmerzfrei|\bTop\b|Experte|Nummer 1|!)/;
    let karten = 0, kopiert = 0, grenzenOk = 0, wegOk = 0, n = 0;
    const alleTexte = [];
    for (const b of ['hannover', 'hemmingen', 'jameda']) {
      await rk(page, '#rand [data-gehe="' + b + '"]'); await warte(300);
      const ks = await page.$$('.pt-text');
      karten += ks.length;
      for (const k of ks) {
        n++;
        const wort = await k.$eval('.pt-wortlaut', e => e.textContent);
        alleTexte.push(wort);
        const zaehler = await k.$eval('.pt-zaehler', e => ({ t: e.textContent, zu: e.classList.contains('pt-zaehler--zu') }));
        if (!zaehler.zu) grenzenOk++;
        const wohin = await k.$eval('.pt-wohin', e => ({ feld: (e.querySelector('.pt-feld') || {}).textContent || '', weg: e.querySelectorAll('.pt-weg li').length, links: e.querySelectorAll('.pt-links-kn a').length, quelle: e.querySelectorAll('.pt-quelle a').length, skizze: !!e.closest('.pt-text').querySelector('.pt-sk') }));
        if (wohin.feld && wohin.weg >= 1 && wohin.links >= 1 && wohin.quelle >= 1 && wohin.skizze) wegOk++;
        if (browser === global.__chromium) {
          await (await k.$('[data-kopiere]')).click(); await warte(150);
          const zw = await page.evaluate(() => navigator.clipboard.readText());
          if (zw === wort) kopiert++;
        }
      }
      await grundpruefung(page, 'Profiltexte · ' + b + ' (nach Kopieren)', 1440);
    }
    pruefe(karten === 11, 'Profiltexte: elf Texte (' + karten + ')');
    if (browser === global.__chromium) pruefe(kopiert === karten, 'Profiltexte: jeder Knopf kopiert genau den angezeigten Wortlaut (' + kopiert + ' von ' + karten + ')');
    pruefe(grenzenOk === karten, 'Profiltexte: jeder Text in seiner Zeichengrenze (' + grenzenOk + ' von ' + karten + ')');
    pruefe(wegOk === karten, 'Profiltexte: zu jedem Text Feld, Weg, Link, Quelle und Skizze (' + wegOk + ' von ' + karten + ')');
    const g = alleTexte.filter(x => x.length > 300);
    pruefe(!werbung.test(alleTexte.join('\n')), 'Profiltexte: keine Werbesprache und keine Heilversprechen ' + ((werbung.exec(alleTexte.join('\n')) || [])[0] || ''));
    const fakten = alleTexte.join('\n');
    pruefe(!/gesetzlich versichert(e|en)? (sind )?willkommen|Kassenpatient/i.test(fakten), 'Profiltexte: keine Aussage, die gesetzlich Versicherte einlädt');
    await rk(page, '#rand [data-gehe="selbst"]'); await warte(300);
    const selbst = await page.textContent('#raum');
    pruefe(/beanspruch|bestätig/i.test(selbst) && /Foto/.test(selbst) && /Bewertung/.test(selbst), 'Profiltexte: was Sylvia selbst tut (Profil, Fotos, Bewertungskarte)');
    const extern = await page.$$eval('#raum a[href^="http"]', as => as.filter(a => a.target !== '_blank').length);
    pruefe(extern === 0, 'Profiltexte: fremde Seiten öffnen in neuem Reiter');
    pruefe(meldungen.length === 0, 'Profiltexte: keine Konsolenfehler beim Bedienen ' + JSON.stringify(meldungen.slice(0, 4)));
    await ctx.close();
  }

  /* 6. Öffnen per Doppelklick (file://) */
  for (const s of ['index.html', 'uebungsplan.html', 'rechnung.html', 'profiltexte.html']) {
    const { ctx, page, meldungen } = await neueSeite(browser, 1440);
    await page.goto('file://' + path.join(STAMM, 'werkzeuge', s), { waitUntil: 'load' });
    let gestartet = true; try { await bereit(page); } catch (e) { gestartet = false; }
    const echte = meldungen.filter(m => !/uebungen\.json|Fetch API cannot load|CORS|file:\/\/.*net::ERR/i.test(m));
    pruefe(gestartet && echte.length === 0, 'file://: ' + s + ' startet ohne Fehler ' + JSON.stringify(echte.slice(0, 3)));
    if (s === 'uebungsplan.html' && gestartet) pruefe((await page.textContent('#raum')).includes('Übungen'), 'file://: Übungsplan hat die Bibliothek (Ersatzdaten)');
    await ctx.close();
  }
}

async function main() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: STAMM, stdio: 'ignore' });
  await warte(800);
  try {
    const c = await chromium.launch(); global.__chromium = c;
    try { await lauf(c, 'Chromium'); } finally { await c.close(); }
    if (process.env.PRUEF_WEBKIT) {
      let w = null; try { w = await webkit.launch(); } catch (e) { console.log('WebKit nicht verfügbar: ' + e.message.split('\n')[0]); }
      if (w) try { await lauf(w, 'WebKit'); } finally { await w.close(); }
    }
    /* Gleichstand der Daten-Kopie (für file://) */
    const json = JSON.parse(fs.readFileSync(path.join(STAMM, 'daten/uebungen.json'), 'utf8'));
    const js = fs.readFileSync(path.join(STAMM, 'werkzeuge/uebungen-daten.js'), 'utf8');
    const m = /=\s*([\s\S]*?);?\s*$/.exec(js);
    let kopie = null; try { kopie = JSON.parse(m[1]); } catch (e) { /* */ }
    pruefe(kopie && JSON.stringify(kopie) === JSON.stringify(json), 'uebungen-daten.js entspricht daten/uebungen.json');
  } finally {
    server.kill();
  }
  console.log('\n' + ok + ' bestanden, ' + fehl + ' fehlgeschlagen. Bilder und PDFs: ' + AUS);
  if (fehl) { console.log('Fehlgeschlagen:\n- ' + fehler.join('\n- ')); process.exit(1); }
}

main().catch(e => { console.error(e); process.exit(2); });
