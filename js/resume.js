window.applyResumeProfile?.();

const outline = document.querySelector('.cv-outline');
const wideResume = window.matchMedia('(min-width: 861px)');
function sizeOutline() { outline.open = wideResume.matches; }
sizeOutline();
wideResume.addEventListener('change', sizeOutline);

// 簡歷和作品選集使用同一張封面。兩張原始邏輯圖只取棋盤／拼圖區域。
const boardCovers = new Set(['images/projects/cpp-puzzle.svg', 'images/projects/cpp-chess.svg']);
const projects = window.portfolioData?.projects || [];
document.querySelectorAll('[data-cover-of]').forEach(frame => {
  const project = projects.find(item => item.id === frame.dataset.coverOf);
  if (!project?.cover) return;
  const image = new Image();
  image.alt = '';
  frame.classList.toggle('work-board', boardCovers.has(project.cover));
  image.onload = () => { frame.hidden = false; };
  image.onerror = () => { frame.hidden = true; };
  frame.append(image);
  image.src = project.cover;
});

document.getElementById('print-resume').addEventListener('click', () => window.print());

// 匯出 PDF 時保留文字與 Email，避免把本機磁碟路徑寫入作品連結。
const localPrintLinks = new Map();
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('a[href^="index.html"]').forEach(link => {
    localPrintLinks.set(link, link.getAttribute('href'));
    link.removeAttribute('href');
  });
});
window.addEventListener('afterprint', () => {
  localPrintLinks.forEach((href, link) => link.setAttribute('href', href));
  localPrintLinks.clear();
});
