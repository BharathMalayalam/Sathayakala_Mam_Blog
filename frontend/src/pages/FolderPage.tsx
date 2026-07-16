import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../utils';
import {
  FolderOpen, ChevronRight, ArrowLeft, Download,
  FileText, Image, Eye, X, Loader2, Filter,
  GraduationCap, FolderX
} from 'lucide-react';

interface FileItem {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  createdAt: string;
}

interface Subfolder {
  _id: string;
  name: string;
  description: string;
  fileCount: number;
  subfolderCount?: number;
}

interface FolderPathNode {
  _id: string;
  name: string;
}

interface FolderData {
  folder: { _id: string; name: string; description: string; parentFolderId?: string | null };
  files: FileItem[];
  subfolders: Subfolder[];
  path: FolderPathNode[];
}

export default function FolderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FolderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pdf' | 'image'>('all');
  const [viewer, setViewer] = useState<FileItem | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(getApiUrl(`/api/folders/${id}`))
      .then(r => r.json())
      .then(d => {
        if (d.folder) setData(d);
        else setError('Folder not found');
        setLoading(false);
      })
      .catch(() => {
        setError('Cannot connect to server.');
        setLoading(false);
      });
  }, [id]);

  const filtered = data?.files.filter(f => filter === 'all' || f.fileType === filter) ?? [];

  const handleDownload = (file: FileItem) => {
    const a = document.createElement('a');
    a.href = getApiUrl(file.fileUrl);
    a.download = file.fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f5] to-[#f0f4f8] font-sans"
      style={{ backgroundImage: 'radial-gradient(circle at 80% 10%, #ffe4e644 0%, transparent 40%), radial-gradient(circle at 5% 90%, #dbeafe44 0%, transparent 40%)' }}>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium flex-1">
            <button onClick={() => navigate('/')} className="hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <button onClick={() => navigate('/blog')} className="hover:text-rose-600 transition-colors cursor-pointer">
              Study Materials
            </button>
            {data?.path?.map((p, idx) => (
              <span key={p._id} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                {idx === data.path.length - 1 ? (
                  <span className="text-slate-800 font-semibold truncate max-w-[150px]">
                    {p.name}
                  </span>
                ) : (
                  <button onClick={() => navigate(`/blog/folder/${p._id}`)} className="hover:text-rose-600 transition-colors cursor-pointer">
                    {p.name}
                  </button>
                )}
              </span>
            ))}
            {!data && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-400">Loading...</span>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-sm">Loading folder...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <FolderX className="w-12 h-12 text-red-300" />
            <p className="text-slate-600 font-semibold">{error}</p>
            <button onClick={() => navigate('/blog')} className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-lg cursor-pointer">← Back</button>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Folder hero */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg">
                  <FolderOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">{data.folder.name}</h1>
                  {data.folder.description && (
                    <p className="text-slate-500 text-sm mt-0.5">{data.folder.description}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-6">
              {(['all', 'pdf', 'image'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-400/30'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
                  }`}
                >
                  {tab === 'all' ? `All (${data.files.length})` : tab === 'pdf' ? `PDF (${data.files.filter(f => f.fileType === 'pdf').length})` : `Images (${data.files.filter(f => f.fileType === 'image').length})`}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Subfolders section */}
            {data.subfolders && data.subfolders.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                  Subfolders ({data.subfolders.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.subfolders.map((sub, i) => (
                    <motion.div
                      key={sub._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/blog/folder/${sub._id}`)}
                      className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f43f5e] to-[#e11d48] flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-slate-900 text-sm truncate group-hover:text-rose-700 transition-colors">
                            {sub.name}
                          </h3>
                          {sub.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{sub.description}</p>
                          )}
                        </div>
                      </div>
                       <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full shrink-0">
                        {sub.subfolderCount ? `${sub.subfolderCount} dir${sub.subfolderCount > 1 ? 's' : ''} • ` : ''}{sub.fileCount} file{sub.fileCount !== 1 ? 's' : ''}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {(data.subfolders || []).length === 0 && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <FolderX className="w-10 h-10 text-slate-300" />
                <p className="text-slate-500 font-semibold">This folder is empty</p>
                <button onClick={() => navigate('/admin')} className="text-sm text-rose-600 hover:underline cursor-pointer">
                  Add subfolders or upload files as admin →
                </button>
              </div>
            )}

            {/* Files grid */}
            {filtered.length > 0 && (
              <div>
                {data.subfolders && data.subfolders.length > 0 && (
                  <h2 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 mt-8">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Files ({filtered.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((file, i) => (
                    <motion.div
                      key={file._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {/* File icon + type badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${file.fileType === 'pdf' ? 'bg-gradient-to-br from-red-400 to-rose-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                          {file.fileType === 'pdf'
                            ? <FileText className="w-6 h-6 text-white" />
                            : <Image className="w-6 h-6 text-white" />
                          }
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full uppercase tracking-wider ${file.fileType === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {file.fileType}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-slate-900 text-base mb-1 line-clamp-2 group-hover:text-rose-700 transition-colors">{file.title}</h3>
                      {file.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{file.description}</p>
                      )}
                      {!file.description && <div className="mb-4" />}

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => {
                            if (file.fileUrl.startsWith('http')) {
                              window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              setViewer(file);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/40 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>© 2026 Dr. M. Sathyakala — IRTT</span>
          <button onClick={() => navigate('/blog')} className="hover:text-blue-600 transition-colors cursor-pointer">← All Folders</button>
        </div>
      </footer>

      {/* File Viewer Modal */}
      <AnimatePresence>
        {viewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${viewer.fileType === 'pdf' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {viewer.fileType === 'pdf' ? <FileText className="w-4 h-4 text-red-600" /> : <Image className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{viewer.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{viewer.fileName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(viewer)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <button
                    onClick={() => setViewer(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal content */}
              <div className="flex-1 overflow-auto bg-slate-50 p-4">
                {viewer.fileType === 'pdf' ? (
                  <iframe
                    src={getApiUrl(viewer.fileUrl)}
                    className="w-full rounded-lg border border-slate-200"
                    style={{ height: 'calc(90vh - 120px)' }}
                    title={viewer.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <img
                      src={getApiUrl(viewer.fileUrl)}
                      alt={viewer.title}
                      className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
