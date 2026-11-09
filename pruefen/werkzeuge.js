/* Prüfung der Praxis-Werkzeuge mit Playwright (Chromium).
   Aufruf im Stamm:  node pruefen/werkzeuge.js [ausgabeordner]
   Startet selbst einen kleinen Server (python3 -m http.server), legt Bilder und PDFs im Ausgabeordner ab
   und meldet jede Einzelprüfung. Endet mit Code 1, wenn etwas fehlschlägt. */
'use strict';
const { chromium } = require('playwright');
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

const SEITEN = ['index.html', 'uebungsplan.html', 'rechnung.html', 'drucksachen.html', 'profiltexte.html'];

function warte(ms) { return new Promise(r => setTimeout(r, ms)); }

async function neueSeite(browser, breite, extra) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: breite, height: 900 }, deviceScaleFactor: 1 }, extra || {}));
  const page = await ctx.newPage();
  const meldungen = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') meldungen.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => meldungen.push('pageerror: ' + e.message));
  page.on('requestfailed', r => meldungen.push('requestfailed: ' + r.url()));
  page.on('response', r => { if (r.status() >= 400) meldungen.push('http ' + r.status() + ': ' + r.url()); });
  return { ctx, page, meldungen };
}

async function grundpruefung(page, name, breite) {
  const b = await page.evaluate(() => {
    const doc = document.documentElement;
    const ueber = doc.scrollWidth - doc.clientWidth;
    const zuBreit = [];
    document.querySelectorAll('body *').forEach(el => {
      if (el.closest('#w-druckbereich')) return;
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > doc.clientWidth + 1 || r.left < -1)) {
        /* Blätter in verkleinerten Hüllen zählen nicht, solange die Hülle selbst passt */
        if (!el.closest('[data-massstab]')) zuBreit.push(el.tagName.toLowerCase() + '.' + el.className);
      }
    });
    const fett = [], kursiv = [], ueberschrift = [];
    document.querySelectorAll('body *').forEach(el => {
      if (!el.childNodes.length) return;
      const hatText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
      if (!hatText) return;
      const cs = getComputedStyle(el);
      if (+cs.fontWeight >= 600) fett.push(el.tagName + '.' + el.className + ' ' + cs.fontWeight);
      if (cs.fontStyle !== 'normal') kursiv.push(el.tagName + '.' + el.className);
    });
    document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
      const cs = getComputedStyle(h);
      if (!/Cormorant Garamond/.test(cs.fontFamily) || cs.fontWeight !== '500') ueberschrift.push(h.tagName + ' ' + h.textContent.trim().slice(0, 30) + ' ' + cs.fontFamily + ' ' + cs.fontWeight);
    });
    const textSchrift = getComputedStyle(document.body).fontFamily;
    const zeichenLeer = Array.from(document.querySelectorAll('[data-zeichen]')).filter(e => !e.querySelector('svg')).length;
    const zeichenZahl = document.querySelectorAll('[data-zeichen] svg').length;
    const knoepfeOhneKnauf = Array.from(document.querySelectorAll('.knopf')).filter(k => !k.querySelector('.knauf')).length;
    const auswahl = document.querySelectorAll('select, input[type=date], input[type=datetime-local], input[type=month], input[type=week], input[type=time], datalist').length;
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(document.body.innerText);
    const schriftenGeladen = document.fonts.check('500 20px "Cormorant Garamond"') && document.fonts.check('400 16px Manrope');
    return { ueber, zuBreit: zuBreit.slice(0, 5), fett, kursiv, ueberschrift, textSchrift, zeichenLeer, zeichenZahl, knoepfeOhneKnauf, auswahl, emoji, schriftenGeladen };
  });
  const t = name + ' @' + breite + ': ';
  pruefe(b.ueber <= 0, t + 'kein waagrechter Überlauf (' + b.ueber + ' px)');
  pruefe(b.zuBreit.length === 0, t + 'kein Element ragt aus dem Schirm ' + JSON.stringify(b.zuBreit));
  pruefe(b.fett.length === 0, t + 'nichts fett ' + JSON.stringify(b.fett.slice(0, 3)));
  pruefe(b.kursiv.length === 0, t + 'nichts kursiv ' + JSON.stringify(b.kursiv.slice(0, 3)));
  pruefe(b.ueberschrift.length === 0, t + 'Überschriften Cormorant Garamond 500 ' + JSON.stringify(b.ueberschrift.slice(0, 3)));
  pruefe(/^Manrope/.test(b.textSchrift), t + 'Text in Manrope');
  pruefe(b.schriftenGeladen, t + 'Schriften lokal geladen');
  pruefe(b.zeichenLeer === 0 && b.zeichenZahl > 0, t + 'Zeichen überall eingesetzt (' + b.zeichenZahl + ')');
  pruefe(b.knoepfeOhneKnauf === 0, t + 'jeder Knopf hat den Pfeil-Knauf');
  pruefe(b.auswahl === 0, t + 'kein select und kein Datumsfeld');
  pruefe(!b.emoji, t + 'keine Emojis');
}

async function pdfVon(page, datei) {
  await page.emulateMedia({ media: 'print' });
  const puffer = await page.pdf({ path: datei, preferCSSPageSize: true, printBackground: true });
  await page.emulateMedia({ media: 'screen' });
  const info = execFileSync('pdfinfo', ['-f', '1', '-l', '99', datei]).toString();
  const seiten = +(/Pages:\s+(\d+)/.exec(info) || [0, 0])[1];
  const groessen = [];
  info.replace(/Page\s+\d+ size:\s+([\d.]+) x ([\d.]+) pts/g, (_, w, h) => { groessen.push([+(w * 25.4 / 72).toFixed(1), +(h * 25.4 / 72).toFixed(1)]); });
  return { seiten, groessen, puffer };
}

function pdfBilder(datei, praefix) {
  execFileSync('pdftoppm', ['-r', '110', '-png', datei, praefix]);
}

async function main() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: STAMM, stdio: 'ignore' });
  await warte(800);
  const browser = await chromium.launch();
  try {
    /* 1. Jede Seite bei 1440 und 390 */
    for (const breite of [1440, 390]) {
      for (const s of SEITEN) {
        const { ctx, page, meldungen } = await neueSeite(browser, breite);
        await page.goto(BASIS + s, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await warte(200);
        await grundpruefung(page, s, breite);
        await page.screenshot({ path: path.join(AUS, 'seite-' + s.replace('.html', '') + '-' + breite + '.png'), fullPage: true });
        pruefe(meldungen.length === 0, s + ' @' + breite + ': keine Konsolenfehler, Warnungen oder fehlgeschlagenen Anfragen ' + JSON.stringify(meldungen));
        await ctx.close();
      }
    }

    /* 2. Übersicht: Tafeln und Wege */
    {
      const { ctx, page } = await neueSeite(browser, 1440);
      await page.goto(BASIS + 'index.html');
      const tafeln = await page.$$eval('.w-tafel', ts => ts.map(t => ({ h: t.querySelector('h2').textContent, p: t.querySelectorAll('p').length, k: t.querySelector('a.knopf').textContent.trim(), href: t.querySelector('a.knopf').getAttribute('href') })));
      pruefe(tafeln.length === 4, 'Übersicht: vier Tafeln');
      pruefe(tafeln.every(t => t.k === 'Öffnen' && t.p === 1), 'Übersicht: je Name, ein Satz, Knopf «Öffnen»');
      pruefe(await page.$('a[href="../index.html"]') !== null, 'Übersicht: Rückweg zur Website');
      pruefe(await page.$('.w-tafel img') === null, 'Übersicht: keine Bildschirmfotos');
      for (const t of tafeln) {
        const r = await page.request.get(BASIS + t.href);
        pruefe(r.ok(), 'Übersicht: Ziel ' + t.href + ' erreichbar');
      }
      await page.click('.w-tafel a.knopf >> nth=0');
      await page.waitForLoadState();
      pruefe(page.url().endsWith('uebungsplan.html'), 'Übersicht: «Öffnen» führt zum Übungsplan');
      await page.goto(BASIS + 'index.html');
      await page.click('.w-wege a[href="../index.html"]');
      await page.waitForLoadState();
      pruefe(/\/index\.html$/.test(page.url()) && !page.url().includes('/werkzeuge/'), 'Übersicht: «Zur Website» führt zur Website');
      await ctx.close();
    }

    /* 3. Übungsplan */
    for (const breite of [1440, 390]) {
      const { ctx, page, meldungen } = await neueSeite(browser, breite);
      await page.goto(BASIS + 'uebungsplan.html', { waitUntil: 'networkidle' });
      const daten = JSON.parse(fs.readFileSync(path.join(STAMM, 'daten/uebungen.json'), 'utf8'));
      const alle = daten.gruppen.reduce((a, g) => a.concat(g.uebungen), []);
      pruefe(await page.$$eval('.w-uebung', x => x.length) === alle.length, 'Übungsplan @' + breite + ': alle ' + alle.length + ' Übungen aus der JSON-Datei');
      pruefe(await page.$$eval('details.w-gruppe', x => x.length) === daten.gruppen.length, 'Übungsplan @' + breite + ': je Gruppe eine Klappkarte');
      const datum = await page.inputValue('#datum');
      pruefe(/^\d\d\.\d\d\.\d{4}$/.test(datum), 'Übungsplan @' + breite + ': Datum vorbelegt mit heute (' + datum + ')');
      await page.fill('#datum', '');
      await page.click('#heute');
      pruefe(await page.inputValue('#datum') === datum, 'Übungsplan @' + breite + ': Knopf «Heute»');
      await page.fill('#name', 'Erika Muster');
      await page.fill('#notiz', 'Langsam beginnen und auf die Atmung achten.');
      /* alle Gruppen aufklappen und alle Übungen wählen */
      const gruppen = await page.$$('details.w-gruppe');
      for (let i = 0; i < gruppen.length; i++) {
        const offen = await gruppen[i].evaluate(d => d.open);
        if (!offen) await gruppen[i].$eval('summary', s => s.click());
      }
      for (const u of alle) await page.click('[data-uebung="' + u.id + '"] .w-uebung');
      pruefe(await page.$$eval('#blatt .w-plan-uebung', x => x.length) === alle.length, 'Übungsplan @' + breite + ': alle Übungen auf dem Blatt');
      pruefe((await page.$$eval('.w-zahl-gewaehlt', x => x.map(e => e.textContent))).every(t => t === '3 Übungen gewählt'), 'Übungsplan @' + breite + ': Zähler je Gruppe');
      /* abwählen */
      await page.click('[data-uebung="' + alle[0].id + '"] .w-uebung');
      pruefe(await page.$$eval('#blatt .w-plan-uebung', x => x.length) === alle.length - 1, 'Übungsplan @' + breite + ': Abwählen nimmt die Übung vom Blatt');
      /* Menge ändern */
      await page.fill('[data-menge="' + alle[1].id + '"]', '15 Mal, morgens und abends');
      const blattText = await page.textContent('#blatt');
      pruefe(blattText.includes('15 Mal, morgens und abends'), 'Übungsplan @' + breite + ': geänderte Menge auf dem Blatt');
      pruefe(blattText.includes('Für Erika Muster') && blattText.includes(datum) && blattText.includes('Langsam beginnen'), 'Übungsplan @' + breite + ': Name, Datum, Hinweis auf dem Blatt');
      pruefe(blattText.includes(daten.hinweis), 'Übungsplan @' + breite + ': Hinweis aus der JSON-Datei auf dem Blatt');
      pruefe(alle[1].schritte.every(s => blattText.includes(s)), 'Übungsplan @' + breite + ': Schritte auf dem Blatt');
      pruefe(blattText.includes('Dieterichsstraße 25') && blattText.includes('0511 260 74 14') && await page.$('#blatt .w-briefkopf [data-zeichen] svg') !== null, 'Übungsplan @' + breite + ': Kopf mit Zeichen und Praxisdaten');
      await page.click('[data-standort="hemmingen"]');
      const kopf = await page.textContent('#blatt .w-bk-ort.haupt');
      pruefe(kopf.includes('Physio Rosenpark') && (await page.textContent('#blatt .w-plan-fuss')).includes('0511 234 46 67'), 'Übungsplan @' + breite + ': Standort Hemmingen im Kopf und Fuß');
      /* Drucken-Knopf ruft window.print */
      await page.evaluate(() => { window.__gedruckt = 0; window.print = () => { window.__gedruckt++; }; });
      await page.click('#drucken');
      pruefe(await page.evaluate(() => window.__gedruckt) === 1 && await page.$('#w-druckbereich .w-blatt') !== null, 'Übungsplan @' + breite + ': «Drucken oder als PDF sichern» ruft das Druckfenster');
      if (breite === 1440) {
        const pdf = path.join(AUS, 'uebungsplan.pdf');
        const r = await pdfVon(page, pdf);
        pruefe(r.groessen.every(g => Math.abs(g[0] - 210) < 1 && Math.abs(g[1] - 297) < 1), 'Übungsplan: PDF in A4 (' + r.seiten + ' Seiten)');
        pdfBilder(pdf, path.join(AUS, 'uebungsplan-pdf'));
        pruefe(r.seiten >= 2, 'Übungsplan: 11 Übungen ergeben mehrere Seiten (Seitenumbrüche in den Bildern ansehen)');
        /* Strg+P ohne Knopf */
        await page.evaluate(() => window.W.druckAufraeumen());
        await page.emulateMedia({ media: 'print' });
        await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
        pruefe(await page.$('#w-druckbereich .w-blatt') !== null, 'Übungsplan: Strg+P (beforeprint) bereitet das Blatt vor');
        await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
        await page.emulateMedia({ media: 'screen' });
        pruefe(await page.$('#w-druckbereich') === null, 'Übungsplan: afterprint räumt auf');
      }
      await page.click('#leeren');
      pruefe(await page.$$eval('#blatt .w-plan-uebung', x => x.length) === 0 && await page.inputValue('#name') === '', 'Übungsplan @' + breite + ': «Neu beginnen» leert');
      pruefe(meldungen.length === 0, 'Übungsplan @' + breite + ': keine Konsolenfehler beim Bedienen ' + JSON.stringify(meldungen));
      await page.screenshot({ path: path.join(AUS, 'bedient-uebungsplan-' + breite + '.png'), fullPage: true });
      await ctx.close();
    }

    /* 4. Rechnung */
    for (const breite of [1440, 390]) {
      const { ctx, page, meldungen } = await neueSeite(browser, breite);
      await page.goto(BASIS + 'rechnung.html', { waitUntil: 'networkidle' });
      const t = 'Rechnung @' + breite + ': ';
      pruefe(await page.inputValue('[data-p="preis"]') === '', t + 'kein Preis vorbelegt');
      pruefe((await page.textContent('#blatt')).includes('Umsatzsteuerfrei nach § 4 Nr. 14 UStG'), t + 'Satz zur Umsatzsteuer');
      pruefe(await page.inputValue('#steuernummer') === '' && await page.inputValue('#bank') === '' && await page.$$eval('#blatt .w-r-luecke', x => x.length) === 3, t + 'Steuernummer und Bank leer, auf dem Blatt Linien');
      await page.click('[data-standort="hemmingen"]');
      pruefe((await page.textContent('#blatt .w-bk-ort.haupt')).includes('Physio Rosenpark') && (await page.textContent('#blatt .w-r-absender')).includes('Berliner Straße 16'), t + 'Standort Hemmingen');
      await page.click('[data-standort="hannover"]');
      pruefe((await page.textContent('#blatt .w-r-absender')).includes('Dieterichsstraße 25'), t + 'Standort Hannover');
      await page.fill('#patient', 'Max Beispiel');
      await page.fill('#anschrift', 'Lindenweg 3\n30159 Hannover');
      await page.fill('#nummer', '2026-017');
      await page.fill('#zusatz', 'Verordnung vom 01.11.2026');
      await page.fill('[data-p="datum"]', '03.11.2026');
      await page.fill('[data-p="leistung"]', 'Krankengymnastik');
      await page.fill('[data-p="anzahl"]', '2');
      await page.fill('[data-p="preis"]', '30,25');
      await page.click('#hinzu');
      pruefe(await page.$$eval('.w-position', x => x.length) === 2, t + 'Leistung hinzufügen');
      await page.fill('.w-position >> nth=1 >> [data-p="leistung"]', 'Hausbesuch');
      await page.fill('.w-position >> nth=1 >> [data-p="preis"]', '1.000,10');
      await page.click('#hinzu');
      await page.fill('.w-position >> nth=2 >> [data-p="preis"]', '99');
      pruefe(await page.textContent('#summe') === '1.159,60 €', t + 'Summe 2 × 30,25 + 1.000,10 + 99 = 1.159,60 € (' + await page.textContent('#summe') + ')');
      await page.click('.w-position >> nth=2 >> [data-weg]');
      pruefe(await page.$$eval('.w-position', x => x.length) === 2 && await page.textContent('#summe') === '1.060,60 €', t + 'Leistung entfernen, Summe 1.060,60 €');
      pruefe((await page.textContent('#blatt .w-r-summe')) === '1.060,60 €', t + 'Summe auf dem Blatt');
      const blatt = await page.textContent('#blatt');
      pruefe(['Max Beispiel', 'Lindenweg 3', '2026-017', 'Verordnung vom 01.11.2026', '03.11.2026', 'Krankengymnastik', '60,50'].every(x => blatt.includes(x)), t + 'Eingaben auf dem Blatt');
      await page.fill('#steuernummer', '25/123/45678');
      await page.reload({ waitUntil: 'networkidle' });
      pruefe(await page.inputValue('#patient') === 'Max Beispiel' && await page.$$eval('.w-position', x => x.length) === 2 && await page.inputValue('#steuernummer') === '25/123/45678', t + 'merkt sich die Eingaben nach Neuladen');
      const gespeichert = await page.evaluate(() => localStorage.getItem('sroka-werkzeuge-rechnung'));
      pruefe(!!gespeichert && gespeichert.includes('Max Beispiel'), t + 'Speicher nur im Browser (localStorage)');
      await page.evaluate(() => { window.__gedruckt = 0; window.print = () => { window.__gedruckt++; }; });
      await page.click('#drucken');
      pruefe(await page.evaluate(() => window.__gedruckt) === 1, t + '«Drucken oder als PDF sichern» ruft das Druckfenster');
      if (breite === 1440) {
        /* viele Positionen für den Seitenumbruch */
        await page.evaluate(() => window.W.druckAufraeumen());
        for (let i = 0; i < 13; i++) await page.click('#hinzu');
        await page.evaluate(() => document.querySelectorAll('[data-p="preis"]').forEach((f, i) => { if (!f.value) { f.value = '45,50'; f.dispatchEvent(new Event('input', { bubbles: true })); } }));
        await page.evaluate(() => window.W.druckVorbereiten(document.getElementById('blatt'), 'A4', '14mm 16mm 14mm'));
        const pdf = path.join(AUS, 'rechnung.pdf');
        const r = await pdfVon(page, pdf);
        pruefe(r.groessen.every(g => Math.abs(g[0] - 210) < 1 && Math.abs(g[1] - 297) < 1), t + 'PDF in A4 (' + r.seiten + ' Seiten)');
        pdfBilder(pdf, path.join(AUS, 'rechnung-pdf'));
        await page.evaluate(() => window.W.druckAufraeumen());
        await page.click('[data-weg] >> nth=-1');
      }
      await page.click('#neu');
      pruefe(await page.inputValue('#patient') === '' && await page.$$eval('.w-position', x => x.length) === 1 && await page.inputValue('#steuernummer') === '25/123/45678', t + '«Neue Rechnung» leert Patient und Leistungen, behält Steuernummer');
      pruefe(meldungen.length === 0, t + 'keine Konsolenfehler beim Bedienen ' + JSON.stringify(meldungen));
      await page.screenshot({ path: path.join(AUS, 'bedient-rechnung-' + breite + '.png'), fullPage: true });
      await ctx.close();
    }
    /* Rechnung mit gesperrtem Speicher */
    {
      const { ctx, page, meldungen } = await neueSeite(browser, 1440);
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', { get() { throw new Error('gesperrt'); } });
      });
      await page.goto(BASIS + 'rechnung.html', { waitUntil: 'networkidle' });
      await page.fill('[data-p="preis"]', '12');
      pruefe(await page.textContent('#summe') === '12,00 €' && (await page.textContent('#gemerkt')).includes('kein Merken'), 'Rechnung: läuft bei gesperrtem Speicher und sagt es');
      pruefe(meldungen.filter(m => !/gesperrt/.test(m)).length === 0, 'Rechnung: keine Fehler bei gesperrtem Speicher ' + JSON.stringify(meldungen));
      await ctx.close();
    }

    /* 5. Drucksachen */
    {
      const { ctx, page, meldungen } = await neueSeite(browser, 1440, { permissions: ['clipboard-read', 'clipboard-write'] });
      await page.goto(BASIS + 'drucksachen.html', { waitUntil: 'networkidle' });
      const masse = await page.evaluate(() => {
        const mm = px => +(px * 25.4 / 96).toFixed(1);
        const o = {};
        document.querySelectorAll('[data-blatt]').forEach(b => { const r = b.getBoundingClientRect(); (o[b.getAttribute('data-blatt')] = o[b.getAttribute('data-blatt')] || []).push([mm(r.width), mm(r.height)]); });
        return o;
      });
      const soll = { visitenkarte: [85, 55], terminkarte: [85, 55], briefpapier: [210, 297], 'bewertung-hannover': [105, 148], 'bewertung-hemmingen': [105, 148] };
      for (const n in soll) {
        pruefe((masse[n] || []).length > 0 && masse[n].every(m => Math.abs(m[0] - soll[n][0]) < 0.6 && Math.abs(m[1] - soll[n][1]) < 0.6), 'Drucksachen: ' + n + ' in echter Größe am Schirm ' + JSON.stringify(masse[n]));
      }
      await page.evaluate(() => { window.__gedruckt = 0; window.print = () => { window.__gedruckt++; }; });
      for (const n in soll) {
        await page.click('[data-drucke="' + n + '"]');
        const anzahl = await page.$$eval('#w-druckbereich > *', x => x.length);
        const pdf = path.join(AUS, 'drucksache-' + n + '.pdf');
        const r = await pdfVon(page, pdf);
        const seitenSoll = (n === 'visitenkarte' || n === 'terminkarte') ? 2 : 1;
        pruefe(r.seiten === seitenSoll && r.groessen.every(g => Math.abs(g[0] - soll[n][0]) < 0.6 && Math.abs(g[1] - soll[n][1]) < 0.6), 'Drucksachen: PDF ' + n + ' ' + r.seiten + ' Seite(n) ' + JSON.stringify(r.groessen) + ', Blätter im Druck ' + anzahl);
        pdfBilder(pdf, path.join(AUS, 'drucksache-' + n));
        await page.evaluate(() => window.W.druckAufraeumen());
      }
      pruefe(await page.evaluate(() => window.__gedruckt) === 5, 'Drucksachen: alle fünf Drucken-Knöpfe rufen das Druckfenster');
      /* Signatur */
      await page.click('#signatur-kopieren');
      await warte(300);
      const html = await page.evaluate(async () => {
        const items = await navigator.clipboard.read();
        const b = await items[0].getType('text/html');
        return b.text();
      });
      pruefe(html.includes('<table') && html.includes('info@physio-sroka.de'), 'Drucksachen: «Signatur kopieren» legt HTML in die Zwischenablage');
      pruefe((await page.textContent('#signatur-kopieren .wort')) === 'Kopiert', 'Drucksachen: Knopf meldet «Kopiert»');
      await page.click('#signatur-code-kopieren');
      await warte(300);
      const code = await page.evaluate(() => navigator.clipboard.readText());
      pruefe(code.trim().startsWith('<table') && code === await page.inputValue('#signatur-code'), 'Drucksachen: «HTML-Code kopieren» kopiert den Code');
      pruefe(meldungen.length === 0, 'Drucksachen: keine Konsolenfehler beim Bedienen ' + JSON.stringify(meldungen));
      await ctx.close();
    }

    /* 6. Profiltexte */
    {
      const { ctx, page, meldungen } = await neueSeite(browser, 1440, { permissions: ['clipboard-read', 'clipboard-write'] });
      await page.goto(BASIS + 'profiltexte.html', { waitUntil: 'networkidle' });
      const knoepfe = await page.$$('[data-kopiere]');
      pruefe(knoepfe.length === 10, 'Profiltexte: zehn Kopier-Knöpfe');
      let gleich = 0;
      for (const k of knoepfe) {
        const id = await k.getAttribute('data-kopiere');
        await k.click();
        await warte(120);
        const kop = await page.evaluate(() => navigator.clipboard.readText());
        const soll = (await page.textContent('#' + id)).trim();
        if (kop === soll) gleich++;
      }
      pruefe(gleich === knoepfe.length, 'Profiltexte: jeder Knopf kopiert genau den angezeigten Text (' + gleich + ')');
      const laengen = await page.$$eval('[data-zaehlen]', x => x.map(e => e.textContent.trim().length));
      pruefe(laengen.length === 2 && laengen.every(n => n <= 750), 'Profiltexte: Beschreibungen höchstens 750 Zeichen ' + JSON.stringify(laengen));
      const alles = await page.textContent('main');
      pruefe(/beanspruchen/.test(alles) && /Fotos hochladen/.test(alles) && /Bewertungskarte auslegen/.test(alles), 'Profiltexte: Liste, was Sylvia selbst tut');
      const werbung = /(beste|einzigartig|garantiert|Heilung|heilt|schmerzfrei|Top|Experte|Nummer 1|!)/;
      const texte = await page.$$eval('.w-textkoerper', x => x.map(e => e.textContent).join('\n'));
      pruefe(!werbung.test(texte), 'Profiltexte: keine Werbesprache und keine Heilversprechen ' + ((werbung.exec(texte) || [])[0] || ''));
      pruefe(meldungen.length === 0, 'Profiltexte: keine Konsolenfehler beim Bedienen ' + JSON.stringify(meldungen));
      await ctx.close();
    }

    /* 7. Öffnen per Doppelklick (file://) */
    for (const s of SEITEN) {
      const { ctx, page, meldungen } = await neueSeite(browser, 1440);
      await page.goto('file://' + path.join(STAMM, 'werkzeuge', s), { waitUntil: 'load' });
      await warte(300);
      if (s === 'uebungsplan.html') pruefe(await page.$$eval('.w-uebung', x => x.length) === 12, 'file://: Übungsplan lädt die Übungen');
      pruefe(meldungen.length === 0, 'file://: ' + s + ' ohne Fehler ' + JSON.stringify(meldungen));
      await ctx.close();
    }

    /* 8. Gleichstand der Daten-Kopien */
    {
      const json = JSON.parse(fs.readFileSync(path.join(STAMM, 'daten/uebungen.json'), 'utf8'));
      const js = fs.readFileSync(path.join(STAMM, 'werkzeuge/uebungen-daten.js'), 'utf8');
      const m = /=\s*([\s\S]*);\s*$/.exec(js);
      let kopie = null; try { kopie = JSON.parse(m[1]); } catch (e) { /* */ }
      pruefe(kopie && JSON.stringify(kopie) === JSON.stringify(json), 'uebungen-daten.js entspricht daten/uebungen.json');
    }
  } finally {
    await browser.close();
    server.kill();
  }
  console.log('\n' + ok + ' bestanden, ' + fehl + ' fehlgeschlagen. Bilder und PDFs: ' + AUS);
  if (fehl) { console.log('Fehlgeschlagen:\n- ' + fehler.join('\n- ')); process.exit(1); }
}

main().catch(e => { console.error(e); process.exit(2); });
