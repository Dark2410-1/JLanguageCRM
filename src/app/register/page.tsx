"use client";

import { useActionState } from "react";
import { register } from "../login/actions";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-900 p-4">
      <div className="w-full max-w-md bg-obsidian-800 border border-obsidian-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full"></div>

        <div className="relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-100 font-jp tracking-tight mb-2">Yangi akkount</h1>
            <p className="text-slate-400">Yapon tilini o'rganishni boshlaymiz.</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">To'liq ism</label>
              <input 
                required
                type="text" 
                name="name" 
                placeholder="Ali Karimov"
                className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition-colors" 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Email manzil</label>
              <input 
                required
                type="email" 
                name="email" 
                placeholder="talaba@jlanguage.uz"
                className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition-colors" 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Parol</label>
              <input 
                required
                type="password" 
                name="password" 
                placeholder="••••••••"
                className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition-colors" 
              />
            </div>

            {state?.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {state.error}
              </div>
            )}

            <button 
              disabled={pending}
              type="submit" 
              className={cn(
                "w-full py-3 mt-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all",
                pending ? "bg-violet-500/50 text-white cursor-not-allowed" : "bg-violet-500 hover:bg-violet-600 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              )}
            >
              {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ro'yxatdan o'tish"}
              {!pending && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Akkountingiz bormi?{" "}
            <Link href="/login" className="text-violet-500 hover:text-violet-400 font-medium transition-colors">
              Tizimga kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
