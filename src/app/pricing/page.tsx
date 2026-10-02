"use client";

import { useState } from "react";
import { Check, X, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planName: string, amount: number) => {
    setLoadingPlan(planName);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName.toLowerCase(), amount, isYearly })
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to payment gateway (Click/Payme)
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 font-jp tracking-tight mb-4">
          Chegarasiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600">Yapon Tili</span>
        </h1>
        <p className="text-slate-400 text-lg">
          O'zingizga mos ta'rifni tanlang va til o'rganish tezligingizni 10 barobarga oshiring.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={cn("text-sm font-medium", !isYearly ? "text-slate-100" : "text-slate-400")}>Oylik</span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-8 bg-obsidian-800 border border-obsidian-700 rounded-full p-1 transition-colors relative"
          >
            <div className={cn(
              "w-6 h-6 bg-violet-500 rounded-full transition-transform duration-300 shadow-lg",
              isYearly ? "translate-x-6" : "translate-x-0"
            )}></div>
          </button>
          <span className={cn("text-sm font-medium flex items-center gap-1.5", isYearly ? "text-slate-100" : "text-slate-400")}>
            Yillik <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">20% CHEGIRMA</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Trial Plan */}
        <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-8 hover:border-slate-500/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center mb-6">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Bepul (Trial)</h3>
          <p className="text-slate-400 text-sm mb-6 h-10">Platforma bilan tanishish uchun boshlang'ich imkoniyatlar.</p>
          <div className="text-3xl font-bold text-slate-100 mb-8">
            0 <span className="text-lg text-slate-500 font-medium">so'm</span>
          </div>
          
          <ul className="space-y-4 mb-8 text-sm text-slate-300">
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-slate-500 shrink-0" /> N5 daraja 1-modul (Kirish)</li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-slate-500 shrink-0" /> Cheklangan AI Sensei so'rovlari</li>
            <li className="flex items-start gap-3 text-slate-500"><X className="w-5 h-5 shrink-0" /> SRS Intervalli takrorlash</li>
            <li className="flex items-start gap-3 text-slate-500"><X className="w-5 h-5 shrink-0" /> To'liq kurslar bazasi</li>
          </ul>

          <button className="w-full py-3 rounded-xl font-medium bg-obsidian-900 border border-obsidian-700 text-slate-300 hover:bg-obsidian-700 transition-colors">
            Hozirgi Ta'rif
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-obsidian-800 border-2 border-violet-500 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Eng Mashhur
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Pro Obuna</h3>
          <p className="text-slate-400 text-sm mb-6 h-10">Barcha imkoniyatlar ochiladi. Mustaqil o'rganish uchun mukammal.</p>
          <div className="flex items-end gap-2 mb-8">
            <div className="text-4xl font-bold text-slate-100">
              {isYearly ? "160 000" : "200 000"} 
            </div>
            <span className="text-slate-500 mb-1">so'm / oy</span>
          </div>
          
          <ul className="space-y-4 mb-8 text-sm text-slate-300">
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-500 shrink-0" /> JLPT N5 dan N1 gacha barcha darslar</li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-500 shrink-0" /> Cheksiz AI Sensei suhbatlari</li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-500 shrink-0" /> SRS Flashcard tizimidan to'liq foydalanish</li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-500 shrink-0" /> Tezkor Audio TTS (talaffuz)</li>
          </ul>

          <button 
            onClick={() => handleSubscribe("Pro", isYearly ? 1920000 : 200000)}
            disabled={loadingPlan === "Pro"}
            className="w-full py-3 rounded-xl font-bold bg-violet-500 hover:bg-violet-600 text-white transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center"
          >
            {loadingPlan === "Pro" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Obuna bo'lish"}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-8 hover:border-blue-500/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
            <Crown className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Premium Mentor</h3>
          <p className="text-slate-400 text-sm mb-6 h-10">Shaxsiy o'qituvchi bilan birgalikda dars qilish va nazorat.</p>
          <div className="flex items-end gap-2 mb-8">
            <div className="text-3xl font-bold text-slate-100">
              {isYearly ? "400 000" : "500 000"} 
            </div>
            <span className="text-slate-500 mb-1">so'm / oy</span>
          </div>
          
          <ul className="space-y-4 mb-8 text-sm text-slate-300">
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-400 shrink-0" /> Pro ta'rifidagi barcha qulayliklar</li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-400 shrink-0" /> Haftalik o'qituvchi bilan tahlil (Zoom/Audio)</li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-400 shrink-0" /> Shaxsiy o'quv dasturi tuzib berish</li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-400 shrink-0" /> Rasmiy maxsus Sertifikat</li>
          </ul>

          <button 
            onClick={() => handleSubscribe("Premium", isYearly ? 4800000 : 500000)}
            disabled={loadingPlan === "Premium"}
            className="w-full py-3 rounded-xl font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center"
          >
            {loadingPlan === "Premium" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Obuna bo'lish"}
          </button>
        </div>

      </div>
    </div>
  );
}
