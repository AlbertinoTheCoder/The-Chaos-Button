export interface ChaosWindow {
  key: number;
  eventId: number;
}

/** Windows are owned by the player. They never expire or evict one another. */
export function isWindowEvent(id: number) {
  return (
    (id >= 31 && id <= 45) ||
    id === 99 ||
    (id >= 101 && id <= 120 && id !== 111 && id !== 112) ||
    id >= 121
  );
}

export function openWindow(windows: ChaosWindow[], eventId: number, key: number): ChaosWindow[] {
  return [...windows, { key, eventId }];
}

export function closeWindow(windows: ChaosWindow[], key: number): ChaosWindow[] {
  return windows.filter((window) => window.key !== key);
}
