"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X,
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

export function MobileSidebar({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isAdmin = session?.role === "admin" || session?.role === "teacher";
  const navItemsToRender = isAdmin ? adminNavItems : studentNavItems;

  // URL o'zgarganda menyuni yopish
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Scroll'ni qulflash
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-slate-300 hover:text-slate-100 hover:bg-obsidian-700 rounded-md transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer Sidebar */}
          <aside className="relative w-[280px] max-w-full h-full bg-obsidian-800 border-r border-obsidian-700 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-obsidian-700 shrink-0">
              <Logo />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              {navItemsToRender.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/" && item.href !== "/admin");
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-violet-500/10 text-violet-500" 
                        : "text-slate-300 hover:bg-obsidian-700 hover:text-slate-100"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-violet-500" : "text-slate-400")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {session && (
              <div className="p-4 border-t border-obsidian-700 shrink-0 bg-obsidian-900/50">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center shrink-0",
                    isAdmin 
                      ? "bg-red-500/10 border-red-500/20 text-red-500" 
                      : "bg-violet-500/10 border-obsidian-700 text-violet-500"
                  )}>
                    {isAdmin ? <ShieldAlert className="w-5 h-5" /> : <span className="text-sm font-bold uppercase">{session.name?.substring(0, 2)}</span>}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold text-slate-100 truncate">{session.name}</span>
                    <span className={cn("text-xs truncate font-medium", isAdmin ? "text-red-400" : "text-slate-400")}>
                      {isAdmin ? "Administrator" : "Talaba"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
