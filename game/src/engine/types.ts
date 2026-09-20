/**
 * KARANLIK ODA — içerik şeması
 *
 * Buradaki tipler oyunun "kural kitabı"dır. Hikaye dosyaları (src/content/*)
 * yalnızca bu tiplere uyan veri üretir; hiçbir hikaye dosyası mantık içermez.
 * Böylece hikayeyi değiştirmek için motoru bilmek gerekmez.
 */

export type Lang = "tr" | "en";

/** Her oyuncu-görür metin iki dilde tutulur. */
export type LocalizedText = { tr: string; en: string };

// ---------------------------------------------------------------- koşullar

/**
 * Bir şeyin görünür/tıklanabilir/geçerli olması için gereken koşul.
 * İç içe geçebilir: all(hasClue("a"), not(flag("b")))
 */
export type Condition =
  | { kind: "clue"; id: string }
  | { kind: "flag"; id: string }
  | { kind: "puzzle"; id: string }
  | { kind: "chapter"; atLeast: number }
  | { kind: "not"; of: Condition }
  | { kind: "all"; of: Condition[] }
  | { kind: "any"; of: Condition[] };

export const hasClue = (id: string): Condition => ({ kind: "clue", id });
export const flag = (id: string): Condition => ({ kind: "flag", id });
export const solved = (id: string): Condition => ({ kind: "puzzle", id });
export const chapterAtLeast = (n: number): Condition => ({ kind: "chapter", atLeast: n });
export const not = (of: Condition): Condition => ({ kind: "not", of });
export const all = (...of: Condition[]): Condition => ({ kind: "all", of });
export const any = (...of: Condition[]): Condition => ({ kind: "any", of });

// ---------------------------------------------------------------- etkiler

/** Bir etkileşimin oyun durumunda yaptığı değişiklik. */
export type Effect =
  | { kind: "addClue"; id: string }
  | { kind: "setFlag"; id: string }
  | { kind: "goScene"; id: string }
  | { kind: "openPuzzle"; id: string }
  | { kind: "endChapter"; next?: string }
  | { kind: "ending"; id: string };

export const addClue = (id: string): Effect => ({ kind: "addClue", id });
export const setFlag = (id: string): Effect => ({ kind: "setFlag", id });
export const goScene = (id: string): Effect => ({ kind: "goScene", id });
export const openPuzzle = (id: string): Effect => ({ kind: "openPuzzle", id });

// ---------------------------------------------------------------- ipuçları

/**
 * İZ    — fiziksel delil. Metni ASLA değişmez.
 * ANI   — hatıra. İlerledikçe kendini yeniden yazar.
 * İFADE — birinin söylediği. Yalan olabilir.
 */
export type ClueKind = "iz" | "ani" | "ifade";

/** Bir ANI ipucunun sonraki okuması. `when` sağlandığı anda aktif olur. */
export interface ClueRevision {
  when: Condition;
  body: LocalizedText;
}

export interface Clue {
  id: string;
  kind: ClueKind;
  chapter: number;
  title: LocalizedText;
  /** İlk okuma. */
  body: LocalizedText;
  /** Sırayla değerlendirilir; koşulu sağlanan EN SON revizyon geçerli okumadır. */
  revisions?: ClueRevision[];
}

// ---------------------------------------------------------------- sahne

/** Sahne görselinin üstündeki tıklanabilir alan — koordinatlar YÜZDE (0–100). */
export interface Hotspot {
  id: string;
  label: LocalizedText;
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: "rect" | "ellipse";
  /** Koşul sağlanmazsa hotspot hiç çizilmez. */
  visibleIf?: Condition;
  /** Koşulu sağlanan İLK aksiyon çalışır. */
  actions: HotspotAction[];
}

export interface HotspotAction {
  when?: Condition;
  /** Ekrana sırayla düşen metin blokları. */
  lines: LocalizedText[];
  effects?: Effect[];
  /** true ise etkileri yalnızca ilk seferde uygular (metin yine gösterilir). */
  once?: boolean;
}

export interface SceneExit {
  id: string;
  label: LocalizedText;
  to: string;
  visibleIf?: Condition;
  /** Koşul sağlanmıyorsa kapıyı gösterir ama neden geçilemediğini söyler. */
  enabledIf?: Condition;
  blockedText?: LocalizedText;
}

export interface Scene {
  id: string;
  chapter: number;
  title: LocalizedText;
  /** Sahne üstünde küçük gri satır — saat, tarih, mekân. */
  stamp?: LocalizedText;
  /** Prosedürel yer tutucu görsel anahtarı. Gerçek görsel gelince `image` doldurulur. */
  art: string;
  /** require("../../assets/scenes/x.jpg") — verildiğinde prosedürel görselin yerine geçer. */
  image?: number;
  /** Sahneye ilk girişte otomatik akan metin. */
  intro?: LocalizedText[];
  hotspots: Hotspot[];
  exits?: SceneExit[];
  /** Doldurulursa sahnenin anlatısı bitince bölüm sonu kartı gösterilir. */
  chapterEnd?: {
    heading: LocalizedText;
    /** Sonraki bölümün adı — henüz yazılmadıysa "yakında" kartı çıkar. */
    teaser?: LocalizedText;
    nextChapter?: number;
  };
}

// ---------------------------------------------------------------- bulmacalar

interface PuzzleBase {
  id: string;
  title: LocalizedText;
  prompt: LocalizedText;
  /** Yanlış denemede gösterilir. */
  wrongText?: LocalizedText;
  /** Çözüldüğünde gösterilecek metin ve etkiler. */
  onSolve: { lines: LocalizedText[]; effects?: Effect[] };
  /** N yanlış denemeden sonra beliren ipucu. */
  hint?: { after: number; text: LocalizedText };
}

/** Ağrandizör kadranı gibi: N tane çevrilebilir sayı halkası. */
export interface DialPuzzle extends PuzzleBase {
  type: "dial";
  dials: number;
  min: number;
  max: number;
  answer: number[];
}

/** Kasa / tuş takımı: serbest metin veya rakam girişi. */
export interface CodePuzzle extends PuzzleBase {
  type: "code";
  answer: string[];
  /** Girişi büyük harfe çevirip boşlukları at. */
  normalize?: boolean;
  keyboard?: "numeric" | "default";
}

/** Anahtarlık, fotoğraf dizilimi: verilen parçaları doğru sıraya koy. */
export interface SequencePuzzle extends PuzzleBase {
  type: "sequence";
  items: { id: string; label: LocalizedText }[];
  answer: string[];
}

export type Puzzle = DialPuzzle | CodePuzzle | SequencePuzzle;

// ---------------------------------------------------------------- bölüm

export interface Chapter {
  id: number;
  title: LocalizedText;
  epigraph?: LocalizedText;
  /** Bölüme girişte açılacak sahne. */
  entryScene: string;
}
