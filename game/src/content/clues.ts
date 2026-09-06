import { flag, hasClue, type Clue } from "../engine/types";

/**
 * İPUÇLARI
 *
 * kind: "iz"    -> fiziksel delil, metni ASLA değişmez
 *       "ani"   -> hatıra, `revisions` ile kendini yeniden yazar
 *       "ifade" -> birinin sözü, yalan olabilir
 *
 * revisions sırayla değerlendirilir; koşulu sağlanan EN SON revizyon geçerlidir.
 * Sonraki bölümlerin bayrakları (b4_bitti, b7_bitti...) henüz kurulmadıysa
 * o revizyonlar sessizce uykuda kalır.
 */
export const CLUES: Clue[] = [
  // ------------------------------------------------------------ Bölüm 1
  {
    id: "foto_kapi8",
    kind: "iz",
    chapter: 1,
    title: { tr: "Sekiz Numaralı Kapı", en: "The Door Marked Eight" },
    body: {
      tr: "Kurutma ipinde yedi fotoğraf. Hepsi aynı kapı. Pirinç rakam: 8. Kapının üstündeki boya iki kat — altındaki yeşil.",
      en: "Seven photographs on the drying line. All of the same door. Brass numeral: 8. Two coats of paint on it — green underneath.",
    },
  },
  {
    id: "negatif_kodu",
    kind: "iz",
    chapter: 1,
    title: { tr: "Negatif Kenar Numaraları", en: "Negative Edge Numbers" },
    body: {
      tr: "Karelerin kenarında film numaraları: 3, 7, 11, 15, 19, 23, 27. Yedi kare, tek bir filmden değil — yedi ayrı gece.",
      en: "Frame numbers along the edges: 3, 7, 11, 15, 19, 23, 27. Seven frames, not from one roll — seven separate nights.",
    },
  },
  {
    id: "avuc_dikisi",
    kind: "ani",
    chapter: 1,
    title: { tr: "Avucumdaki Dikiş", en: "The Stitches in My Palm" },
    body: {
      tr: "Sol avucumda derin bir kesik, dikilmiş. Düzgün dikilmiş. Biri elimi onarmış — demek ki yanımda yardım eden biri vardı.",
      en: "A deep cut in my left palm, stitched. Stitched well. Someone repaired my hand — so someone was there to help me.",
    },
    revisions: [
      {
        when: hasClue("kendi_fotografim"),
        body: {
          tr: "Uyurken çekilen fotoğrafta sol elim görünüyor. Avucum açık. Dikiş yok. Kesik o fotoğraftan SONRA oldu — ve ben o zamandan beri uyuyordum.",
          en: "In the photo of me sleeping, my left hand is visible. Palm open. No stitches. The cut happened AFTER that photo — and I have been asleep since then.",
        },
      },
      {
        when: flag("b4_bitti"),
        body: {
          tr: "Düğüm cerrah düğümü. Bunu bir acil serviste öğrenmezsin, ameliyathanede öğrenirsin. Aylin bir zamanlar cerrahtı.",
          en: "It is a surgeon's knot. You don't learn that in an ER, you learn it in an operating theatre. Aylin used to be a surgeon.",
        },
      },
      {
        when: flag("b7_bitti"),
        body: {
          tr: "Ben uyanmadan önce dikmiş. Yani oradaydı. Yardım etmedi — temizledi.",
          en: "She stitched it before I woke. So she was there. She did not help me — she cleaned up.",
        },
      },
    ],
  },
  {
    id: "agabey_cagrilari",
    kind: "ani",
    chapter: 1,
    title: { tr: "41 Cevapsız Çağrı", en: "41 Missed Calls" },
    body: {
      tr: "Telefonumda 41 cevapsız çağrı. Kayıtlı isim: AĞABEY. Benim ağabeyim yok. Biri telefonuma kendini böyle kaydetmiş.",
      en: "41 missed calls on my phone. Saved as: BROTHER. I have no brother. Someone saved themselves in my phone that way.",
    },
    revisions: [
      {
        when: flag("b3_bitti"),
        body: {
          tr: "Numarayı arşivden geçirdim. Numara benim. İkinci hattım. Kendi telefonum kendini 41 kez aramış.",
          en: "I ran the number through the archive. The number is mine. My second line. My own phone called itself 41 times.",
        },
      },
      {
        when: flag("b6_bitti"),
        body: {
          tr: "Kaydı Deniz açtı. Bana ağabey derdi. 41 çağrı benim kendi hattımdan geldi çünkü o gece telefonumu o kullanıyordu. Beni aramıyordu — beni arıyordu.",
          en: "Deniz created that contact. She called me abi — big brother. The 41 calls came from my own line because she was using my phone that night. She wasn't calling me. She was looking for me.",
        },
      },
    ],
  },
  {
    id: "kagit_dizeler",
    kind: "ani",
    chapter: 1,
    title: { tr: "Kağıttaki Dizeler", en: "Lines on a Scrap of Paper" },
    body: {
      tr: "Ceketimin cebinde katlanmış bir kağıt: \"kuyu derin / ip kısa / su hatırlıyor\". Bir şiir kırıntısı. Yazan kim bilmiyorum.",
      en: "A folded scrap in my jacket: \"the well is deep / the rope is short / water remembers\". A fragment of a poem. I don't know who wrote it.",
    },
    revisions: [
      {
        when: flag("b4_bitti"),
        body: {
          tr: "Şiir değil. Harfleri say: kuyu=4, derin=5, ip=2, kısa=4, su=2, hatırlıyor=10. Kasanın altı hanesi: 452-4210. Biri bana şifreyi bırakmış.",
          en: "Not a poem. Count the letters: well=4, deep=4, rope=4, short=5, water=5, remembers=9. The safe's six digits. Someone left me the combination.",
        },
      },
      {
        when: flag("b6_bitti"),
        body: {
          tr: "El yazısı bana ait değil. Bir çocuğun el yazısı. Yanık kutudaki defterle aynı el. Esra'nın eli.",
          en: "The handwriting isn't mine. It's a child's. The same hand as the notebook in the burnt tin. Esra's hand.",
        },
      },
    ],
  },
  {
    id: "kendi_fotografim",
    kind: "ani",
    chapter: 1,
    title: { tr: "Uyurken Çekilmiş Fotoğraf", en: "A Photograph of Me Sleeping" },
    body: {
      tr: "Tespit banyosunda bir kare kalmış. Ben. Bu odada, bu sandalyede, uyurken. Biri ben uyurken fotoğrafımı çekmiş ve burada, benim yanımda banyo etmiş.",
      en: "One frame left in the fixer. Me. In this room, in this chair, asleep. Someone photographed me sleeping and developed it here, beside me.",
    },
    revisions: [
      {
        when: flag("b7_bitti"),
        body: {
          tr: "Fotoğrafı çeken kişi odaya girmedi. Işık açısı yanlış. Bu kare kapıdaki gözetleme deliğinden çekilmiş. Odanın dışından. Beni izliyorlardı.",
          en: "Whoever took it never entered the room. The light angle is wrong. This frame was shot through the door's viewing panel. From outside. They were watching me.",
        },
      },
    ],
  },
  {
    id: "bilet_saati",
    kind: "iz",
    chapter: 1,
    title: { tr: "23:12 — Kadıköy", en: "23:12 — Kadıköy" },
    body: {
      tr: "Ceket cebinde bir geçiş kartı fişi. Kadıköy, 23:12, kayboluşun olduğu gece. Kağıt gerçek, mürekkep termal — sonradan yazılamaz.",
      en: "A transit card receipt in the jacket. Kadıköy, 23:12, the night she vanished. The paper is real, the ink thermal — it cannot be written after the fact.",
    },
  },
  {
    id: "takvim",
    kind: "iz",
    chapter: 1,
    title: { tr: "On Bir Gün", en: "Eleven Days" },
    body: {
      tr: "Duvardaki takvimde on bir gün çarpıyla kapatılmış. Çarpılar aynı kalemle ama farklı basınçla atılmış — hepsi bir oturuşta değil. Her gün biri gelip bir çarpı atmış.",
      en: "Eleven days crossed out on the wall calendar. Same pen, different pressure — not done in one sitting. Someone came each day and struck one out.",
    },
  },
  {
    id: "kimyasal_kokusu",
    kind: "ani",
    chapter: 1,
    title: { tr: "Koku", en: "The Smell" },
    body: {
      tr: "Oda tespit banyosu kokuyor. Sirke ve metal. Babamın bodrumu böyle kokardı. Burası bana ev gibi geliyor, bilmediğim halde.",
      en: "The room smells of fixer. Vinegar and metal. My father's basement smelled like this. This place feels like home, though I don't know it.",
    },
    revisions: [
      {
        when: flag("b5_bitti"),
        body: {
          tr: "Kayıtta öksürüyorum. Tespit banyosunda öksürmezsin, alışırsın. Bu koku kimyasal değil. Duman.",
          en: "On the tape I am coughing. You don't cough at fixer, you get used to it. This smell isn't chemical. It's smoke.",
        },
      },
      {
        when: flag("b6_bitti"),
        body: {
          tr: "1998. Bu koku 1998. Yirmi yedi yıldır bu kokuyu ev sanıyorum.",
          en: "1998. This smell is 1998. For twenty-seven years I have mistaken it for home.",
        },
      },
    ],
  },
  {
    id: "sekizinci_kare",
    kind: "iz",
    chapter: 1,
    title: { tr: "Sekizinci Kare", en: "The Eighth Frame" },
    body: {
      tr: "Basılmamış sekizinci kare, 31 numara. Aynı kapı — ama açık. Eşikte bir figür var, sırtı dönük. Arkadaki apartman tabelası okunuyor: HALİL BEY APT. / MODA.",
      en: "The unprinted eighth frame, number 31. The same door — but open. A figure stands in the threshold, turned away. The building sign behind is legible: HALİL BEY APT. / MODA.",
    },
  },
];

export const CLUES_BY_ID: Record<string, Clue> = Object.fromEntries(
  CLUES.map((c) => [c.id, c])
);
