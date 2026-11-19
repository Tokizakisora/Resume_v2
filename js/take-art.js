// Real-time motion for the three digital openings. Coordinates are in viewport CSS pixels.
window.makeIntroArtwork = function makeIntroArtwork(canvas) {
  const ctx=canvas.getContext('2d');
  if (!ctx) return null;
  const tau=Math.PI*2;
  const clamp=x=>Math.max(0,Math.min(1,x));
  function ease(a,b,t) { const x=clamp((t-a)/(b-a));return x*x*(3-2*x); }
  let seed=4118500345; // Starting state of the retained Link Start tunnel.
  function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
  const spectrum=['#51ccd8','#f3ab96','#9783d7','#62cbb9','#6d9fdf','#eabf69'];
  const beams=Array.from({length:138},(_,i)=>{
    const angle=random()*tau,rad=.48+random()*1.9;
    return {x:Math.cos(angle)*rad,y:Math.sin(angle)*rad,z:random()*3.4,length:.20+random()*.92,width:.007+random()*.036,color:spectrum[i%spectrum.length]};
  });
  let w,h,m,dpr;
  function size(){
    w=Math.max(1,canvas.clientWidth);h=Math.max(1,canvas.clientHeight);m=Math.min(w,h);
    dpr=Math.min(window.devicePixelRatio||1,1.65,Math.sqrt(2050000/(w*h)));
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  }
  function poly(points,ink){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=ink;ctx.fill();}
  function label(words,x,y,size,ink,weight=600,family='"Gallery Sans","Microsoft JhengHei",sans-serif'){
    ctx.font=weight+' '+size+'px '+family;ctx.fillStyle=ink;ctx.fillText(words,x,y);
  }
  function tunnel(t){
    const release=ease(2.42,3.65,t), launch=ease(.65,2.66,t);
    ctx.save();ctx.globalAlpha=1-release;
    const bg=ctx.createRadialGradient(w*.51,h*.46,0,w*.49,h*.50,Math.hypot(w,h)*.64);
    bg.addColorStop(0,'#fffefa');bg.addColorStop(.42,'#f0eff9');bg.addColorStop(1,'#c4bedc');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    const cam=t*.29+launch*1.08+release*.9, cx=w*(.49+.023*Math.sin(t*1.4)),cy=h*(.46+.023*Math.sin(t*1.7));
    const f=Math.min(w*1.1,h)*.48;
    const projected=beams.map(b=>({b,z:((b.z-cam)%3.4+3.4)%3.4+.07})).sort((a,b)=>b.z-a.z);
    for(const {b,z} of projected){
      const far=f/(z+b.length),near=f/z;
      const x=cx+b.x*far,y=cy+b.y*far,X=cx+b.x*near,Y=cy+b.y*near;
      const r=Math.max(.5,b.width*near),rr=Math.max(.3,b.width*far);
      const mag=Math.hypot(b.x,b.y),nx=-b.y/mag,ny=b.x/mag;
      const corners=[[x-nx*rr,y-ny*rr],[X-nx*r,Y-ny*r],[X+nx*r,Y+ny*r],[x+nx*rr,y+ny*rr]];
      ctx.globalAlpha=(1-release)*(.58+.42*clamp(1-z/3.8));poly(corners,b.color);
      ctx.globalAlpha=(1-release)*.49;poly([[x,y],[X,Y],corners[2],corners[3]],'#fff');
      ctx.globalAlpha=(1-release)*.74;poly([corners[1],[X+b.x*r*.85,Y+b.y*r*.85],corners[2],[X,Y]],b.color);
    }
    ctx.globalAlpha=(1-ease(1.64,2.48,t))*(1-release);ctx.textAlign='center';
    const fs=Math.min(w*.117,m*.131,106), spacing=fs*.71, word='LINK START';
    word.split('').forEach((c,i)=>{const a=ease(.025*i,.43+.025*i,t);ctx.save();ctx.globalAlpha*=a;
      label(c,cx+(i-4.5)*spacing,cy+(1-a)*fs*.56,fs,'#36394c',380,'system-ui,sans-serif');ctx.restore();});
    ctx.restore();
  }
  return {
    begin:size, resize:size,
    frame(kind,t){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);tunnel(t);},
    clear(){canvas.width=canvas.height=1;}
  };
};
