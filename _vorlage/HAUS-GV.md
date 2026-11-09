# Werkzeuge Gilles Varone · gemeinsame Hauswerte (für jeden Bau-Chat und Unteragenten)

Angelegt 09.11.2026 (Chat «Werkbank Gilles Varone»). Robert: Werkbank mit sieben Werkzeugen, Drucksachen, Feed, Markenbuch für das Restaurant Gilles Varone bauen, «dann los». Alles lokal, nichts online.

## Ort und Vorlage
- Projekt: `~/Desktop/Website-Projekte/Gilles Varone Savièse/` — **die Website liegt im Stamm** (index.html, restaurant.html, experiences.html, equipe.html, infos.html, `assets/gv.css`, `assets/gv.js`, `bilder/`, `film/`, `schrift/`, `bau.py`). An der Website arbeitet ein anderer Chat: **Website-Dateien nie ändern** (nur lesen).
- Werkzeuge: `_werkzeuge/<werkzeug>/` (maison, bureau, carte, reception, livre, registre, imprimerie, oberflaeche). Kopiert am 09.11.2026 aus der abgenommenen Vorlage **Wirtschaft am Schlössli Bottighofen** (`~/Desktop/Website-Projekte/Wirtschaft am Schlössli Bottighofen/_werkzeuge/<werkzeug>/`). Die Vorlage nie ändern. Sie läuft gerade lokal und kann zum Vergleich geöffnet werden: Hafenbüro (maison) 8987 · Schaufenster (bureau) 9035 · Kartenpult (carte) 9031 · Reservationsbuch (reception) 9047 · Bildarchiv (livre) 9049 · Besucherliste (registre) 8988 · Hausdruckerei (imprimerie) 9053.
- Regel: **kopieren und umkleiden, nie neu schreiben.** Aufbau, Grössen, Ansichten, Modi, Reiter, Fenster, Bewegung bleiben wie in der Vorlage. Nur Kleid, Inhalt, Namen ändern.

## Ports (nur diese, reserviert 9711–9719)
maison 9711 · bureau 9712 · carte 9713 · reception 9714 · livre 9715 · registre 9716 · imprimerie 9717 · Website-Server der Werkbank 9718 · frei 9719.
Server als eigener Prozess im Hintergrund (`nohup python3 _werkzeuge/<w>/server.py <port> > _werkzeuge/_server-logs/<w>.log 2>&1 &`), nie nacktes `python3 -m http.server` (der Memory Guard räumt es ab). Nie pkill/killall, nur die eigene PID beenden.

## Gemeinsame Dateien
- `_werkzeuge/assets/` ersetzt `website/assets/` der Vorlage: jeder Werkzeug-Server liefert `/assets/…` aus diesem Ordner (statt `PROJEKT/'website'/'assets'`). Inhalt: `fonts/` (GillSansNova-Book/-Medium, CaviarDreams, InstrumentSans, DMMono), `img/<name>-600|1200|1800.webp` (alle echten Fotos des Hauses, Namen wie in `bilder/`; `haus-*.webp` = Saal mit offener Küche als Hausbild, eine Aussenansicht hat das Haus nicht), `img/geflecht.png` (Flechtmuster, Tapete), `svg/` (zeichen, wortmarke, zierde «xx», wert-terroir/-haute-cuisine/-partage), `logo/zeichen.svg`, `logo/wortmarke.svg`, `oberflaeche` → `_werkzeuge/oberflaeche/`.
- Werkzeug-Rahmen: `_werkzeuge/oberflaeche/kleid/varone.js` + `varone.css` + `varone-zeichen.svg`. **Kurzname des Hauses überall `varone`** (statt `schloessli`; ohne Bindestrich, weil Skripte `[^a-z]` wegfiltern).
- Die Seiten der Website liest ein Werkzeug aus dem Projektstamm (statt `PROJEKT/'website'`).

## Namen der Werkzeuge (nach dem Zweck, bis Robert einen Namenssatz wählt; die eine Stelle ist `kleid/varone.js → namen`)
Zentrale «Das Kontrollpanel» (maison) · «Website bearbeiten» (bureau) · «Die Speisekarten» (carte) · «Anfragen & Chat» (reception) · «Das Markenbuch» (livre) · «Die Besucher» (registre) · «Drucksachen & Feed» (imprimerie).
Knopftexte grammatisch richtig: «Die Speisekarten öffnen», «Website bearbeiten» (nicht «Website bearbeiten öffnen»).

## Das Haus
- Restaurant Gilles Varone, Rue du Stade 5B, 1965 Savièse (Saint-Germain, Wallis). 027 565 89 20 · info@gillesvarone.ch (in der Rohquelle als «[email protected]» verschleiert; die Website führt `info@gillesvarone.ch`, nachsehen in infos.html). Reservation über Zenchef (Restaurant 360467). Gutscheine über e-guma.
- 2 Sterne Guide Michelin (2025), 18 Punkte GaultMillau (seit Oktober 2026), Michelin Young Chef Award 2024 (Meilleur Jeune Chef Suisse 2024), GaultMillau «Découverte romande de l'année 2023», Étoile verte erwähnt.
- Équipe: Gilles Varone (Chef & patron), Letizia Varone (co-gérante), Andrea Granzarolo (Chef de cuisine), Wesley Broden (Chef pâtissier), Lise Donier-Meroz (Cheffe sommelière), Ana Suarez (Restaurant manager).
- Horaires: lundi–mercredi fermé · jeudi 18h30–00h00 · vendredi & samedi 12h00–16h00 / 19h00–00h00 · dimanche 12h00–16h00. Fermetures: 21.–31. Dezember 2026, 1.–6. Januar 2027.
- Expériences (Wortlaut der Website): l'expérience en 5 services (Amuse-Bouche – Première Entrée – Deuxième Entrée – Plat Principal – Dessert) · en 6 services (Amuse-Bouche – Entrée – Poisson – Plat Principal – Pré-Dessert – Dessert) · en 7 services (Amuse-Bouche – Première Entrée – Deuxième Entrée – Poisson – Plat Principal – Pré-Dessert – Dessert) · l'expérience chasse locale (uniquement durant le mois d'octobre) · expériences végétariennes (sur demande préalable) · groupes dès 8 personnes (demandes spéciales). Accords mets et vins und mets et créations sans alcool. «L'expérience choisie sera identique pour tous les convives assis au sein d'une même table.» Die Website nennt Preise (199/229/259/299 CHF); **keine Preise erfinden**, Preise nur genau so, wie die Website des Hauses sie führt, und in Angeboten/Rechnungen von Tasty Studios gar keine.
- Keine Weinkarte veröffentlicht («La carte des vins est régulièrement sujette à modifications»): keine Weine erfinden.
- Accès: parking souterrain gratuit, ascenseur jusqu'à l'étage zéro; bus 341 et 342 depuis Poste/Gare Sion jusqu'à Saint-Germain centre Savièse; mobilité réduite jusqu'à 7 personnes sur annonce; animaux non admis.
- Quellen: `_material/roh/home_text.txt` (oben eingeschleuste Casino-Werbung, die Seite ist gehackt: **nie übernehmen**), `CHARAKTER.md`, die fünf Seiten der Website, `bilder/`, `_material/`.
- Sprache: **Das Haus spricht Französisch.** Alles, was ein Gast sieht (Karten, Chat-Antworten, Mails, Drucksachen, Feed, Beispiel-Anfragen), auf Französisch im Ton der Website (vous, warm, präzise; Wortlaut der Website wo möglich). Die Oberfläche der Werkzeuge bleibt Deutsch (Sie-Form, Schweizer Schreibung) wie in der Vorlage.
- Texte immer wertig (Sorgfalt, der einzelne Gast, der einzelne Teller), nie Menge, Abfertigung, Fliessband.

## Kleid
Nacht `#0b1315` (`#111b1d`, `#070c0d`) · Gold `#C9AB81` (hell `#dcc3a0`, dunkel `#9C7C57`, Bronze `#755C3A`) · Papier `#F7F3EC`, Sand `#EEE6D8` · Rot nur im Michelin-Zeichen. Titel Gill Sans Nova Book 400 (nie fett, nie kursiv), kleine Zeilen Caviar Dreams in gesperrten Versalien. Flechtmuster als Tapete (`/assets/img/geflecht.png`, 131×157 px, Gold auf durchsichtig), Zierde «xx» als Trenner, Fotos eckig (4 px) in goldener Fuge, Knöpfe rechteckig in Gold (wie «Compris»).
Zeichen: Monogramm GV (`/assets/svg/zeichen.svg`, Gold). Wortmarke GILLES VARONE (`/assets/svg/wortmarke.svg`).

## Bilder (nur echte Fotos des Hauses, nichts erzeugen)
Saal: `saal-kueche` (Saal mit offener Küche, abends, stärkstes Raumbild), `salle-gv` (Saal mit GV-Zeichen), `salle-jour` (Saal bei Tag), `cuisine`/`cuisine-2` (offene Küche, fast gleich: nie beide nebeneinander), `comptoir`, `comptoir-2`, `saal-alpen` (Alpenblick, **nicht gross zeigen**, Robert fand es unscharf). Teller: `teller-gross` (2000 px), `noir-1`/`noir-2` (fast gleich), `jus`, `poisson`, `soupe`, `assiette-table`, `mains`, `dessert-cuillere`, `dessert-holz`, `bougie-1`, `bougie-2`, `verse-1…4` (verse-2 ≈ verse-4), `teller-1…9` (nur 724–793 px: nur klein). Menschen: `chef-*` (Gilles in Küche/Saal), `brigade`, `couple`, `gilles-letizia`, `letizia-saal`, `award-zu-dritt`, `buehne-team`, Porträts `p-gilles`, `p-letizia`, `p-andrea`, `p-wesley`, `p-lise`, `p-ana` (Hochformat). `plan-saviese` (gezeichneter Ortsplan).
Regeln: keine Porträts als Kachel-, Hintergrund- oder Startbild (Gesicht wird angeschnitten) — Kacheln nehmen Raum- und Tellerfotos · nicht dasselbe Foto zweimal in einer Reihe oder in jeder Zeile · fast gleiche Fotos (noir-1/2, cuisine/-2, verse-2/4) nie nebeneinander.

## Was heute (09.11.2026) an Werkbänken korrigiert wurde und hier von Anfang an gilt
kein Ticket/Billett irgendwo · bei Restaurants kein Rechenbeispiel («Worum es geht» weg) · Draussen am Rechner vier Kacheln nebeneinander · keine Preise eintragen · Raster immer so viele Spalten wie Stücke, letzte Rasterreihe voll · jede Bildfläche bis unten gefüllt, Tafeln/Spalten nebeneinander gleich hoch, nie Leerraum · Zurück-Pfeil und «Zur Werkbank» führen an die alte Stelle (`?wbu=`, pageshow persisted) · Auftritte beim Scrollen überall (was unter dem ersten Bildschirm steht, schwebt 40 px herein, Fotos zoomen im Rahmen; nur transform/clip-path, deckend, IntersectionObserver) · flüssig auch bei 6-fach gedrosselter Rechenleistung · Knöpfe/Text nie unter der runden Ecke des nächsten Abschnitts · Laufband-Schrift mittig.

## Verboten
Nichts hochladen, kein Vercel, keine KI-Aufrufe, keine API-Schlüssel (auch nicht aus dem Vault lesen: `LIVRE_KI`, `ki_claude_pfad.txt` u. ä. aus), nichts senden, keine Fragen an Robert, kein Git (der Haupt-Chat committet), nie pkill/killall (Chrome schon gar nicht), headless nur mit eigenem Profil und einer Instanz, andere Häuser und die Website nicht anfassen. Gemeinsame Ordner (`~/Desktop/Website-Projekte/_Werkzeuge/`, `_Werkbank-Kit/`): nur **neue** Dateien für `varone` anlegen (z. B. `haeuser/varone.json`), nie bestehende ändern; braucht der Stamm eine Änderung, im Bericht melden.

## Fertig heisst je Werkzeug
1. Grep ohne ungewollte Fundstelle: `grep -rIn -i "schl[öo]e\?ssli\|bottighofen\|hafenb\|kartenpult\|reservationsbuch\|bildarchiv\|besucherliste\|hausdruckerei\|schaufenster\|lästermeile\|laestermeile\|thurgau\|bodensee\|8982\|9035\|9031\|9047\|9049\|8988\|9053\|8987" _werkzeuge/<w>` (ausser Kommentaren, die auf die Vorlage verweisen).
2. Jede Funktion bedient (nicht nur geladen), 1440 und 390, Chromium (eigenes Profil) — mit Wegwerf-Daten, wo geschrieben wird.
3. `node ~/Desktop/Website-Projekte/_Werkzeuge/oberflaeche_pruefen.js http://127.0.0.1:<port>/_werkzeuge/<w>/` meldet BESTANDEN.
4. Jede Ansicht mit dem Auge angesehen (Aufnahmen in `_werkzeuge/<w>/_pruefung-gv/`, je Bild ein Satz in `_werkzeuge/<w>/_pruefung-gv/NOTIZ.md`).
5. Vergleichsseite: `_werkzeuge/<w>/vergleich/ansichten.txt` (je Zeile `name | url-der-vorlage | url-neu`, mind. fünf Ansichten inkl. Handy), dann `python3 ~/Desktop/Website-Projekte/_Werkzeuge/vergleich/vergleich.py _werkzeuge/<w>` und Unterschiede ausser Kleid und Inhalt beheben.
6. Bericht: was geändert, Port, Startbefehl, was offen.
