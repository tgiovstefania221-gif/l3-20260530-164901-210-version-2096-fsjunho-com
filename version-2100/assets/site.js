
(function(){
  const qs = (s, el=document)=>el.querySelector(s);
  const qsa = (s, el=document)=>Array.from(el.querySelectorAll(s));

  function setupNav(){
    const toggle = qs('[data-nav-toggle]');
    const nav = qs('[data-nav]');
    if(!toggle || !nav) return;
    toggle.addEventListener('click', ()=> nav.classList.toggle('open'));
    document.addEventListener('click', (e)=>{
      if(!nav.contains(e.target) && !toggle.contains(e.target)) nav.classList.remove('open');
    });
  }

  function setupHero(){
    const slides = qsa('[data-slide]');
    if(!slides.length) return;
    let idx = slides.findIndex(s=>s.classList.contains('active'));
    if(idx < 0) idx = 0;
    const setActive = (n)=>{
      slides.forEach((s,i)=>s.classList.toggle('active', i===n));
      idx = n;
    };
    const next = ()=> setActive((idx+1) % slides.length);
    const prev = ()=> setActive((idx-1+slides.length) % slides.length);
    const timer = setInterval(next, 4500);
    const root = slides[0].closest('.hero-shell');
    if(root){
      const bts = qsa('[data-carousel-prev], [data-carousel-next]', root);
      bts.forEach(btn=>{
        btn.addEventListener('click', ()=>{
          clearInterval(timer);
          if(btn.matches('[data-carousel-prev]')) prev(); else next();
        });
      });
    }
  }

  function setupFilters(){
    const input = qs('[data-filter-input]');
    const cards = qsa('[data-filter-card]');
    const chips = qsa('[data-filter-chip]');
    if(!input && !chips.length) return;
    const apply = (term='')=>{
      const value = term.trim().toLowerCase();
      cards.forEach(card=>{
        const hay = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.style.display = !value || hay.includes(value) ? '' : 'none';
      });
    };
    if(input){
      input.addEventListener('input', e=>apply(e.target.value));
    }
    chips.forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const term = chip.getAttribute('data-filter-chip') || '';
        if(input) input.value = term;
        chips.forEach(c=>c.classList.remove('active'));
        chip.classList.add('active');
        apply(term);
      });
    });
  }

  function setupPlayer(){
    const wrap = qs('[data-player-wrap]');
    const video = qs('video[data-hls-src]');
    const playBtn = qs('[data-player-play]');
    if(!wrap || !video || !playBtn) return;
    const src = video.getAttribute('data-hls-src');
    let started = false;
    function bind(){
      if(started) return;
      started = true;
      try{
        if(window.Hls && Hls.isSupported()){
          const hls = new Hls({enableWorker:true});
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, ()=> video.play().catch(()=>{}));
          hls.on(Hls.Events.ERROR, function(_, data){ console.warn('HLS error', data); });
        }else if(video.canPlayType('application/vnd.apple.mpegurl')){
          video.src = src;
          video.addEventListener('loadedmetadata', ()=> video.play().catch(()=>{}), {once:true});
        }else{
          video.src = src;
          video.play().catch(()=>{});
        }
        wrap.classList.add('playing');
      }catch(err){
        console.error(err);
        video.src = src;
        video.play().catch(()=>{});
        wrap.classList.add('playing');
      }
    }
    playBtn.addEventListener('click', bind);
    wrap.addEventListener('click', (e)=>{ if(e.target.tagName !== 'VIDEO') bind(); });
  }

  function setupTop(){
    const top = qs('[data-to-top]');
    if(!top) return;
    window.addEventListener('scroll', ()=>{ top.style.opacity = window.scrollY > 480 ? '1' : '.55'; });
    top.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    setupNav(); setupHero(); setupFilters(); setupPlayer(); setupTop();
  });
})();
