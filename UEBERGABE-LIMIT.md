Fertig. Geprüft. Gegenprüfung durch eine zweite Sitzung am 09.11.2026: jeder Auftragspunkt selbst bedient, Prüfskript `node pruefen/werkzeuge.js` mit 227 Einzelprüfungen bestanden, alle Bilder und PDFs angesehen. Auftrag im Wortlaut: [AUFTRAG.md](AUFTRAG.md).

## Belege je Auftragspunkt
- **Rahmen** (nur statisch, keine externen Dienste, nichts veröffentlicht): nur HTML/CSS/JS in `werkzeuge/`, keine fremden Adressen ausser den QR-Zielen; `git diff origin/main` zeigt index.html, index.src.html, ueber-mich.*, seite.css, seite.js, bau.py unverändert. GitHub Pages nicht angefasst.
- **Stil**: Prüfskript bei 1440 und 390 px auf allen fünf Seiten: Überschriften Cormorant Garamond 500, Text Manrope, Schriften lokal geladen, nichts fett, nichts kursiv, keine Emojis, kein select, kein Datumsfeld, jeder Knopf mit Pfeil-Knauf, Zeichen überall eingesetzt, kein waagrechter Überlauf, keine Konsolenfehler oder fehlgeschlagenen Anfragen. Bildschirmbilder angesehen.
- **1. Übersicht** werkzeuge/index.html: vier Tafeln mit Name, einem Satz und «Öffnen», keine Bildschirmfotos; Knopf führt zum Werkzeug, «Zur Website» zu ../index.html (im Browser geklickt).
- **2. Übungsplan**: alle 12 Übungen aus daten/uebungen.json in 4 Klappkarten, an- und abgewählt, Menge geändert (erscheint auf dem Blatt), Name, Datum mit «Heute», Hinweis, Standortwechsel; Blatt mit Zeichen, Praxisdaten, Schritten und dem Hinweis aus der JSON-Datei. «Drucken oder als PDF sichern» ruft window.print; PDF A4, 3 Seiten mit 11 Übungen, keine Übung zerrissen (Bilder angesehen). Strg+P über beforeprint, afterprint räumt auf, «Neu beginnen» leert.
- **3. Rechnung**: Standort Hannover/Hemmingen als eigene Knöpfe, keine Preise vorbelegt, Positionen hinzufügen/entfernen, Summe 2 × 30,25 + 1.000,10 + 99 = 1.159,60 €, nach Entfernen 1.060,60 €; Steuernummer und Bank leer, auf dem Blatt Linien; Satz «Umsatzsteuerfrei nach § 4 Nr. 14 UStG.»; merkt sich alles nach Neuladen (localStorage), läuft bei gesperrtem Speicher und sagt es; PDF A4 mit 15 Positionen: 2 Seiten, Tabellenkopf wiederholt, Schlussblock ganz.
- **4. Drucksachen**: am Schirm gemessen 85 × 55 mm (Visiten- und Terminkarte), 210 × 297 mm (Briefpapier), 105 × 148 mm (Bewertungskarten); PDF je Drucksache in genau dieser Seitengrösse (Karten 2 Seiten, sonst 1); beide QR-Codes aus dem PDF mit OpenCV gelesen, Ziele wortgleich mit dem Auftrag; QR-SVGs lokal mit Python qrcode erzeugt (werkzeuge/erzeugen.py). Signatur als text/html in der Zwischenablage, HTML-Code kopiert, Knopf meldet «Kopiert».
- **5. Profiltexte**: zehn Kopier-Knöpfe kopieren jeweils genau den angezeigten Text; Google-Beschreibungen 723 und 745 von 750 Zeichen; Kategorien, Leistungen, Öffnungszeiten je Standort; Jameda «Über mich» und «Behandlungsschwerpunkte»; Liste «Was Sie selbst tun» mit Profil beanspruchen, Fotos hochladen, Bewertungskarte auslegen. Ich-Form, keine Werbesprache, keine Heilversprechen (Prüfskript sucht nach Werbewörtern und Ausrufezeichen). Nur Fakten aus dem Auftrag, von Hand gegengelesen.
- **Öffnen per Doppelklick** (file://): alle Seiten ohne Fehler, Übungsplan lädt die Übungen aus uebungen-daten.js; Kopie entspricht daten/uebungen.json (Prüfskript).

## In der Gegenprüfung behoben
- AUFTRAG.md fehlte im Repo; Wortlaut aus der ersten Sitzung übernommen.
- Prüfskripte lagen nur im Scratchpad; jetzt im Repo: `pruefen/werkzeuge.js`.
- Übungsplan: Satz «Rechts sehen Sie das Blatt» stimmte am Handy nicht (Blatt steht darunter); jetzt «Die Vorschau zeigt das Blatt so, wie es gedruckt wird.»
- Briefpapier: Anschrift Hemmingen im Fuss auf eine Zeile wie Hannover (Spalten gleich hoch).
- Drucksachen am Handy: Karten werden verkleinert gezeigt, jetzt mit Hinweis «Verkleinert … Gedruckt wird in 85 × 55 mm / A6».
- Profiltexte: «ausschliesslich Privatpatienten» deutlich (Fakt: keine gesetzliche Krankenversicherung).

## Entscheidungen der Nacht
- AUFTRAG.md fehlte; der Auftrag wurde aus dem Verlauf der ersten Sitzung wortgleich übernommen.
- Gearbeitet auf dem von Robert genannten Zweig `claude/physiotherapie-praxis-werkzeuge-23ggow`; der Zweig der Prüfsitzung `claude/physiotherapie-praxis-werkzeuge-check-krds6e` bekommt denselben Stand.
- «Samstag und Sonntag: geschlossen» in den Google-Öffnungszeiten bleibt: folgt aus «Montag bis Freitag 8 bis 19 Uhr», Google verlangt eine Angabe je Tag.

## Wartet auf Roberts Wort
- Nichts zu senden oder zu bezahlen. Veröffentlichen (GitHub Pages) ist laut Auftrag ausgeschlossen; Sylvia muss Google- und Jameda-Profile selbst beanspruchen.

## Werkzeuge
- [werkzeuge/index.html](werkzeuge/index.html) – Übersicht «Ihre Werkzeuge»: eine Tafel je Werkzeug (Name, ein Satz, Knopf «Öffnen»), Rückweg zur Website (../index.html).
- [werkzeuge/uebungsplan.html](werkzeuge/uebungsplan.html) – Übungen aus ../daten/uebungen.json je Gruppe (Klappkarten) anklicken, Name, Datum (Textfeld mit «Heute»), Standort im Kopf, freier Hinweis, Menge je Übung änderbar. A4-Druck mit Zeichen und Praxisdaten, Schritten und dem Hinweis aus der JSON-Datei. Knopf «Drucken oder als PDF sichern».
- [werkzeuge/rechnung.html](werkzeuge/rechnung.html) – Rechnung für Privatpatienten: Standort Hannover/Hemmingen als eigene Auswahl, Patient, Anschrift, Rechnungsnummer, -datum, Zusatz, Positionen (Datum, Leistung, Anzahl, Einzelpreis) hinzufügen/entfernen, Summe automatisch, Steuernummer und Bankverbindung leer (auf dem Blatt Linien zum Ausfüllen), «Umsatzsteuerfrei nach § 4 Nr. 14 UStG». Keine Preise vorbelegt. Merkt sich die Eingaben nur im Browser (localStorage `sroka-werkzeuge-rechnung`, mit try/catch). A4-Druck.
- [werkzeuge/drucksachen.html](werkzeuge/drucksachen.html) – Visitenkarte 85 × 55 mm (vorne/hinten), Terminkarte 85 × 55 mm (vorne Zeichen und Name, hinten Terminzeilen), Briefpapier A4 (Absenderzeile, Falzmarken, Fuß mit beiden Standorten), E-Mail-Signatur (HTML, Knöpfe «Signatur kopieren» und «HTML-Code kopieren»), Bewertungskarte A6 je Standort mit QR-Code. Jede Drucksache einzeln druckbar mit eigener @page-Grösse.
- [werkzeuge/profiltexte.html](werkzeuge/profiltexte.html) – Google-Unternehmensprofil je Standort (Beschreibung 708 bzw. 730 von 750 Zeichen mit Zähler, Kategorien-Vorschlag, Leistungen, Öffnungszeiten), Jameda «Über mich» und «Behandlungsschwerpunkte», Liste «Was Sie selbst tun». Zehn Kopier-Knöpfe.

## Gemeinsames
- [werkzeuge/werkzeuge.css](werkzeuge/werkzeuge.css) bindet ../schrift/schrift.css und ../seite.css ein; eigene Klassen mit Präfix `w-`, damit nichts mit seite.css kollidiert. Druck-CSS am Ende.
- [werkzeuge/praxis.js](werkzeuge/praxis.js): Praxisdaten, Zeichen und Pfeil-Knauf einsetzen, Kopieren (Clipboard-API mit Rückfall), Drucken (Blatt wird nach `#w-druckbereich` kopiert, `@page` dynamisch; auch Strg+P über beforeprint), Massstab (Blätter in echter Grösse, am Handy per zoom verkleinert), localStorage mit try/catch.
- [werkzeuge/erzeugen.py](werkzeuge/erzeugen.py) (`pip install qrcode`, dann `python3 werkzeuge/erzeugen.py`): erzeugt werkzeuge/qr/hannover.svg und hemmingen.svg lokal, zeichen.js aus media/zeichen.svg und uebungen-daten.js (Kopie von daten/uebungen.json für das Öffnen per Doppelklick). Nach Änderungen an daten/uebungen.json oder media/zeichen.svg neu laufen lassen.
- Nicht verändert: index.html, index.src.html, ueber-mich.*, seite.css, seite.js, bau.py. GitHub Pages nicht eingeschaltet, nichts veröffentlicht, keine externen Dienste.

## Geprüft in der ersten Sitzung (Playwright, Chromium)
- Gesamtskript mit 111 Einzelprüfungen, alle bestanden: jede Seite bei 1440 und 390 px ohne waagrechten Überlauf; kein select, kein date-Feld; nichts fett, nichts kursiv; alle Überschriften Cormorant Garamond 500; Zeichen überall eingesetzt; jeder Knopf mit Knauf; keine Konsolenfehler, Warnungen oder fehlgeschlagenen Anfragen.
- Übungsplan: alle 12 Übungen an- und abgewählt, Menge geändert, Name, Datum («Heute»), Standort, Hinweis, Zähler, Drucken-Knopf, Strg+P, Neu beginnen. PDF mit 11 Übungen: 3 A4-Seiten, keine Übung über einen Seitenumbruch zerrissen.
- Rechnung: Standortwahl, Positionen hinzufügen/entfernen, Summe (2 × 30,25 + 1.000,10 = 1.060,60 €), Merken nach Neuladen, «Neue Rechnung» behält Steuernummer/Bank, läuft auch bei gesperrtem localStorage. PDF mit 13 Positionen: 2 A4-Seiten, Zeilen und Schlussblock nicht zerrissen.
- Drucksachen: alle fünf Drucken-Knöpfe; PDF-Grössen 85 × 55 mm (je 2 Seiten), A4 (1 Seite), A6 (je 1 Seite); echte Grössen im Browser gemessen; beide QR-Codes aus dem PDF mit OpenCV gelesen, Ziele stimmen genau; Signatur als text/html in der Zwischenablage, HTML-Code kopiert.
- Profiltexte: alle 10 Kopier-Knöpfe kopieren genau den angezeigten Text; Beschreibungen unter 750 Zeichen.
- Öffnen per file:// (Doppelklick): alle Seiten ohne Fehler, Übungsplan lädt die Übungen aus uebungen-daten.js.

## Zweig
`claude/physiotherapie-praxis-werkzeuge-23ggow`

## Stolpersteine
- Erneut prüfen: im Stamm `node pruefen/werkzeuge.js [ordner]` (startet selbst einen Server, legt Bilder und PDFs im Ordner ab; braucht Playwright, pdfinfo, pdftoppm). QR lesen: `pip install opencv-python-headless`.
- Google-Kategorien sind Vorschläge; in Google die nächstliegende Bezeichnung wählen.
