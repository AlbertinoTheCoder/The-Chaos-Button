export function ReplayButton({ onReplay }: { onReplay: () => void }) {
  return (
    <button
      className="minigame-replay"
      onClick={onReplay}
      aria-label="Another attempt"
      title="Play this minigame again"
    >
      ↻ Another attempt
    </button>
  );
}

export function CloseGameButton({ onClose }: { onClose: () => void }) {
  return (
    <button className="minigame-close" onClick={onClose} aria-label="Close minigame">
      ✕ Close
    </button>
  );
}
