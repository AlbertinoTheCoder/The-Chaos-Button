import { describe, expect, it, vi } from 'vitest';
import { SoundEngine, eventSfx, sfxCatalog, type Sfx } from './sound';
import { events } from './events';
import { mechanicAudio } from './gameAudio';
import { packs } from './expansion';

function fakeAudio() {
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
    setTargetAtTime: vi.fn(),
  });
  const sources: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    onended: (() => void) | null;
    frequency: ReturnType<typeof param>;
  }[] = [];
  const gains: {
    gain: ReturnType<typeof param>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  const source = () => {
    const node = {
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      connect: vi.fn(),
      onended: null,
      frequency: param(),
      type: 'sine',
      buffer: null,
    };
    sources.push(node);
    return node;
  };
  const context = {
    state: 'running',
    currentTime: 0,
    sampleRate: 1000,
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    createGain: () => {
      const node = { gain: param(), connect: vi.fn(), disconnect: vi.fn() };
      gains.push(node);
      return node;
    },
    createDynamicsCompressor: () => ({
      threshold: param(),
      knee: param(),
      ratio: param(),
      attack: param(),
      release: param(),
      connect: vi.fn(),
    }),
    createOscillator: source,
    createBufferSource: source,
    createBuffer: () => ({ getChannelData: () => new Float32Array(1000) }),
    createBiquadFilter: () => ({
      type: 'lowpass',
      frequency: param(),
      Q: param(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
  };
  return {
    context: context as unknown as AudioContext,
    sources,
    gains,
    finish: () => sources.forEach((source) => source.onended?.()),
  };
}

describe('procedural sound mixer', () => {
  it('stays silent and creates no audio context while muted', () => {
    const factory = vi.fn();
    const engine = new SoundEngine(factory);
    expect(engine.play('press')).toBe(false);
    expect(factory).not.toHaveBeenCalled();
  });
  it('synthesizes every catalog cue with bounded durations and cleans its nodes', () => {
    const mock = fakeAudio();
    let now = 0;
    const engine = new SoundEngine(
      () => mock.context,
      () => now,
    );
    engine.configure(false, 0.4);
    for (const kind of Object.keys(sfxCatalog) as Sfx[]) {
      now += 1000;
      expect(engine.play(kind)).toBe(true);
      mock.finish();
      for (const tone of sfxCatalog[kind]) {
        expect(tone.duration).toBeGreaterThan(0);
        expect(tone.duration).toBeLessThanOrEqual(0.5);
      }
    }
    expect(
      mock.sources.every(
        (source) => source.start.mock.calls.length === 1 && source.disconnect.mock.calls.length > 0,
      ),
    ).toBe(true);
  });
  it('applies volume immediately and stops active sounds on mute', () => {
    const mock = fakeAudio();
    const engine = new SoundEngine(() => mock.context);
    engine.configure(false, 0.25);
    engine.play('open');
    expect(mock.gains[0].gain.value).toBe(0.25);
    engine.configure(false, 0.75);
    expect(mock.gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(0.75, 0, 0.008);
    engine.configure(true, 0.75);
    expect(mock.gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, 0.008);
    expect(mock.sources.every((source) => source.stop.mock.calls.length === 2)).toBe(true);
    expect(engine.play('win')).toBe(false);
  });
  it('rate-limits repeated cues and caps concurrent voices', () => {
    const mock = fakeAudio();
    let now = 0;
    const engine = new SoundEngine(
      () => mock.context,
      () => now,
    );
    engine.configure(false, 1);
    expect(engine.play('click')).toBe(true);
    expect(engine.play('click')).toBe(false);
    for (let i = 0; i < 100; i++) {
      now += 60;
      engine.play('click');
    }
    expect(mock.sources).toHaveLength(28);
    expect(engine.play('win')).toBe(true);
    expect(
      mock.sources.filter((source) => source.stop.mock.calls.length > 1).length,
    ).toBeGreaterThan(0);
  });
  it('clamps invalid volume and handles unavailable audio without disrupting gameplay', () => {
    const mock = fakeAudio();
    const engine = new SoundEngine(() => mock.context);
    engine.configure(false, 7);
    engine.play('click');
    expect(mock.gains[0].gain.value).toBe(1);
    engine.configure(false, -5);
    expect(engine.play('click')).toBe(false);
    const missing = new SoundEngine(() => {
      throw new Error('No audio device');
    });
    missing.configure(false, 1);
    expect(() => missing.play('win')).not.toThrow();
    expect(missing.play('win')).toBe(false);
  });
  it('assigns a valid trigger cue to all 294 events and feedback to every mechanic', () => {
    for (const event of events) expect(sfxCatalog[eventSfx(event)]).toBeDefined();
    for (const pack of packs) {
      expect(sfxCatalog[mechanicAudio[pack.mechanic].action]).toBeDefined();
      expect(sfxCatalog[mechanicAudio[pack.mechanic].score]).toBeDefined();
    }
  });
});
