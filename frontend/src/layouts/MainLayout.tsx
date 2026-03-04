import React from 'react';
import { cn } from '../lib/utils';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Sidebar } from '../components/Sidebar';
import { StatusMatrix } from '../components/StatusMatrix';
import { motion, AnimatePresence } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
  isOnline: boolean;
  latency: number;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  isRightPanelOpen: boolean;
  rightPanelContent: React.ReactNode;
}

/**
 * @title AOXC Neural OS - Layout Architect
 * @notice Centralized layout engine for grid-flex reconciliation.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, isOnline, latency, isMobileMenuOpen, toggleMobileMenu, isRightPanelOpen, rightPanelContent 
}) => {
  return (
    <div className="h-screen w-full bg-[#030303] text-white flex flex-col font-mono overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* 1. HEADER (Fixed) */}
      <Header isOnline={isOnline} latency={latency} />

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 2. SIDEBAR (Navigation) */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 md:relative md:flex md:translate-x-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0 w-72 lg:w-80"
        )}>
          <Sidebar />
        </aside>

        {/* MOBILE OVERLAY */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-md" 
              onClick={toggleMobileMenu} 
            />
          )}
        </AnimatePresence>

        {/* 3. CENTRAL COMMAND (Main Body) */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#060606] relative border-x border-white/5 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Status Matrix Sub-Header */}
          <StatusMatrix />
          
          <div className="flex-1 flex overflow-hidden relative">
            <section className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide relative bg-gradient-to-b from-transparent to-black/30">
               {/* Burası ActiveInterface'in geleceği alan */}
               {children}
            </section>

            {/* RIGHT SIDE PANEL (Control Link) */}
            <AnimatePresence>
              {isRightPanelOpen && (
                <motion.aside 
                  initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
                  transition={{ type: "spring", damping: 28, stiffness: 200 }}
                  className="hidden xl:flex flex-col w-96 bg-[#080808]/80 backdrop-blur-3xl border-l border-white/5 relative z-20 overflow-hidden"
                >
                  {rightPanelContent}
                </motion.aside>
              )}
            </AnimatePresence>
          </div>

          {/* 4. FOOTER (Terminal) */}
          <Footer />
        </main>
      </div>
    </div>
  );
};
