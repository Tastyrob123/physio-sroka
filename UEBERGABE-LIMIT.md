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
- [werkzeuge/uebungsplan.html](werkzeuge/uebungsplan.html) Übungsplan (Druck A4 über W.drucken)
- [werkzeuge/rechnung.html](werkzeuge/rechnung.html) Rechnung (localStorage-Schlüssel sroka-werkzeuge-rechnung, PDF geprüft, 2 Seiten bei 13 Positionen sauber)
- [werkzeuge/drucksachen.html](werkzeuge/drucksachen.html) Drucksachen (PDF-Grössen geprüft: 85×55 je 2 Seiten, A4 1 Seite, A6 1 Seite; QR mit OpenCV aus PDF dekodiert = richtige Ziele)
- [werkzeuge/profiltexte.html](werkzeuge/profiltexte.html) Profiltexte (Beschreibungen 708 und 730 von 750 Zeichen)

## Offen, in Reihenfolge
1. Prüfen mit Playwright (scratchpad-Skript), PDFs ansehen, 1440/390 px, Konsole

## Nächster genauer Schritt
Gesamtprüfung mit Playwright: jede Funktion klicken, PDFs, 1440/390, Konsole, kein fett/kursiv/select.

## Zweig
`claude/physiotherapie-praxis-werkzeuge-23ggow`

## Stolpersteine
- Stop-Hook: «Fertig.» darf keine Sätze wie «bleibt offen» oder «nicht Teil dieses Auftrags» enthalten.
- QR-Codes mit Python `qrcode` (pip install qrcode) erzeugen; Skript: `python3 werkzeuge/erzeugen.py` (QR, zeichen.js, uebungen-daten.js). Nach Änderung an daten/uebungen.json neu laufen lassen.
- Übungsplan lädt ../daten/uebungen.json per fetch; bei file:// oder Fehler nimmt er die Kopie uebungen-daten.js.
- Prüfen: `python3 -m http.server 8765` im Stamm, Playwright-Skripte im Scratchpad (nicht im Repo).
