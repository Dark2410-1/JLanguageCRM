"use client";

import { useState } from "react";
import { addPayment } from "../actions";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Loader2, CreditCard, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentsTable({ initialPayments, students, groups }: { initialPayments: any[], students: any[], groups: any[] }) {
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const filteredPayments = initialPayments.filter(p => 
    p.studentName?.toLowerCase().includes(search.toLowerCase()) || 
    p.periodMonth.includes(search)
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await addPayment(formData);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Talaba ismi yoki Oylar bo'yicha qidiruv (YYYY-MM)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Add Payment Button & Modal */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="w-full sm:w-auto px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> To'lov Qo'shish
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>To'lov Qabul Qilish</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Talabani tanlang</label>
                <select required name="studentId" className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg">
                  <option value="">-- Tanlang --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">To'lov Summasi (So'm)</label>
                  <input required type="number" name="amount" defaultValue={400000} className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">To'lov oyi (Masalan: 2026-10)</label>
                  <input required name="periodMonth" defaultValue="2026-10" className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Status</label>
                <select name="status" className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg">
                  <option value="completed">To'langan (Completed)</option>
                  <option value="pending">Kutilmoqda (Pending)</option>
                  <option value="failed">Qarzdor (Failed)</option>
                </select>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg flex items-center justify-center mt-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Qo'shish"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-obsidian-800 border border-obsidian-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-obsidian-900/50 text-slate-400 text-xs uppercase tracking-wider border-b border-obsidian-700">
                <th className="px-6 py-4 font-medium">Talaba</th>
                <th className="px-6 py-4 font-medium">Oy</th>
                <th className="px-6 py-4 font-medium">Summa</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Hech narsa topilmadi.</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-obsidian-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-100">{payment.studentName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{payment.groupName || "Guruhsiz"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-obsidian-900 border border-obsidian-700 text-slate-300 text-xs font-bold">
                        {payment.periodMonth}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-200">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        {payment.amount.toLocaleString()} so'm
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-max",
                        payment.status === "completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        payment.status === "pending" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {payment.status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                         payment.status === "pending" ? <Clock className="w-3.5 h-3.5" /> : 
                         <AlertCircle className="w-3.5 h-3.5" />}
                        
                        {payment.status === "completed" ? "To'langan" : 
                         payment.status === "pending" ? "Kutilmoqda" : "Qarzdor"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "-"}
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
