import React, { useState, useRef } from "react";
import { 
  FileText, Trash2, Plus, CheckCircle2, 
  UploadCloud, AlertCircle, RefreshCw, FileCode, Clipboard, FileCheck 
} from "lucide-react";
import { DocumentInfo } from "../types";

interface DocumentManagerProps {
  documents: DocumentInfo[];
  isLoading: boolean;
  onIngest: (name: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReset: () => Promise<void>;
}

export default function DocumentManager({ 
  documents, 
  isLoading, 
  onIngest, 
  onDelete, 
  onReset 
}: DocumentManagerProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedName, setPastedName] = useState("");
  const [pastedContent, setPastedContent] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const [ingestionSuccess, setIngestionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const allowedExtensions = ["txt", "md", "json", "csv", "xml", "html"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    
    if (!ext || !allowedExtensions.includes(ext)) {
      setIngestionError(`Unsupported file format. Please upload a plain-text file (.txt, .md, .json, .csv, .xml, .html)`);
      return;
    }

    setIsSubmitting(true);
    setIngestionError(null);
    setIngestionSuccess(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const textContent = e.target?.result as string;
        if (!textContent || textContent.trim() === "") {
          throw new Error("File is empty.");
        }
        await onIngest(file.name, textContent);
        setIngestionSuccess(`"${file.name}" indexed successfully!`);
      } catch (err) {
        setIngestionError(err instanceof Error ? err.message : "Failed to read or ingest file.");
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.onerror = () => {
      setIngestionError("Error reading file.");
      setIsSubmitting(false);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedName.trim() || !pastedContent.trim()) return;

    setIsSubmitting(true);
    setIngestionError(null);
    setIngestionSuccess(null);

    try {
      await onIngest(pastedName.trim(), pastedContent.trim());
      setIngestionSuccess(`"${pastedName}" indexed successfully!`);
      setPastedName("");
      setPastedContent("");
    } catch (err) {
      setIngestionError(err instanceof Error ? err.message : "Failed to ingest pasted content.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="document-manager" className="bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-sm shadow-inner overflow-hidden flex flex-col h-full text-slate-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/20">
        <div>
          <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            Knowledge Base
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Ingest files or text to train your local RAG agent.</p>
        </div>
        <button
          onClick={onReset}
          disabled={isLoading}
          className="text-xs font-medium text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 hover:bg-slate-800 rounded-xl px-2.5 py-1.5 transition-colors flex items-center gap-1 bg-slate-950/40 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Reset Demo
        </button>
      </div>

      {/* Main Tabs */}
      <div className="p-5 flex-1 flex flex-col overflow-y-auto space-y-5">
        {/* Tab Buttons */}
        <div className="flex bg-slate-950/60 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "upload" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            File Upload
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "paste" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            Paste Content
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1">
          {activeTab === "upload" ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-44 ${
                dragActive 
                  ? "border-indigo-500 bg-indigo-500/10" 
                  : "border-slate-800 hover:border-slate-700 hover:bg-slate-950/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".txt,.md,.json,.csv,.xml,.html"
                className="hidden"
              />
              <UploadCloud className={`w-8 h-8 mb-2.5 transition-transform ${dragActive ? "scale-110 text-indigo-400" : "text-slate-500"}`} />
              <p className="text-xs font-medium text-slate-300">
                {isSubmitting ? "Generating Embeddings..." : "Drag & drop file here, or click to browse"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                Plain text formats: .txt, .md, .csv, .json up to 10MB
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Employee Handbook Part 1"
                  value={pastedName}
                  onChange={(e) => setPastedName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full text-xs bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Text Content</label>
                <textarea
                  placeholder="Paste rules, articles, notes, FAQs, or arbitrary texts here..."
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full text-xs bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600/50 transition-colors resize-none font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !pastedName.trim() || !pastedContent.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md shadow-indigo-600/10"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Chunks & Embeddings...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Index Custom Text
                  </>
                )}
              </button>
            </form>
          )}

          {/* Feedback Messages */}
          {ingestionError && (
            <div className="mt-3.5 flex items-start gap-2 bg-red-950/20 text-red-400 p-3 rounded-xl text-xs border border-red-900/30">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-red-300">Ingestion Failed</p>
                <p className="text-[10px] text-red-400 mt-0.5 leading-relaxed">{ingestionError}</p>
              </div>
            </div>
          )}

          {ingestionSuccess && (
            <div className="mt-3.5 flex items-start gap-2 bg-emerald-950/20 text-emerald-400 p-3 rounded-xl text-xs border border-emerald-900/30">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300">{ingestionSuccess}</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 leading-relaxed">Embeddings generated successfully. Ready to answer questions!</p>
              </div>
            </div>
          )}
        </div>

        {/* Indexed Document List */}
        <div className="border-t border-slate-800/80 pt-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
              Indexed Source Documents ({documents.length})
            </h4>
          </div>

          {documents.length === 0 ? (
            <div className="flex-1 border border-slate-800 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <FileText className="w-6 h-6 text-slate-700 mb-1.5" />
              <p className="text-[11px] font-medium text-slate-500">No documents indexed</p>
              <p className="text-[10px] text-slate-600 mt-0.5 max-w-[180px]">Upload or paste a document to query your RAG agent.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="group flex items-center justify-between border border-slate-800 rounded-xl p-3 bg-slate-950/40 hover:bg-slate-900/40 hover:border-slate-700 transition-all shadow-2xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                        <span>{(doc.charCount / 1000).toFixed(1)}k chars</span>
                        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                        <span>{doc.chunkCount} chunks</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0 md:opacity-0 group-hover:opacity-100 focus:opacity-100 ml-2"
                    title="Delete source document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
