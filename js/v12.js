
(()=> {
 const p=location.pathname.split('/').pop()||'index.html';
 if(!['basket.html','hammock.html','clip.html'].includes(p))return;
 function addDeliveryInfo(){
  const candidates=[...document.querySelectorAll('p,span,div')].filter(e=>e.children.length===0&&/이내 도착 예정/.test(e.textContent||''));
  const text=candidates.find(e=>e.textContent.length<60);
  if(!text || document.getElementById('kks-delivery-hint')) return;
  const parent=text.closest('[data-node-id]')||text.parentElement;
  if(!parent)return;
  const icon=document.createElement('button');
  icon.id='kks-delivery-hint';
  icon.type='button';
  icon.className='delivery-hint';
  icon.setAttribute('aria-label','배송 안내');
  icon.innerHTML='!<span class="delivery-tip" role="tooltip">배송 예정일은 지역 및 택배사 사정에 따라 달라질 수 있어요.</span>';
  icon.style.position='absolute';
  icon.style.left='calc(100% + 12px)';
  icon.style.top='50%';
  icon.style.transform='translateY(-50%)';
  parent.style.overflow='visible';parent.style.position='absolute';
  parent.append(icon);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addDeliveryInfo);else addDeliveryInfo();
})();
