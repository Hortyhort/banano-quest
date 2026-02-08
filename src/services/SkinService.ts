/**
 * SkinService — Cosmetic character tint skins unlocked via star milestones.
 */

const STORAGE_KEY = 'bananoquest_skins';

export interface SkinDef {
  id: string;
  name: string;
  tint: number; // Phaser tint color
  starsRequired: number;
}

export const SKINS: SkinDef[] = [
  { id: 'default', name: 'Classic', tint: 0xffffff, starsRequired: 0 },
  { id: 'golden', name: 'Golden Monkey', tint: 0xffd700, starsRequired: 3 },
  { id: 'frost', name: 'Frostbite', tint: 0x81d4fa, starsRequired: 6 },
  { id: 'blaze', name: 'Blaze', tint: 0xff6e40, starsRequired: 9 },
  { id: 'shadow', name: 'Shadow', tint: 0x9e9e9e, starsRequired: 12 },
  { id: 'royal', name: 'Royal Purple', tint: 0xce93d8, starsRequired: 15 },
  { id: 'diamond', name: 'Diamond', tint: 0xe0f7fa, starsRequired: 18 },
];

interface SkinData {
  selectedId: string;
}

function loadData(): SkinData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SkinData) : { selectedId: 'default' };
  } catch {
    return { selectedId: 'default' };
  }
}

function saveData(data: SkinData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const SkinService = {
  /** Get all skins with unlock status */
  getAll(totalStars: number): Array<SkinDef & { unlocked: boolean }> {
    return SKINS.map((skin) => ({
      ...skin,
      unlocked: totalStars >= skin.starsRequired,
    }));
  },

  /** Get the currently selected skin */
  getSelected(): SkinDef {
    const data = loadData();
    return SKINS.find((s) => s.id === data.selectedId) ?? SKINS[0];
  },

  /** Select a skin (must be unlocked) */
  select(skinId: string, totalStars: number): boolean {
    const skin = SKINS.find((s) => s.id === skinId);
    if (!skin || totalStars < skin.starsRequired) return false;
    saveData({ selectedId: skinId });
    return true;
  },

  /** Get the tint color for the currently selected skin */
  getSelectedTint(): number {
    return this.getSelected().tint;
  },

  /** Reset to default */
  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
