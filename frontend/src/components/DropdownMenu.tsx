/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, User, BookOpen, Mail, LogIn, CircleUser, FolderOpen } from 'lucide-react';

interface DropdownMenuProps {
  onNavigate: (section: 'home' | 'about' | 'blog' | 'contact' | 'signin') => void;
}

export default function DropdownMenu({ onNavigate }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div 
      className="relative z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        id="dropdown-profile-btn"
        className="flex items-center gap-1.5 p-1.5 pr-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-full shadow-sm hover:shadow transition-all duration-300 text-slate-700 font-medium group cursor-pointer"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
          <CircleUser className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-slate-700">
          Faculty Menu
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="dropdown-menu-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 origin-top-right overflow-hidden"
          >
            <div className="px-3.5 py-1 text-[10px] font-bold font-mono tracking-wider text-blue-600 uppercase border-b border-slate-100 mb-1">
              Portal Access
            </div>
            
            <button
              id="nav-home-btn"
              onClick={() => {
                onNavigate('home');
                navigate('/');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:text-primary-500 hover:bg-slate-50 transition-colors text-left font-sans cursor-pointer group"
            >
              <Home className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
              <span>Home</span>
            </button>
 
            <button
              id="nav-blog-btn"
              onClick={() => {
                navigate('/blog');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left font-sans cursor-pointer group"
            >
              <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
              <span>Blogs</span>
            </button>
            <div className="h-px bg-slate-100 my-1" />

            <button
              id="nav-signin-btn"
              onClick={() => {
                navigate('/admin');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:text-accent-500 hover:bg-slate-50 transition-colors text-left font-semibold cursor-pointer group"
            >
              <LogIn className="w-4 h-4 text-slate-400 group-hover:text-accent-500 transition-colors" />
              <span>Sign In</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
