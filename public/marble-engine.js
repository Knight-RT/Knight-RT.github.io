/* Battle rules are independent of drawing and browser controls. */
(function (root) {
  'use strict';
  class MarbleBattle {
    constructor(settings, random = Math.random) {
      this.random = random; this.time = 0; this.fallen = 0; this.events = []; this.effects = []; this.nextId = 1; this.winner = undefined;
      const starts = [[140, 130], [860, 130], [140, 550], [860, 550]];
      this.teams = settings.map((t, id) => ({...t, id, x: starts[id][0], y: starts[id][1], kills: 0, destination: null, travel: 0}));
      this.fighters = []; this.encounters = []; this.nextEncounter = 1;
      this.towns = starts.map(([x, y], owner) => ({x, y, owner, name: `${settings[owner].name} home`, reserve: 0, timer: 0, claimant: null, progress: 0}));
      [[500, 120], [320, 340], [680, 340], [500, 560], [500, 340]].forEach(([x, y], i) => this.towns.push({x, y, owner: null, name: ['Northwatch', 'Westbridge', 'Eastbridge', 'Southwatch', 'Crossing'][i], reserve: 0, timer: 0, claimant: null, progress: 0}));
      for (const t of this.teams) { this.spawn(t, true); for (let i = 0; i < t.army; i++) this.spawn(t); }
      this.log('The kings march. Capture towns and return for reinforcements.');
    }
    log(text) { this.events.unshift({time: this.time, text}); this.events.length = Math.min(this.events.length, 40); }
    army(id) { return this.fighters.filter(f => f.team === id && f.hp > 0); }
    spawn(t, king = false) {
      const used = new Set(this.army(t.id).map(f => f.slot));
      let slot = 0; while (used.has(slot)) slot++;
      const angle = slot * 2.39996, radius = slot === 0 ? 0 : 19 * Math.sqrt(slot);
      const f = {id: this.nextId++, team: t.id, king, x: t.x + Math.cos(angle) * radius, y: t.y + Math.sin(angle) * radius, hp: king ? t.castle : t.health, maxHp: king ? t.castle : t.health, attack: t.attack, speed: t.movement, armor: 0, level: 1, xp: 0, kills: 0, equipment: 'None', cooldown: this.random()};
      f.name = king ? (t.leader || `${t.name} Sovereign`) : `${t.name} ${['Ash', 'Rowan', 'Vale', 'Wren', 'Flint', 'Reed'][f.id % 6]} ${f.id}`;
      f.angle = angle; f.swing = 0; f.slot = slot; f.vx = 0; f.vy = 0; f.encounter = null; f.spin = (this.random() < .5 ? -1 : 1) * 2.4;
      this.fighters.push(f); return f;
    }
    reward(f) {
      const t = this.teams[f.team]; f.kills++; f.xp++; t.kills++;
      if (f.xp < t.xp) return;
      f.xp -= t.xp; f.level++;
      let perk;
      if (f.level % 3 === 2) { const gain = Math.ceil(t.health * .25); f.maxHp += gain; f.hp += gain; perk = `+${gain} health`; }
      else if (f.level % 3 === 0) { f.speed += t.movement * .1; perk = '+10% base speed'; }
      else { f.attack += Math.max(1, Math.ceil(t.attack * .2)); f.armor += 2; f.equipment = `Arms tier ${Math.floor(f.level / 3)}`; perk = 'upgraded weapon and armor'; }
      this.log(`${t.name} ${f.king ? 'king' : 'fighter #' + f.id} reached level ${f.level}: ${perk}.`);
    }
    chooseDestination(t) {
      // No remote enemy tracking: destinations are random towns or open ground.
      if (this.random() < .7) {
        const choices = this.towns.filter(town => Math.hypot(town.x - t.x, town.y - t.y) > 100);
        const town = choices[Math.floor(this.random() * choices.length)];
        t.destination = town ? {x: town.x, y: town.y} : {x: 500, y: 340};
      } else t.destination = {x: 60 + this.random() * 880, y: 60 + this.random() * 560};
      t.travel = 0;
    }
    tick(dt) {
      if (this.winner !== undefined) return;
      this.time += dt;
      this.effects = this.effects.filter(e => this.time - e.time < 1.2);
      const armies = this.teams.map(t => this.army(t.id));
      // Armies wander together and stop to fight only when another army is encountered.
      for (const t of this.teams) {
        if (!armies[t.id].length) continue;
        const encountered = this.teams.some(other => other.id !== t.id && armies[other.id].length && Math.hypot(t.x - other.x, t.y - other.y) < 120);
        if (!encountered && !t.room) {
          if (!t.destination) this.chooseDestination(t);
          const d = Math.hypot(t.destination.x - t.x, t.destination.y - t.y);
          t.travel += dt;
          if (d < 8 || t.travel > 24) t.destination = null;
          else { const speed = Math.min(...armies[t.id].map(f => f.speed)) * .65; const move = Math.min(d, speed * dt); t.x += (t.destination.x - t.x) / d * move; t.y += (t.destination.y - t.y) / d * move; }
        }
      }
      // Encounter rooms persist until only one kingdom remains. World armies stop here.
      for (const room of this.encounters) {
        const survivors = room.teams.filter(id => this.army(id).length);
        if (survivors.length < 2) {
          room.done = true;
          for (const id of room.teams) { const team = this.teams[id]; team.room = null; team.destination = null; team.x = room.x; team.y = room.y; }
          for (const f of this.fighters) if (f.encounter === room.id) { f.encounter = null; f.vx = 0; f.vy = 0; }
        }
      }
      this.encounters = this.encounters.filter(room => !room.done);
      for (const a of this.teams) for (const b of this.teams) {
        if (a.id >= b.id || a.room || b.room || !this.army(a.id).length || !this.army(b.id).length || Math.hypot(a.x-b.x,a.y-b.y) >= 120) continue;
        const room = {id: this.nextEncounter++, teams:[a.id,b.id], x:Math.max(160,Math.min(840,(a.x+b.x)/2)), y:Math.max(200,Math.min(480,(a.y+b.y)/2)), halfWidth:145, halfHeight:185};
        this.encounters.push(room); a.room = room.id; b.room = room.id;
        for (const f of this.fighters.filter(f=>room.teams.includes(f.team))) {
          f.encounter = room.id;
          const heading=this.random()*Math.PI*2; f.vx=Math.cos(heading)*f.speed; f.vy=Math.sin(heading)*f.speed;
          const radius=f.king?10:6;
          f.x=Math.max(room.x-room.halfWidth+radius,Math.min(room.x+room.halfWidth-radius,f.x));
          f.y=Math.max(room.y-room.halfHeight+radius,Math.min(room.y+room.halfHeight-radius,f.y));
        }
        this.log(a.name+' meets '+b.name+' on the battlefield.');
      }
      const attacks = [];
      for (const f of this.fighters) {
        if (f.hp <= 0) continue;
        f.cooldown=Math.max(0,f.cooldown-dt); f.swing=Math.max(0,f.swing-dt);
        const room=this.encounters.find(room=>room.id===f.encounter);
        if (room) {
          // Ballistic motion: no enemy coordinates enter velocity or heading calculations.
          f.angle += f.spin*dt;
          f.x+=f.vx*dt; f.y+=f.vy*dt;
          const radius=f.king?10:6, left=room.x-room.halfWidth+radius, right=room.x+room.halfWidth-radius, top=room.y-room.halfHeight+radius, bottom=room.y+room.halfHeight-radius;
          if(f.x<left){f.x=left;f.vx=Math.abs(f.vx);} if(f.x>right){f.x=right;f.vx=-Math.abs(f.vx);}
          if(f.y<top){f.y=top;f.vy=Math.abs(f.vy);} if(f.y>bottom){f.y=bottom;f.vy=-Math.abs(f.vy);}
        } else {
          const team=this.teams[f.team], angle=f.slot*2.39996, radius=f.slot===0?0:19*Math.sqrt(f.slot);
          const tx=team.x+Math.cos(angle)*radius, ty=team.y+Math.sin(angle)*radius, dx=tx-f.x, dy=ty-f.y, d=Math.hypot(dx,dy);
          const speed=Math.min(f.speed,Math.max(0,d-2)*5), blend=1-Math.exp(-12*dt);
          f.vx+=((d?dx/d*speed:0)-f.vx)*blend;f.vy+=((d?dy/d*speed:0)-f.vy)*blend;f.x+=f.vx*dt;f.y+=f.vy*dt; f.angle+=f.spin*dt;
        }
      }
      // A rotating blade must physically intersect an opponent to deal damage.
      for(const f of this.fighters){
        if(f.hp<=0||f.cooldown>0||f.encounter===null)continue;
        const radius=f.king?10:6, ux=Math.cos(f.angle),uy=Math.sin(f.angle);
        const ax=f.x+ux*radius,ay=f.y+uy*radius,bx=f.x+ux*(radius+10),by=f.y+uy*(radius+10);
        for(const enemy of this.fighters){
          if(enemy.team===f.team||enemy.hp<=0||enemy.encounter!==f.encounter)continue;
          const t=Math.max(0,Math.min(1,((enemy.x-ax)*(bx-ax)+(enemy.y-ay)*(by-ay))/100));
          if(Math.hypot(enemy.x-ax-t*(bx-ax),enemy.y-ay-t*(by-ay))<=(enemy.king?10:6)+1){attacks.push([f,enemy]);f.cooldown=.4;f.swing=.2;break;}
        }
      }
      for (const [f, enemy] of attacks) {
        if (enemy.hp <= 0) continue;
        const damage = Math.max(1, f.attack - enemy.armor);
        enemy.hp -= damage;
        this.effects.push({x: enemy.x, y: enemy.y, text: String(damage), time: this.time, color: '#792a22'});
        if (enemy.hp <= 0) { enemy.hp = 0; this.fallen++; if (f.hp > 0) this.reward(f); else { f.kills++; this.teams[f.team].kills++; }
          if (enemy.king) this.log(`${this.teams[enemy.team].name}'s king has fallen. Its surviving army fights on.`);
        }
      }
      const corrections = new Map(this.fighters.map(f => [f.id, {x: 0, y: 0}]));
      for (let i = 0; i < this.fighters.length; i++) for (let j = i + 1; j < this.fighters.length; j++) {
        const a = this.fighters[i], b = this.fighters[j]; if (a.hp <= 0 || b.hp <= 0 || a.encounter !== b.encounter) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), radius = (a.king ? 10 : 6) + (b.king ? 10 : 6);
        if (d < radius) {
          const nx = d ? dx / d : Math.cos(a.id * 2.39996), ny = d ? dy / d : Math.sin(a.id * 2.39996), push = (radius - d) * .25;
          const ca = corrections.get(a.id), cb = corrections.get(b.id); ca.x -= nx * push; ca.y -= ny * push; cb.x += nx * push; cb.y += ny * push;
          const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (closing < 0) { a.vx += closing * nx * (a.encounter ? .98 : .5); a.vy += closing * ny * (a.encounter ? .98 : .5); b.vx -= closing * nx * .5; b.vy -= closing * ny * .5; }
        }
      }
      for (const f of this.fighters) { const correction = corrections.get(f.id), length = Math.hypot(correction.x, correction.y), scale = length ? Math.min(1, 30 * dt / length) : 0; f.x += correction.x * scale; f.y += correction.y * scale; }
      this.fighters = this.fighters.filter(f => f.hp > 0);
      for (const f of this.fighters) { f.x = Math.max(12, Math.min(988, f.x)); f.y = Math.max(12, Math.min(668, f.y)); }
      const alive = this.teams.filter(t => this.army(t.id).length);
      for (const town of this.towns) {
        if (town.owner !== null && !alive.some(t => t.id === town.owner)) { town.owner = null; town.reserve = 0; town.timer = 0; }
        // Reserves are stationed in towns; they join only a visiting friendly army.
        if (town.owner !== null) {
          const t = this.teams[town.owner]; town.timer += dt;
          while (town.timer >= t.recruit) { town.timer -= t.recruit; town.reserve = Math.min(t.limit, town.reserve + 1); }
        }
        const visitors = alive.filter(t => !t.room && this.army(t.id).some(f => Math.hypot(f.x - town.x, f.y - town.y) < 48));
        if (visitors.length !== 1) { town.claimant = null; town.progress = 0; continue; }
        const visitor = visitors[0];
        if (town.owner !== visitor.id) {
          if (town.claimant !== visitor.id) { town.claimant = visitor.id; town.progress = 0; }
          town.progress += dt;
          if (town.progress >= 3) { town.owner = visitor.id; town.reserve = 0; town.timer = 0; town.claimant = null; town.progress = 0; this.log(`${visitor.name} captured ${town.name}.`); }
        } else {
          town.claimant = null; town.progress = 0;
          const count = Math.min(town.reserve, visitor.limit - this.army(visitor.id).filter(f => !f.king).length);
          if (count > 0) { for (let i = 0; i < count; i++) this.spawn(visitor); town.reserve -= count; this.log(`${visitor.name} reinforced with ${count} fighter${count === 1 ? '' : 's'} at ${town.name}.`); }
        }
      }
      if (alive.length <= 1) { this.winner = alive.length ? alive[0].id : null; this.log(alive.length ? `${alive[0].name} wins! All enemy kings and armies are defeated.` : 'All kings and armies fell. A draw.'); }
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = MarbleBattle;
  else root.MarbleBattle = MarbleBattle;
})(globalThis);
