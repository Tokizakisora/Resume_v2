(() => {
  const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五'];
  const periods = ['1','2','3','4','5','6','7','8','9','10','A','B','C'];
  const times = [
    ['08:10','09:00'], ['09:10','10:00'], ['10:20','11:10'], ['11:20','12:10'],
    ['12:20','13:10'], ['13:20','14:10'], ['14:20','15:10'], ['15:30','16:20'],
    ['16:30','17:20'], ['17:30','18:20'], ['18:25','19:15'], ['19:20','20:10'], ['20:15','21:05']
  ];
  // 同一份課程資料也能在停用 JavaScript 時透過連結閱讀。
  const source = document.getElementById('academics');
  const root = document.createElement('dialog');
  root.id = source.id;
  root.setAttribute('aria-labelledby',source.getAttribute('aria-labelledby'));
  root.setAttribute('closedby','any');
  root.append(...source.childNodes);
  source.replaceWith(root);
  const terms = [...root.querySelectorAll('.term')];
  const termLinks = [...root.querySelectorAll('.terms a')];
  const courses = new Map();
  const dialog = root.querySelector('#course-dialog');
  const toolbar = root.querySelector('.academic-toolbar');
  let opener = null;
  let returning = false;
  let selectedDay = window.matchMedia('(max-width:820px)').matches ? '0' : 'all';

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function courseButton(key, name, className) {
    const button = element('button',name,className);
    button.type = 'button';
    button.dataset.course = key;
    button.setAttribute('aria-haspopup','dialog');
    return button;
  }

  function readWeek(term, showTimes) {
    const days = weekdays.map(() => []);
    term.querySelectorAll('.course-table tbody tr').forEach((row, index) => {
      const title = row.querySelector('.course-name');
      const name = title.textContent;
      const key = term.id+'/'+row.dataset.code;
      const meetings = [...row.querySelectorAll('.meeting-column [data-day]')];
      const record = {
        name, term:term.querySelector('.term-heading h3').textContent,
        description:row.querySelector('th small').textContent,
        units:row.cells[1].textContent, grade:row.cells[2].textContent, meetings:[], showTimes
      };
      courses.set(key, record);
      title.replaceChildren(courseButton(key,name,'course-title-link'));
      row.cells[2].replaceChildren(element('span',record.grade,record.grade==='成績未到'?'grade-pending':'grade-mark'));
      for (const meeting of meetings) {
        const {day, start, end, room} = meeting.dataset;
        const session = {
          key, name, day:Number(day)-1, start:periods.indexOf(start), end:periods.indexOf(end), room,
          color:'ink-' + index % 6
        };
        days[session.day].push(session);
        record.meetings.push(session);
      }
    });
    for (const day of days) day.sort((a,b) => a.start-b.start);
    return days;
  }

  function periodRange(course) {
    const start = periods[course.start], end = periods[course.end];
    return (start === end ? start : start + '–' + end) + ' 節';
  }

  function weekTable(days, showTimes, termId) {
    const table = element('table', '', 'week-table');
    table.createCaption().textContent = '週一至週五課表';
    const head = table.createTHead().insertRow();
    for (const text of ['節次', ...weekdays]) {
      const th = element('th', text);
      th.scope = 'col';
      head.append(th);
    }
    const body = table.createTBody();
    periods.forEach((period, index) => {
      const row = body.insertRow();
      const label = element('th', period);
      label.scope = 'row';
      if (showTimes) label.append(element('small', times[index].join('–')));
      row.append(label);
      for (const day of days) {
        const course = day.find(item => item.start <= index && item.end >= index);
        if (course && course.start < index) continue;
        const cell = row.insertCell();
        if (!course) continue;
        cell.rowSpan = course.end - course.start + 1;
        cell.className = 'occupied ' + course.color;
        const block = courseButton(course.key,'','lesson');
        block.append(element('strong', course.name),element('small',periodRange(course)));
        if (course.room) block.append(element('span',course.room,'room'));
        cell.append(block);
      }
    });
    table.setAttribute('aria-labelledby','title-'+termId+' '+termId+'-week-caption');
    table.caption.id = termId+'-week-caption';
    return table;
  }

  function dailyAgenda(days, showTimes) {
    const agenda = element('div', '', 'agenda');
    days.forEach((courses, index) => {
      const group = element('section', '', 'day-group');
      group.dataset.agendaDay = String(index);
      const heading=element('h4',weekdays[index]);
      heading.append(element('small',courses.length+' 堂課'));
      group.append(heading);
      if (!courses.length) group.append(element('p','當天無排課。','empty-day'));
      const list = element('ul');
      for (const course of courses) {
        const item = element('li','',course.color);
        const button = courseButton(course.key,'','daily-lesson');
        const slot = element('span','','slot');
        slot.append(element('strong',periodRange(course)));
        if (showTimes) slot.append(element('small',times[course.start][0]+'–'+times[course.end][1]));
        const info = element('span','','subject');
        info.append(element('strong',course.name));
        if (course.room) info.append(element('small',course.room));
        button.append(slot, info);
        item.append(button);
        list.append(item);
      }
      if (courses.length) group.append(list);
      agenda.append(group);
    });
    return agenda;
  }

  function dayPicker() {
    const tools = element('div','','day-tools');
    const picker = element('div','','day-picker');
    picker.setAttribute('role','group');
    picker.setAttribute('aria-label','依星期查看');
    ['整週', ...weekdays.map(day=>day.replace('星期','週'))].forEach((day,index)=>{
      const button = element('button',day);
      button.type='button';
      button.dataset.pickDay=index===0 ? 'all' : String(index-1);
      picker.append(button);
    });
    tools.append(picker,element('small','點課名看時段與成績','lesson-hint'));
    return tools;
  }

  function showDay(term) {
    const view=term.querySelector('.schedule-view');
    view.dataset.day=selectedDay;
    for(const button of view.querySelectorAll('[data-pick-day]')) {
      button.setAttribute('aria-pressed', String(button.dataset.pickDay===selectedDay));
    }
    for(const group of view.querySelectorAll('.day-group')) {
      group.hidden=selectedDay!=='all' && group.dataset.agendaDay!==selectedDay;
    }
  }

  function addGradeSearch(term) {
    const table = term.querySelector('.course-table');
    const rows = [...table.tBodies[0].rows];
    const tools = element('div','','grade-search');
    const label = element('label','搜尋本學期課程');
    const input = element('input');
    input.type='search';
    input.id='search-'+term.id;
    input.placeholder='課程名稱或代碼';
    label.htmlFor=input.id;
    const count=element('span',rows.length+' 門課','match-count');
    count.setAttribute('role','status');
    const clear=element('button','清除');
    clear.type='button';
    clear.hidden=true;
    function filter() {
      const query=input.value.trim().normalize('NFKC').toLowerCase();
      let matches=0;
      for(const row of rows) {
        const text=(row.querySelector('.course-name').textContent+' '+row.dataset.code).normalize('NFKC').toLowerCase();
        row.hidden=!text.includes(query);
        if(!row.hidden) matches++;
      }
      table.hidden=matches===0;
      clear.hidden=!input.value;
      count.textContent=matches ? matches+' 門課' : '找不到符合的課程';
    }
    input.addEventListener('input',filter);
    clear.addEventListener('click',()=>{ input.value=''; filter(); input.focus(); });
    tools.append(label,input,clear,count);
    table.before(tools);
  }

  function openCourse(record) {
    dialog.querySelector('#course-term').textContent=record.term;
    dialog.querySelector('#course-code').textContent=record.description;
    dialog.querySelector('h2').textContent=record.name;
    dialog.querySelector('#course-facts').replaceChildren(
      element('dt','學分'),element('dd',record.units),element('dt','成績'),element('dd',record.grade)
    );
    const meetings=record.meetings.map(session=>{
      const row=element('li');
      row.append(element('strong',weekdays[session.day]),element('span',periodRange(session)));
      if(record.showTimes) row.append(element('span',times[session.start][0]+'–'+times[session.end][1]));
      if(session.room) row.append(element('small',session.room));
      return row;
    });
    dialog.querySelector('#course-meetings').replaceChildren(...meetings);
    dialog.showModal();
  }
  root.addEventListener('click',event=>{
    const lesson=event.target.closest('button[data-course]');
    if(lesson) openCourse(courses.get(lesson.dataset.course));
    const day=event.target.closest('button[data-pick-day]');
    if(day) {
      selectedDay=day.dataset.pickDay;
      showDay(day.closest('.term'));
    }
  });

  let activeView = 'schedule';
  function selectTerm(term, view) {
    activeView = view;
    terms.forEach(item => { item.hidden = item !== term; });
    for (const link of termLinks) {
      if (link.hash === '#'+term.id) link.setAttribute('aria-current','true');
      else link.removeAttribute('aria-current');
    }
    term.querySelector('.schedule-view').hidden = view !== 'schedule';
    term.querySelector('.grade-view').hidden = view !== 'grades';
    showDay(term);
    for (const button of term.querySelectorAll('[data-academic-view]')) {
      button.setAttribute('aria-pressed', String(button.dataset.academicView === view));
    }
  }

  function pushHash(hash) {
    if (hash !== location.hash) {
      const depth = (history.state?.academicDepth || 0) + 1;
      try { history.pushState({academicDepth:depth},'',hash); }
      catch { location.hash = hash; }
    }
  }

  function navigate(term, view) {
    pushHash('#' + (view === 'grades' ? term.querySelector('.grade-view').id : term.id));
    selectTerm(term,view);
  }

  for (const term of terms) {
    const key = term.id.slice(5);
    // 舊學期的截圖只列節次，本學期另有鐘點和教室。
    const showTimes = key === '115-1';
    const days = readWeek(term,showTimes);
    const schedule = term.querySelector('.schedule-view');
    const grades = term.querySelector('.grade-view');
    schedule.id = 'schedule-'+key;
    schedule.append(dayPicker(),weekTable(days,showTimes,key),dailyAgenda(days,showTimes));
    addGradeSearch(term);
    const controls = term.querySelector('.view-switch');
    controls.hidden = false;
    for (const button of controls.querySelectorAll('button')) {
      button.setAttribute('aria-controls',button.dataset.academicView === 'grades' ? grades.id : schedule.id);
      button.addEventListener('click',()=>navigate(term,button.dataset.academicView));
    }
  }
  for (const link of termLinks) {
    link.addEventListener('click',event=>{
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const term = document.querySelector(link.hash);
      navigate(term,activeView);
      const hiddenHeight = toolbar.getBoundingClientRect().bottom - term.getBoundingClientRect().top;
      if (hiddenHeight > 0) root.scrollTop -= hiddenHeight + 12;
    });
  }
  function academicTarget() {
    const target = document.getElementById(location.hash.slice(1));
    return target === root || target?.closest('#academics .term') ? target : null;
  }

  function leaveDirectLink() {
    if (new URLSearchParams(location.search).get('from') === 'resume') {
      location.replace(window.galleryTakeURL('resume.html#education'));
      return;
    }
    history.replaceState(null,'','#resume');
    const entry = document.querySelector('.schedule-entry');
    entry.scrollIntoView({block:'center',behavior:'instant'});
    entry.focus({preventScroll:true});
  }

  function restoreSelection() {
    const target = academicTarget();
    if (returning) {
      returning = false;
      if (target) leaveDirectLink();
      else requestAnimationFrame(()=>opener?.focus({preventScroll:true}));
      return;
    }
    if (dialog.open) dialog.close();
    if (!target) {
      if (root.open) root.close();
      return;
    }
    selectTerm(target.closest('.term') || terms[0], target.classList.contains('grade-view') ? 'grades' : 'schedule');
    if (!root.open) {
      root.showModal();
      root.scrollTop = 0;
    }
  }

  for (const link of document.querySelectorAll('a[href="#academics"]')) {
    link.addEventListener('click',event=>{
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      pushHash('#academics');
      restoreSelection();
    });
  }
  root.querySelector('[data-close-academics]').addEventListener('click',event=>{
    event.preventDefault();
    root.close();
  });
  root.addEventListener('close',()=>{
    if (root.open) return;
    opener?.focus({preventScroll:true});
    if (!academicTarget()) return;
    // 一次回到開啟前的位置，即使中途已切換多個學期。
    const depth = history.state?.academicDepth || 0;
    if (depth) {
      returning = true;
      history.go(-depth);
    } else leaveDirectLink();
  });
  root.classList.add('academic-ready');
  selectTerm(terms[0],'schedule');
  window.addEventListener('hashchange',restoreSelection);
  window.addEventListener('popstate',restoreSelection);
  restoreSelection();
})();
