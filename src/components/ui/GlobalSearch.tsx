"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Command, BookOpen, PenTool, X, Loader2 } from "lucide-react";
import { searchGlobal } from "../layout/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ lessons: any[], vocabulary: any[] }>({ lessons: [], vocabulary: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setQuery("");
      setResults({ lessons: [], vocabulary: [] });
    }
  }, [isOpen]);

  // Debounced Search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ lessons: [], vocabulary: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchGlobal(query);
        setResults(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectLesson = (level: string, id: string) => {
    setIsOpen(false);
    router.push(`/learn/${level}/${id}`);
  };

  const handleSelectKanji = (kanji: string) => {
    setIsOpen(false);
    // Masalan kanji sahifasiga query bilan jo'natish yoki to'g'ridan-to'g'ri lug'atga
    router.push(`/srs`);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center justify-between gap-2 px-3 py-1.5 bg-obsidian-800 border border-obsidian-700 hover:border-violet-500/50 rounded-lg w-64 text-slate-300 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors" />
          <span className="text-sm text-slate-400">Izlash...</span>
        </div>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-obsidian-600 bg-obsidian-900 px-1.5 font-mono text-[10px] font-medium text-slate-400">
          <Command className="w-3 h-3" /> K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Modal Background Click */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-obsidian-900 border border-obsidian-700 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
            {/* Search Input Box */}
            <div className="flex items-center px-4 py-4 border-b border-obsidian-700 gap-3">
              <Search className="w-5 h-5 text-violet-500" />
              <input 
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Dars, kanji yoki so'z qidiring..."
                className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 text-lg"
              />
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-obsidian-700 bg-obsidian-800 px-2 font-mono text-xs font-medium text-slate-400">
                  ESC
                </kbd>
              )}
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.length > 0 && query.length < 2 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Yana kamida 1 ta belgi kiriting...
                </div>
              )}

              {query.length >= 2 && !loading && results.lessons.length === 0 && results.vocabulary.length === 0 && (
                <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Search className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                  <p>Hech narsa topilmadi.</p>
                </div>
              )}

              {results.lessons.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Darslar
                  </div>
                  <div className="space-y-1">
                    {results.lessons.map(lesson => (
                      <button 
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson.level, lesson.id)}
                        className="w-full text-left px-3 py-3 rounded-xl hover:bg-violet-500/10 hover:text-violet-400 text-slate-300 transition-colors flex flex-col group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-obsidian-800 border border-obsidian-700 px-1.5 py-0.5 rounded text-slate-400 group-hover:border-violet-500/30 group-hover:text-violet-400">{lesson.level}</span>
                          <span className="font-medium text-slate-100 group-hover:text-violet-300">{lesson.title}</span>
                        </div>
                        {lesson.description && (
                          <span className="text-xs text-slate-500 line-clamp-1">{lesson.description}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.vocabulary.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5" /> Kanjilar & Lug'at
                  </div>
                  <div className="space-y-1">
                    {results.vocabulary.map(vocab => (
                      <button 
                        key={vocab.id}
                        onClick={() => handleSelectKanji(vocab.kanji)}
                        className="w-full text-left px-3 py-3 rounded-xl hover:bg-violet-500/10 hover:text-violet-400 text-slate-300 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-jp text-slate-100 group-hover:text-violet-400">{vocab.kanji}</span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{vocab.romaji} ({vocab.hiragana})</span>
                            <span className="text-xs text-slate-500">{vocab.meaningUz}</span>
                          </div>
                        </div>
                        <span className="text-xs bg-obsidian-800 border border-obsidian-700 px-1.5 py-0.5 rounded text-slate-400 group-hover:border-violet-500/30 group-hover:text-violet-400">{vocab.level}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
