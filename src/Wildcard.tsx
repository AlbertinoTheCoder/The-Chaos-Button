import { useGameFeedback } from './gameAudio';
import { useEffect, useRef, useState } from 'react';
import { events } from './events';
export function Wildcard({
  id,
  close,
  secret,
}: {
  id: number;
  close: () => void;
  secret: (s: string) => void;
}) {
  const [score, setScore] = useState(0),
    [items, setItems] = useState<number[]>([]),
    [mode, setMode] = useState(0),
    [chosen, setChosen] = useState<number[]>([]),
    [matched, setMatched] = useState<number[]>([]),
    [message, setMessage] = useState(''),
    [time, setTime] = useState(0);
  const pending = useRef<ReturnType<typeof setTimeout>[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const held = useRef(false);
  useGameFeedback(
    { score, health: 1 },
    {
      action: 'click',
      score:
        id === 107
          ? 'pop'
          : id === 119
            ? 'water'
            : id === 113
              ? 'connect'
              : id === 116
                ? 'chop'
                : 'note',
    },
  );
  useEffect(() => {
    const t = setInterval(() => {
      setTime((n) => n + 0.1);
      if (held.current) setScore((n) => Math.min(100, n + 4));
    }, 100);
    return () => {
      clearInterval(t);
      pending.current.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (id !== 115) return;
    const el = canvas.current!,
      ctx = el.getContext('2d')!;
    ctx.fillStyle = '#b9d9e3';
    ctx.fillRect(0, 0, 600, 180);
    ctx.fillStyle = '#405b6a';
    ctx.font = '24px monospace';
    ctx.fillText('CAUTION: EXTREMELY WET PIXELS', 50, 100);
  }, [id]);
  const pop = (n: number) => {
    if (items.includes(n)) return;
    setItems((s) => [...s, n]);
    setScore((s) => s + 1);
  };
  const flip = (n: number) => {
    if (chosen.length === 2 || matched.includes(n) || chosen.includes(n)) return;
    const next = [...chosen, n];
    setChosen(next);
    if (next.length === 2) {
      if (next[0] % 6 === next[1] % 6) {
        setMatched((s) => [...s, ...next]);
        setScore((s) => s + 1);
      }
      pending.current.push(setTimeout(() => setChosen([]), 650));
    }
  };
  const symbols = ['◉', '✦', '♥', '▲', '■', '☂'];
  const content =
    id === 101 ? (
      <div className="confetti-play">
        {Array.from({ length: 35 }, (_, n) => (
          <button
            key={n}
            className={items.includes(n) ? 'popped' : ''}
            style={{
              left: ((n * 37) % 95) + '%',
              top: ((n * 23) % 75) + '%',
              color: ['#ef7b67', '#c6cb8c', '#9caedc'][n % 3],
              animationDelay: n * 0.1 + 's',
            }}
            onClick={() => pop(n)}
          >
            ✦
          </button>
        ))}
        <p>Catch the confetti before accounting sees it. {score}/35</p>
      </div>
    ) : id === 102 ? (
      <div className="duck-pond">
        {Array.from({ length: 7 }, (_, n) => (
          <button
            key={n}
            className={items.includes(n) ? 'popped' : ''}
            style={{ animationDelay: -n + 's' }}
            onClick={() => {
              pop(n);
              setMessage(
                [
                  'Have you tried turning it off and duck again?',
                  'It works on my pond.',
                  'That’s a feature.',
                ][n % 3],
              );
            }}
          >
            🦆
          </button>
        ))}
        <p>{message || 'Click a duck. Explain your problems. Receive dubious advice.'}</p>
      </div>
    ) : id === 103 ? (
      <div className={'disco-floor disco-' + mode}>
        <div className="disco-ball">◈</div>
        <div className="dancers">♟ ♟ ♟ ♟ ♟</div>
        <button
          onClick={() => {
            setMode((n) => (n + 1) % 3);
            setScore((n) => n + 1);
          }}
        >
          CHANGE THE BEAT ♪ {['80s PANIC', 'ACID BUTTON', 'SAD TECHNO'][mode]}
        </button>
        <p>{score} irresponsible dance moves</p>
      </div>
    ) : id === 104 ? (
      <div className="snail-race">
        {[0, 1, 2].map((n) => (
          <button
            key={n}
            onClick={() => {
              setMode(n);
              setScore((s) => s + 1);
            }}
          >
            <span style={{ left: Math.min(85, time * (n === mode ? 8 : 3) + score * 2) + '%' }}>
              🐌
            </span>
            <small>{['EXPRESS DELIVERY', 'EVENTUALLY', 'TURBO (allegedly)'][n]}</small>
          </button>
        ))}
        <p>Click a snail to cheer. A race with no sense of urgency.</p>
      </div>
    ) : id === 105 ? (
      <div className="toast-pet">
        <div className="toast-face" style={{ scale: 1 + score * 0.035 }}>
          🍞
        </div>
        <p>
          {score > 4
            ? 'IT HAS DEVELOPED A TASTE FOR POWER.'
            : score > 1
              ? 'It’s getting suspiciously large.'
              : 'The sign specifically says DO NOT FEED.'}
        </p>
        <button onClick={() => setScore((s) => s + 1)}>Feed one byte of RAM</button>
        <span>{score} BYTES CONSUMED</span>
      </div>
    ) : id === 106 ? (
      <div
        className="rain-catch"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setMode(((e.clientX - r.left) / r.width) * 100);
        }}
      >
        {Array.from({ length: 12 }, (_, n) => (
          <button
            style={{ left: ((n * 37) % 95) + '%', animationDelay: -n * 0.3 + 's' }}
            key={n}
            onClick={() => pop(n)}
            className={items.includes(n) ? 'popped' : ''}
          >
            ☂
          </button>
        ))}
        <span style={{ left: mode + '%' }}>🪣</span>
        <p>Rain, but make it umbrellas. Catch them. {score}/12</p>
      </div>
    ) : id === 107 ? (
      <div className="bubble-wrap">
        {Array.from({ length: 32 }, (_, n) => (
          <button key={n} onClick={() => pop(n)} className={items.includes(n) ? 'popped' : ''}>
            ◌
          </button>
        ))}
        <p>
          {score === 32
            ? 'Perfect. All your problems are solved. Probably.'
            : score + ' / 32 bubbles sacrificed for inner peace.'}
        </p>
      </div>
    ) : id === 108 ? (
      <div className="lava-tiles">
        {Array.from({ length: 12 }, (_, n) => (
          <button
            key={n}
            className={(n + Math.floor(time)) % 4 === 0 ? 'hot' : ''}
            onClick={() => {
              if ((n + Math.floor(time)) % 4 === 0) {
                setScore(0);
                setMessage('TOASTED. Try the cool tiles.');
              } else {
                setScore((s) => s + 1);
                setMessage(
                  score >= 7
                    ? 'LAVA CERTIFIED. Your shoes survived.'
                    : 'Keep your feet off the red tiles.',
                );
              }
            }}
          >
            {(n + Math.floor(time)) % 4 === 0 ? '🔥' : '▧'}
          </button>
        ))}
        <p>
          {message || 'Step on eight safe tiles. The floor keeps changing.'} {score}/8
        </p>
      </div>
    ) : id === 109 ? (
      <div className="aquarium" onClick={() => setScore((s) => s + 1)}>
        {Array.from({ length: 8 }, (_, n) => (
          <span
            key={n}
            style={{
              top: ((n * 19) % 75) + '%',
              animationDelay: -n + 's',
              fontSize: 20 + score * 2,
            }}
          >
            🐟
          </span>
        ))}
        <p>Tap the water to feed your cosmic fish. {score} meals. Infinite responsibility.</p>
      </div>
    ) : id === 110 ? (
      <div className={'weather weather-' + mode}>
        <span>{['☀', '☂', '❄', 'ϟ'][mode]}</span>
        <h3>
          {
            [
              '28° · SUN WITH A CHANCE OF REGRET',
              '14° · INDOOR RAIN ADVISORY',
              '−2° · BUTTON FREEZE WARNING',
              '404° · WEATHER NOT FOUND',
            ][mode]
          }
        </h3>
        <button onClick={() => setMode((n) => (n + 1) % 4)}>Change the forecast</button>
      </div>
    ) : id === 113 ? (
      <div className="memory-cards">
        {Array.from({ length: 12 }, (_, n) => (
          <button key={n} className={matched.includes(n) ? 'matched' : ''} onClick={() => flip(n)}>
            {chosen.includes(n) || matched.includes(n) ? symbols[n % 6] : '?'}
          </button>
        ))}
        <p>Match your actual memories. {score}/6 pairs recovered.</p>
      </div>
    ) : id === 114 ? (
      <div className="air-traffic">
        {Array.from({ length: 6 }, (_, n) => (
          <button
            key={n}
            className={items.includes(n) ? 'launched' : ''}
            style={{ animationDelay: n * 0.1 + 's' }}
            onClick={() => pop(n)}
          >
            ➤
          </button>
        ))}
        <p>{score} paper airplanes launched. None cleared for takeoff.</p>
      </div>
    ) : id === 115 ? (
      <div className="wet-pixels">
        <canvas
          ref={canvas}
          width={600}
          height={180}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === 'touch') {
              const r = e.currentTarget.getBoundingClientRect(),
                ctx = e.currentTarget.getContext('2d')!;
              ctx.clearRect(
                ((e.clientX - r.left) / r.width) * 600 - 25,
                ((e.clientY - r.top) / r.height) * 180 - 25,
                50,
                50,
              );
              setScore((n) => n + 1);
            }
          }}
        />
        <p>
          Drag to wipe the condensation.{' '}
          {score > 40
            ? 'Much better. You can see your mistakes clearly.'
            : 'A surprisingly literal window cleaning simulator.'}
        </p>
      </div>
    ) : id === 116 ? (
      <div className="pizza">
        <div>
          {Array.from({ length: 8 }, (_, n) => (
            <button
              style={{ rotate: n * 45 + 'deg' }}
              key={n}
              className={items.includes(n) ? 'eaten' : ''}
              onClick={() => pop(n)}
            >
              🍕
            </button>
          ))}
        </div>
        <p>
          {score === 8
            ? 'You ate the entire internet’s pizza.'
            : 'Eat a slice. It’s on the house. The house is on fire.'}{' '}
          {score}/8
        </p>
      </div>
    ) : id === 117 ? (
      <div
        className="invisible-message"
        onPointerMove={() => {
          setScore((s) => s + 1);
          if (score === 15) secret('ink');
        }}
      >
        <span style={{ opacity: Math.min(1, 0.02 + score / 20) }}>
          THE BUTTON HAS A FAMILY.
          <br />
          THE PASSWORD IS CHAOS.
          <br />
          THE STARS ARE LISTENING.
        </span>
        <p>Rub the ink to reveal what should have remained unsaid.</p>
      </div>
    ) : id === 118 ? (
      <div className="audience">
        <div>
          {Array.from({ length: 8 }, (_, n) => (
            <span key={n} style={{ animationDelay: n * 0.15 + 's' }}>
              {score > 4 ? '👏' : '👎'}
            </span>
          ))}
        </div>
        <p>
          {score > 4
            ? 'STANDING OVATION FOR THE BARE MINIMUM.'
            : 'The audience demands an apology.'}
        </p>
        <button onClick={() => setScore((s) => s + 1)}>
          Apologize with increasing sincerity ({score})
        </button>
      </div>
    ) : id === 119 ? (
      <div className="tea-break">
        <span className={score > 80 ? 'steaming' : ''}>☕</span>
        <progress max={100} value={score} />
        <button
          onPointerDown={() => (held.current = true)}
          onPointerUp={() => (held.current = false)}
          onPointerLeave={() => (held.current = false)}
        >
          Hold to brew a sensible decision
        </button>
        <p>
          {score >= 100
            ? 'Perfectly brewed. Enjoy three seconds of peace.'
            : 'Good things take time. Unlike this website.'}
        </p>
      </div>
    ) : id === 120 ? (
      <div className="off-switch">
        <button
          onClick={() => {
            setMode((n) => n + 1);
            if (mode >= 1) {
              secret('off-switch');
              close();
            }
          }}
        >
          ⏻
        </button>
        <p>
          {mode
            ? 'Nice try. Press again to turn reality back on.'
            : 'You found it. The least popular button on this website.'}
        </p>
      </div>
    ) : null;
  return (
    <section className={'wildcard surprise-' + id}>
      <div className="windowbar">
        <span>UNREQUESTED BONUS / #{id}</span>
        <button aria-label="Close surprise" onClick={close}>
          ✕
        </button>
      </div>
      <h3>{events[id - 1].name}</h3>
      {content}
    </section>
  );
}
