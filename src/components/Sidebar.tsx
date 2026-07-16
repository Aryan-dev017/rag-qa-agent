import React, { useState } from "react";
import { 
  MessageSquare, Pin, Trash2, Edit3, Plus, Search, Folder, 
  ChevronDown, ChevronRight, UploadCloud, Clipboard, RefreshCw, 
  CheckCircle2, AlertCircle, FileText, Settings, Database, Server
} from "lucide-react";
import { Conversation, DocumentInfo, KnowledgeBase } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  
  knowledgeBases: KnowledgeBase[];
  activeKBId: string;
  onSelectKB: (id: string) => void;
  
  documents: DocumentInfo[];
  isLoadingDocs: boolean;
  onIngest: (name: string, content: string) => Promise<void>;
  onDeleteDoc: (id: string) => Promise<void>;
  onResetDocs: () => Promise<void>;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  
  knowledgeBases,
  activeKBId,
  onSelectKB,
  
  documents,
  isLoadingDocs,
  onIngest,
  onDeleteDoc,
  onResetDocs
}: SidebarProps) {
  const [chatSearch, setChatSearch] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isKBsExpanded, setIsKBsExpanded] = useState(true);
  const [isChatsExpanded, setIsChatsExpanded] = useState(true);
  
  // Document ingest state
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedName, setPastedName] = useState("");
  const [pastedContent, setPastedContent] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const [ingestionSuccess, setIngestionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKBManager, setShowKBManager] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Group conversations
  const filteredChats = conversations.filter(chat => 
    chat.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const unpinnedChats = filteredChats.filter(chat => !chat.isPinned);

  // Split unpinned by date
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

  const todayChats = unpinnedChats.filter(chat => new Date(chat.createdAt).toDateString() === today);
  const yesterdayChats = unpinnedChats.filter(chat => new Date(chat.createdAt).toDateString() === yesterday);
  const olderChats = unpinnedChats.filter(chat => {
    const dStr = new Date(chat.createdAt).toDateString();
    return dStr !== today && dStr !== yesterday;
  });

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

  const startRename = (chatId: string, title: string) => {
    setEditingChatId(chatId);
    setEditingTitle(title);
  };

  const saveRename = (chatId: string) => {
    if (editingTitle.trim()) {
      onRenameConversation(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const activeKB = knowledgeBases.find(kb => kb.id === activeKBId) || knowledgeBases[0];

  return (
    <div id="sidebar" className="w-80 border-r border-slate-900 bg-[#0A0D16] flex flex-col h-full shrink-0 select-none">
      {/* Brand Logo & New Chat */}
      <div className="p-4 border-b border-slate-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20">
            R
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-white font-display">ragent.ai</span>
            <span className="block text-[9px] text-slate-500 uppercase font-mono tracking-widest mt-0.5">Workspace V2</span>
          </div>
        </div>
        <button 
          onClick={onNewConversation}
          className="p-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-lg transition-all flex items-center gap-1 text-xs font-medium"
          title="Start new workspace chat"
        >
          <Plus className="w-4 h-4" />
          <span className="pr-1">New</span>
        </button>
      </div>

      {/* Conversations and Knowledge Base Toggle Panel */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Chats Segment */}
        <div className="space-y-1">
          <button 
            onClick={() => setIsChatsExpanded(!isChatsExpanded)}
            className="w-full flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider hover:text-slate-300 py-1.5 px-2"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              Chat Conversations ({conversations.length})
            </span>
            {isChatsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {isChatsExpanded && (
            <div className="space-y-1 mt-1">
              {/* Chat Search */}
              <div className="relative mx-1.5 mb-2">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full text-[11px] pl-8 pr-3 py-1.5 bg-slate-950/40 border border-slate-900 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition-all font-sans"
                />
              </div>

              {conversations.length === 0 ? (
                <div className="text-center py-4 border border-slate-900/40 border-dashed rounded-xl m-1.5">
                  <p className="text-[10px] text-slate-600 font-medium">No chat sessions</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {/* Pinned Chats */}
                  {pinnedChats.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold text-slate-600 px-2 flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5 text-indigo-400 rotate-45" /> Pinned
                      </div>
                      {pinnedChats.map(chat => renderChatRow(chat))}
                    </div>
                  )}

                  {/* Today */}
                  {todayChats.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold text-slate-600 px-2">Today</div>
                      {todayChats.map(chat => renderChatRow(chat))}
                    </div>
                  )}

                  {/* Yesterday */}
                  {yesterdayChats.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold text-slate-600 px-2">Yesterday</div>
                      {yesterdayChats.map(chat => renderChatRow(chat))}
                    </div>
                  )}

                  {/* Older */}
                  {olderChats.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold text-slate-600 px-2">Older</div>
                      {olderChats.map(chat => renderChatRow(chat))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Knowledge Base Segment */}
        <div className="space-y-1 border-t border-slate-900/60 pt-3">
          <button 
            onClick={() => setIsKBsExpanded(!isKBsExpanded)}
            className="w-full flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider hover:text-slate-300 py-1.5 px-2"
          >
            <span className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-500" />
              Document Intelligence ({documents.length})
            </span>
            {isKBsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {isKBsExpanded && (
            <div className="space-y-3.5 p-1 mt-1">
              {/* KB Selector Dropdown */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Active Knowledge Context</label>
                <div className="flex gap-1">
                  <select
                    value={activeKBId}
                    onChange={(e) => onSelectKB(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer font-sans"
                  >
                    {knowledgeBases.map(kb => (
                      <option key={kb.id} value={kb.id}>🗂️ {kb.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setShowKBManager(!showKBManager)}
                    className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors text-xs"
                    title="Knowledge base settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {showKBManager && (
                  <div className="p-2.5 bg-slate-950/60 border border-indigo-500/10 rounded-lg text-[10px] text-slate-400 space-y-1.5 mt-1 font-sans leading-relaxed">
                    <p className="font-semibold text-slate-300">About Context Partitioning</p>
                    <p>Documents are linked directly with this active knowledge base namespace in your local browser workspace, providing compartmentalized semantic workspaces.</p>
                  </div>
                )}
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                  <span>Ingest New Source</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setActiveTab("upload")} 
                      className={`hover:text-white ${activeTab === "upload" ? "text-indigo-400 font-extrabold" : "text-slate-600"}`}
                    >
                      File
                    </button>
                    <span className="text-slate-800">|</span>
                    <button 
                      onClick={() => setActiveTab("paste")} 
                      className={`hover:text-white ${activeTab === "paste" ? "text-indigo-400 font-extrabold" : "text-slate-600"}`}
                    >
                      Paste
                    </button>
                  </div>
                </div>

                {activeTab === "upload" ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/20 ${
                      dragActive 
                        ? "border-indigo-600 bg-indigo-600/5" 
                        : "border-slate-900 hover:border-slate-800 hover:bg-slate-950/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".txt,.md,.json,.csv,.xml,.html"
                      className="hidden"
                    />
                    <UploadCloud className={`w-6 h-6 mb-1 transition-transform ${dragActive ? "scale-110 text-indigo-400" : "text-slate-600"}`} />
                    <p className="text-[10px] font-semibold text-slate-300">
                      {isSubmitting ? "Indexing..." : "Drag file or click here"}
                    </p>
                    <p className="text-[9px] text-slate-600 mt-0.5 leading-none">
                      .txt, .md, .csv up to 10MB
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePasteSubmit} className="space-y-2 bg-slate-950/20 border border-slate-900 rounded-xl p-2">
                    <input
                      type="text"
                      placeholder="Doc Title (e.g. FAQ.txt)"
                      value={pastedName}
                      onChange={(e) => setPastedName(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full text-[10px] bg-slate-950 border border-slate-900 rounded-lg px-2 py-1 text-slate-200 placeholder:text-slate-700 focus:outline-hidden focus:border-indigo-600 transition-colors font-sans"
                    />
                    <textarea
                      placeholder="Paste arbitrary text content here..."
                      value={pastedContent}
                      onChange={(e) => setPastedContent(e.target.value)}
                      required
                      disabled={isSubmitting}
                      rows={2}
                      className="w-full text-[10px] bg-slate-950 border border-slate-900 rounded-lg px-2 py-1 text-slate-200 placeholder:text-slate-700 focus:outline-hidden focus:border-indigo-600 transition-colors resize-none font-sans"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !pastedName.trim() || !pastedContent.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1 rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Ingesting...
                        </>
                      ) : (
                        "Index Text"
                      )}
                    </button>
                  </form>
                )}

                {/* Feedback notifications */}
                {ingestionError && (
                  <div className="p-2 mt-1 flex items-start gap-1.5 bg-red-950/25 border border-red-900/30 rounded-lg text-[9px] text-red-400">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    <p className="leading-tight font-sans">{ingestionError}</p>
                  </div>
                )}
                {ingestionSuccess && (
                  <div className="p-2 mt-1 flex items-start gap-1.5 bg-emerald-950/25 border border-emerald-900/30 rounded-lg text-[9px] text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                    <p className="leading-tight font-sans">{ingestionSuccess}</p>
                  </div>
                )}
              </div>

              {/* Indexed Files List */}
              <div className="space-y-1">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center justify-between">
                  <span>Context Files ({documents.length})</span>
                  <button 
                    onClick={onResetDocs} 
                    disabled={isLoadingDocs}
                    className="text-[8px] font-extrabold text-indigo-400 hover:text-white uppercase tracking-wider flex items-center gap-0.5 disabled:opacity-40 bg-slate-950/20 border border-slate-900 px-1 py-0.5 rounded-md"
                  >
                    <RefreshCw className={`w-2 h-2 ${isLoadingDocs ? "animate-spin" : ""}`} /> Clear All
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-5 border border-slate-900/40 border-dashed rounded-xl">
                    <FileText className="w-5 h-5 text-slate-700 mx-auto mb-1" />
                    <p className="text-[9px] text-slate-600 font-medium">No source documents loaded</p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {documents.map(doc => (
                      <div 
                        key={doc.id}
                        className="group flex items-center justify-between border border-slate-900/50 hover:border-slate-800 rounded-lg p-2 bg-slate-950/10 hover:bg-slate-950/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-medium text-slate-300 truncate" title={doc.name}>{doc.name}</p>
                            <p className="text-[8px] text-slate-600 font-mono mt-0.5">{doc.chunkCount} chunks • {(doc.charCount / 1000).toFixed(1)}k chars</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteDoc(doc.id)}
                          className="p-1 text-slate-600 hover:text-red-400 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete from vector store"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer with Stats / Server info */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/20 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3 text-emerald-500" /> API STATUS
          </span>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span> ONLINE
          </span>
        </div>
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-indigo-400" /> MEMORY DB
          </span>
          <span className="text-indigo-300 font-bold">{documents.reduce((acc, d) => acc + d.chunkCount, 0)} Vectors</span>
        </div>
      </div>
    </div>
  );

  // Helper render for row
  function renderChatRow(chat: Conversation) {
    const isActive = chat.id === activeConversationId;
    const isEditing = editingChatId === chat.id;

    return (
      <div 
        key={chat.id}
        onClick={() => !isEditing && onSelectConversation(chat.id)}
        className={`group flex items-center justify-between rounded-lg p-2 transition-all cursor-pointer ${
          isActive 
            ? "bg-indigo-600/10 text-white border border-indigo-500/15" 
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/30 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => saveRename(chat.id)}
              onKeyDown={(e) => e.key === "Enter" && saveRename(chat.id)}
              autoFocus
              className="flex-1 bg-slate-950 border border-slate-800 text-[11px] px-1 py-0.5 rounded-sm text-white focus:outline-hidden focus:border-indigo-500"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-[11px] font-medium truncate leading-tight">{chat.title}</span>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinConversation(chat.id);
              }}
              className={`p-1 hover:text-indigo-400 rounded-md transition-colors ${chat.isPinned ? "text-indigo-400" : "text-slate-600"}`}
              title={chat.isPinned ? "Unpin chat" : "Pin chat"}
            >
              <Pin className={`w-3 h-3 ${chat.isPinned ? "" : "rotate-45"}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRename(chat.id, chat.title);
              }}
              className="p-1 hover:text-indigo-400 text-slate-600 rounded-md transition-colors"
              title="Rename conversation"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(chat.id);
              }}
              className="p-1 hover:text-red-400 text-slate-600 rounded-md transition-colors"
              title="Delete conversation"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }
}
