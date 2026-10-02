import { NextResponse } from "next/server";
import * as googleTTS from "google-tts-api";

// Node.js muhiti Buffer va google-tts-api to'liq ishlashi uchun kerak
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Matn kiritilmadi" }, { status: 400 });
    }

    // Yapon tilidagi uzun matnni qismlarga bo'lib, barcha qismlarning base64 audiosini olamiz
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: "ja", // Yapon tili
      slow: false,
      host: "https://translate.google.com",
      splitPunct: ",.、。?", // Yaponcha tinish belgilari bo'yicha bo'lish
    });

    // Base64 dan Buffer ga o'tkazib, yagona audio faylga (buffer) yig'amiz
    const buffers = results.map(result => Buffer.from(result.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);

    // To'g'ridan-to'g'ri audio stream sifatida qaytaramiz (xotirada fayl saqlanmaydi)
    return new Response(finalBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": finalBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Keshlanishi uchun
      },
    });

  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: "Audio yaratishda xatolik yuz berdi" }, { status: 500 });
  }
}
