"use client";

import { useActionState, useState, useEffect } from "react";
import { addLesson, deleteLesson } from "./actions";
import { Loader2, Plus, Trash2, Edit2, PlayCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Fetch type would normally be imported, let's mock the interface
interface Lesson {
  id: string;
  level: string;
  order: number;
  title: string;
  romajiTitle: string | null;
  description: string | null;
  content: string;
}

export default function CoursesClient() {
  const [state, formAction, pending] = useActionState(addLesson, null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Since it's a Client Component to handle modal interactions smoothly,
  // we fetch the initial data in useEffect or we could pass it from a Server Component.
  // We'll fetch via a quick API route or Server Action for fetching. 
  // For simplicity, let's just do a server component for the page and pass data to a client component.

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 font-jp tracking-tight">Kurslar va Darslar</h1>
          <p className="text-slate-400">Platformadagi barcha darslarni boshqarish.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Yangi dars qo'shish
        </button>
      </div>

      {state?.success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
          Muvaffaqiyatli saqlandi! Sahifani yangilang.
        </div>
      )}
      
      {state?.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          {state.error}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-obsidian-700">
              <h2 className="text-xl font-bold text-slate-100">Yangi dars qo'shish</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form action={formAction} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Daraja (JLPT)</label>
                  <select name="level" className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500">
                    <option value="N5">N5 - Boshlang'ich</option>
                    <option value="N4">N4 - O'rta</option>
                    <option value="N3">N3 - Yuqori O'rta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tartib raqami</label>
                  <input type="number" name="order" required defaultValue={1} className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Dars nomi</label>
                <input type="text" name="title" required placeholder="Masalan: Salomlashuv" className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Romaji nomi (Ixtiyoriy)</label>
                <input type="text" name="romajiTitle" placeholder="Masalan: Aisatsu" className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Video / Audio havola</label>
                <input type="url" name="audioUrl" placeholder="https://youtube.com/..." className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Qisqa tavsif</label>
                <textarea name="description" rows={2} className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Dars mazmuni (Markdown)</label>
                <textarea name="content" required rows={6} placeholder="## Qoidalar..." className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 font-mono text-sm"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-300 hover:text-slate-100 font-medium">Bekor qilish</button>
                <button 
                  disabled={pending}
                  type="submit" 
                  className={cn(
                    "px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all",
                    pending ? "bg-violet-500/50 text-white cursor-not-allowed" : "bg-violet-500 hover:bg-violet-600 text-white"
                  )}
                >
                  {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

