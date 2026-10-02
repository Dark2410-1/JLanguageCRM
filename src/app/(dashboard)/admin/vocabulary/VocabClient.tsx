"use client";

import { useActionState, useState } from "react";
import { addVocabulary, bulkUploadVocabulary } from "./actions";
import { Loader2, Plus, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VocabClient() {
  const [state, formAction, pending] = useActionState(addVocabulary, null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{type: "success"|"error", text: string} | null>(null);

  const handleBulkSubmit = async () => {
    setBulkPending(true);
    setBulkMessage(null);
    try {
      const data = JSON.parse(bulkJson);
      if (!Array.isArray(data)) throw new Error("JSON massiv (Array) bo'lishi kerak.");
      
      const res = await bulkUploadVocabulary(data);
      if (res.success) {
        setBulkMessage({ type: "success", text: "Ma'lumotlar muvaffaqiyatli yuklandi!" });
        setBulkJson("");
      } else {
        setBulkMessage({ type: "error", text: res.error || "Xatolik" });
      }
    } catch (e: any) {
      setBulkMessage({ type: "error", text: e.message || "Noto'g'ri JSON formati." });
    } finally {
      setBulkPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 font-jp tracking-tight">Lug'at va Kanji</h1>
          <p className="text-slate-400">Tizimdagi barcha so'zlar bazasini boshqarish.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-2 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-600 text-slate-200 px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <UploadCloud className="w-5 h-5" />
            Ommaviy yuklash
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Yangi qo'shish
          </button>
        </div>
      </div>

      {state?.success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
          So'z muvaffaqiyatli qo'shildi!
        </div>
      )}
      
      {state?.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          {state.error}
        </div>
      )}

      {/* Add Single Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-obsidian-700">
              <h2 className="text-xl font-bold text-slate-100">Yangi so'z qo'shish</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form action={formAction} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Daraja (JLPT)</label>
                  <select name="level" className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500">
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Kanji (yoki yozilishi)</label>
                  <input type="text" name="kanji" required placeholder="私" className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Hiragana / Furigana</label>
                  <input type="text" name="hiragana" required placeholder="わたし" className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Romaji</label>
                  <input type="text" name="romaji" required placeholder="watashi" className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">O'zbekcha tarjimasi</label>
                <input type="text" name="meaningUz" required placeholder="Men" className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500" />
              </div>

              <div className="p-4 bg-obsidian-900/50 rounded-2xl border border-obsidian-700 space-y-4">
                <h3 className="font-medium text-slate-200">Misol gap (Ixtiyoriy)</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Yaponcha</label>
                  <input type="text" name="exampleJp" placeholder="私は学生です。" className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2 rounded-xl focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">O'zbekcha ma'nosi</label>
                  <input type="text" name="exampleUz" placeholder="Men talabaman." className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-2 rounded-xl focus:outline-none focus:border-violet-500" />
                </div>
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

      {/* Bulk Upload Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-obsidian-700">
              <h2 className="text-xl font-bold text-slate-100">Ommaviy yuklash (JSON)</h2>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {bulkMessage && (
                <div className={cn("p-4 rounded-xl", bulkMessage.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
                  {bulkMessage.text}
                </div>
              )}
              
              <p className="text-sm text-slate-400">Quyidagi formatda JSON massiv kiriting:</p>
              <pre className="text-xs text-slate-500 bg-obsidian-900 p-3 rounded-xl border border-obsidian-700 overflow-x-auto">
{`[
  { 
    "level": "N5", "kanji": "私", "hiragana": "わたし", 
    "romaji": "watashi", "meaningUz": "Men",
    "exampleJp": "私は学生です。", "exampleUz": "Men talabaman."
  }
]`}
              </pre>
              
              <textarea 
                rows={8} 
                className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 font-mono text-sm"
                value={bulkJson}
                onChange={e => setBulkJson(e.target.value)}
                placeholder="Bu yerga JSON kiriting..."
              ></textarea>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBulkOpen(false)} className="px-5 py-2.5 text-slate-300 hover:text-slate-100 font-medium">Bekor qilish</button>
                <button 
                  disabled={bulkPending || !bulkJson.trim()}
                  onClick={handleBulkSubmit}
                  className={cn(
                    "px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all",
                    bulkPending ? "bg-violet-500/50 text-white cursor-not-allowed" : "bg-violet-500 hover:bg-violet-600 text-white"
                  )}
                >
                  {bulkPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yuklash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
