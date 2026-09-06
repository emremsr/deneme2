import AsyncStorage from "@react-native-async-storage/async-storage";
import { SAVE_VERSION, type GameState } from "./state";

/**
 * İlerleme telefonun kendi deposunda tutulur. Sunucu, hesap, internet yok.
 */
const KEY = "karanlik-oda:save:v1";
const SETTINGS_KEY = "karanlik-oda:settings:v1";

export async function saveGame(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // Kayıt başarısız olsa bile oyun akışı durmaz.
    console.warn("Kayıt yazılamadı:", e);
  }
}

export async function loadGame(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    // Şema değiştiyse eski kaydı yok say — bozuk durumla oynatmaktansa baştan başlat.
    if (parsed?.version !== SAVE_VERSION) return null;
    return parsed;
  } catch (e) {
    console.warn("Kayıt okunamadı:", e);
    return null;
  }
}

export async function clearGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.warn("Kayıt silinemedi:", e);
  }
}

/** Dil tercihi kayıttan bağımsız yaşar — oyun silinse de hatırlanır. */
export async function saveLang(lang: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ lang }));
  } catch {}
}

export async function loadLang(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw).lang ?? null) : null;
  } catch {
    return null;
  }
}
