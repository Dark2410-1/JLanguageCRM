"use server";
import { getSession } from "@/lib/auth";
import { awardXp } from "@/lib/gamification";
import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function submitKanjiDraw() {
  const session = await getSession();
  if (!session) return { error: "Avtorizatsiya yo'q" };

  await awardXp(session.id, 5, "kanji_draw");

  // Yutuq
  // random ehtimollik bilan yoki shunchaki 5 ta chizganda bildirishnoma qo'shish mumkin
  // Keling har 1 marta chizganda chiqarmaymiz, faqat XP beramiz.
  // Ammo qiziqish uchun "Kanji Master" bildirishnomasi qo'shamiz
  if (Math.random() > 0.8) {
     await db.insert(notifications).values({
      userId: session.id,
      title: "Kanji Chizish",
      message: "Yaxshi ketyapsiz! Kanjilarni to'g'ri chizishda davom eting.",
      type: "system"
    });
  }

  return { success: true };
}
