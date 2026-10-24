import { useEffect, useRef, useState } from 'react';
import { audio } from './sound';
import { MusicEngine, musicState } from './music';

export function useMusic({
  muted,
  volume,
  musicEnabled,
  musicVolume,
  presses,
  seconds,
}: {
  muted: boolean;
  volume: number;
  musicEnabled: boolean;
  musicVolume: number;
  presses: number;
  seconds: number;
}) {
  const [visible, setVisible] = useState(() => !document.hidden);
  const engine = useRef<MusicEngine | null>(null);
  if (!engine.current) engine.current = new MusicEngine(() => audio.musicOutput());
  const state = musicState(presses, seconds);
  useEffect(() => {
    const change = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => {
    engine.current!.configure({
      enabled: visible && !muted && volume > 0 && musicEnabled,
      volume: musicVolume,
      stage: state.stage,
      bpm: state.bpm,
    });
  }, [visible, muted, volume, musicEnabled, musicVolume, state.stage, state.bpm]);
  useEffect(() => () => engine.current?.dispose(), []);
  return state;
}
