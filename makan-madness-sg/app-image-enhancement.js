/* SBA Makan Madness SG image enhancement: version 2. Requires a container with id makan-sg. */
(()=>{ "use strict";
 const BASE="https://sba-8ul.pages.dev";
 const MANIFEST=BASE+"/makan-madness-sg/image-manifest.json";
 function setup(){
  const root=document.getElementById("makan-sg");if(!root)return;
  fetch(MANIFEST,{mode:"cors"}).then(r=>{if(!r.ok)throw Error("Image list inaccessible");return r.json()}).then(d=>{
    const entries=new Map((d.images||[]).filter(x=>x.path&&x.dish).map(x=>[x.dish.toLocaleLowerCase("en"),x]));
    const cards=[...root.querySelectorAll(".foodgrid .card")];
    cards.forEach(c=>{
      const name=c.querySelector(".cb strong")?.textContent?.trim().toLocaleLowerCase("en");
      const entry=entries.get(name);if(!entry)return;
      const slot=c.querySelector(".foodpic");if(!slot||slot.querySelector("img"))return;
      const im=document.createElement("img");im.src=BASE+entry.path;im.alt=entry.dish+" Singapore food photograph";im.loading="lazy";im.decoding="async";im.width=480;im.height=360;
      im.addEventListener("error",()=>im.remove(),{once:true});
      slot.append(im);
      const credit=document.createElement("span");credit.className="sba-food-photo-credit";
      credit.textContent="Photo: "+entry.author+" · "+entry.license;
      c.append(credit);
    });
    // Overlay photos may be populated by the original application asynchronously.
    const overlay=root.querySelector("#dishOverlay");
    if(overlay){const observer=new MutationObserver(()=>{
      const name=overlay.querySelector("#detailName")?.textContent?.trim().toLocaleLowerCase("en");
      const entry=entries.get(name);if(!entry)return;
      const slot=overlay.querySelector(".dialogpic");if(!slot)return;
      let im=slot.querySelector("img[data-sba-food-image]");
      if(!im){im=document.createElement("img");im.dataset.sbaFoodImage="1";im.loading="lazy";im.decoding="async";slot.append(im);}
      const url=BASE+entry.path;if(im.src!==url){im.src=url;im.alt=entry.dish;}
    });observer.observe(overlay,{childList:true,subtree:true,characterData:true});}
  }).catch(()=>{ /* Keep existing dish cards functional on network failure. */ });
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();
