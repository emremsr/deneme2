import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useGame } from "../engine/GameProvider";
import { t, UI } from "../i18n";
import { space, theme, type as ty } from "./theme";

/** Yeni ipucu ve "bir anın değişti" bildirimleri. */
export function Toasts() {
  const g = useGame();
  if (g.toasts.length === 0) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      {g.toasts.map((toast) => {
        const memory = toast.kind === "memory";
        const label = memory
          ? t(toast.text === "single" ? UI.memoryChanged : UI.memoryChangedPlural, g.lang)
          : `${t(UI.newClue, g.lang)}: ${toast.text}`;
        return (
          <View
            key={toast.id}
            style={[styles.toast, { borderLeftColor: memory ? theme.ani : theme.iz }]}
          >
            <Text style={[styles.txt, memory && { color: theme.ani }]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Üstte durur: alttaki çıkış düğmelerini örtmemeli.
  wrap: { position: "absolute", left: space(2), right: space(2), top: space(1), gap: space(1) },
  toast: {
    backgroundColor: theme.bgSunken,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    borderLeftWidth: 3,
    borderRadius: 3,
    paddingHorizontal: space(2),
    paddingVertical: space(1.5),
  },
  txt: { color: theme.text, fontSize: ty.small },
});
