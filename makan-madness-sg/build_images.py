#!/usr/bin/env python3
import json, urllib.request, urllib.parse, io, pathlib, time
from PIL import Image, ImageOps
root=pathlib.Path("makan-madness-sg")
sources=json.loads((root/"image-sources.json").read_text())
out=root/"images"
out.mkdir(parents=True,exist_ok=True)
manifest=[]
for item in sources:
    url="https://commons.wikimedia.org/wiki/Special:Redirect/file/"+urllib.parse.quote(item["filename"])
    request=urllib.request.Request(url,headers={"User-Agent":"SBA-MakanMadness/1.0 (https://rethinkingislam.net/sba/; image provenance retained)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request,timeout=35) as resp: raw=resp.read()
            break
        except Exception:
            if attempt==2: raise
            time.sleep(3)
    img=Image.open(io.BytesIO(raw)).convert("RGB")
    img=ImageOps.exif_transpose(img)
    img.thumbnail((960,720))
    path=out/(item["slug"]+".webp")
    img.save(path,"WEBP",quality=76,method=6)
    manifest.append({**item,"path":"/makan-madness-sg/images/"+path.name,"bytes":path.stat().st_size,"modified":"Resized and converted to WebP for web delivery"})
(root/"image-manifest.json").write_text(json.dumps({"app":"Makan Madness SG","images":manifest},ensure_ascii=False,indent=2)+"\n")
print("Published",len(manifest),"licensed images")
