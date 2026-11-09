/* kleid/varone.js · Hauswerte für oberflaeche.js (Restaurant Gilles Varone, Savièse VS, 09.11.2026). Im <head> VOR allen Stilen laden (ohne defer).
   Rahmen «Die Bühne» wie in der Vorlage Wirtschaft am Schlössli (gesetzt, nicht von Robert gewählt; Wechsel = eine Zeile hier).
   Wird von den Werkzeug-Servern unter /assets/oberflaeche/ ausgeliefert (Quelle _werkzeuge/oberflaeche/, Fotos und Schriften aus _werkzeuge/assets/). */
window.WO_HAUS = { kurz: 'varone', name: 'Gilles Varone', voll: 'Restaurant Gilles Varone Savièse', ort: 'Savièse', welt: 'land', rahmen: 'buehne',
  foto: '/assets/img/haus-1200.webp', fotoAlt: 'Der Saal des Restaurants Gilles Varone am Abend, hinten die offene Küche', zeichen: '/assets/oberflaeche/kleid/varone-zeichen.svg', zeichenMass: 1,
  /* Namen der sieben Werkzeuge: nach dem Zweck (Werkzeug-Auftrag Punkt 3), bis Robert einen eigenen Namenssatz wählt. Die EINE Stelle; Dateien, Schlüssel und Adressen bleiben. */
  namen: { zentrale: 'Kontrollpanel', website: 'Website bearbeiten', karten: 'Karten & Preislisten', gaeste: 'Anfragen & Chat', marke: 'Markenbuch', besuche: 'Besucher', druck: 'Drucksachen & Feed' },
  wege: { zentrale: '/_werkzeuge/maison/', website: '/_werkzeuge/bureau/', karten: '/_werkzeuge/carte/', gaeste: '/_werkzeuge/reception/', marke: '/_werkzeuge/livre/', besuche: '/_werkzeuge/registre/', druck: '/_werkzeuge/imprimerie/' } };
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
