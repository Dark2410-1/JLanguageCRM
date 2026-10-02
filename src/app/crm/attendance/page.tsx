import { getGroups } from "../actions";
import { AttendanceManager } from "./AttendanceManager";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const groups = await getGroups();

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Davomat Tizimi</h1>
          <p className="text-slate-400 text-sm mt-1">Guruh va sanani tanlab davomat qiling</p>
        </div>
      </div>
      
      {groups.length === 0 ? (
        <div className="bg-obsidian-800 border border-obsidian-700 p-8 rounded-2xl text-center">
          <p className="text-slate-400">Hozircha guruhlar yo'q. Bazaga guruh qo'shing.</p>
        </div>
      ) : (
        <AttendanceManager groups={groups} />
      )}
    </div>
  );
}
