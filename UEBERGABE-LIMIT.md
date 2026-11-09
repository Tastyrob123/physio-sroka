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
- Recherche Menüwege Google/Jameda läuft in einem Unteragenten → `pruefen/quellen-profiltexte.md`.

## Offen, in Reihenfolge
1. Vorlage lesen (Master 4.7, 8, 9, 10a; Werkstatt-Übergabe; HAUS-GV; Rahmen UMSTELLUNG.md)
2. Rahmen-Kleid «sroka» anlegen (werkzeuge/rahmen/)
3. Werkstatt kopieren nach werkzeuge/werkstatt/, Haus sroka, Vorlagen
4. Übungsplan, Rechnung, Profiltexte, Übersicht in den Rahmen
5. Prüfskript erweitern, prüfen, Bilder ansehen

## Nächster genauer Schritt
Werkstatt kopieren nach `werkzeuge/drucksachen/` (ohne api, serve.py, mail), Haus `sroka` mit `bau.py` (Schriften als feste TTF aus schrift/*.woff2, Zeichen aus media/zeichen.svg, nur Fotos, die auf der Website stehen).

## Zweig
`claude/sroka-werkzeuge-umbau-6cdhaj`
