import { getPayments, getStudents, getGroups } from "../actions";
import { PaymentsTable } from "./PaymentsTable";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const payments = await getPayments();
  const students = await getStudents();
  const groups = await getGroups();

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">To'lovlar Boshqaruvi</h1>
          <p className="text-slate-400 text-sm mt-1">Oylik tushumlar va qarzlar ro'yxati</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-obsidian-800 border border-obsidian-700 p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Jami tushum (Bu oy)</p>
          <h3 className="text-2xl font-bold text-green-400">
            {payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0).toLocaleString()} so'm
          </h3>
        </div>
        <div className="bg-obsidian-800 border border-obsidian-700 p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Kutilayotgan tushum</p>
          <h3 className="text-2xl font-bold text-blue-400">
            {payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0).toLocaleString()} so'm
          </h3>
        </div>
        <div className="bg-obsidian-800 border border-obsidian-700 p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Qarzdorlik / Bekor qilingan</p>
          <h3 className="text-2xl font-bold text-red-400">
            {payments.filter(p => p.status === 'failed').reduce((acc, p) => acc + p.amount, 0).toLocaleString()} so'm
          </h3>
        </div>
      </div>

      <PaymentsTable initialPayments={payments} students={students} groups={groups} />
    </div>
  );
}
