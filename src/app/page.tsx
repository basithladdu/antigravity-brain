"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatView from "@/components/ChatView";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main className="flex h-screen bg-black overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar 
        onSelect={setSelectedId} 
        selectedId={selectedId || undefined} 
      />
      
      {selectedId ? (
        <ChatView id={selectedId} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#08080a] relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-8 shadow-2xl">
              <Sparkles className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Neural Archive</h2>
            <p className="text-white/30 max-w-sm text-sm font-medium leading-relaxed">
              Select a conversation thread from the sidebar to explore historical neural transmissions.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
