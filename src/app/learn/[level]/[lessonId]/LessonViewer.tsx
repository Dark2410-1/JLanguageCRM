"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markLessonComplete } from "../../actions";
import { CheckCircle2, Circle, Lock, PlayCircle, Loader2, ArrowRight, Volume2, StopCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LessonViewer({ data, level }: { data: any, level: string }) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const { lesson, sidebarLessons, isCompleted } = data;

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const res = await markLessonComplete(lesson.id, level);
      if (res.nextLessonId) {
        router.push(`/learn/${level}/${res.nextLessonId}`);
      } else {
        router.push(`/learn`);
      }
    } catch (err) {
      console.error(err);
      setIsCompleting(false);
    }
  };

  const playAudio = async (text: string) => {
    if (playingText === text && audioEl) {
      audioEl.pause();
      setPlayingText(null);
      return;
    }

    if (audioEl) audioEl.pause();
    setPlayingText(text);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        setAudioEl(audio);
        audio.onended = () => setPlayingText(null);
        audio.onerror = () => setPlayingText(null);
        audio.play();
      } else {
        setPlayingText(null);
      }
    } catch {
      setPlayingText(null);
    }
  };

  // Matnni tahlil qilib, yaponcha bo'limlarga ovozli tugma qo'shish
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, idx) => {
      // Yaponcha matnlar uchun oddiy hekistik yondashuv (agar ichida hiragana/katakana/kanji bo'lsa)
      const hasJapanese = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/.test(block);
      
      return (
        <div key={idx} className="mb-6 relative group">
          {block.split('\n').map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return <h3 key={lIdx} className="text-xl font-bold text-slate-100 mt-8 mb-4 border-b border-obsidian-700 pb-2">{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('- **')) {
               const parts = line.split('**');
               return (
                 <div key={lIdx} className="flex items-start gap-2 mb-3 bg-obsidian-800/50 p-3 rounded-lg border border-obsidian-700 hover:border-violet-500/30 transition-colors">
                   <div className="flex-1">
                     <span className="font-bold text-slate-200 text-lg">{parts[1]}</span>
                     <span className="text-slate-400 ml-2">{parts[2].replace(' - ', '')}</span>
                   </div>
                   <button 
                     onClick={() => playAudio(parts[1])}
                     className="p-2 rounded-md bg-obsidian-900 text-slate-400 hover:text-violet-500 border border-obsidian-700 transition-colors shrink-0"
                   >
                     {playingText === parts[1] ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                   </button>
                 </div>
               );
            }
            return <p key={lIdx} className="text-slate-300 leading-relaxed mb-2 font-jp text-lg">{line}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar TOC */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="bg-obsidian-800 border border-obsidian-700 rounded-2xl p-5 sticky top-24">
          <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Book className="w-4 h-4 text-violet-500" /> Darslar Mundarijasi
          </h3>
          <div className="space-y-1">
            {sidebarLessons.map((l: any, idx: number) => {
              const isActive = l.id === lesson.id;
              
              return (
                <div key={l.id}>
                  {l.isLocked ? (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 opacity-70">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span className="truncate">{l.order}. {l.title}</span>
                    </div>
                  ) : (
                    <Link 
                      href={`/learn/${level}/${l.id}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-violet-500/10 text-violet-500" 
                          : "text-slate-300 hover:bg-obsidian-700 hover:text-slate-100"
                      )}
                    >
                      {l.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                      ) : isActive ? (
                        <PlayCircle className="w-4 h-4 shrink-0 text-violet-500" />
                      ) : (
                        <Circle className="w-4 h-4 shrink-0" />
                      )}
                      <span className="truncate">{l.order}. {l.title}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl">
        <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-obsidian-700 bg-obsidian-900/50">
            <div className="flex items-center gap-2 text-violet-500 text-sm font-bold mb-3 tracking-wider">
              <span>{level} DARAJA</span>
              <span>•</span>
              <span>{lesson.order}-DARS</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">{lesson.title}</h1>
            <p className="text-slate-400 font-jp">{lesson.romajiTitle}</p>
          </div>

          {/* Video Placeholder (Optional) */}
          <div className="w-full aspect-video bg-obsidian-900 border-b border-obsidian-700 flex flex-col items-center justify-center text-slate-500 relative overflow-hidden group">
            <PlayCircle className="w-16 h-16 mb-4 opacity-50 group-hover:opacity-100 transition-opacity text-slate-300 group-hover:text-violet-500" />
            <p className="font-medium">Video darslik bu yerda bo'ladi</p>
          </div>

          {/* Content Body */}
          <div className="p-8 sm:p-10">
            <div className="prose prose-invert prose-slate max-w-none">
              {renderContent(lesson.content)}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-end">
          {isCompleted ? (
            <div className="px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-lg bg-green-500/20 text-green-400 border border-green-500/30">
              <CheckCircle2 className="w-5 h-5" />
              Dars yakunlangan
            </div>
          ) : (
            <Link
              href={`/learn/${level}/${lesson.id}/quiz`}
              className="px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-lg transition-all bg-violet-500 text-white hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-500/20"
            >
              <PlayCircle className="w-5 h-5" />
              Testni boshlash
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Add Book icon since it was used but not imported from lucide-react initially in my thought
import { Book } from "lucide-react";
