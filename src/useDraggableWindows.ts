import { playSfx } from './sound';
import { useEffect } from 'react';

const windowSelector = '.fake-window,.absurd-popup,.expansion-scene,.wildcard,.gallery,.challenge';

export function useDraggableWindows() {
  useEffect(() => {
    let top = 30;
    let drag: {
      element: HTMLElement;
      bar: HTMLElement;
      pointer: number;
      offsetX: number;
      offsetY: number;
    } | null = null;
    const place = (element: HTMLElement, x: number, y: number) => {
      // Overlap freely, while keeping the title bar and its close button reachable.
      element.style.setProperty(
        'left',
        Math.max(0, Math.min(innerWidth - element.offsetWidth, x)) + 'px',
        'important',
      );
      element.style.setProperty(
        'top',
        Math.max(0, Math.min(innerHeight - 36, y)) + 'px',
        'important',
      );
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>(windowSelector);
      if (!element) return;
      element.style.zIndex = String(++top);
      const bar = event.target.closest<HTMLElement>('.windowbar');
      if (!bar || !element.contains(bar) || event.target.closest('button,input,select,textarea,a'))
        return;
      const rect = element.getBoundingClientRect();
      drag = {
        element,
        bar,
        pointer: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      element.style.width = rect.width + 'px';
      element.style.position = 'fixed';
      element.style.transform = 'none';
      element.style.translate = 'none';
      element.style.animation = 'none';
      element.dataset.dragging = 'true';
      playSfx('grab', { intensity: 0.6 });
      element.dataset.dragged = 'true';
      place(element, rect.left, rect.top);
      bar.setPointerCapture(event.pointerId);
      event.preventDefault();
    };
    const move = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointer) return;
      place(drag.element, event.clientX - drag.offsetX, event.clientY - drag.offsetY);
      event.preventDefault();
    };
    const up = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointer) return;
      drag.element.dataset.dragging = 'false';
      playSfx('drop', { intensity: 0.5 });
      if (drag.bar.hasPointerCapture(event.pointerId))
        drag.bar.releasePointerCapture(event.pointerId);
      drag = null;
    };
    const resize = () =>
      document.querySelectorAll<HTMLElement>('[data-dragged="true"]').forEach((element) => {
        const rect = element.getBoundingClientRect();
        place(element, rect.left, rect.top);
      });
    document.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    window.addEventListener('resize', resize);
    return () => {
      if (drag?.bar.hasPointerCapture(drag.pointer)) drag.bar.releasePointerCapture(drag.pointer);
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      window.removeEventListener('resize', resize);
    };
  }, []);
}
