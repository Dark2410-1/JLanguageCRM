"use server";

import { db } from "@/db";
import { lessons, userLessonProgress, users } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Seed function for testing
async function ensureLessonSeed() {
  const existing = await db.select().from(lessons).limit(1);
  if (existing.length === 0) {
    const seedLessons = [
      {
        level: "N5",
        order: 1,
        title: "Hiragana va Katakana",
        romajiTitle: "Hiragana to Katakana",
        description: "Yapon tilining asosiy alifbolari bilan tanishamiz.",
        content: `### Hiragana
Yapon tilida 46 ta asosiy hiragana belgilari mavjud.
あ (a) い (i) う (u) え (e) お (o)

### Katakana
Chet tilidan kirib kelgan so'zlar uchun ishlatiladi.
ア (a) イ (i) ウ (u) エ (e) オ (o)
`
      },
      {
        level: "N5",
        order: 2,
        title: "Salomlashish va Tanishuv",
        romajiTitle: "Aisatsu to Jikoshoukai",
        description: "Kundalik salomlashish iboralari.",
        content: `### Salomlashish (挨拶 - Aisatsu)
- **Konnichiwa** (こんにちは) - Xayrli kun
- **Ohayou gozaimasu** (おはようございます) - Xayrli tong
- **Konbanwa** (こんばんは) - Xayrli kech
- **Arigatou gozaimasu** (ありがとうございます) - Katta rahmat

### Tanishuv
- **Watashi no namae wa Ali desu.** (私の名前はアリです) - Mening ismim Ali.`
      },
      {
        level: "N5",
        order: 3,
        title: "Sanoq sonlar",
        romajiTitle: "Suuji",
        description: "1 dan 10 gacha sanashni o'rganamiz.",
        content: `1. Ichi (一)
2. Ni (二)
3. San (三)
4. Yon/Shi (四)
5. Go (五)`
      }
    ];
    await db.insert(lessons).values(seedLessons);
  }
}

// ========================
// COURSES / LEVELS
// ========================
export async function getCourseLevels() {
  await ensureLessonSeed();
  
  // Get dummy user
  const user = (await db.select().from(users).where(eq(users.role, "student")).limit(1))[0];
  if (!user) throw new Error("Foydalanuvchi topilmadi");

  const levels = ["N5", "N4", "N3", "N2", "N1"];
  
  const courseData = await Promise.all(levels.map(async (level) => {
    const levelLessons = await db.select().from(lessons).where(eq(lessons.level, level)).orderBy(asc(lessons.order));
    const totalLessons = levelLessons.length;
    
    let completedLessons = 0;
    if (totalLessons > 0) {
      const progress = await db.select()
        .from(userLessonProgress)
        .innerJoin(lessons, eq(userLessonProgress.lessonId, lessons.id))
        .where(and(
          eq(userLessonProgress.userId, user.id),
          eq(userLessonProgress.status, "completed"),
          eq(lessons.level, level)
        ));
      completedLessons = progress.length;
    }

    // Determine the next lesson to continue
    let nextLessonId = levelLessons[0]?.id || null;
    if (completedLessons > 0 && completedLessons < totalLessons) {
      nextLessonId = levelLessons[completedLessons].id;
    }

    return {
      level,
      title: level === "N5" ? "Boshlang'ich (N5)" : 
             level === "N4" ? "O'rta-Boshlang'ich (N4)" : 
             level === "N3" ? "O'rta (N3)" : 
             level === "N2" ? "Yuqori-O'rta (N2)" : "Yuqori (N1)",
      totalLessons,
      completedLessons,
      nextLessonId
    };
  }));

  return courseData;
}

// ========================
// LESSON VIEW
// ========================
export async function getLessonData(level: string, lessonId: string) {
  const user = (await db.select().from(users).where(eq(users.role, "student")).limit(1))[0];
  
  const allLessons = await db.select().from(lessons).where(eq(lessons.level, level)).orderBy(asc(lessons.order));
  const currentLesson = allLessons.find(l => l.id === lessonId);
  
  if (!currentLesson) throw new Error("Dars topilmadi");

  // Get user progress for all lessons in this level
  const userProgress = await db.select()
    .from(userLessonProgress)
    .innerJoin(lessons, eq(userLessonProgress.lessonId, lessons.id))
    .where(and(
      eq(userLessonProgress.userId, user.id),
      eq(lessons.level, level)
    ));

  const completedIds = new Set(userProgress.filter(p => p.user_lesson_progress.status === "completed").map(p => p.user_lesson_progress.lessonId));

  const sidebarLessons = allLessons.map((l, index) => {
    const isCompleted = completedIds.has(l.id);
    const isLocked = index > 0 && !completedIds.has(allLessons[index - 1].id) && !isCompleted && l.id !== lessonId;
    
    return {
      id: l.id,
      title: l.title,
      order: l.order,
      isCompleted,
      isLocked
    };
  });

  return {
    lesson: currentLesson,
    sidebarLessons,
    isCompleted: completedIds.has(currentLesson.id)
  };
}

export async function markLessonComplete(lessonId: string, level: string) {
  const user = (await db.select().from(users).where(eq(users.role, "student")).limit(1))[0];
  
  const existing = await db.select().from(userLessonProgress).where(and(
    eq(userLessonProgress.userId, user.id),
    eq(userLessonProgress.lessonId, lessonId)
  )).limit(1);

  if (existing.length === 0) {
    await db.insert(userLessonProgress).values({
      userId: user.id,
      lessonId,
      status: "completed",
      completedAt: new Date()
    });
  } else {
    await db.update(userLessonProgress)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(userLessonProgress.id, existing[0].id));
  }

  // Find next lesson to redirect
  const allLessons = await db.select().from(lessons).where(eq(lessons.level, level)).orderBy(asc(lessons.order));
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const nextLesson = allLessons[currentIndex + 1];

  revalidatePath(`/learn/${level}/${lessonId}`);
  revalidatePath(`/learn`);
  
  return { success: true, nextLessonId: nextLesson?.id || null };
}

import { quizSubmissions, notifications } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { awardXp } from "@/lib/gamification";

export async function submitQuiz(lessonId: string, level: string, score: number, total: number) {
  const session = await getSession();
  if (!session) throw new Error("Avtorizatsiya yo`q");

  const passed = (score / total) >= 0.8;

  // Insert submission
  await db.insert(quizSubmissions).values({
    userId: session.id,
    lessonId,
    score,
    totalQuestions: total,
    passed: passed ? 1 : 0
  });

  // Award XP
  const xpEarned = score * 10;
  await awardXp(session.id, xpEarned, 'quiz');

  // If passed, mark lesson complete
  let nextLessonId = null;
  if (passed) {
    const res = await markLessonComplete(lessonId, level);
    nextLessonId = res.nextLessonId;
    await awardXp(session.id, 50, 'lesson_complete');

    // Muvaffaqiyatli topshirilgani uchun bildirishnoma
    await db.insert(notifications).values({
      userId: session.id,
      title: "Dars yakunlandi! 🎉",
      message: `Siz "${level}" darajasidagi darsni muvaffaqiyatli tugatdingiz va +50 XP yutib oldingiz!`,
      type: "achievement"
    });
  }

  return { success: true, passed, nextLessonId };
}

export async function getQuizData(lessonId: string) {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
  if (!lesson) throw new Error("Dars topilmadi");

  if (lesson.quizData && (lesson.quizData as any[]).length > 0) {
    return lesson.quizData as any[];
  }

  // Fallback / Mock Quiz Data
  return [
    {
      id: "q1",
      type: "multiple_choice",
      question: "Bu gapdagi tushirib qoldirilgan zarrachani toping: ??? ___ ???????",
      options: ["? (wa)", "? (ga)", "? (wo)", "? (ni)"],
      correctAnswer: "? (wa)",
      explanation: "Mavzuni belgilash uchun `?` zarrachasi ishlatiladi."
    },
    {
      id: "q2",
      type: "listening",
      question: "Ovozni eshitib, to`g`ri tarjimani toping.",
      audioText: "?????????",
      options: ["Xayrli kech", "Xayrli tong", "Kechirasiz", "Rahmat"],
      correctAnswer: "Xayrli tong",
      explanation: "Ohayou gozaimasu - Xayrli tong degani."
    },
    {
      id: "q3",
      type: "reading",
      question: "Quyidagi kanjining to`g`ri o`qilishini toping: ?",
      options: ["?? (mizu)", "? (hi)", "? (ki)", "?? (yama)"],
      correctAnswer: "?? (mizu)",
      explanation: "? - Mizu (Suv) degani."
    }
  ];
}


