/**
 * Başsız oynanış testi.
 * 1. bölümü baştan sona oynar ve şunları doğrular:
 *   - içerik referansları tutarlı mı (kırık ipucu/sahne/bulmaca id'si)
 *   - her hotspot ulaşılabilir mi, her ipucu toplanabiliyor mu
 *   - bulmaca doğru cevapla çözülüyor, yanlışla çözülmüyor mu
 *   - kilitli çıkış açılıyor mu
 *   - ANI ipucu tetiklenince gerçekten yeniden yazılıyor mu
 *
 * Çalıştır: npm test
 */
import { CLUES, PUZZLES_BY_ID, SCENES_BY_ID, validateContent } from "../src/content";
import { apply, initialState, readClue, test as check, type GameState } from "../src/engine/state";
import type { Hotspot, Scene } from "../src/engine/types";

let failures = 0;
const ok = (cond: boolean, label: string) => {
  console.log(`${cond ? "  ✓" : "  ✗"} ${label}`);
  if (!cond) failures++;
};
const section = (s: string) => console.log(`\n${s}`);

// -------------------------------------------------- içerik tutarlılığı
section("İçerik doğrulaması");
const contentErrors = validateContent();
ok(contentErrors.length === 0, `içerik hatasız (${contentErrors.length} hata)`);
contentErrors.forEach((e) => console.log(`      ${e}`));

// -------------------------------------------------- yardımcılar
let state: GameState = initialState("tr", "b1_karanlik_oda");

/** Provider'daki tapHotspot ile aynı mantık: koşulu geçen İLK aksiyon çalışır. */
function tap(h: Hotspot): void {
  const idx = h.actions.findIndex((a) => check(a.when, state));
  if (idx === -1) return;
  const action = h.actions[idx];
  const key = `${state.sceneId}:${h.id}:${idx}`;
  if (action.once && state.firedActions.includes(key)) return;
  if (action.once) state = { ...state, firedActions: [...state.firedActions, key] };
  state = apply(state, action.effects);
}

/** Bir hotspot'a, yeni bir şey vermeyi bırakana kadar dokun. */
function exhaust(h: Hotspot, max = 6): void {
  for (let i = 0; i < max; i++) {
    const before = state.clues.length + state.flags.length;
    tap(h);
    if (state.clues.length + state.flags.length === before) break;
  }
}

const scene = (id: string): Scene => {
  const s = SCENES_BY_ID[id];
  if (!s) throw new Error(`sahne yok: ${id}`);
  return s;
};

// -------------------------------------------------- Bölüm 1 oynanışı
section("Bölüm 1 — Karanlık Oda");
const oda = scene("b1_karanlik_oda");

// Ağrandizör, negatifler incelenmeden bulmacayı AÇMAMALI.
const agrandizor = oda.hotspots.find((h) => h.id === "agrandizor")!;
tap(agrandizor);
ok(
  !state.flags.includes("b1_yon_belli") && state.clues.length === 0,
  "ağrandizör, negatif kodları bilinmeden bulmacayı açmıyor"
);

// Sırayla bütün nesnelere dokun.
for (const h of oda.hotspots) exhaust(h);

const beklenen = [
  "foto_kapi8",
  "negatif_kodu",
  "kimyasal_kokusu",
  "takvim",
  "kagit_dizeler",
  "bilet_saati",
  "avuc_dikisi",
  "agabey_cagrilari",
  "kendi_fotografim",
];
for (const id of beklenen) ok(state.clues.includes(id), `ipucu toplandı: ${id}`);

// -------------------------------------------------- ANI mekaniği
section("ANI ipucu yeniden yazılıyor mu");
const dikis = CLUES.find((c) => c.id === "avuc_dikisi")!;
const okuma = readClue(dikis, state);
ok(
  okuma.superseded.length === 1,
  `avuc_dikisi yeniden yazıldı (${okuma.superseded.length} eski okuma)`
);
ok(
  okuma.current.tr.includes("Dikiş yok"),
  "yeni okuma, fotoğraftaki dikişsiz eli anlatıyor"
);

const kapi8 = CLUES.find((c) => c.id === "foto_kapi8")!;
ok(readClue(kapi8, state).superseded.length === 0, "İZ ipucu (foto_kapi8) değişmedi");

// -------------------------------------------------- bulmaca
section("Ağrandizör bulmacası");
const puzzle = PUZZLES_BY_ID["agrandizor"];
ok(puzzle?.type === "dial", "bulmaca kadran tipinde");
if (puzzle?.type === "dial") {
  const dogru = puzzle.answer.join("");
  ok(dogru === "31", `doğru cevap 31 (dizideki 8. terim) — bulundu: ${dogru}`);
  ok(
    ![
      [0, 0],
      [2, 9],
      [3, 0],
    ].some((yanlis) => yanlis.every((v, i) => v === puzzle.answer[i])),
    "yakın yanlış cevaplar kabul edilmiyor"
  );
}

// Çözümü uygula.
state = { ...state, solvedPuzzles: [...state.solvedPuzzles, "agrandizor"] };
state = apply(state, puzzle!.onSolve.effects);
ok(state.clues.includes("sekizinci_kare"), "bulmaca çözümü sekizinci_kare ipucunu verdi");
ok(state.flags.includes("b1_yon_belli"), "bulmaca çözümü kapıyı açan bayrağı kurdu");

// -------------------------------------------------- çıkışlar
section("Çıkışlar");
const kapi = oda.exits!.find((x) => x.id === "kapi")!;
ok(check(kapi.enabledIf, state), "bulmaca çözülünce kapı açıldı");

const kilitliTest = initialState("tr", "b1_karanlik_oda");
ok(!check(kapi.enabledIf, kilitliTest), "oyun başında kapı kilitli");
ok(!!kapi.blockedText, "kilitli kapının açıklama metni var");

// Eşiğe geç.
state = { ...state, sceneId: "b1_esik" };
const esik = scene("b1_esik");
for (const h of esik.hotspots) exhaust(h);
ok(state.flags.includes("b1_kapak_gordum"), "eşikte gözetleme kapağı fark edildi");

state = { ...state, sceneId: "b1_son" };
ok(!!scene("b1_son").chapterEnd, "kapanış sahnesi bölüm sonu kartını tetikliyor");

// -------------------------------------------------- ipucu tipleri
section("İpucu tipi kuralları");
const izler = CLUES.filter((c) => c.kind === "iz");
ok(izler.every((c) => !c.revisions?.length), "hiçbir İZ ipucunun revizyonu yok");
ok(
  CLUES.filter((c) => c.kind === "ani").every((c) => (c.revisions?.length ?? 0) > 0),
  "her ANI ipucunun en az bir revizyonu var"
);

// -------------------------------------------------- sonuç
section(failures === 0 ? "TÜM TESTLER GEÇTİ" : `${failures} TEST BAŞARISIZ`);
console.log(`Toplanan ipucu: ${state.clues.length} · Kurulan bayrak: ${state.flags.length}\n`);
process.exit(failures === 0 ? 0 : 1);
