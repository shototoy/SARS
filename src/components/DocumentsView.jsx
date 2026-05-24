import React, { useState } from 'react';
import { Download, FileText, Folder, Search, Filter, Plus, Trash2, X, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Upload, FilePlus } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { getApiBase } from '../lib/api';

export default function DocumentsView({ user, documents = [], onAdd, onDelete, courses = [] }) {
  const [search, setSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const colors = useTheme();

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.folder_name && d.folder_name.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = filtered.reduce((acc, d) => {
    const f = d.folder_name || 'General';
    if (!acc[f]) acc[f] = [];
    acc[f].push(d);
    return acc;
  }, {});

  const handleDownload = (doc) => {
    const url = `${getApiBase()}/uploads/repository/${encodeURIComponent(doc.name)}`;
    window.open(url, '_blank');
    setDownloadInfo(doc);
    setTimeout(() => setDownloadInfo(null), 3000);
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 px-0 relative overflow-hidden">
      {}
      <div className="flex items-center gap-3 px-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search repository..."
            className="w-full rounded-2xl border border-gray-100 bg-white py-2.5 pl-9 pr-4 text-xs font-semibold outline-none focus:ring-2 dark:border-gray-800 dark:bg-gray-950"
            style={{ focusRingColor: colors.main }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg transition hover:scale-105 active:scale-95"
          style={{ backgroundColor: colors.main }}
        >
          <FilePlus size={18} />
        </button>
      </div>

      {}
      <div className="flex-1 overflow-auto pb-4 px-4 scrollbar-hide">
        <div className="flex flex-col w-full space-y-3">
          {Object.entries(grouped).map(([folder, docs]) => {
            const isExpanded = expandedFolders[folder] !== false;
            return (
              <div key={folder} className="w-full overflow-hidden rounded-[22px] border border-gray-50 bg-white shadow-sm dark:border-gray-900 dark:bg-gray-950">
                {}
                <button
                  onClick={() => toggleFolder(folder)}
                  className="flex w-full items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-900" style={{ color: colors.main }}>
                      <Folder size={16} fill={isExpanded ? 'currentColor' : 'none'} />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                        {folder === user.username ? 'My Files' : folder}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400">{docs.length} Items</p>
                    </div>
                  </div>
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} className="text-gray-300" />
                  </div>
                </button>

                {}
                <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col w-full divide-y divide-gray-50 dark:divide-gray-900 border-t border-gray-50 dark:border-gray-900">
                    {docs.map(doc => (
                      <div key={doc.id} className="group relative flex w-full items-center p-3 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                        <div className="flex items-center gap-3 min-w-0 pr-16">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-900">
                            <FileText className="text-gray-400" size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black text-gray-900 dark:text-gray-100">{doc.name}</p>
                            <div className="mt-0.5 flex items-center gap-2 text-[9px] font-bold text-gray-400">
                              <span>{doc.size}</span>
                              <span className="h-0.5 w-0.5 rounded-full bg-gray-200" />
                              <span>{new Date(doc.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-900 transition-all hover:scale-110 active:scale-95"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          {doc.author_id === user.id && (
                            <button
                              onClick={() => setDeleteConfirm(doc)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:bg-gray-900 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {}
      {showUploadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl dark:bg-gray-950 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black mb-6">Upload Document</h2>
            <div className="space-y-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-gray-400">File Name</label>
                 <input id="up-name" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold outline-none dark:border-gray-800 dark:bg-gray-900" placeholder="e.g. Midterm Syllabus" />
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-gray-400">Folder</label>
                 <select id="up-folder" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold outline-none dark:border-gray-800 dark:bg-gray-900">
                   {user.role === 'admin' && (
                     <>
                       <option value="Announcements">Announcements</option>
                       <option value="Events">Events</option>
                     </>
                   )}
                   {user.role === 'faculty' && (
                     <>
                       {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                     </>
                   )}
                   <option value={user.username}>Personal Folder</option>
                 </select>
               </div>

               <div className="p-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[24px] flex flex-col items-center justify-center gap-3 bg-gray-50/30">
                 <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                   <Upload size={18} className="text-gray-300" />
                 </div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Drag & Drop or Click to Upload</p>
               </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 rounded-2xl bg-gray-50 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:bg-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = document.getElementById('up-name').value;
                  const folderName = document.getElementById('up-folder').value;
                  if (name) {
                    onAdd({ name, folderName, size: '240 KB', type: 'application/pdf', authorId: user.id });
                    setShowUploadModal(false);
                  }
                }}
                className="flex-1 rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95"
                style={{ backgroundColor: colors.main }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl dark:bg-gray-950 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Delete File?</h3>
              <p className="mt-2 text-sm font-bold text-gray-500 leading-relaxed">
                You are about to delete <span className="text-gray-900 dark:text-gray-100">"{deleteConfirm.name}"</span>. This action cannot be undone.
              </p>

              <div className="mt-8 flex w-full gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-2xl bg-gray-50 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:bg-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDelete(deleteConfirm.id); setDeleteConfirm(null); }}
                  className="flex-1 rounded-2xl bg-red-500 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {downloadInfo && (
        <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-2xl bg-white p-4 shadow-2xl border border-gray-100 dark:bg-gray-950 dark:border-gray-800 animate-in slide-in-from-right-10 duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-950/30">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Starting Download</p>
            <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate max-w-[150px]">{downloadInfo.name}</p>
          </div>
          <button onClick={() => setDownloadInfo(null)} className="ml-2 text-gray-300 hover:text-gray-500"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
