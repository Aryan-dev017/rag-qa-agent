import React, { useState } from "react";
import { Database, Search, Filter, Info, FileText, Tag, Hash } from "lucide-react";
import { ChunkInfo, DocumentInfo } from "../types";

interface ChunkExplorerProps {
  chunks: ChunkInfo[];
  documents: DocumentInfo[];
  isLoading: boolean;
}

export default function ChunkExplorer({ chunks, documents, isLoading }: ChunkExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string>("all");
  const [selectedChunk, setSelectedChunk] = useState<ChunkInfo | null>(null);

  // Filter chunks based on search query and document filter
  const filteredChunks = chunks.filter(chunk => {
    const matchesSearch = chunk.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDoc = selectedDocId === "all" || chunk.docId === selectedDocId;
    return matchesSearch && matchesDoc;
  });

  return (
    <div id="chunk-explorer" className="bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-sm shadow-inner flex flex-col h-full overflow-hidden text-slate-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-950/20 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Vector Store Inspector
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Explore how raw documents are split into overlapping text chunks.</p>
        </div>
      </div>

      {/* Control Filters */}
      <div className="p-4 border-b border-slate-800/60 bg-[#0c101d]/10 flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search chunk text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 transition-all"
          />
        </div>
        <div className="sm:w-52 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-300 focus:outline-hidden focus:border-indigo-500 transition-all"
          >
            <option value="all">All Documents</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Contents */}
      <div className="flex-1 p-5 flex flex-col lg:flex-row gap-5 min-h-0 overflow-y-auto">
        {/* Left Hand: Chunk List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Index Chunks ({filteredChunks.length})
            </span>
          </div>

          {filteredChunks.length === 0 ? (
            <div className="flex-1 border border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <Database className="w-7 h-7 text-slate-700 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No chunks match filters</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Try clearing your search query or uploading more documents.</p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1.5 font-sans">
              {filteredChunks.map(chunk => {
                const isSelected = selectedChunk?.id === chunk.id;
                return (
                  <button
                    key={chunk.id}
                    onClick={() => setSelectedChunk(chunk)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                      isSelected 
                        ? "border-indigo-600 bg-indigo-600/10 shadow-inner" 
                        : "border-slate-800/80 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/30"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full text-[10px] text-slate-500 font-mono">
                      <span className="font-semibold text-indigo-400 truncate max-w-[200px]" title={chunk.docName}>
                        {chunk.docName}
                      </span>
                      <span className="bg-slate-850 border border-slate-800 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5 text-slate-300">
                        <Hash className="w-2.5 h-2.5" /> Chunk {chunk.index}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {chunk.text}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Hand: Selected Chunk Details Inspector */}
        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-5 lg:pt-0 lg:pl-5 shrink-0 flex flex-col min-h-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2 block">
            Chunk Metadata Inspector
          </span>

          {selectedChunk ? (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex-1 overflow-y-auto space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Parent Document</h4>
                    <p className="text-xs text-slate-400 truncate max-w-[220px]" title={selectedChunk.docName}>
                      {selectedChunk.docName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Chunk Identifier</h4>
                    <p className="text-xs text-indigo-300 font-mono">
                      {selectedChunk.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Document Index</h4>
                    <p className="text-xs text-slate-400">
                      Segment #{selectedChunk.index}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  Raw Chunk Content ({selectedChunk.text.length} chars)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/45 border border-slate-800 p-3 rounded-xl font-sans italic shadow-inner max-h-72 overflow-y-auto">
                  "{selectedChunk.text}"
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-6 text-center flex-1 flex flex-col items-center justify-center">
              <Info className="w-6 h-6 text-slate-700 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No chunk selected</p>
              <p className="text-[10px] text-slate-600 mt-0.5 max-w-[200px]">Click any chunk on the left list to inspect its vector metadata details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
