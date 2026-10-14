(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const defaults = ['Jade', 'Rose', 'Amber', 'Azure'].map((name, i) => ({name, leader: ["Queen Elara", "King Rowan", "King Aurek", "Queen Lyra"][i], color: ['#6bdbad', '#f18297', '#edbf69', '#78b6f5'][i], army: 24, health: 100, attack: 18, movement: 48, recruit: 4, castle: 800, limit: 60, xp: 3}));
  const ranges = {army: [1, 60], health: [10, 500], attack: [1, 100], movement: [10, 150], recruit: [1, 30], castle: [100, 5000], limit: [1, 100], xp: [1, 20]};
  let battle;
  let settings = structuredClone(defaults), selected = 0, teams, marbles, elapsed, fallen, running = false, finished = false, accumulator = 0, lastTime = 0, lastStats = 0;
  const renderer = new MarbleRenderer($('arena'), $('world-map'));
  $('follow').onchange = () => draw();
  $('combat-labels').onchange = () => draw();
  const time = () => `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${Math.floor(elapsed % 60).toString().padStart(2, '0')}`;
  function tabs() {
    $('tabs').replaceChildren();
    settings.forEach((team, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = ['I', 'II', 'III', 'IV'][i];
      button.style.setProperty('--team', team.color); button.setAttribute('aria-label', `Edit ${team.name}`); button.setAttribute('aria-pressed', String(i === selected));
      button.onclick = () => { selected = i; editor(); }; $('tabs').append(button);
    });
  }
  function editor() { Object.keys(settings[selected]).forEach(key => $(key).value = settings[selected][key]); tabs(); }
  function reset() {
    running = false; finished = false; accumulator = 0;
    battle = new MarbleBattle(settings); sync();
    $('status').textContent = 'Ready to begin'; $('play').textContent = '▶ Start battle'; updateStats(); draw();
  }
  function sync() { teams = battle.teams; marbles = battle.fighters; elapsed = battle.time; fallen = battle.fallen; }
  function step(dt) {
    battle.tick(dt); sync();
    if (battle.winner !== undefined) { running = false; finished = true; $('status').textContent = battle.winner === null ? 'A draw' : teams[battle.winner].name + ' wins!'; $('play').textContent = '↻ Play again'; updateStats(); }
  }
  function draw() { $('encounter-title').textContent = renderer.draw(battle, $('follow').value, $('combat-labels').checked); }
  function updateStats() {
    $('clock').textContent = time(); $('total').textContent = marbles.length; $('alive').textContent = teams.filter(t => battle.army(t.id).length).length; $('fallen').textContent = fallen;
    $('army-cards').replaceChildren();
    teams.forEach(t => { const card = document.createElement('button'); card.className = 'army-card'; card.style.setProperty('--team', t.color); const army = battle.army(t.id); card.textContent = t.name + ' · ' + army.length + ' deployed · ' + battle.towns.filter(town => town.owner === t.id).length + ' towns'; card.onclick = () => { $('follow').value = String(t.id); draw(); }; $('army-cards').append(card); $('follow').options[t.id + 1].textContent = t.name; });
    $('standings').replaceChildren();
    [...teams].sort((a, b) => battle.army(b.id).length - battle.army(a.id).length).forEach(t => {
      const tr = document.createElement('tr');
      const army = battle.army(t.id), king = army.find(f => f.king);
      [t.name, army.filter(f => !f.king).length, t.kills, king ? Math.ceil(king.hp) + ' HP' : 'Fallen', battle.towns.filter(town => town.owner === t.id).length, army.length ? (king ? 'Marching' : 'Kingless') : 'Defeated'].forEach((value, i) => { const td = document.createElement('td'); td.textContent = value; if (i === 0) { const dot = document.createElement('span'); dot.className = 'dot'; dot.style.setProperty('--team', t.color); td.prepend(dot); } tr.append(td); }); $('standings').append(tr);
    });
    $('events').replaceChildren();
    for (const event of battle.events) { const li = document.createElement('li'), stamp = document.createElement('time'); stamp.textContent = Math.floor(event.time / 60).toString().padStart(2, '0') + ':' + Math.floor(event.time % 60).toString().padStart(2, '0'); li.append(stamp, document.createTextNode(event.text)); $('events').append(li); }
    $('fighters').replaceChildren();
    [...marbles].sort((a, b) => b.level - a.level || b.kills - a.kills || a.id - b.id).slice(0, 12).forEach(f => {
      const tr = document.createElement('tr');
      [f.name, f.level, f.xp + '/' + teams[f.team].xp, Math.ceil(f.hp) + '/' + f.maxHp, f.speed.toFixed(0), f.attack + ' / ' + f.armor, f.equipment].forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); }); $('fighters').append(tr);
    });
  }
  function validate(data) {
    return Array.isArray(data) && data.length === 4 && data.every(t => t && typeof t.leader === 'string' && t.leader.trim().length > 0 && t.leader.length <= 24 && typeof t.name === 'string' && t.name.trim().length > 0 && t.name.length <= 24 && /^#[0-9a-f]{6}$/i.test(t.color) && Object.entries(ranges).every(([k, [min, max]]) => Number.isFinite(t[k]) && Number.isInteger(t[k]) && t[k] >= min && t[k] <= max) && t.army <= t.limit);
  }
  $('editor').onsubmit = event => {
    event.preventDefault(); const next = {...settings[selected], name: $('name').value.trim(), leader: $('leader').value.trim(), color: $('color').value};
    Object.keys(ranges).forEach(k => next[k] = Number($(k).value)); const candidate = settings.map((t, i) => i === selected ? next : t);
    if (!validate(candidate)) { $('notice').textContent = 'Use valid whole numbers and an army limit at least as large as the starting army.'; return; }
    settings = candidate; editor(); reset(); $('notice').textContent = 'Settings applied. Start your new battle.';
  };
  $('play').onclick = () => { if (finished) reset(); running = !running; accumulator = 0; $('play').textContent = running ? 'Ⅱ Pause battle' : '▶ Resume battle'; $('status').textContent = running ? 'Battle in progress' : 'Battle paused'; };
  $('reset').onclick = reset;
  $('save').onclick = () => { try { localStorage.setItem('marble-kingdom-setup-v1', JSON.stringify(settings)); $('notice').textContent = 'Applied setup saved in this browser.'; } catch { $('notice').textContent = 'Browser storage is unavailable. Your current setup still works.'; } };
  $('load').onclick = () => { try { const data = JSON.parse(localStorage.getItem('marble-kingdom-setup-v1')); if (Array.isArray(data)) data.forEach(t => { if (t && t.xp === undefined) t.xp = 3; if (t && t.leader === undefined) t.leader = t.name + " Sovereign"; }); if (!validate(data)) { $('notice').textContent = 'No valid saved setup found.'; return; } settings = data; editor(); reset(); $('notice').textContent = 'Saved setup loaded.'; } catch { $('notice').textContent = 'Could not read the saved setup.'; } };
  $('defaults').onclick = () => { settings = structuredClone(defaults); editor(); reset(); $('notice').textContent = 'Default kingdoms restored. Saved setup is unchanged.'; };
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) $('play').click(); });
  function frame(now) {
    const dt = Math.min((now - lastTime) / 1000, .1); lastTime = now;
    if (running) { accumulator += dt * Number($('speed').value); while (accumulator >= 1 / 60 && running) { step(1 / 60); accumulator -= 1 / 60; } draw(); if (now - lastStats > 200) { updateStats(); lastStats = now; } }
    requestAnimationFrame(frame);
  }
  editor(); reset(); requestAnimationFrame(frame);
})();
