"use client";

import { useSenseiChat } from "@/hooks/useSenseiChat";
import { Send, Bot, User, Volume2, Square, MessageSquare, BookOpen, PenTool, Loader2, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function SenseiPage() {
  const { messages, input, setInput, isLoading, sendMessage, stop, mode, setMode } = useSenseiChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePlayAudio = async (msgId: string, content: string) => {
    if (playingId === msgId || loadingAudioId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingId(null);
      setLoadingAudioId(null);
      return;
    }

    setLoadingAudioId(msgId);

    // Yaponcha matnni ajratib olish (Kanji, Hiragana, Katakana va Tinish belgilari)
    const japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]+/g;
    const matches = content.match(japaneseRegex);
    const jpText = matches ? matches.join(" ") : "";

    if (!jpText) {
      setLoadingAudioId(null);
      return;
    }

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jpText })
      });

      if (!res.ok) throw new Error("Audio error");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => {
        setPlayingId(null);
        setLoadingAudioId(null);
      };
      
      setLoadingAudioId(null);
      setPlayingId(msgId);
      await audio.play();
    } catch (err) {
      console.error(err);
      setPlayingId(null);
      setLoadingAudioId(null);
    }
  };

  const modes = [
    { id: "free", label: "Suhbat", icon: MessageSquare },
    { id: "grammar", label: "Grammatika", icon: PenTool },
    { id: "kanji", label: "Kanji tahlili", icon: BookOpen },
  ] as const;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] bg-obsidian-800 border border-obsidian-700 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Header & Modes */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-obsidian-700 bg-obsidian-900/50">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
            <Bot className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 leading-tight">Sensei AI</h2>
            <p className="text-xs text-violet-500">Doimo yordamga tayyor</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-obsidian-900 p-1 rounded-lg border border-obsidian-700">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === m.id 
                  ? "bg-obsidian-700 text-slate-100 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-obsidian-800"
              )}
            >
              <m.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-obsidian-900/20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <Bot className="w-16 h-16 text-obsidian-700" />
            <p className="text-center max-w-sm">
              Sensei AI ga xush kelibsiz. <br/>
              Savolingizni yoki tekshirish kerak bo'lgan gapingizni yozing.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-4 max-w-3xl",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-1">
                {msg.role === "user" ? (
                  <div className="w-8 h-8 rounded-lg bg-obsidian-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-300" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                    <Bot className="w-5 h-5 text-violet-500" />
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "flex flex-col gap-1",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-4 py-3 rounded-2xl whitespace-pre-wrap font-jp leading-relaxed",
                  msg.role === "user" 
                    ? "bg-obsidian-700 text-slate-100 rounded-tr-sm" 
                    : "bg-obsidian-800 border border-obsidian-700 text-slate-200 rounded-tl-sm shadow-sm"
                )}>
                  {msg.content}
                </div>

                {/* AI Actions (Audio / Copy) */}
                {msg.role === "assistant" && msg.content && (
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => handlePlayAudio(msg.id, msg.content)}
                      className={cn(
                        "transition-colors flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border",
                        playingId === msg.id 
                          ? "bg-violet-500/20 text-violet-500 border-violet-500/30"
                          : "bg-obsidian-800 text-slate-400 hover:text-violet-500 border-obsidian-700"
                      )}
                    >
                      {loadingAudioId === msg.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : playingId === msg.id ? (
                        <StopCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      {loadingAudioId === msg.id ? "Yuklanmoqda..." : playingId === msg.id ? "To'xtatish" : "Tinglash"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-obsidian-800 border-t border-obsidian-700">
        <form 
          onSubmit={sendMessage}
          className="relative max-w-4xl mx-auto flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              mode === "kanji" ? "Kanji yoki so'z kiriting..." : 
              mode === "grammar" ? "Yaponcha gap kiriting (tekshirish uchun)..." : 
              "Yapon tilida suhbatlashing..."
            }
            className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 rounded-xl px-4 py-3 min-h-[52px] max-h-32 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all scrollbar-hide font-jp"
            rows={1}
          />
          
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="shrink-0 h-[52px] w-[52px] rounded-xl bg-obsidian-700 flex items-center justify-center text-slate-300 hover:text-violet-500 transition-colors"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="shrink-0 h-[52px] w-[52px] rounded-xl bg-violet-500 flex items-center justify-center text-white hover:bg-violet-600 transition-all disabled:opacity-50 disabled:hover:bg-violet-500"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </form>
        <p className="text-center text-xs text-slate-500 mt-2">
          Sensei AI ba'zida xato qilishi mumkin. Muhim ma'lumotlarni tekshiring.
        </p>
      </div>
    </div>
  );
}
