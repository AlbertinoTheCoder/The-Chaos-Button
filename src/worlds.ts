import { circle, finish, H, particle, text, W, type SimContext } from './simulation';
export function world(mode: string, c: SimContext): boolean {
  const { ctx, s, p, v, color, dt, random } = c;
  const d = s.data,
    t = s.time;
  if (mode === 'paint') {
    s.goal = 100;
    const hue = ['#f58b66', '#e7c577', '#cc9bdf', '#7ecbb6', '#7eade4'];
    if (p.down && p.y > 35) {
      ctx.lineCap = 'round';
      ctx.lineWidth = 5 + v * 3;
      ctx.strokeStyle = hue[Math.floor(t / 5) % 5];
      if (s.points.length) {
        ctx.beginPath();
        const old = s.points[s.points.length - 1];
        ctx.moveTo(old.x, old.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      s.points.push({ x: p.x, y: p.y });
      s.score = Math.min(100, s.points.length);
    } else s.points = [];
    ctx.fillStyle = '#111520';
    ctx.fillRect(0, 0, 600, 35);
    text(
      ctx,
      'CURRENT INK / ' +
        ['REGRET', 'MUSTARD', 'MYSTERY', 'MINT', 'DENIAL'][Math.floor(t / 5) % 5] +
        ' · ' +
        (5 + v * 3) +
        'px BRUSH',
      300,
      22,
      color,
      10,
    );
    s.status =
      s.score >= 100
        ? 'THE MUSEUM DECLINED TO COMMENT.'
        : 'Your color changes every five seconds. This counts as art.';
    return true;
  }
  if (mode === 'scratch') {
    s.goal = 85;
    if (!d.initialized) {
      ctx.fillStyle = '#7d8291';
      ctx.fillRect(0, 0, 600, 260);
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = i % 2 ? '#969dab' : '#666c79';
        ctx.fillRect(random() * 600, random() * 260, 20, 3);
      }
      d.initialized = 1;
      d.scratched = 0;
    }
    if (p.down) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      circle(ctx, p.x, p.y, 22 + v * 2, '#000');
      ctx.restore();
      for (let y = 10; y < 260; y += 20)
        for (let x = 10; x < 600; x += 20)
          if (
            Math.hypot(x - p.x, y - p.y) < 22 + v * 2 &&
            !s.points.some((pt) => pt.x === x && pt.y === y)
          )
            s.points.push({ x, y });
      s.score = Math.min(100, Math.floor((s.points.length / 390) * 100));
    }
    s.status =
      s.score >= 85
        ? 'PRIZE: A LIFETIME SUPPLY OF MORE BUTTON.'
        : 'Keep scratching. The prize is under there. Allegedly.';
    if (s.score >= 85 && !d.prize) {
      d.prize = 1;
      s.won = true;
    }
    return true;
  }
  if (mode === 'swarm') {
    s.goal = 12;
    if (!d.init) {
      s.objects = Array.from({ length: 28 + v * 6 }, () => {
        const o = particle(random() * 600, random() * 260);
        o.vx = random() * 100 - 50;
        o.vy = random() * 100 - 50;
        return o;
      });
      s.points = Array.from({ length: 12 }, () => ({
        x: 20 + random() * 560,
        y: 20 + random() * 220,
      }));
      d.init = 1;
    }
    for (const o of s.objects) {
      const dx = p.x - o.x,
        dy = p.y - o.y,
        dist = Math.hypot(dx, dy) || 1;
      const force = p.down ? -170 : 110;
      o.vx += ((dx / dist) * force - o.vx * 0.9) * dt;
      o.vy += ((dy / dist) * force - o.vy * 0.9) * dt;
      o.x = (o.x + o.vx * dt + 600) % 600;
      o.y = (o.y + o.vy * dt + 260) % 260;
      circle(ctx, o.x, o.y, 3 + v * 0.3, color);
      s.points = s.points.filter((pt) => {
        if (Math.hypot(o.x - pt.x, o.y - pt.y) < 13) {
          s.score++;
          return false;
        }
        return true;
      });
    }
    for (const pt of s.points) {
      circle(ctx, pt.x, pt.y, 6, '#e5cf86');
      circle(ctx, pt.x, pt.y, 11, '#e5cf8618');
    }
    if (s.score >= 12) finish(s, true, 'THE SWARM ACCEPTS YOUR QUESTIONABLE LEADERSHIP.');
    return true;
  }
  if (mode === 'herd') {
    s.goal = 5 + v;
    if (!d.init) {
      s.objects = Array.from({ length: 5 + v }, () =>
        particle(220 + random() * 330, 30 + random() * 190),
      );
      d.init = 1;
    }
    ctx.fillStyle = '#91ca9520';
    ctx.fillRect(5, 65, 100, 130);
    ctx.strokeStyle = '#91ca95';
    ctx.strokeRect(5, 65, 100, 130);
    text(ctx, 'HOME', 55, 140, '#91ca95', 12);
    for (const o of s.objects) {
      if (!o.alive) continue;
      const dx = o.x - p.x,
        dy = o.y - p.y,
        dist = Math.hypot(dx, dy) || 1;
      if (dist < 100) {
        o.vx += (dx / dist) * 180 * dt;
        o.vy += (dy / dist) * 180 * dt;
      }
      o.vx *= 0.98;
      o.vy *= 0.98;
      o.x = Math.max(15, Math.min(585, o.x + o.vx * dt));
      o.y = Math.max(15, Math.min(245, o.y + o.vy * dt));
      text(ctx, ['=^.^=', '▣', '♧', '▲', '<°)'][v], o.x, o.y, color, 17);
      if (o.x < 95 && o.y > 65 && o.y < 195) {
        o.alive = false;
        s.score++;
      }
    }
    if (s.score >= s.goal) finish(s, true, 'EVERYONE IS HOME. NOBODY SAYS THANK YOU.');
    return true;
  }
  if (mode === 'grow') {
    s.goal = 100;
    d.growth ??= 5;
    d.danger ??= 0;
    d.danger += dt * (1.4 + v * 0.3);
    if (p.clicked) {
      if (p.x > 450) {
        d.danger = Math.max(0, d.danger - 15);
        s.status = 'A terrible opinion has been pruned.';
      } else {
        d.growth += 7;
        d.danger += 1;
      }
    }
    ctx.fillStyle = '#856442';
    ctx.fillRect(287, 190 - d.growth, 26, d.growth + 20);
    for (let i = 0; i < Math.floor(d.growth / 10); i++) {
      const y = 190 - i * 12;
      ctx.strokeStyle = color;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(300, y);
      ctx.lineTo(300 + (i % 2 ? -1 : 1) * (25 + i * 3), y - 20);
      ctx.stroke();
      circle(ctx, 300 + (i % 2 ? -1 : 1) * (25 + i * 3), y - 20, 12, color);
    }
    ctx.fillStyle = '#674757';
    ctx.fillRect(250, 210, 100, 25);
    ctx.fillStyle = '#a54e51';
    ctx.fillRect(465, 200, 120, 36);
    text(ctx, 'TRIM ✂', 525, 223, '#fff', 12);
    text(ctx, 'BAD OPINIONS ' + Math.floor(d.danger) + '%', 490, 45, '#dd9291', 10);
    s.score = Math.floor(d.growth);
    if (d.danger > 100) finish(s, false, 'YOUR PLANT NOW HOSTS A PODCAST.');
    if (d.growth >= 100) finish(s, true, 'FULLY GROWN. ONLY SLIGHTLY SENTIENT.');
    return true;
  }
  if (mode === 'vacuum') {
    s.goal = 45;
    if (!d.init) {
      s.objects = Array.from({ length: 45 }, () => {
        const o = particle(random() * 600, random() * 260);
        o.r = 3 + random() * 6;
        return o;
      });
      d.init = 1;
    }
    for (const o of s.objects) {
      if (!o.alive) continue;
      const dx = p.x - o.x,
        dy = p.y - o.y,
        dist = Math.hypot(dx, dy) || 1;
      const force = p.down ? 200 : -65;
      o.vx += ((dx / dist) * force - o.vx * 0.8) * dt;
      o.vy += ((dy / dist) * force - o.vy * 0.8) * dt;
      o.x = Math.max(2, Math.min(598, o.x + o.vx * dt));
      o.y = Math.max(2, Math.min(258, o.y + o.vy * dt));
      circle(ctx, o.x, o.y, o.r, color);
      if (p.down && dist < 15) {
        o.alive = false;
        s.score++;
      }
    }
    circle(ctx, p.x, p.y, p.down ? 18 : 12, p.down ? '#0a0a11' : '#b6c2c8');
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.down ? 36 : 22, 0, 7);
    ctx.stroke();
    if (s.score >= 45) finish(s, true, 'A SPOTLESS VOID. THE UNIVERSE IS PROUD.');
    return true;
  }
  if (mode === 'domino') {
    s.goal = 28;
    if (!d.init) {
      s.objects = Array.from({ length: 28 }, (_, i) => {
        const o = particle(38 + i * 19, 120 + Math.sin(i * 0.35 + v) * 50);
        o.extra = 0;
        return o;
      });
      d.init = 1;
    }
    if (p.clicked) {
      const nearest = s.objects.find((o) => Math.hypot(o.x - p.x, o.y - p.y) < 23);
      if (nearest) nearest.kind = 1;
      else {
        s.objects.push(particle(p.x, p.y));
        s.goal++;
      }
    }
    for (const o of s.objects) {
      if (o.kind) {
        o.extra = Math.min(1, (o.extra ?? 0) + dt * 5);
        if (o.extra > 0.45) {
          for (const n of s.objects)
            if (n !== o && Math.hypot(n.x - o.x, n.y - o.y) < 35 && !n.kind) n.kind = 1;
        }
      }
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate((o.extra ?? 0) * 1.4);
      ctx.fillStyle = o.kind ? color : '#a0a3b6';
      ctx.fillRect(-3, -24, 7, 30);
      ctx.restore();
    }
    s.score = s.objects.filter((o) => (o.extra ?? 0) > 0.9).length;
    s.status = 'The chain reaction is legally your fault.';
    if (s.score >= s.goal) s.status = 'ALL STANDARDS HAVE FALLEN. PERFECT.';
    return true;
  }
  if (mode === 'lens') {
    s.goal = 5;
    if (!d.init) {
      s.points = Array.from({ length: 5 }, () => ({
        x: 35 + random() * 530,
        y: 35 + random() * 190,
      }));
      d.init = 1;
    }
    const r = 65 - v * 6;
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, 600, 260);
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, 7);
    ctx.clip();
    ctx.fillStyle = '#56545e';
    ctx.fillRect(0, 0, 600, 260);
    for (let j = 0; j < 200; j++) text(ctx, '.', (j * 37) % 600, (j * 73) % 260, '#817b86', 10);
    for (const pt of s.points) text(ctx, ['♟', '♧', '✦', '◈', '?'][v], pt.x, pt.y, color, 24);
    ctx.restore();
    ctx.strokeStyle = '#c0ab77';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, 7);
    ctx.stroke();
    if (p.clicked) {
      s.points = s.points.filter((pt) => {
        if (Math.hypot(pt.x - p.x, pt.y - p.y) < 23) {
          s.score++;
          return false;
        }
        return true;
      });
    }
    if (s.score >= 5) finish(s, true, 'THEY WERE HERE THE WHOLE TIME. UNCOMFORTABLE.');
    return true;
  }
  if (mode === 'constellation') {
    s.goal = 7 + v;
    if (!d.init) {
      s.points = Array.from({ length: s.goal }, (_, i) => ({
        x: 60 + ((i * 137 + v * 37) % 480),
        y: 40 + ((i * 71 + v * 13) % 180),
      }));
      d.init = 1;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    s.points
      .slice(0, s.score)
      .forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
    ctx.stroke();
    s.points.forEach((pt, i) => {
      circle(ctx, pt.x, pt.y, i === s.score ? 12 : 5, i < s.score ? color : '#a0abc0');
      text(ctx, String(i + 1), pt.x, pt.y - 15, i === s.score ? color : '#72788c', 10);
    });
    if (
      p.clicked &&
      s.points[s.score] &&
      Math.hypot(p.x - s.points[s.score].x, p.y - s.points[s.score].y) < 25
    ) {
      s.score++;
      if (s.score >= s.goal) finish(s, true, 'YOUR HOROSCOPE: EXTREMELY CLICKABLE.');
    }
    return true;
  }
  if (mode === 'traffic') {
    s.goal = 12 + v * 2;
    d.green ??= 0;
    d.next ??= 0;
    ctx.fillStyle = '#282e39';
    ctx.fillRect(0, 103, 600, 54);
    ctx.fillRect(273, 0, 54, 260);
    ctx.strokeStyle = '#b6b39840';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, 130);
    ctx.lineTo(600, 130);
    ctx.moveTo(300, 0);
    ctx.lineTo(300, 260);
    ctx.stroke();
    ctx.setLineDash([]);
    if (p.clicked) d.green = 1 - d.green;
    circle(ctx, 255, 80, 12, d.green ? '#e76f65' : '#97cd94');
    circle(ctx, 347, 80, 12, d.green ? '#97cd94' : '#e76f65');
    text(ctx, 'CLICK TO SWITCH', 300, 245, '#aaa', 9);
    if (t > d.next) {
      d.next = t + 1.1 - v * 0.1;
      const o = particle(random() < 0.5 ? -20 : 300, 0);
      o.kind = o.x === 300 ? 1 : 0;
      if (!o.kind) o.y = 130;
      s.objects.push(o);
    }
    for (const o of s.objects) {
      const coord = o.kind ? o.y : o.x;
      const stopped =
        coord > (o.kind ? 65 : 235) && coord < (o.kind ? 90 : 260) && d.green !== o.kind;
      if (!stopped) {
        if (o.kind) o.y += 85 * dt;
        else o.x += 85 * dt;
      }
      ctx.fillStyle = o.kind ? color : '#9cbcc5';
      ctx.fillRect(o.x - 11, o.y - 7, o.kind ? 14 : 24, o.kind ? 24 : 14);
      if (o.x > 620 || o.y > 280) {
        o.alive = false;
        s.score++;
      }
      for (const n of s.objects)
        if (
          n !== o &&
          n.kind !== o.kind &&
          n.alive &&
          o.alive &&
          Math.hypot(o.x - n.x, o.y - n.y) < 18
        ) {
          n.alive = false;
          o.alive = false;
          s.health--;
          s.status = 'AN INSURANCE COMPANY JUST SCREAMED.';
        }
    }
    s.objects = s.objects.filter((o) => o.alive);
    if (s.score >= s.goal) finish(s, true, 'TRAFFIC SOLVED. FOR EXACTLY ONE JUNCTION.');
    return true;
  }
  return false;
}
