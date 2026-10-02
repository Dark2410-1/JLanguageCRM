import { getLessonData } from "../../actions";
import { LessonViewer } from "./LessonViewer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ level: string, lessonId: string }> }) {
  const resolvedParams = await params;
  const data = await getLessonData(resolvedParams.level, resolvedParams.lessonId);

  return (
    <div className="py-6">
      <Link 
        href="/learn"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-violet-500 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Barcha kurslarga qaytish
      </Link>

      <LessonViewer data={data} level={resolvedParams.level} />
    </div>
  );
}
