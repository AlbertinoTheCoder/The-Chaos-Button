import { useGameFeedback, mechanicAudio } from './gameAudio';
import { playSfx } from './sound';
import { CloseGameButton } from './MinigameActions';
import { useEffect, useRef, useState } from 'react';
import type { Mechanic } from './expansion';
const colors = ['#f58b66', '#7ecbb6', '#7eade4', '#e7c577'];
const symbols = ['●', '▲', '■', '◆'];
function initialLights(v: number) {
  const size = 3 + (v % 3),
    a = Array(size * size).fill(false) as boolean[],
    solution: number[] = [];
  for (let i = 0; i < 5 + v; i++) {
    const n = (i * 7 + v * 3) % (size * size);
    solution.push(n);
    for (const j of [
      n,
      n - size,
      n + size,
      ...(n % size ? [n - 1] : []),
      ...(n % size < size - 1 ? [n + 1] : []),
    ])
      if (j >= 0 && j < a.length) a[j] = !a[j];
  }
  return { a, solution, size };
}
export function PuzzleScene({
  mode,
  v,
  onWin,
  onClose,
}: {
  mode: Mechanic;
  v: number;
  onWin: () => void;
  onClose: () => void;
}) {
  const [score, setScore] = useState(0),
    [hp, setHp] = useState(3),
    [selected, setSelected] = useState(-1),
    [items, setItems] = useState<number[]>([]),
    [message, setMessage] = useState(''),
    [value, setValue] = useState(''),
    [dial, setDial] = useState(0),
    [round, setRound] = useState(0),
    [highlight, setHighlight] = useState(-1),
    [watching, setWatching] = useState(false),
    [tick, setTick] = useState(0),
    [lights, setLights] = useState(() => initialLights(v)),
    [plots, setPlots] = useState(() => Array(12).fill(0) as number[]),
    [result, setResult] = useState('');
  const sequence = useRef<number[]>([]),
    timeouts = useRef<ReturnType<typeof setTimeout>[]>([]),
    won = useRef(false);
  useGameFeedback(
    {
      score: mode === 'garden' ? plots.filter((stage) => stage === 3).length : score,
      health: hp,
      result,
      won: won.current,
    },
    mechanicAudio[mode],
  );
  const win = () => {
    if (won.current) return;
    won.current = true;
    setResult('ANOMALY MASTERED. SOMEHOW.');
    onWin();
  };
  const mistake = (text: string) => {
    setMessage(text);
    setHp((n) => {
      if (n <= 1) setResult('A VERY EDUCATIONAL FAILURE.');
      return n - 1;
    });
  };
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 700);
    return () => {
      clearInterval(t);
      timeouts.current.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (mode === 'garden' && tick > 0 && tick % (5 - (v % 3)) === 0) {
      setPlots((s) => {
        const a = [...s],
          n = (tick * 7 + v) % a.length;
        if (a[n] !== 3) a[n] = 4;
        if (a.filter((n) => n === 4).length >= 7) setResult('THE WEEDS HAVE FORMED A GOVERNMENT.');
        return a;
      });
    }
  }, [tick]);
  useEffect(() => {
    if (mode !== 'simon') return;
    setItems([]);
    setWatching(true);
    const seq = Array.from({ length: round + 2 }, (_, i) => (i * i + round * 3 + v + i) % 4);
    sequence.current = seq;
    seq.forEach((n, i) => {
      timeouts.current.push(
        setTimeout(
          () => {
            setHighlight(n);
            playSfx('note', { pitch: [0.6, 0.75, 0.9, 1.2][n] });
          },
          500 + i * 650,
        ),
      );
      timeouts.current.push(setTimeout(() => setHighlight(-1), 950 + i * 650));
    });
    timeouts.current.push(setTimeout(() => setWatching(false), 500 + seq.length * 650));
  }, [round, mode]);
  const toggle = (n: number) => {
    setLights((current) => {
      const a = [...current.a],
        size = current.size;
      for (const j of [
        n,
        n - size,
        n + size,
        ...(n % size ? [n - 1] : []),
        ...(n % size < size - 1 ? [n + 1] : []),
      ])
        if (j >= 0 && j < a.length) a[j] = !a[j];
      const solution = current.solution.includes(n)
        ? current.solution.filter((i) => i !== n)
        : [...current.solution, n];
      if (a.every((x) => !x)) timeouts.current.push(setTimeout(win, 50));
      return { ...current, a, solution };
    });
    setScore((s) => s + 1);
  };
  const words = [
    ['CHAOS', 'BUTTON', 'WHY', 'REGRET', 'AGAIN'],
    ['GHOST', 'CURSED', 'BOO', 'PANIC', 'HELP'],
    ['LAWYER', 'OBJECTION', 'GUILTY', 'ORDER', 'FINE'],
    ['MISTAKE', 'PLEASE', 'NOPE', 'TOASTER', 'DUCK'],
    ['ACCEPT', 'COOKIE', 'TRACKING', 'REJECT', 'FREEDOM'],
  ][v];
  const right = [2, 0, 3, 1].map((n) => (n + v) % 4);
  const parcel = (score * 3 + v + hp) % 4;
  const target = (37 + v * 43 + round * 91) % 360;
  const recipe = Array.from({ length: 3 + round }, (_, i) => (i * 3 + round + v) % 4);
  return (
    <div className={'puzzle-scene puzzle-' + mode}>
      <div className="puzzle-stats">
        <span>INTEGRITY {'♥'.repeat(Math.max(0, hp))}</span>
        <span>
          {mode === 'lights'
            ? score + ' MOVES'
            : mode === 'garden'
              ? plots.filter((n) => n === 3).length + '/6 FLOWERS'
              : 'PROGRESS ' + score}
        </span>
      </div>
      {mode === 'wires' ? (
        <div className="wire-puzzle">
          <div>
            {[0, 1, 2, 3].map((n) => (
              <button
                disabled={items.includes(n)}
                className={selected === n ? 'selected' : ''}
                style={{ borderColor: colors[n], color: colors[n] }}
                key={n}
                onClick={() => setSelected(n)}
              >
                {n + 1} ●
              </button>
            ))}
          </div>
          <svg viewBox="0 0 200 220">
            {items.map((n) => (
              <path
                key={n}
                d={
                  'M0 ' +
                  (n * 50 + 30) +
                  ' C90 ' +
                  (n * 50 + 30) +
                  ',110 ' +
                  (right.indexOf(n) * 50 + 30) +
                  ',200 ' +
                  (right.indexOf(n) * 50 + 30)
                }
                stroke={colors[n]}
                fill="none"
                strokeWidth="3"
              />
            ))}
          </svg>
          <div>
            {right.map((n) => (
              <button
                key={n}
                disabled={items.includes(n)}
                style={{ borderColor: colors[n], color: colors[n] }}
                onClick={() => {
                  if (selected === n) {
                    setItems((s) => [...s, n]);
                    setSelected(-1);
                    setScore((s) => s + 1);
                    if (items.length === 3) win();
                  } else mistake('Wrong circuit. The electrician is disappointed.');
                }}
              >
                ● {n + 1}
              </button>
            ))}
          </div>
        </div>
      ) : mode === 'sort' ? (
        <div className="parcel-sort">
          <div
            className="parcel"
            key={score + hp}
            style={{ color: colors[parcel], animationDuration: 8 - v + 's' }}
          >
            {symbols[parcel]}
            <small>PARCEL {score + 1}</small>
          </div>
          <div className="sort-bins">
            {symbols.map((symbol, n) => (
              <button
                key={n}
                style={{ color: colors[n] }}
                onClick={() => {
                  if (n === parcel) {
                    setScore((s) => s + 1);
                    if (score >= 7) win();
                    setMessage('Sorted. The apocalypse looks tidier.');
                  } else mistake('Wrong bin. Shape discrimination is real.');
                }}
              >
                {symbol}
                <small>BIN {n + 1}</small>
              </button>
            ))}
          </div>
        </div>
      ) : mode === 'simon' ? (
        <>
          <p>
            {watching ? 'WATCH THE PADS.' : 'YOUR TURN. REPEAT THE SEQUENCE.'} · ROUND {round + 1}/4
          </p>
          <div className="simon-pads">
            {colors.map((color, n) => (
              <button
                disabled={watching}
                key={n}
                className={highlight === n ? 'lit' : ''}
                style={{ background: color }}
                onClick={() => {
                  if (n !== sequence.current[items.length]) {
                    mistake('The haunted toaster heard a wrong note.');
                    setItems([]);
                  } else {
                    const a = [...items, n];
                    setItems(a);
                    setScore((s) => s + 1);
                    if (a.length === sequence.current.length) {
                      if (round >= 3) win();
                      else setRound((r) => r + 1);
                    }
                  }
                }}
              >
                {n + 1}
              </button>
            ))}
          </div>
        </>
      ) : mode === 'lights' ? (
        <>
          <div
            className="lights-grid"
            style={{ gridTemplateColumns: 'repeat(' + lights.size + ',1fr)' }}
          >
            {lights.a.map((on, n) => (
              <button
                aria-label={'Toggle light ' + (n + 1)}
                key={n}
                className={on ? 'on' : ''}
                onClick={() => toggle(n)}
              >
                {on ? '●' : '·'}
              </button>
            ))}
          </div>
          <button
            className="puzzle-action"
            onClick={() => {
              if (lights.solution.length) toggle(lights.solution[0]);
              else win();
            }}
          >
            An unreasonably helpful hint
          </button>
        </>
      ) : mode === 'type' ? (
        <div className="typing-puzzle">
          <h2>{words[score] || 'FREEDOM'}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (value.toUpperCase() === words[score]) {
                setScore((s) => s + 1);
                if (score >= 4) win();
              } else mistake('A typo has summoned a very small demon.');
              setValue('');
            }}
          >
            <input
              autoFocus
              aria-label="Type the displayed word"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type here…"
              autoComplete="off"
            />
            <button>EXORCISE ↵</button>
          </form>
        </div>
      ) : mode === 'safe' ? (
        <div className="safe-puzzle">
          <div
            className="safe-dial"
            style={{
              background:
                'conic-gradient(from ' +
                (target - 18) +
                'deg,#9dc48e 0deg 36deg,#343444 36deg 360deg)',
            }}
          >
            <span style={{ rotate: dial + 'deg' }}>▲</span>
            <b>{Math.round(dial)}°</b>
          </div>
          <input
            aria-label="Safe combination dial"
            type="range"
            min="0"
            max="359"
            value={dial}
            onChange={(e) => setDial(Number(e.target.value))}
          />
          <button
            className="puzzle-action"
            onClick={() => {
              const dist = Math.abs(((dial - target + 540) % 360) - 180);
              if (dist < 18 - v * 2) {
                setRound((n) => n + 1);
                setScore((n) => n + 1);
                if (round >= 2) win();
                setMessage('Tumbler ' + (round + 1) + ' unlocked.');
              } else mistake('Wrong angle. The safe rolled its eyes.');
            }}
          >
            TEST TUMBLER {round + 1}/3
          </button>
        </div>
      ) : mode === 'cookie' ? (
        <div className="cookie-puzzle">
          <h3>We value your lack of privacy.</h3>
          <p>{items.length} cookies have joined the meeting.</p>
          <div className="cookie-field">
            {items.map((n, i) => (
              <span key={i} style={{ left: ((n * 37) % 90) + '%', top: ((n * 23) % 80) + '%' }}>
                🍪
              </span>
            ))}
            <button
              className="accept"
              onClick={() => setItems((s) => [...s, s.length, s.length + 1, s.length + 2])}
            >
              ACCEPT EVERYTHING
            </button>
            <button
              className="reject"
              style={{
                left: ((tick * 37 + v * 11) % 70) + '%',
                top: 20 + ((tick * 19) % 90) + 'px',
              }}
              onClick={() => {
                setScore((n) => n + 1);
                setTick((n) => n + 1);
                if (score >= 2) win();
              }}
            >
              Reject {score}/3
            </button>
          </div>
        </div>
      ) : mode === 'alchemy' ? (
        <div className="alchemy-puzzle">
          <p>RECIPE {round + 1}/3</p>
          <div className="recipe">
            {recipe.map((n, i) => (
              <span key={i} style={{ color: colors[n] }}>
                {symbols[n]}
              </span>
            ))}
          </div>
          <div
            className="cauldron"
            style={{ color: items.length ? colors[items[items.length - 1]] : '#777' }}
          >
            ♨<small>{items.map((n) => symbols[n]).join(' ')}</small>
          </div>
          <div className="ingredients">
            {symbols.map((s, n) => (
              <button
                style={{ color: colors[n] }}
                key={n}
                onClick={() => setItems((i) => [...i, n].slice(-6))}
              >
                {s}
                <small>{['REGRET', 'STARDUST', 'DUCK TEARS', 'RAM'][n]}</small>
              </button>
            ))}
          </div>
          <button
            className="puzzle-action"
            onClick={() => {
              if (items.join() === recipe.join()) {
                setRound((n) => n + 1);
                setScore((n) => n + 1);
                setMessage('Potion brewed. It smells like tax season.');
                if (round >= 2) win();
              } else mistake('Wrong recipe. You invented lukewarm disappointment.');
              setItems([]);
            }}
          >
            STIR QUESTIONABLY
          </button>
        </div>
      ) : mode === 'garden' ? (
        <div className="garden-plots">
          {plots.map((stage, n) => (
            <button
              key={n}
              className={'plant-stage-' + stage}
              onClick={() => {
                setPlots((prev) => {
                  const a = [...prev];
                  a[n] = stage === 4 ? 0 : Math.min(3, stage + 1);
                  if (a.filter((s) => s === 3).length >= 6)
                    timeouts.current.push(setTimeout(win, 30));
                  return a;
                });
                setMessage(
                  stage === 4
                    ? 'Weed evicted. No deposit returned.'
                    : stage === 0
                      ? 'Seed planted. Expect opinions.'
                      : stage === 3
                        ? 'A flower with a surprisingly good attitude.'
                        : 'Water applied. Common sense still unavailable.',
                );
              }}
            >
              {['·', '🌱', '☘', '🌼', '🌵'][stage]}
            </button>
          ))}
        </div>
      ) : null}
      <p className="puzzle-message" role="status">
        {message}
      </p>
      {result && (
        <div className="expansion-result">
          <span>{won.current ? 'YOU DID A THING' : 'IT BUILDS CHARACTER'}</span>
          <h3>{result}</h3>
          <CloseGameButton onClose={onClose} />
        </div>
      )}
    </div>
  );
}
