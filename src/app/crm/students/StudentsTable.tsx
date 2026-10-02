"use client";

import { useState } from "react";
import { addStudent } from "../actions";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Plus, Search, Loader2, User, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudentsTable({ students, groups }: { students: any[], groups: any[] }) {
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.phone && s.phone.includes(search))
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await addStudent(formData);
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
            placeholder="Ism yoki raqam bo'yicha qidiruv..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Add Button & Modal */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="w-full sm:w-auto px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Yangi Talaba
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi Talaba Qo'shish</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">To'liq ism</label>
                <input required name="name" className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg" placeholder="Ali Karimov" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Telefon</label>
                  <input required name="phone" className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg" placeholder="+998901234567" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Daraja (JLPT)</label>
                  <select name="level" className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg">
                    <option value="N5">N5 (Boshlang'ich)</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1 (Yuqori)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email</label>
                <input required type="email" name="email" className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg" placeholder="ali@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Guruh (Ixtiyoriy)</label>
                  <select name="groupId" className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg">
                    <option value="">-- Guruhsiz --</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.jlptTarget})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Status</label>
                  <select name="status" className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg">
                    <option value="active">Faol (To'lagan)</option>
                    <option value="trial">Sinov darsida</option>
                    <option value="suspended">Qarzdor / Muzlatilgan</option>
                  </select>
                </div>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg flex items-center justify-center mt-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Saqlash"}
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
                <th className="px-6 py-4 font-medium">Aloqa</th>
                <th className="px-6 py-4 font-medium">Daraja / Guruh</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Hech narsa topilmadi.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-obsidian-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-obsidian-700 border border-obsidian-600 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-slate-300" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-100">{student.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">Qo'shilgan: {new Date(student.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-300">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {student.phone || "Kiritilmagan"}</span>
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-obsidian-900 border border-obsidian-700 text-violet-500 text-xs font-bold font-jp">
                          {student.currentJlptLevel}
                        </span>
                        <span className="text-sm text-slate-300">
                          {student.group ? student.group.groupName : "Guruhsiz"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border",
                        student.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        student.status === "trial" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {student.status === "active" ? "Faol" : student.status === "trial" ? "Sinov" : "Muzlatilgan"}
                      </span>
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
