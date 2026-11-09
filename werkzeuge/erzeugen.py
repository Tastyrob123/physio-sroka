# Erzeugt die Hilfsdateien der Werkzeuge (lokal, ohne externen Dienst):
#   qr/hannover.svg, qr/hemmingen.svg  QR-Codes für die Bewertungskarten (pip install qrcode)
#   zeichen.js                         das Zeichen aus ../media/zeichen.svg zum Einsetzen
#   uebungen-daten.js                  Kopie von ../daten/uebungen.json, falls die Seite per Doppelklick (file://) geöffnet wird
# Aufruf im Stamm des Repos: python3 werkzeuge/erzeugen.py
import json
import re
from pathlib import Path
import qrcode
import qrcode.image.svg

hier = Path(__file__).parent
stamm = hier.parent

ZIELE = {
    "hannover": "https://www.google.com/maps/search/?api=1&query=Physiotherapie%20Sylvia%20Sroka%20Dieterichsstra%C3%9Fe%2025%20Hannover",
    "hemmingen": "https://www.google.com/maps/search/?api=1&query=Physio%20Rosenpark%20Berliner%20Stra%C3%9Fe%2016%20Hemmingen",
}
for name, ziel in ZIELE.items():
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0, box_size=10,
                       image_factory=qrcode.image.svg.SvgPathImage)
    qr.add_data(ziel)
    qr.make(fit=True)
    svg = qr.make_image().to_string(encoding="unicode")
    svg = svg.replace('fill="#000000"', 'fill="#0e0d0b"')
    svg = re.sub(r'<svg width="[^"]+" height="[^"]+" ', '<svg shape-rendering="crispEdges" ', svg)
    (hier / "qr" / f"{name}.svg").write_text(svg)

zeichen = (stamm / "media/zeichen.svg").read_text().strip()
(hier / "zeichen.js").write_text("// Erzeugt von erzeugen.py aus ../media/zeichen.svg\nwindow.ZEICHEN = " + json.dumps(zeichen, ensure_ascii=False) + ";\n")

daten = json.loads((stamm / "daten/uebungen.json").read_text())
(hier / "uebungen-daten.js").write_text("// Erzeugt von erzeugen.py aus ../daten/uebungen.json (nur Ersatz für file://)\nwindow.UEBUNGEN_ERSATZ = " + json.dumps(daten, ensure_ascii=False) + ";\n")
print("erzeugt")
