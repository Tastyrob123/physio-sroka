In Arbeit. Umbau der vier Werkzeuge nach der Vorlage der sieben Werkzeuge (Auftrag Robert 09.11.2026, siehe unten).

## Auftrag (Kurzfassung, Wortlaut in der Sitzung)
Robert nach der ersten Fassung: «Übungsplan … noch individueller gestalten und nicht ein Vorlagendeck … Drucksachen sehen auch nicht so aus, wie wir das normalerweise auf unseren Seiten machen. Und Profiltexte, okay, aber da fehlt der Bezug zu wo.»
Oberste Regel: kopieren und umkleiden aus `_vorlage/` (Rahmen `_vorlage/oberflaeche/`, Werkstatt `_vorlage/imprimerie/`), nie frei bauen. Nur `werkzeuge/` ändern (im Repo liegt die Website im Stamm, «site/werkzeuge» = `werkzeuge/`). `_vorlage/` nicht verändern.
1. Drucksachen = Kopie der Werkstatt, umgekleidet (Haus «sroka»), Praxis-Vorlagen, ohne KI.
2. Übungsplan individuell je Patient (eigene Übungen, Bibliothek als Ausgang, Abschnitte/Wochen, Ziel, Notiz, Pläne im Browser, Blatt wie Werkstatt).
3. Profiltexte mit Bezug: Plattform, Feld, Weg, Link, Zeichengrenze, nachgezeichnete Abbildung, Quellen.
4. Rechnung in den Rahmen, Funktion bleibt.
5. Übersicht im Rahmen.
Prüfen: Playwright Chromium + WebKit, 1440/390, Fehlerbuch 10a einzeln.

## Fertig
- Vorlage gelesen; Fehlerbuch 10a verdichtet: `pruefen/fehlerbuch-10a.md` (250 Zeilen, 166 betreffen diese Werkzeuge).
- Rahmen: `werkzeuge/rahmen/` = Kopie `_vorlage/oberflaeche` (einzige Code-Änderung: `WO_HAUS.reihe`), Kleid `kleid/sroka.js|css|-zeichen.svg`, Wege relativ aus der Lage der Datei (GitHub Pages). Muster: `werkzeuge/rahmen/muster.html`.
- Werkstatt kopiert nach `werkzeuge/drucksachen/` (ohne api/serve/mail). Haus `sroka`: `bau.py` (Schriften TTF, Zeichen, Tapete, 23 Website-Fotos, 2 QR) und `inhalte.py` (EINE Quelle aller Texte: Arten, Beispiele, Bereiche, Aushänge, 74 Vorlagen). Neue Aufbauten in `vorlagen.js`: visite, kontakt, termine, brief, umschlag, bewertung; Formate visit, dl. Ohne KI: `DSStart.ohneKi` (start.js) statt `api/entwurf`. Farben einmalig umgerechnet (Skript im Scratchpad, nicht wiederholen).
- Übungspläne neu: `werkzeuge/uebungsplan.html|js|css` im Rahmen, gemeinsame Teile `werkzeuge/gemeinsam.js|css` (Kopf, Rand, Leiste, Speichern, Quittung, Fenster, Blätter A4 gemessen gesetzt, Druck). `drucksachen.html` leitet in `drucksachen/index.html`.
- Recherche Menüwege (fertig, `pruefen/quellen-profiltexte.md`; Netz zu support.google.com/jameda gesperrt, Belege aus Suchtreffern) Google/Jameda läuft in einem Unteragenten → `pruefen/quellen-profiltexte.md`.

## Offen, in Reihenfolge
1. Vorlage lesen (Master 4.7, 8, 9, 10a; Werkstatt-Übergabe; HAUS-GV; Rahmen UMSTELLUNG.md)
2. Rahmen-Kleid «sroka» anlegen (werkzeuge/rahmen/)
3. Werkstatt kopieren nach werkzeuge/werkstatt/, Haus sroka, Vorlagen
4. Übungsplan, Rechnung, Profiltexte, Übersicht in den Rahmen
5. Prüfskript erweitern, prüfen, Bilder ansehen

- Rechnung im Rahmen (`werkzeuge/rechnung.html|js|css`, Commit 5d5fd83).
- Profiltexte mit Bezug und Übersicht im Rahmen (`werkzeuge/profiltexte.*`, `werkzeuge/index.html`, `uebersicht.js`, Commit b796d07).

- Drucksachen: Reste der Vorlage entfernt (Prüfseite auf Haus sroka, Fotogruppen aus den Fotos der Praxis, Werkbank-Weg relativ, Texte), Commit 8ced6ea.
- Prüfskript neu: `timeout 900 node pruefen/werkzeuge.js <ordner>`, 316 Prüfpunkte grün (Ansichten 1440/390, Bedienung aller Werkzeuge, PDFs A4 mit Seitenumbruch, gesperrter Speicher, file://). Dabei behoben: Planliste zeigte ab dem zweiten Plan «Beispiel ansehen», Quittung fett, Link-Knöpfe der Profiltexte am Handy zu breit, Zeichen unter file:// (jetzt data:-Adresse im Kleid).

- Bilder und PDFs angesehen (Übersicht, Übungsplan, Rechnung, Profiltexte, Drucksachen, 1440/390). Behoben: Zeichen im Kopf fehlte (# im data:-URI), Leiste beim Beispiel. Werkstatt-PDFs aller 5 Beispiele im Prüfskript (Format + 3 mm Beschnitt, keine fehlenden Zeichen).
- Unteragent prüft das Fehlerbuch 10a Punkt für Punkt (nur lesen, Bericht an diese Sitzung).

## Nächster genauer Schritt
Bericht des Fehlerbuch-Unteragenten abarbeiten (falls die Sitzung abbricht: selbst `pruefen/fehlerbuch-10a.md` gegen die Werkzeuge prüfen); danach Prüfskript laufen lassen und «Fertig.» schreiben. Früherer Schritt (erledigt): Bilder und PDFs der Prüfung ansehen (Ordner im Scratchpad, neu erzeugen mit dem Prüfskript), Fehlerbuch 10a (`pruefen/fehlerbuch-10a.md`) Punkt für Punkt gegen die Werkzeuge abhaken, Funde beheben, dann «Fertig.».

## Entscheidungen der Nacht
- WebKit: Download in der Cloud gesperrt (Download failure), geprüft nur mit Chromium; das Prüfskript nimmt WebKit mit `PRUEF_WEBKIT=1` dazu, wo es installiert ist (am Mac).
- Verborgene native select der Werkstatt (`hwahl-nativ`, mit eigenem Wahlknopf darüber) bleiben: so baut es die Vorlage, sichtbar ist nur der gestaltete Knopf.
- (Folgesitzung 09.11. abends) Kein Unteragent mehr offen: Recherche Profiltexte liegt in `pruefen/quellen-profiltexte.md`, alle Bauschritte sind committet. Nichts neu zu starten.

## Wartet auf Roberts Wort
- nichts

## Zweig
`claude/sroka-werkzeuge-umbau-6cdhaj`
