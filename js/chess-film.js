// The film ends over the actual résumé. Its media clock also drives the last dissolve.
window.playChessFilm = function playChessFilm(screen, finished) {
  const video=document.createElement('video');
  video.className='chess-film';video.muted=true;video.defaultMuted=true;
  video.playsInline=true;video.disablePictureInPicture=true;video.disableRemotePlayback=true;
  video.setAttribute('aria-hidden','true');video.tabIndex=-1;
  screen.insertBefore(video,screen.querySelector('#skip-take'));
  const layout=()=>innerWidth<innerHeight?'tall':'wide';
  let cut,events,watchdog,raf,lastTime=-1,resumeAt=0,stopped=false,hold;
  function guard(){clearTimeout(watchdog);watchdog=setTimeout(finished,5000);}
  function clock(){
    if(stopped)return;
    const t=video.currentTime;
    if(t>lastTime+.12){lastTime=t;guard();}
    if(Number.isFinite(video.duration)){
      const k=Math.max(0,Math.min(1,(t-video.duration+.56)/.56));
      video.style.opacity=String(1-k*k*(3-2*k));
    }
    raf=requestAnimationFrame(clock);
  }
  function open(){
    const next=layout();if(cut===next||stopped)return;
    // Preserve the last presented image while the other composition seeks to the same beat.
    if(cut && video.readyState>=2 && !video.seeking && video.style.visibility!=='hidden'){
      resumeAt=video.currentTime;
      const still=document.createElement('canvas');
      const scale=Math.min(1,1280/Math.max(video.videoWidth,video.videoHeight));
      still.width=Math.max(1,Math.round(video.videoWidth*scale));still.height=Math.max(1,Math.round(video.videoHeight*scale));
      still.getContext('2d').drawImage(video,0,0,still.width,still.height);
      still.className='chess-film film-hold';still.setAttribute('aria-hidden','true');
      still.style.opacity=video.style.opacity;
      hold?.remove();hold=still;screen.insertBefore(hold,video);
    }
    events?.abort();events=new AbortController();
    const {signal}=events;
    cut=next;lastTime=-1;guard();
    if(!hold){screen.classList.add('is-preparing');screen.classList.remove('is-running');}
    video.style.visibility='hidden';
    video.addEventListener('loadedmetadata',()=>{
      if(resumeAt>0)video.currentTime=Math.min(resumeAt,Math.max(0,video.duration-.04));
    },{once:true,signal});
    function present(){
      if(video.seeking || video.readyState<2 || video.currentTime+.09<resumeAt)return;
      screen.classList.remove('is-preparing');screen.classList.add('is-running');
      video.style.visibility='';hold?.remove();hold=null;guard();
    }
    video.addEventListener('playing',present,{signal});
    video.addEventListener('seeked',present,{signal});
    video.addEventListener('ended',finished,{once:true,signal});
    video.addEventListener('error',finished,{once:true,signal});
    video.src='assets/intro/chess-'+cut+'.mp4';
    video.play().catch(()=>{if(!signal.aborted&&!stopped)finished();});
  }
  open();raf=requestAnimationFrame(clock);
  return {
    resize:open,
    clear(){
      stopped=true;events.abort();cancelAnimationFrame(raf);clearTimeout(watchdog);
      video.pause();video.removeAttribute('src');video.load();video.remove();hold?.remove();
    }
  };
};
