import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, userSrsCards } from "@/db/schema";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import { sendTelegramNotification } from "@/lib/telegram";

// Bu marshrutni Vercel Cron orqali har kuni ertalab 09:00 da chaqirish mumkin
// Vercel.json: { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 9 * * *" }] }
export async function GET(req: Request) {
  try {
    // FAQAT cron jo'natayotganini yoki secret keyni tekshirish xavfsizlik uchun yaxshi
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();

    // 1. SRS Eslatmalari (Foydalanuvchilar orasidan tgNotifySrs = 1 va telegramChatId borlari)
    const tgSrsUsers = await db.select({
      id: users.id,
      name: users.name,
      telegramChatId: users.telegramChatId
    })
    .from(users)
    .where(and(
      eq(users.tgNotifySrs, 1),
      isNotNull(users.telegramChatId)
    ));

    let notificationsSent = 0;

    for (const user of tgSrsUsers) {
      // Bugungi takrorlanadigan so'zlar sonini hisoblash
      const dueCardsCount = await db.select({ id: userSrsCards.id })
        .from(userSrsCards)
        .where(and(
          eq(userSrsCards.userId, user.id),
          lte(userSrsCards.nextReviewAt, now)
        ));

      if (dueCardsCount.length > 0) {
        const text = `🔔 <b>Konnichiwa, ${user.name}!</b>\n\nBugun takrorlanishi kerak bo'lgan <b>${dueCardsCount.length} ta</b> so'zingiz yig'ildi.\n\nXotirani charxlash uchun JLanguage dasturiga kiring!`;
        const keyboard = {
          inline_keyboard: [
            [{ text: "Mashqni boshlash 🚀", url: "https://jlanguage.uz/srs" }]
          ]
        };
        await sendTelegramNotification(user.telegramChatId, text, keyboard);
        notificationsSent++;
      }
    }

    // Xuddi shunday darslar uchun streak eslatmasi yozilishi mumkin
    // (tgNotifyLessons = 1 bo'lganlarga)

    return NextResponse.json({ ok: true, srsSent: notificationsSent });
  } catch (error) {
    console.error("Cron reminders error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
