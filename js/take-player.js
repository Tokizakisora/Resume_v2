(() => {
  const editions=['signal','network','world','link'];
  const duration={signal:5200,network:6500,link:3670};
  const doc=document.documentElement, qs=new URLSearchParams(location.search);
  let stored=null;
  try{stored=sessionStorage.getItem('gallery-take-10');}catch{}
  const valid=k=>editions.includes(k);
  let current=[qs.get('watch'),qs.get('take'),stored].find(valid)||'world';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const menu=document.querySelector('#take-menu');
  const screen=document.querySelector('#take-screen');
  function theme(key){
    current=key;doc.dataset.edition=key;
    try{sessionStorage.setItem('gallery-take-10',key);}catch{}
  }
  theme(current);

  // A local file URL can have browser storage disabled. Keep the edition on document links, too.
  function editionURL(href){
    const u=new URL(href,location.href);
    if(!/^(index|resume)\.html$/.test(u.pathname.split('/').pop()))return href;
    u.searchParams.set('take',current);return u.href;
  }
  window.galleryTakeURL=editionURL;
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('a[href]');if(!a)return;
    const href=a.getAttribute('href');if(/^(index|resume)\.html(?:[?#]|$)/.test(href))a.href=editionURL(href);
  },true);
  if(!screen || !menu || !screen.showModal)return;
  document.querySelector('.take-actions').hidden=false;

  const picker=document.querySelector('#choose-take'), replay=document.querySelector('#replay-take');
  const canvas=screen.querySelector('canvas');
  const linkArt=window.makeIntroArtwork(canvas), freshArt=window.makeNewScenes(canvas);
  let art=null;
  const gutter=()=>doc.style.setProperty('--take-gutter',Math.max(0,innerWidth-doc.getBoundingClientRect().width)+'px');
  let raf=0,timer=0,run=0,restore=null;
  function remember(){
    try {const u=new URL(location.href);u.searchParams.delete('watch');u.searchParams.set('take',current);history.replaceState(history.state,'',u.href);}catch{}
  }
  function finish(){
    if(!screen.open)return;
    run++;cancelAnimationFrame(raf);clearTimeout(timer);
    screen.close();screen.classList.remove('is-running','is-preparing');canvas.style.opacity='';canvas.style.visibility='';
    art?.clear();doc.style.removeProperty('--take-gutter');
    if(restore?.isConnected)restore.focus({preventScroll:true});
    restore=null;
  }
  function play(key,userGesture){
    if(!valid(key)||screen.open)return;
    theme(key);remember();
    const fromMenu=menu.open;
    if(fromMenu)menu.close();else gutter();
    restore=userGesture?(fromMenu?document.getElementById('hero-title'):replay):null;
    window.scrollTo({top:0,behavior:'instant'});
    const id=++run;
    screen.dataset.mode=key;
    screen.showModal();
    screen.classList.remove('is-running');
    if(key==='world'){
      art=null;
      if(motion.matches){finish();return;}
      canvas.style.visibility='hidden';
      art=window.playChessFilm(screen,()=>{if(id===run)finish();});
      return;
    }
    art=key==='link'?linkArt:freshArt;
    if(motion.matches||!art){finish();return;}
    const limit=duration[key];
    function startWhenReady(){
      if(id!==run || !screen.open)return;
      canvas.style.visibility='';
      timer=setTimeout(finish,limit+550);
      art.begin(key);
      void screen.offsetWidth;
      screen.classList.add('is-running');
      const start=performance.now();
      function tick(now){
        if(id!==run || !screen.open)return;
        const t=Math.max(0,now-start);
        if(t>=limit){finish();return;}
        art.frame(key,t/1000);
        raf=requestAnimationFrame(tick);
      }
      tick(start);
    }
    const ready=art.ready?.(key);
    if(ready){
      canvas.style.visibility='hidden';
      screen.classList.add('is-preparing');
      ready.then(()=>{if(run===id){screen.classList.remove('is-preparing');startWhenReady();}});
    }else startWhenReady();
  }
  function showMenu(){
    if(menu.open)return;
    gutter();menu.showModal();
  }
  function dismiss(){
    if(menu.open)menu.close();
    remember();doc.style.removeProperty('--take-gutter');document.getElementById('hero-title').focus({preventScroll:true});
  }
  menu.querySelectorAll('[data-take]').forEach(b=>b.addEventListener('click',()=>play(b.dataset.take,true)));
  document.getElementById('menu-dismiss').addEventListener('click',dismiss);
  menu.addEventListener('cancel',e=>{e.preventDefault();dismiss();});
  picker.addEventListener('click',showMenu);replay.addEventListener('click',()=>play(current,true));
  document.getElementById('skip-take').addEventListener('click',finish);
  screen.addEventListener('cancel',e=>{e.preventDefault();finish();});
  window.addEventListener('resize',()=>{if(screen.open)art?.resize();});
  window.addEventListener('pagehide',finish);window.addEventListener('hashchange',finish);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
  motion.addEventListener('change',()=>{if(motion.matches)finish();});
  if(!location.hash&&!qs.has('from')){
    if(valid(qs.get('watch')))play(qs.get('watch'),false);
    else if(!valid(qs.get('take')) && performance.getEntriesByType('navigation')[0]?.type!=='back_forward')showMenu();
  }
})();
