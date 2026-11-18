/* Original Figma related-product art is included in each product HTML; only scale it to viewport. */
(()=>{for(const frame of document.querySelectorAll('.kks-related-viewport')){const apply=()=>frame.style.setProperty('--related-scale',String(frame.clientWidth/1920));if(window.ResizeObserver)new ResizeObserver(apply).observe(frame);apply();}})();
