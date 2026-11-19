/* 對照原課程專案 level1.txt 的第一個零件與 Part::cells。 */
(() => {
  const cover = document.querySelector('#work-puzzle .project-cover');
  const template = document.querySelector('#rotation-template');
  const project = window.portfolioData?.projects.find(item => item.id === 'puzzle');
  if (!cover || !template || !project) return;
  // 新增圖片、自訂封面或停用示意時，交給共用的圖集瀏覽器。
  if (!window.portfolioPresentation?.puzzle?.rotationPreview ||
      project.images.length !== 1 || project.cover !== 'images/projects/cpp-puzzle.svg') return;

  const matrix = [
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1]
  ];
  const cells = [];
  matrix.forEach((row, r) => row.forEach((filled, c) => {
    if (filled) cells.push({ row: r, column: c });
  }));

  cover.querySelector('.media-stage').replaceChildren(template.content.cloneNode(true));
  cover.classList.add('interactive-cover');
  cover.querySelector('.media-caption').hidden = true;
  const board = cover.querySelector('.rotation-board');
  const status = cover.querySelector('.rotation-status');
  const piece = document.createElement('div');
  piece.className = 'rotation-piece';
  board.append(piece);
  cells.forEach(({row, column}, index) => {
    const tile = document.createElement('span');
    tile.className = 'rotation-tile';
    if (index === 0) tile.classList.add('tracked-tile');
    tile.style.transform = `translate(${column * 100}%, ${row * 100}%)`;
    piece.append(tile);
  });
  let coordinates = cells;
  let turns = 0;

  function display() {
    piece.style.transform = `rotate(${turns * 90}deg)`;
    const point = coordinates[0];
    status.textContent = `${(turns % 4) * 90}° · 記號格 (${point.row}, ${point.column})`;
  }

  cover.querySelector('.rotate-piece').addEventListener('click', () => {
    const height = Math.max(...coordinates.map(point => point.row)) + 1;
    const rotated = coordinates.map(({row, column}) => ({row: column, column: height - 1 - row}));
    const top = Math.min(...rotated.map(point => point.row));
    const left = Math.min(...rotated.map(point => point.column));
    coordinates = rotated.map(point => ({row: point.row - top, column: point.column - left}));
    turns += 1;
    display();
  });
  display();
})();
