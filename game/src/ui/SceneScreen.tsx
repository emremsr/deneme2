import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SCENES_BY_ID } from "../content";
import { useGame } from "../engine/GameProvider";
import { test } from "../engine/state";
import type { Hotspot } from "../engine/types";
import { t, UI } from "../i18n";
import { SceneArt, SCENE_ASPECT } from "./SceneArt";
import { space, theme, type as ty } from "./theme";

export function SceneScreen({ onOpenNotebook }: { onOpenNotebook: () => void }) {
  const g = useGame();
  const scene = SCENES_BY_ID[g.state.sceneId];
  if (!scene) return null;

  const narrating = g.narration !== null;
  const line = narrating ? g.narration![g.narrationStep] : null;

  const tap = (h: Hotspot) => {
    Haptics.selectionAsync().catch(() => {});
    g.tapHotspot(h);
  };

  return (
    <View style={styles.root}>
      {/* ---------------------------------------------- üst şerit */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.chapter}>
            {t(UI.chapter, g.lang)} {g.state.chapter} · {t(scene.title, g.lang)}
          </Text>
          {scene.stamp ? <Text style={styles.stamp}>{t(scene.stamp, g.lang)}</Text> : null}
        </View>
        <Pressable
          onPress={onOpenNotebook}
          style={({ pressed }) => [styles.notebookBtn, pressed && styles.pressed]}
          accessibilityLabel={t(UI.notebook, g.lang)}
        >
          <Text style={styles.notebookTxt}>{t(UI.notebook, g.lang)}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{g.state.clues.length}</Text>
          </View>
        </Pressable>
      </View>

      {/* ---------------------------------------------- sahne + hotspot katmanı */}
      <View style={styles.sceneWrap}>
        <SceneArt scene={scene} />
        <View style={StyleSheet.absoluteFill} pointerEvents={narrating ? "none" : "auto"}>
          {scene.hotspots
            .filter((h) => test(h.visibleIf, g.state))
            .map((h) => (
              <HotspotMarker
                key={h.id}
                hotspot={h}
                label={t(h.label, g.lang)}
                onPress={() => tap(h)}
                dim={narrating}
              />
            ))}
        </View>
      </View>

      {/* ---------------------------------------------- anlatı / çıkışlar */}
      {narrating ? (
        <Pressable style={styles.narration} onPress={g.advance}>
          <ScrollView contentContainerStyle={{ paddingBottom: space(1) }}>
            <Text style={styles.narrationTxt}>{t(line!, g.lang)}</Text>
          </ScrollView>
          <View style={styles.narrationFoot}>
            <Text style={styles.dots}>
              {g.narration!.map((_, i) => (i === g.narrationStep ? "●" : "·")).join(" ")}
            </Text>
            <Text style={styles.tapHint}>{t(UI.tapToContinue, g.lang)}</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.actions}>
          <ScrollView contentContainerStyle={{ padding: space(2) }}>
          {/* Son okunan metin soluk olarak durur — oyuncu geri dönüp okuyabilsin. */}
          {g.lastNarration ? (
            <View style={styles.echo}>
              {g.lastNarration.map((l, i) => (
                <Text key={i} style={styles.echoTxt}>
                  {t(l, g.lang)}
                </Text>
              ))}
            </View>
          ) : null}
          <Text style={styles.hintLine}>
            {g.lang === "tr"
              ? "Odadaki nesnelere dokun. Her nesne bir kez konuşmaz."
              : "Touch the objects in the room. No object speaks only once."}
          </Text>
          </ScrollView>
          {/* Çıkışlar başparmak menzilinde, ekranın altında sabit durur. */}
          <View style={styles.exitBar}>
          {(scene.exits ?? [])
            .filter((x) => test(x.visibleIf, g.state))
            .map((x) => {
              const open = test(x.enabledIf, g.state);
              return (
                <Pressable
                  key={x.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    g.tapExit(x);
                  }}
                  style={({ pressed }) => [
                    styles.exit,
                    !open && styles.exitLocked,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.exitTxt, !open && styles.exitTxtLocked]}>
                    {open ? "→ " : "× "}
                    {t(x.label, g.lang)}
                  </Text>
                  {!open ? <Text style={styles.lockedTag}>{t(UI.locked, g.lang)}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

/** Hotspot: görünmez dokunma alanı + üstünde çok soluk bir halka. */
function HotspotMarker({
  hotspot,
  label,
  onPress,
  dim,
}: {
  hotspot: Hotspot;
  /** İçerikteki `label` buraya bağlanır — ekran okuyucu için tek ipucu bu. */
  label: string;
  onPress: () => void;
  dim: boolean;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        position: "absolute",
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.w}%`,
        height: `${hotspot.h}%`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          borderWidth: 1,
          borderColor: theme.safelight,
          opacity: dim
            ? 0
            : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.5] }),
          transform: [
            { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) },
          ],
        }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space(2),
    paddingVertical: space(1.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  chapter: { color: theme.textDim, fontSize: ty.small, letterSpacing: 0.5 },
  stamp: { color: theme.textFaint, fontSize: ty.label, marginTop: 2, letterSpacing: 1 },
  notebookBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    paddingHorizontal: space(1.5),
    paddingVertical: space(0.75),
    borderRadius: 3,
    backgroundColor: theme.bgRaised,
  },
  notebookTxt: { color: theme.text, fontSize: ty.small },
  badge: {
    marginLeft: space(1),
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: theme.safelightDim,
    alignItems: "center",
  },
  badgeTxt: { color: theme.text, fontSize: ty.label, fontVariant: ["tabular-nums"] },
  sceneWrap: { width: "100%", aspectRatio: SCENE_ASPECT },
  narration: {
    flex: 1,
    padding: space(2.5),
    backgroundColor: theme.bgRaised,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
  },
  narrationTxt: { color: theme.text, fontSize: ty.body, lineHeight: ty.bodyLine },
  narrationFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: space(1.5),
  },
  dots: { color: theme.safelightDim, fontSize: ty.label, letterSpacing: 2 },
  tapHint: { color: theme.textFaint, fontSize: ty.label, fontStyle: "italic" },
  actions: { flex: 1, backgroundColor: theme.bg, justifyContent: "space-between" },
  exitBar: { padding: space(2), paddingTop: 0 },
  hintLine: {
    color: theme.textFaint,
    fontSize: ty.small,
    fontStyle: "italic",
    marginBottom: space(2),
  },
  echo: {
    borderLeftWidth: 2,
    borderLeftColor: theme.border,
    paddingLeft: space(1.75),
    marginBottom: space(2.5),
    gap: space(1),
  },
  echoTxt: { color: theme.textDim, fontSize: ty.small, lineHeight: 22 },
  exit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    backgroundColor: theme.bgRaised,
    paddingHorizontal: space(2),
    paddingVertical: space(1.75),
    borderRadius: 3,
    marginBottom: space(1),
  },
  exitLocked: { opacity: 0.55, borderStyle: "dashed" },
  exitTxt: { color: theme.text, fontSize: ty.body },
  exitTxtLocked: { color: theme.textDim },
  lockedTag: { color: theme.textFaint, fontSize: ty.label, letterSpacing: 1 },
  pressed: { opacity: 0.7 },
});
