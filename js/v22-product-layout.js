/* Expand only the supplied Figma right-side product text/control artwork.
   The left product photo, hand-drawn divider, and other page sections stay unchanged. */
(()=> {
  const product=document.querySelector('.product-page[data-product]')?.dataset.product;
  const ranges={
    basket:{start:357,end:392,skip:[388]},
    hammock:{start:1149,end:1188,skip:[1178]},
    clip:{start:739,end:774,skip:[770]}
  };
  const cfg=ranges[product];
  if(!cfg)return;
  const root=document.querySelector('.original-product-hero .page > [data-name]');
  if(!root || root.querySelector('.kks-product-info-expanded'))return;
  const nodes=[...root.children].filter(el=>{
    const id=Number((el.getAttribute('data-node-id')||'').split(':').pop());
    return Number.isInteger(id)&&id>=cfg.start&&id<=cfg.end&&!cfg.skip.includes(id);
  });
  if(!nodes.length)return;
  const group=document.createElement('div');
  group.className='kks-product-info-expanded';
  group.setAttribute('data-kks-product-info','');
  root.appendChild(group);
  nodes.forEach(node=>group.appendChild(node));
})();
