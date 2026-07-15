/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Brain,
  BookOpen,
  Phone,
  Mail,
  ArrowUpRight,
  Sparkles,
  Copy,
  BookMarked,
  Briefcase
} from 'lucide-react';

// Data imports
import { CONTACT_INFO } from './data';

// Component imports
import DropdownMenu from './components/DropdownMenu';

// Page imports
import BlogPage from './pages/BlogPage';
import FolderPage from './pages/FolderPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const navigate = useNavigate();

  // Copy status feedback states
  const [copiedType, setCopiedType] = useState<'email' | 'phone' | null>(null);

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDropdownNavigate = (_section: string) => {
    // Navigation handled by DropdownMenu internally via useNavigate
  };

  return (
    <Routes>
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/folder/:id" element={<FolderPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/" element={
        <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-gradient-to-br from-[#fff5f5] to-[#f0f4f8] relative overflow-x-hidden font-sans flex flex-col text-slate-800" style={{ backgroundImage: 'radial-gradient(circle at 78% 15%, #ffe4e655 0%, transparent 42%), radial-gradient(circle at 8% 85%, #dbeafe55 0%, transparent 42%)' }}>

          {/* HEADER NAVBAR */}
          <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-40">

            {/* Left: Academic Logo & Simplified branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-slate-900 text-lg tracking-tight">
                M. Sathyakala<span className="text-blue-600 font-light">.</span>
              </span>
            </div>

            {/* Right: Only one menu item (Blog) + Profile icon dropdown */}
            <div className="flex items-center gap-6">
              <nav>
                <button
                  id="navbar-blog-link"
                  onClick={() => navigate('/blog')}
                  className="text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-100/60"
                >
                  <BookMarked className="w-4 h-4 text-rose-500" />
                  <span>Blog</span>
                </button>
              </nav>

              <div className="h-4 w-px bg-slate-200" />

              {/* Profile Dropdown Menu */}
              <DropdownMenu onNavigate={handleDropdownNavigate} />
            </div>
          </header>

          {/* MAIN HERO SPLIT CONTENT */}
          <main className="flex-grow max-w-7xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-center relative z-10 py-4 md:py-0">

            {/* LEFT SECTION: TEXT CONTENT */}
            <div className="flex flex-col items-start gap-4 lg:gap-5">
              {/* Dr. Name Headings - styled like reference bold name */}
              <div className="space-y-1 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  className="text-lg font-semibold text-slate-500 tracking-wide"
                >
                  I'm
                </motion.div>
                <motion.h1
                  id="hero-main-title"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold leading-tight tracking-tight"
                >
                  <span className="text-slate-900">Dr. M.</span>{' '}
                  <span className="text-rose-500" style={{ textDecoration: 'underline', textDecorationColor: '#be123c', textUnderlineOffset: '6px' }}>Sathyakala</span>
                </motion.h1>

                <motion.p
                  id="hero-subtitle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg sm:text-xl font-bold text-slate-700 pt-1"
                >
                  Assistant Professor | <span className="font-normal text-slate-500">Dept. Of IT, IRTT</span>
                </motion.p>
              </div>

              {/* Description */}
              <motion.p
                id="hero-bio-text"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg font-normal"
              >
                Experienced academic professional specializing in <strong className="text-slate-800">Data Mining</strong> with 15 years of teaching expertise. Actively involved in research, student mentorship, and scholarly publications at IRTT, Erode.
              </motion.p>

              {/* ACTION BUTTONS - like "View My Work" and "Get Resume" in reference */}
              <motion.div
                id="hero-action-buttons"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  id="hero-view-blog-btn"
                  onClick={() => navigate('/blog')}
                  className="px-7 py-3.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl shadow-lg shadow-rose-400/30 hover:shadow-rose-400/50 transition-all flex items-center gap-2 cursor-pointer group text-base"
                >
                  <span>Blog</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </motion.div>

              {/* Status row - like "Available for hire | Location" in reference */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-rose-500">📍</span>
                  <span>Erode, Tamil Nadu, India</span>
                </span>
              </motion.div>
            </div>

            {/* RIGHT SECTION: FULL COVER IMAGE + HOVER INFO CARD */}
            <div className="relative w-full h-[450px] md:h-[90%] lg:h-[95%] rounded-3xl overflow-hidden group shadow-2xl border-4 border-white bg-rose-50">
              
              {/* Profile Image (Full cover) */}
              <img
                src="/src/assets/images/professor_headshot_1784005958601.jpg"
                alt="Dr. M. Sathyakala"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Ambient overlay/vignette always present but subtle */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 pointer-events-none" />

              {/* Verified badge floating on top-right */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-md px-4 py-1.5 rounded-full flex items-center gap-1.5 z-20">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-widest">Verified Faculty</span>
              </div>

              {/* Hover Triggered Info Card Overlay */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 md:p-6 backdrop-blur-[2px]">
                
                {/* INFO CARD — Dr. Sathyakala's details (fades & slides up on hover) */}
                <div 
                  className="w-full max-w-sm bg-white/95 backdrop-blur-md border border-rose-100 rounded-2xl shadow-2xl p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out"
                  id="faculty-info-card"
                >
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white shadow-sm">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Dr. M. Sathyakala</p>
                      <p className="text-xs text-slate-400 font-mono">Assistant Professor, Dept. Of IT, IRTT</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {/* Qualification */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest">Qualification</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">M.Tech., Ph.D.</p>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest">Experience</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">15 Years</p>
                      </div>
                    </div>

                    {/* Specialization */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                        <Brain className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest">Specialization</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">Data Mining</p>
                      </div>
                    </div>

                    {/* Conference & Journal */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Conf. & Journal</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">2 & 1</p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 mt-4 pt-3 flex flex-col gap-2">
                    {/* Phone */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-semibold text-slate-700 truncate">+91-99427 98628</span>
                        <button
                          id="info-card-copy-phone"
                          onClick={(e) => { e.stopPropagation(); handleCopy(CONTACT_INFO.phone, 'phone'); }}
                          className="p-0.5 hover:bg-slate-100 rounded transition-colors text-slate-300 hover:text-blue-500 cursor-pointer shrink-0"
                          title="Copy phone"
                        >
                          {copiedType === 'phone' ? (
                            <span className="text-[9px] text-blue-600 font-bold">Copied!</span>
                          ) : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-semibold text-slate-700 truncate">sathyakala@irttech.ac.in</span>
                        <button
                          id="info-card-copy-email"
                          onClick={(e) => { e.stopPropagation(); handleCopy(CONTACT_INFO.email, 'email'); }}
                          className="p-0.5 hover:bg-slate-100 rounded transition-colors text-slate-300 hover:text-rose-500 cursor-pointer shrink-0"
                          title="Copy email"
                        >
                          {copiedType === 'email' ? (
                            <span className="text-[9px] text-rose-500 font-bold">Copied!</span>
                          ) : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </main>

          {/* FOOTER SECTION */}
          <footer className="w-full max-w-7xl mx-auto px-6 py-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-400 relative z-10">
            <div>
              © 2026 Dr. M. Sathyakala. All academic rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Department of IT, IRTT Erode</span>
            </div>
          </footer>

        </div>
      } />
    </Routes>
  );
}
