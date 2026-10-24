import { useGameFeedback } from './gameAudio';
import { playSfx } from './sound';
import { ReplayButton, CloseGameButton } from './MinigameActions';
import { useEffect, useRef, useState } from 'react';
import { events } from './events';
export function Challenge({
  id,
  onExit,
  onWin,
}: {
  id: number;
  onExit: () => void;
  onWin: () => void;
}) {
  const boss = [30, 78, 96, 111, 112].includes(id);
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef({ x: 300, y: 310, fire: false, keys: new Set<string>() });
  const [hp, setHp] = useState(5),
    [enemy, setEnemy] = useState(100),
    [result, setResult] = useState(''),
    [attempt, setAttempt] = useState(0),
    [score, setScore] = useState(0),
    [answer, setAnswer] = useState('');
  useGameFeedback({ score, health: hp, enemy, result, won: result.includes('SUCCESS'), attempt });
  const replay = () => {
    playSfx('restart');
    input.current.fire = false;
    input.current.keys.clear();
    input.current.x = 300;
    input.current.y = 310;
    setResult('');
    setAnswer('');
    setHp(5);
    setEnemy(100);
    setScore(0);
    setAttempt((a) => a + 1);
  };
  const puzzle = id === 79,
    rps = id === 85,
    rhythm = id === 81;
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    setHp(5);
    setEnemy(100);
    setResult('');
    setScore(0);
    if (puzzle || rps) return;
    const el = canvas.current!;
    const ctx = el.getContext('2d')!;
    let raf = 0,
      last = 0,
      time = 0,
      health = 5,
      bossHp = 100,
      points = 0,
      invincible = 0,
      shot = 0;
    let bullets: { x: number; y: number; vx: number; vy: number; hostile: boolean }[] = [];
    let platforms = Array.from({ length: 7 }, (_, i) => ({ x: i * 85, y: 340 - (i % 3) * 65 }));
    let py = 310,
      vy = 0;
    const keydown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea,select,button')) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key))
        e.preventDefault();
      input.current.keys.add(e.key);
      if (e.key === ' ') input.current.fire = true;
    };
    const keyup = (e: KeyboardEvent) => {
      input.current.keys.delete(e.key);
      if (e.key === ' ') input.current.fire = false;
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    const finish = (win: boolean) => {
      setResult(win ? 'CONTAINMENT SUCCESSFUL' : 'REALITY GOT THE BETTER OF YOU');
      if (win) onWin();
    };
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000 || 0.016, 0.04);
      last = now;
      time += dt;
      const p = input.current;
      const k = p.keys;
      if (k.has('ArrowLeft') || k.has('a')) p.x -= 260 * dt;
      if (k.has('ArrowRight') || k.has('d')) p.x += 260 * dt;
      if (k.has('ArrowUp') || k.has('w')) p.y -= 260 * dt;
      if (k.has('ArrowDown') || k.has('s')) p.y += 260 * dt;
      p.x = Math.max(12, Math.min(588, p.x));
      p.y = Math.max(35, Math.min(368, p.y));
      ctx.fillStyle = '#0b1119';
      ctx.fillRect(0, 0, 600, 390);
      ctx.strokeStyle = '#ffffff08';
      for (let x = 0; x < 600; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 390);
        ctx.stroke();
      }
      for (let y = 0; y < 390; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(600, y);
        ctx.stroke();
      }
      const phase = bossHp > 66 ? 1 : bossHp > 33 ? 2 : 3;
      const ex = 300 + Math.sin(time * (id === 111 ? 0.8 : 1.5)) * 210,
        ey = 75 + Math.cos(time * 2) * 25;
      if (boss) {
        ctx.fillStyle = id === 111 ? '#8ec9e8' : id === 112 ? '#b487ff' : '#ff493e';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 28;
        ctx.beginPath();
        ctx.arc(ex, ey, 32 + phase * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#111';
        ctx.fillRect(ex - 17, ey - 9, 10, 8);
        ctx.fillRect(ex + 7, ey - 9, 10, 8);
        ctx.fillRect(ex - 12, ey + 10, 24, 5);
        ctx.fillStyle = '#d6d6db';
        ctx.font = '10px monospace';
        ctx.fillText('PHASE ' + phase, ex - 22, ey - 48);
        if (Math.floor(time * (2 + phase)) !== Math.floor((time - dt) * (2 + phase))) {
          playSfx('boss', { pitch: 0.8 + phase * 0.15, intensity: 0.3 });
          for (let j = 0; j < phase + 1; j++) {
            const a = Math.atan2(p.y - ey, p.x - ex) + (j - phase / 2) * 0.32;
            bullets.push({
              x: ex,
              y: ey,
              vx: Math.cos(a) * (100 + phase * 25),
              vy: Math.sin(a) * (100 + phase * 25),
              hostile: true,
            });
          }
        }
        if (p.fire && time - shot > 0.15) {
          shot = time;
          playSfx('shoot');
          bullets.push({ x: p.x, y: p.y, vx: 0, vy: -430, hostile: false });
        }
        if (id === 111) {
          ctx.fillStyle = '#456075';
          for (let j = 0; j < 3; j++) {
            const ox = ((j * 210 + time * 25) % 650) - 30;
            ctx.fillRect(ox, 170 + j * 22, 85, 24);
            ctx.fillStyle = '#91a6b7';
            ctx.fillRect(ox, 170 + j * 22, 85, 5);
            ctx.fillStyle = '#456075';
            if (
              Math.abs(p.x - ox - 42) < 50 &&
              Math.abs(p.y - (182 + j * 22)) < 18 &&
              time > invincible
            ) {
              health--;
              invincible = time + 1;
              setHp(health);
            }
          }
        }
        if (id === 112) {
          ctx.strokeStyle = '#b487ff';
          ctx.beginPath();
          ctx.arc(300, 195, 50 + Math.sin(time) * 30, 0, 7);
          ctx.stroke();
          p.x += (300 - p.x) * dt * 0.05 * phase;
          ctx.fillStyle = '#b487ff10';
          ctx.fillRect(0, 0, 600, 390);
        }
      } else if (id === 77 || id === 26) {
        ctx.fillStyle = '#ff4a40';
        ctx.beginPath();
        ctx.arc(ex, ey + 100, 25, 0, 7);
        ctx.fill();
        if (p.fire && Math.hypot(p.x - ex, p.y - ey - 100) < 45 && time - shot > 0.35) {
          points++;
          shot = time;
          setScore(points);
        }
        if (points >= 8) {
          finish(true);
          return;
        }
      } else if (id === 82) {
        vy += 550 * dt;
        if ((k.has(' ') || p.fire) && py >= 290) {
          vy = -340;
          playSfx('bounce');
          p.fire = false;
        }
        py += vy * dt;
        let floor = 360;
        platforms.forEach((o) => {
          ctx.fillStyle = '#acdbb2';
          ctx.fillRect(o.x, o.y, 64, 8);
          if (p.x > o.x && p.x < o.x + 64 && py < o.y + 15 && py + vy * dt >= o.y - 10 && vy > 0)
            floor = Math.min(floor, o.y - 10);
        });
        if (py > floor) {
          py = floor;
          vy = 0;
        }
        p.y = py;
        if (p.x > 560 && py < 330) {
          finish(true);
          return;
        }
      } else if (id === 84) {
        ctx.fillStyle = '#3b4558';
        for (let row = 0; row < 5; row++) {
          const gap = row % 2 === 0 ? 100 : 480;
          ctx.fillRect(0, 70 + row * 50, gap - 45, 12);
          ctx.fillRect(gap + 45, 70 + row * 50, 600 - gap, 12);
          if (Math.abs(p.y - (76 + row * 50)) < 16 && (p.x < gap - 35 || p.x > gap + 35)) {
            p.y += p.y < 76 + row * 50 ? -15 : 15;
          }
        }
        ctx.fillStyle = '#c8ef8c';
        ctx.fillRect(520, 20, 60, 25);
        if (p.x > 520 && p.y < 50) {
          finish(true);
          return;
        }
      } else if (rhythm) {
        setBeat(Math.floor(time * 2) % 4);
        if (Math.floor(time * 2) !== Math.floor((time - dt) * 2))
          playSfx('note', { pitch: Math.floor(time * 2) % 4 === 0 ? 1.3 : 0.8, intensity: 0.35 });
        ctx.fillStyle = '#b4ec93';
        const rx = 600 - (time % 2) * 300;
        ctx.fillRect(rx, 160, 20, 70);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(65, 150, 60, 90);
        if (p.fire && time - shot > 0.2) {
          shot = time;
          if (Math.abs(rx - 95) < 65) points++;
          else health--;
          setScore(points);
          setHp(health);
          p.fire = false;
        }
        if (points >= 8) {
          finish(true);
          return;
        }
      } else {
        if (Math.floor(time * 6) !== Math.floor((time - dt) * 6)) {
          bullets.push({
            x: ((Math.sin(time * 78) + 1) / 2) * 600,
            y: -10,
            vx: id === 80 ? Math.sin(time) * 80 : 0,
            vy: 110 + time * 4,
            hostile: true,
          });
        }
        if (id === 83 && p.fire && time - shot > 0.15) {
          shot = time;
          bullets.push({ x: p.x, y: p.y, vx: 0, vy: -430, hostile: false });
        }
        if (time > 18) {
          finish(true);
          return;
        }
        ctx.fillStyle = '#a1a8b8';
        ctx.font = '12px monospace';
        ctx.fillText('SURVIVE ' + Math.ceil(18 - time) + 's', 20, 25);
      }
      bullets = bullets.filter((b) => b.y > -40 && b.y < 430 && b.x > -40 && b.x < 640);
      for (const b of bullets) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        ctx.fillStyle = b.hostile ? '#ff715c' : '#b9f294';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.hostile ? 6 : 3, 0, 7);
        ctx.fill();
        if (b.hostile && Math.hypot(b.x - p.x, b.y - p.y) < 17 && time > invincible) {
          health--;
          invincible = time + 0.8;
          b.y = 500;
          setHp(health);
        }
        if (!b.hostile && boss && Math.hypot(b.x - ex, b.y - ey) < 43) {
          bossHp -= 2;
          b.y = -100;
          setEnemy(bossHp);
        }
        if (id === 83 && !b.hostile) {
          const target = bullets.find((t) => t.hostile && Math.hypot(t.x - b.x, t.y - b.y) < 20);
          if (target) {
            target.y = 500;
            b.y = -100;
            points++;
            setScore(points);
          }
        }
      }
      ctx.fillStyle = time < invincible ? '#fff' : '#b4f097';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 12);
      ctx.lineTo(p.x - 9, p.y + 10);
      ctx.lineTo(p.x + 9, p.y + 10);
      ctx.closePath();
      ctx.fill();
      if (health <= 0) {
        finish(false);
        return;
      }
      if (bossHp <= 0) {
        finish(true);
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
    };
  }, [id, attempt]);
  const win = () => {
    setResult('CONTAINMENT SUCCESSFUL');
    onWin();
  };
  return (
    <div className="modal-backdrop">
      <section className="challenge">
        <div className="windowbar">
          <span>INTERACTIVE ANOMALY / {boss ? 'BOSS ENCOUNTER' : 'CHALLENGE'}</span>
          <ReplayButton onReplay={replay} />
        </div>
        <h2>{events[id - 1].name}</h2>
        <p>
          {boss
            ? 'Move to dodge. Hold to fire. Three phases. Zero job security.'
            : puzzle
              ? 'The terminal hid a key. Unscramble the word: S A O H C'
              : rps
                ? 'First to three. The button is a terrible loser.'
                : id === 84
                  ? 'Follow the alternating openings. Reach the green exit.'
                  : id === 82
                    ? 'Move right and jump across the platforms.'
                    : rhythm
                      ? 'Press when the moving bar enters the target. Eight hits to win.'
                      : id === 77 || id === 26
                        ? 'Catch the red target eight times.'
                        : 'Stay alive for 18 seconds. The green triangle is you.'}
        </p>
        <div className="fight-stats">
          <span>INTEGRITY {'♥'.repeat(Math.max(0, hp))}</span>
          <span>
            {boss ? 'BOSS ' + Math.max(0, enemy) + '%' : 'SCORE ' + score}
            {rhythm ? ' / BEAT ' + beat : ''}
          </span>
        </div>
        {boss && (
          <div className="health">
            <i style={{ width: enemy + '%' }} />
          </div>
        )}
        {puzzle ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (answer.toLowerCase() === 'chaos') win();
              else
                setHp((h) => {
                  if (h <= 1) setResult('ACCESS DENIED');
                  return h - 1;
                });
            }}
          >
            <input
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter access key"
            />
            <button>BREACH FIREWALL</button>
          </form>
        ) : rps ? (
          <div className="rps">
            {['Rock', 'Paper', 'Scissors'].map((label, i) => (
              <button
                key={label}
                onClick={() => {
                  const other = Math.floor(Math.random() * 3);
                  setAnswer('Button chose ' + ['Rock', 'Paper', 'Scissors'][other]);
                  if ((i - other + 3) % 3 === 1) {
                    setScore((s) => {
                      if (s >= 2) win();
                      return s + 1;
                    });
                  } else if (other !== i)
                    setHp((h) => {
                      if (h <= 1) setResult('THE BUTTON WON');
                      return h - 1;
                    });
                }}
              >
                {['✊', '✋', '✌'][i]} {label}
              </button>
            ))}
            <p>{answer}</p>
          </div>
        ) : (
          <canvas
            ref={canvas}
            width={600}
            height={390}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              input.current.fire = true;
              const r = e.currentTarget.getBoundingClientRect();
              input.current.x = ((e.clientX - r.left) / r.width) * 600;
              input.current.y = ((e.clientY - r.top) / r.height) * 390;
            }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              input.current.x = ((e.clientX - r.left) / r.width) * 600;
              input.current.y = ((e.clientY - r.top) / r.height) * 390;
            }}
            onPointerUp={() => (input.current.fire = false)}
          />
        )}
        <small>ARROWS / WASD TO MOVE · SPACE TO FIRE OR JUMP · TOUCH & DRAG ON MOBILE</small>
        <div className="challenge-footer">
          <button onClick={onExit}>Back to chaos ?</button>
        </div>
        {result && (
          <div className="game-result">
            <span className="eyebrow">
              {result.includes('SUCCESS') ? 'YOU DID THE IMPOSSIBLE' : 'A MINOR SETBACK'}
            </span>
            <h2>{result}</h2>
            <CloseGameButton onClose={onExit} />
          </div>
        )}
      </section>
    </div>
  );
}
