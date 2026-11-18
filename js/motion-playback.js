/* Continuous, silent, non-interactive brand motion on ABOUT US and GRAPHICS. */
(()=>{
 'use strict';
 const videos=[...document.querySelectorAll('video.philosophy-hero-video,video.gfx-hero-video,video.motion-video,video.m-art')];
 if(!videos.length)return;
 function visible(v){return !!(v.getClientRects().length && v.getBoundingClientRect().width && document.visibilityState==='visible');}
 for(const v of videos){
  v.defaultMuted=true;v.muted=true;v.volume=0;v.autoplay=true;v.loop=true;v.playsInline=true;
  v.controls=false;v.disablePictureInPicture=true;v.disableRemotePlayback=true;
  v.removeAttribute('controls');
  for(const a of ['muted','autoplay','loop','playsinline','webkit-playsinline'])v.setAttribute(a,'');
  v.setAttribute('preload','auto');v.setAttribute('controlslist','nodownload nofullscreen noremoteplayback');
  v.preload='auto';
  let pending=false,lastAttempt=0;
  function start(){
   if(!visible(v)||pending||!v.paused)return;
   const now=performance.now();if(now-lastAttempt<350)return;lastAttempt=now;
   pending=true;
   try{const result=v.play();if(result&&result.then)result.catch(()=>{}).finally(()=>{pending=false});else pending=false}
   catch(_){pending=false}
  }
  for(const event of ['loadedmetadata','loadeddata','canplay','pause','stalled'])v.addEventListener(event,()=>{if(event==='pause'){}setTimeout(start,400)},{passive:true});
  window.addEventListener('pageshow',start,{passive:true});
  window.addEventListener('focus',start,{passive:true});
  window.addEventListener('resize',start,{passive:true});
  document.addEventListener('visibilitychange',start,{passive:true});
  document.addEventListener('pointerdown',start,{passive:true});
  requestAnimationFrame(()=>{start();setTimeout(start,650);setTimeout(start,2200)});
 }
})();
