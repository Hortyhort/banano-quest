# BANANO QUEST — Production Sprint Plan

**Project:** Banano Quest
**Target Platform:** Android (primary), iOS (secondary), Web (tertiary)
**Sprint Cadence:** 2-week sprints
**Team Assumption:** Solo dev or 2-person team
**Goal:** Ship a polished, retainable mobile platformer to the Google Play Store

---

## CURRENT STATE ASSESSMENT

### What Exists (Prototype)
| Area | Status | Detail |
|------|--------|--------|
| Engine | Done | Phaser 3.70 + Vite 5 |
| Player Movement | Done | Walk, jump, squash-stretch, 4 SVG animation frames |
| Coin Collection | Done | 12 coins, particles, floating score text |
| Platforms | Done | 9 static platforms, tiled textures |
| Touch Controls | Done | Virtual d-pad + jump button, multi-touch |
| Scoring | Done | Score tracking, floating +10 text |
| Persistence | Done | localStorage high score, total coins, level unlock tracking |
| UI HUD | Done | Score, high score, level display with animated panels |
| Menu | Done | Animated title, play button, monkey preview |
| Wallet Bridge | Stub | Empty skeleton, not connected to anything |

### Critical Gaps (Why Nobody Would Play This)
| Gap | Severity | Impact |
|-----|----------|--------|
| **No fail state** | BLOCKER | Cannot lose. No enemies, no death, no hazards, no timer. Not a game. |
| **1 level only** | BLOCKER | 45 seconds of content. No reason to return. |
| **No sound** | HIGH | Silent game feels broken on mobile. |
| **No pause** | HIGH | Can't stop playing without losing progress. App backgrounding = chaos. |
| **No difficulty curve** | HIGH | No escalation, no challenge, no mastery arc. |
| **No tutorial** | MEDIUM | Controls aren't self-evident on mobile. |
| **No achievements/progression** | MEDIUM | No long-term retention hook. |
| **No Android packaging** | MEDIUM | Can't ship to Play Store as a web page. |
| **1.5MB single JS bundle** | LOW | Acceptable for now, needs splitting before store. |

---

## SPRINT 1 — CORE LOOP: "Make It a Game"

**Goal:** A player can die, lose lives, encounter enemies, and face a real challenge.
**This is the most important sprint. Without a fail state, nothing else matters.**

### Stories

#### S1.1: Enemy System — Patrolling Slimes
- Create `Enemy` base class extending `Phaser.Physics.Arcade.Sprite`
- Implement `PatrolEnemy` — walks back and forth on a platform
- Generate procedural slime sprite (green blob with eyes) in BootScene
- Config-driven: `{ x, y, patrolDistance, speed }` per level data
- Collision: player hits enemy from above = kill enemy (+25 pts, bounce)
- Collision: player hits enemy from the side/below = player takes damage
- Death animation for enemy (squish + fade)
- Add 4-6 enemies to Level 1 data
- **AC:** Player can stomp enemies and die from side contact

#### S1.2: Player Death & Respawn
- Add lives system: start with 3 lives
- Death trigger: enemy side-hit, falling off bottom of screen
- Death animation: player flashes red, shrinks, fades (0.8s)
- Brief invincibility period after respawn (2s, player flashes)
- Respawn at last checkpoint or level start
- Lives display in UIScene (3 heart icons)
- Game Over screen when lives = 0 (show score, high score, play again)
- **AC:** Player dies on enemy contact, respawns with invincibility, game over at 0 lives

#### S1.3: Hazards — Spikes
- Create spike hazard sprite (procedural triangles)
- Place on specific platforms and ground sections
- Instant death on contact (same as enemy side-hit)
- Add to Level 1 config data
- **AC:** Touching spikes kills the player

#### S1.4: Pause Menu
- Pause button in top-right corner (touch-friendly, 60x60 hit area)
- Keyboard shortcut: ESC or P
- Pause overlay: dim background, show "PAUSED" text
- Options: Resume, Restart Level, Quit to Menu
- Auto-pause when browser tab loses focus / app backgrounds
- `scene.physics.pause()` / `scene.physics.resume()` for clean state
- **AC:** Game pauses on button/key press and on tab blur, resumes cleanly

#### S1.5: Fall Death
- If player.y > GAME_HEIGHT + 50, trigger death
- Screen shake on death (camera shake 100ms)
- Subtract 1 life, respawn
- **AC:** Falling off screen kills player and respawns them

### Definition of Done — Sprint 1
- [ ] Player can die 3 different ways (enemy, spikes, falling)
- [ ] Game Over screen appears at 0 lives
- [ ] Enemy stomping works reliably
- [ ] Pause/resume works on mobile and desktop
- [ ] Level 1 is genuinely challenging (most players die at least once)
- [ ] Build passes (`npm run build`)

---

## SPRINT 2 — CONTENT & PROGRESSION: "Give Them a Reason to Come Back"

**Goal:** 5 playable levels with escalating difficulty, a level select screen, and star ratings.

### Stories

#### S2.1: Level Data Architecture
- Refactor `gameConfig.js` into a `levels/` directory
- Each level: `{ platforms, coins, enemies, hazards, theme, par_time }`
- Level loader in GameScene reads current level from state
- Level transition: complete level N -> unlock level N+1 -> show results -> proceed
- **AC:** Game loads arbitrary level data from config

#### S2.2: Design Levels 2-5
- **Level 2 — Forest:** Introduce moving platforms (horizontal), more enemies
- **Level 3 — Cave:** Vertical level, tight jumps, spike-heavy, low enemy count
- **Level 4 — Sky:** Lots of gaps, cloud platforms (thin), fast patrol enemies
- **Level 5 — Volcano:** Everything combined, fire hazards, hardest platforming
- Each level: 15-20 coins, 4-8 enemies, 2-4 hazard zones
- Each level must be completeable in 60-120 seconds by a skilled player
- **AC:** 5 levels with distinct layouts, all completeable, difficulty escalates

#### S2.3: Level Select Screen
- Grid of 5 level buttons (expandable)
- Locked levels show padlock icon
- Unlocked levels show best star rating (0-3 stars)
- Stars based on: coins collected / total coins in level
- Accessible from main menu
- **AC:** Player can select unlocked levels, see star ratings

#### S2.4: Level Themes — Visual Variety
- Each level has a distinct background color palette and hill style
- Level 3 (Cave): dark background, stalactite decorations
- Level 4 (Sky): cloud background, no hills
- Level 5 (Volcano): red/orange sky, lava at bottom instead of ground
- Theme config per level: `{ skyColors, hillColors, bgDecorations }`
- **AC:** Each level looks visually distinct

#### S2.5: Level Results Screen
- Show after level complete (replace current simple overlay)
- Display: time taken, coins collected, star rating, score
- Animated star reveal (1 star at a time)
- Buttons: Next Level, Retry, Level Select
- **AC:** Results screen shows performance breakdown with star animation

### Definition of Done — Sprint 2
- [ ] 5 playable levels, all with enemies and hazards
- [ ] Level select screen with star ratings and lock states
- [ ] Each level has a unique visual theme
- [ ] Level unlock persists in localStorage
- [ ] Difficulty clearly escalates from Level 1 to Level 5
- [ ] Build passes

---

## SPRINT 3 — AUDIO: "If It's Silent, It's Broken"

**Goal:** Full sound design. Jump, land, collect, die, stomp, complete, menu music, level music.

### Stories

#### S3.1: Audio Manager Service
- Create `AudioManager` singleton service
- Methods: `playSound(key)`, `playMusic(key)`, `stopMusic()`, `setVolume()`
- Respect mute/volume settings from StorageService
- Handle browser autoplay restrictions (unlock audio context on first user interaction)
- **AC:** Centralized audio playback with mute support

#### S3.2: Sound Effects (Procedural or Free Assets)
- Generate or source (CC0) the following SFX:
  - `jump` — short upward whoosh
  - `land` — soft thud
  - `coin_collect` — bright chime / ding
  - `enemy_stomp` — satisfying squish
  - `player_death` — descending tone
  - `level_complete` — victory fanfare (3-note ascending)
  - `game_over` — sad descending tone
  - `menu_click` — UI click
  - `star_reveal` — sparkle sound (for results screen)
- Use Web Audio API to generate procedural sounds if no assets available
- **AC:** Every major game event has audio feedback

#### S3.3: Background Music
- Menu music: cheerful, looping, 30-60 second loop
- Gameplay music: upbeat, per-level or shared, looping
- Use procedural generation (simple melody via Web Audio) or source CC0 tracks
- Music fades on scene transitions
- **AC:** Music plays in menu and during gameplay, respects settings

#### S3.4: Settings Screen
- Accessible from: Main Menu, Pause Menu
- Controls: Sound toggle, Music toggle, volume slider (optional, toggles are MVP)
- Settings persist via StorageService
- Visual feedback on toggle (on/off icons)
- **AC:** Player can mute sound/music independently, settings persist

#### S3.5: Haptic Feedback (Mobile)
- `navigator.vibrate()` on: jump (10ms), coin collect (15ms), enemy stomp (20ms), death (100ms pattern)
- Respect a haptics toggle in settings
- Only fire on devices that support vibration API
- **AC:** Phone vibrates on key game events, can be disabled

### Definition of Done — Sprint 3
- [ ] All game events have sound effects
- [ ] Background music loops in menu and gameplay
- [ ] Settings screen with sound/music toggles
- [ ] Haptic feedback works on Android
- [ ] Audio unlocks correctly despite browser autoplay policy
- [ ] Build passes

---

## SPRINT 4 — GAME FEEL & POLISH: "The Difference Between Amateur and Professional"

**Goal:** Screen shake, camera juice, particle upgrades, tutorial, death screen polish.

### Stories

#### S4.1: Camera Juice
- Screen shake on: death (200ms, intensity 5), enemy stomp (80ms, intensity 3)
- Camera follow player with lerp (smooth tracking, slight delay)
- Wider levels: camera bounded to level dimensions, doesn't show void
- Zoom pulse on level complete (quick 1.05x zoom out and back)
- **AC:** Camera feels alive, not static

#### S4.2: Improved Particle System
- Dust puffs on landing (3-5 small brown circles spreading)
- Speed lines when running fast (>80% max speed)
- Death particles (player explodes into colored fragments)
- Enemy death: green goo particles
- **AC:** Visual feedback for every major physics event

#### S4.3: Tutorial / First Play
- Detect first-time player (localStorage flag)
- Level 1 only: show contextual prompts
  - Mobile: animated hand icons on virtual buttons ("Tap to move", "Tap to jump")
  - Desktop: "Arrow keys to move, SPACE to jump"
- Prompts fade after player performs the action
- Show "Watch out!" arrow near first enemy
- Never show tutorial again after completion
- **AC:** Brand new players understand controls within 10 seconds

#### S4.4: Loading & Splash Screen
- Branded splash: Banano Quest logo + monkey, 1.5s minimum display
- Smooth transition to menu (fade)
- Loading bar only shows if actual loading > 1s
- **AC:** Professional first impression, no jarring loads

#### S4.5: Moving Platforms
- Create `MovingPlatform` class
- Horizontal movement: back-and-forth between two x-coords
- Vertical movement: back-and-forth between two y-coords
- Player rides platform (velocity inheritance)
- Used in Levels 2-5
- **AC:** Platforms move smoothly, player can ride them

#### S4.6: Falling Platforms
- Platform that shakes briefly (0.5s) after player lands, then falls
- Respawns after 3 seconds
- Visual warning: platform changes color slightly before falling
- Used sparingly in Levels 3-5
- **AC:** Platform collapses after player stands on it, respawns

### Definition of Done — Sprint 4
- [ ] Camera feels polished with shake and smooth follow
- [ ] Particles on landing, running, death, enemy stomp
- [ ] New players understand controls via tutorial
- [ ] Moving and falling platforms work in levels 2-5
- [ ] Build passes

---

## SPRINT 5 — POWER-UPS & VARIETY: "Keep Surprising the Player"

**Goal:** Power-ups that change gameplay, a boss encounter, new enemy types.

### Stories

#### S5.1: Power-Up System
- Create `PowerUp` base class
- Spawns from special "?" blocks when hit from below (like Mario)
- Active power-up shown in HUD
- Duration-based: 8 seconds per power-up
- Visual indicator: glowing player outline while powered up
- **AC:** Power-up framework works, player can collect and use power-ups

#### S5.2: Power-Up Types (3 minimum)
- **Speed Boost:** 1.5x movement speed, blue glow
- **Double Jump:** One extra jump in mid-air, white glow
- **Magnet:** Coins within 150px radius pull toward player, yellow glow
- Each has a distinct pickup sprite (colored star variants)
- **AC:** 3 power-ups with distinct gameplay effects

#### S5.3: New Enemy — Flying Enemy
- Moves in sine-wave pattern through the air
- Cannot be stomped (or can only be stomped during downward arc)
- Shoots no projectiles (keep it simple)
- Used in Levels 4-5
- **AC:** Flying enemies patrol air space, create aerial hazards

#### S5.4: New Enemy — Charging Enemy
- Stationary until player is within detection range (200px)
- Then charges toward player at 2x speed
- Can be stomped
- Used in Level 5
- **AC:** Enemies react to player proximity

#### S5.5: Level 5 Boss Encounter (Stretch Goal)
- End of Level 5: large enemy that takes 3 stomps to defeat
- Attack pattern: charge left-right, pause, repeat
- Health bar shown above boss
- Defeating boss triggers special victory sequence
- **AC:** Boss fight feels climactic and satisfying

### Definition of Done — Sprint 5
- [ ] 3 power-ups work with visual/gameplay feedback
- [ ] 2 new enemy types in later levels
- [ ] Boss fight in Level 5 (or flagged as stretch)
- [ ] "?" blocks placed in levels 2-5
- [ ] Build passes

---

## SPRINT 6 — METAGAME & RETENTION: "Why Open the App Tomorrow?"

**Goal:** Achievements, lifetime stats, unlockable cosmetics, daily challenge.

### Stories

#### S6.1: Achievements System
- 12-15 achievements stored in localStorage
- Examples:
  - "First Steps" — Complete Level 1
  - "Coin Hoarder" — Collect 500 lifetime coins
  - "Perfectionist" — 3-star any level
  - "Untouchable" — Complete a level without taking damage
  - "Speed Demon" — Complete Level 1 in under 30 seconds
  - "Completionist" — 3-star all levels
  - "Stomper" — Stomp 50 enemies
- Toast notification on unlock (slide in from top, 2s display)
- Achievements screen accessible from main menu
- **AC:** Achievements trigger, persist, and display correctly

#### S6.2: Stats Screen
- Accessible from main menu
- Show: total play time, total coins, total deaths, total enemies stomped
- Show: best time per level, completion percentage
- Clean grid layout
- **AC:** Player can view comprehensive lifetime stats

#### S6.3: Unlockable Monkey Skins (Stretch)
- 3-4 color variants for the monkey sprite
- Unlock via achievements or coin thresholds
- Character select before starting a level
- Skins stored in localStorage
- **AC:** Player can earn and equip cosmetics

#### S6.4: Daily Challenge (Stretch)
- Procedurally seeded level based on current date
- Unique platform/coin/enemy layout each day
- Separate leaderboard (local only for MVP)
- "Today's Challenge" button on main menu
- **AC:** New challenge every day, score tracked separately

### Definition of Done — Sprint 6
- [ ] Achievement system with 12+ achievements
- [ ] Toast notifications on unlock
- [ ] Stats screen shows lifetime data
- [ ] At least one stretch goal completed
- [ ] Build passes

---

## SPRINT 7 — PLATFORM PACKAGING: "Make It Installable"

**Goal:** Ship as a real Android app via Capacitor. PWA fallback for iOS/web.

### Stories

#### S7.1: PWA Manifest & Service Worker
- Add `manifest.json` with app name, icons, theme color, display: standalone
- Generate icon set: 48, 72, 96, 144, 192, 512px
- Service worker for offline play (cache game bundle + assets)
- Add install prompt for supported browsers
- **AC:** Game installable as PWA, works offline

#### S7.2: Capacitor Integration
- `npm install @capacitor/core @capacitor/cli`
- `npx cap init` with Android platform
- Configure: app name, bundle ID (`com.bananoqust.game`), version
- Verify build: `npm run build && npx cap sync android`
- Test on Android emulator
- **AC:** APK builds and runs on Android emulator

#### S7.3: App Lifecycle
- Pause game when app goes to background (`document.addEventListener('visibilitychange')`)
- Resume correctly when app returns to foreground
- Save state on pause (current level, score, lives)
- Handle back button on Android (pause menu or confirm exit)
- **AC:** App handles background/foreground transitions gracefully

#### S7.4: Performance Optimization
- Code splitting: Phaser loaded as separate chunk
- Texture atlas: combine all procedural textures into sprite sheet
- Lazy-load levels (only load current level data)
- Target: < 500KB initial JS, < 3s load on mid-range phone
- Profile on low-end device (Chrome DevTools throttling)
- **AC:** Measurably faster load, no frame drops on mid-range Android

#### S7.5: Orientation Lock
- Force landscape orientation via Capacitor config
- CSS fallback: show "rotate your device" overlay in portrait
- Screen.orientation.lock('landscape') where supported
- **AC:** Game always plays in landscape

### Definition of Done — Sprint 7
- [ ] APK builds and runs on Android emulator
- [ ] PWA works offline with manifest
- [ ] App pauses/resumes correctly on background
- [ ] Landscape locked on Android
- [ ] Load time < 3s on mid-range device
- [ ] Build passes

---

## SPRINT 8 — STORE PREP & LAUNCH: "Ship It"

**Goal:** Everything needed to submit to Google Play Store and not get rejected.

### Stories

#### S8.1: Store Assets
- App icon: 512x512 high-res icon (monkey face + coin)
- Feature graphic: 1024x500 (game screenshot with logo overlay)
- Screenshots: 4-8 screenshots at required resolutions (phone + tablet)
  - Menu screen, gameplay, level complete, level select, boss fight
- 30-second promotional video (screen recording with music)
- **AC:** All required Play Store visual assets ready

#### S8.2: Store Listing
- App title: "Banano Quest: Monkey Platformer"
- Short description (80 char): "Jump, stomp, and collect Banano coins in this fast platformer!"
- Full description (4000 char): Features list, gameplay description, future plans
- Category: Games > Action > Platformer
- Content rating questionnaire completed
- **AC:** Store listing text finalized and approved

#### S8.3: Privacy Policy & Legal
- Privacy policy page (hosted on GitHub Pages)
- Disclose: localStorage usage, no personal data collection, no ads (MVP)
- No third-party SDKs in MVP = minimal privacy exposure
- Terms of service (simple)
- **AC:** Privacy policy URL live, compliant with Play Store requirements

#### S8.4: QA Pass
- Test on: 3 screen sizes (small phone, large phone, tablet)
- Test: all 5 levels start to finish
- Test: all achievements trigger correctly
- Test: pause/resume on every screen
- Test: audio works after autoplay unlock
- Test: touch controls responsive, no dead zones
- Test: no memory leaks (play 30 minutes straight)
- Fix all P0/P1 bugs found
- **AC:** Zero known P0 bugs, all P1 bugs documented

#### S8.5: Soft Launch & Analytics
- Integrate lightweight analytics (self-hosted or simple event tracking)
- Track: daily active users, level completion rates, session duration
- Track: where players die most (heatmap data via events)
- Soft launch to closed testing track (10-20 testers)
- Collect feedback for 1 week before public launch
- **AC:** Analytics pipeline working, feedback collected from testers

#### S8.6: Public Launch
- Promote testing track to production
- Submit for Play Store review
- Prepare social media announcement
- Monitor crash reports and reviews for 72 hours post-launch
- Hotfix plan ready (Capacitor live update or store update)
- **AC:** App live on Google Play Store

### Definition of Done — Sprint 8
- [ ] App approved and live on Google Play Store
- [ ] Zero P0 bugs
- [ ] Analytics collecting data
- [ ] Privacy policy published
- [ ] Soft launch feedback addressed

---

## SPRINT DEPENDENCY MAP

```
Sprint 1 (Core Loop) ─────────────────────────────────────────────┐
    │                                                              │
Sprint 2 (Content) ──── Sprint 3 (Audio) [parallel possible]      │
    │                       │                                      │
    └───────┬───────────────┘                                      │
            │                                                      │
       Sprint 4 (Polish) ─── Sprint 5 (Power-ups)                 │
            │                       │                              │
            └───────┬───────────────┘                              │
                    │                                              │
               Sprint 6 (Metagame)                                 │
                    │                                              │
               Sprint 7 (Packaging) ◄─────────────────────────────┘
                    │
               Sprint 8 (Launch)
```

**Critical path:** S1 -> S2 -> S4 -> S7 -> S8
**Parallelizable:** S2 and S3 can run concurrently. S5 and S6 are semi-parallel.

---

## RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Level design isn't fun | HIGH | BLOCKER | Playtest every level with 3+ real humans. Iterate. |
| Touch controls feel bad | MEDIUM | HIGH | Tune dead zones, button sizes, response time. A/B test layouts. |
| Audio autoplay blocked | HIGH | MEDIUM | Unlock audio context on first user tap (standard pattern). |
| Capacitor build issues | MEDIUM | MEDIUM | Prototype in Sprint 2, don't wait until Sprint 7. |
| Phaser performance on low-end Android | MEDIUM | HIGH | Profile early (Sprint 4). Reduce draw calls, limit particles. |
| Google Play Store rejection | LOW | HIGH | Follow content policies. No real-money Banano rewards in v1. |
| Scope creep (wallet integration, multiplayer) | HIGH | HIGH | Wallet bridge stays a stub until post-launch. No multiplayer in v1. |

---

## WHAT'S EXPLICITLY OUT OF SCOPE FOR V1

- Banano wallet integration (post-launch, requires legal review)
- Multiplayer or social features
- In-app purchases or ads
- iOS App Store submission (PWA only for iOS in v1)
- Cloud save / cross-device sync
- Level editor
- Localization / i18n

---

## VELOCITY ASSUMPTION

Based on current codebase quality and tooling:
- Sprint 1: Highest risk. ~15-20 story points. Enemy system is the biggest unknown.
- Sprint 2: Content-heavy. Level design is time-consuming to get right.
- Sprint 3: Moderate. Procedural audio is tricky but well-documented.
- Sprint 4-6: Polish sprints. Faster velocity, fewer unknowns.
- Sprint 7-8: Platform/ops work. Known patterns, lower risk.

**Estimated timeline:** 16 weeks (8 sprints x 2 weeks) from prototype to Play Store.

---

*This plan assumes the Banano wallet integration is deferred to post-launch. The wallet bridge stub stays in the codebase but is not exposed to users in v1. Crypto features add legal, regulatory, and technical complexity that would delay launch by 4-8 additional weeks minimum.*
