#!/bin/bash
# Läuft nach jedem Werkzeugaufruf. Höchstens alle 10 Minuten: LEBENSZEICHEN mit Uhrzeit committen und pushen (im Hintergrund).
# Entsteht nur, solange die Sitzung wirklich arbeitet. Die Wache am Mac (sitzung_wache.sh) erkennt daran Stillstand nach 20 Minuten.
D="$(cd "$(dirname "$0")" && pwd)"; R="$(cd "$D/../.." && pwd)"; M="$D/zuletzt-lebenszeichen"
[ -f "$M" ] && [ $(( $(date +%s) - $(stat -c %Y "$M" 2>/dev/null || stat -f %m "$M") )) -lt 600 ] && exit 0
touch "$M"
( cd "$R" && date -u '+%Y-%m-%dT%H:%M:%SZ arbeitet' > LEBENSZEICHEN && git add LEBENSZEICHEN \
  && git commit -q -m "Lebenszeichen" -- LEBENSZEICHEN >/dev/null 2>&1; timeout 60 git push -q origin HEAD >/dev/null 2>&1 \
  || { timeout 60 git pull -q --rebase --autostash origin "$(git branch --show-current)" >/dev/null 2>&1 && timeout 60 git push -q origin HEAD >/dev/null 2>&1; } ) </dev/null >/dev/null 2>&1 &
exit 0
