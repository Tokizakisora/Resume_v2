/* 首頁與簡歷共用的公開資訊。沒有填入的欄位自動隱藏。 */
window.applyResumeProfile = function () {
  const profile = window.resumeProfile || {};
  const portrait = document.getElementById('portrait');
  if (portrait) {
    portrait.addEventListener('error', () => {
      if (portrait.getAttribute('src') !== 'images/avatar.svg') {
        portrait.src = 'images/avatar.svg';
        portrait.alt = '個人頭像預留位置';
      }
    });
    if (profile.avatar && !/^(?:javascript|data):/i.test(profile.avatar)) portrait.src = profile.avatar;
    if (profile.avatarAlt) portrait.alt = profile.avatarAlt;
  }
  const phone = String(profile.phone || '').trim();
  const phoneRow = document.getElementById('phone-row');
  if (phone && phoneRow) {
    const link = document.createElement('a');
    link.textContent = phone;
    link.href = 'tel:' + phone.replace(/[^\d+]/g, '');
    document.getElementById('phone-value').replaceChildren(link);
    phoneRow.hidden = false;
  }
  const github = String(profile.github || '').trim();
  if (/^https:\/\/github\.com\/[\w-]+(?:\/)?$/i.test(github)) {
    const link = document.getElementById('github-link');
    if (link) {
      link.href = github;
      document.getElementById('github-row').hidden = false;
    }
  }
};
