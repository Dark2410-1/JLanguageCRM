"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, Trophy, Info, X } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "../layout/actions";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
};

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data as Notification[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markAsRead(id);
  };

  const handleMarkAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllAsRead();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'system': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-violet-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifs(); // refresh when opening
        }}
        className="relative p-2 text-slate-300 hover:text-slate-100 hover:bg-obsidian-700 rounded-md transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-obsidian-900 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-obsidian-800 border border-obsidian-700 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-obsidian-700 bg-obsidian-900/50">
              <h3 className="font-bold text-slate-100">Bildirishnomalar</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAll}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300"
                >
                  Barchasini o'qilgan qilish
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-600 opacity-50" />
                  <p>Yangi xabarlar yo'q.</p>
                </div>
              ) : (
                <div className="divide-y divide-obsidian-700/50">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-4 hover:bg-obsidian-700/50 transition-colors flex gap-3 group relative",
                        !notif.isRead ? "bg-obsidian-700/20" : "opacity-75"
                      )}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
                      )}
                      
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className={cn("font-medium text-sm line-clamp-1", !notif.isRead ? "text-slate-100" : "text-slate-300")}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        
                        {!notif.isRead && (
                          <button 
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-xs font-medium text-violet-500 hover:text-violet-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            O'qilgan deb belgilash
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
