import { getQuizData } from "../../../actions";
import { QuizEngine } from "./QuizEngine";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function QuizPage({ params }: { params: { level: string, lessonId: string } }) {
  const { level, lessonId } = await params;
  const questions = await getQuizData(lessonId);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 h-full flex flex-col">
      <Link 
        href={`/learn/${level}/${lessonId}`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-500 transition-colors mb-6"
      >
        <ChevronLeft className="w-5 h-5" /> Darsga qaytish
      </Link>
      
      <QuizEngine questions={questions} lessonId={lessonId} level={level} />
    </div>
  );
}
