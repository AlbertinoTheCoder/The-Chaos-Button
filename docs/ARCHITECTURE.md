# CHAOS BUTTON

A local, single-player React + TypeScript browser game. No backend, API keys, or gameplay AI. 294 discoverable events, 45 achievements, ten challenge variants, and three named boss encounters. All computer disasters are fictional DOM elements inside the webpage.

## Run locally

Requires Node.js 22.12+ (22 LTS) or 24+ for the complete build and test toolchain.

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite. `npm run build` produces a static `dist/` directory. `npm test` runs registry, eligibility, progression, persistence, and achievement tests.

## Play

Press the red button or Space. Temporary visual effects expire automatically. Windows accumulate without a cap and stay open until you close them or explicitly restore the website. Drag title bars with a mouse or touch; clicking a window brings it forward. Progression unlocks new categories at 11, 31, 61, 101, and 151 presses. Rarity selection uses 55/25/12/6/2 weights among eligible rarity groups, and the last 35 events are excluded; the last eight mechanic families are cooled down, 88% of eligible selections favor undiscovered events, and recent history persists across refreshes.

Use **Restore website** or Escape to clear temporary effects without losing progress. Every challenge has its own exit button; failed challenges can restart. Arrow keys / WASD move, Space fires or jumps; pointer/touch dragging moves the player, holding fires. Boss encounters have three health-driven attack phases. Settings provide sound, volume, and confirmed reset controls. Audio starts only after interaction and defaults to muted.

The collection includes a clearly labeled **Laboratory mode** to trigger and inspect all 294 events without grinding. This records discoveries but does not add presses. Try the three bosses at event #96, #111, and #112. The ending references whether Chaos Itself has been defeated.

Secrets reward exploration: the Konami sequence, typing `chaos` outside inputs, stars and background objects, the fake terminal's `open sesame` command, and a file explorer secret room. A password sticky note appears in its corresponding event.

## Modules

- `events.ts`: metadata, reversible lifecycle contract, weighted selection, compatibility and progression.
- `App.tsx`: chaos controller, button behavior, personality, UI, secrets, effect lifecycle.
- `Effects.tsx`: fictional OS, characters, reality scenes and bounded Canvas physics.
- `Challenge.tsx`: Canvas gameplay, bosses, rhythm, platforming, maze, puzzle and RPS.
- `persistence.ts`: localStorage recovery and achievement predicates.
- `sound.ts`: short procedural Web Audio effects.
- `style.css`: responsive visual system, event transformations and reduced-motion rules.

Saves use the browser-local `chaos-button-v1` key. Disabled storage falls back to a playable unsaved session. Physics caps objects at 65 on small screens and 140 on desktop; other simulations use 45. Reduced-motion settings disable repeated CSS animations and continuous decorative physics. No browser popups or real operating system access are used.

## 150-event expansion

Thirty interactive families each offer five named variations with different presentation, difficulty, goals, and parameters. These include whack-a-pest, defusal, wiring, parcel sorting, balancing, slingshots, painting, scratch cards, swarms, pinball, satellite launches, catching, Simon, Lights Out, typing, stacking, herding, growing, vacuuming, dominoes, inspection lenses, constellations, safes, escaping cookie banners, traffic, fishing, alchemy, gardening, mirrored controls, and market trading.

The expansion uses `expansion.ts` for authored content, `ExpansionScene.tsx` for lifecycle and inputs, `simulation.ts` for shared data, `arcade.ts` / `worlds.ts` for Canvas behaviors, and `PuzzleScene.tsx` for accessible DOM puzzles. Expansion windows stay open independently, including multiple instances of the same event. Each offers close/restart controls.

## Popup variety

24 additional popup events mix fake subscriptions, multiplying errors, news reports, notifications, newsletters, permission prompts, fictional chats, invoices, surveys, stalled updates, terms, and meetings into gameplay. Selection balances popup/system incidents (35%), visual or character spectacle (35%), and interactive events (30%) within each eligible rarity and discovery pool. Available groups are reweighted when progression or cooldowns exclude a group. Popups dismiss individually and never expire or evict older windows. All forms are local and send nothing.

Window instances and player-owned lifecycle helpers live in `windows.ts`; pointer dragging, focus stacking, and viewport recovery are handled by `useDraggableWindows.ts`. Restore Website (or Escape) is the explicit clear-all control. Temporary visual effects can end without closing any window.

## Sound feedback

Enable **SOUND ON** in the header; volume and mute persist in Settings. All audio is synthesized locally, with no downloads or remote services. `sound.ts` provides 47 distinct cues, one compressed master mixer, instant mute, per-cue cooldowns, automatic node cleanup, and a 28-voice ceiling. Important results take priority over background chatter.

`useSoundFeedback.ts` covers buttons, hover, typing, toggles, sliders, canvas actions, and existing or future popup controls. `gameAudio.ts` maps all 30 expansion mechanics to action/scoring sounds and observes damage, failures, and boss phases. Event triggers, physical impacts, window dragging, chat notifications, Simon/rhythm notes, shooting, launching, growth, painting, scratching, and victories have contextual cues. Sounds unlock only after a user gesture and audio failure never blocks gameplay.

## Adaptive music

Turn on sound to hear the locally synthesized soundtrack. Settings has a separate **Music** toggle and **Music volume** slider, both saved automatically. Music follows the higher of your chaos tier or a playtime tier that advances every three minutes: sparse ambient bells and pads become drums, bass, syncopated arpeggios, distorted synths, polyrhythms, and glitch fills. Tempo rises from 68 to 188 BPM. Transitions happen on bar boundaries rather than restarting the song.

`music.ts` contains the deterministic score and an audio-clock lookahead scheduler. `useMusic.ts` connects progress and preferences to the single shared audio context. Music pauses in background tabs and stops on mute; disabling music keeps sound effects available. Its own 40-voice ceiling and short scheduling horizon prevent accumulating notes or timers during heavy chaos.
