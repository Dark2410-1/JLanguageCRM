import * as schema from './schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

dotenv.config({ path: '.env.local' });

const seedData = [
  // N5 Vocabulary
  { level: "N5", kanji: "私", hiragana: "わたし", romaji: "watashi", meaningUz: "Men", examples: [{ jp: "私は学生です。", uz: "Men talabaman." }] },
  { level: "N5", kanji: "人", hiragana: "ひと", romaji: "hito", meaningUz: "Odam / Kishi", examples: [{ jp: "あの人は誰ですか。", uz: "U odam kim?" }] },
  { level: "N5", kanji: "今日", hiragana: "きょう", romaji: "kyou", meaningUz: "Bugun", examples: [{ jp: "今日は暑いですね。", uz: "Bugun issiq-a?" }] },
  { level: "N5", kanji: "明日", hiragana: "あした", romaji: "ashita", meaningUz: "Ertaga", examples: [{ jp: "明日、学校に行きます。", uz: "Ertaga maktabga boraman." }] },
  { level: "N5", kanji: "水", hiragana: "みず", romaji: "mizu", meaningUz: "Suv", examples: [{ jp: "水をください。", uz: "Suv bering." }] },
  { level: "N5", kanji: "食べる", hiragana: "たべる", romaji: "taberu", meaningUz: "Yemoq", examples: [{ jp: "りんごを食べる。", uz: "Olma yeyman." }] },
  { level: "N5", kanji: "飲む", hiragana: "のむ", romaji: "nomu", meaningUz: "Ichmoq", examples: [{ jp: "お茶を飲みます。", uz: "Ko'k choy ichaman." }] },
  { level: "N5", kanji: "行く", hiragana: "いく", romaji: "iku", meaningUz: "Bormoq", examples: [{ jp: "日本へ行きたいです。", uz: "Yaponiyaga borgim kelyapti." }] },
  { level: "N5", kanji: "見る", hiragana: "みる", romaji: "miru", meaningUz: "Ko'rmoq", examples: [{ jp: "映画を見ます。", uz: "Kino ko'raman." }] },
  { level: "N5", kanji: "大きい", hiragana: "おおきい", romaji: "ookii", meaningUz: "Katta", examples: [{ jp: "大きい犬がいます。", uz: "Katta it bor." }] },
  { level: "N5", kanji: "小さい", hiragana: "ちいさい", romaji: "chiisai", meaningUz: "Kichkina", examples: [{ jp: "小さい猫", uz: "Kichkina mushuk" }] },
  { level: "N5", kanji: "新しい", hiragana: "あたらしい", romaji: "atarashii", meaningUz: "Yangi", examples: [{ jp: "新しい車を買いました。", uz: "Yangi mashina sotib oldim." }] },
  { level: "N5", kanji: "古い", hiragana: "ふるい", romaji: "furui", meaningUz: "Eski", examples: [{ jp: "この本は古いです。", uz: "Bu kitob eski." }] },
  { level: "N5", kanji: "山", hiragana: "やま", romaji: "yama", meaningUz: "Tog'", examples: [{ jp: "富士山は高いです。", uz: "Fuji tog'i baland." }] },
  { level: "N5", kanji: "川", hiragana: "かわ", romaji: "kawa", meaningUz: "Daryo", examples: [{ jp: "川で泳ぎます。", uz: "Daryoda cho'milaman." }] },
  { level: "N5", kanji: "月", hiragana: "つき", romaji: "tsuki", meaningUz: "Oy", examples: [{ jp: "月がきれいです。", uz: "Oy chiroyli." }] },
  { level: "N5", kanji: "火", hiragana: "ひ", romaji: "hi", meaningUz: "Olov", examples: [{ jp: "火に気をつけて。", uz: "Olovdan ehtiyot bo'l." }] },
  { level: "N5", kanji: "木", hiragana: "き", romaji: "ki", meaningUz: "Daraxt", examples: [{ jp: "木の下で休みます。", uz: "Daraxt tagida dam olaman." }] },
  { level: "N5", kanji: "金", hiragana: "かね", romaji: "kane", meaningUz: "Pul / Oltin", examples: [{ jp: "お金がありません。", uz: "Pulim yo'q." }] },
  { level: "N5", kanji: "土", hiragana: "つち", romaji: "tsuchi", meaningUz: "Tuproq / Yer", examples: [{ jp: "土を掘ります。", uz: "Yerni qaziyman." }] },
  { level: "N5", kanji: "車", hiragana: "くるま", romaji: "kuruma", meaningUz: "Mashina", examples: [{ jp: "車を運転します。", uz: "Mashina haydayman." }] },
  { level: "N5", kanji: "時間", hiragana: "じかん", romaji: "jikan", meaningUz: "Vaqt", examples: [{ jp: "時間がありません。", uz: "Vaqt yo'q." }] },
  { level: "N5", kanji: "友達", hiragana: "ともだち", romaji: "tomodachi", meaningUz: "Do'st", examples: [{ jp: "友達と遊びます。", uz: "Do'stim bilan o'ynayman." }] },
  { level: "N5", kanji: "雨", hiragana: "あめ", romaji: "ame", meaningUz: "Yomg'ir", examples: [{ jp: "雨が降っています。", uz: "Yomg'ir yog'yapti." }] },
  { level: "N5", kanji: "雪", hiragana: "ゆき", romaji: "yuki", meaningUz: "Qor", examples: [{ jp: "雪が白です。", uz: "Qor oqdir." }] },
  
  // N4 Vocabulary
  { level: "N4", kanji: "約束", hiragana: "やくそく", romaji: "yakusoku", meaningUz: "Va'da / Uchrashuv", examples: [{ jp: "約束を守る。", uz: "Va'daga vafo qilish." }] },
  { level: "N4", kanji: "複雑", hiragana: "ふくざつ", romaji: "fukuzatsu", meaningUz: "Murakkab", examples: [{ jp: "複雑な問題です。", uz: "Bu murakkab muammo." }] },
  { level: "N4", kanji: "経験", hiragana: "けいけん", romaji: "keiken", meaningUz: "Tajriba", examples: [{ jp: "いい経験になりました。", uz: "Yaxshi tajriba bo'ldi." }] },
  { level: "N4", kanji: "原因", hiragana: "げんいん", romaji: "genin", meaningUz: "Sabab", examples: [{ jp: "事故の原因は何ですか。", uz: "Avariya sababi nima?" }] },
  { level: "N4", kanji: "結果", hiragana: "けっか", romaji: "kekka", meaningUz: "Natija", examples: [{ jp: "結果を待っています。", uz: "Natijani kutyapman." }] },
  { level: "N4", kanji: "心配", hiragana: "しんぱい", romaji: "shinpai", meaningUz: "Xavotir", examples: [{ jp: "心配しないでください。", uz: "Xavotir olmang." }] },
  { level: "N4", kanji: "注意", hiragana: "ちゅうい", romaji: "chuui", meaningUz: "Diqqat / Ogohlantirish", examples: [{ jp: "車に注意してください。", uz: "Mashinadan ehtiyot bo'ling." }] },
  { level: "N4", kanji: "安全", hiragana: "あんぜん", romaji: "anzen", meaningUz: "Xavfsizlik", examples: [{ jp: "安全が第一です。", uz: "Xavfsizlik birinchi o'rinda." }] },
  { level: "N4", kanji: "危険", hiragana: "きけん", romaji: "kiken", meaningUz: "Xavfli", examples: [{ jp: "ここは危険です。", uz: "Bu yer xavfli." }] },
  { level: "N4", kanji: "準備", hiragana: "じゅんび", romaji: "junbi", meaningUz: "Tayyorgarlik", examples: [{ jp: "旅行の準備をします。", uz: "Sayohatga tayyorgarlik ko'raman." }] }
];

async function runSeed() {
  const { db } = await import('./index');
  console.log("🌱 Yapon tili so'zlarini bazaga kiritish boshlandi...");
  
  try {
    for (const word of seedData) {
      // Check if it already exists
      const existing = await db.select().from(schema.vocabulary).where(eq(schema.vocabulary.kanji, word.kanji)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(schema.vocabulary).values(word);
        console.log(`✅ Qo'shildi: ${word.kanji} (${word.meaningUz})`);
      } else {
        console.log(`⚡ Allaqachon mavjud: ${word.kanji}`);
      }
    }
    console.log("🎉 Seed muvaffaqiyatli yakunlandi!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Xatolik yuz berdi:", error);
    process.exit(1);
  }
}

runSeed();
