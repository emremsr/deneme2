import {
  addClue,
  flag,
  hasClue,
  not,
  openPuzzle,
  setFlag,
  type Chapter,
  type Puzzle,
  type Scene,
} from "../engine/types";

export const CHAPTER_1: Chapter = {
  id: 1,
  title: { tr: "Karanlık Oda", en: "The Darkroom" },
  epigraph: {
    tr: "Bir fotoğrafı banyoda fazla bekletirsen kararır.\nHafıza da öyle.",
    en: "Leave a photograph in the bath too long and it goes black.\nMemory does the same.",
  },
  entryScene: "b1_karanlik_oda",
};

// ---------------------------------------------------------------- sahneler

const KARANLIK_ODA: Scene = {
  id: "b1_karanlik_oda",
  chapter: 1,
  title: { tr: "Karanlık Oda", en: "The Darkroom" },
  stamp: { tr: "03:47 — bilmediğim bir oda", en: "03:47 — a room I don't know" },
  art: "darkroom",
  intro: [
    {
      tr: "Saat 03:47. Bunu biliyorum çünkü duvarda kırmızı bir sayı var ve şu an bakabildiğim tek şey o.",
      en: "It is 03:47. I know this because there is a red number on the wall and it is the only thing I can look at right now.",
    },
    {
      tr: "Adımı biliyorum. Kerem. Mesleğimi biliyorum. On bir gün önce ortağımın kaybolduğunu biliyorum.",
      en: "I know my name. Kerem. I know my job. I know my partner disappeared eleven days ago.",
    },
    {
      tr: "Arasını bilmiyorum.",
      en: "I don't know anything in between.",
    },
    {
      tr: "Oda kırmızı. Tavanda tek bir emniyet lambası. Ve her yerde kağıt kokusu.",
      en: "The room is red. One safelight on the ceiling. And the smell of paper everywhere.",
    },
  ],
  hotspots: [
    {
      id: "kurutma_ipi",
      label: { tr: "Kurutma ipi", en: "Drying line" },
      x: 6,
      y: 6,
      w: 32,
      h: 22,
      actions: [
        {
          when: not(hasClue("foto_kapi8")),
          once: true,
          lines: [
            {
              tr: "İpte yedi fotoğraf, mandallarla asılı. Hepsi aynı şeyin fotoğrafı: bir apartman kapısı.",
              en: "Seven photographs pegged to the line. All of the same thing: an apartment door.",
            },
            {
              tr: "Pirinç rakam sekiz. Boya iki kat atılmış, altındaki yeşil kenarlardan sızıyor. Kapıyı tanımıyorum.",
              en: "A brass numeral eight. Two coats of paint, the green underneath bleeding at the edges. I don't know this door.",
            },
            {
              tr: "Yedi fotoğraf. Aynı kapı. Kim bir kapıyı yedi kere çeker?",
              en: "Seven photographs. The same door. Who photographs one door seven times?",
            },
          ],
          effects: [addClue("foto_kapi8")],
        },
        {
          when: not(hasClue("negatif_kodu")),
          once: true,
          lines: [
            {
              tr: "Karelerin kenarına eğiliyorum. Film numaraları basılı: 3, 7, 11, 15, 19, 23, 27.",
              en: "I lean in to the frame edges. Film numbers printed along them: 3, 7, 11, 15, 19, 23, 27.",
            },
            {
              tr: "Aynı filmden ardışık kareler değil bunlar. Aralarında boşluk var. Yedi ayrı gece.",
              en: "These aren't consecutive frames from one roll. There are gaps. Seven separate nights.",
            },
            {
              tr: "Yedi gece boyunca bir kapıyı izlemişim. Ve bunu hatırlamıyorum.",
              en: "For seven nights I watched a door. And I don't remember it.",
            },
          ],
          effects: [addClue("negatif_kodu")],
        },
        {
          lines: [
            {
              tr: "Yedi kare. Sekizincisi yok. Sekizincisi olmalıydı — dizi öyle diyor.",
              en: "Seven frames. There is no eighth. There should be an eighth — the sequence says so.",
            },
          ],
        },
      ],
    },
    {
      id: "siseler",
      label: { tr: "Kimyasal şişeleri", en: "Chemical bottles" },
      x: 40,
      y: 5,
      w: 20,
      h: 15,
      actions: [
        {
          when: not(hasClue("kimyasal_kokusu")),
          once: true,
          lines: [
            {
              tr: "Rafta üç şişe: banyo, durdurucu, tespit. Kapakları açık. Biri buradan yeni kalkmış.",
              en: "Three bottles on the shelf: developer, stop bath, fixer. Caps off. Someone left here recently.",
            },
            {
              tr: "Sirke ve metal kokusu. Babamın bodrumu tam böyle kokardı.",
              en: "Vinegar and metal. My father's basement smelled exactly like this.",
            },
            {
              tr: "Burayı bilmiyorum. Ama burası bana ev gibi geliyor. İkisi birden nasıl doğru olabilir?",
              en: "I don't know this place. But it feels like home. How can both be true?",
            },
          ],
          effects: [addClue("kimyasal_kokusu")],
        },
        {
          lines: [
            {
              tr: "Tespit şişesi neredeyse boş. Bu odada çok iş yapılmış.",
              en: "The fixer is nearly empty. A lot of work has been done in this room.",
            },
          ],
        },
      ],
    },
    {
      id: "takvim",
      label: { tr: "Duvar takvimi", en: "Wall calendar" },
      x: 64,
      y: 5,
      w: 15,
      h: 15,
      actions: [
        {
          when: not(hasClue("takvim")),
          once: true,
          lines: [
            {
              tr: "Duvarda ucuz bir takvim. On bir gün çarpıyla kapatılmış.",
              en: "A cheap calendar on the wall. Eleven days struck out.",
            },
            {
              tr: "Çarpılar aynı kalemle atılmış ama basınç her gün farklı. Bir oturuşta atılmamışlar.",
              en: "Same pen, but the pressure differs day to day. They weren't made in one sitting.",
            },
            {
              tr: "Yani biri her gün buraya geldi. Her gün bir çarpı attı. On bir kere.",
              en: "So someone came here every day. Struck out one day at a time. Eleven times.",
            },
          ],
          effects: [addClue("takvim")],
        },
        {
          lines: [
            {
              tr: "On ikinci günün karesi boş. Gün bitmedi. Ya da o kişi bugün gelmedi.",
              en: "The twelfth square is empty. The day isn't over. Or they haven't come today.",
            },
          ],
        },
      ],
    },
    {
      id: "ceket",
      label: { tr: "Ceketim", en: "My jacket" },
      x: 1,
      y: 32,
      w: 12,
      h: 36,
      actions: [
        {
          when: not(hasClue("kagit_dizeler")),
          once: true,
          lines: [
            {
              tr: "Kancada benim ceketim. Kolunda kurumuş bir leke var, rengini emniyet lambası yüzünden seçemiyorum.",
              en: "My jacket on the hook. A dried stain on the sleeve; the safelight won't let me name its colour.",
            },
            {
              tr: "İç cepte katlanmış bir kağıt: \"kuyu derin / ip kısa / su hatırlıyor\".",
              en: "A folded scrap in the inside pocket: \"the well is deep / the rope is short / water remembers\".",
            },
            {
              tr: "El yazısını tanımıyorum. Ama kağıdı katlayan ben olabilirim — kat izleri cebimin ölçüsünde.",
              en: "I don't recognise the hand. But I may have folded it — the creases match my pocket.",
            },
          ],
          effects: [addClue("kagit_dizeler")],
        },
        {
          when: not(hasClue("bilet_saati")),
          once: true,
          lines: [
            {
              tr: "Dış cepte bir geçiş kartı fişi. Termal kağıt, mürekkep soluk ama okunuyor.",
              en: "A transit receipt in the outer pocket. Thermal paper, the ink faded but legible.",
            },
            {
              tr: "KADIKÖY — 23:12. Tarih, Deniz'in kaybolduğu gece.",
              en: "KADIKÖY — 23:12. The date is the night Deniz vanished.",
            },
            {
              tr: "Termal kağıda sonradan bir şey yazamazsın. Bu fiş o gece basıldı. Ben o gece oradaydım.",
              en: "You cannot add anything to thermal paper after the fact. This was printed that night. I was there that night.",
            },
          ],
          effects: [addClue("bilet_saati")],
        },
        {
          lines: [
            {
              tr: "Cepler boş. Anahtarım yok. Cüzdanım yok. Rozetim yok.",
              en: "The pockets are empty. No keys. No wallet. No badge.",
            },
          ],
        },
      ],
    },
    {
      id: "ayna",
      label: { tr: "Ayna", en: "Mirror" },
      x: 42,
      y: 30,
      w: 17,
      h: 24,
      actions: [
        {
          when: not(hasClue("avuc_dikisi")),
          once: true,
          lines: [
            {
              tr: "Lavabonun üstünde çatlak bir ayna. Kırmızı ışıkta yüzüm bana ait değilmiş gibi duruyor. On bir günlük sakal.",
              en: "A cracked mirror over the basin. In red light my face looks like it belongs to someone else. Eleven days of beard.",
            },
            {
              tr: "Ellerimi kaldırıyorum. Sol avucumda derin bir kesik — dikilmiş.",
              en: "I raise my hands. A deep cut in my left palm — stitched.",
            },
            {
              tr: "Düzgün dikilmiş. Acele edilmemiş. Biri elimi onarmış; demek yanımda yardım eden biri vardı.",
              en: "Stitched well. Unhurried. Someone repaired my hand; so someone was there to help me.",
            },
          ],
          effects: [addClue("avuc_dikisi")],
        },
        {
          lines: [
            {
              tr: "Aynaya fazla bakma. Aynaya baktıkça yüzün yabancılaşır — bunu biri bana söylemişti.",
              en: "Don't look too long. The longer you look, the stranger your face gets — someone told me that once.",
            },
          ],
        },
      ],
    },
    {
      id: "telefon",
      label: { tr: "Telefon", en: "Phone" },
      x: 42,
      y: 64,
      w: 15,
      h: 11,
      actions: [
        {
          when: not(hasClue("agabey_cagrilari")),
          once: true,
          lines: [
            {
              tr: "Telefonum tezgahın üstünde, ekranı aşağı bakıyor. Pil yüzde üç.",
              en: "My phone on the bench, screen down. Battery at three percent.",
            },
            {
              tr: "41 cevapsız çağrı. Hepsi tek bir kayıttan. Kayıtlı isim: AĞABEY.",
              en: "41 missed calls. All from one contact. Saved as: BROTHER.",
            },
            {
              tr: "Benim ağabeyim yok. Hiç olmadı. Biri telefonuma kendini böyle kaydetmiş.",
              en: "I have no brother. I never did. Someone saved themselves in my phone that way.",
            },
          ],
          effects: [addClue("agabey_cagrilari")],
        },
        {
          lines: [
            {
              tr: "Numarayı arıyorum. Çalıyor. Odanın içinde bir yerde çalmıyor — bu iyi. Kimse açmıyor — bu değil.",
              en: "I call the number. It rings. It doesn't ring anywhere in this room — that's good. Nobody answers — that isn't.",
            },
          ],
        },
      ],
    },
    {
      id: "tepsi",
      label: { tr: "Banyo tepsisi", en: "Developing tray" },
      x: 8,
      y: 62,
      w: 28,
      h: 18,
      actions: [
        {
          when: not(hasClue("kendi_fotografim")),
          once: true,
          lines: [
            {
              tr: "Tespit banyosunda bir kare unutulmuş. Sıvı ılık. Yarım saatten fazla olmamış.",
              en: "A frame forgotten in the fixer. The liquid is still warm. Not more than half an hour.",
            },
            {
              tr: "Maşayla çıkarıyorum. Kare belirmiş, fazla belirmiş — neredeyse yanmış.",
              en: "I lift it with the tongs. The frame has developed, over-developed — almost burnt.",
            },
            {
              tr: "Benim. Bu odada. Bu sandalyede. Uyurken.",
              en: "It's me. In this room. In this chair. Asleep.",
            },
            {
              tr: "Biri ben uyurken fotoğrafımı çekmiş, sonra buraya gelip banyo etmiş. Yanı başımda. Ben uyanmadan.",
              en: "Someone photographed me sleeping, then came here and developed it. Beside me. Without waking me.",
            },
          ],
          effects: [addClue("kendi_fotografim")],
        },
        {
          lines: [
            {
              tr: "Fotoğrafa bir daha bakmıyorum. Bir kere yeterliydi.",
              en: "I don't look at the photograph again. Once was enough.",
            },
          ],
        },
      ],
    },
    {
      id: "agrandizor",
      label: { tr: "Ağrandizör", en: "Enlarger" },
      x: 66,
      y: 28,
      w: 28,
      h: 44,
      actions: [
        {
          when: not(hasClue("negatif_kodu")),
          lines: [
            {
              tr: "Ağrandizör. Altında film taşıyıcı, üstünde iki rakamlı bir kare seçici.",
              en: "The enlarger. A film carrier below, a two-digit frame selector above.",
            },
            {
              tr: "Makineyi kullanmayı biliyorum — ellerim biliyor. Ama hangi kareyi arayacağımı bilmiyorum.",
              en: "I know how to work it — my hands know. But I don't know which frame to look for.",
            },
          ],
        },
        {
          when: hasClue("sekizinci_kare"),
          lines: [
            {
              tr: "Sekizinci kare hâlâ taşıyıcıda. Bir daha bakmama gerek yok.",
              en: "The eighth frame is still in the carrier. I don't need to look again.",
            },
          ],
        },
        {
          lines: [
            {
              tr: "Taşıyıcıda kesilmemiş bir film şeridi duruyor. Basılmamış kareler var.",
              en: "An uncut strip sits in the carrier. There are unprinted frames on it.",
            },
            {
              tr: "Kare seçiciyi çeviriyorum. İki rakam. Hangisini arıyorum?",
              en: "I turn the frame selector. Two digits. Which one am I looking for?",
            },
          ],
          effects: [openPuzzle("agrandizor")],
        },
      ],
    },
  ],
  exits: [
    {
      id: "kapi",
      label: { tr: "Kapı", en: "The door" },
      to: "b1_esik",
      enabledIf: flag("b1_yon_belli"),
      blockedText: {
        tr: "Sürgü içeriden. İstesem çıkarım. Ama nereye gideceğimi bilmeden çıkmak, on ikinci günü de kaybetmek demek.",
        en: "The bolt is on the inside. I could leave whenever I want. But leaving without knowing where to go means losing the twelfth day too.",
      },
    },
  ],
};

const ESIK: Scene = {
  id: "b1_esik",
  chapter: 1,
  title: { tr: "Eşik", en: "The Threshold" },
  stamp: { tr: "04:26 — koridor", en: "04:26 — the corridor" },
  art: "threshold",
  intro: [
    {
      tr: "Sürgüyü çekiyorum. Ses çıkarmıyor. Menteşeler yağlanmış — yakın zamanda.",
      en: "I draw the bolt. It makes no sound. The hinges are oiled — recently.",
    },
    {
      tr: "Dışarısı koridor. Uzun, penceresiz, iki ucu da karanlık. Yer muşamba. Duvarlar yarıya kadar yeşil yağlı boya.",
      en: "Outside is a corridor. Long, windowless, dark at both ends. Linoleum floor. Walls green gloss to half height.",
    },
  ],
  hotspots: [
    {
      id: "kapinin_disi",
      label: { tr: "Kapının dış yüzü", en: "The outside of the door" },
      x: 20,
      y: 22,
      w: 30,
      h: 56,
      actions: [
        {
          when: not(flag("b1_kapak_gordum")),
          once: true,
          lines: [
            {
              tr: "Arkamı dönüp çıktığım kapıya bakıyorum.",
              en: "I turn back and look at the door I came out of.",
            },
            {
              tr: "Dış yüzünde göz hizasında küçük bir kapak var. Sürgülü. Dışarıdan açılıyor, içeriden değil.",
              en: "There is a small panel at eye height on the outside. Sliding. It opens from out here, not from inside.",
            },
            {
              tr: "Bir karanlık odada böyle bir kapak olmaz. Işık sızdırır.",
              en: "A darkroom would never have such a panel. It would leak light.",
            },
          ],
          effects: [setFlag("b1_kapak_gordum")],
        },
        {
          lines: [
            {
              tr: "Kapağı açıp içeri bakıyorum. Sandalye tam karşıda. Oturduğum yer, kapaktan bakınca ortada duruyor.",
              en: "I slide the panel and look in. The chair is directly opposite. Where I sat sits centred in the opening.",
            },
          ],
        },
      ],
    },
    {
      id: "isimlik",
      label: { tr: "İsimlik", en: "Name plate" },
      x: 56,
      y: 30,
      w: 20,
      h: 12,
      actions: [
        {
          lines: [
            {
              tr: "Kapının yanında metal bir isimlik yuvası. İçindeki kart çıkarılmış.",
              en: "A metal card holder beside the door. The card has been removed.",
            },
            {
              tr: "Yuvanın içinde kartın bıraktığı soluk bir iz var. Kart uzun süre orada durmuş.",
              en: "A pale outline remains where the card sat. It was there a long time.",
            },
          ],
        },
      ],
    },
  ],
  exits: [
    {
      id: "cikis",
      label: { tr: "Koridorun ucuna yürü", en: "Walk to the end of the corridor" },
      to: "b1_son",
    },
  ],
};

const SON: Scene = {
  id: "b1_son",
  chapter: 1,
  title: { tr: "Koridorun Ucu", en: "The End of the Corridor" },
  stamp: { tr: "04:31", en: "04:31" },
  art: "threshold",
  intro: [
    {
      tr: "Koridorun ucunda bir kapı daha var. Bu sefer camlı.",
      en: "There is another door at the end of the corridor. This one has glass.",
    },
    {
      tr: "Camdan dışarısı görünüyor: bahçe, ıslak asfalt, bir bariyer. Ve sağ tarafta bir tabela. Yazıyı seçemiyorum, ışık ters.",
      en: "Through the glass: a garden, wet asphalt, a barrier. And a sign on the right. I can't read it, the light is wrong.",
    },
    {
      tr: "Kapıyı itiyorum. Açılıyor. Kimse durdurmuyor.",
      en: "I push the door. It opens. Nobody stops me.",
    },
    {
      tr: "Bir kapıyı yedi gece izlemişim ve bunu hatırlamıyorum. Şimdi sekizinci geceye gidiyorum.",
      en: "I watched a door for seven nights and I don't remember it. Now I am going to the eighth night.",
    },
  ],
  hotspots: [],
  chapterEnd: {
    heading: { tr: "BÖLÜM 1 SONU", en: "END OF CHAPTER 1" },
    teaser: { tr: "Bölüm 2 — Sekiz Numara", en: "Chapter 2 — Number Eight" },
    nextChapter: 2,
  },
};

export const CHAPTER_1_SCENES: Scene[] = [KARANLIK_ODA, ESIK, SON];

// ---------------------------------------------------------------- bulmaca

export const CHAPTER_1_PUZZLES: Puzzle[] = [
  {
    id: "agrandizor",
    type: "dial",
    title: { tr: "Kare Seçici", en: "Frame Selector" },
    prompt: {
      tr: "Kurutma ipindeki yedi karenin film numaraları:\n3 · 7 · 11 · 15 · 19 · 23 · 27\n\nBasılmamış sekizinci kare hangi numara?",
      en: "The film numbers of the seven frames on the line:\n3 · 7 · 11 · 15 · 19 · 23 · 27\n\nWhich number is the unprinted eighth frame?",
    },
    dials: 2,
    min: 0,
    max: 9,
    answer: [3, 1],
    wrongText: {
      tr: "Taşıyıcı boş kalıyor. O numarada kare yok.",
      en: "The carrier comes up empty. There is no frame at that number.",
    },
    hint: {
      after: 2,
      text: {
        tr: "Numaralar arasındaki fark hep aynı.",
        en: "The gap between the numbers never changes.",
      },
    },
    onSolve: {
      lines: [
        {
          tr: "Taşıyıcı yerine oturuyor. Lambayı açıyorum. Duvara bir kare düşüyor.",
          en: "The carrier clicks home. I switch on the lamp. A frame falls onto the wall.",
        },
        {
          tr: "Aynı kapı. Sekiz numara. Ama bu sefer kapı açık.",
          en: "The same door. Number eight. But this time the door is open.",
        },
        {
          tr: "Eşikte bir figür duruyor. Sırtı dönük. Boyu benim boyum. Ceketi benim ceketim.",
          en: "A figure stands in the threshold, turned away. My height. My jacket.",
        },
        {
          tr: "Arka planda apartman tabelası okunuyor: HALİL BEY APT. — MODA.",
          en: "The building sign is legible behind: HALİL BEY APT. — MODA.",
        },
        {
          tr: "Artık nereye gideceğimi biliyorum. Keşke bilmeseydim.",
          en: "Now I know where to go. I wish I didn't.",
        },
      ],
      effects: [addClue("sekizinci_kare"), setFlag("b1_yon_belli")],
    },
  },
];
