import { getUserLevel } from "@/lib/gamification";
import { db } from "@/db";
import { users, userLessonProgress, userSrsCards, lessons } from "@/db/schema";
import { eq, and, lte, desc, asc } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Flame, Target, Trophy, PlayCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  // 1. Foydalanuvchini olish (Auth yo'qligi sababli birinchi talabani olamiz)
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return null;
  const [user] = await db.select().from(users).where(eq(users.id, session.id));

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        Baza bo'sh. Iltimos, /crm/students orqali talaba qo'shing.
      </div>
    );
  }

  const levelInfo = getUserLevel(user.xp);

  // 2. Bugungi SRS so'zlar soni
  const now = new Date();
  const dueCards = await db.select({ id: userSrsCards.id })
    .from(userSrsCards)
    .where(and(
      eq(userSrsCards.userId, user.id),
      lte(userSrsCards.nextReviewAt, now)
    ));
  const srsCount = dueCards.length;

  // 3. JLPT Daraja progressi
  const levelLessons = await db.select().from(lessons).where(eq(lessons.level, user.currentJlptLevel)).orderBy(asc(lessons.order));
  const completedProgress = await db.select()
    .from(userLessonProgress)
    .innerJoin(lessons, eq(userLessonProgress.lessonId, lessons.id))
    .where(and(
      eq(userLessonProgress.userId, user.id),
      eq(userLessonProgress.status, "completed"),
      eq(lessons.level, user.currentJlptLevel)
    ));
  
  const totalLessons = levelLessons.length;
  const completedCount = completedProgress.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // 4. Oxirgi darsni aniqlash
  let continueLink = "/learn";
  let continueTitle = "Darslarni boshlash";
  
  if (totalLessons > 0) {
    if (completedCount === 0) {
      continueLink = `/learn/${user.currentJlptLevel}/${levelLessons[0].id}`;
      continueTitle = `${levelLessons[0].order}. ${levelLessons[0].title}`;
    } else if (completedCount < totalLessons) {
      const nextLesson = levelLessons[completedCount]; // Since ordered, the next one is at index completedCount
      continueLink = `/learn/${user.currentJlptLevel}/${nextLesson.id}`;
      continueTitle = `${nextLesson.order}. ${nextLesson.title}`;
    } else {
      continueTitle = "Barcha darslar yakunlangan";
    }
  }

  // Yengil SVG grafik uchun haftalik dummy ma'lumot (Dushanba-Yakshanba)
  // Haqiqiy ilovada bular bazadagi timestamp'lar asosida hisoblanadi
  const weekData = [2, 5, 8, 3, 10, 6, 4]; 
  const maxActivity = Math.max(...weekData);

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-obsidian-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">
            Konnichiwa, {user.name.split(' ')[0]}! <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-slate-400">
            Sizning JLPT {user.currentJlptLevel} maqsadingizga yana bir qadam qoldi. Bugungi vazifalarni bajaramizmi?
          </p>
        </div>
                <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-2">
            <span className="text-xs text-slate-400 font-medium">Lvl {levelInfo.level}: {levelInfo.title}</span>
            <div className="w-32 h-1.5 bg-obsidian-900 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${levelInfo.progress}%` }}></div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian-800 border border-obsidian-700 shadow-lg">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
            <span className="font-bold text-slate-100">{user.streakCount} kun</span>
            <span className="text-slate-400 text-sm">seriya</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Circular Progress & Chart */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Circular Progress */}
          <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-4 left-4 text-slate-400 flex items-center gap-1.5 text-sm font-medium">
              <Target className="w-4 h-4 text-violet-500" /> Maqsad: {user.currentJlptLevel}
            </div>
            
            <div className="relative w-40 h-40 mt-8 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className="text-obsidian-900"
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeDasharray={`${progressPercent * 2.51} 251`} 
                  strokeLinecap="round"
                  className="text-violet-500 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-100">{progressPercent}%</span>
              </div>
            </div>
            
            <h3 className="font-semibold text-slate-100">{completedCount} / {totalLessons} dars</h3>
            <p className="text-sm text-slate-400">Yana {totalLessons - completedCount} ta dars qoldi</p>
          </div>

          {/* Activity Chart (SVG Minimalist) */}
          <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-400" /> Faollik
              </h3>
              <span className="text-xs text-slate-400">Shu hafta</span>
            </div>
            
            <div className="flex items-end justify-between h-32 gap-2">
                                          {weekData.map((val, idx) => {
                const height = (val / maxActivity) * 100;
                const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
                const isToday = idx === (new Date().getDay() || 7) - 1;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group relative">
                    <div className="w-full bg-obsidian-900 rounded-t-sm rounded-b-md relative h-full flex items-end">
                      <div 
                        className={`w-full ${isToday ? 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)] group-hover:bg-violet-400' : 'bg-blue-500/50 group-hover:bg-blue-400/80'} rounded-t-sm rounded-b-md transition-all duration-500 relative`}
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-obsidian-900 border border-obsidian-700 text-slate-100 text-xs px-2 py-1 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-medium">
                          {val} XP
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${isToday ? 'text-violet-400 font-bold' : 'text-slate-500'}`}>{days[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
          
          {/* Action 1: Continue Lesson */}
          <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 hover:border-green-500/50 transition-colors group sm:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-500">Darsni davom ettirish</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-1">{continueTitle}</h3>
                <p className="text-sm text-slate-400">Oxirgi marta to'xtagan joyingizdan davom eting.</p>
              </div>
              <Link 
                href={continueLink}
                className="shrink-0 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center gap-2 font-medium transition-colors w-full sm:w-auto justify-center"
              >
                Boshlash <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Action 2: SRS */}
          <Link href="/srs" className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 hover:border-blue-500/50 transition-colors group flex flex-col h-full">
            <div className="flex justify-between items-start mb-auto pb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <BookOpen className="w-6 h-6" />
              </div>
              {srsCount > 0 ? (
                <span className="text-xs font-medium text-slate-100 bg-blue-500 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  {srsCount} ta kutmoqda
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 bg-obsidian-700 px-3 py-1 rounded-full">
                  Barchasi o'qilgan
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 mb-1">SRS Lug'at</h3>
              <p className="text-sm text-slate-400 mb-4">Miyada saqlab qolish uchun intervalli takrorlash.</p>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-500 group-hover:text-blue-400 transition-colors">
                Takrorlashga o'tish <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Action 3: Sensei AI */}
          <Link href="/sensei" className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 hover:border-violet-500/50 transition-colors group flex flex-col h-full">
            <div className="flex justify-between items-start mb-auto pb-4">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-violet-500 bg-violet-500/10 px-3 py-1 rounded-full">
                Tezkor yordam
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 mb-1">AI Sensei</h3>
              <p className="text-sm text-slate-400 mb-4">Yapon tilida erkin suhbat, grammatika va kanji tahlili.</p>
              <div className="flex items-center gap-2 text-sm font-medium text-violet-500 group-hover:text-violet-400 transition-colors">
                Suhbatni boshlash <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}








