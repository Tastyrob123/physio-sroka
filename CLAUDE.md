# Arbeitsweise

## Limit und Übergabe (Robert 04.11.2026, gilt für jeden Chat in jedem Profil)
- Jeder Chat in diesem Repo hält `UEBERGABE-LIMIT.md` im Stamm **laufend** aktuell: nach jedem fertigen Schritt nachführen, committen, pushen. Inhalt: Auftrag, was fertig ist (mit Links), was offen ist in Reihenfolge, der nächste genaue Schritt, Zweige, Prüfstand, Stolpersteine. Ein Chat in einem anderen Profil macht allein mit dieser Datei nahtlos weiter.
- `.claude/limit/` meldet sich von selbst, wenn das 5-Stunden- oder Wochenlimit fast erreicht ist (ab 95 % / 97 %, letzte Warnung ab 98 % / 99 %). Dann sofort die Übergabe vollständig schreiben und pushen, erst danach weiter.
- **Weitermachen in einem anderen Profil:** neue Cloud-Sitzung auf diesem Repo, erster Satz: «Lies UEBERGABE-LIMIT.md und mach dort weiter.» Der neue Chat liest zuerst diese Datei, dann CLAUDE.md, und setzt beim «nächsten genauen Schritt» an.


## Lebenszeichen und nicht aufhören (Robert 09.11.2026)
- `.claude/limit/lebenszeichen.sh` pusht höchstens alle 10 Minuten `LEBENSZEICHEN`, solange gearbeitet wird. Bleibt es 20 Minuten aus, startet die Wache am Mac eine Folgesitzung («Lies UEBERGABE-LIMIT.md und mach dort weiter»). Nie abschalten.
- Nie aufhören, solange der Auftrag offen ist: Unteragenten abwarten, weiterbauen. Erst wenn alles fertig und geprüft ist, beginnt `UEBERGABE-LIMIT.md` mit «Fertig. …» (oder «Nicht fertig. …» mit Grund). Der Stop-Hook `.claude/limit/nicht-aufhoeren.sh` hält die Sitzung sonst an der Arbeit.
