export interface Save {
  presses: number;
  recent: number[];
  discovered: number[];
  achievements: string[];
  victories: number[];
  secrets: string[];
  endings: string[];
  highest: number;
  seconds: number;
  wins: number;
  muted: boolean;
  volume: number;
  musicEnabled: boolean;
  musicVolume: number;
}
export const initial: Save = {
  presses: 0,
  recent: [],
  discovered: [],
  achievements: [],
  victories: [],
  secrets: [],
  endings: [],
  highest: 1,
  seconds: 0,
  wins: 0,
  muted: true,
  volume: 0.35,
  musicEnabled: true,
  musicVolume: 0.45,
};
export function readSave(): Save {
  try {
    const raw = JSON.parse(localStorage.getItem('chaos-button-v1') || 'null');
    if (!raw || typeof raw.presses !== 'number' || !Number.isFinite(raw.presses))
      return { ...initial };
    return {
      ...initial,
      ...raw,
      musicEnabled: typeof raw.musicEnabled === 'boolean' ? raw.musicEnabled : initial.musicEnabled,
      musicVolume:
        typeof raw.musicVolume === 'number' && Number.isFinite(raw.musicVolume)
          ? Math.max(0, Math.min(1, raw.musicVolume))
          : initial.musicVolume,
      presses: Math.max(0, Math.floor(raw.presses)),
      ...Object.fromEntries(
        ['recent', 'discovered', 'achievements', 'victories', 'secrets', 'endings'].map((k) => [
          k,
          Array.isArray(raw[k]) ? raw[k] : [],
        ]),
      ),
    };
  } catch {
    return { ...initial };
  }
}
export function persist(s: Save) {
  try {
    localStorage.setItem('chaos-button-v1', JSON.stringify(s));
  } catch {
    /* Session still works when storage is disabled. */
  }
}
export const achievementRules = [
  ...[1, 10, 25, 50, 100, 151, 250, 500, 1000, 2000].map((n, i) => ({
    id: 'press' + n,
    name: [
      'First Mistake',
      'Poor Impulse Control',
      'Repeat Offender',
      'No Going Back',
      'No Self Control',
      'Professional Disaster',
      'A Personal Problem',
      'Unemployed',
      'Button Historian',
      'Still Clicking',
    ][i],
    description: 'Press ' + n + ' times',
    test: (s: Save) => s.presses >= n,
  })),
  ...[5, 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 270].map((n) => ({
    id: 'events' + n,
    name: n === 50 ? 'Certified Menace' : n + ' Shades of Chaos',
    description: 'Discover ' + n + ' events',
    test: (s: Save) => s.discovered.length >= n,
  })),
  ...[1, 3, 5, 10, 20].map((n) => ({
    id: 'wins' + n,
    name: 'Survivor ' + n,
    description: 'Win ' + n + ' challenges',
    test: (s: Save) => s.wins >= n,
  })),
  ...[60, 300, 600, 1800].map((n) => ({
    id: 'time' + n,
    name: n === 1800 ? 'How Are You Still Here' : n / 60 + ' Minutes of Bad Decisions',
    description: 'Play for ' + n / 60 + ' minutes',
    test: (s: Save) => s.seconds >= n,
  })),
  ...[30, 78, 96, 111, 112].map((n, i) => ({
    id: 'boss' + n,
    name: [
      'Teething Troubles',
      'Cursor Conqueror',
      'Button Bully',
      'Admin Privileges',
      'Chaos Tamed',
    ][i],
    description:
      'Defeat ' + (n === 111 ? 'the System Administrator' : n === 112 ? 'Chaos Itself' : 'a boss'),
    test: (s: Save) => s.victories.includes(n),
  })),
  ...['konami', 'terminal', 'star', 'room', 'command'].map((n) => ({
    id: 'secret' + n,
    name: 'Secret: ' + n,
    description: 'Hidden — investigate the website',
    test: (s: Save) => s.secrets.includes(n),
  })),
  {
    id: 'legend',
    name: 'Lucky Idiot',
    description: 'Trigger a legendary event',
    test: (s: Save) => s.discovered.some((n) => n >= 96 && n <= 100),
  },
  {
    id: 'dimension',
    name: 'Reality Is Optional',
    description: 'Enter Dimension B',
    test: (s: Save) => s.discovered.includes(89),
  },
  {
    id: 'ending',
    name: 'True Ending',
    description: 'Discover an ending',
    test: (s: Save) => s.endings.length > 0,
  },
];
