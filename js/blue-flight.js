// A shared camera moves between the competition exhibit and the live, scaled page.
window.createBlueFlight = function createBlueFlight(ctx, robotCard, stills, seeds, ease) {
  const page=document.querySelector('#flight-page');
  const destination={x:2.18,y:.48,z:1,width:1.03};
  const first={x:0,y:0,z:0,width:.98,art:robotCard,aspect:720/310,roll:-.018};
  // Each exhibit has its own image, proportions and position. The inner lane stays open.
  const placements=[
    ['triangle',-1.04,-.63,.56,.68,-.045], ['pieces',.33,-.96,.75,.68,.026],
    ['dino-game',1.22,-.60,.69,.37,.039], ['controller',2.17,-.68,.60,.52,-.045],
    ['console',-.87,.78,.60,.72,.007], ['fire-stage',.44,1.02,.93,.93,-.029],
    ['gripper',1.53,1.39,.55,.46,.023], ['xiangqi',3.17,.30,.54,.60,-.028],
    ['cad',3.11,1.52,.82,.57,.046], ['logic',-.34,-.40,2.94,.83,-.015],
    ['blue-mountains',1.04,.16,2.74,.50,.022], ['dice',-1.62,.45,2.15,.83,-.03],
    ['blocks',.30,.46,3.15,.91,.024], ['solder',1.28,-1.27,2.19,.64,-.041],
    ['rules',2.16,-.13,2.65,.86,.023], ['care',3.41,-.80,2.24,.62,-.05],
    ['pasture',-.56,1.52,2.4,.81,.04], ['family',2.51,1.51,2.26,.65,-.015],
    ['rear',-2.21,-1.52,2.78,.82,.04], ['rotation',.10,-1.83,4.13,.93,-.03],
    ['ruins',2.32,-2.02,3.65,.91,.048], ['commands',4.40,-1.92,3.25,.94,-.027],
    ['shop',-2.49,.94,4.33,.79,-.025], ['monitor',3.87,.79,3.41,.86,.011],
    ['flowchart',-1.21,-.90,4.94,.68,-.03], ['items',.98,1.73,4.10,.84,.03],
    ['prescription',-.92,2.50,3.89,.93,-.02], ['battle-src',2.29,2.66,4.42,.96,.03],
    ['wiring',4.77,.01,4.08,.86,.025], ['lab-panel',3.89,2.79,3.65,.92,-.021]
  ];
  const catalog=new Map(window.flightWindows.map(p=>[p.id,p.aspect]));
  const objects=placements.map(([id,x,y,z,width,roll])=>({x,y,z,width,roll,art:stills[id],aspect:catalog.get(id)}));
  objects.push(first,destination);objects.sort((a,b)=>b.z-a.z);
  // Cubic Hermite interpolation gives both sides of each camera mark the same velocity.
  const route = [
    [0,0,0,-1.19], [.65,.025,.012,-1.26], [1.6,.44,.16,-2.56],
    [2.52,1.05,.31,-3.75], [3.18,1.48,.41,-3.69], [3.95,1.85,.51,-2.98],
    [4.66,2.065,.528,-1.99], [5.32,2.158,.495,-.89],
    [5.95,2.18,.48,-.14], [6.28,2.18,.48,-.03], [6.5,2.18,.48,-.03]
  ];
  function camera(t) {
    const last = route.length-1;
    let i=0;
    while(i<last-1 && t>route[i+1][0]) i++;
    const a=route[i], b=route[i+1], prev=route[Math.max(0,i-1)], next=route[Math.min(last,i+2)];
    const dt=b[0]-a[0], u=Math.max(0, Math.min(1,(t-a[0])/dt)), v=u*u, w=v*u;
    return [1,2,3].map(k=>{
      const m0=(a[k]===b[k]||i===0)?0:(b[k]-prev[k])/(b[0]-prev[0]);
      const m1=(a[k]===b[k]||b[k]===next[k])?0:(next[k]-a[k])/(next[0]-a[0]);
      return (2*w-3*v+1)*a[k]+(w-2*v+u)*dt*m0+(-2*w+3*v)*b[k]+(w-v)*dt*m1;
    });
  }
  function frame(t, width, height) {
    const [cx,cy,cz]=camera(t), unit=Math.min(width,height);
    const focus=ease(2.05,3.50,t), land=ease(5.38,6.24,t);
    function project(o) {
      const depth=o.z-cz;
      return {x:width*(.5+(o.x-cx)/depth), y:height*(.5+(o.y-cy)/depth), depth,
        w:width*o.width/depth*(o===destination?1:Math.min(1,1.52*height/width))};
    }
    const portal=project(destination);
    ctx.fillStyle='#09182e';ctx.fillRect(0,0,width,height);
    const haze=ctx.createRadialGradient(width*.65,height*.35,0,width*.60,height*.47,width*.77);
    haze.addColorStop(0,'#244e70');haze.addColorStop(.48,'#132f50');haze.addColorStop(1,'#071326');
    ctx.fillStyle=haze;ctx.fillRect(0,0,width,height);
    // Depth cues track the same camera. The farther bands slip past the eye more slowly.
    for(let i=0;i<125;i++){
      const [a,b,c,d]=seeds[i],z=2+c*11,sz=(.8+d*1.4)*unit/650;
      const p=project({x:(a-.44)*15,y:(b-.49)*11,z,width:0});
      ctx.fillStyle=i%7?'#a0cbe177':'#d7adbeaa';ctx.fillRect(p.x,p.y,Math.max(1,sz*2.1),Math.max(1,sz));
    }
    for(let i=0;i<7;i++){
      const side=i%2?1:-1, x=1.6+side*(1.9+.35*i),y=(i-3)*.62;
      const a=project({x,y,z:1.1,width:0}),b=project({x,y,z:12,width:0});
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
      ctx.strokeStyle=i%3?'#6dacc128':'#e1a6bc36';ctx.lineWidth=1;ctx.stroke();
    }
    const aspect=height/width;
    function drawPortal() {
      const {x,y,w}=portal, h=w*aspect, left=x-w/2, top=y-h/2, scale=w/width;
      const radius=Math.min(11,w*.023)*(1-land);
      page.style.transform='translate3d('+left+'px,'+top+'px,0) scale('+scale+')';
      ctx.save();ctx.beginPath();ctx.roundRect(left,top,w,h,radius);
      ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';ctx.fill();ctx.restore();
      // The page has the same thin glass edge as the other panes.
      // Its contents, motion and size guide the eye as the camera arrives.
      ctx.save();ctx.globalAlpha=.47*(1-land);ctx.strokeStyle='#b4d0de';
      ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(left,top,w,h,radius);ctx.stroke();ctx.restore();
    }
    for(const obj of objects){
      if(obj===destination){drawPortal();continue;}
      const p=project(obj), h=p.w/obj.aspect;
      if(p.depth<.08 || p.x+p.w*.56<0||p.x-p.w*.56>width||p.y+h*.73<0||p.y-h*.73>height)continue;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(obj.roll);
      ctx.globalAlpha=obj===first?1:(.61+.31*Math.min(1,2.45/p.depth))*
        (.75+.25*ease(.35,1.62,t))*(1-.23*focus);
      if(obj!==first){
        ctx.shadowColor='#05132888';ctx.shadowOffsetY=Math.min(4,h*.02);ctx.shadowBlur=4;
        ctx.fillStyle='#20354b';ctx.fillRect(-p.w/2,-h/2,p.w,h);
        ctx.shadowBlur=0;ctx.shadowOffsetY=0;
      }
      if(obj.art && (obj===first||obj.art.naturalWidth))ctx.drawImage(obj.art,-p.w/2,-h/2,p.w,h);
      if(obj!==first){ctx.strokeStyle='#bad4e37a';ctx.lineWidth=Math.max(.65,Math.min(1.8,p.w*.006));
        ctx.strokeRect(-p.w/2,-h/2,p.w,h);}
      ctx.restore();
    }
  }
  return {
    begin() {
      page.classList.add('in-flight');
    },
    frame,
    clear(){page.classList.remove('in-flight');page.style.removeProperty('transform');}
  };
};
