const K='mybooks-v1',Y=new Date().getFullYear(),$=s=>document.querySelector(s);
let D=JSON.parse(localStorage.getItem(K)||'null')||{fr:[]},editing=false,lastSeries=null;
const save=()=>{localStorage.setItem(K,JSON.stringify(D));render()},uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>'&#'+m.charCodeAt(0)+';');
const cover=b=>b.cover?`<div class="cv" style="background-image:url('${esc(b.cover)}')"></div>`:'<div class="cv">📖</div>';
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),1600)}
const allBooks=()=>D.fr.flatMap(f=>f.series.flatMap(s=>s.books));
const prog=bs=>[bs.filter(b=>b.read).length,bs.length];
const bar=(a,n)=>`<div class="bar"><i style="width:${n?a/n*100:0}%"></i></div>`;
function find(id){for(const f of D.fr){if(f.id==id)return{f};for(const s of f.series){if(s.id==id)return{f,s};const i=s.books.findIndex(b=>b.id==id);if(i>=0)return{f,s,b:s.books[i],i}}}return{}}
function render(){
 $('#yr').textContent=Y;const all=allBooks();
 $('#tA').textContent=all.filter(b=>b.read).length;$('#tY').textContent=all.filter(b=>b.read&&new Date(b.read).getFullYear()==Y).length;
 $('#home').classList.toggle('editing',editing);$('#editBtn').textContent=editing?'Done':'Edit';
 $('#lib').innerHTML=D.fr.length?D.fr.map(f=>{const[a,n]=prog(f.series.flatMap(s=>s.books));
 return `<div class="fr ${f.open?'open':''}"><div class="row" data-tog="${f.id}"><span class="chev">▶</span><div class="t"><b>${esc(f.name)}</b><small>${f.series.length} series</small>${bar(a,n)}</div><span class="cnt">${a}/${n}</span>
 <span class="ed"><button data-a="up" data-id="${f.id}">↑</button><button data-a="ren" data-id="${f.id}">✎</button><button class="x" data-a="del" data-id="${f.id}">✕</button></span></div><div class="kids">
 ${f.series.map(s=>{const[a,n]=prog(s.books);return `<div class="se ${s.open?'open':''}"><div class="row" data-tog="${s.id}"><span class="chev">▶</span><div class="t"><b>${esc(s.name)}</b>${bar(a,n)}</div><span class="cnt">${a}/${n}</span>
 <span class="ed"><button data-a="up" data-id="${s.id}">↑</button><button data-a="ren" data-id="${s.id}">✎</button><button class="x" data-a="del" data-id="${s.id}">✕</button></span></div><div class="kids">
 ${s.books.map(b=>`<div class="bk">${cover(b)}<div class="t"><b>${esc(b.title)}</b><small>${esc(b.author||'')}</small></div><span class="ed"><button data-a="up" data-id="${b.id}">↑</button><button data-a="ren" data-id="${b.id}">✎</button><button class="x" data-a="del" data-id="${b.id}">✕</button></span><button class="ck ${b.read?'on':''}" data-ck="${b.id}">${b.read?'✓':''}</button></div>`).join('')}
 <div class="addb"><button class="lnk" data-a="addbook" data-id="${s.id}">＋ Add book</button></div></div></div>`}).join('')}
 <div class="addb"><button class="lnk" data-a="addser" data-id="${f.id}">＋ Add series</button></div></div></div>`}).join(''):'<div class="empty">No books yet.<br>Search for a series or add one by hand.</div>'}
document.addEventListener('click',e=>{const t=e.target.closest('[data-ck],[data-a],[data-tog],nav button');if(!t)return;
 if(t.dataset.t){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b==t));$('#home').hidden=t.dataset.t!='home';$('#search').hidden=t.dataset.t!='search';if(t.dataset.t=='search')$('#q').focus();return}
 if(t.dataset.ck){const{b}=find(t.dataset.ck);b.read=b.read?null:Date.now();navigator.vibrate&&navigator.vibrate(10);save();if(b.read)toast('📚 Nice! Book counted');return}
 if(t.dataset.a){e.stopPropagation();act(t.dataset.a,t.dataset.id);return}
 if(t.dataset.tog){const x=find(t.dataset.tog);(x.s||x.f).open=!(x.s||x.f).open;save()}});
function act(a,id){const{f,s,b,i}=find(id);const o=b||s||f,arr=b?s.books:s?f.series:D.fr,ix=arr.indexOf(o);
 if(a=='up'&&ix>0){arr.splice(ix,1);arr.splice(ix-1,0,o);save()}
 if(a=='ren'){const n=prompt('New name',o.title||o.name);if(n){b?o.title=n:o.name=n;save()}}
 if(a=='del'&&confirm('Remove "'+(o.title||o.name)+'"?')){arr.splice(ix,1);save()}
 if(a=='addbook'){const n=prompt('Book title');if(n){s.books.push({id:uid(),title:n});save()}}
 if(a=='addser'){const n=prompt('Series name');if(n){f.series.push({id:uid(),name:n,open:true,books:[]});save()}}}
$('#editBtn').onclick=()=>{editing=!editing;render()};
// dialogs
function pickTarget(title,books,defF,defS){
 $('#dc').innerHTML=`<h2>${esc(title)}</h2><p class="sub" style="margin:6px 0 10px">${books.length} book${books.length>1?'s':''}</p>
 <label class="sub">Franchise</label><select id="pf"><option value="">＋ New franchise…</option>${D.fr.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('')}</select>
 <input id="pfn" placeholder="New franchise name" value="${esc(defF)}"><label class="sub">Series</label><input id="psn" value="${esc(defS)}" placeholder="Series name">
 <div class="btns"><button id="pc">Cancel</button><button class="pri" id="po">Add</button></div>`;
 const pf=$('#pf');pf.onchange=()=>$('#pfn').hidden=!!pf.value;$('#pc').onclick=()=>$('#dlg').close();
 $('#po').onclick=()=>{let f=D.fr.find(x=>x.id==pf.value);if(!f){f={id:uid(),name:$('#pfn').value||defS||'My books',open:true,series:[]};D.fr.push(f)}
  const sn=$('#psn').value||'Books';let s=f.series.find(x=>x.name==sn);if(!s){s={id:uid(),name:sn,open:true,books:[]};f.series.push(s)}
  books.forEach(b=>{if(!s.books.some(x=>x.title.toLowerCase()==b.title.toLowerCase()))s.books.push({id:uid(),...b})});f.open=true;s.open=true;save();$('#dlg').close();toast('Added to '+f.name)};
 $('#dlg').showModal()}
$('#manBtn').onclick=()=>{const t=prompt('Book title');if(t)pickTarget(t,[{title:t,author:prompt('Author (optional)')||''}],'My books','Books')};
// search
const OL='https://openlibrary.org/search.json',cov=i=>i?`https://covers.openlibrary.org/b/id/${i}-M.jpg`:'';
const olBook=d=>({title:d.title,author:(d.author_name||[])[0]||'',cover:cov(d.cover_i),year:d.first_publish_year,pos:parseFloat((d.series_position||[])[0])});
async function olSearch(q){const r=await fetch(`${OL}?q=${encodeURIComponent(q)}&fields=title,author_name,cover_i,first_publish_year,series_name,series_position&limit=30`);if(!r.ok)throw 0;return (await r.json()).docs}
async function gbSearch(q){const r=await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`);const j=await r.json();
 return (j.items||[]).map(i=>({title:i.volumeInfo.title,author:(i.volumeInfo.authors||[])[0]||'',cover:(i.volumeInfo.imageLinks?.thumbnail||'').replace('http:','https:'),year:(i.volumeInfo.publishedDate||'').slice(0,4)}))}
let results=[],seriesList=[];
$('#sf').onsubmit=async e=>{e.preventDefault();const q=$('#q').value.trim();if(!q)return;$('#q').blur();$('#sres').innerHTML='<div class="empty">Searching…</div>';
 try{const docs=await olSearch(q);results=docs.map(olBook);const c={};docs.forEach(d=>(d.series_name||[]).forEach(n=>c[n]=(c[n]||0)+1));
  seriesList=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]);if(!results.length)throw 0}
 catch{try{results=await gbSearch(q);seriesList=[]}catch{results=[]}}
 $('#sres').innerHTML=(seriesList.length?'<div class="lbl">Series</div>'+seriesList.map((n,i)=>`<div class="res ser"><div class="cv">📚</div><div class="t"><b>${esc(n)}</b><small>Tap to load all books</small></div><button data-ser="${i}">Add</button></div>`).join(''):'')+
 (results.length?'<div class="lbl">Books</div>'+results.map((b,i)=>`<div class="res">${cover(b)}<div class="t"><b>${esc(b.title)}</b><small>${esc(b.author)} ${b.year?'· '+b.year:''}</small></div><button data-bk="${i}">Add</button></div>`).join(''):'<div class="empty">No results (are you offline?)</div>')};
$('#sres').addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.bk){const b=results[t.dataset.bk];pickTarget(b.title,[{title:b.title,author:b.author,cover:b.cover}],b.author||'My books','Books');return}
 const n=seriesList[t.dataset.ser];t.textContent='…';
 try{const r=await fetch(`${OL}?q=${encodeURIComponent('series_name:"'+n+'"')}&fields=title,author_name,cover_i,first_publish_year,series_name,series_position&limit=60`);const docs=(await r.json()).docs;
  const seen=new Set(),bs=docs.map(olBook).sort((a,b)=>(a.pos||99)-(b.pos||99)||(a.year||0)-(b.year||0)).filter(b=>{const k=b.title.toLowerCase();if(seen.has(k))return false;seen.add(k);return true}); const ac={};bs.forEach(b=>ac[b.author]=(ac[b.author]||0)+1);const top=Object.keys(ac).sort((a,b)=>ac[b]-ac[a])[0];const bs2=bs.filter(b=>b.author==top).map(({title,author,cover})=>({title,author,cover}));
  t.textContent='Add';pickTarget(n,bs2,n.replace(/\s*[(#].*$/,'').split(/[:&]/)[0].trim(),n)}catch{t.textContent='Add';toast('Could not load series')}});
render();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
