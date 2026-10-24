export type Sfx =
  | 'press'
  | 'click'
  | 'hover'
  | 'toggle'
  | 'slider'
  | 'type'
  | 'open'
  | 'close'
  | 'grab'
  | 'drop'
  | 'restore'
  | 'restart'
  | 'charge'
  | 'rare'
  | 'error'
  | 'achievement'
  | 'win'
  | 'lose'
  | 'hit'
  | 'shoot'
  | 'boss'
  | 'phase'
  | 'explosion'
  | 'bounce'
  | 'whoosh'
  | 'glitch'
  | 'portal'
  | 'glass'
  | 'water'
  | 'fire'
  | 'wind'
  | 'magic'
  | 'grow'
  | 'coin'
  | 'pop'
  | 'tick'
  | 'note'
  | 'connect'
  | 'scratch'
  | 'paint'
  | 'vacuum'
  | 'launch'
  | 'reel'
  | 'plant'
  | 'chop'
  | 'horn'
  | 'notification';
interface Tone {
  frequency: number;
  end?: number;
  duration: number;
  delay?: number;
  gain?: number;
  wave?: OscillatorType;
  noise?: boolean;
}
const tone = (
  frequency: number,
  end: number,
  duration = 0.12,
  wave: OscillatorType = 'sine',
  delay = 0,
  gain = 0.16,
): Tone => ({ frequency, end, duration, wave, delay, gain });
const noise = (frequency: number, duration = 0.15, gain = 0.15, delay = 0): Tone => ({
  frequency,
  duration,
  gain,
  delay,
  noise: true,
});
const notes = (frequencies: number[], duration = 0.1, wave: OscillatorType = 'sine'): Tone[] =>
  frequencies.map((frequency, i) => tone(frequency, frequency, duration, wave, i * 0.085));
export const sfxCatalog: Record<Sfx, Tone[]> = {
  press: [tone(135, 38, 0.16, 'triangle', 0, 0.3), noise(1700, 0.035, 0.12)],
  click: [tone(900, 560, 0.035, 'triangle', 0, 0.1)],
  hover: [tone(1300, 1500, 0.025, 'sine', 0, 0.035)],
  toggle: notes([430, 680], 0.045, 'triangle'),
  slider: [tone(520, 590, 0.025, 'sine', 0, 0.08)],
  type: [noise(2700, 0.018, 0.055), tone(740, 590, 0.023, 'triangle', 0, 0.035)],
  open: notes([240, 360, 540], 0.07, 'triangle'),
  close: [tone(570, 170, 0.11, 'triangle', 0, 0.13)],
  grab: [tone(230, 290, 0.055, 'triangle', 0, 0.1)],
  drop: [tone(130, 55, 0.09, 'triangle', 0, 0.16), noise(700, 0.025, 0.05)],
  restore: notes([160, 240, 320, 480, 640], 0.15, 'triangle'),
  restart: notes([510, 340, 510], 0.07),
  charge: [tone(140, 1100, 0.45, 'triangle', 0, 0.1)],
  rare: [...notes([330, 495, 660, 990, 1320], 0.2), noise(4500, 0.2, 0.025, 0.2)],
  error: [tone(170, 140, 0.11, 'sawtooth', 0, 0.08), tone(170, 95, 0.16, 'sawtooth', 0.14, 0.08)],
  achievement: notes([523, 659, 784, 1047], 0.22, 'triangle'),
  win: notes([392, 494, 587, 784, 988], 0.24, 'triangle'),
  lose: notes([330, 277, 220, 130], 0.24, 'triangle'),
  hit: [noise(700, 0.11, 0.16), tone(120, 45, 0.13, 'triangle', 0, 0.2)],
  shoot: [tone(1050, 190, 0.07, 'square', 0, 0.045)],
  boss: [tone(65, 95, 0.3, 'sawtooth', 0, 0.08), tone(98, 65, 0.35, 'triangle', 0.12, 0.18)],
  phase: [...notes([147, 196, 294], 0.17, 'sawtooth'), noise(900, 0.2, 0.07)],
  explosion: [noise(200, 0.5, 0.32), tone(90, 22, 0.45, 'triangle', 0, 0.3)],
  bounce: [tone(230, 700, 0.085, 'sine', 0, 0.14)],
  whoosh: [noise(2300, 0.22, 0.13)],
  glitch: [
    tone(870, 45, 0.045, 'square', 0, 0.045),
    noise(3600, 0.055, 0.09),
    tone(180, 1800, 0.05, 'square', 0.08, 0.05),
  ],
  portal: [tone(110, 880, 0.45, 'sine', 0, 0.13), tone(164, 1318, 0.5, 'triangle', 0.08, 0.07)],
  glass: [noise(7500, 0.2, 0.1), ...notes([2200, 2870, 3310], 0.06)],
  water: [tone(440, 170, 0.16, 'sine', 0, 0.12), noise(1700, 0.17, 0.045)],
  fire: [noise(450, 0.35, 0.1), noise(2500, 0.06, 0.04, 0.12)],
  wind: [noise(800, 0.45, 0.09)],
  magic: notes([659, 988, 1318], 0.15),
  grow: [tone(180, 610, 0.22, 'sine', 0, 0.12)],
  coin: notes([988, 1480], 0.12, 'square'),
  pop: [tone(520, 85, 0.065, 'sine', 0, 0.2)],
  tick: [tone(1250, 950, 0.025, 'square', 0, 0.035)],
  note: [tone(440, 440, 0.16, 'triangle', 0, 0.15)],
  connect: notes([390, 780], 0.075, 'triangle'),
  scratch: [noise(3200, 0.08, 0.065)],
  paint: [noise(1600, 0.065, 0.045)],
  vacuum: [tone(85, 130, 0.13, 'sawtooth', 0, 0.045), noise(450, 0.12, 0.035)],
  launch: [tone(160, 1100, 0.15, 'triangle', 0, 0.12), noise(1900, 0.1, 0.07)],
  reel: [tone(700, 280, 0.12, 'triangle', 0, 0.1)],
  plant: [tone(180, 340, 0.08, 'sine', 0, 0.13)],
  chop: [noise(950, 0.045, 0.12), tone(140, 70, 0.055, 'triangle', 0, 0.12)],
  horn: [tone(233, 233, 0.13, 'sawtooth', 0, 0.035), tone(294, 294, 0.13, 'sawtooth', 0, 0.035)],
  notification: notes([740, 988], 0.14),
};
const cooldowns: Partial<Record<Sfx, number>> = {
  hover: 110,
  type: 45,
  slider: 75,
  shoot: 90,
  hit: 140,
  bounce: 120,
  tick: 130,
  note: 55,
  coin: 85,
  pop: 90,
  scratch: 100,
  paint: 100,
  vacuum: 150,
  water: 140,
  wind: 350,
  fire: 300,
  glitch: 180,
  notification: 220,
  click: 40,
  connect: 75,
  plant: 100,
  grow: 150,
};
const priority = new Set<Sfx>(['win', 'lose', 'achievement', 'rare', 'restore', 'close', 'phase']);
export interface SoundOptions {
  pitch?: number;
  intensity?: number;
}

/** One shared, bounded mixer for an intentionally unbounded number of windows. */
export class SoundEngine {
  private context: AudioContext | undefined;
  private master: GainNode | undefined;
  private compressor: DynamicsCompressorNode | undefined;
  private settings = { muted: true, volume: 0.35 };
  private last = new Map<Sfx, number>();
  private voices = new Set<AudioScheduledSourceNode>();
  private noiseBuffer: AudioBuffer | undefined;
  private recent: number[] = [];
  constructor(
    private factory = () => new AudioContext(),
    private clock = () => performance.now(),
  ) {}
  configure(muted: boolean, volume: number) {
    this.settings = {
      muted,
      volume: Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0.35,
    };
    if (this.master && this.context) {
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(muted ? 0 : this.settings.volume, now, 0.008);
    }
    if (muted) {
      for (const voice of this.voices) {
        try {
          voice.stop();
        } catch {
          /* Already ended. */
        }
      }
      this.last.clear();
      this.recent = [];
    }
  }
  unlock() {
    try {
      if (!this.context) {
        this.context = this.factory();
        this.master = this.context.createGain();
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -18;
        this.compressor.knee.value = 18;
        this.compressor.ratio.value = 6;
        this.compressor.attack.value = 0.004;
        this.compressor.release.value = 0.14;
        this.master.gain.value = this.settings.muted ? 0 : this.settings.volume;
        this.master.connect(this.compressor);
        this.compressor.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
    } catch {
      /* Audio unavailable: gameplay remains functional. */
    }
  }
  musicOutput() {
    return this.context?.state === 'running' && this.master
      ? { context: this.context, destination: this.master }
      : undefined;
  }
  play(kind: Sfx, options: SoundOptions = {}) {
    if (this.settings.muted || this.settings.volume === 0) return false;
    const stamp = this.clock();
    if (stamp - (this.last.get(kind) ?? -Infinity) < (cooldowns[kind] ?? 45)) return false;
    this.recent = this.recent.filter((time) => stamp - time < 1000);
    if (!priority.has(kind) && (this.recent.length >= 38 || this.voices.size >= 28)) return false;
    if (priority.has(kind) && this.voices.size > 20) {
      for (const voice of this.voices) {
        try {
          voice.stop();
        } catch {
          /* Already ended. */
        }
        this.voices.delete(voice);
        if (this.voices.size <= 20) break;
      }
    }
    this.unlock();
    const ctx = this.context,
      master = this.master;
    if (!ctx || !master || ctx.state === 'closed') return false;
    const pitch = Math.max(0.25, Math.min(4, options.pitch ?? 1)),
      intensity = Math.max(0, Math.min(1, options.intensity ?? 1));
    this.last.set(kind, stamp);
    this.recent.push(stamp);
    try {
      for (const spec of sfxCatalog[kind]) {
        if (this.voices.size >= 28) break;
        const start = ctx.currentTime + (spec.delay ?? 0),
          duration = spec.duration,
          gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(
          Math.max(0.0001, (spec.gain ?? 0.12) * intensity),
          start + 0.005,
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        gain.connect(master);
        let source: AudioScheduledSourceNode, filter: BiquadFilterNode | undefined;
        if (spec.noise) {
          if (!this.noiseBuffer) {
            this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
            const data = this.noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
          }
          const buffer = ctx.createBufferSource();
          buffer.buffer = this.noiseBuffer;
          filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(Math.min(16000, spec.frequency * pitch), start);
          filter.Q.value = 0.7;
          buffer.connect(filter);
          filter.connect(gain);
          source = buffer;
        } else {
          const oscillator = ctx.createOscillator();
          oscillator.type = spec.wave ?? 'sine';
          oscillator.frequency.setValueAtTime(Math.max(20, spec.frequency * pitch), start);
          oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(20, (spec.end ?? spec.frequency) * pitch),
            start + duration,
          );
          oscillator.connect(gain);
          source = oscillator;
        }
        this.voices.add(source);
        source.onended = () => {
          source.disconnect();
          filter?.disconnect();
          gain.disconnect();
          this.voices.delete(source);
        };
        source.start(start);
        source.stop(start + duration + 0.01);
      }
      return true;
    } catch {
      return false;
    }
  }
}
export const audio = new SoundEngine();
export const configureSound = (muted: boolean, volume: number) => audio.configure(muted, volume);
export const playSfx = (kind: Sfx, options?: SoundOptions) => audio.play(kind, options);
export function sound(kind: Sfx, muted: boolean, volume: number) {
  audio.configure(muted, volume);
  return audio.play(kind);
}

export function eventSfx(event: { id: number; category: string; rarity: string }): Sfx {
  if (event.rarity === 'legendary') return 'rare';
  if ([15, 54, 55, 76].includes(event.id)) return 'explosion';
  if ([7].includes(event.id)) return 'glass';
  if ([49, 47, 59].includes(event.id)) return 'wind';
  if (event.id === 50) return 'water';
  if (event.id === 51) return 'fire';
  if ([52, 75, 89, 98].includes(event.id)) return 'portal';
  if ([30, 78, 96, 111, 112].includes(event.id)) return 'boss';
  if ([4, 6, 14, 86, 87, 91, 92, 95].includes(event.id)) return 'glitch';
  if (event.id === 60 || event.id === 22) return 'bounce';
  if (event.category === 'Popup' || event.category === 'System') return 'open';
  if (event.category === 'Living') return 'notification';
  if (event.category === 'Minigame' || ['Arcade', 'Puzzle', 'Trap'].includes(event.category))
    return 'charge';
  if (event.category === 'World' || event.category === 'Toy') return 'magic';
  return 'whoosh';
}
