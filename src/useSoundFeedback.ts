import { useEffect, useRef } from 'react';
import { audio, configureSound, playSfx, type Sfx } from './sound';
import { mechanicAudio } from './gameAudio';
import type { Mechanic } from './expansion';

function actionSound(element: Element): Sfx {
  if (
    element.getAttribute('aria-label')?.startsWith('Close') ||
    element.textContent?.startsWith('Back to ')
  )
    return 'close';
  if (element.closest('.minigame-replay')) return 'restart';
  if (element.closest('.minigame-close,.windowbar button')) return 'close';
  if (element.closest('.restore-button,.floating-restore')) return 'restore';
  if (element.closest('.bubble-wrap,.confetti-play,.duck-pond')) return 'pop';
  if (element.closest('.memory-cards')) return 'click';
  if (element.closest('.plant-stage-4')) return 'chop';
  if (element.closest('.plant-stage-0')) return 'plant';
  if (element.closest('.plant-stage-1,.plant-stage-2')) return 'water';
  if (element.closest('.toast-pet,.garden-plots')) return 'grow';
  if (element.closest('.tea-break,.aquarium,.rain-catch')) return 'water';
  if (element.closest('.air-traffic')) return 'launch';
  if (element.closest('.pizza')) return 'chop';
  if (element.closest('.disco-floor,.survey-stars,.simon-pads')) return 'note';
  const scene = element.closest('.expansion-scene');
  const mechanic =
    scene &&
    ([...scene.classList]
      .find((name) => name.startsWith('expansion-') && name !== 'expansion-scene')
      ?.slice(10) as Mechanic | undefined);
  if (mechanic && mechanicAudio[mechanic]) return mechanicAudio[mechanic].action;
  if (element.closest('.popup-error')) return 'error';
  if (element.closest('.invoice-lines,.popup-invoice')) return 'coin';
  if (element.closest('.popup-chat,.popup-notification')) return 'notification';
  if (element.matches('input[type="checkbox"]') || element.closest('.filters,.permission-list'))
    return 'toggle';
  if (element.closest('.collection-card,.icon-button')) return 'open';
  return 'click';
}

/** Delegation covers present and future popup/DOM interactions without per-button wiring. */
export function useSoundFeedback(muted: boolean, volume: number) {
  const prior = useRef(muted);
  useEffect(() => {
    configureSound(muted, volume);
    if (prior.current && !muted) playSfx('toggle');
    prior.current = muted;
  }, [muted, volume]);
  useEffect(() => {
    const unlock = () => audio.unlock();
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest('button,a,input[type="checkbox"]');
      if (
        !target ||
        target.matches(':disabled') ||
        target.closest('#chaos-button,.duplicate-button,.mini-red,.sound-button') ||
        target.getAttribute('aria-label') === 'Mute sound' ||
        target.getAttribute('aria-label') === 'Unmute sound'
      )
        return;
      const pitch = target.closest('.simon-pads,.survey-stars,.ingredients')
        ? 1 + (Array.from(target.parentElement?.children ?? []).indexOf(target) % 5) * 0.2
        : 1;
      playSfx(actionSound(target), { pitch, intensity: 0.65 });
    };
    const over = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
      const button = event.target.closest('button');
      if (
        button &&
        !button.matches(':disabled') &&
        !(event.relatedTarget instanceof Node && button.contains(event.relatedTarget))
      )
        playSfx('hover');
    };
    const down = (event: PointerEvent) => {
      unlock();
      if (event.target instanceof Element && event.target.matches('canvas:not(.physics)'))
        playSfx(event.target.closest('.challenge') ? 'shoot' : actionSound(event.target), {
          intensity: 0.65,
        });
    };
    const move = (event: PointerEvent) => {
      if (event.buttons && event.target instanceof Element) {
        if (event.target.matches('.wet-pixels canvas')) playSfx('scratch', { intensity: 0.6 });
        else if (
          event.target.matches('canvas') &&
          event.target.closest('.expansion-paint,.expansion-scratch,.expansion-vacuum')
        )
          playSfx(actionSound(event.target), { intensity: 0.45 });
      }
    };
    const input = (event: Event) => {
      if (event.target instanceof HTMLInputElement && event.target.type === 'range')
        playSfx('slider', {
          pitch: 0.7 + (Number(event.target.value) / (Number(event.target.max) || 1)) * 0.7,
          intensity: 0.5,
        });
    };
    const key = (event: KeyboardEvent) => {
      unlock();
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.target instanceof Element &&
        event.target.matches('input:not([type="range"]),textarea')
      )
        playSfx('type');
    };
    document.addEventListener('pointerdown', down, { capture: true });
    document.addEventListener('click', click, { capture: true });
    document.addEventListener('pointerover', over);
    document.addEventListener('pointermove', move);
    document.addEventListener('input', input);
    document.addEventListener('keydown', key, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('click', click, true);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('input', input);
      document.removeEventListener('keydown', key, true);
    };
  }, []);
}
