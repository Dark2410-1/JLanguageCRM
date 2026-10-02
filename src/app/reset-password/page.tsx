"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import { resetPassword } from "@/app/login/actions";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [state, formAction, pending] = useActionState(resetPassword, null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!token) {
    return (
      <div className="w-full max-w-md bg-obsidian-800 border border-red-500/20 rounded-3xl p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">Havola noto'g'ri</h1>
        <p className="text-slate-400 mb-6">Parolni tiklash havolasi xato yoki muddati o'tgan bo'lishi mumkin.</p>
        <Link href="/forgot-password" className="inline-flex py-3 px-6 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl transition-all">
          Yangi havola so'rash
        </Link>
      </div>
    );
  }

  if (state?.success) {
    setTimeout(() => {
      router.push("/");
    }, 2000);

    return (
      <div className="w-full max-w-md bg-obsidian-800 border border-green-500/20 rounded-3xl p-8 shadow-2xl text-center animate-in zoom-in-95">
        <ShieldCheck className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Parol muvaffaqiyatli tiklandi!</h1>
        <p className="text-slate-400 text-sm">Siz avtomatik tarzda tizimga kiritilmoqdasiz...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-obsidian-800 border border-obsidian-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-violet-500/20 blur-3xl rounded-full"></div>

      <div className="relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 font-jp tracking-tight mb-2">Yangi parol</h1>
          <p className="text-slate-400 text-sm">Xavfsizligingiz uchun yangi va kuchli parol o'rnating.</p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Yangi parol</label>
            <input 
              required
              type="password" 
              name="password"
              minLength={6}
              placeholder="Kamida 6 ta belgi"
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
            {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Saqlash va Kirish"}
            {!pending && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-900 p-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 text-violet-500 animate-spin" />}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
