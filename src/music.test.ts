import { afterEach, describe, expect, it, vi } from 'vitest';
import { MusicEngine, musicProfiles, musicState, musicStep } from './music';
import { initial, persist, readSave } from './persistence';

function fakeMusicAudio() {
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
  });
  const voices: {
    type: string;
    onended: (() => void) | null;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    frequency: ReturnType<typeof param>;
  }[] = [];
  const gains: {
    gain: ReturnType<typeof param>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  const source = () => {
    const node = {
      type: '',
      frequency: param(),
      buffer: null,
      onended: null,
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    voices.push(node);
    return node;
  };
  const ctx = {
    state: 'running',
    currentTime: 1,
    sampleRate: 1000,
    createGain: () => {
      const node = { gain: param(), connect: vi.fn(), disconnect: vi.fn() };
      gains.push(node);
      return node;
    },
    createBiquadFilter: () => ({
      type: 'lowpass',
      Q: param(),
      frequency: param(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
    createWaveShaper: () => ({
      curve: null,
      oversample: 'none',
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(500) }),
    createOscillator: source,
    createBufferSource: source,
  };
  return {
    ctx,
    voices,
    gains,
    output: { context: ctx as unknown as AudioContext, destination: {} as AudioNode },
    end: () => voices.forEach((voice) => voice.onended?.()),
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe('adaptive score', () => {
  it('advances at the game boundaries and also builds with playtime', () => {
    expect([0, 11, 31, 61, 101, 151].map((p) => musicState(p, 0).stage)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect([0, 180, 360, 540, 720, 900].map((t) => musicState(0, t).stage)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(musicState(0, 90).bpm).toBeGreaterThan(musicState(0, 0).bpm);
    expect(musicState(151, 0).bpm).toBeGreaterThan(musicState(0, 0).bpm);
    expect(musicState(NaN, NaN).stage).toBe(1);
  });
  it('adds musical layers and denser rhythms at each stage', () => {
    const scores = musicProfiles.map((_, i) =>
      Array.from({ length: 64 }, (_, step) => musicStep(i + 1, step)).flat(),
    );
    for (let i = 1; i < scores.length; i++)
      expect(scores[i].length).toBeGreaterThan(scores[i - 1].length);
    expect(scores[0].some((n) => n.instrument === 'kick')).toBe(false);
    expect(scores[1].some((n) => n.instrument === 'kick')).toBe(true);
    expect(scores[5].some((n) => n.instrument === 'glitch')).toBe(true);
    expect(scores[5].some((n) => n.offset === 0.5)).toBe(true);
    for (const score of scores)
      for (const note of score) {
        expect(note.velocity).toBeGreaterThan(0);
        expect(note.velocity).toBeLessThanOrEqual(0.3);
        expect(note.length).toBeGreaterThan(0);
      }
  });
  it('uses a deterministic score and bounds musical tempo', () => {
    expect(musicStep(6, 30)).toEqual(musicStep(6, 30));
    expect(musicState(10000, 10000).bpm).toBeLessThanOrEqual(188);
  });
});
describe('music scheduler lifecycle', () => {
  it('waits for the existing audio context instead of bypassing autoplay', () => {
    vi.useFakeTimers();
    const output = vi.fn(() => undefined);
    const engine = new MusicEngine(output);
    engine.configure({ enabled: true, volume: 0.4, stage: 1, bpm: 68 });
    vi.advanceTimersByTime(200);
    expect(output).toHaveBeenCalled();
    engine.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('schedules notes on the shared graph and cleans nodes and timers', () => {
    vi.useFakeTimers();
    const fake = fakeMusicAudio(),
      engine = new MusicEngine(() => fake.output);
    engine.configure({ enabled: true, volume: 0.4, stage: 1, bpm: 68 });
    expect(fake.voices.length).toBeGreaterThan(0);
    expect(fake.voices.every((voice) => voice.start.mock.calls[0][0] > fake.ctx.currentTime)).toBe(
      true,
    );
    fake.end();
    expect(fake.voices.every((voice) => voice.disconnect.mock.calls.length > 0)).toBe(true);
    engine.dispose();
    expect(vi.getTimerCount()).toBe(0);
    expect(fake.gains[0].disconnect).toHaveBeenCalled();
  });
  it('keeps one scheduler across updates and stops immediately when disabled', () => {
    vi.useFakeTimers();
    const fake = fakeMusicAudio(),
      engine = new MusicEngine(() => fake.output);
    for (let i = 0; i < 50; i++)
      engine.configure({ enabled: true, volume: 0.3, stage: 6, bpm: 180 });
    expect(vi.getTimerCount()).toBe(1);
    const count = fake.voices.length;
    engine.configure({ enabled: false, volume: 0.3, stage: 6, bpm: 180 });
    expect(vi.getTimerCount()).toBe(0);
    expect(fake.voices.every((voice) => voice.stop.mock.calls.length === 2)).toBe(true);
    fake.ctx.currentTime = 30;
    vi.advanceTimersByTime(1000);
    expect(fake.voices).toHaveLength(count);
    engine.dispose();
  });
  it('caps concurrent music voices when the browser is delayed', () => {
    vi.useFakeTimers();
    const fake = fakeMusicAudio(),
      engine = new MusicEngine(() => fake.output);
    engine.configure({ enabled: true, volume: 0.4, stage: 6, bpm: 180 });
    for (let i = 0; i < 200; i++) {
      fake.ctx.currentTime += 0.04;
      engine.pump();
    }
    expect(fake.voices.length).toBeLessThanOrEqual(40);
    engine.dispose();
  });
});
describe('saved music preferences', () => {
  it('migrates older saves and preserves independent music settings', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
    store.set('chaos-button-v1', JSON.stringify({ presses: 44 }));
    expect(readSave().musicEnabled).toBe(true);
    expect(readSave().musicVolume).toBe(0.45);
    persist({ ...initial, presses: 44, musicEnabled: false, musicVolume: 0.2 });
    expect(readSave().musicEnabled).toBe(false);
    expect(readSave().musicVolume).toBe(0.2);
  });
});
