import { useEffect, useRef } from 'react';
import type { Mechanic } from './expansion';
import { playSfx, type Sfx } from './sound';
interface Profile {
  action: Sfx;
  score: Sfx;
}
export const mechanicAudio: Record<Mechanic, Profile> = {
  whack: { action: 'pop', score: 'hit' },
  defuse: { action: 'charge', score: 'tick' },
  wires: { action: 'click', score: 'connect' },
  sort: { action: 'drop', score: 'coin' },
  balance: { action: 'whoosh', score: 'note' },
  launch: { action: 'charge', score: 'coin' },
  paint: { action: 'paint', score: 'paint' },
  scratch: { action: 'scratch', score: 'scratch' },
  swarm: { action: 'wind', score: 'pop' },
  pinball: { action: 'bounce', score: 'coin' },
  orbit: { action: 'launch', score: 'magic' },
  catch: { action: 'whoosh', score: 'pop' },
  simon: { action: 'note', score: 'connect' },
  lights: { action: 'toggle', score: 'toggle' },
  type: { action: 'type', score: 'connect' },
  stack: { action: 'drop', score: 'drop' },
  herd: { action: 'whoosh', score: 'notification' },
  grow: { action: 'water', score: 'grow' },
  vacuum: { action: 'vacuum', score: 'pop' },
  domino: { action: 'chop', score: 'tick' },
  lens: { action: 'click', score: 'magic' },
  constellation: { action: 'note', score: 'connect' },
  safe: { action: 'tick', score: 'connect' },
  cookie: { action: 'pop', score: 'notification' },
  traffic: { action: 'toggle', score: 'horn' },
  fishing: { action: 'reel', score: 'water' },
  alchemy: { action: 'water', score: 'magic' },
  garden: { action: 'plant', score: 'grow' },
  mirror: { action: 'glitch', score: 'coin' },
  auction: { action: 'coin', score: 'coin' },
};
export interface GameFeedback {
  score: number;
  health: number;
  result?: string;
  won?: boolean;
  enemy?: number;
  attempt?: number;
}
export function useGameFeedback(
  state: GameFeedback,
  profile: Profile = { action: 'click', score: 'coin' },
) {
  const previous = useRef(state);
  useEffect(() => {
    const old = previous.current;
    previous.current = state;
    if (old.attempt !== state.attempt) return;
    if (state.health < old.health) playSfx('hit');
    if (state.score > old.score)
      playSfx(profile.score, { pitch: 1 + (state.score % 5) * 0.075, intensity: 0.65 });
    if (state.enemy !== undefined && old.enemy !== undefined && state.enemy < old.enemy) {
      playSfx('hit', { pitch: 1.7, intensity: 0.5 });
      if ((old.enemy > 66 && state.enemy <= 66) || (old.enemy > 33 && state.enemy <= 33))
        playSfx('phase');
    }
    if (state.result && state.result !== old.result && !state.won) playSfx('lose');
  }, [
    state.score,
    state.health,
    state.result,
    state.won,
    state.enemy,
    state.attempt,
    profile.score,
  ]);
}
