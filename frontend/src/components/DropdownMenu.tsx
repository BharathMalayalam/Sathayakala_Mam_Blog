/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, LogIn, CircleUser, FolderOpen } from 'lucide-react';

interface DropdownMenuProps {
  onNavigate: (section: 'home' | 'about' | 'blog' | 'contact' | 'signin') => void;
}

export default function DropdownMenu({ onNavigate }: DropdownMenuProps) {
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
        className="flex items-center gap-1.5 p-1.5 pr-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-full shadow-sm hover:shadow transition-all duration-300 text-slate-700 font-medium group cursor-pointer"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
          <CircleUser className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-slate-700">
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
                  onNavigate('home');
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
