#!/usr/bin/env python3
"""Publish only successfully downloaded, independently sourced food photographs."""
import json, urllib.request, urllib.parse, io, pathlib, time, sys
from PIL import Image, ImageOps
root=pathlib.Path("makan-madness-sg")
sources=json.loads((root/"image-sources.json").read_text())
out=root/"images";out.mkdir(parents=True,exist_ok=True)
manifest=[];failures=[]
for item in sources:
    path=out/(item["slug"]+".webp")
    try:
        if not path.exists():
            url="https://commons.wikimedia.org/wiki/Special:Redirect/file/"+urllib.parse.quote(item["filename"])
            req=urllib.request.Request(url,headers={"User-Agent":"SBA-MakanMadness/1.0 (https://rethinkingislam.net/sba/)"})
            last_error=None
            for attempt in range(3):
                try:
                    with urllib.request.urlopen(req,timeout=35) as resp:
                        raw=resp.read(20_000_000)
                    im=Image.open(io.BytesIO(raw))
                    im=ImageOps.exif_transpose(im).convert("RGB")
                    im.thumbnail((960,720))
                    im.save(path,"WEBP",quality=76,method=6)
                    last_error=None
                    break
                except Exception as exc:
                    last_error=str(exc)
                    time.sleep(2)
            if last_error: raise RuntimeError(last_error)
        # An existing file is included only if it can actually be decoded.
        with Image.open(path) as check: check.verify()
        manifest.append({**item,"path":"/makan-madness-sg/images/"+path.name,"bytes":path.stat().st_size,"modified":"Resized and converted to WebP for web delivery"})
    except Exception as exc:
        failures.append({"dish":item["dish"],"filename":item["filename"],"error":str(exc)[:250]})
        print("SKIP",item["dish"],str(exc)[:150],file=sys.stderr)
# The five scarce Eurasian dishes use distinctly labelled original illustrations, never passed off as photos.
illustrations = [
    ("curry-debal", "Curry Debal"),
    ("beef-smore", "Beef Smore"),
    ("pang-susi", "Pang Susi"),
    ("feng", "Feng"),
    ("breudher", "Breudher"),
]
for slug, dish in illustrations:
    svg = out / (slug + ".svg")
    if svg.exists():
        manifest.append({"slug":slug,"dish":dish,"path":"/makan-madness-sg/images/"+svg.name,
            "author":"Strategic Bridge Asia","license":"Original illustration",
            "source":"https://rethinkingislam.net/sba/makan-madness-sg/",
            "license_url":None,"bytes":svg.stat().st_size,
            "modified":"Original SVG illustration; not a documentary food photograph",
            "image_type":"illustration"})
(root/"image-manifest.json").write_text(json.dumps({"app":"Makan Madness SG","images":manifest},ensure_ascii=False,indent=2)+"\n")
(root/"image-build-report.json").write_text(json.dumps({"selected":len(sources),"published":len(manifest),"failures":failures},ensure_ascii=False,indent=2)+"\n")
print("Published",len(manifest),"of",len(sources),"sources; failures",len(failures))
