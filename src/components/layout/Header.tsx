import { Menu, LogOut, Zap } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Logo } from "@/components/ui/Logo";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserLevel } from "@/lib/gamification";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { NotificationsDropdown } from "@/components/ui/Notifications";
import { MobileSidebar } from "@/components/layout/MobileSidebar";

export async function Header({ session }: { session: any }) {
  let userStats = { xp: 0, streakCount: 0 };
  let levelInfo = null;
  
  if (session?.id) {
    const [user] = await db.select({ xp: users.xp, streakCount: users.streakCount }).from(users).where(eq(users.id, session.id));
    if (user) {
      userStats = user;
      levelInfo = getUserLevel(user.xp);
    }
  }

  return (
    <header className="h-16 border-b border-obsidian-700 bg-obsidian-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <MobileSidebar session={session} />

        {/* Mobile Logo */}
        <div className="md:hidden">
          <Logo withText={false} className="gap-0 w-8 h-8" />
        </div>
        
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-3">
        {/* User Level */}
        {levelInfo && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
            <span className="font-bold">Lvl {levelInfo.level}</span>
            <span className="text-violet-500/50">|</span>
            <span>{levelInfo.title}</span>
          </div>
        )}

        {/* XP */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          <Zap className="w-4 h-4 fill-blue-400 text-blue-400" />
          <span>{userStats.xp} XP</span>
        </div>

        {/* JLPT Streak / Fire */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
          <span className="text-base">🔥</span>
          <span>{userStats.streakCount} kun</span>
        </div>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Logout */}
        {session && (
          <form action={logout}>
            <button 
              type="submit"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
