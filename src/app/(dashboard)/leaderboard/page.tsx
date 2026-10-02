import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getUserLevel } from "@/lib/gamification";
import { Trophy, Medal, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function LeaderboardPage() {
  const session = await getSession();
  const currentUserId = session?.id;

  // Fetch top 100 users by XP
  const topUsers = await db.select({
    id: users.id,
    name: users.name,
    xp: users.xp,
    streakCount: users.streakCount,
  })
  .from(users)
  .where(eq(users.role, "student"))
  .orderBy(desc(users.xp))
  .limit(100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 items-center text-center">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-2">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 font-jp tracking-tight">Reyting (Leaderboard)</h1>
        <p className="text-slate-400">Tizimdagi eng faol o'quvchilar ro'yxati. O'qishda davom eting va yuqoriga ko'tariling!</p>
      </div>

      <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-obsidian-700 bg-obsidian-900/50 flex text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="w-16 text-center">O'rin</div>
          <div className="flex-1">Talaba & Daraja</div>
          <div className="w-24 text-center">Streak</div>
          <div className="w-32 text-right pr-4">Jami XP</div>
        </div>
        
        <div className="divide-y divide-obsidian-700">
          {topUsers.map((user, index) => {
            const levelInfo = getUserLevel(user.xp);
            const isCurrentUser = user.id === currentUserId;
            
            // Rank colors
            let rankColor = "text-slate-400";
            let rankBg = "bg-transparent";
            let RankIcon = null;
            
            if (index === 0) {
              rankColor = "text-amber-500";
              rankBg = "bg-amber-500/10 border border-amber-500/20";
              RankIcon = Trophy;
            } else if (index === 1) {
              rankColor = "text-slate-300";
              rankBg = "bg-slate-300/10 border border-slate-300/20";
              RankIcon = Medal;
            } else if (index === 2) {
              rankColor = "text-orange-700"; // Bronze
              rankBg = "bg-orange-700/10 border border-orange-700/20";
              RankIcon = Medal;
            }

            return (
              <div 
                key={user.id} 
                className={cn(
                  "flex items-center p-4 transition-colors",
                  isCurrentUser ? "bg-violet-500/10 hover:bg-violet-500/20 relative" : "hover:bg-obsidian-700/50"
                )}
              >
                {isCurrentUser && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
                )}
                
                <div className="w-16 flex justify-center">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", rankBg, rankColor)}>
                    {RankIcon ? <RankIcon className="w-4 h-4" /> : index + 1}
                  </div>
                </div>
                
                <div className="flex-1 flex items-center gap-3 pl-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border",
                    isCurrentUser ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "bg-obsidian-700 text-slate-300 border-obsidian-600"
                  )}>
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("font-bold", isCurrentUser ? "text-violet-400" : "text-slate-200")}>
                      {user.name} {isCurrentUser && "(Siz)"}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Lvl {levelInfo.level} • {levelInfo.title}</span>
                  </div>
                </div>
                
                <div className="w-24 flex justify-center items-center gap-1 text-orange-500 font-medium text-sm">
                  <Flame className="w-4 h-4" />
                  {user.streakCount}
                </div>
                
                <div className="w-32 text-right pr-4 flex items-center justify-end gap-1 font-bold text-blue-400">
                  <Zap className="w-4 h-4 fill-blue-400" />
                  {user.xp}
                </div>
              </div>
            );
          })}

          {topUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Hali reytingda hech kim yo'q. Birinchi bo'ling!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
