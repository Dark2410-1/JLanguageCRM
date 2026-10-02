"use client";

import { useState, useEffect } from "react";
import { getDueCards, reviewCard } from "./actions";
import { Loader2, RefreshCw, Volume2, Eye, PlayCircle, Filter, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SrsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New States
  const [cramMode, setCramMode] = useState(false);
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    loadCards();
  }, [cramMode, levelFilter]);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const data = await getDueCards(levelFilter, cramMode);
      setCards(data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (rating: "hard" | "good" | "easy") => {
    if (isSubmitting || cards.length === 0) return;
    setIsSubmitting(true);
    try {
      const currentCard = cards[currentIndex];
      await reviewCard(currentCard.id, rating, cramMode);
      
      // Next card logic
      if (currentIndex < cards.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => prev + 1), 150); // slight delay for smooth flip back
      } else {
        await loadCards(); // Reload if done
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const playAudio = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
        <p className="text-slate-400">Kartalar yuklanmoqda...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center border-2 border-violet-500/20 text-violet-500 mb-2">
          <Zap className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Ajoyib!</h2>
          <p className="text-slate-400 max-w-sm">Bugungi barcha kartalarni takrorlab bo'ldingiz yoki bu darajada so'z qolmadi.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button 
            onClick={() => { setCramMode(false); loadCards(); }}
            className="px-6 py-3 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 text-slate-300 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" /> Yangilash
          </button>
          
          <button 
            onClick={() => setCramMode(true)}
            className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
          >
            <Zap className="w-5 h-5" /> Erkin Takrorlash (Cram Mode)
          </button>
        </div>

        {/* Filter on Empty Screen */}
        <div className="mt-8 flex items-center gap-2 text-sm">
          <span className="text-slate-500">Daraja:</span>
          <select 
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-obsidian-900 border border-obsidian-700 text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-violet-500"
          >
            <option value="all">Barcha darajalar</option>
            <option value="N5">JLPT N5</option>
            <option value="N4">JLPT N4</option>
          </select>
        </div>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header / Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Lug'at (SRS)
            {cramMode && <span className="bg-violet-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">CRAM MODE</span>}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {cramMode ? "Erkin takrorlash rejimi (Cheklovsiz)" : `Bugun ${cards.length} ta karta takrorlanishi kerak`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Level Filter Dropdown */}
          <div className="relative group">
            <select 
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="appearance-none bg-obsidian-800 border border-obsidian-700 text-slate-300 pl-8 pr-4 py-2 rounded-xl focus:outline-none focus:border-violet-500 text-sm font-medium transition-colors cursor-pointer"
            >
              <option value="all">Barchasi</option>
              <option value="N5">JLPT N5</option>
              <option value="N4">JLPT N4</option>
            </select>
            <Filter className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-violet-500 transition-colors" />
          </div>

          <span className="text-xs font-bold text-slate-300 bg-obsidian-800 px-3 py-2 rounded-xl border border-obsidian-700 whitespace-nowrap">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      <div className="w-full bg-obsidian-800 h-1.5 rounded-full mb-8 overflow-hidden relative">
        <div 
          className={cn(
            "h-full transition-all duration-500 ease-out",
            cramMode ? "bg-orange-500" : "bg-violet-500"
          )}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* 3D Flip Card */}
      <div 
        className="relative w-full aspect-[4/3] sm:aspect-video perspective-1000 cursor-pointer"
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <div className={cn(
          "w-full h-full transition-transform duration-500 preserve-3d relative",
          isFlipped && "rotate-y-180"
        )}>
          
          {/* FRONT */}
          <div className={cn(
            "absolute w-full h-full bg-obsidian-800 border rounded-3xl backface-hidden shadow-2xl flex flex-col items-center justify-center p-8 text-center group transition-colors",
            cramMode ? "border-orange-500/20 hover:border-orange-500/40" : "border-obsidian-700 hover:border-violet-500/30"
          )}>
            {/* Level Badge */}
            <div className="absolute top-6 left-6 text-xs font-bold text-slate-500 bg-obsidian-900 px-2 py-1 rounded-md border border-obsidian-700">
              {card.level}
            </div>

            <button 
              onClick={(e) => playAudio(e, card.kanji)}
              className="absolute top-6 right-6 p-3 rounded-xl bg-obsidian-700 text-slate-300 hover:text-violet-500 hover:bg-violet-500/10 transition-colors"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <p className="text-2xl text-slate-400 mb-4 font-jp">{card.hiragana}</p>
            <h2 className="text-7xl font-bold text-slate-100 font-jp tracking-wider">{card.kanji}</h2>
            
            {!isFlipped && (
              <div className="absolute bottom-6 flex items-center gap-2 text-slate-500 text-sm opacity-50 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" /> Javobni ko'rish uchun bosing
              </div>
            )}
          </div>

          {/* BACK */}
          <div className={cn(
            "absolute w-full h-full bg-obsidian-900 border rounded-3xl backface-hidden rotate-y-180 flex flex-col justify-center p-8 sm:p-12",
            cramMode ? "border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.1)]" : "border-violet-500/30 shadow-[0_0_40px_rgba(139,92,246,0.1)]"
          )}>
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-obsidian-700">
              <div>
                <h2 className="text-4xl font-bold text-slate-100 font-jp mb-2">{card.kanji}</h2>
                <p className="text-violet-500 font-medium">{card.hiragana}</p>
              </div>
              <button 
                onClick={(e) => playAudio(e, card.kanji)}
                className="p-3 rounded-xl bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors"
              >
                <PlayCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ma'nosi</span>
                <p className="text-xl text-slate-200 mt-1">{card.meaningUz}</p>
              </div>
              
              {card.examples && (card.examples as any).length > 0 && (
                <div className="pt-4 mt-4 border-t border-obsidian-800">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Misol</span>
                  <p className="text-lg text-slate-200 font-jp mb-1">{(card.examples as any)[0].jp}</p>
                  <p className="text-sm text-slate-400">{(card.examples as any)[0].uz}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center justify-center gap-4 mt-10 transition-all duration-300",
        isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <button 
          disabled={isSubmitting}
          onClick={() => handleReview("hard")}
          className="flex-1 py-4 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 rounded-2xl text-red-400 font-medium transition-all"
        >
          Qiyin <span className="block text-xs text-slate-500 mt-1">{cramMode ? "Yodlanmadi" : "Yana qaytarish"}</span>
        </button>
        <button 
          disabled={isSubmitting}
          onClick={() => handleReview("good")}
          className="flex-1 py-4 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 rounded-2xl text-blue-400 font-medium transition-all"
        >
          Yaxshi <span className="block text-xs text-slate-500 mt-1">{cramMode ? "Eslab qoldim" : "O'rgandim"}</span>
        </button>
        <button 
          disabled={isSubmitting}
          onClick={() => handleReview("easy")}
          className="flex-1 py-4 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 rounded-2xl text-green-400 font-medium transition-all"
        >
          Oson <span className="block text-xs text-slate-500 mt-1">{cramMode ? "Juda oson" : "Uzoqdan so'rash"}</span>
        </button>
      </div>
    </div>
  );
}
