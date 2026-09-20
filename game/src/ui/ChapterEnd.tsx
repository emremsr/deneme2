import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CLUES_BY_ID, SCENES_BY_ID } from "../content";
import { useGame } from "../engine/GameProvider";
import { readClue } from "../engine/state";
import { t, UI } from "../i18n";
import { space, theme, type as ty } from "./theme";

/**
 * Bölüm sonu kartı. Toplanan ipuçlarını özetler ve — asıl önemlisi —
 * kaç tanesinin İZ, kaç tanesinin ANI olduğunu gösterir.
 * Oyuncu neye dayandığını görmeli.
 */
export function ChapterEnd() {
  const g = useGame();
  const scene = SCENES_BY_ID[g.state.sceneId];
  const end = scene?.chapterEnd;
  const clues = g.state.clues.map((id) => CLUES_BY_ID[id]).filter(Boolean);
  const counts = {
    iz: clues.filter((c) => c.kind === "iz").length,
    ani: clues.filter((c) => c.kind === "ani").length,
    ifade: clues.filter((c) => c.kind === "ifade").length,
  };
  const total = clues.length;
  const changed = clues.filter((c) => readClue(c, g.state).superseded.length > 0).length;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: space(3), paddingTop: space(8) }}>
        <Text style={styles.heading}>{end ? t(end.heading, g.lang) : ""}</Text>
        <View style={styles.rule} />

        <Text style={styles.section}>
          {g.lang === "tr" ? "Defterinde ne var" : "What is in your notebook"}
        </Text>
        <View style={styles.tally}>
          <Tally n={counts.iz} label={t(UI.kindIz, g.lang)} color={theme.iz} />
          <Tally n={counts.ani} label={t(UI.kindAni, g.lang)} color={theme.ani} />
          <Tally n={counts.ifade} label={t(UI.kindIfade, g.lang)} color={theme.ifade} />
        </View>

        <Text style={styles.note}>
          {g.lang === "tr"
            ? `${total} ipucu topladın. ${changed} tanesi şimdiden anlam değiştirdi.\n\nİZ ipuçları asla değişmeyecek. ANI ipuçlarına ilerleyen bölümlerde bir daha bak — aynı şeyi okumayacaksın.`
            : `You collected ${total} clues. ${changed} of them have already changed meaning.\n\nTRACE clues will never change. Come back to your MEMORY clues in later chapters — you will not read the same thing.`}
        </Text>

        {end?.teaser ? (
          <View style={styles.teaser}>
            <Text style={styles.teaserLabel}>{g.lang === "tr" ? "SIRADAKİ" : "NEXT"}</Text>
            <Text style={styles.teaserTxt}>{t(end.teaser, g.lang)}</Text>
            <Text style={styles.teaserSoon}>
              {g.lang === "tr" ? "yapım aşamasında" : "in production"}
            </Text>
          </View>
        ) : null}

        <Pressable onPress={g.nextChapter} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.btnTxt}>{g.lang === "tr" ? "Başlığa Dön" : "Back to Title"}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Tally({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <View style={[styles.tallyBox, { borderColor: color }]}>
      <Text style={[styles.tallyN, { color }]}>{n}</Text>
      <Text style={[styles.tallyLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  heading: { color: theme.text, fontSize: ty.title, letterSpacing: 6, textAlign: "center" },
  rule: { width: 40, height: 1, backgroundColor: theme.safelight, alignSelf: "center", marginVertical: space(3) },
  section: { color: theme.textDim, fontSize: ty.label, letterSpacing: 2, textTransform: "uppercase" },
  tally: { flexDirection: "row", gap: space(1.5), marginTop: space(1.5) },
  tallyBox: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 3,
    paddingVertical: space(2),
    alignItems: "center",
  },
  tallyN: { fontSize: ty.huge, fontVariant: ["tabular-nums"] },
  tallyLabel: { fontSize: ty.label, letterSpacing: 1.5, marginTop: 2 },
  note: { color: theme.textDim, fontSize: ty.small, lineHeight: 22, marginTop: space(3) },
  teaser: {
    marginTop: space(4),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
    paddingTop: space(2.5),
    alignItems: "center",
  },
  teaserLabel: { color: theme.textFaint, fontSize: ty.label, letterSpacing: 3 },
  teaserTxt: { color: theme.text, fontSize: ty.title, marginTop: space(1), letterSpacing: 1 },
  teaserSoon: { color: theme.textFaint, fontSize: ty.label, fontStyle: "italic", marginTop: space(0.5) },
  btn: {
    marginTop: space(5),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    backgroundColor: theme.bgRaised,
    paddingVertical: space(2),
    borderRadius: 3,
    alignItems: "center",
  },
  btnTxt: { color: theme.text, fontSize: ty.body, letterSpacing: 2 },
});
