"use server";

import { db } from "@/db";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addLesson(prevState: any, formData: FormData) {
  try {
    const level = formData.get("level") as string;
    const order = parseInt(formData.get("order") as string);
    const title = formData.get("title") as string;
    const romajiTitle = formData.get("romajiTitle") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const audioUrl = formData.get("audioUrl") as string; // Could be used for video too

    await db.insert(lessons).values({
      level,
      order,
      title,
      romajiTitle,
      description,
      content,
      audioUrl,
    });

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Dars qo'shishda xatolik:", error);
    return { error: "Darsni qo'shishda xatolik yuz berdi." };
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    await db.delete(lessons).where(eq(lessons.id, lessonId));
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Darsni o'chirishda xatolik:", error);
    return { error: "Darsni o'chirishda xatolik yuz berdi." };
  }
}
