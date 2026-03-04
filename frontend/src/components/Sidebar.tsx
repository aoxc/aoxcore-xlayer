import React, { useMemo, useEffect, useState } from 'react';
import { useAoxcStore } from '../store/useAoxcStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion'; // Stabil import
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Wallet, ShieldCheck, Download,
  AlertCircle, FileText, Network, Users, BarChart3,
  GitBranch, Brain, ChevronLeft, ChevronRight, Fingerprint
} from 'lucide-react';

/**
 * @title AOXC Neural Navigation Sidebar v2.0
 * @notice Fixed i18n object routing and responsive layout stability.
 */
export const Sidebar = () => {
  const { 
    activeView, setActiveView, pendingTransactions, 
    permissionLevel, setPermissionLevel, notifications,
    isSidebarCollapsed, toggleSidebar 
  } = useAoxcStore();
  
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * @section Navigation Mapping
   * @notice FIX: t('key.title') formatı nesne hatalarını (TS/i18n) engeller.
   */
  const menuItems = useMemo(() => [
    { id: 'dashboard', label: t('sidebar.ledger'), icon: LayoutDashboard, color: "cyan" },
    { id: 'aoxcan', label: 'AOXCAN CORE', icon: Brain, highlight: true, color: "pink" },
    { id: 'finance', label: t('sidebar.finance'), icon: Wallet, color: "blue" },
    // i18n hatasını önlemek için doğrudan anahtar kontrolü veya .title eklemesi yapıldı
    { id: 'analytics', label: t('sidebar.analytics'), icon: BarChart3, color: "blue" },
    { id: 'skeleton', label: 'System Skeleton', icon: GitBranch, color: "purple" },
    { id: 'sentinel', label: t('sidebar.signatures'), icon: ShieldCheck, color: "purple" },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: AlertCircle, color: "orange", count: notifications.filter(n => n.type === 'error').length },
    { id: 'pending', label: t('sidebar.pending'), icon: FileText, color: "cyan", count: pendingTransactions.length },
    { id: 'registry', label: t('sidebar.registry'), icon: Network, color: "pink" },
    { id: 'governance', label: t('sidebar.governance'), icon: Users, color: "pink" },
  ], [notifications, pendingTransactions, t]);

  const sidebarWidth = isMobile ? "100%" : (isSidebarCollapsed ? 84 : 280);

  return (
    <motion.div 
      initial={false}
      animate={{ width: sidebarWidth }}
      className="h-full border-r border-white/5 flex flex-col bg-[#050505]/95 backdrop-blur-3xl relative z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
    >
      {/* COMMANDER TOGGLE */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 w-6 h-10 bg-cyan-500 rounded-lg hidden md:flex items-center justify-center text-black hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] z-50 group"
      >
        {isSidebarCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      <div className="p-5 flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-6">
        {/* LOGO & IDENTITY */}
        <div className={cn(
          "flex items-center px-3 mb-4 transition-all duration-300",
          isSidebarCollapsed && !isMobile ? "justify-center" : "justify-between"
        )}>
          {(!isSidebarCollapsed || isMobile) ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col"
            >
               <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] leading-none">Command Hub</span>
               <span className="text-[8px] font-mono text-cyan-500/50 mt-1 uppercase tracking-widest italic">Stable_Diffusion_v2</span>
            </motion.div>
          ) : (
            <Fingerprint size={18} className="text-cyan-500 animate-pulse" />
          )}
        </div>

        {/* NAVIGATION STREAM */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.id}
              item={item}
              isActive={activeView === item.id}
              isCollapsed={isSidebarCollapsed && !isMobile}
              onClick={() => setActiveView(item.id as any)}
            />
          ))}
        </nav>
      </div>

      {/* FOOTER: RBAC (Role-Based Access Control) */}
      <div className="mt-auto p-5 space-y-4 border-t border-white/5 bg-black/40">
        <div className={cn(
          "bg-white/[0.02] rounded-2xl border border-white/5 p-4",
          isSidebarCollapsed && !isMobile ? "p-2 items-center" : "space-y-3"
        )}>
          {(!isSidebarCollapsed || isMobile) && (
            <div className="flex items-center justify-between px-1">
               <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Access_Level</span>
               <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
            </div>
          )}
          
          <div className={cn("flex gap-1.5", isSidebarCollapsed && !isMobile ? "flex-col" : "flex-row")}>
            {[0, 1, 2].map((level) => (
              <button
                key={level}
                onClick={() => setPermissionLevel(level)}
                className={cn(
                  "flex items-center justify-center rounded-xl transition-all duration-300 font-black",
                  isSidebarCollapsed && !isMobile ? "w-10 h-10 text-[11px]" : "flex-1 py-2.5 text-[9px]",
                  permissionLevel === level 
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                    : "bg-white/5 text-white/20 hover:bg-white/10"
                )}
              >
                {level === 0 ? 'G' : level === 1 ? 'O' : 'A'}
                {(!isSidebarCollapsed || isMobile) && (level === 0 ? 'ST' : level === 1 ? 'PR' : 'DM')}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-white/40 hover:text-white transition-all group">
          <Download size={16} className="group-hover:-translate-y-1 transition-transform" />
          {(!isSidebarCollapsed || isMobile) && <span className="uppercase tracking-[0.2em]">Forensic Export</span>}
        </button>
      </div>
    </motion.div>
  );
};

// --- Atomic Component: Sidebar Item ---
const SidebarItem = ({ item, isActive, isCollapsed, onClick }: any) => {
  const colorMap: any = {
    cyan: "text-cyan-500", blue: "text-blue-500", pink: "text-pink-500",
    purple: "text-purple-500", orange: "text-orange-500"
  };

  const bgMap: any = {
    cyan: "bg-cyan-500/10", blue: "bg-blue-500/10", pink: "bg-pink-500/10",
    purple: "bg-purple-500/10", orange: "bg-orange-500/10"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center relative transition-all duration-300 rounded-2xl py-3.5 px-4 group",
        isActive ? cn(bgMap[item.color], "shadow-inner") : "hover:bg-white/[0.03]",
        isCollapsed ? "justify-center" : "justify-start"
      )}
    >
      {isActive && (
        <motion.div 
          layoutId="sidebarActiveLine"
          className={cn("absolute left-0 w-1 h-6 rounded-r-full", item.color === 'pink' ? 'bg-pink-500' : 'bg-cyan-500')} 
        />
      )}

      <item.icon 
        size={20} 
        className={cn(
          "shrink-0 transition-all duration-300",
          isActive ? colorMap[item.color] : "text-white/20 group-hover:text-white/60",
          item.highlight && !isActive && "text-pink-500/60 animate-pulse"
        )} 
      />

      {!isCollapsed && (
        <span className={cn(
          "ml-4 text-[10px] font-black uppercase tracking-widest truncate",
          isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
        )}>
          {/* label bir nesne döndürürse React render edemez, bu yüzden string olduğundan emin oluyoruz */}
          {typeof item.label === 'string' ? item.label : 'N/A'}
        </span>
      )}

      {item.count ? (
        <div className={cn(
          "absolute flex items-center justify-center font-black transition-all",
          isCollapsed 
            ? "top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" 
            : "right-4 px-2 py-0.5 rounded-lg bg-cyan-500 text-black text-[9px]"
        )}>
          {!isCollapsed && item.count}
        </div>
      ) : null}
    </button>
  );
};
