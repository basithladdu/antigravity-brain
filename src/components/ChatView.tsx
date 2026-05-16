"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, User, Bot, Loader2, Sparkles, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  type: string;
  content?: string;
  created_at: string;
}

export default function ChatView({ id }: { id: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/conversations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#08080a]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-white/30 text-sm font-medium animate-pulse">Syncing neural logs...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#08080a] relative overflow-hidden">
      <header className="h-20 border-b border-white/5 bg-[#0c0c0e]/80 backdrop-blur-xl px-8 flex items-center justify-between z-10">
        <div className="flex flex-col">
          <h2 className="text-white font-bold tracking-tight">Thread Session</h2>
          <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">{id}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Indexed</span>
          </div>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-12 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <MessageRow key={i} msg={msg} />
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#08080a] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#08080a] to-transparent" />
      </div>
    </div>
  );
}

function MessageRow({ msg }: { msg: Message }) {
  if (msg.type === "USER_INPUT") {
    let content = msg.content || "";
    content = content.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/, "$1").trim();
    content = content.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/, "").trim();
    
    if (!content) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end group"
      >
        <div className="max-w-3xl w-full flex flex-col items-end">
          <div className="flex items-center gap-3 mb-2 px-2">
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
              {new Date(msg.created_at).toLocaleTimeString()}
            </span>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-3 h-3 text-white/50" />
            </div>
          </div>
          <div className="relative group/msg">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] rounded-tr-none text-white/90 text-sm leading-relaxed shadow-2xl backdrop-blur-sm">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
            <CopyButton content={content} className="absolute -left-12 top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity" />
          </div>
        </div>
      </motion.div>
    );

  }

  if (msg.type === "PLANNER_RESPONSE" && msg.content) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start group"
      >
        <div className="max-w-3xl w-full flex flex-col items-start">
          <div className="flex items-center gap-3 mb-2 px-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
              Antigravity • {new Date(msg.created_at).toLocaleTimeString()}
            </span>
          </div>
          <div className="relative group/msg w-full">
            <div className="bg-[#12121a] border border-indigo-500/20 p-8 rounded-[2rem] rounded-tl-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-l-4 border-l-indigo-500">
              <div className="prose prose-invert max-w-none prose-sm prose-indigo">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline ? (
                        <CodeBlock language={match ? match[1] : ""}>{String(children).replace(/\n$/, "")}</CodeBlock>
                      ) : (
                        <code className={cn("bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs", className)} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
            <CopyButton content={msg.content} className="absolute -right-12 top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity" />
          </div>

        </div>
      </motion.div>
    );
  }

  return null;
}

function CopyButton({ content, className }: { content: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={copy}
      className={cn("p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/30 hover:text-white", className)}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CodeBlock({ children, language }: { children: string; language: string }) {

  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-6 rounded-2xl overflow-hidden border border-white/5 bg-black/40">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-white/30" />
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{language || "text"}</span>
        </div>
        <button 
          onClick={copy}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono">
        <code className="text-white/80">{children}</code>
      </pre>
    </div>
  );
}
