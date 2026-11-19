// Each cut is sampled from elapsed time so replay, resize and a missed frame stay in sync.
window.makeNewScenes = function makeNewScenes(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const sans = '"Gallery Sans","Microsoft JhengHei",sans-serif';
  const serif = '"Gallery Serif","PMingLiU",serif';
  const mono = 'Consolas,monospace';
  let width, height, unit, ratio, portrait;
  function ease(from, to, time) {
    const u = Math.max(0, Math.min(1, (time - from) / (to - from)));
    return u * u * (3 - 2 * u);
  }
  let seed = 749128;
  function noise() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const seeds = Array.from({length: 205}, () => [noise(), noise(), noise(), noise()]);
  const lerp=(a,b,p)=>a+(b-a)*p;
  const loaded={},waiting={};
  const sources={robot:'images/projects/robot-control.svg'};
  for(const item of window.flightWindows)sources[item.id]='assets/windows/'+item.id+'.webp';
  function ready(key){
    if(key==='signal')return document.fonts?.ready;
    if(key!=='network')return null;
    if(!waiting.network)waiting.network=Promise.allSettled([document.fonts?.ready,...Object.entries(sources).map(async ([id,url])=>{
      const image=new Image();image.src=url;await image.decode();loaded[id]=image;
    })]);
    return waiting.network;
  }
  function size() {
    width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);
    unit=Math.min(width,height);portrait=width<height*.94;
    ratio=Math.min(devicePixelRatio||1,1.65,Math.sqrt(2200000/(width*height)));
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  }
  function rect(x, y, w, h, color) {
    ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  }
  function line(x, y, X, Y, color, weight = 1) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(X, Y);
    ctx.strokeStyle = color; ctx.lineWidth = weight; ctx.stroke();
  }
  function text(value, x, y, px, color, weight = 500, family = sans, align = 'left') {
    ctx.fillStyle = color; ctx.font = weight + ' ' + px + 'px ' + family;
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(value, x, y);
  }
  function surface(w,h,paint) {
    const c=document.createElement('canvas');c.width=w;c.height=h;
    paint(c.getContext('2d'));return c;
  }
  const messages=[
    '棋子的下一步，能走哪裡？','C++  ／  中國象棋','LabVIEW  ／  感測與控制','積木拼圖  ／  旋轉與放置',
    'DFS  ／  搜尋可行解','物件導向程式設計實習','機器人  ／  方向校正','App Inventor  ／  觸控攻擊',
    '資料結構','Board  ／  Part  ／  PartLocation','搜尋下一步','三角警示預警系統',
    '讀取關卡限制','檢查合法步法','零件旋轉  90°','恐龍復甦  ／  關卡進度',
    'myRIO  ／  介面整合','操作介面  ／  任務控制','判斷路肩白線','超音波距離偵測',
    '照護機器人  ／  送藥流程','盤面限制檢查','C  ／  文字遊戲','感測  ／  移動  ／  警示'
  ];
  let labels,signature,heroBox,signalField,nameOverlay;
  function messageAtlas(){
    const c=document.createElement('canvas'),g=c.getContext('2d'),row=53;
    const font='560 37px '+sans;g.font=font;
    const widths=messages.map(m=>Math.ceil(g.measureText(m).width)+8);
    c.width=Math.max(...widths);c.height=row*messages.length;
    g.font=font;g.textBaseline='middle';
    messages.forEach((m,i)=>{
      g.fillStyle=i%7===3?'#a9e3e1':i%4===0?'#ffe4f0':'#ff9fc4';
      g.fillText(m,4,(i+.5)*row);
    });
    return {c,widths,row};
  }
  function nameAtlas(){
    const c=surface(800,252,g=>{
      g.font='750 210px '+serif;g.textAlign='center';g.textBaseline='middle';
      g.fillStyle='#ffe9f3';g.fillText('林柏翰',400,129);
    });
    const ink=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    const points=[];
    for(let y=2;y<c.height;y+=6)for(let x=2;x<c.width;x+=6){
      if(ink[(y*c.width+x)*4+3]>100)points.push({x:x/c.width-.5,y:y/c.height-.5});
    }
    return points;
  }
  function locateSignature(){
    const el=document.querySelector('.hero-signature');
    if(el){
      const r=document.createRange();r.selectNodeContents(el);
      const b=r.getBoundingClientRect();
      if(b.width>0 && b.bottom>0 && b.top<height){
        nameOverlay ||=document.createElement('span');
        nameOverlay.setAttribute('aria-hidden','true');nameOverlay.className='name-handoff';nameOverlay.textContent=el.textContent;
        if(!nameOverlay.isConnected)canvas.parentElement.append(nameOverlay);
        const style=getComputedStyle(el);
        for(const prop of ['fontFamily','fontSize','fontWeight','fontStyle','letterSpacing','lineHeight','fontVariationSettings']){
          nameOverlay.style[prop]=style[prop];
        }
        nameOverlay.style.transform='none';nameOverlay.style.opacity='0';
        r.selectNodeContents(nameOverlay);const local=r.getBoundingClientRect(),screen=canvas.parentElement.getBoundingClientRect();
        const ox=local.x+local.width/2-screen.x,oy=local.y+local.height/2-screen.y;
        nameOverlay.style.transformOrigin=ox+'px '+oy+'px';
        return {x:b.x+b.width/2-screen.x,y:b.y+b.height*.5-screen.y,w:b.width/0.7875,ox,oy,color:style.color};
      }
    }
    return {x:width*.50,y:height*.39,w:Math.min(width*.68,height*.43)};
  }
  const streams=Array.from({length:184},(_,i)=>{
    const [a,b,c,d]=seeds[i];
    return {y:b,depth:c,drift:d,phase:a,birth:.15+seeds[(i+63)%205][2]*.87,which:(i*7+Math.floor(b*5))%messages.length};
  });
  function drawStream(t) {
    const gather=ease(1.95,2.77,t);
    if(gather>=1)return;
    const count=portrait?116:streams.length;
    const speed=t*1.27+.78*ease(.31,1.65,t);
    ctx.save();
    for(let i=0;i<count;i++){
      const {y,depth,drift,phase,birth,which}=streams[i];
      if(t<birth)continue;
      const span=1.68,travel=(phase+speed*(.17+.42*depth))%span,sign=i%2?1:-1;
      const x0=sign>0?travel-.34:1.34-travel;
      const z=.39+depth*depth*1.32;
      const x=lerp(x0*width,width*(.49+.13*(phase-.5)),gather);
      const y0=(y+(drift-.5)*.14*t)*height;
      const Y=lerp(y0,height*(.49+.13*(y-.5)),gather);
      const px=Math.max(6,unit*(portrait?.031:.023)*z)*(1-.52*gather);
      const sw=labels.widths[which],dw=sw*px/37,dh=labels.row*px/37;
      if(x+dw/2<0||x-dw/2>width||Y+dh/2<0||Y-dh/2>height)continue;
      ctx.globalAlpha=ease(birth,birth+.16,t)*(.22+.72*depth)*(1-gather);
      ctx.drawImage(labels.c,0,which*labels.row,sw,labels.row,x-dw/2,Y-dh/2,dw,dh);
      if(depth>.76){
        ctx.globalAlpha*=.33;
        const tail=x-sign*dw*.51;
        rect(Math.min(tail,tail-sign*unit*.055),Y,unit*.055,1,'#e991ba');
      }
    }
    ctx.restore();
    const opener=ease(0,.13,t)*(1-ease(.49,.88,t));
    if(opener){
      ctx.save();ctx.globalAlpha=opener;
      text(messages[0],width*.5,height*.49,unit*(portrait?.049:.046),'#ffe0ee',630,sans,'center');ctx.restore();
    }
  }
  function signal(t){
    const handoff=ease(3.96,4.91,t),cx=lerp(width*.5,heroBox.x,handoff);
    const cy=lerp(height*.49,heroBox.y,handoff);
    const w=lerp(Math.min(width*.91,height*1.04),heroBox.w,handoff),h=w*252/800;
    ctx.save();ctx.globalAlpha=1-ease(4.08,5.13,t);
    ctx.drawImage(signalField,0,0,width,height);ctx.restore();
    drawStream(t);
    if(t<1.89)return;
    const build=ease(1.90,3.29,t),tight=ease(2.99,3.54,t);
    if(tight<1){
      const p=signature,skip=portrait?2:1,grain=Math.max(1.4,w*.005);
      ctx.save();ctx.fillStyle='#ffd3e7';
      for(let i=0;i<p.length;i+=skip){
        const [a,b,c,d]=seeds[i%seeds.length];
        const k=ease(.16*d,.83+.16*d,build);
        if(!k)continue;
        const sign=i%2?1:-1;
        const X=lerp(width*(.5+sign*(.48+a*.32)),cx+p[i].x*w,k);
        const Y=lerp(height*(.10+.82*b),cy+p[i].y*h,k)+(1-k)*k*(c-.48)*height*.81;
        ctx.globalAlpha=(1-tight)*k*(.48+.52*c);
        ctx.fillRect(X,Y,grain*(1+(1-k)*6),grain);
      }
      ctx.restore();
    }
    const ink=ease(2.91,3.48,t);
    if(ink && nameOverlay && heroBox.ox!=null){
      nameOverlay.style.opacity=String(ink);
      nameOverlay.style.transform='translate('+(cx-heroBox.ox)+'px,'+(cy-heroBox.oy)+'px) scale('+w/heroBox.w+')';
      const mix=(100*ease(4.23,4.93,t)).toFixed(1);
      nameOverlay.style.color='color-mix(in srgb,#ffe9f3,'+heroBox.color+' '+mix+'%)';
    }else if(ink){
      ctx.save();ctx.globalAlpha=ink*(1-ease(4.3,5.1,t));text('林柏翰',cx,cy,w*.255,'#ffe9f3',750,serif,'center');ctx.restore();
    }
    const rule=ease(2.68,3.33,t)*(1-ease(3.78,4.19,t));
    if(rule){
      const y=cy+h*.57;
      line(cx-w*.31*rule,y,cx+w*.31*rule,y,'rgba(242,178,206,'+rule*.84+')');
      ctx.save();ctx.globalAlpha=rule;
      text('國立臺灣科技大學   ／   資訊工程系',cx,y+unit*.038,Math.max(12,unit*.023),'#f3c9dc',500,sans,'center');ctx.restore();
    }
  }
  function robotExhibit(project){
    return surface(720,310,g=>{
      const accent='#9fe8da',bg=g.createLinearGradient(0,0,710,245);
      bg.addColorStop(0,'#194659');bg.addColorStop(.53,'#133548');bg.addColorStop(1,'#111d39');
      g.fillStyle=bg;g.fillRect(0,0,720,310);
      g.fillStyle='#d4e7ff10';
      for(let x=470;x<721;x+=14)for(let y=20;y<300;y+=14)g.fillRect(x,y,2,2);
      const diagram=loaded.robot;
      if(diagram){
        const scale=250/Math.max(diagram.naturalWidth,diagram.naturalHeight);
        const w=diagram.naturalWidth*scale,h=diagram.naturalHeight*scale;
        g.drawImage(diagram,558-w/2,154-h/2,w,h);
      }
      function label(value,x,y,size,ink,weight=500,family=sans){
        g.fillStyle=ink;g.font=weight+' '+size+'px '+family;
        g.textBaseline='middle';g.fillText(value,x,y,393);
      }
      label('ROBOTICS',29,47,19,accent,500,mono);
      label(project.title,28,132,Math.min(51,371/project.title.length),'#f8f5ff',680);
      label('第 54 屆全國技能競賽',31,191,24,'#e1f1ec');
      label('青年組機器人職類  ／  第一名',31,234,22,'#b4e8d8');
      g.fillStyle=accent;g.fillRect(2,1,98,4);g.fillRect(30,258,46,2);
      g.strokeStyle='#8ebbd0';g.lineWidth=2;g.strokeRect(1,1,718,308);
    });
  }
  let current,flight;
  function resize(){
    size();
    if(current==='signal')heroBox=locateSignature();
  }
  function field(inner,outer){
    return surface(480,320,g=>{
      const wash=g.createRadialGradient(235,149,0,235,149,267);
      wash.addColorStop(0,inner);wash.addColorStop(1,outer);
      g.fillStyle=wash;g.fillRect(0,0,480,320);
    });
  }
  return {
    ready,
    begin(key){
      current=key;resize();
      if(key==='signal'){
        labels ||=messageAtlas();signature ||=nameAtlas();signalField ||=field('#36192e','#0c0a15');
      }else if(key==='network'){
        if(!flight){
          const robot=window.portfolioData.projects.find(p=>p.id==='robot');
          flight=window.createBlueFlight(ctx,robotExhibit(robot),loaded,seeds,ease);
        }
        flight.begin();
      }
    },
    resize,
    frame(key,t){
      ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
      if(key==='signal')signal(t);else flight.frame(t,width,height);
    },
    clear(){flight?.clear();nameOverlay?.remove();canvas.width=canvas.height=1;}
  };
};
