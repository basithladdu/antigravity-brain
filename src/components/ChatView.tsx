"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Terminal, ArrowRight, CornerRightDown, User, Bot } from "lucide-react";
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

export default function ChatView({ id, onClose }: { id: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/conversations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white border-l border-black">
        <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mb-4" />
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-black animate-pulse">Syncing Session...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white relative overflow-hidden selection:bg-black selection:text-white">
      <header className="h-24 border-b-4 border-black px-6 lg:px-12 flex items-center justify-between z-10 bg-white">
        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={onClose}
            className="lg:hidden p-2 border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
          <div className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-black text-black flex items-center justify-center font-mono text-[10px] lg:text-xs font-bold shrink-0">
            ID
          </div>
          <div className="flex flex-col overflow-hidden">
            <h2 className="text-lg lg:text-2xl font-display uppercase tracking-tighter leading-none truncate text-black">{id.slice(0, 8)}</h2>
            <p className="text-[8px] lg:text-[9px] font-mono tracking-widest uppercase text-black/40 mt-1 truncate">{id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest border border-black px-3 py-1 text-black">
            Historical Log
          </span>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-24 scroll-smooth bg-white"
      >
        <div className="max-w-4xl mx-auto space-y-32 pb-32">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <MessageRow key={i} msg={msg} isFirst={i === 0} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ msg, isFirst }: { msg: Message; isFirst: boolean }) {
  if (msg.type === "USER_INPUT") {
    let content = msg.content || "";
    content = content.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/, "$1").trim();
    content = content.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/, "").trim();
    
    if (!content) return null;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
        className="flex flex-col items-start group"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 border border-black flex items-center justify-center">
            <User className="w-3 h-3 text-black" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-black/60">
            PROMPT — {new Date(msg.created_at).toLocaleTimeString([], { hour12: false })}
          </span>
        </div>
        
        <div className="relative w-full">
          <div className={cn(
            "text-2xl font-body leading-relaxed text-black",
            isFirst && "first-letter:float-left first-letter:text-6xl first-letter:font-display first-letter:mr-4 first-letter:mt-2 first-letter:border-4 first-letter:border-black first-letter:px-4 first-letter:py-1 first-letter:leading-none"
          )}>
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
          <div className="mt-8 flex gap-4">
             <CopyButton content={content} label="COPY PROMPT" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (msg.type === "PLANNER_RESPONSE" && msg.content) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
        className="flex flex-col items-start w-full"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-6 h-6 bg-black flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-black">
            RESPONSE — {new Date(msg.created_at).toLocaleTimeString([], { hour12: false })}
          </span>
        </div>

        <div className="bg-black text-white p-8 lg:p-12 w-full border-l-[12px] border-black relative">
          <div className="prose prose-invert max-w-none prose-lg font-body text-white">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({children}) => <h1 className="text-4xl font-display mb-8 tracking-tighter text-white uppercase">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-display mb-6 tracking-tight text-white border-b border-white/20 pb-2 uppercase">{children}</h2>,
                p: ({children}) => <p className="mb-6 leading-relaxed text-white/90">{children}</p>,
                li: ({children}) => <li className="mb-2 text-white/90">{children}</li>,
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline ? (
                    <CodeBlock language={match ? match[1] : ""}>{String(children).replace(/\n$/, "")}</CodeBlock>
                  ) : (
                    <code className="bg-white/20 px-1.5 py-0.5 font-mono text-sm text-white" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
          <div className="mt-12 flex gap-4">
            <CopyButton content={msg.content} inverted label="COPY RESPONSE" />
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

function CopyButton({ content, label, inverted }: { content: string; label: string; inverted?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={copy}
      className={cn(
        "px-4 py-2 text-[10px] font-mono font-bold tracking-widest flex items-center gap-2 transition-all duration-100",
        inverted 
          ? "bg-white text-black hover:bg-neutral-200" 
          : "bg-black text-white hover:bg-neutral-800"
      )}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "COPIED" : label}
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
    <div className="my-12 border-2 border-white bg-white/5 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/20 bg-white/5">
        <div className="flex items-center gap-3">
          <Terminal className="w-3 h-3 text-white/40" />
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{language || "txt"}</span>
        </div>
        <button 
          onClick={copy}
          className="text-[10px] font-mono text-white/60 hover:text-white hover:underline uppercase tracking-widest"
        >
          {copied ? "SUCCESS" : "COPY"}
        </button>
      </div>
      <pre className="p-8 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className="text-white">{children}</code>
      </pre>
    </div>
  );
}
