(()=>{
 const page=location.pathname.split('/').pop()||'index.html';
 document.querySelectorAll('.philosophy-audio-toggle').forEach(n=>n.remove());
 document.querySelectorAll('.philosophy-hero-video').forEach(v=>{v.muted=true;v.setAttribute('muted','')});
 const original=document.querySelector('.original-hero-page > div');if(original)Array.from(original.children).forEach(el=>{if(parseFloat(getComputedStyle(el).top)>1100)el.style.display='none';});
 function fit(){
  const w=document.documentElement.clientWidth,h=innerHeight,header=document.querySelector('.shop-header')?.offsetHeight||0,banner=document.querySelector('.ad-banner')?.offsetHeight||0;
  let width=Math.min(w*.86,1680);
  if(page==='index.html')width=Math.min(w*.94,1920);if(page==='graphics.html')width=w;
  document.documentElement.style.setProperty('--canvas-width',width+'px');document.documentElement.style.setProperty('--layout-scale',width/1920);
  document.documentElement.classList.add('layout-ready');
  const hero=document.querySelector('.original-product-hero');if(hero){hero.style.setProperty('--hero-scale',hero.clientWidth/1520);sizeHero();}
 }
 function sizeHero(){const hero=document.querySelector('.original-product-hero'),slot=hero?.querySelector('.original-purchase-slot');if(!slot)return;const delta=Math.max(0,slot.offsetHeight-230);hero.style.height=(1040+delta)*hero.clientWidth/1520+'px';const line=hero.querySelector('[data-node-id="1:388"],[data-node-id="1:770"],[data-node-id="1:1178"]');if(line)line.style.setProperty('top',(1020.96+delta)+'px','important');}
 const slot=document.querySelector('.original-purchase-slot');if(slot)new ResizeObserver(sizeHero).observe(slot);
 addEventListener('resize',fit);fit();
 document.querySelectorAll('video:not([data-camera])').forEach(v=>{v.muted=true;if(v.getBoundingClientRect().width){v.preload='auto';v.play().catch(()=>{});}else{v.pause();v.preload='none';}});
const ad=document.querySelector('.ad-banner');if(ad)new ResizeObserver(fit).observe(ad);
})();
