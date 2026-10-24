import { playSfx } from './sound';
import { PopupScene } from './PopupScene';
import { ExpansionScene } from './ExpansionScene';
import { useEffect, useRef, useState } from 'react';
import { events } from './events';
import { Wildcard } from './Wildcard';
export function Physics({ ids }: { ids: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ids.length) return;
    const c = ref.current!,
      ctx = c.getContext('2d')!;
    let raf = 0,
      last = 0,
      t = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = ids.includes(60) ? (innerWidth < 600 ? 65 : 140) : 45;
    const w = (c.width = innerWidth),
      h = (c.height = innerHeight);
    const bodies = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 180,
      vy: (Math.random() - 0.5) * 180,
      r: 3 + Math.random() * 12,
      color: ['#f14e45', '#e4b76e', '#b9d8c5', '#9a8fd2'][i % 4],
    }));
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000 || 0.016, 0.04) * (ids.includes(56) ? 0.25 : 1);
      last = now;
      t += dt;
      ctx.clearRect(0, 0, w, h);
      for (const b of bodies) {
        if (ids.includes(46)) b.vy += 120 * dt;
        if (ids.includes(47)) b.vy -= 120 * dt;
        if (ids.includes(49) || ids.includes(52) || ids.includes(58)) {
          const dx = w / 2 - b.x,
            dy = h / 2 - b.y;
          b.vx += (dx - (ids.includes(49) ? dy : 0)) * dt * 0.7;
          b.vy += (dy + (ids.includes(49) ? dx : 0)) * dt * 0.7;
        }
        if (ids.includes(54) && t < 0.3) {
          b.vx += (b.x - w / 2) * dt * 15;
          b.vy += (b.y - h / 2) * dt * 15;
        }
        if (ids.includes(55) || ids.includes(15)) {
          b.vx = 80;
          b.vy = 220;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < b.r || b.x > w - b.r) {
          playSfx('bounce', { pitch: 0.5 + b.r / 15, intensity: 0.12 });
          b.vx *= -0.9;
          b.x = Math.max(b.r, Math.min(w - b.r, b.x));
        }
        if (b.y > h - b.r || b.y < b.r) {
          playSfx('bounce', { pitch: 0.5 + b.r / 15, intensity: 0.15 });
          b.vy *= -0.85;
          b.y = Math.max(b.r, Math.min(h - b.r, b.y));
        }
        ctx.fillStyle = ids.includes(51) ? '#ff7a28' : b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 7);
        ctx.fill();
        if (ids.includes(48)) {
          for (const other of bodies) {
            if (other !== b && Math.hypot(b.x - other.x, b.y - other.y) < b.r + other.r) {
              [b.vx, other.vx] = [other.vx, b.vx];
              [b.vy, other.vy] = [other.vy, b.vy];
            }
          }
        }
      }
      if (ids.includes(50)) {
        ctx.fillStyle = '#50a8ed55';
        ctx.fillRect(0, h - Math.min(h * 0.65, t * 35), w, h);
      }
      if (ids.includes(52)) {
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#b58aff';
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 55, 0, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (ids.includes(53)) {
        ctx.strokeStyle = '#8c9199';
        ctx.lineWidth = 4;
        const x = w / 2 + Math.sin(t * 2) * 240;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(x, 300);
        ctx.stroke();
        ctx.fillStyle = '#68717b';
        ctx.beginPath();
        ctx.arc(x, 300, 46, 0, 7);
        ctx.fill();
      }
      if (ids.includes(59)) {
        ctx.fillStyle = '#72685f';
        ctx.beginPath();
        ctx.arc(((t * 180) % (w + 150)) - 75, h - 90, 70, 0, 7);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [ids.join(',')]);
  return <canvas className="physics" ref={ref} />;
}
export function EventScene({
  id,
  close,
  secret,
  press,
  onWin,
}: {
  id: number;
  close: () => void;
  secret: (s: string) => void;
  press: () => void;
  onWin: () => void;
}) {
  const [step, setStep] = useState(0),
    [value, setValue] = useState('');
  const e = events[id - 1];
  if (id >= 271) return <PopupScene id={id} close={close} />;
  if (id > 120) return <ExpansionScene id={id} close={close} onWin={onWin} />;
  if ((id >= 31 && id <= 45) || id === 99)
    return (
      <section
        className={'fake-window system-' + id}
        style={{ left: 8 + (id % 4) * 17 + '%', top: 18 + (id % 3) * 12 + '%' }}
      >
        <div className="windowbar">
          <span>nonsenseOS / {e.name}</span>
          <button onClick={close} aria-label={'Close ' + e.name}>
            ✕
          </button>
        </div>
        {id === 32 ? (
          <div className="bluescreen">
            <h1>:(</h1>Your button ran into a personality problem.<p>ERROR: TOO_MUCH_YOU</p>
            <button onClick={close}>Reboot fictional system</button>
          </div>
        ) : id === 34 || id === 44 ? (
          <div className="terminal">
            <p>$ sudo locate common_sense</p>
            <p>0 results found.</p>
            <p># hidden command: open sesame</p>
            <p>
              {step
                ? 'Secret room mounted. Your permissions are questionable.'
                : 'waiting for a command...'}
            </p>
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                if (value.toLowerCase().includes('sesame')) {
                  secret('terminal');
                  setStep(1);
                } else setStep((s) => s + 1);
                setValue('');
              }}
            >
              <span>guest@chaos:~$ </span>
              <input
                aria-label="Terminal command"
                value={value}
                onChange={(ev) => setValue(ev.target.value)}
              />
            </form>
          </div>
        ) : id === 35 || id === 38 || id === 41 || id === 45 ? (
          <div className="os-content">
            <div className="loading-ring" />
            <h3>
              {id === 35
                ? 'Please do not turn off your imagination.'
                : id === 38
                  ? 'Installing More Chaos™'
                  : id === 41
                    ? 'Welcome to nonsenseOS'
                    : 'We have learned absolutely nothing.'}
            </h3>
            <progress max={100} value={id === 35 ? 99 : Math.min(100, step * 25 + 25)} />
            <p>
              {id === 35
                ? '99% — estimated remaining: yes'
                : step >= 3
                  ? 'Installation complete. Sorry.'
                  : 'Ready when you are.'}
            </p>
            <button onClick={() => (step >= 3 ? close() : setStep((s) => s + 1))}>
              {step >= 3 ? 'Launch' : 'Continue anyway'}
            </button>
          </div>
        ) : id === 36 || id === 40 ? (
          <div className="file-grid">
            {[
              '📁 Taxes (ha)',
              '📁 Definitely empty',
              '📄 secret_room.exe',
              '🗑 Common sense',
              '📦 button.zip',
              '📄 readme.please',
            ].map((s, i) => (
              <button
                key={s}
                onClick={() => {
                  setStep(i + 1);
                  if (i === 2) secret('room');
                }}
              >
                {s}
              </button>
            ))}
            <p>
              {step === 3
                ? 'SECRET ROOM OPENED. You live here now.'
                : step
                  ? 'File contents: bad decisions.'
                  : 'Double trouble. Single click.'}
            </p>
          </div>
        ) : id === 39 ? (
          <div className="os-content">
            {['overthinking.exe', 'button_anxiety.exe', 'more_chaos.exe', 'common_sense.exe'].map(
              (s, i) => (
                <button key={s} onClick={(ev) => ev.currentTarget.remove()}>
                  {s} <span>{i === 3 ? '0' : '9' + i}% CPU ×</span>
                </button>
              ),
            )}
          </div>
        ) : id === 42 || id === 99 ? (
          <div className="mini-browser">
            <div>← → ⟳ chaos://very.safe</div>
            <h3>A smaller, worse internet.</h3>
            <button className="mini-red" onClick={press}>
              DO NOT PRESS
            </button>
            {id === 99 &&
              Array.from({ length: 3 }, (_, i) => (
                <button key={i} onClick={(ev) => ev.currentTarget.remove()}>
                  Popup {i + 1}: you won a popup ×
                </button>
              ))}
          </div>
        ) : id === 37 ? (
          <div className="os-content">
            <h1>🗑</h1>
            <p>Feed the bin your questionable decisions.</p>
            {['A sensible plan', 'Your free time', 'One more click'].map((s) => (
              <button
                key={s}
                onClick={(ev) => {
                  ev.currentTarget.remove();
                  setStep((v) => v + 1);
                }}
              >
                {s} → 🗑
              </button>
            ))}
            <p>{step} regrets recycled</p>
          </div>
        ) : (
          <div className="os-content">
            <span className="error-symbol">!</span>
            <h3>
              {id === 33
                ? 'THREAT: chronic button pressing'
                : id === 43
                  ? 'This window thinks the other window is wrong.'
                  : 'The operation failed successfully.'}
            </h3>
            <p>
              {step
                ? 'You closed an error. It made another error.'
                : 'This is a fictional error. Your real computer is fine.'}
            </p>
            <button onClick={() => setStep((v) => v + 1)}>
              {' '}
              {id === 31
                ? 'Duplicate error (' + step + ')'
                : id === 43
                  ? 'Argue back (' + step + ')'
                  : 'Quarantine my decisions'}
            </button>
            {Array.from({ length: Math.min(step, 5) }, (_, i) => (
              <div className="error-child" key={i}>
                ERROR {i + 1}: stop fixing things <button onClick={close}>×</button>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  if (id >= 61 && id <= 75)
    return (
      <div className={'civilization living-' + id}>
        <div className="village">
          {Array.from({ length: id === 63 ? 12 : 7 }, (_, i) => (
            <button
              title="Interact with resident"
              key={i}
              onClick={(ev) => {
                ev.currentTarget.style.transform = 'translateY(-45px) rotate(15deg)';
                setStep((s) => s + 1);
              }}
              style={{ animationDelay: i * 0.25 + 's' }}
            >
              {id === 63
                ? '▥'
                : id === 68
                  ? '🚜'
                  : id === 62
                    ? '⚒'
                    : id === 71
                      ? '⚔'
                      : id === 74
                        ? '◉'
                        : id === 65
                          ? '⚑'
                          : '♟'}
            </button>
          ))}
        </div>
        <div className="resident-bubble">
          {id === 61
            ? 'Just passing through. Terrible neighborhood.'
            : id === 62
              ? 'We charge by the disaster.'
              : id === 63
                ? 'BUTTONOPOLIS · population ' + (12 + step)
                : id === 64
                  ? 'ALL HAIL THE BIG RED ONE'
                  : id === 65
                    ? 'FAIR WAGES. FEWER CLICKS.'
                    : id === 66
                      ? 'I would like to speak to the player.'
                      : id === 67
                        ? 'Nice button. Would be a shame if someone borrowed it.'
                        : id === 68
                          ? 'Rebuilding your mistakes since five seconds ago.'
                          : id === 69
                            ? 'BREAKING: local human cannot follow one instruction.'
                            : id === 70
                              ? 'We declare independence from your mouse.'
                              : id === 71
                                ? 'FOR THE BUTTON!'
                                : id === 72
                                  ? 'The stars remember ↑ ↑ ↓ ↓.'
                                  : id === 73
                                    ? '“You look clickable.” “Take that back.”'
                                    : id === 74
                                      ? 'Click me. I eat bad decisions. ' + step
                                      : 'A door where there wasn’t one.'}
        </div>
        {id === 75 && (
          <button
            className="portal"
            onClick={() => {
              secret('room');
              setStep((s) => s + 1);
            }}
          >
            {step ? 'WELCOME TO THE OTHER SIDE' : 'ENTER PORTAL'}
          </button>
        )}
      </div>
    );
  if (id === 7)
    return (
      <svg className="cracks" viewBox="0 0 1000 700">
        <path d="M490 310L190 30M490 310L830 60M490 310L980 550M490 310L120 690M490 310L530 700M280 115L300 260L490 310L700 220L830 60M490 310L660 420L690 630" />
      </svg>
    );
  if (id === 8)
    return (
      <div className="burn-in">
        DO NOT PRESS
        <br />
        DO NOT PRESS
      </div>
    );
  if (id === 9)
    return (
      <div
        className="magnifier"
        onPointerMove={(ev) => (ev.currentTarget.style.left = ev.clientX + 'px')}
      >
        2×<small>EVERY MISTAKE, ENLARGED</small>
      </div>
    );
  if (id === 15)
    return (
      <div className="meteor-impact">
        ☄<span>THAT WAS EXPENSIVE.</span>
      </div>
    );
  if (id === 86)
    return (
      <div className="security-feed">
        <span>● REC — CAM 04</span>
        <span>SUBJECT STILL PRESSING · LIVE</span>
      </div>
    );
  if (id === 87) return <div className="rewind">◀◀ REWINDING YOUR DECISIONS</div>;
  if (id === 88)
    return (
      <div className="nested-site">
        <small>CHAOS BUTTON, BUT SMALLER</small>
        <button className="mini-red" onClick={press}>
          DO NOT PRESS
        </button>
        <span>A deeply unnecessary sequel.</span>
      </div>
    );
  if (id === 89 || id === 98)
    return (
      <div className="dimension">
        <h2>{id === 98 ? 'BUTTON UNIVERSE' : 'DIMENSION B'}</h2>
        <p>Explore the stars. Some of them remember you.</p>
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i}
            style={{ left: ((i * 37) % 85) + 5 + '%', top: ((i * 23) % 65) + 20 + '%' }}
            onClick={(ev) => {
              ev.currentTarget.textContent = '✦';
              secret('star');
              setStep((s) => s + 1);
            }}
          >
            {['◉', '✧', '◌', '✷'][i % 4]}
          </button>
        ))}
        <span>{step} WORLDS VISITED</span>
        <button className="dimension-exit" onClick={close}>
          Return to this reality →
        </button>
      </div>
    );
  if (id === 90)
    return (
      <div className="orbit-system">
        <span>🪐</span>
        {Array.from({ length: 5 }, (_, i) => (
          <i
            key={i}
            style={{ animationDelay: -i * 2 + 's', width: 170 + i * 35, height: 170 + i * 35 }}
          >
            ●
          </i>
        ))}
      </div>
    );
  if (id === 91 || id === 92)
    return (
      <div className="retro-screen">
        <pre>
          {id === 92
            ? '    __________________\n   /                  \\\n  |   D O  N O T       |\n  |     P R E S S      |\n   \\__________________/\n       [ CHAOS ]'
            : 'NONSENSE BASIC V1.0\n64K RAM SYSTEM\nREADY.\n10 PRINT "WHY"\n20 GOTO 10'}
        </pre>
        <button onClick={press}>[ EXECUTE BAD IDEA ]</button>
      </div>
    );
  if (id === 93)
    return (
      <div className="dating">
        <span>♥ ♥ ♥</span>
        <h2>A date with disaster</h2>
        <p>
          {step
            ? 'The button blushes. Somehow it gets redder.'
            : '“So… do you press every button you meet?”'}
        </p>
        <button onClick={() => setStep((s) => s + 1)}>Compliment its circumference</button>
        <button onClick={close}>It’s complicated</button>
      </div>
    );
  if (id === 94 || id === 100)
    return (
      <div className={'credits ending-' + id}>
        <div>
          <span>{id === 100 ? 'THE FINAL PRESS' : 'THANK YOU FOR NOTHING'}</span>
          <h1>{id === 100 ? 'You had one job.' : 'A game by your poor impulse control.'}</h1>
          <p>
            {id === 100
              ? 'Reality has submitted its resignation.'
              : 'No buttons were emotionally supported during production.'}
          </p>
          <p>
            PLAYER — you
            <br />
            BAD IDEAS — also you
            <br />
            COMMON SENSE — unavailable
          </p>
          <button onClick={close}>One more press? →</button>
        </div>
      </div>
    );
  if (id === 95)
    return (
      <div className="sentience">
        <div className="eyes">◉ ◉</div>
        <h2>I REMEMBER ALL OF IT.</h2>
        <button onClick={() => setStep((v) => v + 1)}>
          {step ? 'Please stop poking my consciousness.' : 'Ask if it pays rent'}
        </button>
      </div>
    );
  if (id === 97)
    return (
      <div className="purge">
        <span>REALITY CLEANUP IN PROGRESS</span>
        <div className="loading-ring" />
      </div>
    );
  if (id >= 101) return <Wildcard id={id} close={close} secret={secret} />;
  return null;
}
