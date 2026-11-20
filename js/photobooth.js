'use strict';
(()=>{
const app=document.querySelector('#app');if(!app||!['photo','photobooth'].includes(app.dataset.view))return;
const $=s=>app.querySelector(s),asset=n=>'assets/v08/'+n,API=(window.KKS_PHOTO_API||'').replace(/\/$/,''),images=new Map();
let stream,blob,url,generation=0,counting=false,timer,controller;
document.body.classList.add('single-photo-page');app.className='single-photo-app';
function stop(){stream?.getTracks().forEach(t=>t.stop());stream=null}
function clean(){generation++;stop();clearInterval(timer);controller?.abort();counting=false}
function img(name){if(!images.has(name))images.set(name,new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('frame'));i.src=window.KKS_FRAME_ASSETS?.[name]||asset(name)}));return images.get(name)}
function message(text){const d=document.createElement('dialog');d.className='dialog';const p=document.createElement('p');p.textContent=text;d.append(p);const b=document.createElement('button');b.textContent='확인';b.onclick=()=>d.close();d.append(b);d.onclose=()=>d.remove();document.body.append(d);d.showModal()}
function shell(body,cls=''){app.innerHTML=`<section class="booth-board ${cls}"><a class="booth-home" href="./"><img class="booth-home-arrow" src="assets/v08/photobooth-home-arrow.svg" alt="" aria-hidden="true"><span>HOME</span></a><h1>LAUNDRY PHOTO BOOTH</h1>${body}</section>`}
async function capture(){clean();const run=generation;shell(`<div class="booth-picture"><video data-camera autoplay muted playsinline aria-label="카메라 미리보기"></video><img class="metal" src="${asset('washer.png')}" alt=""><img class="frame-line" src="${asset('photobooth_camera line.svg')}" alt=""><img class="bubbles" src="${asset('bubbles.svg')}" alt=""><img class="tape" src="${asset('tape.svg')}" alt=""><span class="shot-count" aria-live="assertive"></span><p class="camera-message">카메라 연결 중…</p></div><img class="booth-character" src="${asset('camera_kikip.svg')}" alt="사진을 찍는 키킵"><div class="washer-doodle" aria-hidden="true"></div><button class="booth-action" disabled>촬영하기</button><p class="booth-caption">편하게 포즈를 취해주세요. 3초 뒤 한 장을 촬영해요.</p><label class="photo-native" hidden>카메라 대신 사진 선택 <input type="file" accept="image/*" capture="user" aria-label="사진 선택"></label>`);$('.booth-action').onclick=take;$('.photo-native input').onchange=importPhoto;
try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('secure');const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}}});if(run!==generation){s.getTracks().forEach(t=>t.stop());return}stream=s;const v=$('video');v.srcObject=s;await v.play();await new Promise((ok,no)=>{let n=0;function check(){if(run!==generation)return no(new Error('cancel'));if(v.readyState>=2&&v.videoWidth)return ok();if(n++>100)return no(new Error('camera'));setTimeout(check,100)}check()});await img('washer.png');if(run!==generation)return;$('.camera-message').hidden=true;$('.booth-action').disabled=false}catch(e){if(run!==generation)return;$('.camera-message').textContent=e.name==='NotAllowedError'?'브라우저 주소창의 사이트 설정에서 카메라를 항상 허용한 뒤 다시 열어주세요.':'카메라를 연결할 수 없어요. 사진을 선택해 사용할 수도 있어요.';$('.photo-native').hidden=false}}
async function compose(source,w,h,mirror){
 await document.fonts.ready;
 const [metal,line,mask,tape,bubbles,logo]=await Promise.all(['washer.png','photobooth_camera line.svg','photobooth-clip.svg','tape.svg','bubbles.svg','logo cha.svg'].map(img));
 const c=document.createElement('canvas');c.width=1224;c.height=1632;
 const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,c.width,c.height);
 const left=40,top=120,fw=1144,fh=1040,ratio=fw/fh;
 const layer=document.createElement('canvas');layer.width=c.width;layer.height=c.height;
 const g=layer.getContext('2d');
 let sw=w,sh=w/ratio;if(sh>h){sh=h;sw=h*ratio}
 g.save();
 if(mirror){g.translate(left*2+fw,0);g.scale(-1,1)}
 g.drawImage(source,(w-sw)/2,(h-sh)/2,sw,sh,left,top,fw,fh);
 g.restore();
 const crop=Math.max(0,(metal.height-metal.width/ratio)/2);
 g.drawImage(metal,0,crop,metal.width,metal.height-2*crop,left,top,fw,fh);
 // Exactly the same hand-drawn path masks the on-screen metal and exported JPEG.
 // This prevents the metal or camera from leaking past the imperfect black border.
 g.globalCompositeOperation='destination-in';
 g.drawImage(mask,left,top,fw,fh);
 g.globalCompositeOperation='source-over';
 x.drawImage(layer,0,0);
 x.drawImage(line,left,top,fw,fh);
 x.drawImage(bubbles,left,top,fw,fh);
 x.drawImage(tape,440,65,350,144);
 x.drawImage(logo,514,1290,196,280);
 // Printed-photo date: captured day's date, not a placeholder.
 const capturedAt=new Date();
 const shotDate=`${capturedAt.getFullYear()}.${String(capturedAt.getMonth()+1).padStart(2,'0')}.${String(capturedAt.getDate()).padStart(2,'0')}`;
 x.fillStyle='#111';x.textAlign='right';x.textBaseline='alphabetic';
 x.font='22px Arial, sans-serif';x.fillText(shotDate,1170,1574);

 const next=await new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('encode')),10000);c.toBlob(b=>{clearTimeout(t);b?ok(b):no(new Error('encode'))},'image/jpeg',.94)});
 if(url)URL.revokeObjectURL(url);blob=next;url=URL.createObjectURL(blob);
}
async function take(){if(counting||!stream)return;counting=true;const run=generation;$('.booth-action').disabled=true;try{for(let n=3;n>0;n--){if(run!==generation)return;$('.shot-count').textContent=n;await new Promise(r=>setTimeout(r,1000))}if(run!==generation)return;const v=$('video');if(!v.videoWidth)throw new Error();await compose(v,v.videoWidth,v.videoHeight,true);if(run!==generation)return;stop();result()}catch{if(run===generation){$('.shot-count').textContent='';$('.booth-action').disabled=false;message('사진 저장에 실패했어요. 다시 촬영해주세요.')}}finally{counting=false}}
async function importPhoto(e){const f=e.target.files[0];if(!f)return;const run=++generation;stop();const src=URL.createObjectURL(f);try{const i=new Image();i.src=src;await i.decode();await compose(i,i.naturalWidth,i.naturalHeight,false);if(run===generation)result()}catch{message('JPG 또는 PNG 사진을 다시 선택해주세요.')}finally{URL.revokeObjectURL(src)}}
function result(){shell(`<div class="result-character" aria-hidden="true"></div><div class="result-picture"><img src="${url}" alt="촬영된 세탁기 프레임 사진"></div><div class="result-timer" aria-live="off">30 SEC</div><aside class="qr-panel"><p>QR코드를 찍어<br>사진을 다운로드 하세요!</p><div id="qr-status" role="status">QR 준비 중…</div></aside><a class="booth-action booth-return-home" href="./">돌아가기</a>`,'is-result');clearInterval(timer);function tick(){const t=$('.result-timer');if(t)t.textContent=(window.KKS_IDLE_REMAINING?.()??30)+' SEC'}tick();timer=setInterval(tick,250);upload();}
async function uploadSupabase(){
 const cfg=window.KKS_SUPABASE;
 if(!cfg?.url||!cfg?.anonKey)throw new Error('cloud-not-configured');
 const base=cfg.url.replace(/\/$/,'');
 if(!/^https:\/\//.test(base))throw new Error('cloud-https-required');
 const bucket=cfg.bucket||'photobooth';
 if(!/^[a-zA-Z0-9_-]+$/.test(bucket))throw new Error('invalid-bucket');
 const id=crypto.randomUUID().replace(/-/g,'')+crypto.randomUUID().replace(/-/g,'').slice(0,16);
 const res=await fetch(`${base}/storage/v1/object/${bucket}/${id}.jpg`,{
  method:'POST',headers:{'apikey':cfg.anonKey,'Content-Type':'image/jpeg','x-upsert':'false','cache-control':'3600'},body:blob,signal:controller.signal
 });
 if(!res.ok){const detail=await res.text().catch(()=>'');throw new Error('cloud-upload-'+res.status+': '+detail.slice(0,240));}
 const target=new URL('photo.html',location.href);
 target.searchParams.set('id',id);
 return {id,url:target.href};
}
async function upload(){const run=generation;controller?.abort();controller=new AbortController();const t=setTimeout(()=>controller.abort(),20000);try{let data;
if(window.KKS_SUPABASE?.url && window.KKS_SUPABASE?.anonKey){
 data=await uploadSupabase();
}else{
 const image=await new Promise((ok,no)=>{const f=new FileReader();f.onload=()=>ok(f.result);f.onerror=no;f.readAsDataURL(blob)});
 const r=await fetch(API+'/api/photos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image}),signal:controller.signal});
 if(!r.ok)throw new Error('server-upload');
 data=await r.json();
}
if(!/^[a-f0-9]{48}$/.test(data.id))throw new Error('invalid-id');
const target=new URL(data.url);
if(!['http:','https:'].includes(target.protocol)||['localhost','127.0.0.1','[::1]'].includes(target.hostname))throw new Error('non-public-url');
if(run!==generation)return;const qr=qrcode(0,'M');qr.addData(target.href);qr.make();const old=$('#qr-status');const i=new Image();i.className='download-qr';i.src=qr.createDataURL(5,20);i.alt='촬영한 사진을 받는 QR 코드';old.replaceWith(i)}catch(error){console.error('Photobooth QR upload failed:',error);if(run!==generation)return;const el=$('#qr-status');if(el){el.className='qr-error';el.innerHTML='QR 연결에 실패했어요.<br>관리자에게 알려주세요.<br><button id="retry-upload">다시 연결</button> <button id="local-save">사진 저장</button>';$('#retry-upload').onclick=upload;$('#local-save').onclick=()=>save()}}finally{clearTimeout(t)}}
async function share(){if(!blob)return;const file=new File([blob],'KICK_KICK_SKIP_PHOTO.jpg',{type:'image/jpeg'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'LAUNDRY PHOTO BOOTH'})}catch(e){if(e.name!=='AbortError')message('사진 다운로드를 이용해주세요.')}}else{save();message('사진을 다운로드했어요. 사진 앱 또는 다운로드 폴더에서 확인해주세요.')}}
function save(){const a=document.createElement('a');a.href=url;a.download='KICK_KICK_SKIP_PHOTO.jpg';document.body.append(a);a.click();a.remove()}
async function receive(){document.body.classList.add('photo-receipt-page');app.innerHTML='<p class="photo-empty" role="status">사진을 불러오고 있어요…</p>';const id=new URLSearchParams(location.search).get('id');try{if(!/^[a-f0-9]{48}$/.test(id||''))throw new Error();const cfg=window.KKS_SUPABASE;const r=cfg?.url&&cfg?.anonKey?await fetch(`${cfg.url.replace(/\/$/,'')}/storage/v1/object/public/${encodeURIComponent(cfg.bucket||'photobooth')}/${id}.jpg`):await fetch(API+'/api/photos/'+id);if(!r.ok)throw new Error();blob=await r.blob();if(!blob.type.startsWith('image/'))throw new Error();url=URL.createObjectURL(blob);app.innerHTML=`<section class="receipt"><img class="peek-character" src="assets/v08/photomobile_kikip.svg" alt="" aria-hidden="true"><h1>LAUNDRY<br>PHOTO BOOTH</h1><div class="receipt-photo"><img src="${url}" alt="내 세탁기 프레임 사진"></div><img class="cloths" src="${asset('cloths.svg')}" alt=""><p class="receipt-help">아이폰에서는 공유 메뉴에서 ‘이미지 저장’을 선택해주세요.<br>사진은 촬영 후 약 24시간 뒤 자동 삭제돼요.</p><div class="receipt-actions"><button class="download">사진 다운로드</button><button class="share">공유하기</button></div></section>`;$('.download').onclick=async()=>{if(/iPhone|iPad|iPod/.test(navigator.userAgent)&&navigator.canShare?.({files:[new File([blob],'KICK_KICK_SKIP_PHOTO.jpg',{type:'image/jpeg'})]}))await share();else save()};$('.share').onclick=share}catch{app.innerHTML='<div class="photo-empty"><h1>사진을 찾을 수 없어요.</h1><p>촬영 후 받은 QR을 다시 스캔해주세요.<br>보관 기간이 지났거나 링크에 문제가 있을 수 있어요.</p><a href="./">HOME</a></div>'}}
addEventListener('pagehide',clean);if(app.dataset.view==='photo')receive();else capture();
})();
