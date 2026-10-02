export type KanjiItem = {
  char: string;
  level: "N5" | "N4";
  category: string;
  meaningUz: string;
  onyomi: string;
  kunyomi: string;
};

export const KANJI_LIST: KanjiItem[] = [
  // N5 - Raqamlar
  { char: "一", level: "N5", category: "Raqamlar", meaningUz: "Bir", onyomi: "Ichi, Itsu", kunyomi: "Hito(tsu)" },
  { char: "二", level: "N5", category: "Raqamlar", meaningUz: "Ikki", onyomi: "Ni", kunyomi: "Futa(tsu)" },
  { char: "三", level: "N5", category: "Raqamlar", meaningUz: "Uch", onyomi: "San", kunyomi: "Mit(tsu)" },
  { char: "四", level: "N5", category: "Raqamlar", meaningUz: "To'rt", onyomi: "Shi", kunyomi: "Yot(tsu), Yon" },
  { char: "五", level: "N5", category: "Raqamlar", meaningUz: "Besh", onyomi: "Go", kunyomi: "Itsu(tsu)" },
  { char: "六", level: "N5", category: "Raqamlar", meaningUz: "Olti", onyomi: "Roku", kunyomi: "Mut(tsu)" },
  { char: "七", level: "N5", category: "Raqamlar", meaningUz: "Yetti", onyomi: "Shichi", kunyomi: "Nana(tsu)" },
  { char: "八", level: "N5", category: "Raqamlar", meaningUz: "Sakkiz", onyomi: "Hachi", kunyomi: "Yat(tsu)" },
  { char: "九", level: "N5", category: "Raqamlar", meaningUz: "To'qqiz", onyomi: "Kyuu, Ku", kunyomi: "Kokono(tsu)" },
  { char: "十", level: "N5", category: "Raqamlar", meaningUz: "O'n", onyomi: "Juu", kunyomi: "Tou" },
  { char: "百", level: "N5", category: "Raqamlar", meaningUz: "Yuz", onyomi: "Hyaku", kunyomi: "-" },
  { char: "千", level: "N5", category: "Raqamlar", meaningUz: "Ming", onyomi: "Sen", kunyomi: "Chi" },
  { char: "万", level: "N5", category: "Raqamlar", meaningUz: "O'n ming", onyomi: "Man, Ban", kunyomi: "-" },

  // N5 - Tabiat
  { char: "日", level: "N5", category: "Tabiat", meaningUz: "Kun / Quyosh", onyomi: "Nichi, Jitsu", kunyomi: "Hi, -bi, -ka" },
  { char: "月", level: "N5", category: "Tabiat", meaningUz: "Oy", onyomi: "Getsu, Gatsu", kunyomi: "Tsuki" },
  { char: "火", level: "N5", category: "Tabiat", meaningUz: "Olov", onyomi: "Ka", kunyomi: "Hi, -bi, Ho-" },
  { char: "水", level: "N5", category: "Tabiat", meaningUz: "Suv", onyomi: "Sui", kunyomi: "Mizu" },
  { char: "木", level: "N5", category: "Tabiat", meaningUz: "Daraxt", onyomi: "Moku, Boku", kunyomi: "Ki, Ko-" },
  { char: "金", level: "N5", category: "Tabiat", meaningUz: "Pul / Oltin", onyomi: "Kin, Kon", kunyomi: "Kane, Kana-" },
  { char: "土", level: "N5", category: "Tabiat", meaningUz: "Tuproq / Yer", onyomi: "Do, To", kunyomi: "Tsuchi" },
  { char: "山", level: "N5", category: "Tabiat", meaningUz: "Tog'", onyomi: "San", kunyomi: "Yama" },
  { char: "川", level: "N5", category: "Tabiat", meaningUz: "Daryo", onyomi: "Sen", kunyomi: "Kawa" },
  { char: "天", level: "N5", category: "Tabiat", meaningUz: "Osmon", onyomi: "Ten", kunyomi: "Ame, Ama-" },
  { char: "空", level: "N5", category: "Tabiat", meaningUz: "Havo / Osmon", onyomi: "Kuu", kunyomi: "Sora, A(ku)" },
  { char: "雨", level: "N5", category: "Tabiat", meaningUz: "Yomg'ir", onyomi: "U", kunyomi: "Ame, Ama-" },

  // N5 - Odam va a'zolar
  { char: "人", level: "N5", category: "Odam", meaningUz: "Odam / Kishi", onyomi: "Jin, Nin", kunyomi: "Hito" },
  { char: "目", level: "N5", category: "Odam", meaningUz: "Ko'z", onyomi: "Moku, Boku", kunyomi: "Me, -me" },
  { char: "口", level: "N5", category: "Odam", meaningUz: "Og'iz", onyomi: "Kou, Ku", kunyomi: "Kuchi" },
  { char: "耳", level: "N5", category: "Odam", meaningUz: "Quloq", onyomi: "Ji", kunyomi: "Mimi" },
  { char: "手", level: "N5", category: "Odam", meaningUz: "Qo'l", onyomi: "Shu", kunyomi: "Te" },
  { char: "足", level: "N5", category: "Odam", meaningUz: "Oyoq", onyomi: "Soku", kunyomi: "Ashi, Ta(riru)" },

  // N5 - Vaqt
  { char: "時", level: "N5", category: "Vaqt", meaningUz: "Vaqt / Soat", onyomi: "Ji", kunyomi: "Toki" },
  { char: "今", level: "N5", category: "Vaqt", meaningUz: "Hozir", onyomi: "Kon, Kin", kunyomi: "Ima" },
  { char: "年", level: "N5", category: "Vaqt", meaningUz: "Yil", onyomi: "Nen", kunyomi: "Toshi" },

  // N4 - Asosiy
  { char: "心", level: "N4", category: "Hissiyot", meaningUz: "Yurak / Qalb", onyomi: "Shin", kunyomi: "Kokoro" },
  { char: "思", level: "N4", category: "Hissiyot", meaningUz: "O'ylamoq", onyomi: "Shi", kunyomi: "Omo(u)" },
  { char: "答", level: "N4", category: "Maktab", meaningUz: "Javob", onyomi: "Tou", kunyomi: "Kota(eru)" },
  { char: "知", level: "N4", category: "Maktab", meaningUz: "Bilmoq", onyomi: "Chi", kunyomi: "Shi(ru)" },
  { char: "死", level: "N4", category: "Hissiyot", meaningUz: "O'lmoq", onyomi: "Shi", kunyomi: "Shi(nu)" },
  { char: "意", level: "N4", category: "Maktab", meaningUz: "Fikr / Niyat", onyomi: "I", kunyomi: "-" },
  { char: "味", level: "N4", category: "Maktab", meaningUz: "Ta'm / Ma'no", onyomi: "Mi", kunyomi: "Aji" },
  { char: "勉", level: "N4", category: "Maktab", meaningUz: "Tirishmoq", onyomi: "Ben", kunyomi: "Tsuto(meru)" },
  { char: "強", level: "N4", category: "Maktab", meaningUz: "Kuchli", onyomi: "Kyou, Gou", kunyomi: "Tsuyo(i)" },
  { char: "道", level: "N4", category: "Harakat", meaningUz: "Yo'l", onyomi: "Dou, Tou", kunyomi: "Michi" },
  { char: "動", level: "N4", category: "Harakat", meaningUz: "Harakatlanmoq", onyomi: "Dou", kunyomi: "Ugo(ku)" },
  { char: "働", level: "N4", category: "Harakat", meaningUz: "Ishlamoq", onyomi: "Dou", kunyomi: "Hatara(ku)" },
];
