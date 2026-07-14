import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn, LogOut, FolderPlus, Upload, Trash2, FolderOpen,
  FileText, Image, CheckCircle, XCircle, Loader2, GraduationCap,
  Eye, ChevronRight, Shield, AlertCircle, X
} from 'lucide-react';

interface Folder { _id: string; name: string; description: string; fileCount: number; }
interface FileItem { _id: string; title: string; fileType: string; fileName: string; fileUrl: string; }

type Toast = { id: number; message: string; type: 'success' | 'error' };

export default function AdminPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [folders, setFolders] = useState<Folder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [folderCreating, setFolderCreating] = useState(false);

  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [fileTitle, setFileTitle] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openFolder, setOpenFolder] = useState<{ folder: Folder; files: FileItem[] } | null>(null);
  const [folderFilesLoading, setFolderFilesLoading] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...((opts.headers as Record<string, string>) || {}), Authorization: `Bearer ${token}` } });

  const loadFolders = () => {
    setFoldersLoading(true);
    fetch('/api/folders')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setFolders(d); setFoldersLoading(false); })
      .catch(() => setFoldersLoading(false));
  };

  useEffect(() => { if (token) loadFolders(); }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Login failed');
      localStorage.setItem('admin_token', d.token);
      setToken(d.token);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setFolders([]);
    setOpenFolder(null);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setFolderCreating(true);
    try {
      const r = await authFetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim(), description: newFolderDesc.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast(`Folder "${newFolderName}" created!`);
      setNewFolderName('');
      setNewFolderDesc('');
      loadFolders();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setFolderCreating(false);
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (!confirm(`Delete folder "${folder.name}" and ALL its files? This cannot be undone.`)) return;
    try {
      const r = await authFetch(`/api/folders/${folder._id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error((await r.json()).error);
      toast(`Folder "${folder.name}" deleted`);
      if (openFolder?.folder._id === folder._id) setOpenFolder(null);
      loadFolders();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId || !fileTitle.trim() || !fileObj) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('title', fileTitle.trim());
      form.append('description', fileDesc.trim());
      form.append('file', fileObj);
      const r = await authFetch(`/api/upload/${selectedFolderId}`, { method: 'POST', body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast(`"${fileTitle}" uploaded!`);
      setFileTitle('');
      setFileDesc('');
      setFileObj(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadFolders();
      if (openFolder?.folder._id === selectedFolderId) loadFolderFiles(openFolder.folder);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const loadFolderFiles = async (folder: Folder) => {
    setFolderFilesLoading(true);
    const r = await fetch(`/api/folders/${folder._id}`);
    const d = await r.json();
    setOpenFolder({ folder, files: d.files || [] });
    setFolderFilesLoading(false);
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (!confirm(`Delete "${file.title}"?`)) return;
    try {
      const r = await authFetch(`/api/files/${file._id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error((await r.json()).error);
      toast(`"${file.title}" deleted`);
      if (openFolder) loadFolderFiles(openFolder.folder);
      loadFolders();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  // ── LOGIN SCREEN ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-white">Admin Login</h1>
            <p className="text-slate-400 text-sm mt-1">Academic Content Library — IRTT</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="admin@irttech.ac.in" required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••••" required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60" />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />{loginError}
                </div>
              )}
              <button type="submit" disabled={loginLoading}
                className="flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold rounded-xl transition-colors cursor-pointer text-sm">
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button onClick={() => navigate('/blog')} className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer">
                ← Back to Study Materials
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
              {t.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-extrabold text-base leading-none">Admin Dashboard</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Dr. M. Sathyakala — IRTT</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/blog')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
            <Eye className="w-3.5 h-3.5" /> View Site
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Create Folder */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <FolderPlus className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-display font-bold text-slate-900 text-base">Create Folder</h2>
            </div>
            <form onSubmit={handleCreateFolder} className="flex flex-col gap-3">
              <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g. DSA)" required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400" />
              <textarea value={newFolderDesc} onChange={e => setNewFolderDesc(e.target.value)}
                placeholder="Description (optional)" rows={2}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400" />
              <button type="submit" disabled={folderCreating || !newFolderName.trim()}
                className="flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer">
                {folderCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                {folderCreating ? 'Creating...' : 'Create Folder'}
              </button>
            </form>
          </div>

          {/* Upload File */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <Upload className="w-4 h-4 text-teal-600" />
              </div>
              <h2 className="font-display font-bold text-slate-900 text-base">Upload File</h2>
            </div>
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <select value={selectedFolderId} onChange={e => setSelectedFolderId(e.target.value)} required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 bg-white">
                <option value="">Select a folder...</option>
                {folders.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
              <input type="text" value={fileTitle} onChange={e => setFileTitle(e.target.value)}
                placeholder="File title" required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400" />
              <textarea value={fileDesc} onChange={e => setFileDesc(e.target.value)}
                placeholder="Description (optional)" rows={2}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400" />
              <label className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors group">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-teal-500 transition-colors" />
                <span className="text-xs text-slate-500 text-center">
                  {fileObj ? <span className="text-teal-600 font-semibold">{fileObj.name}</span>
                    : <>Click to select<br /><span className="text-slate-400">PDF, JPG, PNG (max 25MB)</span></>}
                </span>
                <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="sr-only"
                  onChange={e => setFileObj(e.target.files?.[0] ?? null)} />
              </label>
              <button type="submit" disabled={uploading || !selectedFolderId || !fileTitle.trim() || !fileObj}
                className="flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-violet-600" />
                </div>
                <h2 className="font-display font-bold text-slate-900 text-base">Folders ({folders.length})</h2>
              </div>
              {foldersLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>
            {folders.length === 0 && !foldersLoading && (
              <p className="text-sm text-slate-400 text-center py-6">No folders yet. Create one above.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {folders.map(folder => (
                <div key={folder._id}
                  className={`group border rounded-xl p-4 transition-all duration-200 cursor-pointer ${openFolder?.folder._id === folder._id ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'}`}
                  onClick={() => loadFolderFiles(folder)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderOpen className={`w-5 h-5 shrink-0 ${openFolder?.folder._id === folder._id ? 'text-amber-500' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{folder.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{folder.fileCount} file{folder.fileCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                      <button onClick={e => { e.stopPropagation(); handleDeleteFolder(folder); }}
                        className="p-1 hover:bg-red-100 rounded-md transition-colors text-slate-300 hover:text-red-500 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {openFolder && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-base">{openFolder.folder.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{openFolder.files.length} file{openFolder.files.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button onClick={() => setOpenFolder(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {folderFilesLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>}
                {!folderFilesLoading && openFolder.files.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">No files uploaded yet.</p>
                )}
                <div className="flex flex-col gap-2">
                  {openFolder.files.map(file => (
                    <div key={file._id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${file.fileType === 'pdf' ? 'bg-red-100' : 'bg-teal-100'}`}>
                        {file.fileType === 'pdf' ? <FileText className="w-4 h-4 text-red-500" /> : <Image className="w-4 h-4 text-teal-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{file.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{file.fileName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a href={file.fileUrl} target="_blank" rel="noreferrer"
                          className="p-1.5 hover:bg-blue-100 rounded-md transition-colors text-slate-300 hover:text-blue-500 cursor-pointer" title="View file">
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button onClick={() => handleDeleteFile(file)}
                          className="p-1.5 hover:bg-red-100 rounded-md transition-colors text-slate-300 hover:text-red-500 cursor-pointer" title="Delete file">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
