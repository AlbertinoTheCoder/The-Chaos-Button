# Contributing a bad idea

The best events change what the player can see or do. A clever title is a bonus; a functional interaction is the feature.

## Start here

Use Node.js 24 (or 22.12+) and run:

```sh
npm ci
npm run dev
```

Before proposing a change, run `npm run format:check`, `npm test`, and `npm run build`. Use `npm run format` to format your changes. Keep fixes focused and explain the player-visible result.

## Adding an event

- Register metadata and eligibility in `src/events.ts`. Keep IDs stable: existing saves refer to them.
- Add the implementation to the appropriate scene or a focused new module. Expansion content lives in `src/expansion.ts`; its Canvas behavior is in `src/arcade.ts` or `src/worlds.ts`, and DOM puzzles are in `src/PuzzleScene.tsx`.
- Give windows a player-controlled lifecycle using `src/windows.ts`. Never expire or evict another window. Duplicate instances must remain independent.
- Provide sound feedback through the shared mixer and map new mechanics in `src/gameAudio.ts`.
- Use the event collection's Laboratory mode for direct, repeatable checks.

## What good chaos looks like

- Every minigame has a useful win or lose condition, restart, and exit.
- Result screens make **Close** the main action; **Another attempt** belongs at the top right.
- Pointer, keyboard, and touch controls work where appropriate.
- Transient animation, audio nodes, listeners, and timers are cleaned up.
- Reduced-motion settings and mute/volume controls are respected.
- Everything stays inside the page. No actual OS interactions, uncontrolled browser windows, backend dependencies, or gameplay API calls.
- Restore Website clears temporary state and windows without erasing saved progress.

Do not commit generated builds, dependency folders, local saves, credentials, or personal data. Screenshots should come from a clean test session.
