import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CLUES, CLUES_BY_ID, FIRST_SCENE, PUZZLES_BY_ID, SCENES_BY_ID } from "../content";
import {
  acknowledgeRevisions,
  apply,
  changedClues,
  initialState,
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
  const [lastNarration, setLastNarration] = useState<LocalizedText[] | null>(null);
  const [narrationStep, setNarrationStep] = useState(0);
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

  // -------------------------------------------------- etki uygulama
  /**
   * Etkileri uygular, yeni ipucu / değişen anı bildirimlerini çıkarır,
   * bulmaca açılması gerekiyorsa açar.
   */
  const runEffects = useCallback(
    (effects: Effect[] = []) => {
      const puzzle = effects.find((e) => e.kind === "openPuzzle");
      setState((prev) => {
        let next = apply(prev, effects);

        for (const e of effects) {
          if (e.kind === "addClue" && !prev.clues.includes(e.id)) {
            const clue = CLUES_BY_ID[e.id];
            if (clue) pushToast("clue", clue.title[next.lang] ?? clue.title.tr);
          }
        }

        // Yeni bir bölüme/bayrağa geçildiyse eski ipuçları yeniden yazılmış olabilir.
        const changed = changedClues(CLUES, next);
        if (changed.length > 0) {
          pushToast("memory", changed.length === 1 ? "single" : "plural");
          next = acknowledgeRevisions(changed, next);
        }
        return next;
      });
      if (puzzle && puzzle.kind === "openPuzzle") setOpenPuzzleId(puzzle.id);
    },
    [pushToast]
  );

  // -------------------------------------------------- anlatı akışı
  const startNarration = useCallback((lines: LocalizedText[]) => {
    if (lines.length === 0) return;
    setNarration(lines);
    setLastNarration(lines);
    setNarrationStep(0);
  }, []);

  const enterScene = useCallback(
    (sceneId: string, seenFlagPrefix = "seen:") => {
      const scene = SCENES_BY_ID[sceneId];
      setState((s) => {
        const key = seenFlagPrefix + sceneId;
        const first = !s.firedActions.includes(key);
        if (first && scene?.intro?.length) {
          // Giriş metni yalnızca ilk gelişte akar.
          setTimeout(() => startNarration(scene.intro!), 0);
        }
        return first ? { ...s, firedActions: [...s.firedActions, key] } : s;
      });
    },
    [startNarration]
  );

  const advance = useCallback(() => {
    setNarrationStep((i) => {
      const total = narration?.length ?? 0;
      if (i + 1 >= total) {
        setNarration(null);
        return 0;
      }
      return i + 1;
    });
  }, [narration]);

  // Anlatı bitince, sahne bölüm sonu ise kartı göster.
  useEffect(() => {
    if (narration !== null || screen !== "game") return;
    const scene = SCENES_BY_ID[state.sceneId];
    if (scene?.chapterEnd) setScreen("chapterEnd");
  }, [narration, state.sceneId, screen]);

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
      if (action.once) setState((s) => ({ ...s, firedActions: [...s.firedActions, key] }));
      runEffects(action.effects);
    },
    [narration, state, startNarration, runEffects]
  );

  const tapExit = useCallback(
    (x: SceneExit) => {
      if (narration) return;
      if (!test(x.enabledIf, state)) {
        if (x.blockedText) startNarration([x.blockedText]);
        return;
      }
      setState((s) => ({ ...s, sceneId: x.to }));
      enterScene(x.to);
    },
    [narration, state, startNarration, enterScene]
  );

  const solvePuzzle = useCallback(
    (puzzleId: string) => {
      const puzzle = PUZZLES_BY_ID[puzzleId];
      if (!puzzle) return;
      setOpenPuzzleId(null);
      setState((s) => ({ ...s, solvedPuzzles: [...new Set([...s.solvedPuzzles, puzzleId])] }));
      startNarration(puzzle.onSolve.lines);
      runEffects(puzzle.onSolve.effects);
    },
    [startNarration, runEffects]
  );

  const closePuzzle = useCallback(() => setOpenPuzzleId(null), []);

  // -------------------------------------------------- oyun yaşam döngüsü
  const startNew = useCallback(() => {
    const fresh = initialState(lang, FIRST_SCENE);
    setState(fresh);
    setNarration(null);
    setLastNarration(null);
    setScreen("game");
    enterScene(FIRST_SCENE);
  }, [lang, enterScene]);

  const continueGame = useCallback(() => {
    const saved = savedRef.current;
    if (!saved) return startNew();
    setState({ ...saved, lang });
    setScreen("game");
  }, [lang, startNew]);

  const deleteSave = useCallback(async () => {
    await clearGame();
    savedRef.current = null;
    setHasSave(false);
    setScreen("title");
  }, []);

  const toTitle = useCallback(() => setScreen("title"), []);

  const nextChapter = useCallback(() => {
    // Sonraki bölüm henüz yazılmadıysa oyuncuyu başlığa döndür.
    setScreen("title");
  }, []);

  const visible = useCallback((cond?: Parameters<typeof test>[0]) => test(cond, state), [state]);

  const api = useMemo<GameApi>(
    () => ({
      ready,
      hasSave,
      screen,
      lang,
      state,
      narration,
      narrationStep,
      lastNarration,
      toasts,
      openPuzzleId,
      setLang,
      startNew,
      continueGame,
      deleteSave,
      toTitle,
      advance,
      tapHotspot,
      tapExit,
      closePuzzle,
      solvePuzzle,
      visible,
      nextChapter,
    }),
    [
      ready, hasSave, screen, lang, state, narration, narrationStep, lastNarration, toasts, openPuzzleId,
      setLang, startNew, continueGame, deleteSave, toTitle, advance, tapHotspot, tapExit,
      closePuzzle, solvePuzzle, visible, nextChapter,
    ]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
