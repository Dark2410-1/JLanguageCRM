"use client";
import { submitKanjiDraw } from "./actions";

import { useState, useRef, useEffect } from "react";
import { KanjiItem } from "@/data/kanji-list";
import { Undo, RotateCcw, Check, Eye, Volume2, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function KanjiCanvas({ kanjiItem }: { kanjiItem: KanjiItem }) {
  const [paths, setPaths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [mode, setMode] = useState<"practice" | "test">("practice");
  const [lines, setLines] = useState<{x: number, y: number}[][]>([]);
  const [currentLine, setCurrentLine] = useState<{x: number, y: number}[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [result, setResult] = useState<{ score: number, message: string } | null>(null);
  const [animatingStroke, setAnimatingStroke] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Fetch Kanji Data Dynamically
  useEffect(() => {
    async function fetchPaths() {
      setIsLoading(true);
      try {
        const hex = kanjiItem.char.charCodeAt(0).toString(16).padStart(5, '0');
        const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("SVG fetch failed");
        const text = await res.text();
        
        const extractedPaths: string[] = [];
        const regex = /<path[^>]*d="([^"]+)"/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          extractedPaths.push(match[1]);
        }
        setPaths(extractedPaths);
      } catch (err) {
        console.error("Failed to fetch KanjiVG", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPaths();
    clear();
  }, [kanjiItem]);

  // Mode changes reset drawing
  useEffect(() => {
    clear();
    if (mode === "test") {
      setShowGuide(false);
    } else {
      setShowGuide(true);
    }
  }, [mode]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    setCurrentLine([{x, y}]);
    setResult(null);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCurrentLine(prev => [...prev, {x, y}]);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentLine.length > 0) {
      setLines(prev => [...prev, currentLine]);
    }
    setCurrentLine([]);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const undo = () => {
    setLines(prev => prev.slice(0, -1));
    setResult(null);
  };

  const clear = () => {
    setLines([]);
    setCurrentLine([]);
    setResult(null);
  };

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#fff";

    const allLines = [...lines];
    if (currentLine.length > 0) allLines.push(currentLine);

    // Scale context since KanjiVG uses 109x109 but our canvas is 400x400
    // Actually, drawing directly on 400x400 without scale is fine because user coordinates are 0-400
    
    allLines.forEach(line => {
      if (line.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(line[0].x, line[0].y);
      for (let i = 1; i < line.length; i++) {
        ctx.lineTo(line[i].x, line[i].y);
      }
      ctx.stroke();
    });
  }, [lines, currentLine]);

const checkDrawing = async () => {
    if (lines.length === 0) {
      setResult({ score: 0, message: "Avval kanjini chizing!" });
      return;
    }

    if (paths.length === 0) return; // Not loaded

    if (lines.length === paths.length) {
      setResult({ score: 95, message: mode === "test" ? "Mukammal! Siz to'g'ri chizdingiz." : "Ajoyib! Chiziqlar soni va tartibi to'g'ri." });
      
      // Muvaffaqiyatli kanji chizilgani uchun XP berish (Server Action chaqiruvi)
      try {
        await submitKanjiDraw();
      } catch(e) {}

    } else if (Math.abs(lines.length - paths.length) === 1) {
      setResult({ score: 70, message: "Yaxshi, lekin chiziqlar sonida ozgina xato bor." });
    } else {
      setResult({ score: 40, message: `Qaytadan urinib ko'ring. Aslida ${paths.length} ta chiziq bor, sizda ${lines.length} ta.` });
    }
  };

  const triggerAnimation = () => {
    if (mode === "test") return;
    setAnimatingStroke(false);
    setTimeout(() => {
      setShowGuide(true);
      setAnimatingStroke(true);
    }, 50);
  };

  const playAudio = async (text: string) => {
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
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-obsidian-700 rounded-3xl bg-obsidian-800">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
        <p className="text-slate-400">KanjiVG API orqali ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Chap tomon: Canvas */}
      <div className="w-full lg:w-[400px] shrink-0 flex flex-col items-center">
        
        {/* Mode Switch */}
        <div className="w-full flex items-center bg-obsidian-800 rounded-xl p-1 mb-4 border border-obsidian-700">
          <button 
            onClick={() => setMode("practice")}
            className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-colors", mode === "practice" ? "bg-obsidian-900 text-violet-500 shadow" : "text-slate-400 hover:text-slate-200")}
          >
            Mashq qilish
          </button>
          <button 
            onClick={() => setMode("test")}
            className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-colors", mode === "test" ? "bg-red-500/20 text-red-400 shadow" : "text-slate-400 hover:text-slate-200")}
          >
            Imtihon rejimi
          </button>
        </div>

        {/* Genkouyoushi Grid Canvas Wrapper */}
        <div className="relative w-full aspect-square bg-[#1a1a24] border-2 border-obsidian-600 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] touch-none">
          
          {/* Grid orqa foni */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-1/2 border-b border-dashed border-slate-400"></div>
            <div className="absolute inset-0 w-1/2 border-r border-dashed border-slate-400"></div>
          </div>

          {/* SVG Guide Overlay - KanjiVG uses 109x109 box */}
          {(showGuide || animatingStroke) && mode !== "test" && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none opacity-30 text-violet-500 transform scale-90" 
              viewBox="0 0 109 109"
            >
              {paths.map((path, idx) => (
                <path 
                  key={`${kanjiItem.char}-${idx}`} 
                  d={path} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  strokeLinecap="round"
                  className={animatingStroke ? "animate-draw-stroke" : ""}
                  style={animatingStroke ? {
                    strokeDasharray: 300,
                    strokeDashoffset: 300,
                    animation: `draw-stroke 1s ease-in-out forwards ${idx * 0.8}s`
                  } : undefined}
                />
              ))}
            </svg>
          )}

          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="absolute inset-0 w-full h-full z-10 cursor-crosshair touch-none"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between w-full mt-4 bg-obsidian-800 p-2 rounded-xl border border-obsidian-700">
          <div className="flex gap-2">
            <button onClick={undo} className="p-3 bg-obsidian-900 rounded-lg text-slate-400 hover:text-white transition-colors" title="Orqaga">
              <Undo className="w-5 h-5" />
            </button>
            <button onClick={clear} className="p-3 bg-obsidian-900 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Tozalash">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                if (mode === "test") return;
                if (!animatingStroke) {
                  triggerAnimation();
                } else {
                  setShowGuide(!showGuide);
                  setAnimatingStroke(false);
                }
              }} 
              disabled={mode === "test"}
              className={cn(
                "p-3 rounded-lg transition-colors", 
                mode === "test" ? "opacity-50 cursor-not-allowed bg-obsidian-900 text-slate-500" :
                (showGuide || animatingStroke ? "bg-violet-500/20 text-violet-500" : "bg-obsidian-900 text-slate-400 hover:text-white")
              )} 
              title="Yordamchini ko'rsatish"
            >
              {mode === "test" ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button onClick={checkDrawing} className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
            <Check className="w-5 h-5" /> Tekshirish
          </button>
        </div>
      </div>

      {/* O'ng tomon: Ma'lumot va Natija */}
      <div className="flex-1 bg-obsidian-800 border border-obsidian-700 rounded-3xl p-8 w-full">
        <div className="flex justify-between items-start mb-6 border-b border-obsidian-700 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-obsidian-900 px-2 py-1 rounded text-xs font-bold text-slate-400 border border-obsidian-700">
                {kanjiItem.level}
              </span>
              <span className="text-violet-500 font-medium">{kanjiItem.category}</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-100 font-jp mb-2">{kanjiItem.char}</h2>
            <p className="text-xl text-slate-300">{kanjiItem.meaningUz}</p>
          </div>
          <button 
            onClick={() => playAudio(kanjiItem.char)}
            className="p-4 rounded-2xl bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors"
          >
            <Volume2 className="w-8 h-8" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-obsidian-900 p-4 rounded-2xl border border-obsidian-700">
            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Onyomi (Xitoycha)</span>
            <span className="text-lg text-slate-200 font-medium">{kanjiItem.onyomi}</span>
          </div>
          <div className="bg-obsidian-900 p-4 rounded-2xl border border-obsidian-700">
            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Kunyomi (Yaponcha)</span>
            <span className="text-lg text-slate-200 font-medium">{kanjiItem.kunyomi}</span>
          </div>
        </div>

        {/* Natija oynasi */}
        {result && (
          <div className={cn(
            "p-6 rounded-2xl border transition-all animate-in zoom-in-95",
            result.score >= 90 ? "bg-green-500/10 border-green-500/20 text-green-400" :
            result.score >= 60 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
            "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-xl",
                result.score >= 90 ? "border-green-500/30" : result.score >= 60 ? "border-yellow-500/30" : "border-red-500/30"
              )}>
                {result.score}%
              </div>
              <div>
                <h4 className="font-bold text-lg mb-0.5">Natija {mode === "test" && "(Imtihon)"}</h4>
                <p className="text-sm opacity-90">{result.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



