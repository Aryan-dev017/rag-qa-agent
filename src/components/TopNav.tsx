import React from "react";
import { 
  Sparkles, Layers, Terminal, Search, HelpCircle, Settings,
  Database, ShieldCheck, Sun, Moon, Info, LayoutDashboard
} from "lucide-react";
import { KnowledgeBase, DocumentInfo } from "../types";

interface TopNavProps {
  knowledgeBases: KnowledgeBase[];
  activeKBId: string;
  documents: DocumentInfo[];
  
  developerMode: boolean;
  onToggleDeveloperMode: () => void;
  
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  
  activeTab: "chat" | "explorer";
  onSelectTab: (tab: "chat" | "explorer") => void;
}

export default function TopNav({
  knowledgeBases,
  activeKBId,
  documents,
  developerMode,
  onToggleDeveloperMode,
  rightPanelOpen,
  onToggleRightPanel,
  activeTab,
  onSelectTab
}: TopNavProps) {
  const currentKB = knowledgeBases.find(kb => kb.id === activeKBId) || knowledgeBases[0];

  return (
    <header id="top-nav" className="h-14 border-b border-slate-900 bg-[#0A0D16] px-6 flex items-center justify-between select-none shrink-0">
      {/* Active Area / Workspace Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">Workspace</span>
          <span className="text-slate-700">/</span>
          <span className="text-slate-200 font-semibold flex items-center gap-1">
            {currentKB ? currentKB.name : "Default Context"}
          </span>
          <span className="bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-sm font-mono ml-1.5">
            {documents.length} Docs
          </span>
        </div>
      </div>

      {/* Main Tabs (Chat & Explorer) */}
      <div className="flex bg-slate-950 border border-slate-900 p-0.5 rounded-lg">
        <button
          onClick={() => onSelectTab("chat")}
          className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            activeTab === "chat"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          RAG Chat Workspace
        </button>
        <button
          onClick={() => onSelectTab("explorer")}
          className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            activeTab === "explorer"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Database className="w-3 h-3" />
          Vector Store Explorer
        </button>
      </div>

      {/* Workspace Quick Controls */}
      <div className="flex items-center gap-3">
        {/* Toggle Right Panel (Retrieval Context) */}
        <button
          onClick={onToggleRightPanel}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-all ${
            rightPanelOpen
              ? "bg-indigo-600/15 border-indigo-500/30 text-indigo-400"
              : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle semantic context inspector panel"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Inspect Chunks</span>
        </button>

        {/* Developer Console Toggle */}
        <button
          onClick={onToggleDeveloperMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-all ${
            developerMode
              ? "bg-indigo-600/15 border-indigo-500/30 text-indigo-400"
              : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle developer pipeline console"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Developer Metrics</span>
        </button>

        <div className="h-5 w-px bg-slate-900"></div>

        {/* Integration Engine Badges */}
        <div className="hidden lg:flex gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-medium text-slate-500 font-mono">
            <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
            GEMINI 3.5 FLASH
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-medium text-slate-500 font-mono">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
            HYBRID VECTORS
          </div>
        </div>
      </div>
    </header>
  );
}
