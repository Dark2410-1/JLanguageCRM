"use server";

import { db } from "@/db";
import { vocabulary } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addVocabulary(prevState: any, formData: FormData) {
  try {
    const level = formData.get("level") as string;
    const kanji = formData.get("kanji") as string;
    const hiragana = formData.get("hiragana") as string;
    const romaji = formData.get("romaji") as string;
    const meaningUz = formData.get("meaningUz") as string;
    
    const exJp = formData.get("exampleJp") as string;
    const exUz = formData.get("exampleUz") as string;

    const examples = exJp && exUz ? [{ jp: exJp, uz: exUz }] : null;

    await db.insert(vocabulary).values({
      level,
      kanji,
      hiragana,
      romaji,
      meaningUz,
      examples,
    });

    revalidatePath("/admin/vocabulary");
    return { success: true };
  } catch (error) {
    console.error("So'z qo'shishda xatolik:", error);
    return { error: "So'zni qo'shishda xatolik yuz berdi." };
  }
}

export async function deleteVocabulary(vocabId: string) {
  try {
    await db.delete(vocabulary).where(eq(vocabulary.id, vocabId));
    revalidatePath("/admin/vocabulary");
    return { success: true };
  } catch (error) {
    console.error("So'zni o'chirishda xatolik:", error);
    return { error: "So'zni o'chirishda xatolik yuz berdi." };
  }
}

export async function bulkUploadVocabulary(jsonData: any[]) {
  try {
    for (const item of jsonData) {
      if (!item.kanji || !item.hiragana || !item.romaji || !item.meaningUz || !item.level) continue;
      
      const examples = item.exampleJp && item.exampleUz 
        ? [{ jp: item.exampleJp, uz: item.exampleUz }] 
        : null;
        
      await db.insert(vocabulary).values({
        level: item.level,
        kanji: item.kanji,
        hiragana: item.hiragana,
        romaji: item.romaji,
        meaningUz: item.meaningUz,
        examples: examples
      });
    }
    revalidatePath("/admin/vocabulary");
    return { success: true };
  } catch (error) {
    console.error("Ommaviy yuklashda xatolik:", error);
    return { error: "Ommaviy yuklashda xatolik." };
  }
}
