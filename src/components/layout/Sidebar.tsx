"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Settings,
  MessageSquare,
  CreditCard,
  Crown,
  PenTool,
  BookMarked,
  ShieldAlert,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

const studentNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Darslar", icon: BookOpen },
  { href: "/sensei", label: "AI Sensei", icon: MessageSquare },
  { href: "/srs", label: "Lug'at (SRS)", icon: GraduationCap },
  { href: "/kanji", label: "Kanji Chizish", icon: PenTool },
  { href: "/leaderboard", label: "Reyting", icon: Trophy },
  { href: "/pricing", label: "Ta'riflar", icon: Crown },
  { href: "/settings", label: "Sozlamalar", icon: Settings },
];

const adminNavItems = [
  { href: "/admin", label: "Asosiy Boshqaruv", icon: LayoutDashboard },
  { href: "/crm/students", label: "Talabalar", icon: Users },
  { href: "/crm/payments", label: "To'lovlar", icon: CreditCard },
  { href: "/admin/courses", label: "Kurslar boshqaruvi", icon: BookOpen },
  { href: "/admin/vocabulary", label: "Lug'at va Kanji", icon: BookMarked },
  { href: "/settings", label: "Sozlamalar", icon: Settings },
];

export function Sidebar({ session }: { session: any }) {
  const pathname = usePathname();
  const isAdmin = session.role === "admin" || session.role === "teacher";
  const navItemsToRender = isAdmin ? adminNavItems : studentNavItems;

  return (
    <aside className="w-64 border-r border-obsidian-700 bg-obsidian-800/50 backdrop-blur-md hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-obsidian-700">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItemsToRender.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/" && item.href !== "/admin");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-violet-500/10 text-violet-500" 
                  : "text-slate-300 hover:bg-obsidian-700 hover:text-slate-100"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-violet-500" : "text-slate-300")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-obsidian-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center shrink-0",
            isAdmin 
              ? "bg-red-500/10 border-red-500/20 text-red-500" 
              : "bg-violet-500/10 border-obsidian-700 text-violet-500"
          )}>
            {isAdmin ? <ShieldAlert className="w-4 h-4" /> : <span className="text-xs font-bold uppercase">{session.name.substring(0, 2)}</span>}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-slate-100 truncate">{session.name}</span>
            {isAdmin ? (
               <span className="text-xs text-red-400 font-bold tracking-wide capitalize truncate">Administrator</span>
            ) : (
               <span className="text-xs text-slate-400 capitalize truncate">Talaba</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
