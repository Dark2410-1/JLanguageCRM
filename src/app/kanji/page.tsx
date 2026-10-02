import { KanjiExplorer } from "./KanjiExplorer";

export const dynamic = "force-dynamic";

export default function KanjiPage() {
  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 font-jp mb-2">漢字 (Kanji Chizish)</h1>
        <p className="text-slate-400">Yapon kanjilarining to'g'ri chizilish tartibini o'rganing va dinamik ro'yxatdan tanlab mashq qiling.</p>
      </div>
      
      <KanjiExplorer />
    </div>
  );
}
