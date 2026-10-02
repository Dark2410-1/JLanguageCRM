import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if it's a message
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text.trim();

      // Handle /start payload (Deep linking)
      // Format: /start USER_ID
      if (text.startsWith("/start ")) {
        const userId = text.split(" ")[1];

        // Find user
        const existingUsers = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (existingUsers.length > 0) {
          // Update user's telegramChatId
          await db.update(users).set({ telegramChatId: chatId }).where(eq(users.id, userId));

          await sendTelegramNotification(
            chatId, 
            "✅ <b>Hisobingiz muvaffaqiyatli ulandi!</b>\n\nEndi siz darslar, to'lovlar va SRS lug'atlari haqida eslatmalarni shu yerda qabul qilasiz. JLanguage bilan o'qishda omad tilaymiz!"
          );
        } else {
          await sendTelegramNotification(chatId, "❌ Kechirasiz, foydalanuvchi topilmadi. Iltimos platformadagi havoladan qayta urinib ko'ring.");
        }
      } else if (text === "/start") {
        await sendTelegramNotification(
          chatId, 
          "👋 <b>JLanguage Botiga xush kelibsiz!</b>\n\nIltimos, platformamizning 'Sozlamalar' bo'limiga kirib 'Telegramga ulanish' tugmasini bosing."
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
