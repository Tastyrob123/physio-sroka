#!/bin/bash
# Stop-Hook: Die Sitzung darf erst aufhören, wenn UEBERGABE-LIMIT.md mit «Fertig.» oder «Nicht fertig.» beginnt.
# Gegen Endlosschleifen: nach 6 Sperren innerhalb von 15 Minuten darf sie aufhören (die Wache am Mac startet dann eine Folgesitzung).
D="$(cd "$(dirname "$0")" && pwd)"; R="$(cd "$D/../.." && pwd)"; Z="$D/sperren"
AUS='nicht[[:space:]]+(Teil|Bestandteil|Gegenstand)[[:space:]]+(dieses|des|deines|meines|vom|unseres|dieser)|au(ss|ß)erhalb[[:space:]]+(dieses|des|deines|meines)[[:space:]]+Auftrag|nicht[[:space:]]+im[[:space:]]+(Auftrag|Revier)|offen[[:space:]]+beim[[:space:]]+[[:alnum:]]+|bleibt[[:space:]]+offen'
# «Fertig.» mit einem ausgeschlossenen oder offenen Punkt gilt nicht (Robert 09.11.2026)
if head -5 "$R/UEBERGABE-LIMIT.md" 2>/dev/null | grep -qE '^(«)?Fertig\.' && sed '/Wartet auf Roberts Wort/,/^## /d' "$R/UEBERGABE-LIMIT.md" | grep -qiE "$AUS"; then
  FERTIG_MIT_AUSSCHLUSS=1
else
  head -5 "$R/UEBERGABE-LIMIT.md" 2>/dev/null | grep -qE '^(«)?(Fertig\.|Nicht fertig\.)' && exit 0
fi
JETZT=$(date +%s); touch "$Z"; awk -v j="$JETZT" '$1 > j-900' "$Z" > "$Z.n"; mv "$Z.n" "$Z"
[ $(wc -l < "$Z") -ge 6 ] && exit 0
echo "$JETZT" >> "$Z"
[ -n "${FERTIG_MIT_AUSSCHLUSS:-}" ] && { echo '{"decision":"block","reason":"Nicht aufhören: UEBERGABE-LIMIT.md meldet «Fertig.», schliesst aber etwas aus (nicht Teil dieses Auftrags, offen beim …, bleibt offen). Das ist verboten (Robert 09.11.2026). Den Punkt dort beheben, wo die Ursache liegt, auch in einem gemeinsamen Ordner oder anderen Haus, alles Mitbetroffene nachprüfen, den Ausschluss-Satz streichen, dann erst «Fertig.»."}'; exit 0; }
echo '{"decision":"block","reason":"Nicht aufhören: Der Auftrag ist offen (UEBERGABE-LIMIT.md beginnt nicht mit «Fertig.» oder «Nicht fertig.»). Laufende Unteragenten abwarten und prüfen, den nächsten offenen Schritt aus UEBERGABE-LIMIT.md weiterbauen, committen, pushen. Erst wenn alles fertig und geprüft ist: UEBERGABE-LIMIT.md mit «Fertig. …» beginnen lassen (oder «Nicht fertig. …» mit Grund, wenn es wirklich nicht weitergeht), pushen, dann aufhören."}'
