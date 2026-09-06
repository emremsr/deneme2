# Karanlık Oda

Türkçe/İngilizce, çevrimdışı çalışan, metin tabanlı psikolojik gerilim–polisiye oyunu.
Expo + React Native + TypeScript.

> Hikayenin tamamı, karakterler ve sekiz bölümlük plan: **[docs/hikaye.md](docs/hikaye.md)**

---

## Oyunun fikri

Oyuncu, ortağının kaybolduğu geceden hiçbir şey hatırlamayan bir dedektiftir.
Sahnelerdeki nesnelere dokunarak ipucu toplar, şifreleri çözer, bölümler arasında ilerler.

Mekanik özgünlük şurada: **topladığın ipuçlarının bir kısmı ilerledikçe kendini yeniden yazar.**

| Tip | Davranış |
|---|---|
| **İZ** | Fiziksel delil. Metni asla değişmez. |
| **ANI** | Hatıra. Sonraki bölümlerde metni değişir; eski okuma defterde üstü çizili kalır. |
| **İFADE** | Birinin söylediği. Yalan olabilir. |

Finalde oyuncu iddiasını hangi tür ipuçlarına dayandırdığına göre farklı sona ulaşır.

---

## Çalıştırma

```bash
npm install
npm start          # Expo Go ile telefonda aç (QR kod)
npm run android    # Android emülatör / cihaz
npm run ios        # iOS (macOS gerekir)
npm run web        # tarayıcıda
```

Kontroller:

```bash
npm run typecheck  # TypeScript denetimi
npm test           # başsız oynanış testi — 1. bölümü baştan sona oynar
```

`npm test` içerik tutarlılığını da doğrular: kırık ipucu/sahne/bulmaca referansı,
sahne dışına taşan hotspot, revizyonu olan bir İZ ipucu — hepsi hata verir.

---

## Kayıt

İlerleme yalnızca telefonun kendi deposunda (`AsyncStorage`) tutulur.
Sunucu, veritabanı, hesap veya internet bağlantısı yoktur. Bütün içerik uygulamaya gömülüdür.

---

## Mimari

Motor ile hikaye tamamen ayrıktır. Hikaye dosyaları yalnızca veri içerir, hiç mantık içermez.

```
src/
  engine/          MOTOR — hikayeyi bilmez
    types.ts         içerik şeması + koşul/etki yardımcıları
    state.ts         oyun durumu, koşul değerlendirme, ipucu okuması
    storage.ts       telefona kayıt/yükleme
    GameProvider.tsx React katmanı
  content/         HİKAYE — motoru bilmez
    clues.ts         ipuçları ve yeniden yazılma kuralları
    chapter1.ts      sahneler, hotspot'lar, bulmacalar
    index.ts         kayıt defteri + doğrulayıcı
  ui/              EKRANLAR
  i18n/            arayüz metinleri (tr/en)
docs/hikaye.md     hikaye bibliyografyası
test/              başsız oynanış testi
```

### Bölümler arası bağlantı nasıl kuruluyor

Her etkileşimin `when` (koşul) ve `effects` (etki) alanı vardır. 3. bölümdeki bir kapının
1. bölümde bulunan bir ipucuna bağlanması tek satırdır:

```ts
{ when: hasClue("bilet_saati"), lines: [...], effects: [setFlag("b3_kapi_acik")] }
```

Bir ANI ipucunun ilerleyen bölümde yeniden yazılması da aynı şekilde:

```ts
revisions: [
  { when: flag("b4_bitti"), body: { tr: "Düğüm cerrah düğümü…", en: "It is a surgeon's knot…" } },
]
```

### Yeni bölüm eklemek

1. `src/content/chapterN.ts` yaz (sahneler + bulmacalar)
2. İpuçlarını `src/content/clues.ts` içine ekle
3. `src/content/index.ts` içindeki üç diziye kaydet
4. `npm test`

Motorda hiçbir şey değişmez.

---

## Sahne görselleri

Şu an her sahne, koda gömülü **prosedürel SVG yer tutucu** ile çiziliyor
(`src/ui/SceneArt.tsx`). Gerçek görsel geldiğinde tek yapılacak:

```ts
// src/content/chapter1.ts
art: "darkroom",
image: require("../../assets/scenes/karanlik_oda.jpg"),
```

Hotspot koordinatları **yüzde** olduğu için (`x`, `y`, `w`, `h` → 0–100) görsel
değiştiğinde tıklama alanları aynen çalışmaya devam eder. Sahne kutusu sabit 3:2 orandadır,
görselleri bu oranda hazırlamak yeterlidir.
