/* Original canvas artwork; no artwork is extracted from the reference video. */
class MarbleRenderer {
  constructor(arena, world) {
    this.arena = arena; this.world = world; this.focus = 0;
    this.paper = document.createElement('canvas'); this.paper.width = 1000; this.paper.height = 680;
    const c = this.paper.getContext('2d'); c.fillStyle = '#eed5a1'; c.fillRect(0, 0, 1000, 680);
    let seed = 83; const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 6000; i++) { c.fillStyle = random() > .5 ? '#784c1710' : '#fff5d51c'; c.fillRect(random() * 1000, random() * 680, 2 + random() * 25, 2 + random() * 25); }
    for (let i = 0; i < 100; i++) {
      const x = random() * 960 + 20, y = random() * 640 + 20;
      c.strokeStyle = '#79684588'; c.lineWidth = 1.2;
      if (i % 3 === 0) { c.beginPath(); c.moveTo(x - 10, y + 8); c.lineTo(x, y - 12); c.lineTo(x + 13, y + 8); c.moveTo(x - 2, y - 8); c.lineTo(x + 2, y - 3); c.lineTo(x + 5, y - 5); c.stroke(); }
      else { c.fillStyle = '#78815a33'; c.beginPath(); c.moveTo(x, y - 9); c.lineTo(x - 5, y + 4); c.lineTo(x + 5, y + 4); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(x, y + 4); c.lineTo(x, y + 9); c.stroke(); }
    }
    const river = () => { c.beginPath(); c.moveTo(0, 230); c.bezierCurveTo(170, 320, 230, 140, 390, 240); c.bezierCurveTo(550, 340, 580, 280, 660, 170); c.bezierCurveTo(780, 30, 860, 230, 1000, 130); };
    c.lineWidth = 12; c.strokeStyle = '#796d52'; river(); c.stroke(); c.lineWidth = 8; c.strokeStyle = '#a9c6c2'; river(); c.stroke();
    c.strokeStyle = '#836b43'; c.lineWidth = 3; c.strokeRect(12, 12, 976, 656); c.lineWidth = 1; c.strokeRect(18, 18, 964, 644);
    c.fillStyle = '#715938'; c.textAlign = 'center'; c.font = 'italic 17px Georgia'; c.fillText('The Crownlands', 500, 647);
    c.font = '26px Georgia'; c.fillText('✥', 940, 580); c.font = '12px Georgia'; c.fillText('N', 940, 552);
    this.territory = document.createElement('canvas'); this.territory.width = 1000; this.territory.height = 680;
  }
  territories(b) {
    const key = b.towns.map(t => t.owner).join(',') + b.teams.map(t => t.color).join(',');
    if (key === this.key) return; this.key = key;
    const c = this.territory.getContext('2d'); c.clearRect(0, 0, 1000, 680);
    // Voronoi town regions give captured settlements visible, stable territory.
    const size = 10, cells = [];
    for (let y = 0; y < 68; y++) { cells[y] = []; for (let x = 0; x < 100; x++) {
      let nearest = null, distance = Infinity;
      for (const town of b.towns) { const d = (town.x - x * size - 5) ** 2 + (town.y - y * size - 5) ** 2; if (d < distance) { distance = d; nearest = town; } }
      cells[y][x] = nearest.owner;
      if (nearest.owner !== null) { c.fillStyle = b.teams[nearest.owner].color + '27'; c.fillRect(x * size, y * size, size, size); }
    } }
    c.lineWidth = 2;
    for (let y = 0; y < 68; y++) for (let x = 0; x < 100; x++) {
      const id = cells[y][x]; if (id === null) continue; c.strokeStyle = b.teams[id].color;
      c.beginPath(); if (x < 99 && cells[y][x + 1] !== id) { c.moveTo((x + 1) * size, y * size); c.lineTo((x + 1) * size, (y + 1) * size); }
      if (y < 67 && cells[y + 1][x] !== id) { c.moveTo(x * size, (y + 1) * size); c.lineTo((x + 1) * size, (y + 1) * size); } c.stroke();
    }
  }
  text(c, text, x, y, size = 13, color = '#382b20') {
    c.font = `bold ${size}px Georgia`; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#fff1cd'; c.strokeText(text, x, y); c.fillStyle = color; c.fillText(text, x, y);
  }
  draw(b, follow, labels) {
    const now = performance.now();
    this.cameraDt = Math.min(.05, Math.max(0, (now - (this.lastFrame || now)) / 1000));
    this.lastFrame = now;
    if (this.battle !== b || this.follow !== follow) {
      this.battle = b; this.follow = follow; this.focus = null; this.camera = null; this.sceneTown = null;
      this.lastEncounter = b.time; this.selectedAt = b.time; this.sceneChangedAt = b.time;
    }
    const living = b.teams.filter(t => b.army(t.id).length);
    let focused = follow === 'auto' ? null : b.teams[Number(follow)];
    if (follow === 'auto' && this.focus !== null) {
      const previous = living.find(t => t.id === this.focus);
      if (previous) {
        const fighting = living.some(t => t.id !== previous.id && Math.hypot(t.x - previous.x, t.y - previous.y) < 210);
        if (fighting) this.lastEncounter = b.time;
        // Stay with an ongoing encounter; allow a brief quiet period before cutting away.
        if (fighting || b.time - this.lastEncounter < 4 || b.time - this.selectedAt < 10) focused = previous;
      }
    }
    if (!focused) {
      let distance = Infinity;
      for (const t of living) for (const other of living) { if (t.id === other.id) continue; const d = Math.hypot(t.x - other.x, t.y - other.y); if (d < distance) { distance = d; focused = t; } }
      focused ||= living[0] || b.teams[0];
    }
    if (this.focus !== focused.id) { this.selectedAt = b.time; this.lastEncounter = b.time; this.camera = null; this.sceneTown = null; this.sceneChangedAt = b.time; }
    this.focus = focused.id;
    this.map(b, focused); return this.encounter(b, focused, labels);
  }
  map(b, focused) {
    const c = this.world.getContext('2d'); c.drawImage(this.paper, 0, 0); this.territories(b); c.drawImage(this.territory, 0, 0);
    for (const town of b.towns) {
      c.fillStyle = town.owner === null ? '#d0c1a0' : b.teams[town.owner].color; c.strokeStyle = '#493c2c'; c.lineWidth = 2;
      c.fillRect(town.x - 12, town.y - 12, 24, 25); c.strokeRect(town.x - 12, town.y - 12, 24, 25);
      for (let i = 0; i < 3; i++) { c.fillRect(town.x - 12 + i * 9, town.y - 19, 6, 8); c.strokeRect(town.x - 12 + i * 9, town.y - 19, 6, 8); }
      this.text(c, String(town.reserve), town.x, town.y + 7, 15); this.text(c, town.name, town.x, town.y + 33, 12);
      if (town.claimant !== null) { c.strokeStyle = b.teams[town.claimant].color; c.lineWidth = 4; c.beginPath(); c.arc(town.x, town.y, 23, -Math.PI / 2, -Math.PI / 2 + town.progress / 3 * Math.PI * 2); c.stroke(); }
    }
    for (const t of b.teams) {
      const army = b.army(t.id); if (!army.length) continue;
      if (focused.id === t.id) { c.strokeStyle = '#403724'; c.setLineDash([4, 4]); c.lineWidth = 2; c.beginPath(); c.arc(t.x, t.y, 34, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); }
      c.fillStyle = t.color; c.strokeStyle = '#32271d'; c.lineWidth = 2; c.fillRect(t.x - 17, t.y - 14, 34, 30); c.strokeRect(t.x - 17, t.y - 14, 34, 30);
      this.text(c, String(army.length), t.x, t.y + 7, 18); this.text(c, army.find(f => f.king)?.name || `${t.name} survivors`, t.x, t.y - 23, 14);
    }
  }
  encounter(b, focus, labels) {
    const c = this.arena.getContext('2d'), w = this.arena.width, h = this.arena.height;
    const room = b.encounters.find(room => room.id === focus.room);
    const nearby = b.teams.filter(t => t.id !== focus.id && b.army(t.id).length && (room ? room.teams.includes(t.id) : false));
    const members = b.fighters.filter(f => f.team === focus.id || nearby.some(t => t.id === f.team));
    const own = members.filter(f => f.team === focus.id);
    const targetX = room ? room.x : own.length ? own.reduce((a, f) => a + f.x, 0) / own.length : focus.x;
    const targetY = room ? room.y : own.length ? own.reduce((a, f) => a + f.y, 0) / own.length : focus.y;
    if (room) this.camera = {x: room.x, y: room.y};
    if (!this.camera) this.camera = {x: targetX, y: targetY};
    const dx = targetX - this.camera.x, dy = targetY - this.camera.y, distance = Math.hypot(dx, dy);
    // A dead zone ignores tiny shifts; bounded easing prevents casualties causing camera jumps.
    if (distance > 5) { const move = Math.min(distance - 5, distance * (1 - Math.exp(-3 * this.cameraDt)), 70 * this.cameraDt); this.camera.x += dx / distance * move; this.camera.y += dy / distance * move; }
    const cx = this.camera.x, cy = this.camera.y;
    // Separate entry/exit radii prevent scenery flickering at a town boundary.
    if (this.sceneTown && Math.hypot(this.sceneTown.x - cx, this.sceneTown.y - cy) > 150 && b.time - this.sceneChangedAt > 4) { this.sceneTown = null; this.sceneChangedAt = b.time; }
    if (!this.sceneTown && (b.time - this.sceneChangedAt > 4 || b.time === 0)) { const candidate = b.towns.find(t => Math.hypot(t.x - cx, t.y - cy) < 90); if (candidate) { this.sceneTown = candidate; this.sceneChangedAt = b.time; } }
    const town = this.sceneTown;
    const zoom = room ? Math.min((w - 28) / (room.halfWidth * 2), (h - 70) / (room.halfHeight * 2)) : 3.2;
    const screen = (x, y) => [w / 2 + (x - cx) * zoom, h / 2 + (y - cy) * zoom];
    // Battlefield setting changes near settlements: a walled courtyard and bridge.
    c.fillStyle = town ? '#e5d9bd' : '#b9956e'; c.fillRect(0, 0, w, h);
    c.strokeStyle = town ? '#baa98a' : '#927354'; c.lineWidth = 1;
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 40) {
      if (town) { c.strokeRect(x + (y % 64 ? 20 : 0), y, 39, 31); }
      else { c.beginPath(); c.moveTo(x + Math.sin(y + x) * 7, y); c.lineTo(x + 4, y + 9); c.stroke(); }
    }
    if (town) {
      c.fillStyle = '#a8c9c5'; c.fillRect(0, 45, w, 38); c.fillStyle = '#887354'; c.fillRect(w / 2 - 62, 30, 124, 70);
      c.strokeStyle = '#504d42'; c.lineWidth = 3; c.strokeRect(w / 2 - 62, 30, 124, 70);
      for (let x = w / 2 - 60; x < w / 2 + 60; x += 15) { c.beginPath(); c.moveTo(x, 30); c.lineTo(x, 100); c.stroke(); }
      c.fillStyle = '#c7c1af'; c.fillRect(0, 100, w / 2 - 65, 28); c.fillRect(w / 2 + 65, 100, w, 28);
      for (const x of [w / 2 - 100, w / 2 + 100]) { c.beginPath(); c.arc(x, 115, 34, 0, Math.PI * 2); c.fill(); c.stroke(); c.beginPath(); c.arc(x, 115, 24, 0, Math.PI * 2); c.stroke(); }
      c.fillStyle = '#a8533e'; c.fillRect(w / 2 - 65, 100, 130, 35);
    } else {
      c.fillStyle = '#91a567'; c.beginPath(); c.moveTo(0, 0); for (let y = 0; y <= h; y += 25) c.lineTo(25 + Math.sin(y / 48) * 18, y); c.lineTo(0, h); c.fill();
      c.beginPath(); c.moveTo(w, 0); for (let y = 0; y <= h; y += 25) c.lineTo(w - 25 + Math.sin(y / 43) * 18, y); c.lineTo(w, h); c.fill();
    }
    const occupied = [];
    for (const f of [...members].sort((a, b) => Number(b.king) - Number(a.king) || b.level - a.level)) {
      const [x, y] = screen(f.x, f.y), r = (f.king ? 10 : 6) * zoom;
      c.fillStyle = '#30231f28'; c.beginPath(); c.ellipse(x + 3, y + r * .65, r + 2, r * .5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = b.teams[f.team].color; c.strokeStyle = '#302b24'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.stroke();
      // Sword angle follows movement; the short swing is triggered by an actual strike.
      c.save(); c.translate(x, y); c.rotate(f.angle);
      c.fillStyle = '#f5f2df'; c.strokeStyle = '#302b24'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(r, -2); c.lineTo(r + 8 * zoom, -2); c.lineTo(r + 10 * zoom, 0); c.lineTo(r + 8 * zoom, 2); c.lineTo(r, 2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#a87b35'; c.fillRect(r + 1, -6, 3, 12); c.fillStyle = '#4b3527'; c.fillRect(r - 5, -2, 6, 4); c.restore();
      if (f.armor > 0) { c.strokeStyle = '#e6e8db'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r - 2, .4, 2.8); c.stroke(); }
      if (f.king) { c.fillStyle = '#f6ce4e'; c.strokeStyle = '#473a20'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 10, y - r + 2); c.lineTo(x - 13, y - r - 12); c.lineTo(x - 5, y - r - 7); c.lineTo(x, y - r - 16); c.lineTo(x + 5, y - r - 7); c.lineTo(x + 13, y - r - 12); c.lineTo(x + 10, y - r + 2); c.closePath(); c.fill(); c.stroke(); }
      c.strokeStyle = '#f8dc68'; c.lineWidth = 2; if (f.level > 1) { c.beginPath(); c.arc(x, y, r + 4, 0, Math.PI * 2 * f.hp / f.maxHp); c.stroke(); }
      if (labels && (f.king || f.level > 1) && !occupied.some(p => Math.abs(p.x - x) < 120 && Math.abs(p.y - y) < 65)) { this.text(c, f.name, x, y - r - (f.king ? 23 : 10), 12); this.text(c, `Lv ${f.level} · ${f.kills} kills`, x, y + r + 16, 10); occupied.push({x, y}); }
      if (f.hp < f.maxHp) { c.fillStyle = '#482e24'; c.fillRect(x - r, y + r + 3, r * 2, 3); c.fillStyle = '#a8cb68'; c.fillRect(x - r, y + r + 3, r * 2 * f.hp / f.maxHp, 3); }
    }
    if (labels) for (const effect of b.effects.slice(-15)) { const [x, y] = screen(effect.x, effect.y); c.globalAlpha = Math.max(0, 1 - (b.time - effect.time) / 1.2); this.text(c, effect.text, x, y - 25 - (b.time - effect.time) * 25, 14, effect.color); c.globalAlpha = 1; }
    if (room) { const [left, top] = screen(room.x-room.halfWidth, room.y-room.halfHeight); c.strokeStyle='#65543b';c.lineWidth=5;c.strokeRect(left,top,room.halfWidth*2*zoom,room.halfHeight*2*zoom); }
    const title = nearby.length ? `${focus.name} vs ${nearby.map(t => t.name).join(' & ')}` : `Following ${focus.name}`;
    c.fillStyle = '#34271bd9'; c.fillRect(0, h - 44, w, 44); c.fillStyle = '#f6e7c4'; c.textAlign = 'center'; c.font = '14px Georgia'; c.fillText(town ? `At ${town.name} · ${town.reserve} recruits waiting` : nearby.length ? 'An encounter on the open road' : members.length ? 'Onward! Searching the Crownlands…' : 'This army has fallen.', w / 2, h - 17);
    return title;
  }
}
