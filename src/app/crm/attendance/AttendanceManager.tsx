"use client";

import { useState, useEffect } from "react";
import { getAttendance, markAttendance } from "../actions";
import { Loader2, Check, X, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function AttendanceManager({ groups }: { groups: any[] }) {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState<string | null>(null);

  useEffect(() => {
    if (selectedGroup && selectedDate) {
      loadAttendance();
    }
  }, [selectedGroup, selectedDate]);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const data = await getAttendance(selectedGroup, selectedDate);
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMark = async (studentId: string, status: "present" | "absent" | "excused" | "late") => {
    setLoadingStudent(studentId);
    try {
      await markAttendance(selectedGroup, studentId, selectedDate, status);
      await loadAttendance(); // re-fetch to get updated UI
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-obsidian-800 p-4 rounded-2xl border border-obsidian-700">
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1">Guruh</label>
          <select 
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 px-3 py-2 rounded-lg"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.jlptTarget})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1">Sana</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-obsidian-900 border border-obsidian-700 text-slate-100 pl-10 pr-3 py-2 rounded-lg [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      <div className="bg-obsidian-800 border border-obsidian-700 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Ushbu guruhda o'quvchilar yo'q.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-obsidian-900/50 text-slate-400 text-xs uppercase tracking-wider border-b border-obsidian-700">
                  <th className="px-6 py-4 font-medium">Talaba</th>
                  <th className="px-6 py-4 font-medium">Holat (Bugun)</th>
                  <th className="px-6 py-4 font-medium text-right">Belgilash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-700">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-obsidian-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-100">
                      {student.studentName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border inline-block",
                        student.status === "present" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        student.status === "absent" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      )}>
                        {student.status === "present" ? "Keldi" : 
                         student.status === "absent" ? "Kelmadi" : 
                         student.status === "late" ? "Kech qoldi" : "Sababli"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {loadingStudent === student.studentId ? (
                        <Loader2 className="w-5 h-5 text-violet-500 animate-spin ml-auto" />
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleMark(student.studentId, "present")}
                            className={cn("p-2 rounded-lg border transition-colors", student.status === "present" ? "bg-green-500/20 border-green-500 text-green-400" : "bg-obsidian-900 border-obsidian-700 text-slate-400 hover:text-green-400")}
                            title="Keldi"
                          ><Check className="w-4 h-4" /></button>
                          <button 
                            onClick={() => handleMark(student.studentId, "absent")}
                            className={cn("p-2 rounded-lg border transition-colors", student.status === "absent" ? "bg-red-500/20 border-red-500 text-red-400" : "bg-obsidian-900 border-obsidian-700 text-slate-400 hover:text-red-400")}
                            title="Kelmadi"
                          ><X className="w-4 h-4" /></button>
                          <button 
                            onClick={() => handleMark(student.studentId, "excused")}
                            className={cn("p-2 rounded-lg border transition-colors", student.status === "excused" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" : "bg-obsidian-900 border-obsidian-700 text-slate-400 hover:text-yellow-400")}
                            title="Sababli"
                          ><Clock className="w-4 h-4" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
