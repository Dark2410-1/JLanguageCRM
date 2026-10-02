"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/login/actions";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-900 p-4">
      <div className="w-full max-w-md bg-obsidian-800 border border-obsidian-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 blur-3xl rounded-full"></div>

        <div className="relative">
          
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-500 mb-6 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Ortga qaytish
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-100 font-jp tracking-tight mb-2">Parolni tiklash</h1>
            <p className="text-slate-400 text-sm">Elektron pochta manzilingizni kiriting va biz sizga parolingizni tiklash uchun sehrli havola (Magic Link) yuboramiz.</p>
          </div>

          {state?.success ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-100 mb-2">Havola yuborildi!</h2>
              <p className="text-slate-400 text-sm">{state.success}</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
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
                {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirish havolasini yuborish"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
