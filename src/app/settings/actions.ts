"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function updateSettings(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Avtorizatsiyadan o'tilmagan." };
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const currentJlptLevel = formData.get("currentJlptLevel") as string;
    const dailyGoalWords = parseInt(formData.get("dailyGoalWords") as string) || 15;
    const ttsSpeed = parseFloat(formData.get("ttsSpeed") as string) || 1.0;
    const ttsVoice = formData.get("ttsVoice") as string;
    
    const tgNotifySrs = formData.get("tgNotifySrs") === "on" ? 1 : 0;
    const tgNotifyLessons = formData.get("tgNotifyLessons") === "on" ? 1 : 0;
    const tgNotifyPayments = formData.get("tgNotifyPayments") === "on" ? 1 : 0;

    await db.update(users)
      .set({
        name,
        phone,
        currentJlptLevel,
        dailyGoalWords,
        ttsSpeed,
        ttsVoice,
        tgNotifySrs,
        tgNotifyLessons,
        tgNotifyPayments,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.id));

    return { success: true, message: "Sozlamalar muvaffaqiyatli saqlandi!" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring." };
  }
}
