import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { Users, Crown, CreditCard, UserPlus, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  // Barcha talabalar soni
  const [totalStudentsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "student"));

  // Faol obunachilar (status = 'active')
  const [activeSubscribersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.role, "student"), eq(users.status, "active")));

  // Oylik daromad
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [monthlyRevenueResult] = await db
    .select({ sum: sql<number>`sum(amount)` })
    .from(payments)
    .where(and(eq(payments.status, "completed"), eq(payments.periodMonth, currentMonth)));

  // Yangi ro'yxatdan o'tganlar (shu oyda)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const [newSignupsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, startOfMonth));

  const stats = [
    {
      title: "Jami Talabalar",
      value: totalStudentsResult?.count || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Faol Obunachilar",
      value: activeSubscribersResult?.count || 0,
      icon: Crown,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Oylik Daromad",
      value: `${(monthlyRevenueResult?.sum || 0).toLocaleString()} UZS`,
      icon: CreditCard,
      color: "text-green-500",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      title: "Yangi Ro'yxatdan O'tganlar",
      value: newSignupsResult?.count || 0,
      icon: UserPlus,
      color: "text-violet-500",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-100 font-jp tracking-tight">Asosiy Boshqaruv Paneli</h1>
        <p className="text-slate-400">JLanguage tizimi statistikasi va biznes analitikasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 relative overflow-hidden group hover:border-obsidian-600 transition-colors">
            {/* Decorative Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 blur-3xl rounded-full opacity-20 ${stat.bg.split(' ')[0]} group-hover:opacity-40 transition-opacity`}></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-2xl border ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100">O'sish dinamikasi</h2>
            <button className="text-sm text-violet-500 hover:text-violet-400 font-medium">Batafsil</button>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-obsidian-600 rounded-2xl bg-obsidian-900/50">
            <div className="text-center text-slate-500 flex flex-col items-center gap-2">
              <TrendingUp className="w-8 h-8 opacity-50" />
              <p>Grafika moduli (Recharts) tez orada qo'shiladi</p>
            </div>
          </div>
        </div>

        <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100">Oxirgi harakatlar</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-sm text-slate-300 flex-1 truncate">Ali Valiyev "Pro" tarifini sotib oldi.</p>
              <span className="text-xs text-slate-500">10 daq.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-500"></div>
              <p className="text-sm text-slate-300 flex-1 truncate">Yangi o'quvchi ro'yxatdan o'tdi.</p>
              <span className="text-xs text-slate-500">1 soat</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-sm text-slate-300 flex-1 truncate">"N5 Grammatika" darsi yangilandi.</p>
              <span className="text-xs text-slate-500">3 soat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
