import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Sparkles, MessageSquare, BookOpen, Compass, 
  Check, FileText, ChevronDown, ChevronUp, Scale, AlertCircle, 
  HelpCircle, Copy, RefreshCw, Bookmark, Share2, CornerDownLeft,
  ArrowRight, FileSpreadsheet, CheckCircle, Info
} from "lucide-react";
import { QueryResult, SystemPromptPreset, SourceCitation, ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ChatSectionProps {
  onQuery: (query: string, presetId: string) => Promise<QueryResult>;
  isLoading: boolean;
  hasDocuments: boolean;
  activeConversationId: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  selectedPreset: string;
  setSelectedPreset: (id: string) => void;
  onHighlightSource: (citation: SourceCitation | null) => void;
  onToggleRightPanel: (isOpen: boolean) => void;
}

const PERSONA_PRESETS: SystemPromptPreset[] = [
  {
    id: "balanced",
    name: "Balanced Assistant",
    description: "Helpful and grounded. Synthesizes knowledge bases with retrieved facts.",
    instruction: "You are a helpful RAG assistant."
  },
  {
    id: "strict",
    name: "Strict Fact QA",
    description: "Answers strictly from the context. If not present, states it cannot answer.",
    instruction: "You are a strict factual document search agent..."
  },
  {
    id: "teacher",
    name: "Creative Teacher",
    description: "Friendly explanations, structured bullet points, and analogies.",
    instruction: "You are an engaging teacher..."
  },
  {
    id: "analyst",
    name: "Technical Analyst",
    description: "Structured, formal analysis. Extracts key data, facts, and insights.",
    instruction: "You are a highly analytical advisor..."
  }
];

const QUICK_STARTS = [
  {
    query: "How does RAG reduce factual hallucinations?",
    label: "Hallucinations Reduction",
    desc: "Explain grounding mechanisms"
  },
  {
    query: "What is the difference between cosine similarity and dot product?",
    label: "Cosine Similarity",
    desc: "Mathematical details of vector search"
  },
  {
    query: "Explain Gemini embedding model configuration used in this server.",
    label: "Embedding Specs",
    desc: "Review models and vector layers"
  }
];

export default function ChatSection({ 
  onQuery, 
  isLoading, 
  hasDocuments,
  activeConversationId,
  messages,
  setMessages,
  selectedPreset,
  setSelectedPreset,
  onHighlightSource,
  onToggleRightPanel
}: ChatSectionProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [queryError, setQueryError] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  
  // Streaming state simulation
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on loading and new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, streamingText]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputQuery]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery(inputQuery);
  };

  const submitQuery = async (query: string) => {
    if (!query.trim() || isLoading || streamingMessageId) return;

    setQueryError(null);
    const trimmedQuery = query.trim();

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      sender: "user",
      text: trimmedQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery("");

    // Start loading timer
    const startTime = Date.now();

    try {
      const response = await onQuery(trimmedQuery, selectedPreset);
      const latencyMs = Date.now() - startTime;

      // Prepare agent response
      const agentMsgId = `msg_${Date.now()}_agent`;
      const agentMsg: ChatMessage = {
        id: agentMsgId,
        sender: "agent",
        text: response.answer,
        sources: response.sources,
        suggestedQuestions: response.suggestedQuestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: latencyMs / 1000,
        isBookmarked: false
      };

      // Trigger word-by-word streaming effect for high-end feel
      simulateStreaming(agentMsg);
    } catch (err) {
      console.error("Query submit error:", err);
      setQueryError(err instanceof Error ? err.message : "RAG query failed. Please inspect your connection or API configuration.");
    }
  };

  const simulateStreaming = (finalMsg: ChatMessage) => {
    setStreamingMessageId(finalMsg.id);
    const words = finalMsg.text.split(" ");
    let currentIdx = 0;
    
    // Create an empty agent message first
    const initialPlaceholder: ChatMessage = {
      ...finalMsg,
      text: ""
    };
    
    setMessages(prev => [...prev, initialPlaceholder]);
    
    const interval = setInterval(() => {
      if (currentIdx >= words.length) {
        clearInterval(interval);
        setStreamingMessageId(null);
        setStreamingText("");
        // Fix up final state to have the full text and metadata
        setMessages(prev => prev.map(m => m.id === finalMsg.id ? finalMsg : m));
        return;
      }

      const nextText = words.slice(0, currentIdx + 1).join(" ");
      setStreamingText(nextText);
      setMessages(prev => prev.map(m => m.id === finalMsg.id ? { ...m, text: nextText } : m));
      currentIdx += 2; // Stream 2 words at a time to keep it snappy and interactive
    }, 25);
  };

  const toggleSource = (msgId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Chat message Actions
  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 1500);
  };

  const handleBookmark = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isBookmarked: !m.isBookmarked } : m));
  };

  const handleQuickAction = async (msgText: string, type: "simplify" | "summarize") => {
    let queryText = "";
    if (type === "simplify") {
      queryText = `Explain this in simpler, non-technical terms: "${msgText}"`;
    } else {
      queryText = `Give me a concise 3-bullet point summary of this answer: "${msgText}"`;
    }
    submitQuery(queryText);
  };

  const handleExportMarkdown = (msg: ChatMessage) => {
    const mdContent = `### Question\n\n${messages.find((m, idx) => messages[idx+1]?.id === msg.id && m.sender === "user")?.text || "Query"}\n\n### Answer\n\n${msg.text}\n\n*Generated by Ragent Semantic Workspace on ${new Date().toLocaleDateString()}*`;
    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ragent-response-${msg.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitQuery(inputQuery);
    }
  };

  // Convert custom markdown syntax, highlights, citations to structured elements
  const formatMarkdownTextCustom = (text: string, sources: SourceCitation[] = []) => {
    if (!text) return null;
    
    // Replace citations like [1], [2] with dynamic linked buttons
    const parts = text.split(/(\[\d+\])/g);
    
    return parts.map((part, partIndex) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const citationNum = parseInt(match[1], 10);
        const matchedSource = sources[citationNum - 1];
        return (
          <button
            key={partIndex}
            onClick={() => {
              if (matchedSource) {
                onHighlightSource(matchedSource);
                onToggleRightPanel(true);
              }
            }}
            className="inline-flex items-center justify-center align-super text-[9px] font-bold bg-indigo-500/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/25 text-indigo-300 rounded px-1 py-0.5 mx-0.5 transition-all cursor-pointer shadow-3xs"
            title={matchedSource ? `Source Chunk: ${matchedSource.docName}` : `Citation ${citationNum}`}
          >
            [{citationNum}]
          </button>
        );
      }

      // Format custom headers and blocks
      const lines = part.split("\n");
      return lines.map((line, lineIndex) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith("### ")) {
          return (
            <h4 key={`${partIndex}-${lineIndex}`} className="text-xs font-semibold text-white mt-3.5 mb-1.5 font-display tracking-tight flex items-center gap-1.5 border-l-2 border-indigo-500/50 pl-2">
              {trimmedLine.substring(4)}
            </h4>
          );
        }
        if (trimmedLine.startsWith("## ")) {
          return (
            <h3 key={`${partIndex}-${lineIndex}`} className="text-sm font-bold text-white mt-4.5 mb-2 font-display tracking-tight">
              {trimmedLine.substring(3)}
            </h3>
          );
        }
        if (trimmedLine.startsWith("# ")) {
          return (
            <h2 key={`${partIndex}-${lineIndex}`} className="text-base font-extrabold text-white mt-5 mb-2.5 font-display tracking-tight border-b border-slate-900 pb-1.5">
              {trimmedLine.substring(2)}
            </h2>
          );
        }

        // Bullet lists
        if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          const cleanLine = trimmedLine.substring(2);
          return (
            <li key={`${partIndex}-${lineIndex}`} className="list-disc list-inside ml-3 text-xs text-slate-300 my-0.5 leading-relaxed font-sans">
              {renderInlineBoldAndCode(cleanLine)}
            </li>
          );
        }

        // Table parse
        if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
          const cells = trimmedLine.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
          const isHeader = lineIndex === 0 || (lines[lineIndex+1] && lines[lineIndex+1].includes("---"));
          
          if (trimmedLine.includes("---")) {
            return null; // separator
          }

          return (
            <div key={`${partIndex}-${lineIndex}`} className="overflow-x-auto my-1">
              <table className="min-w-full divide-y divide-slate-800 border border-slate-900 text-[11px] rounded-lg">
                <tr className={isHeader ? "bg-slate-950" : "bg-slate-950/20"}>
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className={`px-2 py-1.5 border-r border-slate-900 ${isHeader ? "font-bold text-slate-200" : "text-slate-400"}`}>
                      {renderInlineBoldAndCode(cell)}
                    </td>
                  ))}
                </tr>
              </table>
            </div>
          );
        }

        // Blockquotes
        if (trimmedLine.startsWith("> ")) {
          return (
            <blockquote key={`${partIndex}-${lineIndex}`} className="border-l-2 border-indigo-500 pl-3 py-1 my-2.5 text-slate-400 italic text-[11px] bg-indigo-950/5 rounded-r-lg">
              {renderInlineBoldAndCode(trimmedLine.substring(2))}
            </blockquote>
          );
        }

        if (trimmedLine === "") {
          return <div key={`${partIndex}-${lineIndex}`} className="h-1.5" />;
        }

        return (
          <p key={`${partIndex}-${lineIndex}`} className="text-xs text-slate-300 leading-relaxed mb-1.5 font-sans">
            {renderInlineBoldAndCode(line)}
          </p>
        );
      });
    });
  };

  const renderInlineBoldAndCode = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold text-white tracking-wide">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index} className="bg-slate-950/80 border border-slate-900 px-1 py-0.5 rounded font-mono text-[10px] text-indigo-300">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div id="chat-workspace" className="flex-1 flex flex-col h-full bg-[#080B14] overflow-hidden">
      {/* Top Banner / Active Persona Bar */}
      <div className="h-11 border-b border-slate-900 bg-[#0A0D16] px-5 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Active Persona:</span>
          <div className="flex gap-1.5">
            {PERSONA_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className={`text-[9px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedPreset === preset.id 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                    : "text-slate-500 hover:text-slate-300 bg-slate-950/20 hover:bg-slate-950/50 border border-slate-900"
                }`}
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Conversation viewport */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#080B14]">
        {messages.length <= 1 ? (
          /* Empty onboarding dashboard */
          <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center text-center space-y-6 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/15 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white tracking-tight font-display">Ask Ragent Knowledge Workspace</h1>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed font-sans">
                A powerful context-grounded AI assistant. Ingest your technical documentation, PDF/text, or code files, select a query preset, and ask for precise, citated facts.
              </p>
            </div>

            {/* Quick Actions Grid */}
            {hasDocuments ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-4">
                {QUICK_STARTS.map((qs, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => submitQuery(qs.query)}
                    className="flex flex-col items-start text-left p-3.5 bg-[#0D101C]/60 hover:bg-[#0F1426] border border-slate-900 hover:border-slate-800 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/2"
                  >
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono mb-1">{qs.label}</span>
                    <span className="text-xs font-semibold text-slate-300 line-clamp-2 leading-tight">{qs.query}</span>
                    <span className="text-[9px] text-slate-600 mt-2 font-sans">{qs.desc}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-indigo-950/10 border border-indigo-900/20 rounded-2xl max-w-md flex gap-3 text-left">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-indigo-300">Workspace is empty</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">Please drag & drop or upload files to the left sidebar first. Once files are parsed and embeddings are stored, interactive RAG queries will instantly activate.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Conversation flow rendering */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              const isLatest = index === messages.length - 1;
              const isStreaming = msg.id === streamingMessageId;

              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1 px-1.5">
                    <span className="font-semibold">{isUser ? "You" : "Ragent Assistant"}</span>
                    <span className="text-slate-700">•</span>
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.latency && (
                      <>
                        <span className="text-slate-700">•</span>
                        <span className="font-mono text-indigo-400">{msg.latency.toFixed(2)}s Latency</span>
                      </>
                    )}
                  </div>

                  {/* Message container */}
                  <div className={`relative max-w-[90%] group rounded-2xl ${
                    isUser 
                      ? "bg-slate-900/60 border border-slate-800 text-slate-200 px-4 py-3 rounded-tr-xs" 
                      : "bg-[#0B0E17] border border-[#141A2B] text-slate-200 px-5 py-4 rounded-tl-xs shadow-sm shadow-[#05070d]/50"
                  }`}>
                    {/* Inline Actions hover Menu for Agent Responses */}
                    {!isUser && !isStreaming && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950/80 border border-slate-900 rounded-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1 hover:text-indigo-400 text-slate-500 rounded-md transition-colors"
                          title="Copy response to clipboard"
                        >
                          {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleBookmark(msg.id)}
                          className={`p-1 rounded-md transition-colors ${msg.isBookmarked ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}
                          title="Bookmark conversation snippet"
                        >
                          <Bookmark className={`w-3 h-3 ${msg.isBookmarked ? "fill-amber-400" : ""}`} />
                        </button>
                        <button
                          onClick={() => handleQuickAction(msg.text, "simplify")}
                          className="p-1 hover:text-indigo-400 text-slate-500 rounded-md transition-colors text-[9px] font-mono px-1"
                          title="Explain simpler"
                        >
                          Simplify
                        </button>
                        <button
                          onClick={() => handleQuickAction(msg.text, "summarize")}
                          className="p-1 hover:text-indigo-400 text-slate-500 rounded-md transition-colors text-[9px] font-mono px-1"
                          title="Summarize in bullets"
                        >
                          Summarize
                        </button>
                        <button
                          onClick={() => handleExportMarkdown(msg)}
                          className="p-1 hover:text-indigo-400 text-slate-500 rounded-md transition-colors"
                          title="Export to Markdown"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Formatted body */}
                    <div className="space-y-1 font-sans text-xs select-text">
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="relative">
                          {formatMarkdownTextCustom(msg.text, msg.sources)}
                          {isStreaming && (
                            <span className="inline-block w-1.5 h-3 bg-indigo-500 ml-0.5 animate-pulse" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sources Citations Accordion (collapsible under assistant card) */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 ml-1 w-full max-w-[90%] font-sans">
                      <button
                        onClick={() => toggleSource(msg.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors py-1 px-1.5 hover:bg-slate-900/30 rounded-lg"
                      >
                        <BookOpen className="w-3 h-3 text-indigo-400" />
                        <span>
                          {expandedSources[msg.id] ? "Collapse Source Chunks" : `Review Retrieved Contexts (${msg.sources.length})`}
                        </span>
                        {expandedSources[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {expandedSources[msg.id] && (
                        <div className="mt-2 p-3.5 bg-[#090C14] border border-slate-900 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                              <Scale className="w-3 h-3 text-indigo-500" />
                              Semantic Context Vectors ({msg.sources.length})
                            </span>
                          </div>
                          {msg.sources.map((source, sIdx) => {
                            const percentScore = (source.score * 100).toFixed(1);
                            return (
                              <div 
                                key={source.chunkId} 
                                onClick={() => {
                                  onHighlightSource(source);
                                  onToggleRightPanel(true);
                                }}
                                className="bg-slate-950/20 border border-slate-900/60 rounded-lg p-2.5 hover:bg-slate-950/60 hover:border-slate-800 transition-all cursor-pointer shadow-3xs"
                              >
                                <div className="flex items-center justify-between mb-1.5 text-[9px] text-slate-500 font-mono">
                                  <span className="font-semibold text-slate-400 truncate max-w-[200px]" title={source.docName}>
                                    {sIdx + 1}. {source.docName} (Chunk {source.index})
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded-sm font-semibold ${
                                    source.score > 0.7 
                                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20" 
                                      : "bg-slate-900 text-slate-400 border border-slate-800"
                                  }`}>
                                    {percentScore}% Similarity Match
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-sans line-clamp-2">
                                  "{source.text}"
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested Follow-up buttons */}
                  {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && isLatest && !isStreaming && (
                    <div className="mt-4.5 ml-1 w-full max-w-[90%]">
                      <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1 mb-2 uppercase tracking-widest">
                        <Compass className="w-3.5 h-3.5 text-indigo-400" />
                        Explore Suggested Queries
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {msg.suggestedQuestions.map((question, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => submitQuery(question)}
                            disabled={isLoading || !hasDocuments}
                            className="text-left text-[11px] text-slate-300 hover:text-white hover:bg-[#0D101C]/80 hover:border-slate-800 border border-slate-900 bg-slate-950/20 px-3 py-2 rounded-xl transition-all shadow-3xs disabled:opacity-50 flex items-center justify-between group cursor-pointer"
                          >
                            <span>{question}</span>
                            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Loading Spinner Skeleton */}
        {isLoading && !streamingMessageId && (
          <div className="max-w-3xl mx-auto flex flex-col items-start space-y-2 select-none">
            <div className="text-[10px] text-slate-500 mb-1 px-1.5 flex items-center gap-2">
              <span className="font-semibold">Ragent Assistant</span>
              <span className="text-slate-700">•</span>
              <span className="font-mono text-indigo-400">Computing embeddings...</span>
            </div>
            <div className="bg-[#0B0E17] border border-[#141A2B] text-slate-400 rounded-2xl rounded-tl-xs p-5 shadow-sm max-w-[85%] flex items-center gap-3">
              <div className="flex space-x-1 shrink-0">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-slate-400 font-semibold leading-none">Querying vector space database and generating answer...</span>
            </div>
          </div>
        )}

        {/* Query Error Panel */}
        {queryError && (
          <div className="max-w-3xl mx-auto flex items-start gap-3.5 bg-red-950/25 border border-red-900/30 text-red-400 p-4 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <div className="space-y-1">
              <p className="font-bold text-red-300">RAG Computation Terminated</p>
              <p className="text-[10px] text-red-400/80 leading-relaxed font-sans">{queryError}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input panel at bottom */}
      <div className="p-4 border-t border-slate-900 bg-[#0A0D16] shrink-0">
        <div className="max-w-3xl mx-auto relative">
          {!hasDocuments ? (
            <div className="bg-amber-950/15 text-amber-400 border border-amber-900/20 rounded-xl p-3 text-xs flex gap-2.5 font-sans">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Workspace Pending Indexing</p>
                <p className="text-[10px] text-amber-500/80 leading-relaxed mt-0.5">
                  The local vector index is currently empty. To query your RAG pipeline, please upload text files or paste custom articles into the left sidebar, which will immediately trigger the 'gemini-embedding-2-preview' and vector store ingest workflow.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="relative bg-slate-950 border border-slate-900 rounded-2xl p-1 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/25 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || !!streamingMessageId}
                placeholder={isLoading ? "Generating RAG grounded text..." : "Ask questions about your indexed workspace documents..."}
                className="w-full text-xs bg-transparent border-0 text-slate-200 placeholder:text-slate-600 focus:ring-0 focus:outline-hidden py-3 px-4 resize-none font-sans min-h-[40px] pr-12 leading-relaxed"
              />
              <div className="flex items-center justify-between border-t border-slate-900/60 px-3.5 py-1.5">
                <span className="text-[9px] text-slate-700 font-mono flex items-center gap-1 select-none">
                  <CornerDownLeft className="w-2.5 h-2.5" /> Enter to submit • Shift+Enter for newline
                </span>
                <button
                  type="submit"
                  disabled={isLoading || !inputQuery.trim() || !!streamingMessageId}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-indigo-600 shrink-0 flex items-center justify-center shadow-lg shadow-indigo-600/10 cursor-pointer"
                  title="Submit query"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
