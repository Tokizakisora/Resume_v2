/* Gallery v1.0 — 不使用遠端函式庫，可直接以 index.html 開啟。 */
(() => {
  'use strict';
  const data = window.portfolioData;
  if (!data) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const motion = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const grid = $('#project-grid');
  const projectDialog = $('#project-dialog');
  const imageDialog = $('#image-dialog');
  const projects = data.projects.map(project => ({...project, images: project.images.map(item => [...item])}));
  let category = 'all';
  let expanded = false;
  let activeProject = null;
  let mediaIndex = 0;
  let imageRequest = 0;
  let toastTimer;

  window.applyResumeProfile?.();
  const customRobot = String(window.resumeProfile?.robotImage || '').trim();
  if (customRobot && !/^(?:javascript|data):/i.test(customRobot)) {
    const robot = projects.find(project => project.id === 'robot');
    robot.cover = customRobot;
    robot.mediaType = '競賽作品';
    robot.images.unshift([customRobot, window.resumeProfile.robotImageAlt || '機器人競賽作品']);
  }

  grid.innerHTML = projects.map((project, i) => `<article class="project-card${project.featured ? ' featured' : ''}" data-category="${escape(project.category)}" id="work-${escape(project.id)}">
    <div class="project-cover ${escape(project.theme)}"${project.cover.endsWith('.svg') ? ' data-kind="diagram"' : ''}>
      <img src="${escape(project.cover)}" alt="${escape(project.images[0][1])}" loading="lazy" decoding="async" width="800" height="500">
      <span class="project-media-label">${escape(project.mediaType)}</span><span class="project-number" aria-hidden="true">${String(i + 1).padStart(2,'0')}</span>
    </div><div class="project-info"><p class="project-meta">${escape(project.era)}</p><h3>${escape(project.title)}</h3><p class="project-summary">${escape(project.summary)}</p>
      <div class="project-tags">${project.tools.map(tool => `<span class="tag">${escape(tool)}</span>`).join('')}</div>
      <button class="project-open" type="button" data-open-project="${escape(project.id)}" aria-label="查看${escape(project.title)}的作品詳情">查看作品詳情 <span aria-hidden="true">↗</span></button>
    </div></article>`).join('');
  $('#certificate-list').innerHTML = data.certificates.map(cert => `<li><span>${escape(cert.name)}</span><span class="levels">${cert.levels.map(level => `<span${level === '乙級' ? ' class="level-b"' : ''}>${escape(level)}</span>`).join('')}</span></li>`).join('');
  $('#award-list').innerHTML = data.awards.slice(1).map(award => `<article class="award-row reveal"><div><p class="award-group">${escape(award.group)}</p><h3>${escape(award.title)}</h3><small>${escape(award.detail)}</small></div><strong>${escape(award.result)}</strong></article>`).join('');

  function filterProjects(animate = true) {
    const matching = projects.filter(project => category === 'all' || project.category === category);
    const visible = category === 'all' && !expanded ? matching.slice(0, 6) : matching;
    const visibleIds = new Set(visible.map(project => project.id));
    const hasFeature = visible.some(project => project.featured);
    const lastId = visible.at(-1)?.id;
    $$('.project-card', grid).forEach(card => {
      const show = visibleIds.has(card.id.slice(5));
      card.hidden = !show;
      card.classList.toggle('last-wide', show && card.id === `work-${lastId}` && ((visible.length - (hasFeature ? 1 : 0)) % 2 === 1));
      if (show && animate && motion() && card.animate) {
        card.getAnimations().forEach(animation => animation.cancel());
        card.animate([{opacity:.25, transform:'translateY(10px)'}, {opacity:1, transform:'translateY(0)'}], {duration:340, easing:'ease-out'});
      }
    });
    $('#filter-status').textContent = `顯示 ${visible.length} / ${matching.length} 件作品`;
    const more = $('#show-more');
    more.hidden = category !== 'all' || matching.length <= 6;
    more.setAttribute('aria-expanded', String(expanded));
    more.setAttribute('aria-controls', 'project-grid');
    more.innerHTML = expanded ? '收合其餘作品 <span aria-hidden="true">−</span>' : `展開其餘 ${matching.length - 6} 件作品 <span aria-hidden="true">＋</span>`;
    $$('.filters button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  }
  filterProjects(false);
  $$('.filters button').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    expanded = false;
    filterProjects();
  }));
  $('#show-more').addEventListener('click', () => {
    expanded = !expanded;
    filterProjects();
    if (!expanded) $('#projects').scrollIntoView({behavior:motion() ? 'smooth' : 'instant', block:'start'});
  });

  function lockPage() {
    document.body.classList.toggle('modal-open', projectDialog.open || imageDialog.open);
  }
  function closeDialog(dialog) {
    if (!dialog.open || dialog.classList.contains('closing')) return;
    const finish = () => { dialog.close(); dialog.classList.remove('closing'); lockPage(); };
    if (motion()) { dialog.classList.add('closing'); window.setTimeout(finish, 145); }
    else finish();
  }
  [projectDialog, imageDialog].forEach(dialog => {
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
    dialog.addEventListener('close', lockPage);
    let outsideStart = false;
    const outside = event => {
      const box = dialog.getBoundingClientRect();
      return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    };
    dialog.addEventListener('pointerdown', event => { outsideStart = event.target === dialog && outside(event); });
    dialog.addEventListener('click', event => {
      if (outsideStart && event.target === dialog && outside(event)) closeDialog(dialog);
      outsideStart = false;
    });
  });
  $$('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close))));

  function showProject(id) {
    const project = projects.find(item => item.id === id);
    if (!project) return;
    activeProject = project;
    mediaIndex = 0;
    const next = projects[(projects.indexOf(project) + 1) % projects.length];
    $('#detail-content').innerHTML = `<div class="detail-header"><p class="eyebrow">${escape(project.era)} · ${escape(project.tools.join(' / '))}</p><h2 id="detail-title" tabindex="-1">${escape(project.title)}</h2><p>${escape(project.subtitle)}</p></div>
      <div class="detail-layout"><div class="detail-gallery">
        <button type="button" class="detail-main-image" aria-label="放大目前的作品圖片"><img src="${escape(project.images[0][0])}" alt="${escape(project.images[0][1])}"><span aria-hidden="true">放大圖片 ↗</span></button>
        <p class="detail-image-caption">${escape(project.images[0][1])}</p>
        <div class="detail-thumbnails" role="group" aria-label="選擇作品圖片">${project.images.map(([src, alt], i) => `<button type="button" data-media-index="${i}" aria-pressed="${i === 0}" aria-label="圖片 ${i + 1}：${escape(alt)}"><img src="${escape(src)}" alt="" loading="lazy"></button>`).join('')}</div></div>
      <div class="detail-copy"><div class="contribution"><h3>我的程式與實作</h3><p>${escape(project.contribution)}</p></div>
      ${project.details.map(([title, text], i) => `<div class="detail-step"><h3><span aria-hidden="true">${String(i + 1).padStart(2,'0')}</span>${escape(title)}</h3><p>${escape(text)}</p></div>`).join('')}
      ${project.note ? `<p class="detail-note">${escape(project.note)}</p>` : ''}</div></div>
      <div class="dialog-end"><span>${escape(project.tools.join(' · '))}</span><button type="button" data-open-project="${escape(next.id)}">下一件作品：${escape(next.title)} →</button></div>`;
    if (!projectDialog.open) projectDialog.showModal();
    projectDialog.scrollTop = 0;
    $('#detail-title').focus({preventScroll:true});
    lockPage();
  }
  function chooseMedia(index) {
    if (!activeProject) return;
    mediaIndex = (index + activeProject.images.length) % activeProject.images.length;
    const [src, alt] = activeProject.images[mediaIndex];
    const mainImage = $('.detail-main-image img');
    mainImage.hidden = false;
    mainImage.src = src;
    mainImage.alt = alt;
    $('.detail-image-caption').textContent = alt;
    $$('.detail-thumbnails button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.mediaIndex) === mediaIndex)));
    if (imageDialog.open) loadLargeImage();
  }
  function loadLargeImage() {
    const request = ++imageRequest;
    const [src, alt] = activeProject.images[mediaIndex];
    const stage = $('.lightbox-stage');
    const image = $('#large-image');
    $('#image-title').textContent = activeProject.title;
    $('#image-counter').textContent = `${mediaIndex + 1} / ${activeProject.images.length}`;
    $('#previous-image').disabled = $('#next-image').disabled = activeProject.images.length === 1;
    $('#image-error').hidden = true;
    stage.setAttribute('aria-busy', 'true');
    image.hidden = true;
    const incoming = new Image();
    incoming.onload = () => {
      if (request !== imageRequest) return;
      image.src = src;
      image.alt = alt;
      image.hidden = false;
      stage.setAttribute('aria-busy', 'false');
    };
    incoming.onerror = () => {
      if (request !== imageRequest) return;
      $('#image-error').hidden = false;
      stage.setAttribute('aria-busy', 'false');
    };
    incoming.src = src;
  }
  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-open-project]');
    if (opener) { showProject(opener.dataset.openProject); return; }
    const thumbnail = event.target.closest('[data-media-index]');
    if (thumbnail) { chooseMedia(Number(thumbnail.dataset.mediaIndex)); return; }
    if (event.target.closest('.detail-main-image')) {
      imageDialog.showModal();
      loadLargeImage();
      lockPage();
    }
  });
  $('#previous-image').addEventListener('click', () => chooseMedia(mediaIndex - 1));
  $('#next-image').addEventListener('click', () => chooseMedia(mediaIndex + 1));
  imageDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      chooseMedia(mediaIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  // 圖片更換錯誤時保留可讀說明，不留下破圖圖示。
  document.addEventListener('error', event => {
    if (!(event.target instanceof HTMLImageElement) || event.target.id === 'portrait') return;
    const image = event.target;
    if (image.id === 'large-image') return;
    const fallback = document.createElement('span');
    fallback.className = 'image-fallback';
    fallback.textContent = image.alt || '圖片暫時無法載入';
    if (image.nextElementSibling?.classList.contains('image-fallback')) image.nextElementSibling.remove();
    image.hidden = true;
    image.after(fallback);
    image.addEventListener('load', () => { image.hidden = false; fallback.remove(); }, {once:true});
  }, true);

  function toast(text) {
    window.clearTimeout(toastTimer);
    $('#toast').textContent = text;
    $('#toast').classList.add('visible');
    toastTimer = window.setTimeout(() => $('#toast').classList.remove('visible'), 3200);
  }
  $('#copy-email').addEventListener('click', async () => {
    const email = 'hank117012@gmail.com';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      toast('Email 已複製');
    } catch {
      // file:// 或瀏覽器拒絕剪貼簿權限時，嘗試本機選取複製。
      const field = document.createElement('textarea');
      field.value = email;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* 顯示可手動選取的 Email */ }
      field.remove();
      $('#copy-email').focus({preventScroll:true});
      toast(copied ? 'Email 已複製' : '請選取上方 Email，手動複製');
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('entered');
        observer.unobserve(entry.target);
      });
    }, {threshold:.12});
    $$('.reveal,.project-card').forEach(element => observer.observe(element));
  }
  const navigation = $$('.site-nav nav a');
  const sections = navigation.map(link => $(link.getAttribute('href')));
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress').style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    let active = null;
    const readingLine = Math.max($('.site-nav').getBoundingClientRect().bottom + 100, innerHeight * .25);
    sections.forEach(section => { if (section.getBoundingClientRect().top <= readingLine) active = section.id; });
    if (max > 0 && scrollY >= max - 5) active = 'contact';
    navigation.forEach(link => {
      const current = link.hash === `#${active}`;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleScroll() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', scheduleScroll, {passive:true});
  window.addEventListener('resize', scheduleScroll, {passive:true});
  document.fonts?.ready.then(scheduleScroll);
  document.addEventListener('load', scheduleScroll, true);
  updateScroll();

  // 簡歷上的連結可直接打開對應作品；一般頁內導覽不受影響。
  if (location.hash.startsWith('#work-')) showProject(location.hash.slice(6));
})();
