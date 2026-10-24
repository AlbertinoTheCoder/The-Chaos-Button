import { useGameFeedback, mechanicAudio } from './gameAudio';
import { playSfx } from './sound';
import { ReplayButton, CloseGameButton } from './MinigameActions';
import { useEffect, useRef, useState } from 'react';
import { expansion } from './expansion';
import { PuzzleScene } from './PuzzleScene';
import { arcade } from './arcade';
import { world } from './worlds';
import { finish, initState, type Input } from './simulation';
const puzzles = ['wires', 'sort', 'simon', 'lights', 'type', 'safe', 'cookie', 'alchemy', 'garden'];
export function ExpansionScene({
  id,
  close,
  onWin,
}: {
  id: number;
  close: () => void;
  onWin: () => void;
}) {
  const event = expansion[id - 121];
  const canvas = useRef<HTMLCanvasElement>(null),
    input = useRef<Input>({
      x: 300,
      y: 130,
      down: false,
      clicked: false,
      released: false,
      startX: 0,
      startY: 0,
    });
  const [hud, setHud] = useState({
      score: 0,
      goal: 10,
      health: 3,
      status: '',
      ended: false,
      won: false,
    }),
    [attempt, setAttempt] = useState(0);
  const puzzle = puzzles.includes(event.mechanic);
  useGameFeedback(
    {
      score: hud.score,
      health: hud.health,
      result: hud.ended ? hud.status : undefined,
      won: hud.won,
      attempt,
    },
    mechanicAudio[event.mechanic],
  );
  useEffect(() => {
    setHud({ score: 0, goal: 10, health: 3, status: '', ended: false, won: false });
    if (puzzle) return;
    const el = canvas.current!,
      ctx = el.getContext('2d')!;
    const s = initState();
    let raf = 0,
      last = 0,
      notify = 0,
      credited = false;
    ctx.clearRect(0, 0, 600, 260);
    const seed = id * 9301 + attempt * 49297;
    let rng = seed;
    const random = () => {
      rng = (rng * 1664525 + 1013904223) >>> 0;
      return rng / 4294967296;
    };
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea,select,button')) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key))
        e.preventDefault();
      if (e.key === 'ArrowLeft') input.current.x = Math.max(0, input.current.x - 25);
      if (e.key === 'ArrowRight') input.current.x = Math.min(600, input.current.x + 25);
      if (e.key === 'ArrowUp') input.current.y = Math.max(0, input.current.y - 20);
      if (e.key === 'ArrowDown') input.current.y = Math.min(260, input.current.y + 20);
      if (e.key === 'Enter') {
        input.current.clicked = true;
        input.current.down = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        input.current.down = false;
        input.current.released = true;
      }
    };
    window.addEventListener('keydown', key);
    window.addEventListener('keyup', up);
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000 || 0.016, 0.035);
      last = now;
      if (!s.ended) {
        s.time += dt;
        if (!['paint', 'scratch'].includes(event.mechanic)) {
          ctx.fillStyle = '#101520';
          ctx.fillRect(0, 0, 600, 260);
          ctx.strokeStyle = '#a5bdd008';
          for (let x = 0; x < 600; x += 25) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 260);
            ctx.stroke();
          }
        }
        const wasReleased = input.current.released;
        if (wasReleased && event.mechanic === 'launch') playSfx('launch');
        const c = { ctx, s, p: input.current, v: event.variant, color: event.color, dt, random };
        if (!arcade(event.mechanic, c)) world(event.mechanic, c);
        if (s.health <= 0) finish(s, false);
        if (s.won && !credited) {
          credited = true;
          onWin();
        }
        input.current.clicked = false;
        input.current.released = false;
        if (now - notify > 90 || s.ended) {
          notify = now;
          setHud({
            score: s.score,
            goal: s.goal,
            health: s.health,
            status: s.status,
            ended: s.ended,
            won: s.won,
          });
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', key);
      window.removeEventListener('keyup', up);
    };
  }, [id, attempt]);
  const replay = () => {
    playSfx('restart');
    input.current.down = false;
    input.current.clicked = false;
    input.current.released = false;
    setAttempt((n) => n + 1);
  };
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    input.current.x = ((e.clientX - r.left) / r.width) * 600;
    input.current.y = ((e.clientY - r.top) / r.height) * 260;
  };
  return (
    <section
      className={'expansion-scene expansion-' + event.mechanic}
      style={{ '--event-color': event.color } as React.CSSProperties}
    >
      <div className="windowbar">
        <span>
          UNAUTHORIZED EXPERIMENT #{id} / {event.category.toUpperCase()}
        </span>
        <ReplayButton onReplay={replay} />
      </div>
      <div className="expansion-title">
        <span>
          {event.category} / THREAT CLASS {event.variant + 1}
        </span>
        <h2>{event.name}</h2>
        <p>{event.instruction}</p>
      </div>
      {puzzle ? (
        <PuzzleScene
          key={id + '-' + attempt}
          mode={event.mechanic}
          v={event.variant}
          onWin={onWin}
          onClose={close}
        />
      ) : (
        <>
          <div className="puzzle-stats">
            <span>
              {hud.score} / {hud.goal}
            </span>
            <span>INTEGRITY {'♥'.repeat(Math.max(0, hud.health))}</span>
          </div>
          <div
            className="expansion-canvas"
            style={
              event.mechanic === 'scratch'
                ? { background: 'radial-gradient(ellipse,#604573,#241e36)' }
                : undefined
            }
          >
            {event.mechanic === 'scratch' && (
              <div className="scratch-prize">
                <strong>YOU WON!</strong>
                <span>
                  {
                    [
                      'ANOTHER BUTTON',
                      'UNLIMITED REGRET',
                      'ONE FREE EXISTENTIAL CRISIS',
                      'A VERY SMALL DUCK',
                      'THE RIGHT TO KEEP CLICKING',
                    ][event.variant]
                  }
                </span>
              </div>
            )}
            <canvas
              ref={canvas}
              width={600}
              height={260}
              tabIndex={0}
              aria-label={event.name + ' interactive play area'}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                point(e);
                input.current.down = true;
                input.current.clicked = true;
                input.current.startX = input.current.x;
                input.current.startY = input.current.y;
              }}
              onPointerMove={point}
              onPointerUp={(e) => {
                point(e);
                input.current.down = false;
                input.current.released = true;
              }}
              onPointerCancel={() => (input.current.down = false)}
            />
            {hud.ended && (
              <div className="expansion-result">
                <span>{hud.won ? 'A SMALL VICTORY FOR BAD DECISIONS' : 'REALITY: 1 / YOU: 0'}</span>
                <h3>{hud.status}</h3>
                <CloseGameButton onClose={close} />
              </div>
            )}
          </div>
          <p className="puzzle-message" role="status">
            {hud.status || 'Your input has consequences. Probably.'}
          </p>
        </>
      )}
      <div className="expansion-footer">
        <span>POINTER / TOUCH · ARROWS + ENTER</span>
        <button onClick={close}>Back to bad decisions →</button>
      </div>
    </section>
  );
}
