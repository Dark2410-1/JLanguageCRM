import { db } from "@/db";
import { lessons } from "@/db/schema";
import { desc } from "drizzle-orm";
import CoursesClient from "./CoursesClient";
import { PlayCircle, Trash2 } from "lucide-react";
import { deleteLesson } from "./actions";

export default async function AdminCoursesPage() {
  const allLessons = await db.select().from(lessons).orderBy(desc(lessons.createdAt));

  return (
    <div className="space-y-6">
      <CoursesClient />
      
      {/* Server Rendered Table */}
      <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-obsidian-900/50 text-slate-400 font-medium border-b border-obsidian-700">
              <tr>
                <th className="px-6 py-4">Tartib</th>
                <th className="px-6 py-4">Daraja</th>
                <th className="px-6 py-4">Dars nomi</th>
                <th className="px-6 py-4">Video/Audio</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-700">
              {allLessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Hali darslar kiritilmagan.</td>
                </tr>
              ) : (
                allLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-obsidian-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono">{lesson.order}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 font-bold text-xs border border-violet-500/20">
                        {lesson.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-200">{lesson.title}</p>
                      <p className="text-xs text-slate-500">{lesson.romajiTitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      {lesson.audioUrl ? (
                        <a href={lesson.audioUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          <PlayCircle className="w-4 h-4" /> Ko'rish
                        </a>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        "use server";
                        await deleteLesson(lesson.id);
                      }}>
                        <button type="submit" className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
