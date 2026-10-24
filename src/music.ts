import { levelFor } from './events';

export const musicProfiles = [
  { name: 'Suspiciously calm', bpm: 68, filter: 1200, distortion: 0 },
  { name: 'Something is off', bpm: 86, filter: 2200, distortion: 0.5 },
  { name: 'Loose screws', bpm: 108, filter: 3800, distortion: 2 },
  { name: 'Panic at the mainframe', bpm: 132, filter: 6200, distortion: 5 },
  { name: 'Reality has a bass drop', bpm: 156, filter: 9500, distortion: 10 },
  { name: 'The beat has escaped containment', bpm: 180, filter: 13000, distortion: 16 },
];
export function musicState(presses: number, seconds: number) {
  presses = Number.isFinite(presses) ? Math.max(0, presses) : 0;
  seconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const pressStage = levelFor(presses),
    timeStage = Math.min(6, 1 + Math.floor(Math.max(0, seconds) / 180));
  const stage = Math.max(pressStage, timeStage),
    starts = [0, 11, 31, 61, 101, 151],
    ends = [11, 31, 61, 101, 151, 251];
  const pressProgress = Math.min(
      1,
      Math.max(0, (presses - starts[stage - 1]) / (ends[stage - 1] - starts[stage - 1])),
    ),
    timeProgress = (Math.max(0, seconds) % 180) / 180;
  const progress =
    pressStage > timeStage
      ? pressProgress
      : pressStage === timeStage
        ? Math.max(pressProgress, timeProgress)
        : timeProgress;
  const profile = musicProfiles[stage - 1],
    next = musicProfiles[Math.min(5, stage)];
  return {
    stage,
    bpm: Math.round(profile.bpm + ((stage === 6 ? 188 : next.bpm) - profile.bpm) * progress),
    name: profile.name,
  };
}
export interface MusicNote {
  instrument: 'pad' | 'bell' | 'bass' | 'lead' | 'kick' | 'snare' | 'hat' | 'glitch';
  midi?: number;
  length: number;
  velocity: number;
  offset?: number;
}
const chords = [
  { root: 45, notes: [0, 3, 7, 10] },
  { root: 41, notes: [0, 4, 7, 11] },
  { root: 48, notes: [0, 4, 7, 11] },
  { root: 43, notes: [0, 4, 7, 10] },
];

/** A deterministic 4-bar score, adding rhythm, syncopation and dissonance per tier. */
export function musicStep(stage: number, absoluteStep: number): MusicNote[] {
  const tier = Math.max(1, Math.min(6, Math.floor(stage))),
    step = absoluteStep % 16,
    bar = Math.floor(absoluteStep / 16),
    chord = chords[bar % 4],
    notes: MusicNote[] = [];
  const add = (
    instrument: MusicNote['instrument'],
    midi: number | undefined,
    length: number,
    velocity: number,
    offset = 0,
  ) => notes.push({ instrument, midi, length, velocity, offset });
  if (step === 0) {
    chord.notes
      .slice(0, tier < 3 ? 3 : 4)
      .forEach((interval) => add('pad', chord.root + 12 + interval, tier < 3 ? 3.5 : 1.7, 0.025));
  }
  if (tier === 1) {
    if ([0, 6, 12].includes(step))
      add('bell', chord.root + 24 + chord.notes[((bar + step / 6) % 4) | 0], 0.7, 0.1);
    if (step === 0) add('bass', chord.root - 12, 0.5, 0.11);
    return notes;
  }
  if (
    step % 8 === 0 ||
    (tier >= 3 && step === 6) ||
    (tier >= 4 && step === 10) ||
    (tier >= 5 && [3, 14].includes(step))
  )
    add('kick', undefined, 0.19, 0.3);
  if (step === 4 || step === 12 || (tier >= 5 && step === 15))
    add('snare', undefined, 0.12, step === 15 ? 0.08 : 0.16);
  if (step % (tier >= 4 ? 1 : 2) === 0)
    add('hat', undefined, step % 2 ? 0.035 : 0.055, step % 4 === 0 ? 0.07 : 0.035);
  if (step % (tier >= 3 ? 2 : 4) === 0 || (tier >= 5 && step % 4 === 3))
    add('bass', chord.root + (step === 6 ? 7 : step === 14 ? 12 : 0), 0.14, tier < 4 ? 0.12 : 0.1);
  if (step % (tier >= 4 ? 1 : tier >= 3 ? 2 : 4) === 0) {
    const motif = [0, 2, 1, 3, 2, 0, 3, 1],
      interval = chord.notes[motif[(step + bar) % 8]],
      detune = tier >= 5 && step >= 13 ? (step % 2 ? 1 : -1) : 0;
    add(
      'lead',
      chord.root + 24 + interval + detune,
      tier < 4 ? 0.2 : 0.075,
      tier < 4 ? 0.065 : 0.045,
    );
  }
  if (tier >= 4 && step % 3 === 0)
    add('bell', chord.root + 36 + chord.notes[((step / 3 + bar) % 4) | 0], 0.18, 0.04);
  if (tier >= 5 && step >= 14) {
    add('glitch', chord.root + 36 + (step % 2 ? 1 : 6), 0.045, 0.035);
    if (tier === 6) add('glitch', chord.root + 24 + step, 0.035, 0.03, 0.5);
  }
  if (tier === 6 && [5, 11, 15].includes(step)) add('snare', undefined, 0.045, 0.065, 0.5);
  return notes;
}

export interface MusicOutput {
  context: AudioContext;
  destination: AudioNode;
}
export interface MusicSettings {
  enabled: boolean;
  volume: number;
  stage: number;
  bpm: number;
}
export class MusicEngine {
  private settings: MusicSettings = { enabled: false, volume: 0.4, stage: 1, bpm: 68 };
  private timer: ReturnType<typeof setInterval> | undefined;
  private context: AudioContext | undefined;
  private gain: GainNode | undefined;
  private filter: BiquadFilterNode | undefined;
  private distortion: WaveShaperNode | undefined;
  private noise: AudioBuffer | undefined;
  private voices = new Set<AudioScheduledSourceNode>();
  private nextTime = 0;
  private step = 0;
  private playingStage = 1;
  private playingBpm = 68;
  private graphStage = 0;
  constructor(private output: () => MusicOutput | undefined) {}
  configure(settings: MusicSettings) {
    this.settings = {
      ...settings,
      volume: Math.max(0, Math.min(1, Number.isFinite(settings.volume) ? settings.volume : 0.4)),
      stage: Math.max(1, Math.min(6, Math.floor(settings.stage))),
      bpm: Math.max(50, Math.min(200, settings.bpm)),
    };
    if (!settings.enabled || this.settings.volume === 0) {
      this.stop();
      return;
    }
    if (this.gain && this.context)
      this.gain.gain.setTargetAtTime(this.settings.volume * 0.65, this.context.currentTime, 0.12);
    if (this.timer === undefined) {
      this.nextTime = 0;
      this.timer = setInterval(() => this.pump(), 40);
      this.pump();
    }
  }
  private attach(output: MusicOutput) {
    const { context: ctx, destination } = output;
    this.context = ctx;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.Q.value = 0.7;
    this.distortion = ctx.createWaveShaper();
    this.distortion.oversample = '2x';
    this.gain = ctx.createGain();
    this.gain.gain.setValueAtTime(0, ctx.currentTime);
    this.gain.gain.setTargetAtTime(this.settings.volume * 0.65, ctx.currentTime, 0.25);
    this.filter.connect(this.distortion);
    this.distortion.connect(this.gain);
    this.gain.connect(destination);
    this.graphStage = 0;
  }
  private setTimbre(stage: number) {
    if (!this.context || !this.filter || !this.distortion || this.graphStage === stage) return;
    this.graphStage = stage;
    const profile = musicProfiles[stage - 1];
    this.filter.frequency.setTargetAtTime(profile.filter, this.context.currentTime, 0.4);
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = ((1 + profile.distortion) * x) / (1 + profile.distortion * Math.abs(x));
    }
    this.distortion.curve = curve;
  }
  /** Schedule slightly ahead on the audio clock, never on animation frames. */
  pump() {
    if (!this.settings.enabled || this.settings.volume === 0) return;
    const output = this.output();
    if (!output || output.context.state !== 'running') return;
    if (!this.context) this.attach(output);
    const ctx = this.context!;
    if (this.nextTime < ctx.currentTime - 0.15) {
      this.nextTime = ctx.currentTime + 0.035;
      this.step = Math.ceil(this.step / 16) * 16;
    }
    if (this.nextTime === 0) this.nextTime = ctx.currentTime + 0.035;
    let scheduled = 0;
    while (this.nextTime < ctx.currentTime + 0.12 && scheduled++ < 8) {
      if (this.step % 16 === 0) {
        this.playingStage = this.settings.stage;
        this.playingBpm = this.settings.bpm;
        this.setTimbre(this.playingStage);
      }
      const stepLength = 60 / this.playingBpm / 4;
      for (const note of musicStep(this.playingStage, this.step))
        this.play(note, this.nextTime + (note.offset ?? 0) * stepLength);
      this.step++;
      this.nextTime += stepLength;
    }
  }
  private play(note: MusicNote, when: number) {
    const ctx = this.context!,
      output = this.filter!;
    if (this.voices.size >= 40) return;
    const envelope = ctx.createGain(),
      frequency = 440 * Math.pow(2, ((note.midi ?? 45) - 69) / 12);
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.exponentialRampToValueAtTime(note.velocity, when + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + note.length);
    envelope.connect(output);
    let source: AudioScheduledSourceNode, filter: BiquadFilterNode | undefined;
    if (['snare', 'hat', 'glitch'].includes(note.instrument)) {
      if (!this.noise) {
        this.noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.5), ctx.sampleRate);
        const samples = this.noise.getChannelData(0);
        let seed = 1337;
        for (let i = 0; i < samples.length; i++) {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          samples[i] = seed / 2147483648 - 1;
        }
      }
      const buffer = ctx.createBufferSource();
      buffer.buffer = this.noise;
      filter = ctx.createBiquadFilter();
      filter.type = note.instrument === 'hat' ? 'highpass' : 'bandpass';
      filter.frequency.setValueAtTime(
        note.instrument === 'hat' ? 7500 : note.instrument === 'snare' ? 1900 : frequency,
        when,
      );
      filter.Q.value = note.instrument === 'glitch' ? 8 : 0.7;
      buffer.connect(filter);
      filter.connect(envelope);
      source = buffer;
    } else {
      const oscillator = ctx.createOscillator();
      oscillator.type =
        note.instrument === 'kick'
          ? 'sine'
          : note.instrument === 'pad'
            ? 'sine'
            : note.instrument === 'bass'
              ? this.playingStage >= 4
                ? 'sawtooth'
                : 'triangle'
              : note.instrument === 'lead' && this.playingStage >= 4
                ? 'square'
                : 'triangle';
      oscillator.frequency.setValueAtTime(note.instrument === 'kick' ? 145 : frequency, when);
      if (note.instrument === 'kick')
        oscillator.frequency.exponentialRampToValueAtTime(38, when + 0.14);
      oscillator.connect(envelope);
      source = oscillator;
    }
    this.voices.add(source);
    source.onended = () => {
      source.disconnect();
      filter?.disconnect();
      envelope.disconnect();
      this.voices.delete(source);
    };
    source.start(when);
    source.stop(when + note.length + 0.015);
  }
  stop() {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    if (this.gain && this.context)
      this.gain.gain.setTargetAtTime(0, this.context.currentTime, 0.012);
    for (const voice of this.voices) {
      try {
        voice.stop((this.context?.currentTime ?? 0) + 0.025);
      } catch {
        /* Already finished. */
      }
    }
    this.voices.clear();
    this.nextTime = 0;
    this.step = Math.ceil(this.step / 16) * 16;
  }
  dispose() {
    this.stop();
    this.filter?.disconnect();
    this.distortion?.disconnect();
    this.gain?.disconnect();
    this.context = undefined;
    this.gain = undefined;
    this.filter = undefined;
    this.distortion = undefined;
    this.noise = undefined;
  }
}
