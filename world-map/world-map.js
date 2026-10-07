/* Family world map — self-contained component. Needs world-map-data.js loaded first. */
(function(){
var D=window.WORLD_MAP_DATA, root=document.getElementById('wm-root'); if(!D||!root) return;
var NS='http://www.w3.org/2000/svg', T=D.travelers, C={}; T.forEach(function(t){C[t.id]=t.color});
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function fmt(n){return n.toLocaleString('en-US')}
var startPins={GEG:'bk',OKC:'br'};
function draw(m,box,opts){
  var svg=el('svg',{class:'wm-'+opts.key,viewBox:'0 0 '+m.w+' '+m.h,role:'img','aria-label':opts.label});
  var cid='wmclip'+opts.key; var defs=el('defs',{},svg); var cp=el('clipPath',{id:cid},defs); el('rect',{width:m.w,height:m.h},cp);
  var f=el('filter',{id:'wmpaper'+opts.key},defs); el('feTurbulence',{type:'fractalNoise',baseFrequency:'.9',numOctaves:'2',result:'n'},f);
  el('feColorMatrix',{type:'matrix',values:'0 0 0 0 .45  0 0 0 0 .33  0 0 0 0 .15  0 0 0 .18 0'},f);
  var g=el('g',{'clip-path':'url(#'+cid+')'},svg);
  el('rect',{class:'wm-sea',width:m.w,height:m.h},g);
  el('path',{class:'wm-land',d:m.land},g);
  el('rect',{width:m.w,height:m.h,filter:'url(#wmpaper'+opts.key+')'},g);
  var lines=el('g',{},g);
  m.lines.forEach(function(l){
    var p=el('path',{d:l.d,class:'wm-line '+l.st+(l.st==='confirmed'?' draw':''),'data-t':l.t},lines);
    if(l.t!=='all') p.style.stroke=C[l.t];
    if(l.q){var q=el('g',{class:'wm-q','data-t':l.t},lines); el('circle',{cx:l.q[0],cy:l.q[1],r:11},q);
      var tx=el('text',{x:l.q[0],y:l.q[1]+5,'text-anchor':'middle',class:'qm'},q); tx.textContent='?';}
  });
  // de-duplicate ? labels
  var pins=el('g',{},g);
  opts.pins.forEach(function(k){var p=m.pins[k]; if(!p) return;
    var who=startPins[k]; var gp=el('g',{class:'wm-pin'+(who?' start':''),'data-t':who||'all'},pins);
    var c=el('circle',{cx:p[0],cy:p[1],r:who?7:5},gp); if(who) c.style.stroke=C[who];
    var lab=opts.lab[k]||[10,-8,'start']; var t=el('text',{x:p[0]+lab[0],y:p[1]+lab[1],'text-anchor':lab[2]},gp); t.textContent=p[2];
  });
  if(opts.title){var tt=el('text',{x:opts.title[0],y:opts.title[1],class:'wm-title'},g); tt.textContent=opts.title[2];}
  var cg=el('g',{class:'wm-compass',transform:'translate('+(m.w-50)+','+(m.h-55)+')'},g);
  el('path',{d:'M0,-28 L6,0 L0,28 L-6,0Z',fill:'#C9962E',stroke:'#1F3355','stroke-width':1.2},cg);
  el('path',{d:'M-28,0 L0,-5 L28,0 L0,5Z',fill:'#F6ECD6',stroke:'#1F3355','stroke-width':1.2},cg);
  var n=el('text',{x:0,y:-32,'text-anchor':'middle','font-size':14},cg); n.textContent='N';
  return svg;
}
var html='<p class="wm-kicker">Where everyone starts &amp; every stop along the way</p>'+
 '<ul class="wm-chips" role="group" aria-label="Highlight a traveler"><li><button type="button" class="wm-chip" aria-pressed="true" data-t="">Everyone</button></li>'+
 T.map(function(t){return '<li><button type="button" class="wm-chip" aria-pressed="false" data-t="'+t.id+'" style="--c:'+t.color+'"><i></i>'+t.name+'</button></li>'}).join('')+
 '<li><button type="button" class="wm-chip" aria-pressed="false" data-t="all" style="--c:#1F8A8A"><i></i>Cruise (all 6)</button></li></ul>'+
 '<div class="wm-frame" id="wm-main"></div>'+
 '<div class="wm-key"><span><svg viewBox="0 0 34 8"><path d="M2 4H32" stroke="#1F3355" stroke-width="3"/></svg>Booked flight</span>'+
 '<span><svg viewBox="0 0 34 8"><path d="M2 4H32" stroke="#1F3355" stroke-width="3" stroke-dasharray="7 5"/></svg>Planned, not booked</span>'+
 '<span><svg viewBox="0 0 34 8"><path d="M2 4H32" stroke="#8C8676" stroke-width="2.4" stroke-dasharray="5 5"/></svg>TBD (unconfirmed) · ?</span>'+
 '<span><svg viewBox="0 0 34 8"><path d="M2 4H32" stroke="#1F8A8A" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/></svg>Cruise</span></div>'+
 '<div class="wm-grid"><div><h3>The cruise loop · Jun 4–14</h3><div class="wm-frame" id="wm-med"></div></div>'+
 '<div><h3>Miles traveled <small style="font:600 .8rem Nunito Sans">≈ approximate</small></h3><table class="wm-table"><thead><tr><th>Traveler</th><th>Confirmed legs</th><th style="text-align:right">Miles ≈</th></tr></thead><tbody>'+
 T.map(function(t){var n=t.legs.filter(function(l){return l.status==='confirmed'}).length, x=t.legs.length-n;
   return '<tr data-t="'+t.id+'"><td data-l="Traveler"><span class="wm-sw" style="background:'+t.color+'"></span>'+t.name+(t.people>1?' <small>(each)</small>':'')+'</td><td data-l="Legs">'+n+' confirmed'+(x?' · '+x+' TBD/planned not counted':'')+'</td><td class="num" data-l="Miles">≈ '+fmt(t.total)+' mi</td></tr>'}).join('')+
 '<tr class="fam"><td data-l="Family">Family total</td><td data-l="How">6 travelers, person-miles</td><td class="num" data-l="Miles">≈ '+fmt(D.family)+' mi</td></tr></tbody></table>'+
 '<p class="wm-note">Great-circle (haversine) miles between airports. Cruise legs are port-to-port <em>as the crow flies</em> (≈ '+fmt(T[0].legs.filter(function(l){return l.mode==="cruise"}).reduce(function(s,l){return s+l.mi},0))+' mi per person). Rome ↔ Civitavecchia transfers not counted. <strong>TBD and unbooked legs are excluded</strong>, so totals will grow once those are confirmed.</p></div></div>'+
 '<div class="wm-tbd"><strong>Still TBD on this map</strong><ul>'+
 T.map(function(t){return t.legs.filter(function(l){return l.status!=='confirmed'}).map(function(l){return '<li><b>'+t.name+'</b> · '+(D.pl[l.a]||'?')+' → '+(D.pl[l.b]||'?')+' ('+l.date+'): '+l.src+'</li>'}).join('')}).join('')+'</ul></div>';
root.innerHTML=html;
document.getElementById('wm-main').appendChild(draw(D.main,0,{key:'m',label:'Map from North America to Europe showing each traveler\'s flights',
  pins:['GEG','SEA','OKC','MSP','JFK','ATL','LHR','FCO'],
  lab:{GEG:[12,16,'start'],SEA:[-10,-12,'start'],OKC:[14,6,'start'],MSP:[10,-8,'start'],JFK:[10,18,'start'],ATL:[12,28,'start'],LHR:[-10,-10,'end'],FCO:[-6,34,'end']},
  title:[24,44,'The Jenson family, coast to coast to coast']}));
document.getElementById('wm-med').appendChild(draw(D.med,0,{key:'c',label:'Cruise route map of the Mediterranean ports',
  pins:['CVV','NAP','MES','KAT','CFU','BAR','DBV','SPU','FCO'],
  lab:{CVV:[-12,-6,'end'],FCO:[12,-8,'start'],NAP:[-12,20,'end'],MES:[-12,22,'end'],KAT:[-10,26,'end'],CFU:[-12,6,'end'],BAR:[12,6,'start'],DBV:[12,-6,'start'],SPU:[10,-10,'start']}}));
// line-draw lengths
[].forEach.call(root.querySelectorAll('.wm-line.draw'),function(p){p.style.setProperty('--len',Math.ceil(p.getTotalLength()))});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){root.classList.add('anim');io.disconnect()}});io.observe(root)}
// toggle
function focus(id){root.classList.toggle('has-focus',!!id);
  [].forEach.call(root.querySelectorAll('[data-t]'),function(n){if(n.tagName==='BUTTON'){n.setAttribute('aria-pressed',String(n.getAttribute('data-t')===(id||'')));return}
    var t=n.getAttribute('data-t'); if(n.tagName==='TR'){n.classList.toggle('sel',!!id&&t===id);return}
    n.classList.toggle('wm-dim',!!id&&!(t===id||t==='all'&&id||(id==='all'&&t==='all')))});
}
root.addEventListener('click',function(e){var b=e.target.closest('.wm-chip');if(b)focus(b.getAttribute('data-t'))});
})();
