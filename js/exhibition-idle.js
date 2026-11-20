/* Reset the shared exhibition browser after 30 seconds without visitor input. */
(()=>{
  'use strict';
  const timeout=30000;
  let timer,lastMove=0,deadline=0;
  function returnHome(){
    const page=location.pathname.split('/').pop();
    if(!page||page==='index.html'){
      window.scrollTo(0,0);
      arm();
    }else location.replace(new URL('./',location.href).href);
  }
  window.KKS_IDLE_REMAINING=()=>Math.max(0,Math.ceil((deadline-Date.now())/1000));
  function arm(){
    clearTimeout(timer);
    deadline=Date.now()+timeout;
    timer=setTimeout(returnHome,timeout);
    dispatchEvent(new Event('kks-idle-activity'));
  }
  function moved(){
    const now=Date.now();
    if(now-lastMove<250)return;
    lastMove=now;arm();
  }
  for(const event of ['pointerdown','keydown','wheel','scroll','touchstart'])
    addEventListener(event,arm,{passive:true});
  addEventListener('pointermove',moved,{passive:true});
  addEventListener('touchmove',moved,{passive:true});
  addEventListener('pageshow',arm);
  arm();
})();
