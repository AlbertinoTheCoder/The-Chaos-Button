import { playSfx } from './sound';
import { circle, finish, H, particle, text, W, type SimContext } from './simulation';
export function arcade(mode: string, c: SimContext): boolean {
  const { ctx, s, p, v, color, dt, random } = c;
  const d = s.data,
    t = s.time;
  if (mode === 'whack') {
    s.goal = 10 + v * 2;
    d.spawn ??= 0;
    if (t > d.spawn) {
      d.spawn = t + 0.65 - v * 0.06;
      const o = particle(65 + random() * 470, 45 + random() * 160, random() < 0.22 ? 1 : 0);
      o.extra = t + 1.6 - v * 0.12;
      s.objects.push(o);
    }
    for (const o of s.objects) {
      if (t > o.extra!) o.alive = false;
      if (!o.alive) continue;
      circle(ctx, o.x, o.y, 22, o.kind ? '#91c79b' : color);
      text(ctx, o.kind ? '✓' : ['!', '⚑', '×', '?', '▲'][v], o.x, o.y + 6, '#142028', 22);
      if (p.clicked && Math.hypot(p.x - o.x, p.y - o.y) < 28) {
        o.alive = false;
        if (o.kind) {
          s.health--;
          s.status = 'That one was innocent!';
        } else {
          s.score++;
          s.status = 'INTRUDER BONKED.';
        }
      }
    }
    s.objects = s.objects.filter((o) => o.alive);
    if (s.score >= s.goal) finish(s, true);
    if (t > 25) finish(s, s.score >= s.goal);
    return true;
  }
  if (mode === 'defuse') {
    s.goal = 100;
    const danger = Math.sin(t * (2 + v * 0.3)) > 0.55;
    d.progress ??= 0;
    if (p.down) {
      d.progress += dt * (danger ? -35 : 22 - v);
      if (danger && t > (d.hit ?? 0)) {
        s.health--;
        d.hit = t + 0.7;
      }
    }
    d.progress = Math.max(0, d.progress);
    s.score = Math.floor(d.progress);
    circle(ctx, 300, 105, 65, danger ? '#ba4c43' : '#405e4b');
    text(ctx, danger ? 'RELEASE' : 'HOLD', 300, 110, '#eee', 24);
    text(ctx, String(Math.max(0, Math.ceil(18 - t))), 300, 145, '#ddd', 20);
    ctx.fillStyle = '#30323c';
    ctx.fillRect(100, 200, 400, 12);
    ctx.fillStyle = danger ? '#f36e60' : color;
    ctx.fillRect(100, 200, d.progress * 4, 12);
    s.status = danger
      ? 'HANDS OFF. IT IS LISTENING.'
      : 'Hold steady. Nothing could possibly go wrong.';
    if (d.progress >= 100) finish(s, true);
    if (t > 18) finish(s, false);
    return true;
  }
  if (mode === 'balance') {
    s.goal = 12;
    d.x ??= 300;
    d.vx ??= 0;
    const tilt = ((p.x - 300) / 300) * 0.25;
    d.vx += (Math.sin(tilt) * 300 + Math.sin(t * (2 + v)) * (10 + v * 4)) * dt;
    d.vx *= 0.995;
    d.x += d.vx * dt;
    ctx.save();
    ctx.translate(300, 150);
    ctx.rotate(tilt);
    ctx.fillStyle = '#7c818d';
    ctx.fillRect(-205, -4, 410, 8);
    circle(ctx, d.x - 300, -17, 15, color);
    ctx.restore();
    ctx.fillStyle = '#515566';
    ctx.beginPath();
    ctx.moveTo(300, 154);
    ctx.lineTo(270, 220);
    ctx.lineTo(330, 220);
    ctx.fill();
    text(ctx, '← TILT →', 300, 35, '#a7a0b0', 11);
    s.score = Math.floor(t);
    if (d.x < 95 || d.x > 505) finish(s, false, 'GRAVITY WINS THIS ROUND.');
    if (t >= 12) finish(s, true);
    return true;
  }
  if (mode === 'launch') {
    s.goal = 3;
    const tx = 440 + Math.sin(t * (0.8 + v * 0.2)) * 60,
      ty = 150 + Math.sin(t * 1.3) * 50;
    circle(ctx, tx, ty, 25 - v * 2, color + '55');
    circle(ctx, tx, ty, 12, color);
    circle(ctx, 70, 200, 15, '#b1c7ac');
    if (p.down) {
      ctx.strokeStyle = color;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(70, 200);
      ctx.lineTo(70 + (70 - p.x) * 2, 200 + (200 - p.y) * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (p.released) {
      const o = particle(70, 200);
      o.vx = Math.max(90, (70 - p.x) * 5);
      o.vy = (200 - p.y) * 5;
      o.extra = t;
      s.objects.push(o);
    }
    for (const o of s.objects) {
      o.vy += 180 * dt;
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      circle(ctx, o.x, o.y, 8, '#e4dcb8');
      if (Math.hypot(o.x - tx, o.y - ty) < 30 - v * 2) {
        o.alive = false;
        s.score++;
        s.status = 'A PROBLEM SUCCESSFULLY YEETED.';
      }
      if (o.y > H + 30 || o.x > W + 30) {
        o.alive = false;
        s.health--;
      }
    }
    s.objects = s.objects.filter((o) => o.alive);
    text(ctx, 'DRAG BACK FROM HERE', 90, 240, '#999', 9);
    if (s.score >= 3) finish(s, true);
    return true;
  }
  if (mode === 'pinball') {
    s.goal = 200 + v * 30;
    d.x ??= 300;
    d.y ??= 80;
    d.vx ??= 100;
    d.vy ??= 80;
    d.vy += 190 * dt;
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (d.x < 10 || d.x > 590) {
      playSfx('bounce', { intensity: 0.45 });
      d.vx *= -1;
      d.x = Math.max(10, Math.min(590, d.x));
    }
    if (d.y < 10) {
      playSfx('bounce', { pitch: 1.2, intensity: 0.45 });
      d.y = 10;
      d.vy = Math.abs(d.vy);
    }
    for (let j = 0; j < 4; j++) {
      const x = 130 + j * 115,
        y = 80 + (j % 2) * 50;
      circle(ctx, x, y, 21, color);
      if (Math.hypot(d.x - x, d.y - y) < 31) {
        const a = Math.atan2(d.y - y, d.x - x);
        d.vx = Math.cos(a) * 220;
        d.vy = Math.sin(a) * 220;
        s.score += 10;
        circle(ctx, x, y, 26, '#fff');
      }
    }
    const flip = p.down;
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#9bb6c9';
    for (const side of [0, 1]) {
      ctx.beginPath();
      ctx.moveTo(side ? 490 : 110, 224);
      ctx.lineTo(side ? 355 : 245, flip ? 195 : 238);
      ctx.stroke();
    }
    if (d.y > 210 && d.y < 245 && d.x > 105 && d.x < 495 && flip && d.vy > 0) {
      playSfx('bounce', { pitch: 1.5, intensity: 0.6 });
      d.vy = -290;
      d.vx = (d.x - 300) * 1.5;
    }
    s.status = 'HOLD TO FLIP THE PADDLES.';
    circle(ctx, d.x, d.y, 8, '#eee');
    if (d.y > 280) {
      s.health--;
      d.x = 300;
      d.y = 40;
      d.vx = 100;
      d.vy = 0;
    }
    if (s.score >= s.goal) finish(s, true);
    return true;
  }
  if (mode === 'orbit') {
    s.goal = 3;
    const a = t * (1.3 + v * 0.25),
      ox = 150,
      oy = 130,
      r = 65,
      tx = 460 + Math.sin(t) * 35,
      ty = 130 + Math.sin(t * 0.7) * 65;
    ctx.strokeStyle = '#646070';
    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, 7);
    ctx.stroke();
    circle(ctx, ox, oy, 27, color);
    circle(ctx, ox + Math.cos(a) * r, oy + Math.sin(a) * r, 8, '#eee');
    circle(ctx, tx, ty, 25 - v, color + '66');
    if (p.clicked) {
      const o = particle(ox + Math.cos(a) * r, oy + Math.sin(a) * r);
      o.vx = -Math.sin(a) * 260;
      o.vy = Math.cos(a) * 260;
      s.objects.push(o);
    }
    for (const o of s.objects) {
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      circle(ctx, o.x, o.y, 7, '#e9d9ab');
      if (Math.hypot(o.x - tx, o.y - ty) < 27 - v) {
        o.alive = false;
        s.score++;
        s.status = 'ORBITAL PARKING APPROVED.';
      }
      if (o.x < 0 || o.x > 600 || o.y < 0 || o.y > 260) {
        o.alive = false;
        s.health--;
      }
    }
    s.objects = s.objects.filter((o) => o.alive);
    if (s.score >= 3) finish(s, true);
    return true;
  }
  if (mode === 'catch') {
    s.goal = 12 + v;
    d.next ??= 0;
    if (t > d.next) {
      d.next = t + 0.5 - v * 0.035;
      const o = particle(25 + random() * 550, -10, random() < 0.22 ? 1 : 0);
      o.vy = 95 + v * 20;
      s.objects.push(o);
    }
    ctx.fillStyle = '#adc7a2';
    ctx.fillRect(p.x - 30, 225, 60, 16);
    for (const o of s.objects) {
      o.y += o.vy * dt;
      circle(ctx, o.x, o.y, 10, o.kind ? '#ed6b62' : color);
      if (o.y > 215 && o.y < 245 && Math.abs(o.x - p.x) < 40) {
        o.alive = false;
        if (o.kind) s.health--;
        else s.score++;
      }
      if (o.y > 275) {
        o.alive = false;
        if (!o.kind) s.health--;
      }
    }
    s.objects = s.objects.filter((o) => o.alive);
    if (s.score >= s.goal) finish(s, true);
    return true;
  }
  if (mode === 'stack') {
    s.goal = 10;
    d.width ??= 190;
    d.left ??= 205;
    d.current = 50 + (Math.sin(t * (1.5 + v * 0.2)) + 1) * 180;
    const y = 225 - s.score * 16;
    ctx.fillStyle = '#a7a5b4';
    ctx.fillRect(d.left, y + 18, d.width, 14);
    ctx.fillStyle = color;
    ctx.fillRect(d.current, y, d.width, 14);
    for (let j = 0; j < s.points.length; j++) {
      const block = s.points[j];
      ctx.fillStyle = j % 2 ? color + 'aa' : '#64647e';
      ctx.fillRect(block.x, 243 - j * 16, block.y, 14);
    }
    if (p.clicked) {
      const left = Math.max(d.left, d.current),
        right = Math.min(d.left + d.width, d.current + d.width);
      if (right <= left) {
        finish(s, false, 'THAT FLOOR HAS NO SUPPORTING ARGUMENT.');
      } else {
        s.points.push({ x: left, y: right - left });
        d.left = left;
        d.width = right - left;
        s.score++;
        if (s.score >= 10) finish(s, true);
      }
    }
    return true;
  }
  if (mode === 'fishing') {
    s.goal = 5;
    d.cast ??= 0;
    d.bite ??= 0;
    const fx = 300 + Math.sin(t * (1 + v * 0.25)) * 245,
      fy = 170 + Math.cos(t * 1.5) * 20;
    ctx.fillStyle = '#456c8c25';
    ctx.fillRect(0, 80, 600, 180);
    ctx.strokeStyle = '#a8bbc3';
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, d.cast ? 150 : 55);
    ctx.stroke();
    text(ctx, d.bite ? '!' : 'J', 300, d.cast ? 150 : 55, d.bite ? '#e9bc6a' : '#a8bbc3', 22);
    text(ctx, ['><>', '><)))>', '<°)))><', '><>', '><(((°>'][v], fx, fy, color, 24);
    if (d.cast && Math.abs(fx - 300) < 35) {
      d.bite = t + 0.65;
      s.status = 'BITE! CLICK TO REEL.';
    }
    if (p.clicked) {
      if (d.bite > t) {
        s.score++;
        d.cast = 0;
        d.bite = 0;
        s.status = 'A FISH WITH NO PRIVACY POLICY.';
      } else if (!d.cast) {
        d.cast = t;
        s.status = 'Wait for the flash, then reel.';
      } else {
        s.health--;
        d.cast = 0;
        s.status = 'JUST ANOTHER BOOT.';
      }
    }
    if (d.cast && t - d.cast > 5) {
      s.health--;
      d.cast = 0;
    }
    if (s.score >= 5) finish(s, true);
    return true;
  }
  if (mode === 'mirror') {
    s.goal = 5;
    const mx = 600 - p.x,
      my = p.y;
    d.cx ??= 90;
    d.cy ??= 70;
    for (let i = 0; i < 4; i++) {
      const wx = 140 + i * 110,
        wy = 75 + (i % 2) * 70;
      ctx.fillStyle = '#d65d5c';
      ctx.fillRect(wx, wy, 50, 45);
      if (mx > wx - 7 && mx < wx + 57 && my > wy - 7 && my < wy + 52 && t > (d.hit ?? 0)) {
        s.health--;
        d.hit = t + 1;
      }
    }
    circle(ctx, d.cx, d.cy, 19, '#a5ca91');
    circle(ctx, mx, my, 8, color);
    circle(ctx, p.x, p.y, 5, '#ffffff40');
    ctx.strokeStyle = '#ffffff20';
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, 260);
    ctx.stroke();
    if (Math.hypot(mx - d.cx, my - d.cy) < 25) {
      s.score++;
      d.cx = 45 + random() * 510;
      d.cy = random() < 0.5 ? 35 : 230;
      if (s.score >= 5) finish(s, true);
    }
    s.status = 'THE DOT IS YOU. KIND OF.';
    return true;
  }
  if (mode === 'auction') {
    s.goal = 50;
    d.cash ??= 100;
    d.stock ??= 0;
    d.price = 40 + Math.sin(t * (1 + v * 0.2)) * 24 + Math.sin(t * 3) * 7;
    d.next ??= 0;
    if (t > d.next) {
      d.next = t + 0.15;
      s.points.push({ x: t, y: d.price });
      s.points = s.points.slice(-100);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    s.points.forEach((pt, i) => {
      const x = 20 + i * 5.6,
        y = 210 - pt.y * 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    text(
      ctx,
      'PRICE ' + d.price.toFixed(1) + '   CASH ' + d.cash.toFixed(0) + '   STOCK ' + d.stock,
      300,
      30,
      '#cfc6d4',
      12,
    );
    ctx.fillStyle = '#395d4a';
    ctx.fillRect(50, 220, 220, 30);
    ctx.fillStyle = '#6c3d44';
    ctx.fillRect(330, 220, 220, 30);
    text(ctx, 'BUY', 160, 240);
    text(ctx, 'SELL', 440, 240);
    if (p.clicked && p.y > 215) {
      if (p.x < 300 && d.cash >= d.price) {
        d.cash -= d.price;
        d.stock++;
      } else if (p.x >= 300 && d.stock > 0) {
        d.cash += d.price;
        d.stock--;
      }
    }
    s.score = Math.max(0, Math.floor(d.cash + d.stock * d.price - 100));
    s.status = 'MARKET CLOSES IN ' + Math.max(0, Math.ceil(25 - t)) + 's';
    if (s.score >= 50) finish(s, true);
    if (t > 25) finish(s, false);
    return true;
  }
  return false;
}
