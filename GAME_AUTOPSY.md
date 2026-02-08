# BANANO QUEST: GAME AUTOPSY REPORT

> **Conducted by:** Ruthless Mobile Game Director
> **Date:** 2026-02-08
> **Verdict:** 2.1/10 — A Phaser tutorial exercise masquerading as a mobile game.

---

## THE BRUTAL TRUTH

8 source files. 1,500 lines of JavaScript. 4 SVG sprites. Zero audio files. Zero tests. Zero enemies. Zero touch controls. One single level with 9 platforms and 12 coins. A wallet bridge stub that does nothing. Built in 35 minutes.

This isn't a game. It's a tech demo someone forgot to delete.

---

## RE-SCORING: ALL 12 CATEGORIES

### 1. Core Gameplay Loop — 3/10

The "gameplay loop" is: move left/right, jump, touch 12 floating yellow circles, see "LEVEL COMPLETE," press SPACE. There is no fail state — you literally cannot die. No enemies, no hazards, no pits, no timer. The score is always 120 (12 coins × 10 points) because there's nothing else to collect.

**Celeste** has death — hundreds of deaths per level — and that tension IS the game. **Super Mario Run** gives you pink/purple/black coins across three difficulty layers per level. **Geometry Dash** kills you if you're off by a pixel. This game has the tension of picking up laundry.

**9+ requires:** Instant death hazards, multiple completion objectives (time trial, no-death, hidden coins), risk/reward mechanics, a reason to replay.

### 2. Game Feel / Juice — 4/10

The entire feedback system:
- Squash/stretch on jump: `scaleX: 1.2, scaleY: 0.8` over 100ms
- Scale pop on coin collect: `scale: 1.3` over 100ms
- 8 yellow circles fly outward on coin collect

No landing impact. No speed lines. No dust particles. No camera shake. No screen freeze. Movement is binary — instant `setVelocityX(300)` or `setVelocityX(0)`. The walk animation hardcodes `+= 16` instead of using delta time — a framerate bug that breaks on any device not running exactly 60fps.

**Celeste** has 14+ distinct particle systems just for Madeline's movement. **Dead Cells** has hit-stop, screen shake, chromatic aberration on crits. This game has a coin that scales up 1.3x.

**9+ requires:** Delta-time animations, dust/trail particles, camera shake with decay, landing squash proportional to fall distance, speed lines, haptic feedback.

### 3. Content Depth — 2/10

ONE level. `LEVEL_1_PLATFORMS` and `LEVEL_1_COINS` in `gameConfig.js`. There is no `LEVEL_2`. Zero enemies. Zero power-ups. Zero achievements. 9 platforms. 12 coins. No scrolling — the entire game fits in a 1280×720 viewport.

**Hollow Knight** has 15+ distinct areas with unique enemies, mechanics, and bosses. **Super Mario Run** shipped 24 levels across 6 worlds. This game has one static screen.

**9+ requires:** 50+ levels across 5+ worlds, unique mechanics per world, boss encounters, hidden areas, procedural daily challenges.

### 4. Audio — 1/10

ZERO audio. No `.mp3`, `.ogg`, `.wav` files. No Phaser audio API calls anywhere. `StorageService` has `soundEnabled` and `musicEnabled` settings that control nothing. The game is completely silent.

**Celeste's** soundtrack is a standalone masterpiece with dynamic layering. **Ori's** orchestral score makes people cry. **Geometry Dash** syncs every obstacle to the beat. This game is a silent SVG monkey.

**9+ requires:** Original soundtrack (3-5 tracks), dynamic music layering, SFX for every action, audio ducking, beat-synced elements.

### 5. Visual Polish — 2/10

4 SVG files loaded at 64×78px. Platforms are programmatically generated green rectangles. Coins are yellow circles. Background is a gradient with white circle clusters for "clouds." `generatePlaceholderGraphics()` — the function name literally says "placeholder." Placeholder art was shipped.

**Ori** is hand-painted with volumetric lighting. **Alto's Odyssey** has procedural sunsets with 30+ color transitions. **Dead Cells** has hand-animated pixel art at 60fps. This game has `fillStyle(0x4CAF50)` — Material Design green.

**9+ requires:** Cohesive art direction, sprite sheets with 8+ frames per animation, layered parallax (4+ layers), environmental storytelling, lighting/shadow, weather effects.

### 6. Mobile/Touch — 1/10

Keyboard only. Arrow keys and WASD. On a phone — where this is supposedly an Android game — the player cannot move. The game is unplayable on mobile. Menu text says "Arrow Keys or WASD to move | SPACE to jump."

**Super Mario Run** reinvented Mario around one-touch. **Geometry Dash** uses single-tap. **Brawl Stars** has dual-joystick tuned over years. This game cannot be played on the platform it targets.

**9+ requires:** Purpose-built touch controls, haptic feedback, adaptive UI for phones/tablets, landscape/portrait support.

### 7. UI/UX — 4/10

Menu is functional. HUD has score/highscore/level. What's missing: No settings screen. No level select. No tutorial. Level complete says "Press SPACE to play again" — on a mobile game. No pause button. No accessibility. No localization.

**9+ requires:** Animated transitions, level select with star ratings, interactive tutorial, settings, pause overlay, localization.

### 8. Progression — 2/10

Play one level, see score (always 120), see "new high score" (always 120 because there's one possible score), press SPACE to replay. `unlockLevel()` exists but is never called. There is no level 2.

**Dead Cells** has branching upgrades, permanent unlocks, escalating difficulty, narrative progression. **Celeste** has B-sides, C-sides, golden strawberries, chapter select. This game has a localStorage integer that goes up.

**9+ requires:** Multi-level campaign with star ratings, permanent unlocks, difficulty curve, narrative breadcrumbs, prestige systems.

### 9. Retention/Meta — 1/10

Nothing gives a player a reason to open this app a second time. No daily challenges. No leaderboards. No friends. No streaks. No unlockables. D1 retention would be 0%.

**9+ requires:** Daily challenges, weekly tournaments, global leaderboards, 50+ achievements, seasonal content, push notifications, social sharing.

### 10. Technical — 2/10

Plain JavaScript, no TypeScript. Zero tests. No linting. No CI/CD. No error handling. Walk animation hardcodes `+= 16` instead of delta time. Magic numbers everywhere. Deploy is manual `gh-pages` push.

**9+ requires:** TypeScript, 80%+ coverage, ESLint + Prettier, GitHub Actions CI, crash reporting, analytics, feature flags, automated deployment.

### 11. Monetization — 0/10

Zero revenue. `WalletBridge.js` is 109 lines of stubs returning `false`. Even if implemented, `calculateReward()` yields 0.0012 BAN per perfect game — approximately $0.000003.

**9+ requires:** Rewarded video ads, ad removal IAP, cosmetic skins, battle pass, all A/B tested, GDPR/COPPA compliant.

### 12. Performance — 3/10

No device testing (no touch controls to test with). No bundle splitting. No texture atlasing. No object pooling. No render culling. SVG files loaded individually. Framerate-dependent animation timer. No performance monitoring.

**9+ requires:** Texture atlases, object pooling, render culling, delta-time everywhere, <2MB bundle, lazy-loaded assets, 60fps on $100 Android devices.

---

## REVISED SCORECARD

| Category | Original | Actual | Delta |
|----------|----------|--------|-------|
| Core Gameplay | 6.5 | **3** | -3.5 |
| Game Feel/Juice | 7 | **4** | -3 |
| Content Depth | 6 | **2** | -4 |
| Audio | 5.5 | **1** | -4.5 |
| Visual Polish | 5 | **2** | -3 |
| Mobile/Touch | 6 | **1** | -5 |
| UI/UX | 7 | **4** | -3 |
| Progression | 6.5 | **2** | -4.5 |
| Retention/Meta | 5 | **1** | -4 |
| Technical | 5 | **2** | -3 |
| Monetization | 0 | **0** | 0 |
| Performance | 5 | **3** | -2 |
| **OVERALL** | **5.4** | **2.1** | **-3.3** |

---

## ROADMAP: 2.1/10 → 9+/10

### Phase 0: Stability & Testing Hell (Sprint 1 — Week 1-2)

**Goals/KPIs:**
- 100% build success rate
- ESLint 0 errors, Prettier enforced
- 80%+ unit test coverage on services/config
- CI pipeline green on every push
- Delta-time bug fixed

**Tasks:**

1. **TypeScript migration** — Rename `.js` → `.ts`, add `tsconfig.json`, fix all type errors. 8 files, 1500 lines.

2. **Fix framerate bug** in Player.js:
```ts
update(time: number, delta: number) {
  this.walkTimer += delta; // NOT += 16
  if (this.walkTimer > 150) { ... }
}
```

3. **ESLint + Prettier** — Install, configure, add pre-commit hook via husky.

4. **Vitest** — Unit tests for StorageService (mock localStorage), gameConfig (validate schemas), Coin.collect() returns. Target 80% coverage on non-scene code.

5. **GitHub Actions CI:**
```yaml
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

6. **Error boundaries** — Wrap scene create/update in try/catch. Add window.onerror handler.

**Effort:** 1 developer, 2 weeks.

---

### Phase 1: Core Loop & Juice Overhaul (Sprint 2-3 — Week 3-6)

**Goals/KPIs:**
- Player can die (spikes, pits, enemies)
- 3 enemy types with AI
- Screen shake, particles, camera lerp
- Coyote time, jump buffering, variable jump height
- Playtesters say "one more try"

**Tasks:**

1. **Add death.** Remove `setCollideWorldBounds`. Add bottomless pits, spike tiles. Death animation → respawn.

2. **Add enemies:**
   - **Walker** — Patrols platform edge to edge, dies if stomped from above
   - **Jumper** — Hops in place, higher threat zone
   - **Flyer** — Sine wave movement, cannot be stomped

3. **Variable jump height:**
```ts
if (jumpReleased && this.body.velocity.y < -200) {
  this.setVelocityY(this.body.velocity.y * 0.5);
}
```

4. **Coyote time (80ms grace period after leaving platform edge):**
```ts
if (onGround) { this.coyoteTimer = 80; }
else { this.coyoteTimer -= delta; }
const canJump = this.coyoteTimer > 0;
```

5. **Jump buffering (100ms input buffer before landing):**
```ts
// On jump press:
this.jumpBufferTimer = 100;
// Each frame:
if (onGround && this.jumpBufferTimer > 0) { this.doJump(); }
```

6. **Camera system** — Scrolling world larger than one screen. `this.cameras.main.startFollow(player, true, 0.1, 0.1)` with dead zones.

7. **Juice pass:**
   - Dust particles on land/run/wall-slide
   - Screen shake on death: `this.cameras.main.shake(200, 0.01)`
   - Hit-freeze on enemy stomp (50ms pause)
   - Landing squash proportional to fall distance
   - Speed lines at max velocity
   - Coin magnet pull in last 40px

**Effort:** 2 developers, 4 weeks.

---

### Phase 2: Art & Audio Premiumization (Sprint 4-5 — Week 7-10)

**Goals/KPIs:**
- Cohesive art style across all sprites/tiles/backgrounds
- Original soundtrack (3+ tracks)
- SFX for every player action
- No placeholder art visible
- Beta feedback: "looks/sounds great"

**Tasks:**

1. **Commit to pixel art** (most achievable for budget). Hire Aseprite artist ($300-500 for tileset + character + enemies + UI).

2. **Delete `generatePlaceholderGraphics()` entirely.** Load real sprite sheets:
```ts
this.load.spritesheet('player-idle', 'assets/player-idle.png', { frameWidth: 32, frameHeight: 32 });
this.load.spritesheet('player-run', 'assets/player-run.png', { frameWidth: 32, frameHeight: 32 });
```

3. **Proper Phaser animations:**
```ts
this.anims.create({
  key: 'run',
  frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 5 }),
  frameRate: 10,
  repeat: -1
});
```

4. **Texture atlas** via TexturePacker. Single draw call.

5. **SFX:** Jump, land, footsteps, coin collect (pitch up on consecutive collects), enemy stomp, death, respawn, level complete, UI tap.

6. **Music:** 3 tracks minimum (menu, gameplay, boss). Royalty-free or commission ($100-200/track).

7. **Dynamic music layering:**
```ts
this.bgmBase = this.sound.add('bgm-base', { loop: true });
this.bgmPerc = this.sound.add('bgm-perc', { loop: true, volume: 0 });
// Fade in percussion near enemies
this.tweens.add({ targets: this.bgmPerc, volume: 1, duration: 1000 });
```

**Effort:** 4 weeks. Commission art in Phase 1.

---

### Phase 3: Level Design & Variety Explosion (Sprint 6-8 — Week 11-16)

**Goals/KPIs:**
- 5 worlds × 10 levels = 50 levels
- Unique mechanic per world
- Boss at end of every world (5 bosses)
- Tiled editor integration
- Level time: 30-90 seconds each

**Tasks:**

1. **Tiled Map Editor integration:**
```ts
this.load.tilemapTiledJSON('level-1-1', 'assets/levels/world1/level1.json');
const map = this.make.tilemap({ key: 'level-1-1' });
const tileset = map.addTilesetImage('tileset', 'tileset');
const ground = map.createLayer('ground', tileset);
ground.setCollisionByProperty({ collides: true });
```

2. **World themes:**
   - **World 1: Jungle** — Basic platforming (Walkers only)
   - **World 2: Ice Caves** — Slippery physics, falling icicles
   - **World 3: Sky Temples** — Wind gusts, crumbling platforms
   - **World 4: Lava Depths** — Rising lava floor, fire jets
   - **World 5: Shadow Realm** — Limited visibility spotlight, shadow clone enemy

3. **Boss design:** Each tests the world's mechanic:
   - W1: Giant Ape (dodge barrels, stomp head 3×)
   - W2: Ice Wyrm (slides across floor, use ice crystals)
   - W3: Storm Eagle (use wind to reach it)
   - W4: Lava Golem (sinking platforms, hit weak point)
   - W5: Shadow Self (mirrors moves, trick into hazards)

4. **Star rating:** 1 star (complete), 2 stars (all coins), 3 stars (under par time).

5. **Secret areas** behind fake walls, bonus coin rooms.

**Effort:** 6 weeks. Tiled integration 2-3 days; rest is design iteration.

---

### Phase 4: Mobile & Performance Mastery (Sprint 9-10 — Week 17-20)

**Goals/KPIs:**
- Touch controls feel native
- 60fps on 3+ year old devices
- Bundle < 2MB, lazy-load per world
- Haptic feedback on all key actions
- Capacitor Android build

**Tasks:**

1. **Touch controls** — Virtual buttons (not gestures for precision):
```ts
const jumpBtn = this.add.rectangle(1160, 620, 120, 120, 0x000000, 0.3)
  .setInteractive().setScrollFactor(0);
jumpBtn.on('pointerdown', () => { this.touchInput.jump = true; });
jumpBtn.on('pointerup', () => { this.touchInput.jump = false; });
```

2. **Capacitor:**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Banano Quest" com.banano.quest --web-dir dist
npx cap add android
npm run build && npx cap sync
```

3. **Haptics:**
```ts
import { Haptics, ImpactStyle } from '@capacitor/haptics';
await Haptics.impact({ style: ImpactStyle.Light }); // jump
await Haptics.impact({ style: ImpactStyle.Heavy }); // death
```

4. **Performance:** Texture atlas, object pooling, off-screen culling, lazy-load per world (<500KB each).

5. **Device testing:** Firebase Test Lab — low-end (Galaxy A03), mid (Pixel 4a), high (Pixel 7). 60fps mid-range, 30fps minimum low-end.

6. **Adaptive quality:**
```ts
const isLowEnd = navigator.hardwareConcurrency <= 4;
if (isLowEnd) { this.particleCount = 4; this.disableParallax(); }
```

**Effort:** 4 weeks.

---

### Phase 5: Retention & Meta Systems (Sprint 11-12 — Week 21-24)

**Goals/KPIs:**
- D1 retention: 40%+
- D7 retention: 15%+
- Avg session: 8+ minutes
- 50+ achievements
- Global leaderboard active

**Tasks:**

1. **Daily challenges** — Procedurally-modified level seeded by date. Modifiers: "All coins move," "Low gravity," "Speed run," "No checkpoints."

2. **50+ achievements** — Collection, skill, discovery, social categories. Progress bars.

3. **Global leaderboards** — Firebase. Per-level fastest times, weekly coins, daily challenge rankings.

4. **Streak system** — Consecutive days = multiplied rewards. Push notification if streak at risk.

5. **Character unlocks** — Cosmetic skins earned through gameplay.

6. **Push notifications** via FCM — max 1/day.

**Effort:** 4 weeks.

---

### Phase 6: Monetization Blitz (Sprint 13-14 — Week 25-28)

**Goals/KPIs:**
- ARPU > $0.05
- Ad fill > 95%
- IAP conversion > 2%
- Zero pay-to-win
- GDPR/COPPA compliant

**Tasks:**

1. **Rewarded video ads** (AdMob) — Extra life, 2x coins, daily challenge hint. Max 5/session. Always optional.

2. **Interstitial ads** — Between worlds only, skip after 5s, max 1 per 5 minutes.

3. **IAP:** Remove Ads ($2.99), Cosmetic bundles ($0.99-$4.99), Coin doubler ($1.99).

4. **Firebase A/B testing** — Ad frequency, IAP pricing, reward amounts.

5. **Analytics** — Level start/complete/fail, ad watched/skipped, IAP funnel, session length.

**Effort:** 4 weeks.

---

### Phase 7: Final Polish & Launch (Sprint 15-17 — Week 29-34)

**Goals/KPIs:**
- Play Store: 4.8+ stars
- Crash rate: < 0.1%
- Load time: < 2 seconds
- 1,000+ beta testers
- ASO: top 50 in "platformer"

**Tasks:**

1. **Closed beta** — 100 testers, in-game survey, fix top 10 issues.
2. **Open beta** — 1,000 testers. Firebase Crashlytics monitoring.
3. **Play Store ASO** — Keyword-rich title, screenshots, feature graphic, 30s trailer.
4. **Loading optimization** — Async loading, <2s to menu.
5. **Accessibility** — Colorblind mode, text scaling, one-handed mode, reduced motion.
6. **Localization** — English, Spanish, Portuguese, Japanese, Korean.
7. **Launch marketing** — Reddit, Banano community, YouTube/TikTok reviewers.

**Effort:** 6 weeks.

---

## TIMELINE SUMMARY

| Phase | Weeks | Sprints | Focus |
|-------|-------|---------|-------|
| 0 | 1-2 | S1 | TypeScript, tests, CI, bugfixes |
| 1 | 3-6 | S2-3 | Death, enemies, juice, camera |
| 2 | 7-10 | S4-5 | Real art, real audio |
| 3 | 11-16 | S6-8 | 50 levels, 5 worlds, 5 bosses |
| 4 | 17-20 | S9-10 | Touch controls, Capacitor, 60fps |
| 5 | 21-24 | S11-12 | Dailies, leaderboards, achievements |
| 6 | 25-28 | S13-14 | Ads, IAP, Firebase A/B |
| 7 | 29-34 | S15-17 | Beta, polish, ASO, launch |
| **Total** | **34 weeks** | **17 sprints** | **2.1 → 9+** |

---

## VERDICT

**2.1/10 is not a game. It's proof that Phaser renders rectangles.**

The original 5.4 self-score was built on features that don't exist — "3 enemies" (zero), "4 power-ups" (zero), "12 levels" (one), "procedural SFX" (silence). Strip away the wishful thinking and you have a single-screen coin collector with no fail state, no audio, no touch controls, and placeholder art that the code itself labels "placeholder."

## THE 9+ VISION

A monkey platformer where every jump feels like butter — variable height, coyote time, wall-slides with dust trails. Five hand-crafted worlds that each break the rules: ice physics, wind gusts, rising lava, darkness. Boss fights that test mastery of each world's mechanic. Pixel art that's crisp and colorful with parallax backgrounds 5 layers deep. A soundtrack that shifts from chill exploration to heart-pounding boss encounters. Daily challenges seeded by date so the whole community races the same level. Leaderboards with ghost replays. A battle pass of cosmetic monkey skins. 60fps on a phone from 2021.

That's a 9. That's 4.8 stars. That's 1M downloads.

## CALL TO ACTION

This roadmap is 34 weeks of work. Not 34 weeks of "I'll get to it." Thirty-four weeks of shipping a sprint every two weeks, testing on real devices, killing your darlings, and replacing every placeholder with something a stranger would pay money for.

The codebase is clean enough to build on — that's the one thing going for it. The architecture is modular. The scene system is correct. You have a foundation.

But a foundation is not a house. And right now you're trying to charge rent for a concrete slab.

Execute. Ship. Measure. Iterate. Or delete the repo and save yourself the embarrassment of a 1-star review that says "there's only one level and no sound."
