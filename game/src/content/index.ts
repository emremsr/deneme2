import type { Chapter, Puzzle, Scene } from "../engine/types";
import { CLUES, CLUES_BY_ID } from "./clues";
import { CHAPTER_1, CHAPTER_1_PUZZLES, CHAPTER_1_SCENES } from "./chapter1";

/**
 * İçerik kaydı. Yeni bölüm eklemek için:
 *   1. src/content/chapterN.ts yaz
 *   2. ipuçlarını src/content/clues.ts içine ekle
 *   3. aşağıdaki üç diziye kaydet
 * Motor tarafında hiçbir şey değişmez.
 */
export const CHAPTERS: Chapter[] = [CHAPTER_1];
export const SCENES: Scene[] = [...CHAPTER_1_SCENES];
export const PUZZLES: Puzzle[] = [...CHAPTER_1_PUZZLES];

export const SCENES_BY_ID: Record<string, Scene> = Object.fromEntries(
  SCENES.map((s) => [s.id, s])
);
export const PUZZLES_BY_ID: Record<string, Puzzle> = Object.fromEntries(
  PUZZLES.map((p) => [p.id, p])
);
export const CHAPTERS_BY_ID: Record<number, Chapter> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, c])
);

export const FIRST_SCENE = CHAPTER_1.entryScene;

export { CLUES, CLUES_BY_ID };

/** Yayına çıkmadan önce içeriğin tutarlılığını doğrular (dev'de App açılışında koşar). */
export function validateContent(): string[] {
  const errors: string[] = [];
  const clueIds = new Set(CLUES.map((c) => c.id));
  const sceneIds = new Set(SCENES.map((s) => s.id));
  const puzzleIds = new Set(PUZZLES.map((p) => p.id));

  const checkEffects = (where: string, effects?: { kind: string; id?: string }[]) => {
    for (const e of effects ?? []) {
      if (e.kind === "addClue" && e.id && !clueIds.has(e.id))
        errors.push(`${where}: bilinmeyen ipucu "${e.id}"`);
      if (e.kind === "goScene" && e.id && !sceneIds.has(e.id))
        errors.push(`${where}: bilinmeyen sahne "${e.id}"`);
      if (e.kind === "openPuzzle" && e.id && !puzzleIds.has(e.id))
        errors.push(`${where}: bilinmeyen bulmaca "${e.id}"`);
    }
  };

  for (const s of SCENES) {
    for (const h of s.hotspots) {
      if (h.x < 0 || h.y < 0 || h.x + h.w > 100 || h.y + h.h > 100)
        errors.push(`${s.id}/${h.id}: hotspot sahne dışına taşıyor`);
      if (h.actions.length === 0) errors.push(`${s.id}/${h.id}: aksiyon yok`);
      h.actions.forEach((a, i) => checkEffects(`${s.id}/${h.id}#${i}`, a.effects));
    }
    for (const x of s.exits ?? []) {
      if (!sceneIds.has(x.to)) errors.push(`${s.id}/${x.id}: bilinmeyen çıkış "${x.to}"`);
    }
  }
  for (const p of PUZZLES) checkEffects(`bulmaca/${p.id}`, p.onSolve.effects);
  for (const c of CLUES) {
    if (c.kind === "iz" && c.revisions?.length)
      errors.push(`ipucu/${c.id}: İZ tipi ipucunun revizyonu olamaz — metni değişmemeli`);
  }
  return errors;
}
