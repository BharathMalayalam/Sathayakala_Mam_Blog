import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../utils';
import {
  FolderOpen, ChevronRight, ArrowLeft, Download,
  FileText, Image, Eye, X, Loader2, Filter,
  GraduationCap, FolderX, Video, Music, File, Search
} from 'lucide-react';

interface FileItem {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
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

function getFileDetails(file: FileItem) {
  const ext = (file.fileName.split('.').pop() || '').toLowerCase();
  const typeOrExt = (file.fileType || ext).toLowerCase();

  if (typeOrExt === 'pdf') {
    return {
      category: 'pdf',
      colorClass: 'from-red-400 to-rose-500',
      badgeColor: 'bg-red-50 text-red-600',
      iconType: 'pdf',
    };
  }
  
  if (['image', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(typeOrExt)) {
    return {
      category: 'image',
      colorClass: 'from-blue-400 to-indigo-500',
      badgeColor: 'bg-blue-50 text-blue-600',
      iconType: 'image',
    };
  }

  if (['mp4', 'webm', 'ogg', 'mov'].includes(typeOrExt)) {
    return {
      category: 'video',
      colorClass: 'from-purple-400 to-pink-500',
      badgeColor: 'bg-purple-50 text-purple-600',
      iconType: 'video',
    };
  }

  if (['mp3', 'wav', 'aac', 'flac'].includes(typeOrExt)) {
    return {
      category: 'audio',
      colorClass: 'from-emerald-400 to-teal-500',
      badgeColor: 'bg-emerald-50 text-emerald-600',
      iconType: 'audio',
    };
  }

  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md'].includes(typeOrExt)) {
    return {
      category: 'document',
      colorClass: 'from-amber-400 to-orange-500',
      badgeColor: 'bg-amber-50 text-amber-600',
      iconType: 'document',
    };
  }

  return {
    category: 'other',
    colorClass: 'from-slate-400 to-slate-500',
    badgeColor: 'bg-slate-50 text-slate-600',
    iconType: 'other',
  };
}

export default function FolderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FolderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  const filtered = data?.files.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) ?? [];

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

            {/* Search Bar */}
            <div className="relative max-w-md mb-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search files by title or description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 font-mono font-bold bg-white border border-slate-200/80 px-3 py-2 rounded-xl shadow-sm">
                <span>{filtered.length} of {data.files.length} file{data.files.length !== 1 ? 's' : ''}</span>
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
                {/* Mobile view - row layout, one line, no icons */}
                <div className="flex flex-col gap-2.5 sm:hidden">
                  {filtered.map((file, i) => (
                    <motion.div
                      key={file._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-sm"
                    >
                      <h3 className="font-semibold text-slate-800 text-sm truncate flex-1 min-w-0 pr-2">
                        {file.title}
                      </h3>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            if (file.fileUrl.startsWith('http')) {
                              window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              setViewer(file);
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Download
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Desktop view - cards grid */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((file, i) => {
                    const details = getFileDetails(file);
                    return (
                      <motion.div
                        key={file._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      >
                        {/* File icon + type badge */}
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br ${details.colorClass}`}>
                            {details.iconType === 'pdf' && <FileText className="w-6 h-6 text-white" />}
                            {details.iconType === 'image' && <Image className="w-6 h-6 text-white" />}
                            {details.iconType === 'video' && <Video className="w-6 h-6 text-white" />}
                            {details.iconType === 'audio' && <Music className="w-6 h-6 text-white" />}
                            {details.iconType === 'document' && <FileText className="w-6 h-6 text-white" />}
                            {details.iconType === 'other' && <File className="w-6 h-6 text-white" />}
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full uppercase tracking-wider ${details.badgeColor}`}>
                            {file.fileType}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-slate-900 text-base mb-1 line-clamp-2 group-hover:text-rose-700 transition-colors">{file.title}</h3>
                        {file.description && (
                          <p className="text-sm text-slate-500 line-clamp-2 mb-4">{file.description}</p>
                        )}
                        {!file.description && <div className="mb-4 text-sm" />}

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
                    );
                  })}
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
                  {(() => {
                    const details = getFileDetails(viewer);
                    return (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${details.colorClass} shadow-sm shrink-0`}>
                        {details.iconType === 'pdf' && <FileText className="w-4 h-4 text-white" />}
                        {details.iconType === 'image' && <Image className="w-4 h-4 text-white" />}
                        {details.iconType === 'video' && <Video className="w-4 h-4 text-white" />}
                        {details.iconType === 'audio' && <Music className="w-4 h-4 text-white" />}
                        {details.iconType === 'document' && <FileText className="w-4 h-4 text-white" />}
                        {details.iconType === 'other' && <File className="w-4 h-4 text-white" />}
                      </div>
                    );
                  })()}
                  <div>
                    <p className="font-semibold text-slate-900 text-sm truncate max-w-[200px] sm:max-w-md">{viewer.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px] sm:max-w-md">{viewer.fileName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
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
                {(() => {
                  const details = getFileDetails(viewer);
                  const fileUrl = getApiUrl(viewer.fileUrl);

                  if (details.category === 'pdf') {
                    return (
                      <iframe
                        src={fileUrl}
                        className="w-full rounded-lg border border-slate-200 bg-white"
                        style={{ height: 'calc(90vh - 120px)' }}
                        title={viewer.title}
                      />
                    );
                  }

                  if (details.category === 'image') {
                    return (
                      <div className="flex items-center justify-center h-full min-h-[400px]">
                        <img
                          src={fileUrl}
                          alt={viewer.title}
                          className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
                        />
                      </div>
                    );
                  }

                  if (details.category === 'video') {
                    return (
                      <div className="flex items-center justify-center h-full min-h-[400px]">
                        <video
                          src={fileUrl}
                          controls
                          className="max-w-full max-h-[70vh] rounded-xl shadow-lg"
                        />
                      </div>
                    );
                  }

                  if (details.category === 'audio') {
                    return (
                      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-md">
                          <Music className="w-10 h-10" />
                        </div>
                        <audio
                          src={fileUrl}
                          controls
                          className="w-full max-w-md"
                        />
                      </div>
                    );
                  }

                  if (details.category === 'document') {
                    const isLocal = fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1') || fileUrl.startsWith('/');
                    const ext = (viewer.fileName.split('.').pop() || '').toLowerCase();
                    const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);

                    if (isOffice && !isLocal) {
                      const absoluteUrl = fileUrl.startsWith('http') ? fileUrl : window.location.origin + fileUrl;
                      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
                      return (
                        <iframe
                          src={officeUrl}
                          className="w-full rounded-lg border border-slate-200"
                          style={{ height: 'calc(90vh - 120px)' }}
                          title={viewer.title}
                        />
                      );
                    }

                    if (['txt', 'csv', 'md'].includes(ext)) {
                      return (
                        <iframe
                          src={fileUrl}
                          className="w-full rounded-lg border border-slate-200 bg-white p-4"
                          style={{ height: 'calc(90vh - 120px)' }}
                          title={viewer.title}
                        />
                      );
                    }
                  }

                  return (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-6 shadow-inner">
                        <File className="w-10 h-10" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 mb-2">Preview not available</h4>
                      <p className="text-sm text-slate-500 mb-6 max-w-sm">
                        This file format ({viewer.fileType}) cannot be previewed directly in the browser. Please download the file to view its content.
                      </p>
                      <button
                        onClick={() => handleDownload(viewer)}
                        className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-rose-500/20 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download File
                      </button>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
