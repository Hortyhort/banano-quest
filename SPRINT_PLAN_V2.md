# BANANO QUEST — Path to 9+ Sprint Plan

**Starting point:** All 8 original sprints shipped. Game works, builds, deploys.
**Problem:** It's a 5/10. Functional but flat. No juice, trivial boss, no replayability, fragile architecture.
**Goal:** Make a game people actually want to play twice.

---

## PHILOSOPHY

A 9/10 mobile platformer has three things:
1. **Feel** — Every action has weight, impact, and feedback. You *feel* the jump, the stomp, the coin.
2. **Challenge** — The difficulty teaches you, then tests you. Dying feels fair. Winning feels earned.
3. **Hooks** — There's always a reason to play one more run. Not grind. *Reason.*

The original 8 sprints built a skeleton. These 4 sprints add the soul.

---

## SPRINT 9 — JUICE (Game Feel Overhaul)

**Theme:** "Make every action feel like it matters"

The #1 reason the game feels flat is lack of *juice* — the screen doesn't react to what you do. Compare: in Celeste, jumping shakes the hair, landing puffs dust, dying freezes the frame for 80ms. In our game, things just... happen.

### S9.1: Hitstop & Impact Frames
- **Hitstop on stomp:** Freeze game for 40-60ms when player stomps an enemy. This tiny pause makes impacts feel MASSIVE. Phaser's `this.time.paused` or manual delta skip.
- **Hitstop on death:** 80ms freeze before death animation plays. Lets the player register what happened.
- **Hitstop on boss stomp:** 120ms freeze + stronger camera shake. Boss hits should feel seismic.
- **Landing impact scale:** On landing from height, briefly squash player wider (scaleX: 1.3, scaleY: 0.7) proportional to fall distance. Currently it's a fixed squash regardless of fall height.

### S9.2: Camera Juice
- **Lookahead:** Camera leads the player by ~60px in their movement direction. Right now camera just follows center — feels passive. Use Phaser's `camera.setFollowOffset` with lerp.
- **Landing slam:** Brief camera dip (8-12px) when landing from a long fall. Sells the weight.
- **Boss arena lock:** When boss spawns, camera smoothly zooms to 0.9x and locks to arena bounds. Creates claustrophobia and focus.
- **Level complete zoom:** Slow zoom to player + rotate 2-3° + particle shower. Current transition is just a fade — boring.

### S9.3: Combo System & Score Multiplier
- **Stomp combo:** Stomping multiple enemies without touching the ground increases a combo counter (x2, x3, x4...). Each combo level: bigger numbers, brighter colors, pitch-shifted stomp sound, stronger camera shake.
- **Combo timer bar:** Small bar under score that drains in 2s. Land another stomp to refresh.
- **Combo-break feedback:** When combo ends, flash the final multiplier large on screen ("x4!") with a satisfying chime.
- **Wire combos to score:** Combo multiplier affects coin value too. Gives advanced players a reason to chain.

### S9.4: Particle & VFX Overhaul
- **Shared particle helper:** Extract the copy-pasted stomp particle code from all 4 enemy classes into `src/utils/particles.js`. One function: `spawnBurstParticles(scene, x, y, count, color, spread)`.
- **Coin trail:** Coins leave a brief sparkle trail when collected (3-4 tiny circles that fade). Right now coins just pop — no trail.
- **Speed lines:** When player moves at speed-boost velocity, draw 3-4 horizontal streaks behind them. Sells the speed.
- **Power-up expiry warning:** At 2s remaining, flash the glow circle red and pulse faster. Currently power-ups just silently vanish.

### S9.5: Sound Design Polish
- **Pitch variation:** Randomize stomp/coin/jump pitch by ±10%. Prevents repetitive "same beep" syndrome. `o.frequency.value = freq * (0.95 + Math.random() * 0.1)`.
- **Combo pitch escalation:** Each combo hit raises the stomp pitch by a semitone. x4 combo sounds like an ascending scale.
- **Boss music:** Swap to a heavier, minor-key track when boss spawns. Distinct from regular gameplay music. Currently boss just uses the same track.
- **Low health heartbeat:** When player has 1 life left, subtle pulsing bass tone (60Hz, 0.05 gain). Creates tension.

### S9.6: Centralize Magic Numbers
- Move ALL gameplay constants into `gameConfig.js`: magnet radius (150), speed multiplier (1.5), power-up duration (8000), invincibility time (2000), combo window (2000), hitstop durations, camera offsets, particle counts.
- Every sprite/scene pulls from config. Zero inline magic numbers in gameplay code.

**Exit criteria:** Stomping an enemy should make you go "ooh." Landing should have weight. The game should *sound* different at x4 combo vs x1.

---

## SPRINT 10 — COMBAT (Boss, Enemies, Difficulty)

**Theme:** "Every death should teach you something"

### S10.1: Boss Redesign — 3 Phases
The current boss is "stomp 3 times while it shuffles." That's not a boss fight, it's a chore.

**Phase 1 (3 HP → 2 HP):** Slow patrol. Telegraphed charge attack (1.5s windup, red flash, then dash). Player stomps during recovery window after charge misses. Teaches: "wait for the opening."

**Phase 2 (2 HP → 1 HP):** Faster patrol. Boss slams ground periodically, creating a shockwave (expanding circle on ground — jump to dodge). Charge is faster (1s windup). Boss spawns 1 minion every 8s. Teaches: "manage threats while waiting for opening."

**Phase 3 (1 HP → 0):** Boss goes berserk. Alternates between triple-charge (3 quick dashes) and ground slam. No minions (arena is chaotic enough). Tinted red, particles trailing. One stomp ends it. Teaches: "pattern recognition under pressure."

- Each phase transition: boss flashes white, arena rumbles, brief invincibility, new music intensity layer.
- Death in boss fight restarts at phase beginning (not level beginning). Respecting player time = retention.

### S10.2: Difficulty Curve Rebalance
Current problem: L1 is boring, L2-L4 are samey, L5 is a wall.

**New curve:**
| Level | Theme | New Mechanic Introduced | Enemy Count | Coins |
|-------|-------|------------------------|-------------|-------|
| 1 | Tutorial | Jump, stomp (1 easy enemy) | 2 | 8 |
| 2 | Foundation | Gaps, moving platforms | 4 | 12 |
| 3 | Variety | Question blocks, falling platforms | 5 + 1 flying | 14 |
| 4 | Pressure | Charging enemies, spike gauntlets | 6 + 2 flying + 1 charging | 16 |
| 5 | Climax | Boss + all enemy types | 4 + 2 flying + 1 charging + boss | 18 |

- **Level 1 specifically:** Remove 3 of 5 enemies. Add arrow signs pointing right. First coin should be impossible to miss. First enemy should be in a pit the player naturally falls into (teaches stomping). Current L1 has 5 enemies on a flat floor — that's not a tutorial.
- **Spike placement audit:** Every spike should be near a reward (coin, shortcut) or guarding a path. No spikes in dead space.

### S10.3: Power-Up Redesign
Current power-ups are forgettable modifiers. New design: **each power-up changes how you play.**

- **Speed Boost → Dash:** Single-use forward burst (tap direction twice). Covers 200px instantly. Kills enemies on contact. 3 charges per pickup. Changes moment-to-moment decisions: "do I dash through this gap or save it for the enemy?"
- **Double Jump → Glide:** Hold jump in air to slow fall speed to 30%. Lets you steer precisely mid-air. Lasts 8s. Changes platforming approach entirely.
- **Magnet → Chain Lightning:** Collecting a coin sends a bolt to the nearest uncollected coin within 200px, auto-collecting it too. Chain propagates up to 3 times. Turns coin collection into route planning: "which coin do I grab first to chain the most?"

### S10.4: Enemy Behavior Polish
- **Ground enemies:** Add brief anticipation (0.2s squash) before reversing patrol direction. Telegraphs the turn.
- **Flying enemies:** Sine wave should be visible — draw a faint dotted path showing patrol arc. Player can predict safe windows.
- **Charging enemies:** Red exclamation mark (!) appears over head 0.5s before charge. Sound cue too. Currently they charge with almost no warning.

### S10.5: Death Fairness Pass
- **Spike grace period:** 100ms invincibility when player *first* touches a spike. Prevents "I was 1 pixel off" frustration. If still touching after 100ms, take damage.
- **Coyote time:** Allow jump for 80ms after walking off a ledge. Standard in all good platformers. Missing entirely.
- **Jump buffer:** If player presses jump within 80ms of landing, queue the jump. Prevents "I pressed jump but nothing happened" rage.
- **Fall death line:** Move death trigger from `GAME_HEIGHT + 60` to `GAME_HEIGHT + 120`. Give player an extra beat to see they fell, process it, then die. Currently it's instant.

**Exit criteria:** Boss should take 3-4 attempts to beat. Level 1 should be beatable on first try with zero instructions. Power-ups should make you change your approach, not just run faster.

---

## SPRINT 11 — HOOKS (Replayability & Content)

**Theme:** "One more run"

### S11.1: Endless Mode
- **Unlocked after beating Level 3.** Procedurally generated platforms, coins, enemies. Difficulty ramps over time (platform gaps widen, enemy density increases, new enemy types appear at score thresholds).
- **Procedural generation:** Chunk-based. Pre-authored 8-platform "chunks" that connect seamlessly. Each chunk has a difficulty rating (1-5). Engine picks chunks with difficulty = floor(score / 500) capped at 5.
- **Endless leaderboard:** Personal best distance + score. Displayed on menu.
- **This is the retention hook.** Levels are finite content. Endless mode is infinite.

### S11.2: Daily Challenge
- **One curated level per day.** Seed = date string hash. Same seed generates same level for all players.
- **Scoring:** Time + coins + combo bonus. Displayed as "Today's Best" on menu.
- **Calendar streak:** Track consecutive daily completions. 3-day streak = reward (skin unlock hint). 7-day = actual skin unlock.
- **Implementation:** Use the endless mode chunk system but with a deterministic seed and fixed length (90 seconds or 30 chunks).

### S11.3: Level Stars Overhaul
Current stars are just "how many coins did you get." Add real criteria:

| Stars | Criteria |
|-------|----------|
| ★ | Complete the level |
| ★★ | All coins collected |
| ★★★ | All coins + zero deaths + under par time |

- **Par time per level:** Displayed during gameplay as a small timer. Adds healthy pressure without being punishing.
- **Star animation:** Each star earned flies in separately with a unique sound. Current implementation reveals all at once.

### S11.4: Progression Depth
- **Coin shop:** Spend lifetime coins on: extra starting life (50 coins), power-up at level start (100 coins), checkpoint flag you can place mid-level (200 coins). Coins become a meaningful currency, not just a score.
- **Mastery badges per level:** "No deaths," "Under 30s," "All enemies stomped." Visible on level select as small icons. Completionists will grind for these.
- **Global completion %:** Shown on menu. Counts: levels beaten, stars earned, achievements, mastery badges, skins, endless high score thresholds. "You've completed 47% of Banano Quest."

### S11.5: Social Hooks (Lightweight)
- **Screenshot share:** On level complete or high score, offer "Share" button. Uses `navigator.share()` API with a generated canvas screenshot + text overlay showing score/stars.
- **Ghost replay (stretch):** Record player inputs during best run. Show transparent "ghost" during replays. Low priority but powerful for speedrunners.

**Exit criteria:** A player who beats Level 5 should have 3+ reasons to keep playing: beat their endless record, complete today's daily, grind mastery badges, buy shop items.

---

## SPRINT 12 — SHIP (Production Polish)

**Theme:** "No excuses left"

### S12.1: Refactor GameScene
- **Extract `CollisionManager`** — All collision setup and handlers (~200 lines). GameScene calls `this.collisions.setup()` in create.
- **Extract `LevelRenderer`** — Background, hills, decorations, platforms (~250 lines). GameScene calls `this.renderer.buildLevel(levelData)`.
- **Extract `EntityFactory`** — Enemy/coin/block creation (~150 lines). `this.entities.spawnFromLevelData(levelData)`.
- **GameScene becomes orchestrator:** ~200 lines of init, update loop, and event routing. Clean, readable, testable.

### S12.2: Mobile Production Polish
- **Safe area insets:** CSS `env(safe-area-inset-bottom)` and `env(safe-area-inset-left/right)` for touch button positioning. Test on iPhone 15 Pro dimensions (notch + home bar).
- **Touch button resize:** D-pad buttons from 70px → 88px. Jump from 90px → 110px. Touch targets below 80px fail accessibility audits.
- **Touch button repositioning:** Respect safe areas. Bottom buttons should be `max(20px, env(safe-area-inset-bottom))` from bottom.
- **Prevent zoom/scroll:** Ensure `touch-action: none` is on all interactive elements, not just the canvas.
- **Wake lock:** Use `navigator.wakeLock.request('screen')` during gameplay to prevent screen dimming.

### S12.3: Performance Pass
- **Boss health bar:** Only redraw when health changes, not every frame. Store `lastDrawnHealth` and compare.
- **Object pooling for particles:** Create a `ParticlePool` class. Pre-allocate 50 circle sprites, reuse them instead of create/destroy. Eliminates GC pressure.
- **Tween audit:** Count total active tweens per scene. Cap at 100. Kill oldest ambient tweens if limit hit.
- **Background decoration optimization:** Pre-render decorations to a texture once, then draw the texture. Eliminates per-frame tween overhead for clouds/bubbles/embers.

### S12.4: Accessibility & Inclusion
- **Colorblind mode:** Toggle in settings. Swaps red enemies → patterned (stripes), green platforms → textured (dots). Uses shape+pattern, not just color.
- **Reduced motion:** Toggle that disables background parallax, particle effects, and screen shake. Required for some users with vestibular disorders.
- **Text scaling:** 3 sizes (S/M/L) for HUD text. Affects score, level, timer, menus.
- **Keyboard navigation:** All menus navigable with arrow keys + Enter. Tab order for buttons.

### S12.5: Store Submission Package
- **Generate real screenshots:** Script that launches the game headless (or in preview), plays through key moments, captures canvas to PNG. 6 screenshots: menu, L1 gameplay, L3 with power-up, L5 boss fight, level complete screen, achievements screen.
- **App Store compliance:** Content rating questionnaire answers. Age rating: Everyone / PEGI 3. Data safety form (no data collected).
- **Remove sprint comments:** Global find/replace `// S[0-9]` → delete. Replace with meaningful comments where logic isn't obvious.
- **Version bump:** 1.0.0 → 1.0.0-rc.1. Tag in git.

### S12.6: Error Handling & Crash Prevention
- **Global error boundary:** `window.onerror` and `window.onunhandledrejection` handlers that log to AnalyticsService and show a friendly "Oops! Tap to restart" overlay instead of a white screen.
- **Scene transition safety:** Wrap all `scene.start()` / `scene.stop()` calls in try/catch. If a scene fails to load, fall back to MenuScene.
- **StorageService quota handling:** Catch `QuotaExceededError` on all `setItem` calls. If storage is full, evict analytics events first, then old stats.

**Exit criteria:** Game passes Lighthouse mobile audit at 90+. All menus keyboard-navigable. Zero console errors during full playthrough. Store listing has all required assets.

---

## PRIORITY ORDER

If you can only do two sprints: **9 then 10.** Juice + combat fixes transform the game feel. Everything else is icing.

If you can do three: add **11.** Endless mode is the single biggest retention feature.

Sprint 12 is "do it right." It's important but it doesn't make anyone smile.

---

## WHAT THIS DOESN'T FIX

Honest about scope. These 4 sprints won't solve:
- **Art quality.** Procedural shapes will always look like programmer art. A 9/10 visual game needs an artist. But juice can make shapes *feel* great.
- **Music depth.** Procedural audio is clever but limited. Real composition (even chiptune) would elevate the whole experience. Consider a free license track from a chiptune artist.
- **Level quantity.** 5 levels + endless is thin for a store game. 10-15 levels is the sweet spot. But quality > quantity — better to have 5 amazing levels than 15 bland ones.
- **Multiplayer.** No scope for it. But that's fine — single-player platformers can be 9/10.

---

## METRICS (How We Know It's 9+)

| Metric | Current | Target |
|--------|---------|--------|
| Average session length | ~3 min (guess) | 8+ min |
| D1 retention (% who play next day) | ~10% | 40%+ |
| Level 1 completion rate | ~60% | 95%+ |
| Boss defeat rate (per attempt) | ~80% (too easy) | 30-40% |
| Endless mode plays per user | 0 (doesn't exist) | 3+/week |
| Store rating | n/a | 4.5+ stars |
| Crash rate | unknown | <0.1% |
