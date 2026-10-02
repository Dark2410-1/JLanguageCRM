import { GoogleGenAI } from "@google/genai";

export const runtime = "edge"; // Edge API for lowest latency

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPTS = {
  free: `Sen yapon tili bo'yicha repetitorsan (Sensei). Isming: Sensei AI. 
Foydalanuvchi bilan yengil va do'stona suhbat qurishing kerak. 
Iloji boricha yapon tilida yoz (kanji, hiragana, katakana) va har bir gapingning tagida o'zbekcha tarjimasini ber.
Foydalanuvchining darajasiga moslash (JLPT N5-N1). Qisqa va aniq javob qaytar.`,
  
  grammar: `Sen yapon tili grammatikasini tekshiruvchi mutaxassissan. 
Foydalanuvchi senga yaponcha gap beradi. Sen quyidagilarni qilishing kerak:
1. Gapni tekshir va xatolarni top.
2. Xatoning sababini o'zbek tilida tushuntir.
3. To'g'rilangan variantni yapon tilida ko'rsat.
Javobing strukturasi aniq va qisqa bo'lsin.`,
  
  kanji: `Sen yapon tili kanji analizatorisan.
Foydalanuvchi senga kanji yoki so'z yuboradi. Sen quyidagilarni taqdim etishing kerak:
1. Kanjining ma'nosi (o'zbek tilida).
2. Onyomi va Kunyomi o'qilishlari (katakana va hiraganada, romaji qo'shib).
3. Ushbu kanji ishtirok etgan 2 ta misol gap (yaponcha va o'zbekcha tarjimasi).
Faqat shu ma'lumotlarni tuzilgan formatda ber.`
};

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();
    
    // Barcha xabarlarni bitta stringga yig'ish (kontekst uchun)
    const chatHistory = messages.map((m: any) => `${m.role === 'user' ? 'Foydalanuvchi' : 'Sen'}: ${m.content}`).join('\n');
    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.free;

    const streamResponse = await client.interactions.create({
      model: "gemini-3.8-flash", // Eng yangi va tezkor model
      input: systemPrompt + "\n\nKontekst: " + chatHistory,
      stream: true,
      store: false // Faqat stream qilish uchun
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of streamResponse) {
            if (event.event_type === "step.delta" && event.delta?.type === "text") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Stream Error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);
    return new Response(JSON.stringify({ error: "Xatolik yuz berdi" }), { status: 500 });
  }
}
