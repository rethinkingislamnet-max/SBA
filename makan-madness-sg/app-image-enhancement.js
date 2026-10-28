/* Makan Madness SG, hosted image overlay. External assets only. */
(()=>{"use strict";
const CDN="https://sba-8ul.pages.dev";
const normalize=s=>(s||"").trim().toLocaleLowerCase("en");
function init(){
 const root=document.getElementById("makan-sg");if(!root)return;
 fetch(CDN+"/makan-madness-sg/image-manifest.json",{mode:"cors",cache:"no-cache"})
 .then(r=>{if(!r.ok)throw Error("Cannot fetch image manifest");return r.json()})
 .then(data=>{
  const records=new Map((data.images||[]).filter(r=>r.dish&&r.path).map(r=>[normalize(r.dish),r]));
  function putImage(slot,record){
   if(!slot)return;
   let img=slot.querySelector("img[data-sba-photo]");
   if(!img){img=document.createElement("img");img.setAttribute("data-sba-photo","1");slot.appendChild(img)}
   img.src=CDN+record.path;
   img.alt=record.dish+" food photograph";
   img.loading="lazy";img.decoding="async";img.width=480;img.height=360;
   img.addEventListener("error",()=>{img.remove();slot.classList.remove("sba-has-photo")},{once:true});
   slot.classList.add("sba-has-photo");
  }
  function updateCards(){
   root.querySelectorAll(".foodgrid .card").forEach(card=>{
    const record=records.get(normalize(card.querySelector(".cb strong")?.textContent));if(!record)return;
    const slot=card.querySelector(".foodpic");if(!slot)return;
    putImage(slot,record);
    // Retain original images as fallback, but put the verified photo above them.
    let credit=card.querySelector(".sba-food-photo-credit");
    if(!credit){credit=document.createElement("div");credit.className="sba-food-photo-credit";card.appendChild(credit)}
    credit.textContent="Photo: "+record.author+" · "+record.license;
    let source=credit.querySelector("a");
    if(!source){source=document.createElement("a");source.target="_blank";source.rel="noopener noreferrer";credit.appendChild(document.createTextNode(" · "));credit.appendChild(source)}
    source.href=record.source;source.textContent="Credit";
   });
  }
  updateCards();
  const overlay=root.querySelector("#dishOverlay");
  if(overlay){
   let lastName="";
   const updateOverlay=()=>{
    if(overlay.hidden)return;
    const name=normalize(overlay.querySelector("#detailName")?.textContent);
    if(name===lastName)return;
    lastName=name;
    const slot=overlay.querySelector(".dialogpic");
    const oldPhoto=slot?.querySelector("img[data-sba-photo]");
    const record=records.get(name);
    if(!record){oldPhoto?.remove();slot?.classList.remove("sba-has-photo");return}
    putImage(slot,record);
   };
   const observer=new MutationObserver(updateOverlay);
   observer.observe(overlay,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["hidden"]});
   updateOverlay();
  }
 }).catch(()=>{/* On failure original game and cards continue normally. */});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
