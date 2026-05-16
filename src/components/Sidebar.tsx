"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, Calendar, ChevronDown, Hash, LayoutGrid, ArrowRight, Settings, X, FolderOpen } from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from "date-fns";
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

type SortOption = "date" | "size" | "title";
type DateFilter = "all" | "today" | "yesterday" | "week" | "month";

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
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [customBrainDir, setCustomBrainDir] = useState("");

  const fetchConversations = (dir?: string) => {
    setLoading(true);
    const headers: Record<string, string> = {};
    if (dir) headers['x-brain-dir'] = dir;

    fetch("/api/conversations", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConversations(data);
        } else {
          setConversations([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setConversations([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    const savedPins = localStorage.getItem("ag-pins");
    if (savedPins) {
      try {
        setPinnedIds(JSON.parse(savedPins));
      } catch (e) {
        setPinnedIds([]);
      }
    }

    const savedDir = localStorage.getItem("ag-brain-dir") || "";
    setCustomBrainDir(savedDir);
    fetchConversations(savedDir);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("session-search")?.focus();
      }
      if (e.key === "/") {
        if (document.activeElement?.tagName !== "INPUT") {
          e.preventDefault();
          document.getElementById("session-search")?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const saveSettings = () => {
    localStorage.setItem("ag-brain-dir", customBrainDir);
    setShowSettings(false);
    fetchConversations(customBrainDir);
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPins = pinnedIds.includes(id) 
      ? pinnedIds.filter(p => p !== id) 
      : [...pinnedIds, id];
    setPinnedIds(nextPins);
    localStorage.setItem("ag-pins", JSON.stringify(nextPins));
  };

  const filteredAndSorted = useMemo(() => {
    let result = conversations.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) || 
      c.id.toLowerCase().includes(search.toLowerCase())
    );

    if (dateFilter !== "all") {
      result = result.filter(c => {
        try {
          const date = parseISO(c.updatedAt);
          if (dateFilter === "today") return isToday(date);
          if (dateFilter === "yesterday") return isYesterday(date);
          if (dateFilter === "week") return isThisWeek(date);
          if (dateFilter === "month") return isThisMonth(date);
        } catch (e) {}
        return true;
      });
    }

    result.sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id);
      const bPinned = pinnedIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      if (sortBy === "date") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "size") return b.size - a.size;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [conversations, search, sortBy, dateFilter, pinnedIds]);

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-80 lg:w-96 border-r-4 border-black bg-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static h-full overflow-hidden",
      selectedId ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
    )}>
      <div className="p-8 border-b-4 border-black bg-white shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-black">
            <div className="w-3 h-3 bg-black" />
            <h1 className="text-2xl font-display uppercase tracking-tighter">Archive</h1>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setShowSettings(true)}
              className="p-1 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black"
             >
               <Settings className="w-4 h-4" />
             </button>
             <span className="text-[10px] font-mono uppercase tracking-widest bg-black text-white px-2 py-0.5">
               {filteredAndSorted.length} Sessions
             </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/60" />
            <input
              id="session-search"
              type="text"
              placeholder="SEARCH... (/)"
              className="w-full bg-white border-2 border-black py-3 pl-10 pr-4 text-xs font-mono uppercase tracking-widest placeholder:text-black/30 text-black focus:outline-none focus:bg-black focus:text-white transition-all duration-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="w-full appearance-none bg-white border border-black px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-black focus:outline-none focus:bg-black focus:text-white cursor-pointer"
              >
                <option value="all" className="bg-white text-black">Time: All</option>
                <option value="today" className="bg-white text-black">Today</option>
                <option value="yesterday" className="bg-white text-black">Yesterday</option>
                <option value="week" className="bg-white text-black">This Week</option>
                <option value="month" className="bg-white text-black">This Month</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-black" />
            </div>

            <div className="flex-1 relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full appearance-none bg-white border border-black px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-black focus:outline-none focus:bg-black focus:text-white cursor-pointer"
              >
                <option value="date" className="bg-white text-black">Sort: Recent</option>
                <option value="size" className="bg-white text-black">Sort: Size</option>
                <option value="title" className="bg-white text-black">Sort: Alpha</option>
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-black" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-black/10 bg-white custom-scrollbar">
        {loading ? (
          <div className="divide-y divide-black/5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-white animate-pulse" />
            ))}
          </div>
        ) : filteredAndSorted.length > 0 ? (
          filteredAndSorted.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full text-left p-6 transition-all duration-100 flex flex-col gap-2 group relative",
                selectedId === c.id 
                  ? "bg-black text-white" 
                  : "hover:bg-neutral-50 bg-white"
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "text-[10px] font-mono uppercase tracking-widest",
                  selectedId === c.id ? "text-white/40" : "text-black/40"
                )}>
                  {format(parseISO(c.updatedAt), "yyyy.MM.dd")}
                </span>
                <button 
                  onClick={(e) => togglePin(c.id, e)}
                  className={cn(
                    "p-1 transition-all duration-100",
                    pinnedIds.includes(c.id) ? "opacity-100" : "opacity-0 group-hover:opacity-40 hover:opacity-100"
                  )}
                >
                  <Hash className={cn("w-3 h-3", pinnedIds.includes(c.id) ? "fill-current" : "")} />
                </button>
              </div>
              <h3 className={cn(
                "text-sm font-body font-bold leading-tight line-clamp-2",
                selectedId === c.id ? "text-white" : "text-black"
              )}>
                {c.title}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5", selectedId === c.id ? "bg-white" : "bg-black")} />
                  <span className={cn(
                    "text-[9px] font-mono uppercase tracking-[0.2em]",
                    selectedId === c.id ? "text-white/30" : "text-black/30"
                  )}>
                    {c.id.slice(0, 8)}
                  </span>
                </div>
                <span className={cn(
                  "text-[10px] font-mono uppercase tracking-widest",
                  selectedId === c.id ? "text-white/40" : "text-black/40"
                )}>
                  {(c.size / 1024).toFixed(0)}KB
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="p-12 text-center flex flex-col items-center gap-4 bg-white">
            <LayoutGrid className="w-8 h-8 text-black/10" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/30">No matches found</p>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-black bg-white mt-auto space-y-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">PROJECT</span>
          <p className="text-[11px] font-body leading-relaxed opacity-70">
            This project is open-source. Build your own log explorer, fork it, and make the future of technical archiving beautiful.
          </p>
          <a href="https://github.com/basithladdu/antigravity-brain" target="_blank" className="text-[10px] font-mono uppercase font-bold tracking-widest hover:underline flex items-center gap-2">
            View Source <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        <div className="h-px bg-black/10" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">FOUNDER</span>
            <a href="https://basith.wedevit.in" target="_blank" className="text-xs font-display uppercase tracking-tight hover:underline">
              Shaik Abdul Basith (Devit)
            </a>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 opacity-40">
            <a href="https://instagram.com/basithladdu" target="_blank" className="text-[9px] font-mono uppercase tracking-widest hover:text-black hover:opacity-100">Insta</a>
            <a href="https://twitter.com/basithladdu" target="_blank" className="text-[9px] font-mono uppercase tracking-widest hover:text-black hover:opacity-100">Twitter</a>
            <a href="https://youtube.com/@basithladdu" target="_blank" className="text-[9px] font-mono uppercase tracking-widest hover:text-black hover:opacity-100">YT</a>
            <a href="https://letterboxd.com/basithladdu" target="_blank" className="text-[9px] font-mono uppercase tracking-widest hover:text-black hover:opacity-100">LB</a>
            <a href="https://open.spotify.com/user/basithladdu" target="_blank" className="text-[9px] font-mono uppercase tracking-widest hover:text-black hover:opacity-100">Spotify</a>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-[100] bg-white p-8 flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-display uppercase tracking-tighter">Settings</h2>
            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-black hover:text-white transition-colors border-2 border-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Brain Directory</label>
              <div className="relative">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <input 
                  type="text" 
                  value={customBrainDir}
                  onChange={(e) => setCustomBrainDir(e.target.value)}
                  placeholder="C:\Users\...\brain"
                  className="w-full bg-white border-2 border-black py-4 pl-12 pr-4 text-xs font-mono tracking-tight text-black focus:outline-none focus:bg-neutral-50"
                />
              </div>
              <p className="text-[10px] font-body opacity-50 leading-relaxed italic">
                * Paste the absolute path to your conversation logs. This is stored locally in your browser and used for API requests.
              </p>
            </div>
          </div>

          <button 
            onClick={saveSettings}
            className="w-full bg-black text-white py-4 font-mono uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors mt-auto"
          >
            Apply & Reload
          </button>
        </div>
      )}
    </aside>
  );
}
