import { isWindowEvent } from './windows';
import { popupNames } from './popups';
import { expansion } from './expansion';
export type Category =
  | 'Visual'
  | 'Button'
  | 'System'
  | 'Physics'
  | 'Living'
  | 'Minigame'
  | 'Reality'
  | 'Legendary'
  | 'Wildcard'
  | 'Arcade'
  | 'Toy'
  | 'Puzzle'
  | 'World'
  | 'Trap'
  | 'Popup';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export const names = [
  'Upside down',
  'Questionable angle',
  'Jelly interface',
  'Pixel panic',
  'Film noir',
  'Chromatic incident',
  'Glass fracture',
  'Ghost in the monitor',
  'Looking glass',
  'Meltdown',
  'Pocket universe',
  'Too much website',
  'Warp speed',
  'Earthquake',
  'Special delivery: meteor',
  'Catch me if you can',
  'Quantum button',
  'Double trouble',
  'Ant-sized problem',
  'Absolute unit',
  'Undercover button',
  'Boing protocol',
  'Invisible trouble',
  'Emotional damage',
  'Say please',
  'Target practice',
  'Three cherries',
  'Hold your horses',
  'Password protected',
  'It has teeth',
  'Error cascade',
  'Blue screen of nonsense',
  'Threat detected',
  'Definitely a terminal',
  'Updating: 99%',
  'Desktop invasion',
  'Take out the trash',
  'Installing more chaos',
  'Task mismanager',
  'Forbidden files',
  'Booting nonsenseOS',
  'Browser inception',
  'Window disagreement',
  'sudo remove button',
  'Unexpected reboot',
  'Gravity is a suggestion',
  'Up is the new down',
  'Collision course',
  'Local tornado',
  'Indoor ocean',
  'This is fine',
  'Event horizon',
  'Wrecking crew',
  'Unscheduled explosion',
  'Meteorological mistake',
  'Bullet time',
  'Freshly waxed',
  'Magnetic personality',
  'Rolling problem',
  'Ball pit incident',
  'A small visitor',
  'Maintenance department',
  'Buttonopolis',
  'A questionable religion',
  'Union negotiations',
  'Customer dissatisfaction',
  'Grand theft button',
  'Hard hats required',
  'Breaking nonsense',
  'Declaration of independence',
  'Cursor uprising',
  'A stranger knows',
  'Domestic button dispute',
  'Emotional support blob',
  'The other side',
  'Meteor dodge',
  'The great button escape',
  'Cursor boss',
  'Firewall breach',
  'Bullet ballet',
  'Perfectly offbeat',
  'Jump to conclusions',
  'Button defense force',
  'Exit strategy',
  'Rock. Paper. Button.',
  'You are being watched',
  'Please rewind',
  'Website nesting season',
  'Dimension B',
  'A very small solar system',
  '1984 called',
  'ASCII yourself',
  'Love at first click',
  'Premature credits',
  'I think, therefore I click',
  'THE ANGRY BUTTON',
  'THE PURGE',
  'BUTTON UNIVERSE',
  'INTERNET COLLAPSE',
  'THE FINAL PRESS',
  'Confetti liability',
  'Rubber duck debugging',
  'Emergency disco',
  'Snail mail',
  'Do not feed the toast',
  'Suspicious rain',
  'Bubble wrap therapy',
  'The floor is lava',
  'Cosmic aquarium',
  'Unrequested weather',
  'THE SYSTEM ADMINISTRATOR',
  'CHAOS ITSELF',
  'Memory leak: actual memories',
  'Paper airplane traffic',
  'Caution: wet pixels',
  'Pizza delivery',
  'Invisible ink',
  'The audience disapproves',
  'Time for a tea break',
  'You found the off switch',
];
export const gameIds = [26, 30, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 96, 111, 112];
export interface ChaosEvent {
  id: number;
  name: string;
  family?: string;
  category: Category;
  rarity: Rarity;
  minLevel: number;
  duration: number;
  incompatible: number[];
  trigger: (fn: (id: number) => void) => void;
  cleanup: (fn: (id: number) => void) => void;
}
const baseEvents: ChaosEvent[] = names.map((name, index) => {
  const id = index + 1;
  const category: Category =
    id <= 15
      ? 'Visual'
      : id <= 30
        ? 'Button'
        : id <= 45
          ? 'System'
          : id <= 60
            ? 'Physics'
            : id <= 75
              ? 'Living'
              : id <= 85
                ? 'Minigame'
                : id <= 95
                  ? 'Reality'
                  : id <= 100
                    ? 'Legendary'
                    : 'Wildcard';
  return {
    id,
    name,
    category,
    rarity:
      category === 'Legendary'
        ? 'legendary'
        : id % 11 === 0
          ? 'epic'
          : id % 5 === 0
            ? 'rare'
            : id % 3 === 0
              ? 'uncommon'
              : 'common',
    minLevel:
      id === 100
        ? 6
        : [111, 112].includes(id)
          ? 5
          : gameIds.includes(id)
            ? 3
            : category === 'Legendary'
              ? 5
              : category === 'Minigame' || category === 'Physics'
                ? 3
                : category === 'Reality'
                  ? 4
                  : category === 'Living'
                    ? 2
                    : id > 110
                      ? 4
                      : 1,
    duration: gameIds.includes(id) ? 0 : 14000,
    incompatible: gameIds.includes(id)
      ? gameIds
      : [1, 2, 3, 10, 11, 12, 14].includes(id)
        ? [1, 2, 3, 10, 11, 12, 14]
        : [],
    trigger: (fn) => fn(id),
    cleanup: (fn) => fn(id),
  };
});
export const events: ChaosEvent[] = [
  ...baseEvents,
  ...expansion.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    family: e.family,
    rarity: (e.variant === 4
      ? 'epic'
      : e.variant === 3
        ? 'rare'
        : e.variant === 1
          ? 'uncommon'
          : 'common') as Rarity,
    minLevel: 1 + Math.floor(e.variant / 2),
    duration: 60000,
    incompatible: [],
    trigger: (fn: (id: number) => void) => fn(e.id),
    cleanup: (fn: (id: number) => void) => fn(e.id),
  })),
  ...popupNames.map((name, i) => ({
    id: 271 + i,
    name,
    category: 'Popup' as Category,
    family: 'popup-' + Math.floor(i / 2),
    rarity: (i % 4 === 0 ? 'uncommon' : 'common') as Rarity,
    minLevel: 1,
    duration: 25000,
    incompatible: [],
    trigger: (fn: (id: number) => void) => fn(271 + i),
    cleanup: (fn: (id: number) => void) => fn(271 + i),
  })),
].map((event) => ({ ...event, duration: isWindowEvent(event.id) ? 0 : event.duration }));
export function levelFor(p: number) {
  return p <= 10 ? 1 : p <= 30 ? 2 : p <= 60 ? 3 : p <= 100 ? 4 : p <= 150 ? 5 : 6;
}
export function selectEvent(
  presses: number,
  recent: number[],
  active: number[],
  random = Math.random,
  discovered: number[] = [],
) {
  const compatible = (e: ChaosEvent) =>
    e.minLevel <= levelFor(presses) &&
    !active.includes(e.id) &&
    !e.incompatible.some((id) => active.includes(id));
  const recentFamilies = new Set(
    recent
      .slice(-8)
      .map((id) => events[id - 1]?.family)
      .filter(Boolean),
  );
  const eligible = events.filter(
    (e) =>
      compatible(e) &&
      !recent.slice(-35).includes(e.id) &&
      (!e.family || !recentFamilies.has(e.family)),
  );
  const relaxed = events.filter((e) => compatible(e) && !recent.slice(-18).includes(e.id));
  const pool = eligible.length ? eligible : relaxed.length ? relaxed : events.filter(compatible);
  const weights = { common: 55, uncommon: 25, rare: 12, epic: 6, legendary: 2 };
  const rarities = (Object.keys(weights) as Rarity[]).filter((r) =>
    pool.some((e) => e.rarity === r),
  );
  let roll = random() * rarities.reduce((s, r) => s + weights[r], 0);
  const rarity = rarities.find((r) => (roll -= weights[r]) < 0) ?? rarities[0];
  const choices = pool.filter((e) => e.rarity === rarity),
    unseen = choices.filter((e) => !discovered.includes(e.id));
  const candidates = unseen.length && random() < 0.88 ? unseen : choices;
  const kind = (e: ChaosEvent) =>
    e.category === 'Popup' || e.category === 'System'
      ? 'popup'
      : gameIds.includes(e.id) || e.family?.startsWith('expansion-')
        ? 'interactive'
        : 'spectacle';
  const mix = [
    { kind: 'popup', weight: 0.35 },
    { kind: 'spectacle', weight: 0.35 },
    { kind: 'interactive', weight: 0.3 },
  ].filter((g) => candidates.some((e) => kind(e) === g.kind));
  let mixRoll = random() * mix.reduce((total, g) => total + g.weight, 0);
  const selectedKind = mix.find((g) => (mixRoll -= g.weight) < 0)?.kind ?? mix[0]?.kind;
  const selection = candidates.filter((e) => kind(e) === selectedKind);
  return selection[Math.floor(random() * selection.length)] ?? events[0];
}
