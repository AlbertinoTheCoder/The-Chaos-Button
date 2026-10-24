import { useMusic } from './useMusic';
import { useSoundFeedback } from './useSoundFeedback';
import { useDraggableWindows } from './useDraggableWindows';
import { isWindowEvent, openWindow, closeWindow, type ChaosWindow } from './windows';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  AudioLines,
  VolumeX,
  RotateCcw,
  Trophy,
  BookOpen,
  Settings,
  X,
  ArrowRight,
  Shield,
  Activity,
  MoveUpRight,
  Command,
  Check,
  Lock,
  Radio,
  TriangleAlert,
} from 'lucide-react';
import { events, gameIds, levelFor, selectEvent } from './events';
import { achievementRules, initial, persist, readSave, type Save } from './persistence';
import { sound, eventSfx, playSfx } from './sound';
import { Challenge } from './Challenge';
import { EventScene, Physics } from './Effects';
const levels = ['NORMAL', 'WEIRD', 'UNSTABLE', 'ANARCHY', 'REALITY COLLAPSE', 'BEYOND CHAOS'];
const lines = [
  'WHY.',
  'YOU HAD ONE JOB.',
  'STOP TOUCHING ME.',
  'THAT WAS EXPENSIVE.',
  'I’M CALLING MY LAWYER.',
  'THIS IS NOT A FEATURE.',
  'PLEASE THINK ABOUT MY FAMILY.',
  'YOU AGAIN?',
  'OH COME ON.',
];
type Log = { id: number; press: number; time: string };
export default function App() {
  useDraggableWindows();
  const [save, setSave] = useState<Save>(readSave),
    [active, setActive] = useState<number[]>([]),
    [windows, setWindows] = useState<ChaosWindow[]>([]),
    [logs, setLogs] = useState<Log[]>([]),
    [tab, setTab] = useState<'achievements' | 'events' | 'settings' | null>(null),
    [toast, setToast] = useState(''),
    [speech, setSpeech] = useState(''),
    [game, setGame] = useState<number | null>(null),
    [held, setHeld] = useState(false),
    [password, setPassword] = useState(''),
    [persuaded, setPersuaded] = useState(false),
    [filter, setFilter] = useState('All'),
    [demo, setDemo] = useState(false),
    [confirmReset, setConfirmReset] = useState(false),
    [pos, setPos] = useState({ x: 0, y: 0 });
  const windowKey = useRef(0);
  const recent = useRef<number[]>(save.recent || []),
    timers = useRef(new Map<number, ReturnType<typeof setTimeout>>()),
    saved = useRef(save),
    pointer = useRef({ x: 0, y: 0 }),
    heldTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  saved.current = save;
  useSoundFeedback(save.muted, save.volume);
  const music = useMusic(save);
  const level = levelFor(save.presses),
    chaos = Math.min(100, save.presses / 1.51);
  const has = (n: number) => active.includes(n) || windows.some((window) => window.eventId === n);
  const notify = (message: string) => setToast(message);
  const secret = (s: string) => {
    setSave((v) => (v.secrets.includes(s) ? v : { ...v, secrets: [...v.secrets, s] }));
    notify('SECRET DISCOVERED / ' + s.toUpperCase());
    sound('rare', saved.current.muted, saved.current.volume);
  };
  function remove(id: number) {
    if (id === 16 || id === 17) setPos({ x: 0, y: 0 });
    if (id === 25) setPersuaded(false);
    if (id === 29) setPassword('');
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setActive((v) => v.filter((n) => n !== id));
    if (id === 100)
      setSave((s) => ({
        ...s,
        endings: [
          ...new Set([...s.endings, s.victories.includes(112) ? 'chaos-tamed' : 'one-more-press']),
        ],
      }));
  }
  function restore() {
    playSfx('restore');
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    setActive([]);
    setWindows([]);
    setGame(null);
    setPos({ x: 0, y: 0 });
    setPassword('');
    setPersuaded(false);
    setSpeech('Fine. A fresh start. Same terrible player.');
    notify('WEBSITE RESTORED / YOUR BAD DECISIONS ARE SAVED');
  }
  function trigger(id: number) {
    const event = events[id - 1];
    if (!event) return;
    if (gameIds.includes(id)) {
      if (game !== null) return;
      setGame(id);
    } else if (isWindowEvent(id)) {
      const key = ++windowKey.current;
      setWindows((v) => openWindow(v, id, key));
    } else {
      setActive((v) => [...v.filter((n) => n !== id), id]);
      clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        setTimeout(() => event.cleanup(remove), event.duration),
      );
    }
    recent.current = [...recent.current.slice(-59), id];
    setSave((s) => ({
      ...s,
      recent: recent.current,
      discovered: [...new Set([...s.discovered, id])],
    }));
    setLogs((v) =>
      [
        {
          id,
          press: saved.current.presses + 1,
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        },
        ...v,
      ].slice(0, 30),
    );
    setSpeech(
      id === 74
        ? 'I guess we have a pet now.'
        : saved.current.victories.includes(96)
          ? 'Still recovering from that boss fight, by the way.'
          : lines[saved.current.presses % lines.length],
    );
    sound(eventSfx(event), saved.current.muted, saved.current.volume);
    if (id === 87) {
      setActive((v) => v.slice(-1));
      notify('THE LAST EFFECTS HAVE BEEN REWOUND');
    }
    if (id === 17) setPos({ x: (Math.random() - 0.5) * 240, y: (Math.random() - 0.5) * 120 });
    if (id === 97) {
      clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        setTimeout(() => {
          setActive((v) => v.filter((n) => n === 97));
          timers.current.set(
            id,
            setTimeout(() => {
              remove(97);
              setSpeech('Reality rebuilt. Your windows survived, somehow.');
            }, 1800),
          );
        }, 1200),
      );
    }
  }
  function press() {
    if (game !== null) return;
    if (has(25) && !persuaded) {
      setSpeech('A little “please” would be nice.');
      return;
    }
    if (has(29) && password.toLowerCase() !== 'chaos') {
      setSpeech('The sticky note knows the password.');
      return;
    }
    if (has(28) && !held) {
      setSpeech('Hold me for one second. Commitment. Try it.');
      return;
    }
    const n = saved.current.presses + 1;
    setSave((s) => ({ ...s, presses: n, highest: Math.max(s.highest, levelFor(n)) }));
    sound('press', saved.current.muted, saved.current.volume);
    if (has(27)) {
      setSpeech(['🍒 🍒 🍒 — JACKPOT!', '🍒 🍋 🔔 — emotionally bankrupt'][n % 2]);
      if (n % 2 === 0) secret('slots');
    }
    const chosen =
      n === 1
        ? 24
        : n === 2
          ? 101
          : n === 3
            ? 3
            : selectEvent(n, recent.current, active, Math.random, saved.current.discovered).id;
    trigger(chosen);
    setHeld(false);
  }
  useEffect(() => {
    persist(save);
    const unlocked = achievementRules.filter(
      (a) => a.test(save) && !save.achievements.includes(a.id),
    );
    if (unlocked.length) {
      setSave((s) => ({
        ...s,
        achievements: [...new Set([...s.achievements, ...unlocked.map((a) => a.id)])],
      }));
      notify('ACHIEVEMENT UNLOCKED / ' + unlocked[0].name);
      sound('achievement', save.muted, save.volume);
    }
  }, [save]);
  useEffect(() => {
    const id = setInterval(() => setSave((s) => ({ ...s, seconds: s.seconds + 1 })), 1000);
    let sequence = '';
    const listener = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea,select')) return;
      if (e.key === 'Escape') {
        setTab(null);
        restore();
      }
      if (e.code === 'Space' && !e.repeat && !(e.target as HTMLElement).closest('button')) {
        e.preventDefault();
        document.getElementById('chaos-button')?.click();
      }
      sequence = (
        sequence +
        ({ ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R' }[e.key] ||
          e.key.toLowerCase())
      ).slice(-30);
      if (sequence.endsWith('UUDDLRLRba')) {
        secret('konami');
        trigger(98);
      }
      if (sequence.endsWith('chaos')) {
        secret('command');
        trigger(89);
      }
    };
    const move = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      document.documentElement.style.setProperty('--cursor-x', e.clientX + 'px');
      document.documentElement.style.setProperty('--cursor-y', e.clientY + 'px');
    };
    window.addEventListener('keydown', listener);
    window.addEventListener('pointermove', move);
    return () => {
      clearInterval(id);
      timers.current.forEach(clearTimeout);
      clearTimeout(heldTimer.current);
      window.removeEventListener('keydown', listener);
      window.removeEventListener('pointermove', move);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 4200);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (!speech) return;
    const id = setTimeout(() => setSpeech(''), 5500);
    return () => clearTimeout(id);
  }, [speech]);
  const physics = active.filter((n) => (n >= 46 && n <= 60) || n === 15);
  const effectsClass = [...new Set([...active, ...windows.map((window) => window.eventId)])]
    .map((n) => 'effect-' + n)
    .join(' ');
  const combined =
    has(46) && has(54)
      ? 'COMBO / BALLISTIC GRAVITY'
      : has(63) && has(15)
        ? 'COMBO / CIVILIZATION REBUILDING'
        : has(52) && has(18)
          ? 'COMBO / BUTTONS ENTER THE VOID'
          : has(31) && has(33)
            ? 'COMBO / CORRUPTED NONSENSEOS'
            : has(71) && has(24)
              ? 'COMBO / THE BUTTON COMMANDS ITS ARMY'
              : null;
  return (
    <>
      <div className={'app level-' + level + ' ' + effectsClass}>
        <div className="ambient-grid" />
        <header>
          <a className="brand" href="#" aria-label="Chaos Button home">
            <span className="brand-icon">!</span> CHAOS<span>BUTTON</span>
            <small>EXPERIMENT NO. 001</small>
          </a>
          <div className="header-right">
            <span className="session">
              <i /> SYSTEM {level >= 3 ? 'QUESTIONABLE' : 'STABLE'}
            </span>
            <button
              className="sound-button"
              onClick={() => setSave((s) => ({ ...s, muted: !s.muted }))}
              aria-label={save.muted ? 'Unmute sound' : 'Mute sound'}
            >
              {save.muted ? <VolumeX size={17} /> : <AudioLines size={17} />}
              <span>SOUND {save.muted ? 'OFF' : 'ON'}</span>
            </button>
            <button
              className="icon-button"
              onClick={() => setTab('settings')}
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>
        <main>
          <div className="intro">
            <div className="eyebrow">
              <span className="red-dash" /> A COMPLETELY UNNECESSARY EXPERIMENT
            </div>
            <h1>
              One button. <br />
              Infinite <em>bad ideas.</em>
            </h1>
            <p>
              Some things are better left untouched. <br />
              This probably isn’t one of them.
            </p>
          </div>
          <div className="game-layout">
            <section className="button-chamber">
              <div className="chamber-top">
                <span>
                  <Radio size={13} /> LIVE EXPERIMENT
                </span>
                <span>
                  HANDLE WITH ABSOLUTELY NO CARE <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="warning">
                <TriangleAlert size={13} /> DO NOT PRESS THIS BUTTON.
              </div>
              <div className="button-zone">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <span className="coord coord-a">
                  X: 0042
                  <br />
                  Y: 0137
                </span>
                <span className="coord coord-b">
                  VOLATILE
                  <br />
                  BY DESIGN
                </span>
                <div
                  className="button-pedestal"
                  style={{ transform: 'translate(' + pos.x + 'px,' + pos.y + 'px)' }}
                >
                  <button
                    id="chaos-button"
                    className={'big-button ' + (has(30) ? 'monster' : '')}
                    onPointerEnter={() => {
                      if (has(16))
                        setPos({ x: (Math.random() - 0.5) * 220, y: (Math.random() - 0.5) * 120 });
                    }}
                    onPointerDown={() => {
                      if (has(28))
                        heldTimer.current = setTimeout(() => {
                          setHeld(true);
                          playSfx('charge');
                        }, 1000);
                    }}
                    onPointerUp={() => clearTimeout(heldTimer.current)}
                    onClick={press}
                    aria-label="Do not press — trigger chaos"
                  >
                    {has(21) ? (
                      'SETTINGS'
                    ) : has(27) ? (
                      '🍒 🔔 🍋'
                    ) : (
                      <>
                        <span className="button-warning">!</span>
                        <strong>
                          {has(28) ? (held ? 'READY' : 'HOLD TO CHARGE') : has(23) ? '' : 'DO NOT'}
                          <br />
                          {!has(28) && !has(23) && 'PRESS'}
                        </strong>
                      </>
                    )}
                    <span className="button-shine" />
                  </button>
                  <span className="base-notch" />
                </div>
                {speech && (
                  <div className="speech" role="status">
                    {speech}
                    <span>— THE BUTTON, PROBABLY</span>
                  </div>
                )}
                {has(18) && (
                  <button className="duplicate-button" onClick={press}>
                    ALSO DO NOT PRESS
                  </button>
                )}
              </div>
              <div className="press-count">
                <strong>{String(save.presses).padStart(3, '0')}</strong>
                <span>TIMES PRESSED</span>
              </div>
              <div className="chamber-bottom">
                <span>
                  <span className="tiny-dot" /> CONSEQUENCES MAY VARY
                </span>
                <span>
                  SPACE TO PRESS <kbd>↵</kbd>
                </span>
              </div>
              {has(25) && (
                <button
                  className="persuade"
                  onClick={() => {
                    setPersuaded(true);
                    setSpeech('Well, since you asked nicely.');
                  }}
                >
                  Please, your magnificent redness?
                </button>
              )}
              {has(29) && (
                <div className="password-note">
                  <small>STICKY NOTE: password = chaos</small>
                  <input
                    aria-label="Button password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}
            </section>
            <aside>
              <section className="chaos-panel">
                <div className="section-label">
                  <span>
                    <Activity size={15} /> CHAOS LEVEL
                  </span>
                  <span className="live-tag">LIVE</span>
                </div>
                <div className="level-title">
                  <h2>{levels[level - 1]}</h2>
                  <span>
                    LVL <b>{String(level).padStart(2, '0')}</b>
                    <small>/ 06</small>
                  </span>
                </div>
                <div className="meter">
                  <i style={{ width: Math.max(4, chaos) + '%' }} />
                  {Array.from({ length: 24 }, (_, i) => (
                    <span key={i} />
                  ))}
                </div>
                <div className="meter-label">
                  <span>{Math.round(chaos)}% INSTABILITY</span>
                  <span>
                    {level === 1 ? 'FOR NOW.' : level >= 5 ? 'SEND HELP.' : 'GETTING WEIRD.'}
                  </span>
                </div>
                <p>
                  {level === 1
                    ? 'Everything is fine. Suspiciously fine.'
                    : level === 2
                      ? 'The website has started making its own decisions.'
                      : 'Reality is holding on with a very small piece of tape.'}
                </p>
                <div className="next-level">
                  <span>NEXT STAGE</span>
                  <span>
                    {level === 6
                      ? 'THERE IS NO GOING BACK'
                      : levels[level] +
                        ' at ' +
                        [11, 31, 61, 101, 151][level - 1] +
                        ' presses'}{' '}
                    <ArrowRight size={13} />
                  </span>
                </div>
              </section>
              <section className="activity-panel">
                <div className="section-label">
                  <span>
                    <span className="tiny-dot" /> INCIDENT LOG
                  </span>
                  <span>{String(logs.length).padStart(2, '0')}</span>
                </div>
                {logs.length ? (
                  <div className="incident-list">
                    {logs.slice(0, 4).map((l, i) => (
                      <div className="incident" key={i}>
                        <span className={'incident-dot ' + events[l.id - 1].rarity} />
                        <div>
                          <strong>{events[l.id - 1].name}</strong>
                          <small>
                            PRESS #{l.press} · {events[l.id - 1].category.toUpperCase()}
                          </small>
                        </div>
                        <time>{l.time}</time>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-log">
                    <div>
                      <Command size={24} />
                      <span className="empty-spark">✦</span>
                    </div>
                    <strong>A suspicious lack of chaos.</strong>
                    <p>Your bad decisions will appear here.</p>
                  </div>
                )}
                <div className="log-footer">
                  <span>
                    {logs.length
                      ? 'THE EVIDENCE IS ADDING UP.'
                      : 'WAITING FOR THE FIRST MISTAKE...'}
                  </span>
                  <i />
                </div>
              </section>
              <button className="restore-button" onClick={restore}>
                <RotateCcw size={15} />
                <span>Restore website</span>
                <span>
                  Emergency exit <MoveUpRight size={13} />
                </span>
              </button>
              <p className="restore-note">
                <Shield size={11} /> Restores sanity. Keeps your progress.
              </p>
            </aside>
          </div>
          <div className="bottom-grid">
            <button className="collection-card" onClick={() => setTab('achievements')}>
              <div className="card-symbol">
                <Trophy size={22} />
              </div>
              <div>
                <h3>
                  Bad decisions. Good trophies. <ArrowUpRight size={15} />
                </h3>
                <p>
                  {save.achievements.length} / {achievementRules.length} achievements unlocked
                </p>
              </div>
              <span className="card-progress">
                {Math.round((save.achievements.length / achievementRules.length) * 100)}%
              </span>
            </button>
            <button className="collection-card" onClick={() => setTab('events')}>
              <div className="card-symbol">
                <BookOpen size={22} />
              </div>
              <div>
                <h3>
                  The chaos collection <ArrowUpRight size={15} />
                </h3>
                <p>
                  {save.discovered.length} / {events.length} strange things discovered
                </p>
              </div>
              <span className="stacked-dots">▧</span>
            </button>
          </div>
          <div className="disclaimer">
            <span>NO RULES. NO OBJECTIVE. QUESTIONABLE LIFE CHOICES.</span>
            <span>Every press is a story. Usually a terrible one.</span>
          </div>
        </main>
        <footer>
          <span>
            BUILT WITH BAD INTENTIONS <span className="footer-star">✳</span>
          </span>
          <button onClick={() => secret('star')}>
            Nothing to see here. <span>↗</span>
          </button>
          <span>100% LOCAL. 0% SELF CONTROL.</span>
        </footer>
      </div>
      <div className={'effect-layer ' + effectsClass}>
        <Physics ids={physics} />
        {active.map((id) => (
          <EventScene
            key={'effect-' + id}
            id={id}
            close={() => remove(id)}
            secret={secret}
            press={press}
            onWin={() => {
              setSave((s) => ({ ...s, wins: s.wins + 1 }));
              sound('win', saved.current.muted, saved.current.volume);
            }}
          />
        ))}
        {windows.map((window) => (
          <EventScene
            key={'window-' + window.key}
            id={window.eventId}
            close={() => setWindows((v) => closeWindow(v, window.key))}
            secret={secret}
            press={press}
            onWin={() => {
              setSave((s) => ({ ...s, wins: s.wins + 1 }));
              sound('win', saved.current.muted, saved.current.volume);
            }}
          />
        ))}
      </div>
      {combined && (
        <div className="combo" role="status">
          {combined}
        </div>
      )}
      {(active.length > 0 || windows.length > 0) && (
        <button className="floating-restore" onClick={restore}>
          <RotateCcw size={15} /> Restore website <kbd>ESC</kbd>
        </button>
      )}
      {toast && (
        <div className="toast" role="status">
          <Trophy size={23} />
          <div>
            <span>{toast.split(' / ')[0]}</span>
            <strong>{toast.split(' / ')[1]}</strong>
          </div>
          <button aria-label="Dismiss notification" onClick={() => setToast('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {game !== null && (
        <Challenge
          key={game}
          id={game}
          onExit={() => setGame(null)}
          onWin={() => {
            setSave((s) => ({
              ...s,
              wins: s.wins + 1,
              victories: [
                ...new Set([
                  ...s.victories,
                  ...([30, 78, 96, 111, 112].includes(game) ? [game] : []),
                ]),
              ],
            }));
            sound('win', saved.current.muted, saved.current.volume);
          }}
        />
      )}
      {tab && (
        <div className="modal-backdrop" onClick={() => setTab(null)}>
          <section className="gallery" onClick={(e) => e.stopPropagation()}>
            <div className="windowbar">
              <span>CHAOS CONTROL / {tab.toUpperCase()}</span>
              <button aria-label="Close panel" onClick={() => setTab(null)}>
                <X size={18} />
              </button>
            </div>
            <h2>
              {tab === 'achievements'
                ? 'A record of poor judgment.'
                : tab === 'events'
                  ? 'The chaos collection.'
                  : 'A little damage control.'}
            </h2>
            {tab === 'achievements' ? (
              <>
                <p>
                  {save.achievements.length} of {achievementRules.length} earned ·{' '}
                  {Math.round((save.achievements.length / achievementRules.length) * 100)}% complete
                </p>
                <div className="achievement-grid">
                  {achievementRules.map((a) => (
                    <div className={save.achievements.includes(a.id) ? 'earned' : ''} key={a.id}>
                      {save.achievements.includes(a.id) ? <Trophy size={20} /> : <Lock size={20} />}
                      <strong>{a.name}</strong>
                      <small>{a.description}</small>
                      {save.achievements.includes(a.id) && <Check size={14} />}
                    </div>
                  ))}
                </div>
              </>
            ) : tab === 'events' ? (
              <>
                <p>
                  294 ways to regret a click. Explore discovered events, or enable the laboratory to
                  test every anomaly.
                </p>
                <div className="filters">
                  {[
                    'All',
                    'Visual',
                    'Button',
                    'System',
                    'Physics',
                    'Living',
                    'Minigame',
                    'Reality',
                    'Legendary',
                    'Wildcard',
                    'Arcade',
                    'Toy',
                    'Puzzle',
                    'World',
                    'Trap',
                    'Popup',
                  ].map((c) => (
                    <button
                      className={filter === c ? 'selected' : ''}
                      key={c}
                      onClick={() => setFilter(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <label className="lab-toggle">
                  <input
                    type="checkbox"
                    checked={demo}
                    onChange={(e) => setDemo(e.target.checked)}
                  />{' '}
                  Laboratory mode — replay any event (marks it as discovered)
                </label>
                <div className="event-grid">
                  {events
                    .filter((e) => filter === 'All' || e.category === filter)
                    .map((e) => (
                      <button
                        disabled={!demo && !save.discovered.includes(e.id)}
                        key={e.id}
                        onClick={() => {
                          trigger(e.id);
                          setTab(null);
                        }}
                      >
                        <small>
                          #{String(e.id).padStart(3, '0')} · {e.rarity}
                        </small>
                        <strong>
                          {demo || save.discovered.includes(e.id) ? e.name : 'Undiscovered anomaly'}
                        </strong>
                        <span>
                          {e.category} · Level {e.minLevel}{' '}
                          {save.discovered.includes(e.id) ? '✓' : '◇'}
                        </span>
                      </button>
                    ))}
                </div>
              </>
            ) : (
              <div className="settings">
                <label>
                  <span>Procedural sound</span>
                  <button onClick={() => setSave((s) => ({ ...s, muted: !s.muted }))}>
                    {save.muted ? 'Muted' : 'On'}
                  </button>
                </label>
                <label>
                  <span>Volume</span>
                  <input
                    aria-label="Volume"
                    type="range"
                    min="0"
                    max="1"
                    step=".05"
                    value={save.volume}
                    onChange={(e) => setSave((s) => ({ ...s, volume: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  <span>Music</span>
                  <button
                    onClick={() => setSave((s) => ({ ...s, musicEnabled: !s.musicEnabled }))}
                    aria-label={save.musicEnabled ? 'Disable music' : 'Enable music'}
                    aria-pressed={save.musicEnabled}
                  >
                    {save.musicEnabled ? 'On' : 'Off'}
                  </button>
                </label>
                <label>
                  <span>Music volume</span>
                  <input
                    aria-label="Music volume"
                    type="range"
                    min="0"
                    max="1"
                    step=".05"
                    value={save.musicVolume}
                    onChange={(e) =>
                      setSave((s) => ({ ...s, musicVolume: Number(e.target.value) }))
                    }
                  />
                </label>
                <div className="music-now-playing">
                  <span>
                    {save.muted || !save.musicEnabled || save.musicVolume === 0 || save.volume === 0
                      ? 'SOUNDTRACK PAUSED'
                      : 'NOW PLAYING'}
                  </span>
                  <strong>{music.name}</strong>
                  <small>
                    STAGE {music.stage} / 6 &middot; {music.bpm} BPM
                  </small>
                  <p>Builds with every chaos level and every three minutes of play.</p>
                </div>
                <p>
                  Motion follows your device’s reduced-motion preference. Progress saves
                  automatically on this browser.
                </p>
                <button
                  onClick={() => {
                    restore();
                    setTab(null);
                  }}
                >
                  Restore website
                </button>
                <div className="danger-zone">
                  <h3>Erase the evidence</h3>
                  <p>
                    Permanently clears presses, discoveries, trophies, and endings on this browser.
                  </p>
                  {confirmReset ? (
                    <>
                      <button
                        onClick={() => {
                          restore();
                          recent.current = [];
                          setSave({ ...initial });
                          setLogs([]);
                          setConfirmReset(false);
                          setTab(null);
                        }}
                      >
                        Yes, reset all progress
                      </button>
                      <button onClick={() => setConfirmReset(false)}>Keep my bad decisions</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmReset(true)}>Reset progress…</button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

// Shared procedural audio feedback is synchronized with saved sound settings.
