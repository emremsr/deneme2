import type { Lang, LocalizedText } from "../engine/types";

/** Hikaye metnini aktif dile indirger. */
export const t = (text: LocalizedText, lang: Lang): string => text[lang] ?? text.tr;

/** Arayüz metinleri — hikayeden ayrı tutulur. */
export const UI = {
  appTitle: { tr: "KARANLIK ODA", en: "THE DARKROOM" },
  newGame: { tr: "Yeni Oyun", en: "New Game" },
  continue: { tr: "Devam Et", en: "Continue" },
  notebook: { tr: "Defter", en: "Notebook" },
  close: { tr: "Kapat", en: "Close" },
  back: { tr: "Geri", en: "Back" },
  clues: { tr: "İpuçları", en: "Clues" },
  clueCount: { tr: "ipucu", en: "clues" },
  noClues: { tr: "Defter henüz boş.", en: "The notebook is still empty." },
  tapToContinue: { tr: "devam etmek için dokun", en: "tap to continue" },
  newClue: { tr: "Yeni ipucu", en: "New clue" },
  memoryChanged: { tr: "Bir anın değişti.", en: "A memory has changed." },
  memoryChangedPlural: { tr: "Anıların değişti.", en: "Your memories have changed." },
  oldReading: { tr: "önceki okuma", en: "earlier reading" },
  kindIz: { tr: "İZ", en: "TRACE" },
  kindAni: { tr: "ANI", en: "MEMORY" },
  kindIfade: { tr: "İFADE", en: "TESTIMONY" },
  kindIzHelp: {
    tr: "Fiziksel delil. Bu metin asla değişmez.",
    en: "Physical evidence. This text never changes.",
  },
  kindAniHelp: {
    tr: "Hatıra. İlerledikçe kendini yeniden yazabilir.",
    en: "A memory. It may rewrite itself as you go.",
  },
  kindIfadeHelp: {
    tr: "Birinin söylediği şey. Doğru olmak zorunda değil.",
    en: "Something someone said. It need not be true.",
  },
  solve: { tr: "Dene", en: "Try" },
  wrong: { tr: "Olmadı.", en: "Not it." },
  hint: { tr: "İpucu", en: "Hint" },
  locked: { tr: "Kilitli", en: "Locked" },
  settings: { tr: "Ayarlar", en: "Settings" },
  language: { tr: "Dil", en: "Language" },
  deleteSave: { tr: "Kaydı Sil", en: "Delete Save" },
  deleteSaveConfirm: {
    tr: "Bütün ilerleme silinecek. Emin misin?",
    en: "All progress will be erased. Are you sure?",
  },
  cancel: { tr: "Vazgeç", en: "Cancel" },
  delete: { tr: "Sil", en: "Delete" },
  chapter: { tr: "Bölüm", en: "Chapter" },
  saved: { tr: "kaydedildi", en: "saved" },
  reset: { tr: "Sıfırla", en: "Reset" },
} satisfies Record<string, LocalizedText>;

export type UIKey = keyof typeof UI;
