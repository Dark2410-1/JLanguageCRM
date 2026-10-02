import { getCourseLevels } from "./actions";
import Link from "next/link";
import { Book, CheckCircle2, PlayCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const levels = await getCourseLevels();

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 font-jp mb-2">コース (Kurslar)</h1>
        <p className="text-slate-400">Yapon tilini darajangizga mos ravishda o'rganing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => {
          const progressPercent = level.totalLessons > 0 
            ? Math.round((level.completedLessons / level.totalLessons) * 100) 
            : 0;
            
          const isAvailable = level.totalLessons > 0;
          const isFullyCompleted = isAvailable && level.completedLessons === level.totalLessons;

          return (
            <div 
              key={level.level}
              className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-violet-500/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold text-2xl border border-violet-500/20">
                  {level.level}
                </div>
                {isFullyCompleted && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tugallangan
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-100 mb-2">{level.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                <span className="flex items-center gap-1.5">
                  <Book className="w-4 h-4" /> {level.totalLessons} ta dars
                </span>
              </div>

              {/* Progress */}
              <div className="mt-auto">
                <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                  <span>O'zlashtirish</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-obsidian-900 h-2 rounded-full overflow-hidden border border-obsidian-700">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isFullyCompleted ? "bg-green-500" : "bg-violet-500"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6">
                {isAvailable ? (
                  <Link 
                    href={`/learn/${level.level}/${level.nextLessonId}`}
                    className={cn(
                      "w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors",
                      progressPercent > 0 
                        ? "bg-obsidian-700 text-slate-100 hover:bg-violet-500 hover:text-white"
                        : "bg-violet-500 text-white hover:bg-violet-600"
                    )}
                  >
                    <PlayCircle className="w-5 h-5" /> 
                    {progressPercent > 0 ? "Davom ettirish" : "Boshlash"}
                  </Link>
                ) : (
                  <button disabled className="w-full py-3 bg-obsidian-900 border border-obsidian-700 text-slate-500 rounded-xl flex items-center justify-center gap-2 font-medium cursor-not-allowed">
                    <Lock className="w-4 h-4" /> Tez orada
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
