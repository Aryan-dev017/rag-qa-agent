import React, { useEffect, useRef } from "react";
import { 
  BookOpen, Hash, Tag, FileText, Activity, AlertCircle, X,
  ExternalLink, BarChart3, Minimize2
} from "lucide-react";
import { SourceCitation } from "../types";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  highlightedSource: SourceCitation | null;
  onClearHighlight: () => void;
  allCitations: SourceCitation[];
}

export default function RightPanel({
  isOpen,
  onClose,
  highlightedSource,
  onClearHighlight,
  allCitations
}: RightPanelProps) {
  const highlightedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightedSource && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedSource]);

  if (!isOpen) return null;

  return (
    <div id="right-panel" className="w-80 border-l border-slate-900 bg-[#0A0D16] flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-xs text-white uppercase tracking-wider font-display">Semantic Inspector</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-slate-500 hover:text-white hover:bg-slate-950 rounded-md transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Highlighted Citation Alert */}
        {highlightedSource && (
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Selected Citation Context</span>
              <button 
                onClick={onClearHighlight}
                className="text-[9px] text-slate-400 hover:text-white underline"
              >
                Clear
              </button>
            </div>
            <p className="text-[10px] text-slate-300 font-sans italic leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-indigo-500/10">
              "{highlightedSource.text}"
            </p>
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-500">
              <span>Similarity: {(highlightedSource.score * 100).toFixed(1)}%</span>
              <span>Chunk {highlightedSource.index}</span>
            </div>
          </div>
        )}

        {/* Chunks List */}
        <div className="space-y-3">
          <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center justify-between">
            <span>Retrieved Grounding Chunks ({allCitations.length})</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </h4>

          {allCitations.length === 0 ? (
            <div className="text-center py-12 border border-slate-900/60 border-dashed rounded-xl p-4">
              <BarChart3 className="w-6 h-6 text-slate-700 mx-auto mb-2" />
              <p className="text-[10px] text-slate-600 font-medium font-sans">No query citations loaded</p>
              <p className="text-[9px] text-slate-700 leading-normal mt-1 font-sans">Ask a question first to inspect the vector database search match outputs here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allCitations.map((source, idx) => {
                const isHighlighted = highlightedSource?.chunkId === source.chunkId;
                const percentScore = (source.score * 100).toFixed(1);
                
                return (
                  <div
                    key={source.chunkId}
                    ref={isHighlighted ? highlightedRef : null}
                    className={`border rounded-xl p-3 transition-all space-y-2 bg-slate-950/20 ${
                      isHighlighted
                        ? "border-indigo-500 bg-indigo-500/5 shadow-inner"
                        : "border-slate-900/80 hover:border-slate-800 hover:bg-slate-950/40"
                    }`}
                  >
                    {/* Header bar */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span className="font-semibold text-slate-300 truncate max-w-[130px]" title={source.docName}>
                        {idx + 1}. {source.docName}
                      </span>
                      <span className={`px-1 rounded-sm font-semibold ${
                        source.score > 0.7 
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20" 
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}>
                        {percentScore}% Match
                      </span>
                    </div>

                    {/* Progress score bar */}
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          source.score > 0.7 ? "bg-emerald-500" : "bg-indigo-500"
                        }`} 
                        style={{ width: `${percentScore}%` }}
                      />
                    </div>

                    {/* Content text */}
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans bg-slate-950/40 p-2 rounded-lg border border-slate-900/40 italic">
                      "{source.text}"
                    </p>

                    {/* Metadata details */}
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-600">
                      <span className="flex items-center gap-0.5">
                        <Hash className="w-2.5 h-2.5" /> Index {source.index}
                      </span>
                      <span className="flex items-center gap-0.5" title={source.chunkId}>
                        <Tag className="w-2.5 h-2.5" /> ID: {source.chunkId.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Vector Stats Summary Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/20 space-y-1.5 text-[9px] text-slate-500 font-mono">
        <p className="font-bold text-slate-400 border-b border-slate-900 pb-1 uppercase tracking-widest mb-1.5 flex items-center justify-between">
          <span>Search Analytics</span> <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
        </p>
        <div className="flex justify-between">
          <span>Similarity Metric:</span>
          <span className="text-slate-300 font-semibold">Cosine Angle</span>
        </div>
        <div className="flex justify-between">
          <span>Retrieval Limit (k):</span>
          <span className="text-slate-300 font-semibold">4 Chunks</span>
        </div>
        <div className="flex justify-between">
          <span>Vector Dimensions:</span>
          <span className="text-indigo-400 font-semibold">768 Float32</span>
        </div>
      </div>
    </div>
  );
}
