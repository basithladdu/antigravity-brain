"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatView from "@/components/ChatView";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main className="flex h-screen bg-white overflow-hidden selection:bg-black selection:text-white relative">
      <Sidebar 
        onSelect={setSelectedId} 
        selectedId={selectedId || undefined} 
      />
      
      {selectedId ? (
        <ChatView id={selectedId} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white relative p-12 overflow-hidden border-l border-black">
          {/* Background Grid Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
            <div className="mb-12 flex flex-col items-center">
              <h2 className="text-[12rem] font-display leading-[0.8] tracking-tighter text-black">AG</h2>
              <div className="h-4 w-64 bg-black mt-4" />
            </div>
            
            <h3 className="text-4xl font-display uppercase tracking-tight mb-8">Select a session to begin exploration</h3>
            
            <p className="font-body text-xl leading-relaxed text-black/60 mb-12">
              Browse your historical conversation logs with clinical precision. Every prompt, every response, archived for reference.
            </p>

            <div className="grid grid-cols-3 gap-8 text-left border-y-4 border-black py-12 mb-12 w-full">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-4">01. Explore</span>
                <p className="text-xs font-body leading-relaxed">Use the sidebar to search through all historical sessions indexed from your local brain.</p>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-4">02. Filter</span>
                <p className="text-xs font-body leading-relaxed">Narrow down results by date or sort by session size to find specific technical discussions.</p>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-4">03. Retrieve</span>
                <p className="text-xs font-body leading-relaxed">Instantly copy prompts or AI responses to your clipboard with editorial-style controls.</p>
              </div>
            </div>

            
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest font-bold border-t border-black pt-8 w-full justify-center">
              <span>Historical Archive</span>
              <div className="w-1.5 h-1.5 bg-black" />
              <span>Version 1.0.0</span>
              <div className="w-1.5 h-1.5 bg-black" />
              <span>Build 2026.05</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
