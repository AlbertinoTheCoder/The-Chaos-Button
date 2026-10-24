import { describe, expect, it } from 'vitest';
import { closeWindow, isWindowEvent, openWindow, type ChaosWindow } from './windows';
import { events } from './events';

describe('player-owned windows', () => {
  it('retains every window without a capacity limit, including duplicate events', () => {
    let windows: ChaosWindow[] = [];
    for (let key = 1; key <= 150; key++) windows = openWindow(windows, 271, key);
    expect(windows).toHaveLength(150);
    expect(windows[0]).toEqual({ eventId: 271, key: 1 });
    expect(new Set(windows.map((window) => window.key)).size).toBe(150);
  });
  it('closes only the selected instance', () => {
    const windows = [
      { key: 1, eventId: 271 },
      { key: 2, eventId: 271 },
      { key: 3, eventId: 131 },
    ];
    expect(closeWindow(windows, 2)).toEqual([windows[0], windows[2]]);
    expect(windows).toHaveLength(3);
  });
  it('gives all window types a player-controlled lifetime while retaining temporary effects', () => {
    for (const event of events.filter((event) => isWindowEvent(event.id)))
      expect(event.duration).toBe(0);
    expect(events.find((event) => event.id === 3)!.duration).toBeGreaterThan(0);
    expect(isWindowEvent(96)).toBe(false);
    expect(isWindowEvent(111)).toBe(false);
  });
});
