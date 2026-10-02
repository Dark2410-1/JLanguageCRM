import { db } from "@/db";
import { vocabulary } from "@/db/schema";
import { desc } from "drizzle-orm";
import VocabClient from "./VocabClient";
import { Trash2 } from "lucide-react";
import { deleteVocabulary } from "./actions";

export default async function AdminVocabularyPage() {
  const allVocab = await db.select().from(vocabulary).orderBy(desc(vocabulary.createdAt));

  return (
    <div className="space-y-6">
      <VocabClient />
      
      {/* Server Rendered Table */}
      <div className="bg-obsidian-800 border border-obsidian-700 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-obsidian-900/50 text-slate-400 font-medium border-b border-obsidian-700">
              <tr>
                <th className="px-6 py-4">JLPT</th>
                <th className="px-6 py-4">Kanji</th>
                <th className="px-6 py-4">Hiragana / Romaji</th>
                <th className="px-6 py-4">O'zbekcha</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-700">
              {allVocab.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Hali so'zlar kiritilmagan.</td>
                </tr>
              ) : (
                allVocab.map((word) => (
                  <tr key={word.id} className="hover:bg-obsidian-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-xs border border-blue-500/20">
                        {word.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-jp text-lg font-bold text-slate-100">
                      {word.kanji}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-jp text-slate-200">{word.hiragana}</p>
                      <p className="text-xs text-slate-500">{word.romaji}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-300">{word.meaningUz}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        "use server";
                        await deleteVocabulary(word.id);
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
