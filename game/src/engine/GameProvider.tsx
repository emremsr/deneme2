import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CHAPTERS_BY_ID,
  CLUES,
  CLUES_BY_ID,
  FIRST_SCENE,
  PUZZLES_BY_ID,
  SCENES_BY_ID,
} from "../content";
import {
  acknowledgeRevisions,
  apply,
  changedClues,
  enterScene,
  initialState,
  shouldShowChapterEnd,
  test,
  type GameState,
} from "./state";
import { clearGame, loadGame, loadLang, saveGame, saveLang } from "./storage";
import type { Effect, Hotspot, Lang, LocalizedText, SceneExit } from "./types";

type Screen = "title" | "game" | "chapterEnd";

interface Toast {
  id: number;
  kind: "clue" | "memory";
  text: string;
}

interface GameApi {
  ready: boolean;
  hasSave: boolean;
  screen: Screen;
  lang: Lang;
  state: GameState;
  /** Ekranda akan anlatı; null ise sahne serbest. */
  narration: LocalizedText[] | null;
  narrationStep: number;
  /** Kapanan son anlatı bloğu — sahne boştayken soluk olarak tekrar gösterilir. */
  lastNarration: LocalizedText[] | null;
  toasts: Toast[];
  openPuzzleId: string | null;

  setLang: (l: Lang) => void;
  startNew: () => void;
  continueGame: () => void;
  deleteSave: () => Promise<void>;
  toTitle: () => void;

  advance: () => void;
  tapHotspot: (h: Hotspot) => void;
  tapExit: (x: SceneExit) => void;
  closePuzzle: () => void;
  solvePuzzle: (puzzleId: string) => void;
  visible: (cond?: Parameters<typeof test>[0]) => boolean;
  nextChapter: () => void;
}

const Ctx = createContext<GameApi | null>(null);

export const useGame = (): GameApi => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [screen, setScreen] = useState<Screen>("title");
  const [lang, setLangState] = useState<Lang>("tr");
  const [state, setState] = useState<GameState>(() => initialState("tr", FIRST_SCENE));
  const [narration, setNarration] = useState<LocalizedText[] | null>(null);
  const [narrationStep, setNarrationStep] = useState(0);
  const [lastNarration, setLastNarration] = useState<LocalizedText[] | null>(null);
  const [openPuzzleId, setOpenPuzzleId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const savedRef = useRef<GameState | null>(null);
  const toastId = useRef(0);

  // -------------------------------------------------- açılış: kayıt ve dil
  useEffect(() => {
    (async () => {
      const [saved, savedLang] = await Promise.all([loadGame(), loadLang()]);
      if (savedLang === "tr" || savedLang === "en") setLangState(savedLang);
      if (saved) {
        savedRef.current = saved;
        setHasSave(true);
      }
      setReady(true);
    })();
  }, []);

  // -------------------------------------------------- otomatik kayıt
  useEffect(() => {
    if (!ready || screen === "title") return;
    saveGame(state);
    setHasSave(true);
  }, [state, ready, screen]);

  const pushToast = useCallback((kind: Toast["kind"], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setState((s) => ({ ...s, lang: l }));
    saveLang(l);
  }, []);

  // -------------------------------------------------- anlatı akışı
  const startNarration = useCallback((lines: LocalizedText[]) => {
    if (lines.length === 0) return;
    setNarration(lines);
    setLastNarration(lines);
    setNarrationStep(0);
  }, []);

  const advance = useCallback(() => {
    if (!narration) return;
    if (narrationStep + 1 >= narration.length) {
      setNarration(null);
      setNarrationStep(0);
      return;
    }
    setNarrationStep(narrationStep + 1);
  }, [narration, narrationStep]);

  // -------------------------------------------------- etki uygulama
  /**
   * Etkileri `base` üzerine uygular ve YENİ durumu döndürür.
   *
   * Bildirimler ve bulmaca açılışı burada tetiklenir — bilerek bir setState
   * güncelleyicisinin DIŞINDA. Güncelleyici saf kalmalı: React onu birden çok
   * kez çağırabilir, yan etki içeriyorsa bildirimler ikilenir.
   */
  const commitEffects = useCallback(
    (base: GameState, effects: Effect[] = []): GameState => {
      let next = apply(base, effects);

      for (const e of effects) {
        if (e.kind === "addClue" && !base.clues.includes(e.id)) {
          const clue = CLUES_BY_ID[e.id];
          if (clue) pushToast("clue", clue.title[next.lang] ?? clue.title.tr);
        }
        if (e.kind === "openPuzzle") setOpenPuzzleId(e.id);
      }

      // Yeni bayrak/ipucu eski bir ANI ipucunu yeniden yazmış olabilir.
      const changed = changedClues(CLUES, next);
      if (changed.length > 0) {
        pushToast("memory", changed.length === 1 ? "single" : "plural");
        next = acknowledgeRevisions(changed, next);
      }
      return next;
    },
    [pushToast]
  );

  /** Sahne geçişini uygular ve ilk gelişse giriş metnini akıtır. */
  const enterSceneState = useCallback(
    (base: GameState, sceneId: string): GameState => {
      const { next, intro } = enterScene(base, SCENES_BY_ID[sceneId], sceneId);
      // Metin, durum değişikliğiyle AYNI olayda başlatılır; ikisi tek render'da
      // birlikte görünür ve kapanış metni bölüm sonu kartına yenilmez.
      if (intro) startNarration(intro);
      return next;
    },
    [startNarration]
  );

  // Anlatı bitince, sahne bölüm sonu ise kartı göster.
  useEffect(() => {
    if (screen !== "game") return;
    const scene = SCENES_BY_ID[state.sceneId];
    if (shouldShowChapterEnd(state, scene, narration !== null)) setScreen("chapterEnd");
  }, [narration, state, screen]);

  // -------------------------------------------------- oyuncu eylemleri
  const tapHotspot = useCallback(
    (h: Hotspot) => {
      if (narration) return;
      const idx = h.actions.findIndex((a) => test(a.when, state));
      if (idx === -1) return;
      const action = h.actions[idx];
      const key = `${state.sceneId}:${h.id}:${idx}`;
      const alreadyFired = state.firedActions.includes(key);

      startNarration(action.lines);
      if (action.once && alreadyFired) return;

      const base = action.once
        ? { ...state, firedActions: [...state.firedActions, key] }
        : state;
      setState(commitEffects(base, action.effects));
    },
    [narration, state, startNarration, commitEffects]
  );

  const tapExit = useCallback(
    (x: SceneExit) => {
      if (narration) return;
      if (!test(x.enabledIf, state)) {
        if (x.blockedText) startNarration([x.blockedText]);
        return;
      }
      setState(enterSceneState(state, x.to));
    },
    [narration, state, startNarration, enterSceneState]
  );

  const solvePuzzle = useCallback(
    (puzzleId: string) => {
      const puzzle = PUZZLES_BY_ID[puzzleId];
      if (!puzzle) return;
      setOpenPuzzleId(null);
      const base = {
        ...state,
        solvedPuzzles: [...new Set([...state.solvedPuzzles, puzzleId])],
      };
      setState(commitEffects(base, puzzle.onSolve.effects));
      startNarration(puzzle.onSolve.lines);
    },
    [state, commitEffects, startNarration]
  );

  const closePuzzle = useCallback(() => setOpenPuzzleId(null), []);

  // -------------------------------------------------- oyun yaşam döngüsü
  const startNew = useCallback(() => {
    // Taze durumdan başlanır: önceki oyunun "görüldü" işaretleri taşınmaz,
    // böylece açılış metni her yeni oyunda yeniden akar.
    const fresh = initialState(lang, FIRST_SCENE);
    setNarration(null);
    setLastNarration(null);
    setScreen("game");
    setState(enterSceneState(fresh, FIRST_SCENE));
  }, [lang, enterSceneState]);

  const continueGame = useCallback(() => {
    const saved = savedRef.current;
    if (!saved) return startNew();
    setNarration(null);
    setLastNarration(null);
    setState({ ...saved, lang });
    setScreen("game");
  }, [lang, startNew]);

  const deleteSave = useCallback(async () => {
    await clearGame();
    savedRef.current = null;
    setHasSave(false);
    setNarration(null);
    setLastNarration(null);
    setState(initialState(lang, FIRST_SCENE));
    setScreen("title");
  }, [lang]);

  const toTitle = useCallback(() => setScreen("title"), []);

  /** Sonraki bölüm yazıldıysa oraya geçer, yazılmadıysa başlığa döner. */
  const nextChapter = useCallback(() => {
    const target = SCENES_BY_ID[state.sceneId]?.chapterEnd?.nextChapter;
    const chapter = target != null ? CHAPTERS_BY_ID[target] : undefined;
    if (!chapter) {
      setScreen("title");
      return;
    }
    setNarration(null);
    setLastNarration(null);
    setScreen("game");
    setState(enterSceneState({ ...state, chapter: chapter.id }, chapter.entryScene));
  }, [state, enterSceneState]);

  const visible = useCallback((cond?: Parameters<typeof test>[0]) => test(cond, state), [state]);

  const api = useMemo<GameApi>(
    () => ({
      ready, hasSave, screen, lang, state,
      narration, narrationStep, lastNarration, toasts, openPuzzleId,
      setLang, startNew, continueGame, deleteSave, toTitle,
      advance, tapHotspot, tapExit, closePuzzle, solvePuzzle, visible, nextChapter,
    }),
    [
      ready, hasSave, screen, lang, state, narration, narrationStep, lastNarration, toasts,
      openPuzzleId, setLang, startNew, continueGame, deleteSave, toTitle, advance, tapHotspot,
      tapExit, closePuzzle, solvePuzzle, visible, nextChapter,
    ]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
