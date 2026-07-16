import React from "react";
import { 
  Activity, Terminal, Database, ShieldCheck, Cpu, HardDrive, 
  HelpCircle, ChevronRight, Zap, RefreshCw, BarChart2
} from "lucide-react";
import { DocumentInfo, ChunkInfo } from "../types";

interface DeveloperConsoleProps {
  documents: DocumentInfo[];
  chunks: ChunkInfo[];
  latencyHistory: number[];
  onClearCache: () => void;
}

export default function DeveloperConsole({
  documents,
  chunks,
  latencyHistory,
  onClearCache
}: DeveloperConsoleProps) {
  const avgLatency = latencyHistory.length > 0 
    ? (latencyHistory.reduce((acc, l) => acc + l, 0) / latencyHistory.length).toFixed(2)
    : "0.00";

  return (
    <div id="developer-observability-console" className="border-b border-slate-900 bg-[#0B0E17] p-5 select-none animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header telemetry and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center">
              <Terminal className="w-3 h-3 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-display">System Grounding Diagnostics</h3>
              <p className="text-[10px] text-slate-500 font-sans">Real-time pipeline verification and embedding metrics.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearCache}
              className="text-[9px] font-mono text-slate-400 hover:text-white bg-slate-950 border border-slate-900 px-2 py-1 rounded-md hover:border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Force GC / Reset Vectors
            </button>
            <div className="text-[9px] font-mono bg-emerald-950/40 border border-emerald-900/35 text-emerald-400 px-2.5 py-1 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              768D Pipeline: ACTIVE
            </div>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-indigo-500/5 text-indigo-400 rounded-lg border border-indigo-500/10">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono leading-none mb-1">Embedding Engine</span>
              <span className="text-[11px] font-bold text-white font-mono">gemini-embedding-2</span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-indigo-500/5 text-indigo-400 rounded-lg border border-indigo-500/10">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono leading-none mb-1">Avg RAG Latency</span>
              <span className="text-[11px] font-bold text-white font-mono">{avgLatency} seconds</span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-indigo-500/5 text-indigo-400 rounded-lg border border-indigo-500/10">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono leading-none mb-1">Indexed Vector Fields</span>
              <span className="text-[11px] font-bold text-white font-mono">{chunks.length} records</span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-indigo-500/5 text-indigo-400 rounded-lg border border-indigo-500/10">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-mono leading-none mb-1">Source Footprint</span>
              <span className="text-[11px] font-bold text-white font-mono">
                {(documents.reduce((acc, d) => acc + d.charCount, 0) / 1000).toFixed(1)}k Chars
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Pipeline diagram */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-2.5">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Grounding Pipeline Flow Verification
          </span>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
            
            <div className="flex-1 bg-[#0D101C] border border-slate-900 p-2.5 rounded-lg space-y-1">
              <span className="text-indigo-400 font-semibold uppercase text-[9px] block">1. Parser Engine</span>
              <p className="text-[9px] leading-tight text-slate-500">Plaintext reader processes text payloads on drag-drop.</p>
            </div>

            <ChevronRight className="hidden lg:block w-4 h-4 text-slate-700" />

            <div className="flex-1 bg-[#0D101C] border border-slate-900 p-2.5 rounded-lg space-y-1">
              <span className="text-indigo-400 font-semibold uppercase text-[9px] block">2. Semantic Splitting</span>
              <p className="text-[9px] leading-tight text-slate-500">Splits texts into logical chunks with 200-char overlap parameters.</p>
            </div>

            <ChevronRight className="hidden lg:block w-4 h-4 text-slate-700" />

            <div className="flex-1 bg-[#0D101C] border border-slate-900 p-2.5 rounded-lg space-y-1">
              <span className="text-indigo-400 font-semibold uppercase text-[9px] block">3. embedContent() API</span>
              <p className="text-[9px] leading-tight text-slate-500">Gemini generates 768-dimensional Float32 vector embeddings.</p>
            </div>

            <ChevronRight className="hidden lg:block w-4 h-4 text-slate-700" />

            <div className="flex-1 bg-[#0D101C] border border-slate-900 p-2.5 rounded-lg space-y-1">
              <span className="text-indigo-400 font-semibold uppercase text-[9px] block">4. Cosine Matcher</span>
              <p className="text-[9px] leading-tight text-slate-500">Calculates dot-products of active question versus record vectors.</p>
            </div>

            <ChevronRight className="hidden lg:block w-4 h-4 text-slate-700" />

            <div className="flex-1 bg-[#0D101C] border border-indigo-900/30 p-2.5 rounded-lg space-y-1">
              <span className="text-emerald-400 font-semibold uppercase text-[9px] block">5. generateContent()</span>
              <p className="text-[9px] leading-tight text-slate-500">Grinds citations and answer securely via Gemini Flash model.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
