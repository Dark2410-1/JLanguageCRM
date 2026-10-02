"use client";

import { useState, useEffect } from "react";
import { KANJI_LIST, KanjiItem } from "@/data/kanji-list";
import { KanjiCanvas } from "./KanjiCanvas";
import { Search, Filter, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function KanjiExplorer() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null);

  const filteredKanji = KANJI_LIST.filter(k => {
    const matchesSearch = k.char.includes(search) || k.meaningUz.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || k.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (selectedKanji) {
    return (
      <div>
        <button 
          onClick={() => setSelectedKanji(null)}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-violet-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Barcha kanjilarga qaytish
        </button>
        <KanjiCanvas kanjiItem={selectedKanji} />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Kanji yoki ma'nosini qidiring (masalan: Quyosh)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div className="relative w-full md:w-48 shrink-0">
          <select 
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full appearance-none bg-obsidian-800 border border-obsidian-700 text-slate-300 pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
          >
            <option value="all">Barcha darajalar</option>
            <option value="N5">JLPT N5</option>
            <option value="N4">JLPT N4</option>
          </select>
          <Filter className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {filteredKanji.map(kanji => (
          <button
            key={kanji.char}
            onClick={() => setSelectedKanji(kanji)}
            className="bg-obsidian-800 border border-obsidian-700 hover:border-violet-500/50 hover:bg-obsidian-700 transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 group shadow-lg"
          >
            <span className="text-4xl text-slate-100 font-jp group-hover:text-violet-500 transition-colors">{kanji.char}</span>
            <span className="text-xs font-medium text-slate-400 truncate w-full text-center">{kanji.meaningUz}</span>
          </button>
        ))}
        {filteredKanji.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            Kanjilar topilmadi
          </div>
        )}
      </div>
    </div>
  );
}
