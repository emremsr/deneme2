import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CLUES_BY_ID } from "../content";
import { useGame } from "../engine/GameProvider";
import { readClue } from "../engine/state";
import type { Clue, ClueKind } from "../engine/types";
import { t, UI } from "../i18n";
import { space, theme, type as ty } from "./theme";

const KIND_COLOR: Record<ClueKind, string> = {
  iz: theme.iz,
  ani: theme.ani,
  ifade: theme.ifade,
};

const KIND_LABEL = { iz: UI.kindIz, ani: UI.kindAni, ifade: UI.kindIfade } as const;
const KIND_HELP = { iz: UI.kindIzHelp, ani: UI.kindAniHelp, ifade: UI.kindIfadeHelp } as const;

/**
 * Defter. Oyunun tek kalıcı ekranı.
 * ANI ipuçları değiştiğinde eski okuma ÜSTÜ ÇİZİLİ kalır — oyuncu neyi
 * kaybettiğini görmeli, bu oyunun bütün fikri bu.
 */
export function Notebook({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const g = useGame();
  const [openId, setOpenId] = useState<string | null>(null);

  const clues = g.state.clues.map((id) => CLUES_BY_ID[id]).filter(Boolean) as Clue[];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t(UI.notebook, g.lang)}</Text>
            <Text style={styles.count}>
              {clues.length} {t(UI.clueCount, g.lang)}
            </Text>
          </View>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}>
            <Text style={styles.closeTxt}>{t(UI.close, g.lang)}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: space(2), paddingBottom: space(6) }}>
          {clues.length === 0 ? (
            <Text style={styles.empty}>{t(UI.noClues, g.lang)}</Text>
          ) : (
            clues.map((clue) => {
              const reading = readClue(clue, g.state);
              const open = openId === clue.id;
              const color = KIND_COLOR[clue.kind];
              return (
                <Pressable
                  key={clue.id}
                  onPress={() => setOpenId(open ? null : clue.id)}
                  style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                >
                  <View style={styles.cardHead}>
                    <View style={[styles.kindTag, { borderColor: color }]}>
                      <Text style={[styles.kindTxt, { color }]}>
                        {t(KIND_LABEL[clue.kind], g.lang)}
                      </Text>
                    </View>
                    <Text style={styles.cardTitle}>{t(clue.title, g.lang)}</Text>
                    {reading.superseded.length > 0 ? (
                      <View style={styles.revDot}>
                        <Text style={styles.revDotTxt}>{reading.superseded.length}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* eski okumalar — üstü çizili */}
                  {open &&
                    reading.superseded.map((old, i) => (
                      <View key={i} style={styles.oldWrap}>
                        <Text style={styles.oldLabel}>{t(UI.oldReading, g.lang)}</Text>
                        <Text style={styles.oldTxt}>{t(old, g.lang)}</Text>
                      </View>
                    ))}

                  <Text style={styles.body}>{t(reading.current, g.lang)}</Text>

                  {open ? (
                    <Text style={[styles.help, { color }]}>{t(KIND_HELP[clue.kind], g.lang)}</Text>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, paddingTop: space(6) },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: space(2),
    paddingBottom: space(2),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  title: { color: theme.text, fontSize: ty.title, letterSpacing: 2 },
  count: { color: theme.textFaint, fontSize: ty.label, marginTop: 4, letterSpacing: 1 },
  close: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    paddingHorizontal: space(2),
    paddingVertical: space(1),
    borderRadius: 3,
  },
  closeTxt: { color: theme.textDim, fontSize: ty.small },
  empty: { color: theme.textFaint, fontStyle: "italic", fontSize: ty.body, marginTop: space(4) },
  card: {
    backgroundColor: theme.bgRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    borderRadius: 3,
    padding: space(2),
    marginBottom: space(1.5),
  },
  cardHead: { flexDirection: "row", alignItems: "center", marginBottom: space(1.25) },
  kindTag: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: space(1),
  },
  kindTxt: { fontSize: ty.label, letterSpacing: 1.5 },
  cardTitle: { color: theme.text, fontSize: ty.body, flex: 1 },
  revDot: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.ani,
    alignItems: "center",
    justifyContent: "center",
  },
  revDotTxt: { color: theme.bg, fontSize: ty.label, fontWeight: "700" },
  body: { color: theme.text, fontSize: ty.body, lineHeight: ty.bodyLine },
  oldWrap: {
    borderLeftWidth: 2,
    borderLeftColor: theme.textFaint,
    paddingLeft: space(1.5),
    marginBottom: space(1.5),
  },
  oldLabel: {
    color: theme.textFaint,
    fontSize: ty.label,
    letterSpacing: 1,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  oldTxt: {
    color: theme.textFaint,
    fontSize: ty.small,
    lineHeight: 21,
    textDecorationLine: "line-through",
  },
  help: { fontSize: ty.label, marginTop: space(1.5), fontStyle: "italic" },
});
