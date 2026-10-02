"use server";

import { db } from "@/db";
import { lessons, vocabulary, notifications } from "@/db/schema";
import { eq, ilike, or, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function searchGlobal(query: string) {
  if (!query || query.length < 2) return { lessons: [], vocabulary: [] };

  const q = `%${query}%`;

  const foundLessons = await db.select({
    id: lessons.id,
    title: lessons.title,
    level: lessons.level,
    description: lessons.description
  }).from(lessons)
    .where(
      or(
        ilike(lessons.title, q),
        ilike(lessons.romajiTitle, q),
        ilike(lessons.description, q)
      )
    )
    .limit(5);

  const foundVocab = await db.select({
    id: vocabulary.id,
    kanji: vocabulary.kanji,
    hiragana: vocabulary.hiragana,
    romaji: vocabulary.romaji,
    meaningUz: vocabulary.meaningUz,
    level: vocabulary.level
  }).from(vocabulary)
    .where(
      or(
        ilike(vocabulary.kanji, q),
        ilike(vocabulary.hiragana, q),
        ilike(vocabulary.romaji, q),
        ilike(vocabulary.meaningUz, q)
      )
    )
    .limit(5);

  return { lessons: foundLessons, vocabulary: foundVocab };
}

export async function getNotifications() {
  const session = await getSession();
  if (!session) return [];

  return await db.select()
    .from(notifications)
    .where(eq(notifications.userId, session.id))
    .orderBy(desc(notifications.createdAt))
    .limit(10);
}

export async function markAsRead(notificationId: string) {
  const session = await getSession();
  if (!session) return;

  await db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, session.id)));
    
  revalidatePath("/");
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session) return;

  await db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.isRead, false), eq(notifications.userId, session.id)));
    
  revalidatePath("/");
}
