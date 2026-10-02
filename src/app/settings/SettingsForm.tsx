"use client";

import { useState } from "react";
import { updateSettings } from "./actions";
import { logout } from "@/app/login/actions";
import { Save, LogOut, User, Target, Volume2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateSettings(formData);
    
    if (res.success) {
      setToast({ message: res.message!, type: "success" });
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({ message: res.error!, type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={cn(
          "fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 animate-in slide-in-from-top-10 fade-in border",
          toast.type === "success" ? "bg-green-500/90 text-white border-green-500/20" : "bg-red-500/90 text-white border-red-500/20"
        )}>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Shaxsiy Ma'lumotlar */}
        <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-violet-500" /> Profil
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">To'liq ism</label>
              <input 
                name="name"
                defaultValue={user.name}
                required
                type="text" 
                className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition-colors" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">Telefon raqam</label>
              <input 
                name="phone"
                defaultValue={user.phone || ""}
                type="tel" 
                placeholder="+998 90 123 45 67"
                className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition-colors" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-400 block mb-2">Email (O'zgartirib bo'lmaydi)</label>
              <input 
                defaultValue={user.email}
                disabled
                type="email" 
                className="w-full bg-obsidian-900/50 border border-obsidian-700/50 text-slate-500 px-4 py-3 rounded-xl cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        {/* O'quv maqsadlari */}
        <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-blue-500" /> O'quv maqsadlari
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">JLPT Darajasi</label>
              <select 
                name="currentJlptLevel"
                defaultValue={user.currentJlptLevel}
                className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="N5">N5 - Boshlang'ich</option>
                <option value="N4">N4 - O'rta quyi</option>
                <option value="N3">N3 - O'rta</option>
                <option value="N2">N2 - O'rta yuqori</option>
                <option value="N1">N1 - Mukammal</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">Kunlik so'zlar maqsadi (SRS)</label>
              <div className="relative">
                <input 
                  name="dailyGoalWords"
                  defaultValue={user.dailyGoalWords || 15}
                  type="number" 
                  min="5" max="100"
                  className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">so'z</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Sozlamalari */}
        <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-6">
            <Volume2 className="w-5 h-5 text-green-500" /> Audio va Ovoz
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">Ovoz turi (TTS)</label>
              <select 
                name="ttsVoice"
                defaultValue={user.ttsVoice || "female"}
                className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 transition-colors cursor-pointer"
              >
                <option value="female">Ayol (Nanami)</option>
                <option value="male">Erkak (Keita)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">Talaffuz tezligi</label>
              <select 
                name="ttsSpeed"
                defaultValue={user.ttsSpeed || 1.0}
                className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 transition-colors cursor-pointer"
              >
                <option value="0.8">0.8x - Sekin</option>
                <option value="1.0">1.0x - Normal (Standart)</option>
                <option value="1.2">1.2x - Tez</option>
              </select>
            </div>
          </div>
        </div>

        {/* Telegram Sozlamalari */}
        <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#3b82f6] fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.33-1.08-.7.02-.19.27-.39.75-.59 2.95-1.28 4.91-2.13 5.9-2.54 2.8-1.16 3.38-1.36 3.76-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
              Telegram Bot
            </h2>
            {user.telegramChatId ? (
              <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold">Ulandi</span>
            ) : (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold">Ulanmadi</span>
            )}
          </div>

          {!user.telegramChatId ? (
            <div className="bg-obsidian-900 border border-obsidian-700 p-6 rounded-2xl text-center">
              <p className="text-slate-400 mb-4">Telegram orqali bildirishnomalar va eslatmalar olish uchun hisobingizni ulang.</p>
              <a 
                href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'JLanguageBot'}?start=${user.id}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                Telegramga ulanish
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-obsidian-900 border border-obsidian-700 rounded-2xl cursor-pointer hover:border-violet-500/30 transition-colors">
                <div>
                  <div className="font-bold text-slate-200">Lug'at (SRS) eslatmalari</div>
                  <div className="text-sm text-slate-500">Takrorlanishi kerak bo'lgan so'zlar haqida kunlik eslatma</div>
                </div>
                <input type="checkbox" name="tgNotifySrs" defaultChecked={user.tgNotifySrs === 1} className="w-5 h-5 accent-violet-500" />
              </label>

              <label className="flex items-center justify-between p-4 bg-obsidian-900 border border-obsidian-700 rounded-2xl cursor-pointer hover:border-violet-500/30 transition-colors">
                <div>
                  <div className="font-bold text-slate-200">Dars eslatmalari</div>
                  <div className="text-sm text-slate-500">Yangi darslar va vazifalar haqida bildirishnoma</div>
                </div>
                <input type="checkbox" name="tgNotifyLessons" defaultChecked={user.tgNotifyLessons === 1} className="w-5 h-5 accent-violet-500" />
              </label>

              <label className="flex items-center justify-between p-4 bg-obsidian-900 border border-obsidian-700 rounded-2xl cursor-pointer hover:border-violet-500/30 transition-colors">
                <div>
                  <div className="font-bold text-slate-200">To'lovlar (Chek)</div>
                  <div className="text-sm text-slate-500">Muvaffaqiyatli to'lovlar haqida elektron chek qabul qilish</div>
                </div>
                <input type="checkbox" name="tgNotifyPayments" defaultChecked={user.tgNotifyPayments === 1} className="w-5 h-5 accent-violet-500" />
              </label>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button 
            disabled={loading}
            type="submit"
            className="px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-5 h-5" /> Saqlash
          </button>
        </div>
      </form>

      {/* Security & Logout */}
      <div className="bg-obsidian-800 border border-red-500/20 rounded-3xl p-6 md:p-8 mt-12">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-red-400" /> Xavfsizlik
        </h2>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-slate-200 font-medium">Sessiyani yakunlash</h3>
            <p className="text-slate-400 text-sm mt-1">Platformadan xavfsiz tarzda chiqish.</p>
          </div>
          <form action={logout}>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Chiqish
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
