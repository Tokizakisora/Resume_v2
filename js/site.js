/* Gallery v1.3 — 本機履歷與作品圖集。 */
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
  const projects = data.projects.map(project => ({...project, ...window.portfolioPresentation?.[project.id], images: project.images.map(item => [...item])}));
  let category = 'all';
  let expanded = false;
  let catalog = false;
  let browsingProjects = projects;
  let activeProject = null;
  let mediaIndex = 0;
  let imageRequest = 0;
  let toastTimer;
  let projectOpener;
  let zoomed = false;
  let drag = null;
  const coverIndices = new Map();
  const coverRequests = new Map();

  window.applyResumeProfile?.();
  const customRobot = String(window.resumeProfile?.robotImage || '').trim();
  if (customRobot && !/^(?:javascript|data):/i.test(customRobot)) {
    const robot = projects.find(project => project.id === 'robot');
    robot.cover = customRobot;
    robot.mediaType = '競賽作品';
    robot.kind = 'photo';
    robot.labels = ['競賽作品', ...(robot.labels || [])];
    robot.images.unshift([customRobot, window.resumeProfile.robotImageAlt || '機器人競賽作品']);
  }

  function imageKind(project, index) {
    return project.imageKinds?.[index] || (index === 0 ? project.kind : project.kind === 'object' ? 'object' : 'interface') || 'photo';
  }
  function coverMarkup(project, index = 0) {
    const image = `<img src="${escape(index === 0 ? project.cover : project.images[index][0])}" alt="${escape(project.images[index][1])}" loading="lazy" decoding="async" width="800" height="500">`;
    if (index !== 0) return image;
    if (project.kind === 'phone') return `<div class="phone-composition"><div class="device-frame">${image}</div><div class="phone-note" aria-hidden="true"><small>APP INVENTOR</small><strong>讓程式，<br>回應每次操作。</strong><span>觸控攻擊</span><span>關卡與頭目</span><span>商店解鎖</span></div></div>`;
    if (project.kind === 'terminal') return `<div class="terminal-window"><div class="terminal-title" aria-hidden="true"><i></i><i></i><i></i><span>C / CONSOLE GAME</span></div>${image}</div>`;
    if (project.id === 'care' && project.images[2]) return `<div class="prototype-composition">${image}<div class="interface-inset"><img src="${escape(project.images[2][0])}" alt="${escape(project.images[2][1])}" loading="lazy" decoding="async"><span>${escape(project.labels?.[2] || '操作介面')}</span></div></div>`;
    return image;
  }
  grid.innerHTML = projects.map(project => `<article class="project-card${project.featured ? ' featured' : ''}" data-category="${escape(project.category)}" id="work-${escape(project.id)}">
    <div class="catalog-thumb ${escape(project.theme)}" aria-hidden="true"><img src="${escape(project.cover)}" loading="lazy" decoding="async" alt=""></div>
    <div class="project-cover ${escape(project.theme)}" data-presentation="${escape(project.kind || 'photo')}">
      <div class="media-stage">${coverMarkup(project)}</div>
      <div class="media-caption"><span class="cover-caption">${escape(project.mediaType)}</span><div class="cover-navigation">${project.images.length > 1 ? `<button type="button" data-cover-step="-1" aria-label="${escape(project.title)}：上一張預覽">←</button><span class="cover-count" aria-live="polite" aria-atomic="true">01 / ${String(project.images.length).padStart(2,'0')}</span><button type="button" data-cover-step="1" aria-label="${escape(project.title)}：下一張預覽">→</button>` : '<span class="cover-single">單張作品圖 ↗</span>'}</div></div>
    </div><div class="project-info"><p class="project-meta">${escape(project.era)}</p><h3>${escape(project.title)}</h3><p class="project-summary">${escape(project.summary)}</p>
      <div class="project-tags">${project.tools.map(tool => `<span class="tag">${escape(tool)}</span>`).join('')}</div>
      <button class="project-open" type="button" data-open-project="${escape(project.id)}" aria-label="查看${escape(project.title)}的作品詳情">查看詳情</button>
    </div></article>`).join('');
  const credentialsByLevel = new Map();
  for (const certificate of data.certificates) {
    for (const level of certificate.levels) {
      if (!credentialsByLevel.has(level)) credentialsByLevel.set(level, []);
      credentialsByLevel.get(level).push(certificate.name);
    }
  }
  $('#certificate-list').innerHTML = Array.from(credentialsByLevel, ([level, names]) => `
    <section class="credential-level">
      <h4>${escape(level)}技術士 <small>${names.length} 張</small></h4>
      <ul>${names.map(name => `<li>${escape(name)}</li>`).join('')}</ul>
    </section>`).join('');
  const awardsByGroup = new Map();
  for (const award of data.awards.slice(1)) {
    if (!awardsByGroup.has(award.group)) awardsByGroup.set(award.group, []);
    awardsByGroup.get(award.group).push(award);
  }
  $('#award-list').innerHTML = Array.from(awardsByGroup, ([group, awards]) => `
    <section class="honor-group"><h3>${escape(group)}</h3>
      ${awards.map(award => `<article class="award-row"><div><h4>${award.projectId
        ? `<button type="button" data-open-project="${escape(award.projectId)}" aria-label="${escape(award.title)}，查看相關作品">${escape(award.title)}</button>`
        : escape(award.title)}</h4><small>${escape(award.detail)}</small></div>
        <strong>${escape(award.result)}</strong></article>`).join('')}
    </section>`).join('');

  async function previewCover(project, index) {
    index = (index + project.images.length) % project.images.length;
    coverIndices.set(project.id, index);
    const request = (coverRequests.get(project.id) || 0) + 1;
    coverRequests.set(project.id, request);
    const card = document.getElementById(`work-${project.id}`);
    const cover = $('.project-cover', card), stage = $('.media-stage', card);
    stage.setAttribute('aria-busy', 'true');
    $('.cover-count', card).textContent = `${String(index + 1).padStart(2,'0')} / ${String(project.images.length).padStart(2,'0')}`;
    $('.cover-caption', card).textContent = project.labels?.[index] || `作品圖片 ${index + 1}`;
    const incoming = new Image();
    incoming.src = index === 0 ? project.cover : project.images[index][0];
    let loaded = true;
    try { await incoming.decode(); } catch { loaded = false; }
    if (coverRequests.get(project.id) !== request) return;
    cover.dataset.presentation = imageKind(project, index);
    stage.innerHTML = loaded ? coverMarkup(project, index) : '<span class="image-fallback">圖片暫時無法載入，請切換其他圖片。</span>';
    stage.setAttribute('aria-busy', 'false');
    if (motion() && stage.animate) {
      stage.getAnimations().forEach(animation => animation.cancel());
      stage.animate([{opacity:.35,transform:'translateX(5px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
    }
  }

  function filterProjects(animate = true) {
    const cards = $$('.project-card', grid);
    const previous = new Map(cards.filter(card => !card.hidden).map(card => [card, card.getBoundingClientRect()]));
    const matching = projects.filter(project => category === 'all' || project.category === category);
    const visible = category === 'all' && !expanded && !catalog ? matching.slice(0, 6) : matching;
    const visibleIds = new Set(visible.map(project => project.id));
    const hasFeature = visible.some(project => project.featured);
    const lastId = visible.at(-1)?.id;
    grid.classList.toggle('catalog', catalog);
    cards.forEach(card => {
      const show = visibleIds.has(card.id.slice(5));
      card.hidden = !show;
      card.classList.toggle('last-wide', show && card.id === `work-${lastId}` && ((visible.length - (hasFeature ? 1 : 0)) % 2 === 1));
      if (animate) {
        card.classList.remove('reveal-ready');
        card.getAnimations().forEach(animation => animation.cancel());
      }
    });
    if (animate && motion()) cards.filter(card => !card.hidden).forEach((card, i) => {
      const before = previous.get(card), after = card.getBoundingClientRect();
      if (after.top > innerHeight || after.bottom < 0 || !card.animate) return;
      const moved = before && before.top < innerHeight && before.bottom > 0 && Math.abs(before.width - after.width) < 2;
      if (moved && Math.abs(before.left-after.left) < 1 && Math.abs(before.top-after.top) < 1) return;
      const from = moved ? {transform:`translate(${before.left-after.left}px,${before.top-after.top}px)`} : {opacity:.2,transform:'translateY(10px)'};
      card.animate([from,{opacity:1,transform:'none'}],{duration:340,delay:moved?0:Math.min(i*35,100),fill:'backwards',easing:'cubic-bezier(.22,.7,.3,1)'});
    });
    $('#filter-status').textContent = `顯示 ${visible.length} / ${matching.length} 件作品`;
    const more = $('#show-more');
    more.hidden = catalog || category !== 'all' || matching.length <= 6;
    more.parentElement.hidden = more.hidden;
    more.setAttribute('aria-expanded', String(expanded));
    more.setAttribute('aria-controls', 'project-grid');
    more.innerHTML = expanded ? '收合其餘作品 <span aria-hidden="true">−</span>' : `展開其餘 ${matching.length - 6} 件作品 <span aria-hidden="true">＋</span>`;
    $$('.filters button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  }
  filterProjects(false);
  const views = $$('.view-picker button');
  views.forEach(button => button.addEventListener('click', () => {
    const wantCatalog = button.dataset.view === 'catalog';
    if (catalog === wantCatalog) return;
    catalog = wantCatalog;
    views.forEach(view => view.setAttribute('aria-pressed', String(view === button)));
    filterProjects();
  }));
  $$('.filters button').forEach(button => button.addEventListener('click', () => {
    if (category === button.dataset.filter) return;
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
  projectDialog.addEventListener('close', () => { if (projectOpener?.isConnected) projectOpener.focus({preventScroll:true}); });
  imageDialog.addEventListener('close', () => { imageRequest++; resetZoom(); });
  $$('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close))));

  function updateDetailContext() {
    if (!projectDialog.open || !activeProject) return;
    const toolbar = $('.dialog-toolbar', projectDialog);
    const titleHidden = $('#detail-title').getBoundingClientRect().bottom <= toolbar.getBoundingClientRect().bottom;
    const label = titleHidden ? activeProject.title : activeProject.era;
    const context = $('.detail-context', toolbar);
    if (context.textContent !== label) context.textContent = label;
    context.classList.toggle('shows-title', titleHidden);
  }
  projectDialog.addEventListener('scroll', updateDetailContext, {passive:true});
  window.addEventListener('resize', updateDetailContext);

  function showProject(id, initialIndex = 0) {
    const project = projects.find(item => item.id === id);
    if (!project) return;
    activeProject = project;
    mediaIndex = Math.max(0, Math.min(initialIndex, project.images.length - 1));
    const switching = projectDialog.open;
    if (!switching) {
      projectOpener = document.activeElement;
      browsingProjects = projectOpener?.closest('.project-card') && category !== 'all'
        ? projects.filter(item => item.category === category) : projects;
    }
    const next = browsingProjects[(browsingProjects.indexOf(project) + 1) % browsingProjects.length];
    const [src, alt] = project.images[mediaIndex];
    projectDialog.dataset.project = project.id;
    $('#detail-content').innerHTML = `<div class="detail-header"><h2 id="detail-title" tabindex="-1">${escape(project.title)}</h2><p class="detail-subtitle">${escape(project.subtitle)}</p><div class="detail-tools">${project.tools.map(tool=>`<span>${escape(tool)}</span>`).join('')}</div></div>
      <div class="detail-layout"><div class="contribution"><h3>我的程式與實作</h3><p>${escape(project.contribution)}</p></div><div class="detail-gallery" data-media-kind="${escape(imageKind(project,mediaIndex))}">
        <button type="button" class="detail-main-image" aria-label="放大目前的作品圖片"><img src="${escape(src)}" alt="${escape(alt)}"></button>
        <div class="gallery-toolbar"><span id="detail-image-count" aria-live="polite">${String(mediaIndex+1).padStart(2,'0')} / ${String(project.images.length).padStart(2,'0')}</span><span id="detail-image-label">${escape(project.labels?.[mediaIndex] || project.mediaType)}</span><div class="gallery-actions">${project.images.length > 1 ? '<button type="button" data-gallery-step="-1" aria-label="詳情上一張圖片">←</button><button type="button" data-gallery-step="1" aria-label="詳情下一張圖片">→</button>' : ''}<button type="button" class="gallery-zoom" aria-label="檢視作品大圖">大圖 ↗</button></div></div>
        <p class="detail-image-caption">${escape(alt)}</p>
        ${project.images.length > 1 ? `<div class="detail-thumbnails" role="group" aria-label="選擇作品圖片">${project.images.map(([src, alt], i) => `<button type="button" data-media-index="${i}" aria-pressed="${i === mediaIndex}" aria-label="圖片 ${i + 1}：${escape(alt)}"><img src="${escape(src)}" alt="" loading="lazy"><span>${escape(project.labels?.[i] || `圖片 ${i + 1}`)}</span></button>`).join('')}</div>` : ''}</div>
      <div class="detail-copy">
      ${project.details.map(([title, text], i) => `<div class="detail-step"><h3><span aria-hidden="true">${String(i + 1).padStart(2,'0')}</span>${escape(title)}</h3><p>${escape(text)}</p></div>`).join('')}
      ${project.note ? `<p class="detail-note">${escape(project.note)}</p>` : ''}</div></div>
      <div class="dialog-end"><button type="button" data-open-project="${escape(next.id)}">下一件作品：${escape(next.title)}</button></div>`;
    if (!projectDialog.open) projectDialog.showModal();
    projectDialog.scrollTop = 0;
    $('#detail-title').focus({preventScroll:true});
    scrollSelectedThumbnail(false);
    updateDetailContext();
    if (switching && motion()) $('#detail-content').animate([{opacity:.55},{opacity:1}],{duration:180,easing:'ease-out'});
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
    $('.detail-gallery').dataset.mediaKind = imageKind(activeProject,mediaIndex);
    $('.detail-image-caption').textContent = alt;
    $('#detail-image-count').textContent = `${String(mediaIndex + 1).padStart(2,'0')} / ${String(activeProject.images.length).padStart(2,'0')}`;
    $('#detail-image-label').textContent = activeProject.labels?.[mediaIndex] || `圖片 ${mediaIndex + 1}`;
    $$('.detail-thumbnails button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.mediaIndex) === mediaIndex)));
    scrollSelectedThumbnail();
    if (imageDialog.open) loadLargeImage();
  }
  function scrollSelectedThumbnail(animate = true) {
    const selected = $('.detail-thumbnails button[aria-pressed="true"]');
    if (selected) selected.parentElement.scrollTo({left:selected.offsetLeft - selected.parentElement.offsetLeft - (selected.parentElement.clientWidth - selected.offsetWidth)/2,behavior:animate && motion() ? 'smooth' : 'instant'});
  }
  function loadLargeImage() {
    const request = ++imageRequest;
    const [src, alt] = activeProject.images[mediaIndex];
    const stage = $('.lightbox-stage');
    const image = $('#large-image');
    resetZoom();
    $('#zoom-image').disabled = true;
    $('#image-title').textContent = activeProject.title;
    $('#image-counter').textContent = `${mediaIndex + 1} / ${activeProject.images.length}`;
    $('#image-caption').textContent = alt;
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
      $('#zoom-image').disabled = false;
      if (motion() && image.animate) image.animate([{opacity:.3},{opacity:1}],{duration:180,easing:'ease-out'});
    };
    incoming.onerror = () => {
      if (request !== imageRequest) return;
      $('#image-error').hidden = false;
      stage.setAttribute('aria-busy', 'false');
    };
    incoming.src = src;
  }
  document.addEventListener('click', event => {
    const coverStep = event.target.closest('[data-cover-step]');
    if (coverStep) {
      const id = coverStep.closest('.project-card').id.slice(5);
      const project = projects.find(project=>project.id === id);
      previewCover(project,(coverIndices.get(id) || 0) + Number(coverStep.dataset.coverStep));
      return;
    }
    const opener = event.target.closest('[data-open-project]');
    if (opener) {
      if (!projectDialog.open) opener.focus({preventScroll:true});
      const fromCover = !catalog && opener.closest('.project-card');
      showProject(opener.dataset.openProject, fromCover ? (coverIndices.get(opener.dataset.openProject) || 0) : 0);
      return;
    }
    const thumbnail = event.target.closest('[data-media-index]');
    if (thumbnail) { chooseMedia(Number(thumbnail.dataset.mediaIndex)); return; }
    const step = event.target.closest('[data-gallery-step]');
    if (step) { chooseMedia(mediaIndex + Number(step.dataset.galleryStep)); return; }
    if (event.target.closest('.detail-main-image,.gallery-zoom')) {
      imageDialog.showModal();
      loadLargeImage();
      lockPage();
    }
  });
  projectDialog.addEventListener('keydown', event => {
    if (imageDialog.open || event.altKey || event.ctrlKey || event.metaKey || !activeProject || activeProject.images.length < 2) return;
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !event.target.closest('.dialog-end')) {
      event.preventDefault();
      chooseMedia(mediaIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  $('#previous-image').addEventListener('click', () => chooseMedia(mediaIndex - 1));
  $('#next-image').addEventListener('click', () => chooseMedia(mediaIndex + 1));
  imageDialog.addEventListener('keydown', event => {
    if (!zoomed && !event.altKey && !event.ctrlKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      chooseMedia(mediaIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  function resetZoom() {
    zoomed = false;
    drag = null;
    const viewport = $('#image-viewport');
    viewport.classList.remove('zoomed','dragging');
    $('#image-canvas').removeAttribute('style');
    $('#large-image').removeAttribute('style');
    $('#zoom-image').setAttribute('aria-pressed','false');
    $('#zoom-image').textContent = '放大 2×';
    $('#image-hint').textContent = window.matchMedia('(pointer:coarse)').matches && activeProject?.images.length > 1 ? '左右滑動切換圖片；放大可查看細節' : '點選放大，可查看圖片細節';
    viewport.scrollTo(0,0);
  }
  $('#zoom-image').addEventListener('click', () => {
    if (zoomed) { resetZoom(); return; }
    const image = $('#large-image');
    const viewport = $('#image-viewport');
    const ratio = Math.min((viewport.clientWidth - 40) / image.naturalWidth, (viewport.clientHeight - 40) / image.naturalHeight, 1);
    const width = Math.round(image.naturalWidth * ratio * 2);
    const height = Math.round(image.naturalHeight * ratio * 2);
    zoomed = true;
    viewport.classList.add('zoomed');
    $('#image-canvas').style.cssText = `width:${width + 40}px;height:${height + 40}px`;
    image.style.cssText = `width:${width}px;height:${height}px;max-width:none;max-height:none`;
    $('#zoom-image').setAttribute('aria-pressed','true');
    $('#zoom-image').textContent = '恢復全圖';
    $('#image-hint').textContent = '拖曳或捲動，查看圖片細節';
    viewport.scrollTo((viewport.scrollWidth-viewport.clientWidth)/2,(viewport.scrollHeight-viewport.clientHeight)/2);
  });
  const viewport = $('#image-viewport');
  let swipe = null;
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || zoomed || !activeProject || activeProject.images.length < 2) return;
    if (!event.isPrimary) { swipe = null; return; }
    swipe = {id:event.pointerId,x:event.clientX,y:event.clientY};
  });
  viewport.addEventListener('pointerup', event => {
    if (!swipe || swipe.id !== event.pointerId) return;
    const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
    swipe = null;
    if (!zoomed && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)*1.5) chooseMedia(mediaIndex + (dx < 0 ? 1 : -1));
  });
  viewport.addEventListener('pointercancel', () => { swipe = null; });
  viewport.addEventListener('pointerdown', event => {
    if (!zoomed || event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('dragging');
    event.preventDefault();
  });
  viewport.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    viewport.scrollLeft = drag.left - (event.clientX - drag.x);
    viewport.scrollTop = drag.top - (event.clientY - drag.y);
  });
  for (const name of ['pointerup','pointercancel','lostpointercapture']) viewport.addEventListener(name, () => { drag = null; viewport.classList.remove('dragging'); });
  window.addEventListener('resize', () => { if (zoomed) resetZoom(); });
  document.addEventListener('load', event => {
    if (event.target.matches?.('.detail-main-image img') && motion() && event.target.animate) event.target.animate([{opacity:.4},{opacity:1}],{duration:190});
  },true);

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
    const email = $('.contact-email').textContent.trim();
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

  if ('IntersectionObserver' in window && motion()) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, {threshold:.08});
    $$('.reveal,.project-card').forEach(element => {
      if (element.hidden || element.getBoundingClientRect().top < innerHeight) return;
      element.classList.add('reveal-ready');
      observer.observe(element);
    });
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
  if (location.hash.startsWith('#work-')) {
    const projectId = location.hash.slice(6);
    if (projects.some(project => project.id === projectId)) {
      if (new URLSearchParams(location.search).get('from') === 'resume') {
        const returnLink = $('.detail-resume-link', projectDialog);
        returnLink.href = 'resume.html#cv-' + projectId;
        returnLink.hidden = false;
        projectDialog.addEventListener('close', () => { returnLink.hidden = true; }, {once:true});
      }
      showProject(projectId);
    }
  }
})();
