import { isWindowEvent } from './windows';
import { describe, it, expect, vi } from 'vitest';
import { events, levelFor, selectEvent, gameIds } from './events';
import { initial, readSave, persist, achievementRules } from './persistence';
import { expansion, packs } from './expansion';
import { arcade } from './arcade';
import { world } from './worlds';
import { initState, type SimContext } from './simulation';
import { popupNames } from './popups';

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
describe('event registry', () => {
  it('registers 294 unique, reversible events', () => {
    expect(events).toHaveLength(294);
    expect(new Set(events.map((e) => e.id)).size).toBe(294);
    for (const e of events) {
      const activate = vi.fn(),
        remove = vi.fn();
      e.trigger(activate);
      e.cleanup(remove);
      expect(activate).toHaveBeenCalledWith(e.id);
      expect(remove).toHaveBeenCalledWith(e.id);
      expect(e.duration > 0 || gameIds.includes(e.id) || isWindowEvent(e.id)).toBe(true);
    }
  });
  it('honors every progression boundary', () => {
    expect([0, 10, 11, 30, 31, 60, 61, 100, 101, 150, 151, 500].map(levelFor)).toEqual([
      1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    ]);
  });
  it('excludes recent and incompatible events', () => {
    const recent: number[] = [];
    const random = seededRandom(12345);
    for (let i = 0; i < 2000; i++) {
      const event = selectEvent(i % 200, recent, [96], random);
      expect(event.minLevel).toBeLessThanOrEqual(levelFor(i % 200));
      expect(event.incompatible).not.toContain(96);
      expect(event.id).not.toBe(96);
      expect(recent.slice(-18)).not.toContain(event.id);
      recent.push(event.id);
    }
  });
  it('makes every rarity and event reachable at maximum level', () => {
    // Exercise each rarity's probability range, with one remaining discovery.
    // Random sampling cannot guarantee that every rare event appears in CI.
    const rarityRoll = { common: 0.275, uncommon: 0.675, rare: 0.86, epic: 0.95, legendary: 0.99 };
    for (const target of events) {
      let draws = 0;
      const random = () => (draws++ === 0 ? rarityRoll[target.rarity] : 0);
      const discovered = events.filter((event) => event.id !== target.id).map((event) => event.id);
      expect(selectEvent(151, [], [], random, discovered).id).toBe(target.id);
    }
  });
});
describe('150-event expansion', () => {
  it('includes 24 non-game popup events and mixes incident types', () => {
    expect(popupNames).toHaveLength(24);
    expect(events.filter((e) => e.category === 'Popup')).toHaveLength(24);
    const counts = { popup: 0, interactive: 0, spectacle: 0 };
    const random = seededRandom(67890);
    for (let i = 0; i < 4000; i++) {
      const e = selectEvent(151, [], [], random);
      const kind =
        e.category === 'Popup' || e.category === 'System'
          ? 'popup'
          : gameIds.includes(e.id) || e.family?.startsWith('expansion-')
            ? 'interactive'
            : 'spectacle';
      counts[kind]++;
    }
    expect(counts.popup / 4000).toBeGreaterThan(0.25);
    expect(counts.interactive / 4000).toBeLessThan(0.42);
    expect(counts.spectacle / 4000).toBeGreaterThan(0.25);
  });
  it('adds thirty mechanic families with five authored variants each', () => {
    expect(packs).toHaveLength(30);
    expect(new Set(packs.map((p) => p.mechanic)).size).toBe(30);
    expect(expansion).toHaveLength(150);
    expect(new Set(expansion.map((e) => e.name)).size).toBe(150);
    for (const p of packs) expect(p.names).toHaveLength(5);
  });
  it('runs every canvas variation through its actual simulation', () => {
    const dom = ['wires', 'sort', 'simon', 'lights', 'type', 'safe', 'cookie', 'alchemy', 'garden'];
    for (const event of expansion.filter((e) => !dom.includes(e.mechanic))) {
      const ctx = new Proxy(
        {},
        { get: () => () => {}, set: () => true },
      ) as CanvasRenderingContext2D;
      const c: SimContext = {
        ctx,
        s: initState(),
        p: { x: 300, y: 130, down: true, clicked: true, released: false, startX: 0, startY: 0 },
        v: event.variant,
        color: event.color,
        dt: 1 / 60,
        random: () => 0.4,
      };
      c.s.time = 1;
      expect(arcade(event.mechanic, c) || world(event.mechanic, c)).toBe(true);
      expect(Number.isFinite(c.s.score)).toBe(true);
      expect(Number.isFinite(c.s.health)).toBe(true);
    }
  });
  it('cools down a recently played mechanic family', () => {
    const random = seededRandom(24680);
    for (let i = 0; i < 300; i++) {
      const e = selectEvent(151, [121], [], random);
      expect(e.family).not.toBe('expansion-whack');
    }
  });
  it('prioritizes undiscovered content within the selected rarity', () => {
    const seen = events.filter((e) => e.id !== 121).map((e) => e.id);
    const chosen = selectEvent(151, [], [], () => 0, seen);
    expect(chosen.id).toBe(121);
  });
  it('has reachable success and failure states in the arcade simulations', () => {
    const ctx = new Proxy({}, { get: () => () => {}, set: () => true }) as CanvasRenderingContext2D;
    const c: SimContext = {
      ctx,
      s: initState(),
      p: { x: 300, y: 130, down: false, clicked: false, released: false, startX: 0, startY: 0 },
      v: 0,
      color: '#fff',
      dt: 0.016,
      random: () => 0.5,
    };
    c.s.time = 12.1;
    arcade('balance', c);
    expect(c.s.won).toBe(true);
    c.s = initState();
    c.s.data = { x: 590, vx: 0 };
    arcade('balance', c);
    expect(c.s.ended).toBe(true);
    expect(c.s.won).toBe(false);
  });
});
describe('persistence and achievements', () => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
  });
  it('round trips progress and settings', () => {
    const s = {
      ...initial,
      presses: 152,
      discovered: [1, 96],
      victories: [96],
      muted: false,
      volume: 0.8,
    };
    persist(s);
    expect(readSave()).toEqual(s);
  });
  it('recovers corrupt and old saves', () => {
    store.set('chaos-button-v1', 'broken');
    expect(readSave().presses).toBe(0);
    store.set('chaos-button-v1', JSON.stringify({ presses: 10 }));
    expect(readSave().achievements).toEqual([]);
    store.set('chaos-button-v1', JSON.stringify({ presses: -4, discovered: 'bad' }));
    expect(readSave().presses).toBe(0);
    expect(readSave().discovered).toEqual([]);
  });
  it('includes 40+ distinct achievements and evaluates milestones', () => {
    expect(achievementRules.length).toBeGreaterThanOrEqual(40);
    expect(new Set(achievementRules.map((a) => a.id)).size).toBe(achievementRules.length);
    expect(
      achievementRules.find((a) => a.id === 'press100')!.test({ ...initial, presses: 100 }),
    ).toBe(true);
    expect(
      achievementRules.find((a) => a.id === 'boss112')!.test({ ...initial, victories: [112] }),
    ).toBe(true);
  });
});
