"use client";

import { useState } from "react";
import { submitQuiz } from "../../../actions";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Volume2, ArrowRight, RefreshCw, Award, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  type: "multiple_choice" | "listening" | "reading";
  question: string;
  audioText?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export function QuizEngine({ questions, lessonId, level }: { questions: Question[], lessonId: string, level: string }) {
  const router = useRouter();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [passed, setPassed] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

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

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    
    if (option === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz finished
      setIsSubmitting(true);
      setShowResult(true);
      try {
        const finalScore = selectedOption === currentQuestion.correctAnswer ? score + 1 : score;
        const res = await submitQuiz(lessonId, level, finalScore, questions.length);
        setPassed(res.passed);
        setNextLessonId(res.nextLessonId);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const retry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
    setPassed(false);
    setNextLessonId(null);
  };

  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        <div className={cn(
          "w-full max-w-md bg-obsidian-800 border rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl",
          passed ? "border-green-500/30" : "border-red-500/30"
        )}>
          {isSubmitting && (
            <div className="absolute inset-0 bg-obsidian-800/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
              <p className="text-slate-300 font-medium">Natija saqlanmoqda...</p>
            </div>
          )}
          
          <div className={cn(
            "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border-4 shadow-lg",
            passed ? "bg-green-500/10 border-green-500 text-green-400 shadow-green-500/20" : "bg-red-500/10 border-red-500 text-red-400 shadow-red-500/20"
          )}>
            <Award className="w-12 h-12" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-100 mb-2">
            {passed ? "Muvaffaqiyatli!" : "Yana urinib ko'ring"}
          </h2>
          <p className="text-slate-400 mb-6">
            Siz {questions.length} ta savoldan {score} tasiga to'g'ri javob berdingiz.
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block mb-1">Aniqlik</span>
              <span className={cn(
                "text-4xl font-bold font-mono",
                passed ? "text-green-400" : "text-red-400"
              )}>{accuracy}%</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {passed ? (
              <button 
                onClick={() => router.push(nextLessonId ? `/learn/${level}/${nextLessonId}` : `/learn`)}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
              >
                {nextLessonId ? "Keyingi darsga o'tish" : "Kurslarga qaytish"} <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={retry}
                className="w-full py-4 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" /> Qaytadan topshirish
              </button>
            )}
            
            <button 
              onClick={() => router.push(`/learn/${level}/${lessonId}`)}
              className="w-full py-4 bg-obsidian-900 hover:bg-obsidian-700 text-slate-300 font-medium rounded-xl border border-obsidian-700 transition-colors"
            >
              Darsni qayta o'qish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Savol {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-slate-500">
            JLPT Test Formati
          </span>
        </div>
        <div className="w-full bg-obsidian-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl p-6 sm:p-10 shadow-2xl flex-1 flex flex-col">
        
        {/* Question Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-obsidian-900 border border-obsidian-700 px-3 py-1.5 rounded-lg mb-4">
            {currentQuestion.type === "listening" && <Volume2 className="w-4 h-4 text-blue-400" />}
            {currentQuestion.type === "reading" && <span className="text-orange-400 font-bold font-jp">漢</span>}
            {currentQuestion.type === "multiple_choice" && <span className="text-green-400 font-bold font-mono">A/B</span>}
            <span className="text-xs font-medium text-slate-300">
              {currentQuestion.type === "listening" ? "Tinglab tushunish" : 
               currentQuestion.type === "reading" ? "Kanji o'qilishi" : "To'g'ri variantni tanlang"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-jp leading-snug">
            {currentQuestion.question}
          </h2>
          
          {currentQuestion.type === "listening" && currentQuestion.audioText && (
            <button 
              onClick={() => playAudio(currentQuestion.audioText!)}
              className="mt-6 px-6 py-4 w-full sm:w-auto bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors group"
            >
              <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Ovozni eshitish
            </button>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            
            let btnClass = "bg-obsidian-900 border-obsidian-700 text-slate-200 hover:border-violet-500/50 hover:bg-obsidian-800";
            let icon = null;

            if (isAnswered) {
              if (isCorrect) {
                btnClass = "bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                icon = <CheckCircle className="w-5 h-5" />;
              } else if (isSelected) {
                btnClass = "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
                icon = <XCircle className="w-5 h-5" />;
              } else {
                btnClass = "bg-obsidian-900/50 border-obsidian-800 text-slate-600 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(option)}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left font-medium text-lg font-jp transition-all duration-300 flex justify-between items-center",
                  btnClass,
                  !isAnswered && "cursor-pointer active:scale-[0.98]"
                )}
              >
                <span>{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next Action */}
        <div className={cn(
          "mt-8 pt-6 border-t border-obsidian-700 transition-all duration-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
          isAnswered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none hidden"
        )}>
          <div className="flex-1">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Tushuntirish</span>
            <p className="text-slate-300 text-sm">{currentQuestion.explanation}</p>
          </div>
          
          <button 
            onClick={handleNext}
            className="w-full sm:w-auto shrink-0 px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-500/20"
          >
            {currentIndex < questions.length - 1 ? "Keyingi savol" : "Natijani ko'rish"} <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
