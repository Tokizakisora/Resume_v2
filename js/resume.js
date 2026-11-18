window.applyResumeProfile?.();
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
