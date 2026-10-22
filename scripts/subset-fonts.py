"""Create small Latvian overlays while retaining full original font fallbacks.

Optional offline build tool: python3-fonttools + python3-brotli. Generated WOFF2
files and manifest are committed; the normal Node build needs neither package.
"""
from pathlib import Path
import hashlib
import json
from fontTools import subset, version
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent / "public" / "fonts"
characters = "ĀāČčĒēĢģĪīĶķĻļŅņŠšŪūŽž"
codepoints = {ord(c) for c in characters}
manifest = {"fontTools": version, "characters": characters, "fonts": []}
for family in ["inter", "roboto", "cormorant-garamond"]:
    source = root / (family + "-latin-ext.woff2")
    font = TTFont(source)
    assert codepoints.issubset(font.getBestCmap()), family + " lacks Latvian characters"
    options = subset.Options()
    options.flavor = "woff2"
    processor = subset.Subsetter(options=options)
    processor.populate(unicodes=codepoints)
    processor.subset(font)
    temporary = root / (family + "-latvian.tmp.woff2")
    font.save(temporary)
    data = temporary.read_bytes()
    name = family + "-latvian." + hashlib.sha256(data).hexdigest()[:12] + ".woff2"
    target = root / name
    temporary.replace(target)
    assert codepoints.issubset(TTFont(target).getBestCmap())
    manifest["fonts"].append({"family": family, "source": source.name, "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(), "file": name, "sourceBytes": source.stat().st_size, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
(root / "latvian-subsets.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(manifest, ensure_ascii=False, indent=2))
