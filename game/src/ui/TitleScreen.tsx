import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { CHAPTERS_BY_ID } from "../content";
import { useGame } from "../engine/GameProvider";
import { t, UI } from "../i18n";
import { space, theme, type as ty } from "./theme";

export function TitleScreen() {
  const g = useGame();
  const [showSettings, setShowSettings] = useState(false);
  const epigraph = CHAPTERS_BY_ID[1]?.epigraph;

  const confirmDelete = () => {
    Alert.alert(t(UI.deleteSave, g.lang), t(UI.deleteSaveConfirm, g.lang), [
      { text: t(UI.cancel, g.lang), style: "cancel" },
      { text: t(UI.delete, g.lang), style: "destructive", onPress: () => g.deleteSave() },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Text style={styles.kicker}>{g.lang === "tr" ? "bir gizem" : "a mystery"}</Text>
        <Text style={styles.title}>{t(UI.appTitle, g.lang)}</Text>
        <View style={styles.rule} />
        {epigraph ? <Text style={styles.epigraph}>{t(epigraph, g.lang)}</Text> : null}
      </View>

      <View style={styles.menu}>
        {g.hasSave ? (
          <Pressable onPress={g.continueGame} style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}>
            <Text style={styles.btnTxtPrimary}>{t(UI.continue, g.lang)}</Text>
          </Pressable>
        ) : null}

        <Pressable onPress={g.startNew} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
          <Text style={styles.btnTxt}>{t(UI.newGame, g.lang)}</Text>
        </Pressable>

        <Pressable onPress={() => setShowSettings((v) => !v)} style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}>
          <Text style={styles.btnGhostTxt}>{t(UI.settings, g.lang)}</Text>
        </Pressable>

        {showSettings ? (
          <View style={styles.settings}>
            <Text style={styles.settingLabel}>{t(UI.language, g.lang)}</Text>
            <View style={styles.langRow}>
              {(["tr", "en"] as const).map((l) => (
                <Pressable
                  key={l}
                  onPress={() => g.setLang(l)}
                  style={[styles.lang, g.lang === l && styles.langActive]}
                >
                  <Text style={[styles.langTxt, g.lang === l && styles.langTxtActive]}>
                    {l === "tr" ? "Türkçe" : "English"}
                  </Text>
                </Pressable>
              ))}
            </View>
            {g.hasSave ? (
              <Pressable onPress={confirmDelete} style={({ pressed }) => [styles.danger, pressed && styles.pressed]}>
                <Text style={styles.dangerTxt}>{t(UI.deleteSave, g.lang)}</Text>
              </Pressable>
            ) : null}
            <Text style={styles.storageNote}>
              {g.lang === "tr"
                ? "İlerleme yalnızca bu telefonda saklanır. Hesap yok, sunucu yok."
                : "Progress is stored on this phone only. No account, no server."}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: space(3), justifyContent: "space-between" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  kicker: { color: theme.safelight, fontSize: ty.label, letterSpacing: 5, textTransform: "uppercase" },
  title: {
    color: theme.text,
    fontSize: ty.huge,
    letterSpacing: 8,
    marginTop: space(2),
    textAlign: "center",
  },
  rule: { width: 40, height: 1, backgroundColor: theme.safelightDim, marginVertical: space(3) },
  epigraph: {
    color: theme.textFaint,
    fontSize: ty.small,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },
  menu: { gap: space(1.25), paddingBottom: space(3) },
  btn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    backgroundColor: theme.bgRaised,
    paddingVertical: space(2),
    borderRadius: 3,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: theme.safelightDim, borderColor: theme.safelight },
  btnTxt: { color: theme.text, fontSize: ty.body, letterSpacing: 2 },
  btnTxtPrimary: { color: theme.text, fontSize: ty.body, letterSpacing: 2 },
  btnGhost: { paddingVertical: space(1.5), alignItems: "center" },
  btnGhostTxt: { color: theme.textFaint, fontSize: ty.small, letterSpacing: 1.5 },
  settings: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
    paddingTop: space(2),
    gap: space(1.5),
  },
  settingLabel: { color: theme.textDim, fontSize: ty.label, letterSpacing: 1.5 },
  langRow: { flexDirection: "row", gap: space(1) },
  lang: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    paddingVertical: space(1.25),
    borderRadius: 3,
    alignItems: "center",
  },
  langActive: { borderColor: theme.safelight, backgroundColor: theme.safelightDim },
  langTxt: { color: theme.textDim, fontSize: ty.small },
  langTxtActive: { color: theme.text },
  danger: { paddingVertical: space(1.25), alignItems: "center" },
  dangerTxt: { color: theme.safelight, fontSize: ty.small },
  storageNote: { color: theme.textFaint, fontSize: ty.label, textAlign: "center", lineHeight: 17 },
  pressed: { opacity: 0.7 },
});
