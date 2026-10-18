  (function () {
    'use strict';
    var SVGNS = 'http://www.w3.org/2000/svg';
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    var THEMES = {
      interphase: { light:'#a8e6ff', mid:'#4a9ee0', dark:'#0a1a3a', accent:'#7fe3ff', glow:'#3d7fd8', coil1:'#ff5a7a', coil2:'#6ab4ff', coil3:'#ffd24a', coil4:'#b88aff' },
      metaphase: { light:'#a8ffdc', mid:'#28c9a0', dark:'#04302a', accent:'#b6f24a', glow:'#12a892', coil1:'#b6f24a', coil2:'#4fe0c8', coil3:'#ffe066', coil4:'#7fd8ff' }
    };
    var ORDER = ['interphase','metaphase'];
    var HALF_W=33, CORE_RATIO=0.80, STEP=1.2, CHUNK=5, PITCH=13, CSS_PERSPECTIVE=1600;

    var LOCUS_CONTENT = {
      A: { key:'A', name:'Locus A', pos:'Cánh trên NST · đầu mút', allele1:'A', allele2:'a', alleleLabel:'Cặp allele', desc:'Locus A là vị trí xác định của gene A trên NST. Trên cặp NST tương đồng, hai allele A và a nằm cùng một locus.', bullets:['<b>Allele A</b> — nguồn gốc từ NST của bố (hoặc mẹ).','<b>Allele a</b> — nguồn gốc từ NST còn lại.','Hai allele cùng locus quy định <b>một tính trạng</b>.','Vị trí locus A không đổi qua các thế hệ tế bào.'] },
      B: { key:'B', name:'Locus B', pos:'Gần tâm động', allele1:'B', allele2:'b', alleleLabel:'Cặp allele', desc:'Locus B nằm gần tâm động của NST. Khoảng cách giữa các locus quyết định tần số hoán vị gene trong giảm phân.', bullets:['<b>Tâm động</b> là điểm nối hai chromatid chị em.','Locus B nằm sát tâm động → ít bị <b>hoán vị</b>.','Hai allele B / b quy định một tính trạng khác.','Sự phân ly của locus B phụ thuộc vào <b>sợi tơ vô sắc</b>.'] },
      D: { key:'D', name:'Locus D', pos:'Cánh dưới NST · đầu mút', allele1:'D', allele2:'d', alleleLabel:'Cặp allele', desc:'Locus D nằm trên cánh dưới của NST. Các gene trên cùng một NST tạo thành <b>nhóm gene liên kết</b>.', bullets:['Locus D cách xa tâm động → dễ xảy ra <b>trao đổi chéo</b>.','<b>Allele D</b> và <b>d</b> cùng quy định một tính trạng.','Cùng với A và B, tạo thành <b>nhóm liên kết gene</b>.','Sự sắp xếp locus quyết định <b>bản đồ di truyền</b>.'] },
      sister: { key:'⧦', name:'Chromatid chị em', pos:'Hai nửa của NST kép', allele1:'', allele2:'', alleleLabel:'Vị trí', desc:'Mỗi NST kép gồm hai chromatid chị em dính nhau ở tâm động, cùng nguồn gốc và giống nhau về cấu trúc.', bullets:['Hai chromatid chị em được tổng hợp từ <b>một NST ban đầu</b> trong pha S.','Chúng <b>dính nhau ở tâm động</b> sau khi nhân đôi.','Khi bước vào kỳ sau phân bào, chúng <b>tách nhau</b>.','Mỗi chromatid chứa <b>một phân tử ADN</b> giống nhau.'] },
      centromere: { key:'◉', name:'Tâm động', pos:'Điểm nối hai chromatid', allele1:'', allele2:'', alleleLabel:'Vị trí', desc:'Tâm động là điểm nối hai chromatid chị em, nơi sợi tơ vô sắc bám vào trong phân bào.', bullets:['Tâm động là vị trí <b>bám của sợi tơ vô sắc</b>.','Chia NST thành <b>cánh ngắn (p)</b> và <b>cánh dài (q)</b>.','Là điểm cố định, dùng để <b>nhận diện NST</b>.','Sự phân ly của chromatid phụ thuộc vào <b>tâm động</b>.'] },
      carry: { key:'1', name:'Mang thông tin di truyền', pos:'Chức năng 1 của NST', allele1:'', allele2:'', alleleLabel:'', desc:'Nhiễm sắc thể là vật chất mang thông tin di truyền của tế bào — nơi lưu trữ toàn bộ bản thiết kế của sinh vật.', bullets:[], fnSections:[
          {num:'1', title:'Gene và locus', texts:['Các gene nằm kế tiếp nhau dọc theo chiều dài DNA và vị trí của gene trên NST được gọi là <i>locus</i>.','Mỗi locus trên cặp NST tương đồng có thể chứa các trình tự nucleotide khác nhau được gọi là <i>allele</i>.']},
          {num:'2', title:'Số lượng và phân bố gene', texts:['Số lượng gene và sự phân bố của các gene trên NST của cùng một bộ NST rất khác nhau.','Có NST chứa <b>nhiều gene</b> phân bố dày đặc; NST khác lại chứa <b>ít gene</b> hơn.']},
          {num:'3', title:'Trình tự đặc biệt', texts:['Ngoài các gene, NST còn chứa các <b>trình tự nucleotide đặc biệt</b>.','<b>Vùng đầu mút</b> bảo vệ NST, và <b>trình tự tâm động</b> giữa hai phần bảo đảm NST di chuyển được khi phân chia tế bào.']}
        ] },
      transmit: { key:'2', name:'Truyền đạt thông tin', pos:'Chức năng 2 của NST', allele1:'', allele2:'', alleleLabel:'', desc:'Nhiễm sắc thể truyền đạt thông tin di truyền qua các thế hệ tế bào và thế hệ cơ thể, nhờ sự vận động chính xác trong nguyên phân và giảm phân.', bullets:[], fnSections:[
          // SYNC: nội dung khối này còn 1 bản trong index.html (section fn2 → .fn-points) — sửa phải sửa CẢ 2
          {num:'1', title:'Giảm phân & Thụ tinh', texts:['Tạo ra các <b>tổ hợp gene mới</b> khác nhau qua các thế hệ, giúp sinh vật thích nghi với môi trường thay đổi. Đồng thời khôi phục lại <b>bộ NST lưỡng bội (2n)</b> đặc trưng của loài.']},
          {num:'2', title:'Nguyên phân', texts:['Duy trì <b>bộ NST lưỡng bội</b> đồng đều giữa các tế bào trong cơ thể. Do mỗi gene có hai bản sao (<b>hai allele trên cặp NST tương đồng</b>) nên giúp cơ thể ít bị gây hại hơn nếu một bản bị đột biến.']}
        ] }
    };

    var root = document.documentElement;
    var modelAnchor = document.getElementById('modelAnchor');
    var modelWrap = document.getElementById('modelWrap');
    var sway1 = document.getElementById('sway1');
    var sway2 = document.getElementById('sway2');
    var floatEl = document.getElementById('floatEl');
    var halo = document.querySelector('.halo');
    var bgOne = document.querySelector('.bg.one');
    var bgTwo = document.querySelector('.bg.two');
    var modelShine = document.getElementById('modelShine');
    var modelTip = document.getElementById('modelTip');
    var particleLayer = document.getElementById('particles');
    var locusLayer = document.getElementById('locusLayer');
    var groundShadow = document.getElementById('groundShadow');
    var groundShadowInner = document.getElementById('groundShadowInner');
    var teleTheta = document.getElementById('teleTheta');
    var telePhi = document.getElementById('telePhi');
    var teleR = document.getElementById('teleR');
    var overlaySister = document.getElementById('overlaySister');
    var overlayCentromere = document.getElementById('overlayCentromere');
    var overlayCarry = document.getElementById('overlayCarry');
    var overlayTransmit = document.getElementById('overlayTransmit');
    var layers = { glow:document.getElementById('glowLayer'),body:document.getElementById('bodyLayer'),core:document.getElementById('coreLayer'),coil:document.getElementById('coilLayer'),sheen:document.getElementById('sheenLayer'),rim:document.getElementById('rimLayer') };
    var chromo = document.getElementById('chromosome');
    var pill = document.querySelector('.sw-pill');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.sw'));
    var modeBtns = Array.prototype.slice.call(document.querySelectorAll('.mode-btn'));
    var current='interphase', busy=false;
    var mvA = document.getElementById('mvInterphase');
    var mvB = document.getElementById('mvMetaphase');
    var loadedA=false, loadedB=false, locus3DReady=false;
    var infoPanel=document.getElementById('infoPanel'), infoKey=document.getElementById('infoKey'),
        infoName=document.getElementById('infoName'), infoPos=document.getElementById('infoPos'),
        infoDesc=document.getElementById('infoDesc'), infoBullets=document.getElementById('infoBullets'),
        infoFnSections=document.getElementById('infoFnSections'), infoAllelesRow=document.getElementById('infoAllelesRow'),
        allele1El=document.getElementById('allele1'), allele2El=document.getElementById('allele2'),
        infoClose=document.getElementById('infoClose'), alleleLabelEl=document.getElementById('alleleLabel');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.set('.content-left', { yPercent: -50 });
    gsap.set(modelAnchor, { yPercent: -50 });

    function mk(t,a,s){var e=document.createElementNS(SVGNS,t);if(a)for(var k in a)e.setAttribute(k,a[k]);if(s)e.setAttribute('style',s);return e;}
    function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}
    function f2(v){return v.toFixed(2);}
    function smoothPath(pts){var n=pts.length;if(n<2)return '';if(n===2)return 'M'+f2(pts[0][0])+','+f2(pts[0][1])+'L'+f2(pts[1][0])+','+f2(pts[1][1]);var d='M'+f2(pts[0][0])+','+f2(pts[0][1]);for(var i=0;i<n-1;i++){var p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(n-1,i+2)];var c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6;var c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;d+='C'+f2(c1x)+','+f2(c1y)+','+f2(c2x)+','+f2(c2y)+','+f2(p2[0])+','+f2(p2[1]);}return d;}
    function smoothPathContinue(pts){var n=pts.length;if(n<2)return '';var d='';for(var i=0;i<n-1;i++){var p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(n-1,i+2)];var c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6;var c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;d+='C'+f2(c1x)+','+f2(c1y)+','+f2(c2x)+','+f2(c2y)+','+f2(p2[0])+','+f2(p2[1]);}return d;}
    function samplePath(pathEl){var L=pathEl.getTotalLength();if(!L)return null;var n=Math.max(14,Math.ceil(L/STEP)),pts=[];for(var i=0;i<=n;i++){var p=pathEl.getPointAtLength(L*i/n);pts.push({x:p.x,y:p.y});}return {pts:pts,L:L};}
    function buildNormals(pts){var n=pts.length,out=[];for(var i=0;i<n;i++){var a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];var tx=b.x-a.x,ty=b.y-a.y,l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;out.push({x:-ty,y:tx,tx:tx,ty:ty});}return out;}
    function tubeD(pts,norms,centerFn,halfFn){var n=pts.length,L=[],R=[],i,u,c,h,nx,ny;for(i=0;i<n;i++){u=i/(n-1);c=centerFn(u);h=halfFn(u);nx=norms[i].x;ny=norms[i].y;L.push([pts[i].x+nx*(c+h),pts[i].y+ny*(c+h)]);R.push([pts[i].x+nx*(c-h),pts[i].y+ny*(c-h)]);}var d=smoothPath(L);var ec=pts[n-1],en=norms[n-1],eh=halfFn(1);for(var k=1;k<=8;k++){var th=Math.PI*k/8,cs=Math.cos(th),sn=Math.sin(th);d+='L'+f2(ec.x+en.x*eh*cs+en.tx*eh*sn)+','+f2(ec.y+en.y*eh*cs+en.ty*eh*sn);}var Rrev=R.slice().reverse();d+='L'+f2(Rrev[0][0])+','+f2(Rrev[0][1]);d+=smoothPathContinue(Rrev);var sc=pts[0],sn0=norms[0],sh=halfFn(0);for(var k2=1;k2<=8;k2++){var th2=Math.PI*k2/8,cs2=Math.cos(th2),sn2=Math.sin(th2);d+='L'+f2(sc.x-sn0.x*sh*cs2-sn0.tx*sh*sn2)+','+f2(sc.y-sn0.y*sh*cs2-sn0.ty*sh*sn2);}return d+'Z';}
    var STRANDS=[{varName:'var(--coil-1)',phase:0,width:3.0,amp:1.00},{varName:'var(--coil-2)',phase:Math.PI*2/3,width:3.0,amp:0.92},{varName:'var(--coil-3)',phase:Math.PI*4/3,width:2.7,amp:0.98},{varName:'var(--coil-4)',phase:Math.PI/3,width:2.0,amp:0.65}];
    function buildCoils(pts,norms,L){var out=[],turns=Math.max(8,Math.round(L/PITCH)),amp=HALF_W*CORE_RATIO*0.88,n=pts.length;STRANDS.forEach(function(sd){var P=[],i,u,th,off,nx,ny;for(i=0;i<n;i++){u=i/(n-1);th=u*turns*Math.PI*2+sd.phase;off=amp*sd.amp*Math.sin(th)*(1+0.08*Math.sin(u*9+sd.phase));nx=norms[i].x;ny=norms[i].y;P.push({x:pts[i].x+nx*off,y:pts[i].y+ny*off,z:Math.cos(th)});}for(i=0;i<P.length-1;i+=CHUNK){var end=Math.min(i+CHUNK,P.length-1);var pts2D=[],zs=0;for(var k=i;k<=end;k++){pts2D.push([P[k].x,P[k].y]);zs+=P[k].z;}var d=smoothPath(pts2D);var zAvg=zs/(end-i+1),op=0.32+0.68*((zAvg+1)/2);out.push({d:d,color:sd.varName,width:sd.width,opacity:op});}});return out;}
    var LIGHT_DIR={x:-0.55,y:-0.83};

    function renderFallback(){
      Object.keys(layers).forEach(function(k){clear(layers[k]);});
      var armEls=Array.prototype.slice.call(document.querySelectorAll('#armData path'));
      var armGroupsByLayer={};
      Object.keys(layers).forEach(function(key){armGroupsByLayer[key]=[];for(var a=0;a<armEls.length;a++){var g=mk('g');g.setAttribute('class','arm-group');layers[key].appendChild(g);armGroupsByLayer[key].push(g);}});
      armEls.forEach(function(armEl,armIndex){
        var s=samplePath(armEl);if(!s)return;
        var pts=s.pts,L=s.L,norms=buildNormals(pts);
        var shellD=tubeD(pts,norms,function(){return 0;},function(){return HALF_W;});
        armGroupsByLayer.glow[armIndex].appendChild(mk('path',{d:shellD,'fill-opacity':0.55,filter:'url(#bigGlow)'},'fill:var(--glow)'));
        armGroupsByLayer.body[armIndex].appendChild(mk('path',{d:shellD,fill:'url(#glassBody)'}));
        var coreD=tubeD(pts,norms,function(){return 0;},function(){return HALF_W*CORE_RATIO;});
        armGroupsByLayer.core[armIndex].appendChild(mk('path',{d:coreD,fill:'url(#coreGrad)'}));
        buildCoils(pts,norms,L).forEach(function(c){armGroupsByLayer.coil[armIndex].appendChild(mk('path',{d:c.d,fill:'none','stroke-width':c.width,'stroke-linecap':'round','stroke-linejoin':'round',filter:'url(#coilGlow)'},'stroke:'+c.color+';stroke-opacity:'+c.opacity.toFixed(3)));});
        armGroupsByLayer.sheen[armIndex].appendChild(mk('path',{d:shellD,fill:'url(#sheen)'}));
        armGroupsByLayer.rim[armIndex].appendChild(mk('path',{d:shellD,fill:'none',stroke:'rgba(214,240,255,.55)','stroke-width':1.5}));
        var midN=norms[Math.floor(norms.length/2)];var sgn=(midN.x*LIGHT_DIR.x+midN.y*LIGHT_DIR.y)>=0?1:-1;
        var hiD=tubeD(pts,norms,function(){return HALF_W*0.50*sgn;},function(){return 3.4;});
        armGroupsByLayer.rim[armIndex].appendChild(mk('path',{d:hiD,fill:'#ffffff','fill-opacity':0.52,filter:'url(#softGlow)'}));
      });
      var armConfigs=[{amp:2.4,dur:2.8,delay:0.0,start:-1},{amp:1.9,dur:3.4,delay:0.5,start:1},{amp:2.8,dur:2.5,delay:1.0,start:-1},{amp:2.1,dur:3.7,delay:1.4,start:1}];
      armConfigs.forEach(function(cfg,armIdx){var groups=Object.keys(armGroupsByLayer).map(function(k){return armGroupsByLayer[k][armIdx];});var startAngle=cfg.start<0?-cfg.amp:cfg.amp;gsap.fromTo(groups,{rotation:startAngle},{rotation:-startAngle,duration:cfg.dur,ease:'sine.inOut',yoyo:true,repeat:-1,delay:cfg.delay,transformOrigin:'158px 218px'});});
    }

    var SVG_ICONS = {
      molecule:'<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="16,4 27,10 27,22 16,28 5,22 5,10" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="rgba(255,255,255,.05)"/><circle cx="16" cy="16" r="3" fill="currentColor"/><circle cx="16" cy="4" r="2" fill="currentColor"/><circle cx="27" cy="10" r="2" fill="currentColor"/><circle cx="27" cy="22" r="2" fill="currentColor"/><circle cx="16" cy="28" r="2" fill="currentColor"/><circle cx="5" cy="22" r="2" fill="currentColor"/><circle cx="5" cy="10" r="2" fill="currentColor"/></svg>',
      base:function(letter){return '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.6" fill="rgba(255,255,255,.05)"/><text x="16" y="21" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="currentColor">'+letter+'</text></svg>';},
      helix:'<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 3 Q17 8 11 13 Q5 18 11 23 Q17 28 11 32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M21 3 Q15 8 21 13 Q27 18 21 23 Q15 28 21 32" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><line x1="12" y1="8" x2="20" y2="8" stroke="currentColor" stroke-width="1.2" opacity=".55"/><line x1="12" y1="16" x2="20" y2="16" stroke="currentColor" stroke-width="1.2" opacity=".55"/><line x1="12" y1="24" x2="20" y2="24" stroke="currentColor" stroke-width="1.2" opacity=".55"/></svg>',
      phosphate:'<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="9" stroke="currentColor" stroke-width="1.6" fill="rgba(255,255,255,.05)"/><circle cx="16" cy="16" r="3" fill="currentColor"/><circle cx="26" cy="9" r="3.5" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="6" cy="23" r="3.5" stroke="currentColor" stroke-width="1.4" fill="none"/><line x1="22" y1="11" x2="18" y2="14" stroke="currentColor" stroke-width="1"/><line x1="10" y1="21" x2="14" y2="18" stroke="currentColor" stroke-width="1"/></svg>',
      electron:'<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="16" rx="14" ry="5" stroke="currentColor" stroke-width="1" opacity=".5"/><ellipse cx="16" cy="16" rx="14" ry="5" transform="rotate(60 16 16)" stroke="currentColor" stroke-width="1" opacity=".5"/><ellipse cx="16" cy="16" rx="14" ry="5" transform="rotate(120 16 16)" stroke="currentColor" stroke-width="1" opacity=".5"/><circle cx="16" cy="16" r="2.6" fill="currentColor"/></svg>'
    };
    var PARTICLE_POOL=[
      {type:'molecule',color:'#ff5a7a',size:30},{type:'base',color:'#6ab4ff',size:26,letter:'A'},
      {type:'base',color:'#ffd24a',size:26,letter:'T'},{type:'base',color:'#b88aff',size:26,letter:'G'},
      {type:'base',color:'#7fe3ff',size:26,letter:'C'},{type:'helix',color:'#ff5a7a',size:30},
      {type:'phosphate',color:'#6ab4ff',size:26},{type:'electron',color:'#7fe3ff',size:20},
      {type:'molecule',color:'#b88aff',size:24},{type:'base',color:'#ffd24a',size:22,letter:'A'},
      {type:'helix',color:'#6ab4ff',size:24},{type:'electron',color:'#ff5a7a',size:16},
      {type:'phosphate',color:'#ffd24a',size:22},{type:'base',color:'#7fe3ff',size:22,letter:'G'},
      {type:'molecule',color:'#6ab4ff',size:22},{type:'electron',color:'#b88aff',size:16}
    ];
    var particles=[];
    function createParticles(){PARTICLE_POOL.forEach(function(cfg){var el=document.createElement('div');el.className='particle';el.style.width=cfg.size+'px';el.style.height=cfg.size+'px';el.style.color=cfg.color;var inner=document.createElement('div');inner.className='particle-inner';inner.innerHTML=(cfg.type==='base')?SVG_ICONS.base(cfg.letter):SVG_ICONS[cfg.type];el.appendChild(inner);particleLayer.appendChild(el);var p={el:el,inner:inner,color:cfg.color,rx:210+Math.random()*150,ry:150+Math.random()*160,yBase:(Math.random()-0.5)*160,ratioY:0.55+Math.random()*0.8,speed:(0.18+Math.random()*0.32)*(Math.random()>0.5?1:-1),angle:Math.random()*Math.PI*2,rotSpeed:(Math.random()-0.5)*80};el.addEventListener('click',function(e){e.stopPropagation();burstParticle(p);});el.addEventListener('pointerdown',function(e){e.stopPropagation();});particles.push(p);});}
    function burstParticle(p){var rect=p.el.getBoundingClientRect();var ring=document.createElement('div');ring.className='particle-burst';ring.style.left=(rect.left+rect.width/2)+'px';ring.style.top=(rect.top+rect.height/2)+'px';ring.style.color=p.color;document.body.appendChild(ring);gsap.fromTo(ring,{xPercent:-50,yPercent:-50,scale:0.25,opacity:0.95},{xPercent:-50,yPercent:-50,scale:3.6,opacity:0,duration:1.0,ease:'expo.out',onComplete:function(){ring.remove();}});p.el.classList.add('popping');setTimeout(function(){p.el.classList.remove('popping');},420);}
    function startParticleLoop(){gsap.ticker.add(function(time,dt){var d=Math.min(dt,50)*0.001;particles.forEach(function(p){p.angle+=p.speed*d;var x=Math.cos(p.angle)*p.rx;var y=Math.sin(p.angle*p.ratioY)*p.ry+p.yBase;var depth=(Math.sin(p.angle*0.95)+1)/2;var scale=0.55+depth*0.75;var opacity=0.32+depth*0.68;var zIndex=Math.round(depth*100);var rot=p.angle*p.rotSpeed;p.el.style.transform='translate(-50%,-50%) translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+rot.toFixed(1)+'deg) scale('+scale.toFixed(3)+')';p.el.style.opacity=opacity.toFixed(3);p.el.style.zIndex=zIndex;});});}

    // ============================================================
    // FLOATING BIOLOGY ICONS INITIALIZATION
    // ============================================================
    var BIO_ICON_IDS = ['icon-dna', 'icon-microscope', 'icon-atom', 'icon-cell', 'icon-plant', 'icon-test-tube', 'icon-molecule', 'icon-petri-dish'];

    function spawnFloatingBioIcons(containerId, count, baseColor, baseOpacity) {
      var container = document.getElementById(containerId);
      if (!container) return;
      
      for (var i = 0; i < count; i++) {
        var iconId = BIO_ICON_IDS[Math.floor(Math.random() * BIO_ICON_IDS.length)];
        var size = 30 + Math.random() * 60;
        var el = document.createElement('div');
        el.className = 'bio-icon';
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.color = baseColor || 'var(--accent)';
        el.style.opacity = (baseOpacity || 0.15) + Math.random() * 0.1;
        
        el.style.left = (Math.random() * 100) + '%';
        el.style.top = (Math.random() * 100) + '%';
        
        el.innerHTML = '<svg><use href="#' + iconId + '"></use></svg>';
        container.appendChild(el);

        if (!reduceMotion) {
          gsap.to(el, {
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            rotation: (Math.random() - 0.5) * 60,
            duration: 10 + Math.random() * 10,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: Math.random() * -10
          });
          
          gsap.to(el, {
            opacity: (baseOpacity || 0.15) + Math.random() * 0.3,
            duration: 4 + Math.random() * 4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: Math.random() * -5
          });
        }
      }
    }

    spawnFloatingBioIcons('entryIconsLayer', 18, 'var(--accent)', 0.1);
    spawnFloatingBioIcons('heroBioIcons', 12, 'var(--accent)', 0.08);
    spawnFloatingBioIcons('fn1BioIcons', 8, 'var(--fn1)', 0.05);
    spawnFloatingBioIcons('fn2BioIcons', 8, 'var(--fn2)', 0.05);
    spawnFloatingBioIcons('aiBioIcons', 10, 'var(--accent)', 0.08);

    // ============================================================

    var locusEls=Array.prototype.slice.call(document.querySelectorAll('.locus-marker'));
    var legendEls=Array.prototype.slice.call(document.querySelectorAll('.locus-item'));
    var activeLocus=null;
    function getActiveMV(){return (current==='metaphase'&&loadedB)?mvB:mvA;}
    function computeLocus3DPositions(){var mv=getActiveMV();if(!mv||!mv.getCameraOrbit)return;var orbit;try{orbit=mv.getCameraOrbit();}catch(e){return;}if(!orbit||!isFinite(orbit.theta)||!isFinite(orbit.phi))return;var theta0=orbit.theta,phi0=orbit.phi,radius0=orbit.radius;var C0={x:radius0*Math.sin(phi0)*Math.sin(theta0),y:radius0*Math.cos(phi0),z:radius0*Math.sin(phi0)*Math.cos(theta0)};var fLen=Math.hypot(C0.x,C0.y,C0.z);var F0={x:-C0.x/fLen,y:-C0.y/fLen,z:-C0.z/fLen};var rLen=Math.hypot(F0.z,F0.x)||1;var R0={x:F0.z/rLen,y:0,z:-F0.x/rLen};var U0={x:F0.y*R0.z-F0.z*R0.y,y:F0.z*R0.x-F0.x*R0.z,z:F0.x*R0.y-F0.y*R0.x};var rect=modelAnchor.getBoundingClientRect();var w=rect.width,h=rect.height;var fovDeg=(mv.getFieldOfView?mv.getFieldOfView():30);var focal0=h/(2*Math.tan(fovDeg*Math.PI/360));locusEls.forEach(function(marker){var bxPct=parseFloat(marker.dataset.baseX)/100;var byPct=parseFloat(marker.dataset.baseY)/100;var sx=bxPct*w,sy=byPct*h;var rcx=sx-w/2,rcy=-(sy-h/2),rcz=focal0;var dx=rcx*R0.x+rcy*U0.x+rcz*F0.x;var dy=rcx*R0.y+rcy*U0.y+rcz*F0.y;var dz=rcx*R0.z+rcy*U0.z+rcz*F0.z;var dLen=Math.hypot(dx,dy,dz)||1;dx/=dLen;dy/=dLen;dz/=dLen;marker.dataset.px=C0.x+radius0*dx;marker.dataset.py=C0.y+radius0*dy;marker.dataset.pz=C0.z+radius0*dz;});locus3DReady=true;redrawLocusLines();}
    function updateLocusFollow(){if(!locus3DReady)return;if(window.scrollY>window.innerHeight*1.2)return;var mv=getActiveMV();if(!mv||!mv.getCameraOrbit)return;var orbit;try{orbit=mv.getCameraOrbit();}catch(e){return;}if(!orbit||!isFinite(orbit.theta)||!isFinite(orbit.phi))return;var theta=orbit.theta,phi=orbit.phi,radius=orbit.radius;var cx3=radius*Math.sin(phi)*Math.sin(theta);var cy3=radius*Math.cos(phi);var cz3=radius*Math.sin(phi)*Math.cos(theta);var fl=Math.hypot(cx3,cy3,cz3)||1;var Fx=-cx3/fl,Fy=-cy3/fl,Fz=-cz3/fl;var rl=Math.hypot(Fz,Fx)||1;var Rx=Fz/rl,Ry=0,Rz=-Fx/rl;var Ux=Fy*Rz-Fz*Ry,Uy=Fz*Rx-Fx*Rz,Uz=Fx*Ry-Fy*Rx;var rect=modelAnchor.getBoundingClientRect();var w=rect.width,h=rect.height;var fovDeg=(mv.getFieldOfView?mv.getFieldOfView():30);var focal=h/(2*Math.tan(fovDeg*Math.PI/360));var swayY=(gsap.getProperty(sway1,'rotationY')||0)*Math.PI/180;var swayX=(gsap.getProperty(sway2,'rotationX')||0)*Math.PI/180;var swayZ=(gsap.getProperty(sway2,'rotationZ')||0)*Math.PI/180;var floatYOff=gsap.getProperty(floatEl,'y')||0;var floatSc=gsap.getProperty(floatEl,'scale')||1;var cosSY=Math.cos(swayY),sinSY=Math.sin(swayY);var cosSX=Math.cos(swayX),sinSX=Math.sin(swayX);var cosSZ=Math.cos(swayZ),sinSZ=Math.sin(swayZ);var swayYDeg=(gsap.getProperty(sway1,'rotationY')||0);var shadowScaleX=1+Math.abs(swayYDeg)/60*0.35;var shadowScaleY=0.85+(floatSc-1)*4;var shadowOpacity=0.55+Math.abs(swayYDeg)/60*0.25;if(groundShadow){groundShadow.style.transform='translateX('+(swayYDeg*0.9).toFixed(1)+'px) scaleX('+shadowScaleX.toFixed(3)+') scaleY('+shadowScaleY.toFixed(3)+')';groundShadow.style.opacity=shadowOpacity.toFixed(2);}if(groundShadowInner){groundShadowInner.style.transform='translateX('+(swayYDeg*0.7).toFixed(1)+'px) scaleX('+(shadowScaleX*0.85).toFixed(3)+')';groundShadowInner.style.opacity=(shadowOpacity*0.85).toFixed(2);}if(teleTheta)teleTheta.textContent=(theta*180/Math.PI).toFixed(1)+'°';if(telePhi)telePhi.textContent=(phi*180/Math.PI).toFixed(1)+'°';if(teleR)teleR.textContent=radius.toFixed(2)+'m';locusEls.forEach(function(marker){var Px=parseFloat(marker.dataset.px);var Py=parseFloat(marker.dataset.py);var Pz=parseFloat(marker.dataset.pz);if(!isFinite(Px)||!isFinite(Py)||!isFinite(Pz))return;var vx=Px-cx3,vy=Py-cy3,vz=Pz-cz3;var xs=vx*Rx+vy*Ry+vz*Rz;var ys=vx*Ux+vy*Uy+vz*Uz;var zs=vx*Fx+vy*Fy+vz*Fz;if(zs<0.05){marker.style.opacity='0';marker.style.pointerEvents='none';return;}marker.style.opacity='';marker.style.pointerEvents='';var screenX=w/2+(xs/zs)*focal;var screenY=h/2-(ys/zs)*focal;var px1=screenX-w/2,py1=screenY-h/2;var x1=px1*cosSY,y1=py1,z1=-px1*sinSY;var x2=x1,y2=y1*cosSX-z1*sinSX,z2=y1*sinSX+z1*cosSX;var x3=x2*cosSZ-y2*sinSZ,y3=x2*sinSZ+y2*cosSZ,z3=z2;var perspFactor=CSS_PERSPECTIVE/(CSS_PERSPECTIVE-z3);var finalX=w/2+x3*perspFactor*floatSc;var finalY=h/2+y3*perspFactor*floatSc+floatYOff;marker.style.transform='translate3d('+finalX.toFixed(1)+'px,'+finalY.toFixed(1)+'px,0)';});}
    function redrawLocusLines(){locusEls.forEach(function(marker){var tag=marker.querySelector('.locus-tag');var line=marker.querySelector('.locus-line line');if(!tag||!line)return;var tagW=tag.offsetWidth,tagH=tag.offsetHeight;var cs=getComputedStyle(tag);var tagLeft=parseFloat(cs.left)||0;var tagTop=parseFloat(cs.top)||0;var dx=tagLeft,dy=tagTop;var len=Math.hypot(dx,dy)||1;var ux=dx/len,uy=dy/len;var shorten=Math.min(tagW,tagH)*0.42;var x2=tagLeft-ux*shorten,y2=tagTop-uy*shorten;var svg=marker.querySelector('.locus-line');var pad=20;var minX=Math.min(0,x2)-pad,minY=Math.min(0,y2)-pad;var maxX=Math.max(0,x2)+pad,maxY=Math.max(0,y2)+pad;svg.setAttribute('viewBox',minX+' '+minY+' '+(maxX-minX)+' '+(maxY-minY));svg.style.left=minX+'px';svg.style.top=minY+'px';svg.setAttribute('width',maxX-minX);svg.setAttribute('height',maxY-minY);line.setAttribute('x1',(-minX).toFixed(1));line.setAttribute('y1',(-minY).toFixed(1));line.setAttribute('x2',(x2-minX).toFixed(1));line.setAttribute('y2',(y2-minY).toFixed(1));});}
    function highlightLocus(letter,on){locusEls.forEach(function(m){if(m.dataset.locus===letter)m.classList.toggle('active',on);});legendEls.forEach(function(l){if(l.dataset.locus===letter)l.classList.toggle('active',on);});}
    function showInfo(key){var data=LOCUS_CONTENT[key];if(!data)return;infoPanel.setAttribute('data-locus',key);infoKey.textContent=data.key;infoName.textContent=data.name;infoPos.textContent=data.pos;infoDesc.textContent=data.desc;if(data.allele1||data.allele2){infoAllelesRow.style.display='';allele1El.textContent=data.allele1;allele2El.textContent=data.allele2;allele1El.style.display=data.allele1?'':'none';allele2El.style.display=data.allele2?'':'none';if(alleleLabelEl)alleleLabelEl.textContent=data.alleleLabel||'Cặp allele';}else{infoAllelesRow.style.display='none';}infoBullets.innerHTML='';if(data.bullets&&data.bullets.length){infoBullets.style.display='';data.bullets.forEach(function(b){var li=document.createElement('li');li.innerHTML=b;infoBullets.appendChild(li);});}else{infoBullets.style.display='none';}infoFnSections.innerHTML='';if(data.fnSections&&data.fnSections.length){data.fnSections.forEach(function(fn){var wrap=document.createElement('div');wrap.className='fn-section-inline';var title=document.createElement('div');title.className='fn-title';title.innerHTML='<span class="fn-num">'+fn.num+'</span>'+fn.title;wrap.appendChild(title);fn.texts.forEach(function(txt){var p=document.createElement('p');p.className='fn-text';p.innerHTML=txt;wrap.appendChild(p);});infoFnSections.appendChild(wrap);});}var scroll=infoPanel.querySelector('.info-scroll');if(scroll)scroll.scrollTop=0;infoPanel.classList.add('visible');}
    function hideInfo(){infoPanel.classList.remove('visible');}
    infoClose.addEventListener('click',function(){hideInfo();if(activeLocus){highlightLocus(activeLocus,false);activeLocus=null;}clearModeActive();});
    function clearModeActive(){modeBtns.forEach(function(b){b.classList.remove('active');});var offBtn=document.querySelector('.mode-btn[data-mode="off"]');if(offBtn)offBtn.classList.add('active');}
    function setMode(mode){overlaySister.classList.remove('active');overlayCentromere.classList.remove('active');overlayCarry.classList.remove('active');overlayTransmit.classList.remove('active');modelAnchor.classList.remove('mode-sister','mode-centromere','mode-carry','mode-transmit');if(activeLocus){highlightLocus(activeLocus,false);activeLocus=null;}if(mode==='sister'){overlaySister.classList.add('active');modelAnchor.classList.add('mode-sister');showInfo('sister');}else if(mode==='centromere'){overlayCentromere.classList.add('active');modelAnchor.classList.add('mode-centromere');activeLocus='B';highlightLocus('B',true);showInfo('centromere');}else if(mode==='carry'){overlayCarry.classList.add('active');modelAnchor.classList.add('mode-carry');showInfo('carry');}else if(mode==='transmit'){overlayTransmit.classList.add('active');modelAnchor.classList.add('mode-transmit');showInfo('transmit');}else{hideInfo();}}
    modeBtns.forEach(function(btn){btn.addEventListener('click',function(){modeBtns.forEach(function(b){b.classList.remove('active');});btn.classList.add('active');setMode(btn.dataset.mode);});});
    legendEls.forEach(function(item){item.addEventListener('click',function(){var letter=item.dataset.locus;var marker=document.getElementById('marker'+letter);if(!marker)return;overlaySister.classList.remove('active');overlayCentromere.classList.remove('active');overlayCarry.classList.remove('active');overlayTransmit.classList.remove('active');modelAnchor.classList.remove('mode-sister','mode-centromere','mode-carry','mode-transmit');clearModeActive();activeLocus=letter;highlightLocus(letter,true);showInfo(letter);var dot=marker.querySelector('.locus-dot');if(dot){gsap.fromTo(dot,{scale:1},{scale:1.8,duration:0.28,ease:'power2.out',onComplete:function(){gsap.to(dot,{scale:1,duration:0.42,ease:'elastic.out(1,0.55)'});}});}});item.addEventListener('mouseenter',function(){highlightLocus(item.dataset.locus,true);});item.addEventListener('mouseleave',function(){if(activeLocus!==item.dataset.locus)highlightLocus(item.dataset.locus,false);});});
    locusEls.forEach(function(marker){var letter=marker.dataset.locus;var dot=marker.querySelector('.locus-dot');var tag=marker.querySelector('.locus-tag');var chips=marker.querySelectorAll('.allele-badge .allele-chip');function activate(e){if(e)e.stopPropagation();overlaySister.classList.remove('active');overlayCentromere.classList.remove('active');overlayCarry.classList.remove('active');overlayTransmit.classList.remove('active');modelAnchor.classList.remove('mode-sister','mode-centromere','mode-carry','mode-transmit');clearModeActive();activeLocus=letter;highlightLocus(letter,true);showInfo(letter);}if(dot)dot.addEventListener('click',activate);if(tag)tag.addEventListener('click',activate);chips.forEach(function(c){c.addEventListener('click',activate);});[dot,tag].forEach(function(el){if(!el)return;el.addEventListener('pointerdown',function(e){e.stopPropagation();});el.addEventListener('mouseenter',function(){highlightLocus(letter,true);});el.addEventListener('mouseleave',function(){if(activeLocus!==letter)highlightLocus(letter,false);});});});
    var loaderEl=document.getElementById('loader');
    if(mvA){mvA.addEventListener('load',function(){loadedA=true;modelWrap.classList.add('has-model');modelAnchor.classList.add('ready');requestAnimationFrame(function(){computeLocus3DPositions();updateLocusFollow();});});mvA.addEventListener('error',function(){if(loaderEl){loaderEl.textContent='abc.glb not found';loaderEl.style.color='rgba(255,140,140,.7)';}});}
    if(mvB){mvB.addEventListener('load',function(){loadedB=true;});mvB.addEventListener('error',function(){console.warn('[model-viewer] 123.glb not found');});}
    function showModel(which){if(which==='interphase'){if(loadedB)gsap.to(mvB,{opacity:0,duration:0.7,ease:'power2.inOut'});mvB.classList.remove('active');mvB.style.pointerEvents='none';if(loadedA)gsap.to(mvA,{opacity:1,duration:0.7,ease:'power2.inOut'});mvA.classList.add('active');mvA.style.pointerEvents='auto';}else{if(loadedA)gsap.to(mvA,{opacity:0,duration:0.7,ease:'power2.inOut'});mvA.classList.remove('active');mvA.style.pointerEvents='none';if(loadedB){gsap.to(mvB,{opacity:1,duration:0.7,ease:'power2.inOut'});mvB.classList.add('active');mvB.style.pointerEvents='auto';}else{gsap.to(mvA,{opacity:1,duration:0.7,ease:'power2.inOut'});mvA.classList.add('active');mvA.style.pointerEvents='auto';}}}
    var tipVisible=false,dragging=false;
    modelWrap.addEventListener('pointerenter',function(){modelAnchor.classList.add('hovering');if(!dragging){tipVisible=true;modelTip.classList.remove('hidden');gsap.to(modelTip,{opacity:1,duration:0.35,ease:'power2.out'});}});
    modelWrap.addEventListener('pointerleave',function(){modelAnchor.classList.remove('hovering');tipVisible=false;gsap.to(modelTip,{opacity:0,duration:0.3,ease:'power2.out'});});
    modelWrap.addEventListener('pointermove',function(e){var r=modelWrap.getBoundingClientRect();modelShine.style.setProperty('--mx',(((e.clientX-r.left)/r.width)*100)+'%');modelShine.style.setProperty('--my',(((e.clientY-r.top)/r.height)*100)+'%');if(tipVisible&&!dragging){gsap.to(modelTip,{x:e.clientX+22,y:e.clientY+22,duration:0.35,ease:'power2.out',overwrite:'auto'});}});
    modelWrap.addEventListener('pointerdown',function(){dragging=true;modelTip.classList.add('hidden');modelWrap.classList.add('dragging');});
    window.addEventListener('pointerup',function(){dragging=false;modelWrap.classList.remove('dragging');if(tipVisible)modelTip.classList.remove('hidden');});
    modelAnchor.addEventListener('click',function(e){if(e.target.closest('.locus-marker')||e.target.closest('.locus-tag')||e.target.closest('.allele-badge')||e.target.closest('.info-panel')||e.target.closest('.mode-btn')||e.target.closest('.overlay-chip')||e.target.closest('.transmit-node')||e.target.closest('.transmit-label')||e.target.closest('.carry-badge'))return;var rect=modelAnchor.getBoundingClientRect();var rip=document.createElement('div');rip.className='ripple';rip.style.left=(e.clientX-rect.left)+'px';rip.style.top=(e.clientY-rect.top)+'px';modelAnchor.appendChild(rip);gsap.fromTo(rip,{scale:0.3,opacity:0.9},{scale:4,opacity:0,duration:1.1,ease:'expo.out',onComplete:function(){rip.remove();}});});
    function applyTheme(key,animate){var t=THEMES[key],d=animate?0.85:0;gsap.to(root,{duration:d,ease:'power2.inOut','--c-light':t.light,'--c-mid':t.mid,'--c-dark':t.dark,'--accent':t.accent,'--glow':t.glow,'--coil-1':t.coil1,'--coil-2':t.coil2,'--coil-3':t.coil3,'--coil-4':t.coil4});gsap.to(bgOne,{opacity:key==='interphase'?1:0,duration:d,ease:'power2.inOut'});gsap.to(bgTwo,{opacity:key==='metaphase'?1:0,duration:d,ease:'power2.inOut'});}
    function activeButton(){return document.querySelector('.sw.active');}
    function movePill(btn,instant){if(!btn)return;var w=btn.offsetWidth,x=btn.offsetLeft;if(instant)gsap.set(pill,{width:w,x:x});else gsap.to(pill,{width:w,x:x,duration:0.55,ease:'power3.out'});}
    function setFlavor(key){if(busy||key===current)return;busy=true;var prevIndex=ORDER.indexOf(current);var nextIndex=ORDER.indexOf(key);var dir=nextIndex>prevIndex?1:-1;buttons.forEach(function(b){var on=b.dataset.flavor===key;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');});movePill(activeButton(),false);var tl=gsap.timeline({onComplete:function(){busy=false;}});tl.to(chromo,{rotate:-14*dir,scale:0.90,duration:0.42,ease:'power2.in',transformOrigin:'50% 50%'},0).to(layers.coil,{opacity:0.15,duration:0.30,ease:'power2.in'},0).to(particles.map(function(p){return p.el;}),{opacity:0.15,duration:0.3,ease:'power2.in'},0).to(locusLayer,{opacity:0.25,duration:0.3,ease:'power2.in'},0).add(function(){current=key;applyTheme(key,true);showModel(key);}).to(layers.coil,{opacity:1,duration:0.55,ease:'power2.out'}).to(locusLayer,{opacity:1,duration:0.7,ease:'power2.out'}).to(chromo,{rotate:0,scale:1,duration:1.1,ease:'elastic.out(1,0.6)'},'-=0.55');}
    buttons.forEach(function(btn){btn.addEventListener('click',function(){setFlavor(btn.dataset.flavor);});});
    function countUp(){Array.prototype.slice.call(document.querySelectorAll('[data-count]')).forEach(function(el){var end=parseFloat(el.dataset.count);if(!end){el.textContent='0';return;}var obj={v:0};gsap.to(obj,{v:end,duration:1.4,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(obj.v);}});});}
    function startSway(){gsap.to(sway1,{rotationY:20,duration:7.5,ease:'sine.inOut',yoyo:true,repeat:-1,transformOrigin:'50% 50%',transformPerspective:CSS_PERSPECTIVE});gsap.fromTo(sway2,{rotationX:-7},{rotationX:7,duration:9.5,ease:'sine.inOut',yoyo:true,repeat:-1,delay:0.6,transformOrigin:'50% 50%'});gsap.fromTo(sway2,{rotationZ:-4},{rotationZ:4,duration:6,ease:'sine.inOut',yoyo:true,repeat:-1,delay:1.2,transformOrigin:'50% 50%'});gsap.to(floatEl,{y:-26,duration:4.2,ease:'sine.inOut',yoyo:true,repeat:-1});gsap.to(floatEl,{scale:1.04,duration:5.4,ease:'sine.inOut',yoyo:true,repeat:-1,delay:0.9});gsap.fromTo(floatEl,{rotationZ:-1.8},{rotationZ:1.8,duration:4.7,ease:'sine.inOut',yoyo:true,repeat:-1,delay:0.3,transformOrigin:'50% 50%'});gsap.to(halo,{scale:1.09,opacity:0.58,duration:4.8,ease:'sine.inOut',yoyo:true,repeat:-1});}

    var entryScreen = document.getElementById('entryScreen');
    var enterBtn = document.getElementById('enterBtn');
    var fsBtn = document.getElementById('fsBtn');
    var entryLoader = document.getElementById('entryLoader');

    // Bật nút ENTER và Fullscreen
    if (loadedA) {
      enterBtn.classList.add('ready');
      enterBtn.disabled = false;
      fsBtn.classList.add('ready');
      entryLoader.style.display = 'none';
    } else {
      setTimeout(function() {
        enterBtn.classList.add('ready');
        enterBtn.disabled = false;
        fsBtn.classList.add('ready');
        entryLoader.style.display = 'none';
      }, 3000);
    }

    // ========== ENTER CLICK — INK REVEAL V2 ==========
    enterBtn.addEventListener('click', function() {
      if (enterBtn.disabled) return;
      enterBtn.disabled = true;

      gsap.to(entryScreen, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: function () { entryScreen.style.display = 'none'; }
      });

      runInkReveal();
      setTimeout(intro, 300);
    });

    function runInkReveal() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var base0 = document.getElementById('inkBase');
        if (base0) base0.style.display = 'none';
        return;
      }

      var ring1 = document.getElementById('inkRing1');
      var ring2 = document.getElementById('inkRing2');
      var ring3 = document.getElementById('inkRing3');
      var scan  = document.getElementById('inkScanline');
      var sporeBox = document.getElementById('inkSpores');

      var COLORS = ['#7fe3ff', '#b88aff', '#ffd24a', '#ff5a7a', '#6ab4ff'];
      for (var i = 0; i < 60; i++) {
        var sp = document.createElement('div');
        sp.className = 'ink-spore';
        sp.style.setProperty('--spore-color', COLORS[i % COLORS.length]);
        var size = 2 + Math.random() * 5;
        sp.style.width = size + 'px';
        sp.style.height = size + 'px';
        sporeBox.appendChild(sp);

        var angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.6;
        var dist = 120 + Math.random() * 380;
        gsap.fromTo(sp,
          { x: 0, y: 0, scale: 0.2, opacity: 0 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            scale: 1 + Math.random() * 0.8,
            opacity: 0,
            duration: 1.4 + Math.random() * 0.9,
            delay: 0.1 + Math.random() * 0.3,
            ease: 'expo.out',
            onComplete: function () { sp.remove(); }
          }
        );
      }

      [
        { el: ring1, delay: 0.05, scale: 90,  dur: 1.8 },
        { el: ring2, delay: 0.25, scale: 130, dur: 2.0 },
        { el: ring3, delay: 0.45, scale: 170, dur: 2.2 }
      ].forEach(function (r) {
        gsap.set(r.el, { opacity: 0.9, scale: 0.1 });
        gsap.to(r.el, {
          scale: r.scale,
          duration: r.dur,
          delay: r.delay,
          ease: 'expo.out',
          onUpdate: function () {
            r.el.style.opacity = (0.9 * (1 - this.progress())).toFixed(3);
          }
        });
      });

      gsap.set(scan, { display: 'block', scaleX: 0, opacity: 0, height: 2 });
      gsap.timeline({ delay: 0.6 })
        .to(scan, { scaleX: 1, opacity: 1, duration: 1.0, ease: 'power2.out', transformOrigin: '50% 50%' })
        .to(scan, {
          height: 220,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.in',
          onComplete: function () { scan.style.display = 'none'; }
        });

      var tl = gsap.timeline({
        onComplete: function () {
          var base = document.getElementById('inkBase');
          if (base) base.style.display = 'none';
        }
      });

      tl.to('#inkCircle', {
        attr: { r: '150%' },
        duration: 2.2,
        ease: 'power3.inOut'
      }, 0)
      .to('#inkCircle2', {
        attr: { r: '95%' },
        duration: 1.9,
        ease: 'power2.inOut'
      }, 0.15)
      .to('#inkCircle3', {
        attr: { r: '85%' },
        duration: 2.0,
        ease: 'power2.inOut'
      }, 0.3);
    }

    function intro(){
      var hl = document.querySelector('.headline');
      if (!hl || hl.getBoundingClientRect().width === 0) {
        setTimeout(intro, 100);
        return;
      }

      var hlRect = hl.getBoundingClientRect();
      var targetCenterX = window.innerWidth / 2;
      var targetCenterY = window.innerHeight / 2;
      var currentCenterX = hlRect.left + hlRect.width / 2;
      var currentCenterY = hlRect.top + hlRect.height / 2;
      var startX = targetCenterX - currentCenterX;
      var startY = targetCenterY - currentCenterY;

      gsap.set(hl, {
        x: startX,
        y: startY,
        scale: 2.8,
        filter: 'blur(18px) brightness(0.6)',
        transformOrigin: 'center center'
      });

      gsap.set(['.nav', '.content-left > *:not(.headline)', '.model-anchor', '.bottom', '.scroll-hint'], { opacity: 0 });

      var introTl = gsap.timeline({ delay: 0.6 });

      introTl.to(hl, {
        x: 0, y: 0, scale: 1,
        filter: 'blur(0px) brightness(1)',
        ease: 'power3.inOut',
        duration: 1.4
      }, 0)
      .to('.nav', { opacity: 1, duration: 0.5 }, 0.7)
      .to('.content-left > *:not(.headline)', { opacity: 1, stagger: 0.05, duration: 0.8 }, 0.8)
      .to('.model-anchor', { opacity: 1, duration: 1 }, 0.7)
      .to(['.bottom', '.scroll-hint'], { opacity: 1, duration: 0.8 }, 0.9);

      setTimeout(function(){
        startSway();
        countUp();
      }, 1000);
    }

    var dragging2=false;
    [mvA,mvB].forEach(function(m){if(!m)return;m.addEventListener('pointerdown',function(){dragging2=true;});});
    window.addEventListener('pointerup',function(){dragging2=false;});
    if(!reduceMotion){window.addEventListener('mousemove',function(e){if(dragging2)return;if(window.scrollY>window.innerHeight*1.2)return;var nx=(e.clientX/window.innerWidth)-0.5;var ny=(e.clientY/window.innerHeight)-0.5;gsap.to(modelAnchor,{x:nx*24,y:ny*14,duration:1.2,ease:'power2.out',overwrite:'auto'});gsap.to('.content-left',{x:nx*-18,y:ny*-8,duration:1.3,ease:'power2.out',overwrite:'auto'});gsap.to(particleLayer,{x:nx*18,y:ny*10,duration:1.5,ease:'power2.out',overwrite:'auto'});gsap.to(halo,{x:nx*48,y:ny*36,duration:1.6,ease:'power2.out',overwrite:'auto'});},{passive:true});}
    Array.prototype.slice.call(document.querySelectorAll('[data-magnetic], .mode-btn, .sw, .locus-item')).forEach(function(btn){btn.addEventListener('mousemove',function(e){if(reduceMotion)return;var r=btn.getBoundingClientRect();var dx=(e.clientX-r.left-r.width/2)*0.15;var dy=(e.clientY-r.top-r.height/2)*0.15;gsap.to(btn,{x:dx,y:dy,duration:0.4,ease:'power2.out',overwrite:'auto'});});btn.addEventListener('mouseleave',function(){gsap.to(btn,{x:0,y:0,duration:0.55,ease:'elastic.out(1,0.5)',overwrite:'auto'});});});
    var resizeTimer;
    window.addEventListener('resize',function(){clearTimeout(resizeTimer);resizeTimer=setTimeout(function(){movePill(activeButton(),true);if(loadedA){locus3DReady=false;computeLocus3DPositions();}redrawLocusLines();},120);});

    var mainNav=document.getElementById('mainNav');var backToTop=document.getElementById('backToTop');
    function onScroll(){if(mainNav)mainNav.classList.toggle('scrolled',window.scrollY>60);}
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();
    Array.prototype.slice.call(document.querySelectorAll('[data-target]')).forEach(function(el){el.addEventListener('click',function(e){var sel=el.dataset.target;if(!sel)return;var target=document.querySelector(sel);if(!target)return;e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});});});
    if(backToTop)backToTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});

    var fn1Heading = document.getElementById('fn1Heading');
    var fn1Words = fn1Heading ? Array.prototype.slice.call(fn1Heading.querySelectorAll('.word')) : [];
    if (fn1Words.length && !reduceMotion) {
      gsap.set(fn1Words, { yPercent: 110 });
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({ trigger: fn1Heading, start: 'top 78%', once: true,
          onEnter: function() { gsap.to(fn1Words, { yPercent: 0, duration: 1.0, ease: 'expo.out', stagger: 0.12 }); }
        });
      }
      fn1Heading.addEventListener('mouseenter', function() {
        gsap.to(fn1Words, { y: -8, filter: 'drop-shadow(0 0 18px rgba(127,227,255,.7))', duration: 0.35, ease: 'back.out(2)', stagger: 0.07, overwrite: 'auto' });
        gsap.to(fn1Words, { y: 0, filter: 'drop-shadow(0 0 0px rgba(127,227,255,0))', duration: 0.7, ease: 'elastic.out(1, 0.5)', stagger: 0.07, delay: 0.35, overwrite: 'auto' });
      });
    }

    var fn2Heading = document.getElementById('fn2Heading');
    var fn2Chars = [];
    if (fn2Heading) {
      var lineEls = fn2Heading.querySelectorAll('.line');
      lineEls.forEach(function(lineEl){
        var text = lineEl.getAttribute('data-text') || '';
        var isAccent = lineEl.getAttribute('data-accent') === '1';
        lineEl.innerHTML = '';
        for (var i = 0; i < text.length; i++) {
          var c = text[i];
          var sp = document.createElement('span');
          sp.className = 'char' + (c === ' ' ? ' space' : '') + (isAccent ? ' accent' : '');
          sp.textContent = c;
          lineEl.appendChild(sp);
          if (c !== ' ') fn2Chars.push(sp);
        }
      });
      if (!reduceMotion) {
        gsap.set(fn2Chars, { y: -60, opacity: 0, rotate: -25 });
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.create({ trigger: fn2Heading, start: 'top 78%', once: true,
            onEnter: function() { gsap.to(fn2Chars, { y: 0, opacity: 1, rotate: 0, duration: 0.9, ease: 'expo.out', stagger: 0.035 }); }
          });
        }
        fn2Heading.addEventListener('mouseenter', function() {
          gsap.to(fn2Chars, { y: -6, scale: 1.08, duration: 0.28, ease: 'power2.out', stagger: { each: 0.02, from: 'start' }, overwrite: 'auto' });
          gsap.to(fn2Chars, { y: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', stagger: { each: 0.02, from: 'start' }, delay: 0.3, overwrite: 'auto' });
        });
      }
    }

    document.querySelectorAll('#fn1 .fn-point.tilt').forEach(function(card){
      if (reduceMotion) return;
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotationY: x * 10, rotationX: -y * 10, transformPerspective: 800, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      });
      card.addEventListener('mouseleave', function(){
        gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });

    document.querySelectorAll('#fn2 .fn-point').forEach(function(card){
      if (reduceMotion) return;
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotationY: x * 8, rotationX: -y * 8, transformPerspective: 800, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      });
      card.addEventListener('mouseleave', function(){
        gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });

    if(typeof ScrollTrigger!=='undefined'&&!reduceMotion){
      ['#fn1','#fn2'].forEach(function(sel){var section=document.querySelector(sel);if(!section)return;
        gsap.from(sel+' .fn-badge',{scrollTrigger:{trigger:sel,start:'top 78%',toggleActions:'play none none none'},y:24,opacity:0,duration:0.8,ease:'power3.out'});
        gsap.from(sel+' .fn-lede',{scrollTrigger:{trigger:sel,start:'top 70%',toggleActions:'play none none none'},y:30,opacity:0,duration:0.9,ease:'power3.out',delay:0.2});
        if (sel === '#fn1') {
          gsap.from(sel+' .fn-point',{scrollTrigger:{trigger:sel,start:'top 65%',toggleActions:'play none none none'},y:28,opacity:0,duration:0.8,ease:'power3.out',delay:0.35,stagger:0.12});
        } else {
          gsap.from(sel+' .fn-point',{scrollTrigger:{trigger:sel,start:'top 65%',toggleActions:'play none none none'},x:50,opacity:0,duration:0.9,ease:'power3.out',delay:0.3,stagger:0.15});
        }
        gsap.from(sel+' .fn-visual-wrap',{scrollTrigger:{trigger:sel,start:'top 78%',toggleActions:'play none none none'},y:50,opacity:0,scale:0.94,duration:1.2,ease:'power2.out'});
        gsap.to(sel+' .fn-num-deco',{scrollTrigger:{trigger:sel,start:'top bottom',end:'bottom top',scrub:1},y:-100,ease:'none'});
        gsap.to(sel+' .fn-visual-wrap', {
          scrollTrigger: { trigger: sel, start: 'top bottom', end: 'bottom top', scrub: 1 },
          y: -40, ease: 'none'
        });
      });
      
      // Animation cho AI section
      gsap.from('#ai .ai-badge',{scrollTrigger:{trigger:'#ai',start:'top 78%',toggleActions:'play none none none'},y:24,opacity:0,duration:0.8,ease:'power3.out'});
      gsap.from('#ai .fn-heading',{scrollTrigger:{trigger:'#ai',start:'top 75%',toggleActions:'play none none none'},y:30,opacity:0,duration:0.9,ease:'power3.out',delay:0.2});
      gsap.from('#ai .fn-lede',{scrollTrigger:{trigger:'#ai',start:'top 70%',toggleActions:'play none none none'},y:30,opacity:0,duration:0.9,ease:'power3.out',delay:0.3});
      gsap.from('#ai .ai-prompts',{scrollTrigger:{trigger:'#ai',start:'top 68%',toggleActions:'play none none none'},y:20,opacity:0,duration:0.8,ease:'power3.out',delay:0.4});
      gsap.from('#ai .ai-chat-container',{scrollTrigger:{trigger:'#ai',start:'top 65%',toggleActions:'play none none none'},y:50,opacity:0,scale:0.96,duration:1.2,ease:'power3.out'});
    }

    var FEATURE_INFO = {
      gene:       { name: 'Gene',     text: 'Một đoạn ADN mang thông tin mã hoá một sản phẩm (protein hoặc ARN). Khi ADN duỗi xoắn, gene nằm dọc theo chiều dài phân tử.' },
      locus:      { name: 'Locus',    text: 'Vị trí xác định của một gene trên NST. Hai NST trong cặp tương đồng mang các gene tương ứng ở cùng locus.' },
      allele:     { name: 'Allele',   text: 'Các trạng thái khác nhau của cùng một gene, nằm cùng locus trên cặp NST tương đồng. Khác nhau ở một vài vị trí nucleotide.' },
      centromere: { name: 'Tâm động', text: 'Tâm động — nơi hai crômatit chị em dính nhau và là điểm bám của thoi phân bào trong phân chia tế bào.' },
      telomere:   { name: 'Đầu mút',  text: 'Đầu mút (telomere) — vùng trình tự nucleotide lặp lại bảo vệ NST khỏi hư tổn và khỏi dính vào nhau.' }
    };
    var fn1Chips = document.querySelectorAll('#fn1Chips .fn-chip');
    var fn1Hint  = document.getElementById('fn1Hint');
    var fn1Stage = document.getElementById('fn1Stage');
    var fn1Model = document.getElementById('fn1Model');
    var visGene = document.getElementById('visGene');
    var visLocus = document.getElementById('visLocus');
    var visAllele = document.getElementById('visAllele');
    var visCentromere = document.getElementById('visCentromere');
    var visTelomere = document.getElementById('visTelomere');
    var allVis = document.querySelectorAll('.vis-item');

    fn1Chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        if (chip.dataset.feature === structOpenFeature) { closeStructPanel(); return; }
        fn1Chips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        var feature = chip.dataset.feature;
        var info = FEATURE_INFO[feature];
        if (info && fn1Hint) fn1Hint.innerHTML = '<em>' + info.name + ':</em> ' + info.text;
        allVis.forEach(function(v){ v.classList.remove('active'); });
        if(feature === 'gene') visGene.classList.add('active');
        if(feature === 'locus') visLocus.classList.add('active');
        if(feature === 'allele') visAllele.classList.add('active');
        if(feature === 'centromere') visCentromere.classList.add('active');
        if(feature === 'telomere') visTelomere.classList.add('active');
        if (fn1Stage) {
          gsap.fromTo(fn1Stage, { filter: 'brightness(1)' },
            { filter: 'brightness(1.3)', duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.inOut' });
        }
        if (fn1Model) {
          gsap.fromTo(fn1Model, { scale: 1 }, { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' });
        }
        openStructPanel(feature);
      });
    });

    // ===== Struct panel — panel chi tiết cấu trúc (5 đường lui) =====
    var structPanel = document.getElementById('structPanel');
    var structBackdrop = document.getElementById('structBackdrop');
    var structTitle = document.getElementById('structTitle');
    var structDesc = document.getElementById('structDesc');
    var structCloseBtn = document.getElementById('structClose');
    var structFigs = document.querySelectorAll('.struct-fig');
    var structOpenFeature = null;

    function openStructPanel(feature){
      var info = FEATURE_INFO[feature];
      if (!info || !structPanel) return;
      structOpenFeature = feature;
      if (structTitle) structTitle.textContent = info.name;
      if (structDesc) structDesc.textContent = info.text;
      structFigs.forEach(function(f){ f.classList.toggle('active', f.dataset.fig === feature); });
      structPanel.classList.add('open');
      if (structBackdrop) structBackdrop.classList.add('open');
      structPanel.scrollTop = 0;
    }
    function closeStructPanel(){
      structOpenFeature = null;
      if (structPanel) structPanel.classList.remove('open');
      if (structBackdrop) structBackdrop.classList.remove('open');
      fn1Chips.forEach(function(c){ c.classList.remove('active'); });
      allVis.forEach(function(v){ v.classList.remove('active'); });
      if (fn1Hint) fn1Hint.innerHTML = 'Chọn một thành phần để khám phá';
    }
    if (structCloseBtn) structCloseBtn.addEventListener('click', closeStructPanel);
    if (structBackdrop) structBackdrop.addEventListener('click', closeStructPanel);
    if (fn1Stage) fn1Stage.addEventListener('dblclick', function(){ if (structOpenFeature) closeStructPanel(); });
    document.addEventListener('keydown', function(e){
      if ((e.key === 'Escape' || e.key === 'Esc') && structOpenFeature) closeStructPanel();
    });
    // QA/debug: ?struct=gene| locus|allele|centromere|telomere mo panel ngay (tu dong vuot entry screen)
    (function(){
      var m = window.location.search.match(/[?&]struct=(\w+)/);
      if (m && FEATURE_INFO[m[1]]) {
        setTimeout(function(){
          var es = document.getElementById('entryScreen');
          var eb = document.getElementById('enterBtn');
          if (eb && !eb.disabled) { try { eb.click(); } catch(e){} }
          setTimeout(function(){
            if (es && getComputedStyle(es).display !== 'none') es.style.display = 'none';
            openStructPanel(m[1]);
          }, 1500);
        }, 900);
      }
    })();

    document.querySelectorAll('#fn1Stage .fn-hotspot').forEach(function(hs){
      hs.addEventListener('click', function(e){
        e.stopPropagation();
        var gene = hs.dataset.gene;
        if (fn1Hint) {
          var extra = {
            A: 'Gene A: nằm trên cánh ngắn, mã hóa protein cấu trúc quan trọng.',
            B: 'Gene B: gần tâm động, kiểm soát chu kỳ tế bào.',
            D: 'Gene D: trên cánh dài, mã hóa enzyme chuyển hóa.'
          };
          fn1Hint.innerHTML = '<em>' + gene + ':</em> ' + (extra[gene] || '');
        }
        var rect = fn1Stage.getBoundingClientRect();
        var rip = document.createElement('div');
        rip.style.position = 'absolute';
        rip.style.width = '60px'; rip.style.height = '60px';
        rip.style.marginLeft = '-30px'; rip.style.marginTop = '-30px';
        rip.style.borderRadius = '50%';
        rip.style.border = '2px solid var(--hs-color)';
        rip.style.pointerEvents = 'none';
        rip.style.zIndex = '20';
        rip.style.left = (e.clientX - rect.left) + 'px';
        rip.style.top = (e.clientY - rect.top) + 'px';
        fn1Stage.appendChild(rip);
        gsap.fromTo(rip, { scale: 0, opacity: 1 }, { scale: 4, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: function(){ rip.remove(); } });
      });
    });

    var fn2Stage = document.getElementById('fn2Stage');
    var fn2StageText = document.querySelector('#fn2 .stage-text');
    var fn2StageChips = document.querySelectorAll('#fn2 .stage-chip');
    var fn2PlayBtn = document.getElementById('fn2Play');
    var fn2MotherInner = document.getElementById('fn2MotherInner');
    var fn2D1Inner = document.getElementById('fn2D1Inner');
    var fn2D2Inner = document.getElementById('fn2D2Inner');
    var STAGES = ['Interphase', 'Metaphase', 'Anaphase', 'Telophase'];
    var fn2CurrentStage = 0;
    var fn2AutoPlaying = false;
    var fn2Timer = null;

    gsap.set(fn2D1Inner, { opacity: 0, scale: 0.4, xPercent: 0 });
    gsap.set(fn2D2Inner, { opacity: 0, scale: 0.4, xPercent: 0 });

    function setFn2Stage(n) {
      if (n === fn2CurrentStage && n !== 0) return;
      fn2CurrentStage = n;
      if (fn2Stage) fn2Stage.setAttribute('data-stage', n);
      if (fn2StageText) fn2StageText.textContent = STAGES[n];
      fn2StageChips.forEach(function(c, i){ c.classList.toggle('active', i === n); });

      if (n === 0) {
        gsap.to(fn2MotherInner, { opacity: 1, scale: 1, xPercent: 0, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
        gsap.to([fn2D1Inner, fn2D2Inner], { opacity: 0, scale: 0.4, xPercent: 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        fn2D1Inner.classList.remove('show-ring');
        fn2D2Inner.classList.remove('show-ring');
      } else if (n === 1) {
        gsap.to(fn2MotherInner, { opacity: 1, scale: 1.12, xPercent: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        gsap.to([fn2D1Inner, fn2D2Inner], { opacity: 0, scale: 0.4, xPercent: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      } else if (n === 2) {
        gsap.to(fn2MotherInner, { opacity: 0.25, scale: 0.92, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(fn2D1Inner, { opacity: 0.9, scale: 0.85, xPercent: -40, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
        gsap.to(fn2D2Inner, { opacity: 0.9, scale: 0.85, xPercent: 40, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
        setTimeout(function(){ fn2D1Inner.classList.add('show-ring'); fn2D2Inner.classList.add('show-ring'); }, 400);
      } else if (n === 3) {
        gsap.to(fn2MotherInner, { opacity: 0, scale: 0.7, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(fn2D1Inner, { opacity: 1, scale: 1, xPercent: -75, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
        gsap.to(fn2D2Inner, { opacity: 1, scale: 1, xPercent: 75, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
      }
    }

    function playFn2Division() {
      if (fn2Timer) { clearTimeout(fn2Timer); fn2Timer = null; }
      fn2AutoPlaying = true;
      if (fn2PlayBtn) fn2PlayBtn.classList.add('playing');
      setFn2Stage(0);
      var delays = [1400, 1600, 2000, 2600];
      var i = 1;
      function step() {
        if (i >= STAGES.length) {
          fn2Timer = setTimeout(function(){
            setFn2Stage(0); i = 1;
            fn2Timer = setTimeout(step, delays[0]);
          }, 2600);
          return;
        }
        setFn2Stage(i);
        fn2Timer = setTimeout(function(){ i++; step(); }, delays[i]);
      }
      fn2Timer = setTimeout(step, delays[0]);
    }

    if (fn2PlayBtn) fn2PlayBtn.addEventListener('click', playFn2Division);

    fn2StageChips.forEach(function(chip){
      chip.addEventListener('click', function(){
        if (fn2Timer) { clearTimeout(fn2Timer); fn2Timer = null; }
        fn2AutoPlaying = false;
        if (fn2PlayBtn) fn2PlayBtn.classList.remove('playing');
        setFn2Stage(parseInt(chip.dataset.stage, 10));
      });
    });

    if (typeof ScrollTrigger !== 'undefined' && fn2Stage) {
      ScrollTrigger.create({ trigger: fn2Stage, start: 'top 60%', once: true,
        onEnter: function(){ setTimeout(playFn2Division, 400); }
      });
    } else {
      setTimeout(playFn2Division, 3000);
    }

    // ============================================================
    // AI CHAT LOGIC (100+ Q&A DATABASE & SCORING ALGORITHM)
    // ============================================================
    // AI chat (FAQ local + hybrid remote) da tach sang js/chat.js — P5

    function boot(){
      renderFallback();
      createParticles();
      startParticleLoop();
      gsap.ticker.add(updateLocusFollow);
      applyTheme('interphase', false);
      movePill(activeButton(), true);
      setTimeout(redrawLocusLines, 200);
      setTimeout(redrawLocusLines, 800);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function(){ requestAnimationFrame(boot); });
    } else {
      window.addEventListener('load', boot);
    }
  })();
