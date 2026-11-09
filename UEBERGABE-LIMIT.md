In Prüfung.

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

## Geprüft (Playwright, Chromium)
- Gesamtskript mit 111 Einzelprüfungen, alle bestanden: jede Seite bei 1440 und 390 px ohne waagrechten Überlauf; kein select, kein date-Feld; nichts fett, nichts kursiv; alle Überschriften Cormorant Garamond 500; Zeichen überall eingesetzt; jeder Knopf mit Knauf; keine Konsolenfehler, Warnungen oder fehlgeschlagenen Anfragen.
- Übungsplan: alle 12 Übungen an- und abgewählt, Menge geändert, Name, Datum («Heute»), Standort, Hinweis, Zähler, Drucken-Knopf, Strg+P, Neu beginnen. PDF mit 11 Übungen: 3 A4-Seiten, keine Übung über einen Seitenumbruch zerrissen.
- Rechnung: Standortwahl, Positionen hinzufügen/entfernen, Summe (2 × 30,25 + 1.000,10 = 1.060,60 €), Merken nach Neuladen, «Neue Rechnung» behält Steuernummer/Bank, läuft auch bei gesperrtem localStorage. PDF mit 13 Positionen: 2 A4-Seiten, Zeilen und Schlussblock nicht zerrissen.
- Drucksachen: alle fünf Drucken-Knöpfe; PDF-Grössen 85 × 55 mm (je 2 Seiten), A4 (1 Seite), A6 (je 1 Seite); echte Grössen im Browser gemessen; beide QR-Codes aus dem PDF mit OpenCV gelesen, Ziele stimmen genau; Signatur als text/html in der Zwischenablage, HTML-Code kopiert.
- Profiltexte: alle 10 Kopier-Knöpfe kopieren genau den angezeigten Text; Beschreibungen unter 750 Zeichen.
- Öffnen per file:// (Doppelklick): alle Seiten ohne Fehler, Übungsplan lädt die Übungen aus uebungen-daten.js.

## Zweig
`claude/physiotherapie-praxis-werkzeuge-23ggow`

## Stolpersteine
- Prüfskripte lagen im Scratchpad der Sitzung, nicht im Repo; zum erneuten Prüfen `python3 -m http.server 8765` im Stamm und Playwright verwenden.
- Google-Kategorien sind Vorschläge; in Google die nächstliegende Bezeichnung wählen.
