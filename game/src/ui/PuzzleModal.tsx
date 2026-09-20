import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PUZZLES_BY_ID } from "../content";
import { useGame } from "../engine/GameProvider";
import type { Puzzle } from "../engine/types";
import { t, UI } from "../i18n";
import { space, theme, type as ty } from "./theme";

export function PuzzleModal() {
  const g = useGame();
  const puzzle = g.openPuzzleId ? PUZZLES_BY_ID[g.openPuzzleId] : null;
  if (!puzzle) return null;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={g.closePuzzle}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <PuzzleBody key={puzzle.id} puzzle={puzzle} />
        </View>
      </View>
    </Modal>
  );
}

function PuzzleBody({ puzzle }: { puzzle: Puzzle }) {
  const g = useGame();
  const [wrongCount, setWrongCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const fail = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    setWrongCount((n) => n + 1);
    setMessage(puzzle.wrongText ? t(puzzle.wrongText, g.lang) : t(UI.wrong, g.lang));
  };
  const win = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    g.solvePuzzle(puzzle.id);
  };

  const showHint = puzzle.hint && wrongCount >= puzzle.hint.after;

  return (
    <>
      <View style={styles.head}>
        <Text style={styles.title}>{t(puzzle.title, g.lang)}</Text>
        <Pressable onPress={g.closePuzzle} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: space(1) }}>
        <Text style={styles.prompt}>{t(puzzle.prompt, g.lang)}</Text>

        {puzzle.type === "dial" && <Dial puzzle={puzzle} onWin={win} onFail={fail} />}
        {puzzle.type === "code" && <Code puzzle={puzzle} onWin={win} onFail={fail} />}
        {puzzle.type === "sequence" && <Sequence puzzle={puzzle} onWin={win} onFail={fail} />}

        {message ? <Text style={styles.wrong}>{message}</Text> : null}
        {showHint ? (
          <View style={styles.hintBox}>
            <Text style={styles.hintLabel}>{t(UI.hint, g.lang)}</Text>
            <Text style={styles.hintTxt}>{t(puzzle.hint!.text, g.lang)}</Text>
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}

// ---------------------------------------------------------------- kadran

function Dial({
  puzzle,
  onWin,
  onFail,
}: {
  puzzle: Extract<Puzzle, { type: "dial" }>;
  onWin: () => void;
  onFail: () => void;
}) {
  const g = useGame();
  const [values, setValues] = useState<number[]>(() => Array(puzzle.dials).fill(puzzle.min));

  const step = (i: number, delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    setValues((v) => {
      const next = [...v];
      const span = puzzle.max - puzzle.min + 1;
      next[i] = ((next[i] - puzzle.min + delta + span) % span) + puzzle.min;
      return next;
    });
  };

  const submit = () =>
    values.every((v, i) => v === puzzle.answer[i]) ? onWin() : onFail();

  return (
    <>
      <View style={styles.dialRow}>
        {values.map((v, i) => (
          <View key={i} style={styles.dial}>
            <Pressable onPress={() => step(i, 1)} hitSlop={8} style={styles.dialArrow}>
              <Text style={styles.dialArrowTxt}>▲</Text>
            </Pressable>
            <Text style={styles.dialValue}>{v}</Text>
            <Pressable onPress={() => step(i, -1)} hitSlop={8} style={styles.dialArrow}>
              <Text style={styles.dialArrowTxt}>▼</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <SubmitBtn onPress={submit} label={t(UI.solve, g.lang)} />
    </>
  );
}

// ---------------------------------------------------------------- kod girişi

function Code({
  puzzle,
  onWin,
  onFail,
}: {
  puzzle: Extract<Puzzle, { type: "code" }>;
  onWin: () => void;
  onFail: () => void;
}) {
  const g = useGame();
  const [text, setText] = useState("");

  const norm = (s: string) =>
    puzzle.normalize === false ? s : s.toLocaleUpperCase("tr").replace(/\s|-/g, "");

  const submit = () =>
    puzzle.answer.some((a) => norm(a) === norm(text)) ? onWin() : onFail();

  return (
    <>
      <TextInput
        value={text}
        onChangeText={setText}
        keyboardType={puzzle.keyboard === "numeric" ? "number-pad" : "default"}
        autoCapitalize="characters"
        autoCorrect={false}
        style={styles.input}
        placeholder="…"
        placeholderTextColor={theme.textFaint}
        onSubmitEditing={submit}
      />
      <SubmitBtn onPress={submit} label={t(UI.solve, g.lang)} />
    </>
  );
}

// ---------------------------------------------------------------- sıralama

function Sequence({
  puzzle,
  onWin,
  onFail,
}: {
  puzzle: Extract<Puzzle, { type: "sequence" }>;
  onWin: () => void;
  onFail: () => void;
}) {
  const g = useGame();
  const [order, setOrder] = useState<string[]>([]);
  const remaining = useMemo(
    () => puzzle.items.filter((i) => !order.includes(i.id)),
    [puzzle.items, order]
  );

  const submit = () =>
    order.length === puzzle.answer.length && order.every((id, i) => id === puzzle.answer[i])
      ? onWin()
      : onFail();

  return (
    <>
      <View style={styles.seqSlots}>
        {order.map((id, i) => {
          const item = puzzle.items.find((x) => x.id === id)!;
          return (
            <Pressable
              key={id}
              onPress={() => setOrder((o) => o.filter((x) => x !== id))}
              style={styles.seqChip}
            >
              <Text style={styles.seqChipIndex}>{i + 1}</Text>
              <Text style={styles.seqChipTxt}>{t(item.label, g.lang)}</Text>
            </Pressable>
          );
        })}
        {order.length === 0 ? (
          <Text style={styles.seqEmpty}>
            {g.lang === "tr" ? "Sırayı aşağıdan kur." : "Build the order below."}
          </Text>
        ) : null}
      </View>
      <View style={styles.seqPool}>
        {remaining.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setOrder((o) => [...o, item.id]);
            }}
            style={styles.seqOption}
          >
            <Text style={styles.seqChipTxt}>{t(item.label, g.lang)}</Text>
          </Pressable>
        ))}
      </View>
      <SubmitBtn onPress={submit} label={t(UI.solve, g.lang)} />
    </>
  );
}

function SubmitBtn({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.submit, pressed && { opacity: 0.7 }]}>
      <Text style={styles.submitTxt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: "center",
    padding: space(2.5),
  },
  sheet: {
    backgroundColor: theme.bgRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    borderRadius: 4,
    padding: space(2.5),
    maxHeight: "85%",
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space(2),
  },
  title: { color: theme.text, fontSize: ty.title, letterSpacing: 1.5 },
  close: { color: theme.textDim, fontSize: 20 },
  prompt: {
    color: theme.textDim,
    fontSize: ty.body,
    lineHeight: ty.bodyLine,
    marginBottom: space(3),
  },
  dialRow: { flexDirection: "row", justifyContent: "center", gap: space(2) },
  dial: {
    alignItems: "center",
    backgroundColor: theme.bgSunken,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    borderRadius: 3,
    paddingVertical: space(1),
    paddingHorizontal: space(2),
  },
  dialArrow: { paddingVertical: space(0.75) },
  dialArrowTxt: { color: theme.safelight, fontSize: 14 },
  dialValue: {
    color: theme.text,
    fontSize: ty.huge,
    fontVariant: ["tabular-nums"],
    paddingVertical: space(0.5),
  },
  input: {
    backgroundColor: theme.bgSunken,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    borderRadius: 3,
    color: theme.text,
    fontSize: ty.title,
    letterSpacing: 4,
    textAlign: "center",
    paddingVertical: space(1.75),
  },
  submit: {
    marginTop: space(2.5),
    backgroundColor: theme.safelightDim,
    borderRadius: 3,
    paddingVertical: space(1.75),
    alignItems: "center",
  },
  submitTxt: { color: theme.text, fontSize: ty.body, letterSpacing: 2 },
  wrong: { color: theme.safelight, fontSize: ty.small, marginTop: space(2), textAlign: "center" },
  hintBox: {
    marginTop: space(2),
    borderLeftWidth: 2,
    borderLeftColor: theme.ani,
    paddingLeft: space(1.5),
  },
  hintLabel: { color: theme.ani, fontSize: ty.label, letterSpacing: 1.5 },
  hintTxt: { color: theme.textDim, fontSize: ty.small, marginTop: 3, lineHeight: 20 },
  seqSlots: {
    minHeight: 60,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    borderStyle: "dashed",
    borderRadius: 3,
    padding: space(1),
    gap: space(0.75),
  },
  seqEmpty: { color: theme.textFaint, fontSize: ty.small, fontStyle: "italic", padding: space(1) },
  seqChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.bgSunken,
    borderRadius: 3,
    paddingHorizontal: space(1.5),
    paddingVertical: space(1),
    gap: space(1),
  },
  seqChipIndex: { color: theme.safelight, fontSize: ty.label },
  seqChipTxt: { color: theme.text, fontSize: ty.small },
  seqPool: { flexDirection: "row", flexWrap: "wrap", gap: space(1), marginTop: space(2) },
  seqOption: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    borderRadius: 3,
    paddingHorizontal: space(1.5),
    paddingVertical: space(1),
  },
});
