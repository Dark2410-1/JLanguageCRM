"use server";

import { db } from "@/db";
import { users, vocabulary, userSrsCards } from "@/db/schema";
import { eq, and, lte, notInArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// 2. Takrorlanishi kerak bo'lgan (Due) kartalarni olish
export async function getDueCards(levelFilter: string = "all", cramMode: boolean = false) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const userId = session.id;
  const now = new Date();
  
  // Asosiy shartlar
  const conditions = [eq(userSrsCards.userId, userId)];
  
  if (!cramMode) {
    conditions.push(lte(userSrsCards.nextReviewAt, now));
  }
  
  let query = db.select({
    id: userSrsCards.id,
    vocabId: vocabulary.id,
    kanji: vocabulary.kanji,
    hiragana: vocabulary.hiragana,
    meaningUz: vocabulary.meaningUz,
    examples: vocabulary.examples,
    interval: userSrsCards.interval,
    repetition: userSrsCards.repetition,
    easeFactor: userSrsCards.easeFactor,
    level: vocabulary.level
  })
  .from(userSrsCards)
  .innerJoin(vocabulary, eq(userSrsCards.vocabId, vocabulary.id));

  let finalWhere = and(...conditions);
  
  if (levelFilter !== "all") {
    finalWhere = and(finalWhere, eq(vocabulary.level, levelFilter)) as any;
  }

  query = query.where(finalWhere).limit(cramMode ? 50 : 20) as any;
  
  let dueCards = await query;

  // Agar Cram Mode bo'lmasa va kartalar yetarli bo'lmasa (masalan, < 5), yangi so'zlarni o'zlashtiramiz
  if (!cramMode && dueCards.length < 5) {
    const existingCardIds = await db.select({ vocabId: userSrsCards.vocabId })
      .from(userSrsCards)
      .where(eq(userSrsCards.userId, userId));
    
    const idArray = existingCardIds.map(c => c.vocabId);
    
    let newVocabQuery = db.select().from(vocabulary);
    
    let newVocabCond = [];
    if (idArray.length > 0) {
      newVocabCond.push(notInArray(vocabulary.id, idArray));
    }
    if (levelFilter !== "all") {
      newVocabCond.push(eq(vocabulary.level, levelFilter));
    }
    
    if (newVocabCond.length > 0) {
      newVocabQuery = newVocabQuery.where(and(...newVocabCond)) as any;
    }
    
    const newVocabs = await newVocabQuery.limit(10); // Kuniga +10 ta yangi so'z qo'shamiz
    
    if (newVocabs.length > 0) {
      const srsCardsToInsert = newVocabs.map(v => ({
        userId: userId,
        vocabId: v.id,
        interval: 0,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewAt: now,
      }));
      
      await db.insert(userSrsCards).values(srsCardsToInsert);
      
      const updatedQuery = db.select({
        id: userSrsCards.id,
        vocabId: vocabulary.id,
        kanji: vocabulary.kanji,
        hiragana: vocabulary.hiragana,
        meaningUz: vocabulary.meaningUz,
        examples: vocabulary.examples,
        interval: userSrsCards.interval,
        repetition: userSrsCards.repetition,
        easeFactor: userSrsCards.easeFactor,
        level: vocabulary.level
      })
      .from(userSrsCards)
      .innerJoin(vocabulary, eq(userSrsCards.vocabId, vocabulary.id))
      .where(finalWhere)
      .limit(20);
      
      dueCards = await updatedQuery;
    }
  }

  if (cramMode) {
    return dueCards.sort(() => Math.random() - 0.5);
  }

  return dueCards;
}

// 3. SM-2 Algoritmi: Kartani baholash va keyingi sanani belgilash
import { awardXp } from "@/lib/gamification";

export async function reviewCard(cardId: string, rating: "hard" | "good" | "easy", isCramMode: boolean = false) {
  if (isCramMode) {
    return { success: true, nextReviewDate: new Date() };
  }

  const [card] = await db.select().from(userSrsCards).where(eq(userSrsCards.id, cardId));
  if (!card) throw new Error("Karta topilmadi");

  let quality = rating === "hard" ? 2 : rating === "good" ? 4 : 5;
  let newRepetition = card.repetition;
  let newInterval = card.interval;
  let newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  if (quality < 3) {
    newRepetition = 0;
    newInterval = 1;
  } else {
    newRepetition += 1;
    if (newRepetition === 1) newInterval = 1;
    else if (newRepetition === 2) newInterval = 6;
    else newInterval = Math.round(newInterval * newEaseFactor);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  await db.update(userSrsCards)
    .set({
      repetition: newRepetition,
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReviewAt: nextReviewDate,
      lastReviewedAt: new Date(),
    })
    .where(eq(userSrsCards.id, cardId));

  // Award XP for SRS study (e.g. 2 XP per word)
  await awardXp(card.userId, 2, 'srs_review');

  return { success: true, nextReviewDate };
}
