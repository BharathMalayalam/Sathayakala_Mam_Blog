/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, LogIn, Menu, FolderOpen } from 'lucide-react';

export default function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div
      className="relative z-50"
      ref={containerRef}
    >
      <button
        id="dropdown-profile-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 text-white font-medium group cursor-pointer shadow-lg backdrop-blur-md"
        aria-label="User profile menu"
      >
        <Menu className="w-4 h-4 text-white/80 group-hover:scale-105 transition-transform" />
        <span className="text-sm font-semibold tracking-wide text-white">
          Menu
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="dropdown-menu-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full -mt-2 pt-2 w-52 z-50 origin-top-right"
          >
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl py-2 overflow-hidden">
              <div className="px-3.5 py-1 text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase border-b border-slate-100 mb-1">
                Portal Access
              </div>

              <button
                id="nav-home-btn"
                onClick={() => handleItemClick(() => {
                  navigate('/');
                })}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors text-left font-sans cursor-pointer group"
              >
                <Home className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition-colors" />
                <span>Home</span>
              </button>

              <button
                id="nav-blog-btn"
                onClick={() => handleItemClick(() => {
                  navigate('/blog');
                })}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors text-left font-sans cursor-pointer group"
              >
                <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition-colors" />
                <span>Blogs</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                id="nav-signin-btn"
                onClick={() => handleItemClick(() => {
                  navigate('/admin');
                })}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors text-left font-semibold cursor-pointer group"
              >
                <LogIn className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition-colors" />
                <span>Sign In</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
