"use client";

import { useEffect, useState } from "react";
import { Search, History, ChevronRight, Hash, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  size: number;
}

export default function Sidebar({ 
  onSelect, 
  selectedId 
}: { 
  onSelect: (id: string) => void; 
  selectedId?: string 
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      });
  }, []);

  const filtered = conversations.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-white/10 bg-[#0c0c0e] flex flex-col h-screen overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">AG Archive</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search threads..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all group relative overflow-hidden",
                selectedId === c.id 
                  ? "bg-indigo-600/10 border border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]" 
                  : "hover:bg-white/5 border border-transparent"
              )}
            >
              <div className="flex flex-col gap-1">
                <span className={cn(
                  "text-sm font-medium line-clamp-1",
                  selectedId === c.id ? "text-indigo-400" : "text-white/70 group-hover:text-white"
                )}>
                  {c.title}
                </span>
                <div className="flex items-center gap-3 text-[10px] text-white/30 font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(c.updatedAt), "MMM d, HH:mm")}
                  </span>
                  <span>{(c.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              {selectedId === c.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
              )}
            </button>
          ))
        ) : (
          <div className="text-center py-12">
            <History className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No matches found</p>
          </div>
        )}
      </div>
    </aside>
  );
}
