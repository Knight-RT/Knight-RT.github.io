const {test} = require('node:test');
const assert = require('node:assert/strict');
const Battle = require('../public/marble-engine.js');
const settings = Array.from({length: 4}, (_, i) => ({name: `Team ${i}`, army: 2, health: 100, attack: 18, movement: 48, recruit: 4, castle: 800, limit: 10, xp: 2}));
function battle() { let seed = 17; return new Battle(settings, () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)); }
function advance(b, seconds) { for (let i = 0; i < seconds * 60; i++) b.tick(1 / 60); }
function park(b, id, x, y) { const t = b.teams[id]; t.x = x; t.y = y; t.destination = {x, y}; for (const f of b.army(id)) { f.x = x; f.y = y; f.speed = 0; } }
test('armies roam without a remote enemy target', () => {
  const b = battle(); b.random = () => .99; const t = b.teams[0]; b.chooseDestination(t);
  assert.deepEqual(t.destination, {x: 931.2, y: 614.4}); advance(b, 1); assert.ok(t.x > 140 && t.y > 130); assert.equal(b.fallen, 0);
});
test('town reserves wait for visiting armies and obey army limits', () => {
  const b = battle(); park(b, 0, 300, 100); advance(b, 8.1); const town = b.towns[0];
  assert.equal(town.reserve, 2); assert.equal(b.army(0).length, 3);
  park(b, 0, town.x, town.y); b.tick(1 / 60); assert.equal(town.reserve, 0); assert.equal(b.army(0).length, 5);
  town.reserve = 20; b.tick(1 / 60); assert.equal(b.army(0).filter(f => !f.king).length, 10); assert.equal(town.reserve, 14);
});
test('neutral towns capture, produce, and can be recaptured; contested towns do not flip', () => {
  const b = battle(), town = b.towns[4]; park(b, 0, town.x, town.y); advance(b, 3.1); assert.equal(town.owner, 0);
  park(b, 0, 300, 100); advance(b, 4.1); assert.equal(town.reserve, 1);
  park(b, 1, town.x, town.y); advance(b, 3.1); assert.equal(town.owner, 1); assert.equal(town.reserve, 0);
  park(b, 0, town.x - 30, town.y); park(b, 1, town.x + 30, town.y); advance(b, 3.1); assert.equal(town.owner, 1); assert.equal(town.progress, 0);
});
test('kills award personal XP and successive levels grant health, speed, and equipment', () => {
  const b = battle(), f = b.army(0).find(f => !f.king); f.attack = 1000; f.speed = 0;
  // Six isolated victims exercise actual combat credit, not just a level-up helper.
  b.fighters = [f, ...b.army(3)]; f.x = 500; f.y = 340;
  for (let i = 0; i < 6; i++) { const victim = b.spawn(b.teams[1]); victim.x = f.x + 12; victim.y = f.y; victim.hp = 1; victim.speed = 0; victim.cooldown = 100; f.cooldown = 0; b.tick(1 / 60); }
  assert.equal(f.kills, 6); assert.equal(f.xp, 0); assert.equal(f.level, 4); assert.equal(f.maxHp, 125); assert.ok(f.speed > 0); assert.equal(f.armor, 2); assert.notEqual(f.equipment, 'None');
});
test('a dead king does not erase survivors or declare victory; last enemy fighter must fall', () => {
  const b = battle(); b.fighters = b.fighters.filter(f => f.team < 2);
  const king = b.army(1).find(f => f.king); king.hp = 0; b.tick(1 / 60);
  assert.equal(b.army(1).length, 2); assert.equal(b.winner, undefined);
  b.army(1).forEach(f => f.hp = 0); b.tick(1 / 60); assert.equal(b.winner, 0); assert.equal(b.towns[1].owner, null);
});
test('surviving enemy king prevents victory and mutual extinction is a draw', () => {
  const b = battle(); b.fighters = b.fighters.filter(f => f.team === 0 || (f.team === 1 && f.king)); b.tick(1 / 60); assert.equal(b.winner, undefined);
  b.fighters.forEach(f => f.hp = 0); b.tick(1 / 60); assert.equal(b.winner, null);
});
test('large armies have distinct, non-overlapping formation slots', () => {
  const b = new Battle(settings.map(t => ({...t, army: 60, limit: 100})));
  const army = b.army(0);
  assert.equal(new Set(army.map(f => f.slot)).size, 61);
  for (let i = 0; i < army.length; i++) for (let j = i + 1; j < army.length; j++) {
    assert.ok(Math.hypot(army[i].x - army[j].x, army[i].y - army[j].y) >= (army[i].king ? 10 : 6) + (army[j].king ? 10 : 6));
  }
});
test('crowded collision corrections cannot teleport a fighter', () => {
  const b = new Battle(settings.map(t => ({...t, army: 30, limit: 30})));
  for (const f of b.fighters) { f.x = 500; f.y = 340; f.hp = 100000; f.cooldown = 100; }
  for (let step = 0; step < 120; step++) {
    const previous = new Map(b.fighters.map(f => [f.id, {x: f.x, y: f.y}]));
    b.tick(1 / 60);
    for (const f of b.fighters) { const p = previous.get(f.id); assert.ok(Number.isFinite(f.x) && Number.isFinite(f.y)); assert.ok(Math.hypot(f.x - p.x, f.y - p.y) <= (f.speed + 30) / 60 + .001); }
  }
});
test('fighters retain a living target when another enemy becomes slightly closer', () => {
  const b = battle(), f = b.army(0)[0], enemy = b.army(1)[0], rival = b.army(2)[0];
  f.x = 500; f.y = 340; enemy.x = 525; enemy.y = 340; rival.x = 520; rival.y = 340; f.targetId = enemy.id;
  b.tick(1 / 60); assert.equal(f.targetId, enemy.id);
  enemy.hp = 0; b.tick(1 / 60); assert.notEqual(f.targetId, enemy.id);
});
