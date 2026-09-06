import type { Clue, Condition, Effect, LocalizedText, Lang } from "./types";

/** Kayıt formatı değişirse artır — eski kayıtlar sessizce atılır. */
export const SAVE_VERSION = 1;

export interface GameState {
  version: number;
  lang: Lang;
  chapter: number;
  sceneId: string;
  /** Keşif sırasına göre. */
  clues: string[];
  flags: string[];
  solvedPuzzles: string[];
  /** `once` aksiyonlarının tekrar tetiklenmemesi için. */
  firedActions: string[];
  /** İpucu id -> oyuncunun gördüğü en son revizyon indeksi (-1 = ilk okuma). */
  revisionSeen: Record<string, number>;
  /** Ulaşılan finaller (yeniden oynamada gösterilir). */
  endings: string[];
  startedAt: number;
}

export const initialState = (lang: Lang, entryScene: string): GameState => ({
  version: SAVE_VERSION,
  lang,
  chapter: 1,
  sceneId: entryScene,
  clues: [],
  flags: [],
  solvedPuzzles: [],
  firedActions: [],
  revisionSeen: {},
  endings: [],
  startedAt: Date.now(),
});

// ---------------------------------------------------------------- koşullar

export function test(cond: Condition | undefined, s: GameState): boolean {
  if (!cond) return true;
  switch (cond.kind) {
    case "clue":
      return s.clues.includes(cond.id);
    case "flag":
      return s.flags.includes(cond.id);
    case "puzzle":
      return s.solvedPuzzles.includes(cond.id);
    case "chapter":
      return s.chapter >= cond.atLeast;
    case "not":
      return !test(cond.of, s);
    case "all":
      return cond.of.every((c) => test(c, s));
    case "any":
      return cond.of.some((c) => test(c, s));
  }
}

// ---------------------------------------------------------------- etkiler

const push = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

/** Etkileri sırayla uygular ve YENİ durumu döndürür (mutasyon yok). */
export function apply(state: GameState, effects: Effect[] = []): GameState {
  return effects.reduce<GameState>((s, e) => {
    switch (e.kind) {
      case "addClue":
        return { ...s, clues: push(s.clues, e.id) };
      case "setFlag":
        return { ...s, flags: push(s.flags, e.id) };
      case "goScene":
        return { ...s, sceneId: e.id };
      case "endChapter":
        return { ...s, chapter: s.chapter + 1, ...(e.next ? { sceneId: e.next } : {}) };
      case "ending":
        return { ...s, endings: push(s.endings, e.id) };
      case "openPuzzle":
        return s; // bulmaca açmak UI işi, durumu değiştirmez
    }
  }, state);
}

// ---------------------------------------------------------------- ipucu okuması

export interface ClueReading {
  /** Şu an geçerli olan metin. */
  current: LocalizedText;
  /** Geçmiş okumalar — defterde üstü çizili gösterilir. */
  superseded: LocalizedText[];
  /** Aktif revizyonun indeksi. -1 = hiç değişmemiş. */
  index: number;
}

/**
 * Bir ipucunun O ANKİ okumasını hesaplar.
 * Koşulu sağlanan en son revizyon geçerlidir; öncekiler "eski okuma" olur.
 */
export function readClue(clue: Clue, s: GameState): ClueReading {
  const chain: LocalizedText[] = [clue.body];
  let index = -1;
  clue.revisions?.forEach((rev, i) => {
    if (test(rev.when, s)) {
      chain.push(rev.body);
      index = i;
    }
  });
  return {
    current: chain[chain.length - 1],
    superseded: chain.slice(0, -1),
    index,
  };
}

/** Oyuncunun henüz görmediği yeni okumalar — "Bir anın değişti." bildirimi için. */
export function changedClues(clues: Clue[], s: GameState): Clue[] {
  return clues.filter((c) => {
    if (!s.clues.includes(c.id)) return false;
    const seen = s.revisionSeen[c.id] ?? -1;
    return readClue(c, s).index > seen;
  });
}

/** Bildirim gösterildikten sonra çağrılır. */
export function acknowledgeRevisions(clues: Clue[], s: GameState): GameState {
  const revisionSeen = { ...s.revisionSeen };
  for (const c of clues) revisionSeen[c.id] = readClue(c, s).index;
  return { ...s, revisionSeen };
}
