// ─────────────────────────────────────────────────────────────
// Level data for Banano Quest
// Each level defines: theme, layout, entities, and player spawn
// ─────────────────────────────────────────────────────────────

export const LEVELS = [

  // ═══════════════════════════════════════════════════════════
  // LEVEL 1 — JUNGLE CANOPY
  // Introductory. Full ground, generous platforms.
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Jungle Canopy',
    icon: '\u{1F333}',
    theme: {
      skyGradient: [0x87CEEB, 0x87CEEB, 0xB3E5FC, 0xB3E5FC],
      hillColors: [0x81C784, 0x66BB6A],
      decoration: 'clouds',
      platformTint: null,
      groundTint: null
    },
    playerStart: { x: 100, y: 500 },
    platforms: [
      { x: 640, y: 690, width: 1280, height: 60 },
      { x: 200, y: 550, width: 200, height: 32 },
      { x: 500, y: 450, width: 200, height: 32 },
      { x: 800, y: 550, width: 200, height: 32 },
      { x: 1050, y: 450, width: 200, height: 32 },
      { x: 350, y: 350, width: 200, height: 32 },
      { x: 700, y: 300, width: 250, height: 32 },
      { x: 1000, y: 200, width: 200, height: 32 },
      { x: 150, y: 200, width: 150, height: 32 }
    ],
    coins: [
      { x: 200, y: 500 }, { x: 500, y: 400 }, { x: 800, y: 500 },
      { x: 1050, y: 400 }, { x: 350, y: 300 }, { x: 650, y: 250 },
      { x: 750, y: 250 }, { x: 1000, y: 150 }, { x: 150, y: 150 },
      { x: 640, y: 640 }, { x: 900, y: 640 }, { x: 400, y: 640 }
    ],
    enemies: [
      { x: 500, y: 650, patrolDistance: 120, speed: 60 },
      { x: 900, y: 650, patrolDistance: 100, speed: 70 },
      { x: 500, y: 418, patrolDistance: 70, speed: 50 },
      { x: 800, y: 518, patrolDistance: 70, speed: 55 },
      { x: 700, y: 268, patrolDistance: 90, speed: 65 }
    ],
    spikes: [
      { x: 680, y: 674 }, { x: 1050, y: 434 }, { x: 350, y: 334 }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 2 — SUNKEN RUINS
  // Underwater feel. Broken ground with gaps. Vertical ascent.
  // Slower enemies, tricky spike placement near coins.
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Sunken Ruins',
    icon: '\u{1F30A}',
    theme: {
      skyGradient: [0x0D47A1, 0x1565C0, 0x0A2E5C, 0x0D3B66],
      hillColors: [0x1A5276, 0x1B4F72],
      decoration: 'bubbles',
      platformTint: 0x5DADE2,
      groundTint: 0x2E86C1
    },
    playerStart: { x: 80, y: 600 },
    platforms: [
      // Broken ground — two chunks with a pit between
      { x: 250, y: 690, width: 500, height: 60 },
      { x: 1000, y: 690, width: 560, height: 60 },
      // Ascending ruins
      { x: 550, y: 580, width: 150, height: 32 },
      { x: 180, y: 480, width: 180, height: 32 },
      { x: 420, y: 420, width: 130, height: 32 },
      { x: 700, y: 490, width: 200, height: 32 },
      { x: 950, y: 400, width: 180, height: 32 },
      { x: 650, y: 320, width: 160, height: 32 },
      { x: 350, y: 260, width: 200, height: 32 },
      { x: 850, y: 220, width: 140, height: 32 },
      { x: 1100, y: 280, width: 170, height: 32 },
      { x: 150, y: 160, width: 120, height: 32 },
      { x: 550, y: 140, width: 200, height: 32 },
      { x: 1050, y: 130, width: 160, height: 32 }
    ],
    coins: [
      { x: 250, y: 640 }, { x: 550, y: 530 }, { x: 180, y: 430 },
      { x: 420, y: 370 }, { x: 700, y: 440 }, { x: 950, y: 350 },
      { x: 650, y: 270 }, { x: 350, y: 210 }, { x: 850, y: 170 },
      { x: 1100, y: 230 }, { x: 150, y: 110 }, { x: 550, y: 90 },
      { x: 1050, y: 80 }, { x: 1000, y: 640 }, { x: 780, y: 640 }
    ],
    enemies: [
      { x: 200, y: 650, patrolDistance: 100, speed: 45 },
      { x: 1000, y: 650, patrolDistance: 120, speed: 50 },
      { x: 700, y: 458, patrolDistance: 60, speed: 40 },
      { x: 350, y: 228, patrolDistance: 70, speed: 45 },
      { x: 550, y: 108, patrolDistance: 60, speed: 50 },
      { x: 950, y: 368, patrolDistance: 50, speed: 55 }
    ],
    spikes: [
      { x: 560, y: 674 }, { x: 420, y: 404 },
      { x: 850, y: 204 }, { x: 1100, y: 264 }
    ],
    movingPlatforms: [
      { x: 630, y: 530, axis: 'x', range: 80, speed: 50, width: 100 }
    ],
    fallingPlatforms: []
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 3 — NEON ARCADE
  // Dark void with glowing platforms. Grid-like layout.
  // Fast enemies, tight corridors, precision movement.
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Neon Arcade',
    icon: '\u{1F47E}',
    theme: {
      skyGradient: [0x1A0033, 0x0D001A, 0x2D004D, 0x1A0033],
      hillColors: [0x4A0080, 0x6A00B0],
      decoration: 'neonShapes',
      platformTint: 0xE040FB,
      groundTint: 0x7C4DFF
    },
    playerStart: { x: 80, y: 620 },
    platforms: [
      // Narrow ground strips
      { x: 200, y: 690, width: 400, height: 60 },
      { x: 1080, y: 690, width: 400, height: 60 },
      // Grid-like rows
      { x: 550, y: 600, width: 120, height: 32 },
      { x: 750, y: 600, width: 120, height: 32 },
      { x: 300, y: 510, width: 140, height: 32 },
      { x: 550, y: 510, width: 100, height: 32 },
      { x: 800, y: 510, width: 140, height: 32 },
      { x: 1050, y: 510, width: 120, height: 32 },
      { x: 150, y: 400, width: 120, height: 32 },
      { x: 400, y: 400, width: 100, height: 32 },
      { x: 650, y: 400, width: 130, height: 32 },
      { x: 900, y: 400, width: 100, height: 32 },
      { x: 1150, y: 400, width: 120, height: 32 },
      // Upper rows
      { x: 300, y: 290, width: 160, height: 32 },
      { x: 600, y: 290, width: 120, height: 32 },
      { x: 900, y: 290, width: 160, height: 32 },
      { x: 450, y: 180, width: 140, height: 32 },
      { x: 750, y: 180, width: 140, height: 32 },
      { x: 1100, y: 200, width: 130, height: 32 }
    ],
    coins: [
      { x: 550, y: 555 }, { x: 750, y: 555 }, { x: 300, y: 465 },
      { x: 550, y: 465 }, { x: 800, y: 465 }, { x: 1050, y: 465 },
      { x: 150, y: 355 }, { x: 650, y: 355 }, { x: 1150, y: 355 },
      { x: 300, y: 245 }, { x: 600, y: 245 }, { x: 900, y: 245 },
      { x: 450, y: 135 }, { x: 750, y: 135 }
    ],
    enemies: [
      { x: 200, y: 650, patrolDistance: 80, speed: 85 },
      { x: 1080, y: 650, patrolDistance: 80, speed: 90 },
      { x: 550, y: 478, patrolDistance: 30, speed: 70 },
      { x: 800, y: 478, patrolDistance: 50, speed: 75 },
      { x: 650, y: 368, patrolDistance: 45, speed: 80 },
      { x: 300, y: 258, patrolDistance: 55, speed: 75 },
      { x: 900, y: 258, patrolDistance: 55, speed: 80 }
    ],
    spikes: [
      { x: 650, y: 674 }, { x: 400, y: 384 },
      { x: 900, y: 384 }, { x: 600, y: 274 }, { x: 750, y: 164 }
    ],
    movingPlatforms: [
      { x: 650, y: 455, axis: 'y', range: 50, speed: 40, width: 80 }
    ],
    fallingPlatforms: [
      { x: 400, y: 400, width: 80 },
      { x: 1150, y: 400, width: 80 }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 4 — FROZEN PEAKS
  // Icy mountaintop. Wide gaps, small platforms, drifting snow.
  // Fewer enemies but placed at critical landing spots.
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Frozen Peaks',
    icon: '\u{2744}\uFE0F',
    theme: {
      skyGradient: [0xB3E5FC, 0xE1F5FE, 0xE8EAF6, 0xFCE4EC],
      hillColors: [0xCFD8DC, 0xECEFF1],
      decoration: 'snowflakes',
      platformTint: 0x90CAF9,
      groundTint: 0xBBDEFB
    },
    playerStart: { x: 100, y: 560 },
    platforms: [
      // Narrow icy ledges — no full ground
      { x: 150, y: 630, width: 200, height: 60 },
      { x: 500, y: 620, width: 140, height: 32 },
      { x: 800, y: 580, width: 160, height: 32 },
      { x: 1100, y: 620, width: 180, height: 32 },
      // Mid tier — wide gaps
      { x: 300, y: 490, width: 130, height: 32 },
      { x: 600, y: 450, width: 100, height: 32 },
      { x: 900, y: 470, width: 150, height: 32 },
      { x: 1180, y: 430, width: 120, height: 32 },
      // Upper tier
      { x: 100, y: 370, width: 120, height: 32 },
      { x: 400, y: 340, width: 140, height: 32 },
      { x: 720, y: 320, width: 130, height: 32 },
      { x: 1020, y: 300, width: 150, height: 32 },
      // Summit
      { x: 250, y: 210, width: 110, height: 32 },
      { x: 550, y: 180, width: 120, height: 32 },
      { x: 850, y: 160, width: 140, height: 32 },
      { x: 1150, y: 190, width: 110, height: 32 }
    ],
    coins: [
      { x: 150, y: 580 }, { x: 500, y: 575 }, { x: 800, y: 535 },
      { x: 1100, y: 575 }, { x: 300, y: 445 }, { x: 600, y: 405 },
      { x: 900, y: 425 }, { x: 1180, y: 385 }, { x: 100, y: 325 },
      { x: 400, y: 295 }, { x: 720, y: 275 }, { x: 1020, y: 255 },
      { x: 250, y: 165 }, { x: 550, y: 135 }, { x: 850, y: 115 },
      { x: 1150, y: 145 }
    ],
    enemies: [
      { x: 800, y: 548, patrolDistance: 50, speed: 50 },
      { x: 900, y: 438, patrolDistance: 50, speed: 55 },
      { x: 720, y: 288, patrolDistance: 40, speed: 45 },
      { x: 850, y: 128, patrolDistance: 45, speed: 60 }
    ],
    spikes: [
      { x: 500, y: 604 }, { x: 600, y: 434 },
      { x: 400, y: 324 }, { x: 550, y: 164 }
    ],
    movingPlatforms: [
      { x: 550, y: 530, axis: 'x', range: 100, speed: 55, width: 100 },
      { x: 200, y: 280, axis: 'y', range: 60, speed: 45, width: 90 }
    ],
    fallingPlatforms: [
      { x: 600, y: 450, width: 80 },
      { x: 1180, y: 430, width: 80 }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 5 — MAGMA CORE
  // No ground. Everything floats over a lava void.
  // Maximum hazards. The final test.
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Magma Core',
    icon: '\u{1F525}',
    theme: {
      skyGradient: [0x1A0000, 0x330000, 0x4D0000, 0x1A0000],
      hillColors: [0x4E342E, 0x3E2723],
      decoration: 'embers',
      platformTint: 0xFF6E40,
      groundTint: 0xBF360C
    },
    playerStart: { x: 80, y: 530 },
    platforms: [
      // NO full ground — just floating rocks over lava
      { x: 120, y: 600, width: 160, height: 32 },
      { x: 350, y: 560, width: 120, height: 32 },
      { x: 580, y: 620, width: 140, height: 32 },
      { x: 800, y: 570, width: 130, height: 32 },
      { x: 1050, y: 610, width: 150, height: 32 },
      // Mid floating
      { x: 200, y: 460, width: 130, height: 32 },
      { x: 450, y: 430, width: 110, height: 32 },
      { x: 680, y: 470, width: 140, height: 32 },
      { x: 920, y: 420, width: 120, height: 32 },
      { x: 1150, y: 460, width: 130, height: 32 },
      // Upper gauntlet
      { x: 100, y: 330, width: 110, height: 32 },
      { x: 340, y: 300, width: 130, height: 32 },
      { x: 580, y: 330, width: 100, height: 32 },
      { x: 800, y: 280, width: 140, height: 32 },
      { x: 1050, y: 310, width: 120, height: 32 },
      // Summit platforms
      { x: 250, y: 180, width: 120, height: 32 },
      { x: 520, y: 160, width: 110, height: 32 },
      { x: 780, y: 140, width: 130, height: 32 },
      { x: 1050, y: 170, width: 140, height: 32 },
      { x: 640, y: 80, width: 160, height: 32 }
    ],
    coins: [
      { x: 120, y: 555 }, { x: 350, y: 515 }, { x: 580, y: 575 },
      { x: 800, y: 525 }, { x: 1050, y: 565 }, { x: 200, y: 415 },
      { x: 450, y: 385 }, { x: 680, y: 425 }, { x: 920, y: 375 },
      { x: 1150, y: 415 }, { x: 340, y: 255 }, { x: 800, y: 235 },
      { x: 1050, y: 265 }, { x: 250, y: 135 }, { x: 520, y: 115 },
      { x: 780, y: 95 }, { x: 1050, y: 125 }, { x: 640, y: 35 }
    ],
    enemies: [
      { x: 350, y: 528, patrolDistance: 35, speed: 70 },
      { x: 800, y: 538, patrolDistance: 40, speed: 75 },
      { x: 1050, y: 578, patrolDistance: 45, speed: 65 },
      { x: 450, y: 398, patrolDistance: 30, speed: 80 },
      { x: 920, y: 388, patrolDistance: 35, speed: 85 },
      { x: 340, y: 268, patrolDistance: 40, speed: 70 },
      { x: 800, y: 248, patrolDistance: 45, speed: 80 },
      { x: 640, y: 48, patrolDistance: 50, speed: 90 }
    ],
    spikes: [
      { x: 580, y: 604 }, { x: 680, y: 454 },
      { x: 200, y: 444 }, { x: 580, y: 314 },
      { x: 1050, y: 294 }, { x: 520, y: 144 }
    ],
    movingPlatforms: [
      { x: 460, y: 530, axis: 'x', range: 90, speed: 65, width: 90 },
      { x: 750, y: 380, axis: 'y', range: 70, speed: 50, width: 80 },
      { x: 400, y: 200, axis: 'x', range: 80, speed: 70, width: 80 }
    ],
    fallingPlatforms: [
      { x: 580, y: 620, width: 90 },
      { x: 920, y: 420, width: 80 },
      { x: 250, y: 180, width: 80 }
    ]
  }
];

export const TOTAL_LEVELS = LEVELS.length;
