# Übergabe: Praxis-Werkzeuge (Demo)

In Arbeit (Stand 09.11.2026).

## Auftrag
Im Ordner `werkzeuge/` statische Praxis-Werkzeuge für Sylvia Sroka bauen (HTML, CSS, JS, kein Server, nichts veröffentlichen, GitHub Pages nicht einschalten).
Nicht anfassen: index.html, index.src.html, ueber-mich.*, seite.css, seite.js, bau.py (dort wird parallel gearbeitet).
Gestaltung in `werkzeuge/werkzeuge.css` (bindet ../seite.css und ../schrift/schrift.css ein). Zeichen inline aus media/zeichen.svg, currentColor.
Regeln: Cormorant Garamond 500 für Überschriften, Manrope für Text, nie fett, nie kursiv, keine Emojis, keine Etiketten über Überschriften, kein select, kein date-Feld, 390 px ohne Überlauf.
Nur die Fakten aus dem Auftrag verwenden (siehe Abschnitt Fakten im Auftrag; stehen auch in werkzeuge/praxis.js).

Werkzeuge:
1. werkzeuge/index.html – Übersicht «Ihre Werkzeuge»
2. werkzeuge/uebungsplan.html – Übungsplan aus ../daten/uebungen.json, Druck A4
3. werkzeuge/rechnung.html – Rechnungsvorlage Privatpatienten, localStorage, Druck A4
4. werkzeuge/drucksachen.html – Visitenkarte, Terminkarte, Briefpapier, E-Mail-Signatur, Bewertungskarte A6 mit QR
5. werkzeuge/profiltexte.html – Google-Profil je Standort, Jameda, Liste für Sylvia

## Fertig
- Gemeinsames: [werkzeuge/werkzeuge.css](werkzeuge/werkzeuge.css), [werkzeuge/praxis.js](werkzeuge/praxis.js) (Praxisdaten, Kopieren, Drucken über #w-druckbereich + dynamisches @page, Massstab per zoom), [werkzeuge/erzeugen.py](werkzeuge/erzeugen.py) → qr/*.svg, zeichen.js, uebungen-daten.js
- [werkzeuge/index.html](werkzeuge/index.html) Übersicht

## Offen, in Reihenfolge
1. uebungsplan.html
2. rechnung.html
3. drucksachen.html
4. profiltexte.html
5. Prüfen mit Playwright (scratchpad-Skript), PDFs ansehen, 1440/390 px, Konsole

## Nächster genauer Schritt
werkzeuge/uebungsplan.html bauen.

## Zweig
`claude/physiotherapie-praxis-werkzeuge-23ggow`

## Stolpersteine
- Stop-Hook: «Fertig.» darf keine Sätze wie «bleibt offen» oder «nicht Teil dieses Auftrags» enthalten.
- QR-Codes mit Python `qrcode` (pip install qrcode) erzeugen; Skript liegt in werkzeuge/qr/erzeugen.py.
- Seiten laufen auch per file:// – daher wird uebungen.json per fetch geladen und bei Fehler eine Meldung gezeigt (für file:// lokal `python3 -m http.server` im Stamm).
