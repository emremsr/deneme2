/**
 * Karanlık oda paleti: kırmızı emniyet lambası, gümüş jelatin, banyo suyu.
 * Oyun boyunca tek tema — psikolojik gerilim için açık tema yok.
 */
export const theme = {
  bg: "#0b0b0d",
  bgRaised: "#141417",
  bgSunken: "#050506",
  border: "#26262c",
  text: "#d8d5cf",
  textDim: "#8a8780",
  textFaint: "#55534f",
  /** Karanlık oda emniyet lambası — vurgular. */
  safelight: "#b8352e",
  safelightDim: "#5c1c19",
  /** İpucu tipleri */
  iz: "#5b8fb3",
  ani: "#c08a3e",
  ifade: "#7d7a74",
  overlay: "rgba(5,5,6,0.92)",
} as const;

export const type = {
  /** Anlatı metni — okunabilirlik her şeyden önemli. */
  body: 16,
  bodyLine: 26,
  small: 13,
  label: 11,
  title: 22,
  huge: 34,
} as const;

export const space = (n: number) => n * 8;
