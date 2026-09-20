import React from "react";
import { Image, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import type { Scene } from "../engine/types";
import { theme } from "./theme";

/**
 * Sahne görseli 300x200 (3:2) koordinat uzayında çizilir.
 * Hotspot yüzdeleri bu kutuya birebir oturur, o yüzden en-boy oranı sabittir.
 *
 * Gerçek görseller geldiğinde tek yapılacak şey sahneye `image` alanını eklemek:
 *   image: require("../../assets/scenes/karanlik_oda.jpg")
 * Prosedürel çizim otomatik olarak devre dışı kalır, hotspot'lar aynen çalışır.
 */
export const SCENE_ASPECT = 3 / 2;

export function SceneArt({ scene }: { scene: Scene }) {
  if (scene.image) {
    return (
      <Image
        source={scene.image}
        style={{ width: "100%", aspectRatio: SCENE_ASPECT }}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={{ width: "100%", aspectRatio: SCENE_ASPECT, backgroundColor: theme.bgSunken }}>
      <Svg width="100%" height="100%" viewBox="0 0 300 200">
        {scene.art === "threshold" ? <Threshold /> : <Darkroom />}
        <Vignette />
      </Svg>
    </View>
  );
}

// ---------------------------------------------------------------- ortak

function Vignette() {
  return (
    <>
      <Defs>
        <RadialGradient id="vig" cx="50%" cy="45%" r="75%">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="300" height="200" fill="url(#vig)" />
    </>
  );
}

const RED = theme.safelight;
const RED_DIM = "#3a1512";
const EDGE = "#241012";

// ---------------------------------------------------------------- karanlık oda

function Darkroom() {
  return (
    <G>
      <Defs>
        <LinearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2a1113" />
          <Stop offset="0.55" stopColor="#180a0c" />
          <Stop offset="1" stopColor="#0a0405" />
        </LinearGradient>
        <RadialGradient id="lamp" cx="50%" cy="0%" r="60%">
          <Stop offset="0" stopColor={RED} stopOpacity="0.55" />
          <Stop offset="1" stopColor={RED} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect x="0" y="0" width="300" height="200" fill="url(#wall)" />
      <Rect x="0" y="0" width="300" height="120" fill="url(#lamp)" />

      {/* emniyet lambası */}
      <Circle cx="150" cy="4" r="7" fill={RED} opacity="0.9" />

      {/* tezgah */}
      <Rect x="0" y="158" width="300" height="4" fill={EDGE} />
      <Rect x="0" y="162" width="300" height="38" fill="#0d0607" />

      {/* --- kurutma ipi: 7 kare (hotspot 6,6,32,22) --- */}
      <Line x1="12" y1="20" x2="120" y2="18" stroke={RED_DIM} strokeWidth="1" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <G key={i}>
          <Rect
            x={16 + i * 13}
            y={21}
            width={11}
            height={22}
            fill="#150a0b"
            stroke={RED_DIM}
            strokeWidth="0.6"
          />
          {/* her karede aynı kapı silueti */}
          <Rect x={18.5 + i * 13} y={25} width={6} height={15} fill="#241113" />
          <Circle cx={23 + i * 13} cy={32} r={0.9} fill={RED} opacity="0.7" />
        </G>
      ))}

      {/* --- kimyasal rafı (40,5,20,15) --- */}
      <Rect x="118" y="38" width="64" height="2" fill={EDGE} />
      {[0, 1, 2].map((i) => (
        <G key={i}>
          <Rect x={124 + i * 20} y={18} width={11} height={20} fill="#1c0d0f" stroke={RED_DIM} strokeWidth="0.5" />
          <Rect x={127 + i * 20} y={13} width={5} height={5} fill="#1c0d0f" />
        </G>
      ))}

      {/* --- takvim (64,5,15,15) --- */}
      <Rect x="192" y="10" width="45" height="30" fill="#1a0f10" stroke={RED_DIM} strokeWidth="0.6" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4, 5].map((c) => {
          const n = r * 6 + c;
          return (
            <G key={`${r}-${c}`}>
              <Rect x={195 + c * 7} y={16 + r * 6} width={5} height={4} fill="#100809" />
              {n < 11 && (
                <Path
                  d={`M${195 + c * 7} ${16 + r * 6} l5 4 M${200 + c * 7} ${16 + r * 6} l-5 4`}
                  stroke={RED}
                  strokeWidth="0.5"
                  opacity="0.75"
                />
              )}
            </G>
          );
        })
      )}

      {/* --- ceket (1,32,12,36) --- */}
      <Line x1="20" y1="60" x2="20" y2="66" stroke={EDGE} strokeWidth="2" />
      <Path
        d="M20 66 C6 72 4 86 6 104 C7 118 9 130 12 136 L30 136 C33 128 34 112 33 98 C32 82 30 72 20 66 Z"
        fill="#140a0b"
        stroke={RED_DIM}
        strokeWidth="0.7"
      />

      {/* --- ayna (42,30,17,24) --- */}
      <Rect x="126" y="60" width="51" height="48" fill="#1e1416" stroke={RED_DIM} strokeWidth="1" />
      <Rect x="129" y="63" width="45" height="42" fill="#291a1d" />
      <Path d="M140 63 L152 84 L143 105" stroke="#0c0607" strokeWidth="0.8" fill="none" />
      <Path d="M152 84 L170 78" stroke="#0c0607" strokeWidth="0.6" fill="none" />
      {/* aynada belli belirsiz bir yüz */}
      <Ellipse cx="151" cy="82" rx="9" ry="12" fill="#150c0e" opacity="0.8" />

      {/* lavabo */}
      <Path d="M128 112 L176 112 L170 126 L134 126 Z" fill="#160c0d" stroke={EDGE} strokeWidth="0.6" />

      {/* --- telefon (42,64,15,11) --- */}
      <Rect x="128" y="130" width="41" height="20" rx="2" fill="#0d0708" stroke={RED_DIM} strokeWidth="0.7" />
      <Rect x="131" y="133" width="35" height="14" rx="1" fill="#1a0f11" />

      {/* --- banyo tepsisi (8,62,28,18) --- */}
      <Path d="M26 128 L106 128 L100 160 L32 160 Z" fill="#120a0b" stroke={RED_DIM} strokeWidth="0.8" />
      <Path d="M32 133 L100 133 L96 155 L36 155 Z" fill="#2a1416" opacity="0.9" />
      {/* banyodaki kare */}
      <Rect x="52" y="137" width="26" height="15" fill="#0a0506" stroke={RED} strokeWidth="0.4" opacity="0.8" />

      {/* --- ağrandizör (66,28,28,44) --- */}
      <Rect x="204" y="140" width="72" height="6" fill="#160c0d" />
      <Rect x="236" y="58" width="6" height="84" fill="#1c1012" />
      <Rect x="212" y="60" width="34" height="24" rx="2" fill="#201214" stroke={RED_DIM} strokeWidth="0.8" />
      <Rect x="222" y="84" width="14" height="10" fill="#180d0e" />
      <Ellipse cx="229" cy="96" rx="7" ry="3" fill="#2a1a1c" />
      {/* projeksiyon konisi */}
      <Path d="M222 98 L236 98 L252 140 L206 140 Z" fill={RED} opacity="0.08" />
      {/* kare seçici kadranı */}
      <Circle cx="248" cy="70" r="5" fill="#150b0c" stroke={RED} strokeWidth="0.6" opacity="0.9" />
    </G>
  );
}

// ---------------------------------------------------------------- eşik / koridor

function Threshold() {
  return (
    <G>
      <Defs>
        <LinearGradient id="corr" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#12161a" />
          <Stop offset="0.6" stopColor="#0a0d10" />
          <Stop offset="1" stopColor="#06080a" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="300" height="200" fill="url(#corr)" />

      {/* perspektif: koridor derinliği */}
      <Path d="M0 0 L300 0 L300 200 L0 200 Z" fill="none" />
      <Path d="M0 12 L300 22" stroke="#1a2126" strokeWidth="0.7" />
      <Path d="M0 196 L300 178" stroke="#1a2126" strokeWidth="0.7" />
      {/* yeşil yağlı boya, yarıya kadar */}
      <Path d="M0 108 L300 100 L300 200 L0 200 Z" fill="#101a16" opacity="0.85" />
      <Path d="M0 108 L300 100" stroke="#1d3129" strokeWidth="1.2" />

      {/* muşamba zemin çizgileri */}
      {[0, 1, 2, 3].map((i) => (
        <Path key={i} d={`M${-40 + i * 90} 200 L${120 + i * 34} 150`} stroke="#0e1316" strokeWidth="0.8" />
      ))}

      {/* --- çıkılan kapı (20,22,30,56) --- */}
      <Rect x="60" y="44" width="90" height="112" fill="#0c1113" stroke="#1c262a" strokeWidth="1.2" />
      <Rect x="66" y="50" width="78" height="100" fill="#0a0e10" />
      {/* göz hizasındaki sürgülü kapak */}
      <Rect x="92" y="72" width="26" height="12" fill="#151d20" stroke="#2b383d" strokeWidth="0.8" />
      <Line x1="105" y1="72" x2="105" y2="84" stroke="#2b383d" strokeWidth="0.6" />
      {/* kapı kolu yok — sadece kilit */}
      <Circle cx="138" cy="104" r="2.4" fill="#1e2a2e" />

      {/* --- isimlik (56,30,20,12) --- */}
      <Rect x="168" y="60" width="60" height="24" fill="#0d1214" stroke="#232f33" strokeWidth="0.9" />
      <Rect x="173" y="65" width="50" height="14" fill="#111719" />
      {/* çıkarılmış kartın bıraktığı soluk iz */}
      <Rect x="175" y="67" width="46" height="10" fill="#18211f" opacity="0.55" />

      {/* koridorun ucundaki camlı kapı */}
      <Rect x="256" y="66" width="34" height="96" fill="#0a0f11" stroke="#1b262a" strokeWidth="0.9" />
      <Rect x="260" y="72" width="26" height="44" fill="#16211f" opacity="0.7" />
    </G>
  );
}
