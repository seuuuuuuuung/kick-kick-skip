// Non-anchor elements that act as links (Figma buttons / text) and the scroll-to-top button.
document.addEventListener('click', function (e) {
  var top = e.target.closest('[data-scroll-top]');
  if (top) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  var link = e.target.closest('[data-href]');
  if (link) window.location.href = link.getAttribute('data-href');
});
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  var link = e.target.closest && e.target.closest('[data-href]');
  if (link) window.location.href = link.getAttribute('data-href');
});


(function(){
  var cfg = {
    'basket.html': {base:59000, type:'basket', options:[['1w','1단 화이트',0],['1b','1단 블루',0],['2w','2단 화이트',55000],['2b','2단 블루',55000]]},
    'hammock.html': {base:19900, type:'simple', options:[['white','화이트',0],['blue','블루',0]]},
    'clip.html': {base:9900, type:'simple', options:[['yellow','옐로우',0],['blue','블루',0]]}
  };
  var page=(location.pathname.split('/').pop()||'index.html').toLowerCase(), c=cfg[page];

  function money(n){ return n.toLocaleString('ko-KR') + '원'; }
  function getEtaString(){
    var d = new Date();
    d.setDate(d.getDate() + 7);
    var days = ['일','월','화','수','목','금','토'];
    return (d.getMonth()+1) + '/' + d.getDate() + '(' + days[d.getDay()] + ')';
  }
  function optionHTML(){
    return '<option value="">옵션을 선택해주세요</option>' + c.options.map(function(o){
      return '<option value="' + o[0] + '" data-add="' + o[2] + '">' + o[1] + (o[2] ? ' (+' + money(o[2]) + ')' : '') + '</option>';
    }).join('');
  }
  function meshHTML(count){
    var out='';
    for(var i=1;i<=count;i++){
      out += '<select class="mesh-select" aria-label="세탁망 ' + i + ' 선택">'
           + '<option value="small">세탁망 ' + i + ' · 소형</option>'
           + '<option value="large">세탁망 ' + i + ' · 대형</option>'
           + '</select>';
    }
    return out;
  }
  function makeUI(mobile){
    var wrap=document.createElement('div');
    wrap.className=(mobile?'m-select purchase-ui purchase-ui--mobile':'purchase-ui desktop-purchase-ui');
    wrap.innerHTML=''
      + '<select class="product-option" aria-label="제품 옵션">' + optionHTML() + '</select>'
      + '<div class="mesh-options" hidden></div>'
      + (mobile ? '' : '<div class="desktop-total"><span>주문금액</span><strong>0원</strong></div><div class="action-row"><div class="qty-box"><span class="qty-value">1</span><span class="qty-buttons"><button type="button" class="qty-up" aria-label="수량 늘리기">⌃</button><button type="button" class="qty-down" aria-label="수량 줄이기">⌄</button></span></div><button type="button" class="buy-btn cart">장바구니</button><button type="button" class="buy-btn primary buy">바로 구매</button></div>');
    return wrap;
  }
  function bindUI(ui,totalEl,hooks){
    hooks = hooks || {};
    if(!totalEl) totalEl = ui.querySelector('.desktop-total strong');
    var opt = ui.querySelector('.product-option');
    var mesh = ui.querySelector('.mesh-options');
    var qty = 1;
    var qv = ui.querySelector('.qty-value');

    function currentPrice(){
      var selected = opt.selectedOptions && opt.selectedOptions[0];
      return c.base + (selected ? Number(selected.dataset.add || 0) : 0);
    }
    function hasOption(){ return !!opt.value; }
    function syncQty(){
      if(qv) qv.textContent = String(qty);
      if(typeof hooks.onQtyChange === 'function') hooks.onQtyChange(qty);
    }
    function update(){
      if(totalEl) totalEl.textContent = hasOption() ? money(currentPrice() * qty) : '0원';
    }
    function guardOption(){
      if(hasOption()) return true;
      alert('옵션을 먼저 선택해주세요.');
      return false;
    }
    function changeMesh(){
      if(c.type !== 'basket'){
        mesh.hidden = true;
        ui.classList.remove('basket-with-mesh','mesh-4');
        update();
        return;
      }
      if(!hasOption()){
        mesh.hidden = true;
        mesh.innerHTML = '';
        ui.classList.remove('basket-with-mesh','mesh-4');
        update();
        return;
      }
      var count = opt.value.charAt(0) === '2' ? 4 : 2;
      mesh.innerHTML = meshHTML(count);
      mesh.hidden = false;
      ui.classList.add('basket-with-mesh');
      ui.classList.toggle('mesh-4', count === 4);
      update();
    }
    function setQty(next){ qty = Math.max(1, next); syncQty(); update(); }
    function inc(){ if(!guardOption()) return; setQty(qty + 1); }
    function dec(){ if(!guardOption()) return; setQty(qty - 1); }

    opt.addEventListener('change', changeMesh);
    var upBtn = ui.querySelector('.qty-up');
    var downBtn = ui.querySelector('.qty-down');
    if(upBtn) upBtn.addEventListener('click', inc);
    if(downBtn) downBtn.addEventListener('click', dec);

    ui.querySelectorAll('.buy-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(!guardOption()) return;
        alert((btn.classList.contains('cart') ? '장바구니에 담았습니다.' : '구매 옵션을 확인했습니다.') + '\n총 ' + money(currentPrice() * qty));
      });
    });

    syncQty();
    update();
    return { setQty:setQty, inc:inc, dec:dec, hasOption:hasOption, update:update, optionEl:opt };
  }
  function addTooltip(icon, mobile){
    if(!icon) return;
    // Desktop Figma info icon already has its own absolute positioned 24px anchor.
    if(!mobile){
      var parent=icon.closest('[data-node-id]');
      if(!parent || parent.classList.contains('shipping-info-anchor')) return;
      parent.classList.add('shipping-info-anchor');
      parent.setAttribute('tabindex','0');
      parent.setAttribute('aria-label','배송 안내: 일부 지역은 배송 일정 및 추가 배송비가 상이할 수 있습니다.');
      var tip=document.createElement('span');
      tip.className='ship-tooltip';
      tip.setAttribute('role','tooltip');
      tip.textContent='일부 지역은 배송 일정 및 추가 배송비가 상이할 수 있습니다.';
      parent.appendChild(tip);
      return;
    }
    if(icon.closest('.ship-info-wrap')) return;
    var wrap=document.createElement('span');
    wrap.className='ship-info-wrap ship-info-wrap--mobile';
    wrap.tabIndex=0;
    icon.parentNode.insertBefore(wrap,icon);
    wrap.appendChild(icon);
    var info=document.createElement('span');
    info.className='ship-tooltip';
    info.setAttribute('role','tooltip');
    info.textContent='일부 지역은 배송 일정 및 추가 배송비가 상이할 수 있습니다.';
    wrap.appendChild(info);
  }
  function applyEtaText(scope){
    var eta = getEtaString();
    (scope || document).querySelectorAll('.m-eta span b').forEach(function(el){ el.textContent = eta; });
    // Update only the unique leaf paragraph inside the date row; never replace a parent with page contents.
    (scope || document).querySelectorAll('[data-node-id] p').forEach(function(p){
      if (p.closest('.m')) return;
      if (!p.textContent.includes('이내 도착 예정')) return;
      if (p.children.length > 2) return;
      var spans = p.querySelectorAll('span');
      if (spans.length === 2 && spans[1].textContent.includes('이내 도착 예정')) {
        spans[0].textContent = eta + ' ';
      }
    });
  }
  function hideDesktopStatics(root){
    if(!root) return;
    // Hide only the previous static purchase controls, not the product navigation.
    var idsToHide={
      'basket.html':[357,358,364,369,370,372,373,374,381,382,384,385,386,387,389],
      'hammock.html':[1149,1150,1154,1159,1160,1162,1163,1164,1165,1171,1172,1174,1175,1176,1177,1179],
      'clip.html':[739,740,746,751,752,754,755,756,757,763,764,766,767,768,769,771]
    };
    var ids=idsToHide[page]||[];
    root.querySelectorAll('[data-node-id]').forEach(function(n){
      var id=Number((n.getAttribute('data-node-id')||'0:0').split(':').pop());
      if(ids.indexOf(id)!==-1)n.style.visibility='hidden';
    });
    // Old select arrow must be hidden, but keep the delivery bar and info icon.
    root.querySelectorAll('[data-node-id]').forEach(function(n){
      if(n.querySelectorAll('[data-node-id]').length) return;
      if(n.textContent.trim()==='옵션' || n.textContent.trim()==='옵션 2개중 택1')n.style.visibility='hidden';
    });
  }

  applyEtaText(document);

  if(c){
    document.querySelectorAll('.m-buy').forEach(function(sec){
      var old = sec.querySelector('.m-select');
      if(!old) return;
      var ui = makeUI(true);
      old.replaceWith(ui);
      var total = sec.querySelector('.m-total strong');
      var actions = sec.querySelector('.m-actions');
      if(actions){
        actions.classList.add('purchase-actions');
        actions.innerHTML = '<div class="qty-box purchase-ui"><span class="qty-value">1</span><span class="qty-buttons"><button type="button" class="m-up" aria-label="수량 늘리기">⌃</button><button type="button" class="m-down" aria-label="수량 줄이기">⌄</button></span></div><button type="button" class="buy-btn cart purchase-ui">장바구니</button><button type="button" class="buy-btn primary buy purchase-ui">바로 구매</button>';
      }
      var qtyMirror = actions ? actions.querySelector('.qty-value') : null;
      var state = bindUI(ui, total, {
        onQtyChange: function(qty){ if(qtyMirror) qtyMirror.textContent = String(qty); }
      });
      if(actions){
        actions.querySelector('.m-up').addEventListener('click', state.inc);
        actions.querySelector('.m-down').addEventListener('click', state.dec);
        actions.querySelector('.cart').addEventListener('click', function(){
          if(!state.hasOption()) return alert('옵션을 먼저 선택해주세요.');
          alert('장바구니에 담았습니다.\n총 ' + total.textContent);
        });
        actions.querySelector('.buy').addEventListener('click', function(){
          if(!state.hasOption()) return alert('옵션을 먼저 선택해주세요.');
          alert('구매 옵션을 확인했습니다.\n총 ' + total.textContent);
        });
      }
      var eta = sec.querySelector('.m-eta');
      if(eta){
        var icon = eta.querySelector('img:last-child');
        if(icon) addTooltip(icon, true);
      }
    });

    var desktopTotalId={'basket.html':'1:358','hammock.html':'1:1150','clip.html':'1:740'}[page];
    var totalDesktop = Array.from(document.querySelectorAll('[data-node-id]')).find(function(x){return x.getAttribute('data-node-id')===desktopTotalId;});
    var root = totalDesktop && totalDesktop.closest('.relative');
    if(root){
      hideDesktopStatics(root);
      root.querySelectorAll('img[src="assets/ce41e5e4d6cc.svg"]').forEach(function(img){
        var positioned=img.closest('[data-node-id]');
        if(positioned && positioned !== root)positioned.style.visibility='hidden';
      });
      var dui = makeUI(false);
      root.appendChild(dui);
      bindUI(dui, null);
      var infoIcon = Array.from(root.querySelectorAll('img[src*="07ce3954eccb.svg"]')).find(function(img){ return !img.closest('.m'); });
      if(infoIcon) addTooltip(infoIcon, false);
      applyEtaText(root);
    }
  }
})();
