import { getStudents, getGroups } from "../actions";
import { StudentsTable } from "./StudentsTable";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students = await getStudents();
  const groups = await getGroups();

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Talabalar Boshqaruvi</h1>
          <p className="text-slate-400 text-sm mt-1">Jami {students.length} ta o'quvchi ro'yxatdan o'tgan</p>
        </div>
      </div>
      <StudentsTable students={students} groups={groups} />
    </div>
  );
}
