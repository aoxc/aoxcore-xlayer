import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, FolderOpen, FileCode, ChevronRight, 
  Terminal, HardDrive, Loader2, Github, AlertCircle 
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * @title AOXC Dynamic Skeleton (GitHub Real-time)
 * @notice Fetches the protocol structure directly from the GitHub source.
 * @dev Integration: GitHub REST API v3.
 */

interface RepoItem {
  name: string;
  type: 'dir' | 'file';
  path: string;
  download_url: string | null;
  children?: RepoItem[];
}

export const SkeletonView = () => {
  const [data, setData] = useState<RepoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GitHub API'den verileri çeken otonom fonksiyon
  const fetchStructure = async (path = 'src') => {
    const owner = 'aoxc';
    const repo = 'AOXCORE';
    const branch = 'main';
    
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
      
      if (!response.ok) throw new Error('GITHUB_UPLINK_ERROR');
      
      const contents = await response.json();
      
      const structuredData: RepoItem[] = await Promise.all(contents.map(async (item: any) => {
        const node: RepoItem = {
          name: item.name,
          type: item.type === 'dir' ? 'dir' : 'file',
          path: item.path,
          download_url: item.download_url,
        };

        // Eğer bir klasörse, içeriğini de rekürsif olarak çek (Audit-Grade Depth)
        if (node.type === 'dir') {
          node.children = await fetchStructure(item.path);
        }
        
        return node;
      }));

      return structuredData;
    } catch (err) {
      setError("Uplink to GitHub failed. Check repository visibility.");
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const result = await fetchStructure('src');
      setData(result);
      setIsLoading(false);
    };
    init();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#020202] p-6 md:p-10 overflow-hidden font-mono relative">
      {/* OS Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Github size={18} className="text-cyan-400" />
            </div>
            <h2 className="text-white font-black text-xs uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              Dynamic_Source_Scan
            </h2>
          </div>
          <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] ml-11">
            Repo: <span className="text-cyan-500/50">aoxc/AOXCORE</span> // Source: <span className="text-emerald-500/50">LIVE_BRANCH_MAIN</span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.02] px-5 py-2.5 rounded-2xl border border-white/5 backdrop-blur-md">
          <Terminal size={14} className="text-cyan-500/50" />
          <span className="text-[10px] text-white/40 tracking-tight lowercase">
            root@ns1:~/aoxcore/src <span className="text-cyan-500">$</span> git pull --rebase
          </span>
        </div>
      </div>

      {/* Main UI Container */}
      <div className="flex-1 bg-black/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 overflow-y-auto scrollbar-hide relative group">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-4 text-cyan-500/50"
            >
              <Loader2 className="animate-spin" size={32} />
              <span className="text-[10px] uppercase tracking-[0.3em]">Synchronizing with GitHub...</span>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              className="h-full flex flex-col items-center justify-center gap-4 text-rose-500/50"
            >
              <AlertCircle size={32} />
              <span className="text-[10px] uppercase tracking-[0.3em]">{error}</span>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-0.5 relative z-10"
            >
              {data.map((item, i) => (
                <TreeItem key={item.path} item={item} depth={1} isLast={i === data.length - 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Metadata Footer */}
      <div className="mt-6 flex justify-between items-center px-4 opacity-30 select-none font-black text-[8px] uppercase tracking-widest text-white">
        <span>GitHub API v3 Synchronized</span>
        <span>Neural OS Architecture v2.5</span>
      </div>
    </div>
  );
};

const TreeItem = ({ item, depth, isLast }: { item: RepoItem, depth: number, isLast: boolean }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col">
      <div 
        className={cn(
          "flex items-center gap-3 group cursor-pointer py-1.5 px-3 rounded-lg transition-all border border-transparent",
          item.type === 'dir' ? "hover:bg-white/[0.03]" : "hover:bg-cyan-500/[0.03] hover:border-cyan-500/10"
        )}
        onClick={() => item.type === 'dir' && setIsOpen(!isOpen)}
      >
        <span className="text-white/10 font-light select-none whitespace-pre tracking-[-0.1em]">
          {'│  '.repeat(depth - 1)}
          {isLast ? '└── ' : '├── '}
        </span>

        {item.type === 'dir' ? (
          isOpen ? <FolderOpen size={15} className="text-cyan-400" /> : <Folder size={15} className="text-cyan-900" />
        ) : (
          <FileCode size={15} className={cn(
            "text-white/30 group-hover:text-cyan-400 transition-colors",
            item.name === 'AOXC.sol' && "text-pink-500"
          )} />
        )}

        <span className={cn(
          "text-[11px] font-mono tracking-tight transition-all",
          item.type === 'dir' ? "text-white/80 font-bold" : "text-white/40 group-hover:text-white",
          item.name === 'AOXC.sol' && "text-pink-400 font-black underline decoration-pink-500/30 underline-offset-4"
        )}>
          {item.name}
        </span>
      </div>

      {item.type === 'dir' && isOpen && item.children && (
        <div className="flex flex-col">
          {item.children.map((child, i) => (
            <TreeItem 
              key={child.path} 
              item={child} 
              depth={depth + 1} 
              isLast={i === item.children!.length - 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
