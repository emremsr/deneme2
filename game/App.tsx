import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { validateContent } from "./src/content";
import { GameProvider, useGame } from "./src/engine/GameProvider";
import { ChapterEnd } from "./src/ui/ChapterEnd";
import { Notebook } from "./src/ui/Notebook";
import { PuzzleModal } from "./src/ui/PuzzleModal";
import { SceneScreen } from "./src/ui/SceneScreen";
import { theme } from "./src/ui/theme";
import { TitleScreen } from "./src/ui/TitleScreen";
import { Toasts } from "./src/ui/Toasts";

export default function App() {
  // İçerik tutarsızlığı (kırık ipucu/sahne referansı) geliştirmede erken yakalanır.
  useEffect(() => {
    if (!__DEV__) return;
    const errors = validateContent();
    if (errors.length) console.warn("İçerik hataları:\n" + errors.join("\n"));
  }, []);

  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Shell />
      </GameProvider>
    </SafeAreaProvider>
  );
}

function Shell() {
  const g = useGame();
  const [notebookOpen, setNotebookOpen] = useState(false);

  if (!g.ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.safelight} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {g.screen === "title" ? (
        <TitleScreen />
      ) : g.screen === "chapterEnd" ? (
        <ChapterEnd />
      ) : (
        <SceneScreen onOpenNotebook={() => setNotebookOpen(true)} />
      )}

      <Notebook visible={notebookOpen} onClose={() => setNotebookOpen(false)} />
      <PuzzleModal />
      <Toasts />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  loading: { flex: 1, backgroundColor: theme.bg, alignItems: "center", justifyContent: "center" },
});
