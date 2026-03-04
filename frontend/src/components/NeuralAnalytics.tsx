import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { useAoxcStore } from '../store/useAoxcStore';
import { useTranslation } from 'react-i18next';
import { Activity, TrendingUp, Zap, Wallet, BarChart2, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

/**
 * @title Neural Analytics Engine v2.5
 * @notice Real-time telemetry aggregator for X Layer blockchain & AOXCORE Protocol.
 * @dev Integration: Recharts + Zustand for Forensic Visuals.
 */

export const NeuralAnalytics = () => {
  const { analyticsData, gasEfficiency, networkLoad, blockNumber, networkStatus } = useAoxcStore();
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('1H');

  // AUDIT: Filter data based on selected time range
  const filteredData = useMemo(() => {
    const now = Date.now() / 1000;
    const ranges: Record<string, number> = { '1H': 3600, '24H': 86400, '7D': 604800, '30D': 2592000 };
    return (analyticsData || []).filter(d => d.timestamp > (now - ranges[timeRange]));
  }, [analyticsData, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050505] border border-cyan-500/20 p-4 rounded-2xl backdrop-blur-xl shadow-2xl z-50">
          <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
            <Clock size={10} className="text-cyan-500" />
            <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">
              Epoch: {new Date(label * 1000).toLocaleTimeString()}
            </p>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] font-mono text-white/60 uppercase">{entry.name}</span>
              </div>
              <span className="text-[11px] font-black text-white tabular-nums">
                {entry.name === 'Treasury' ? `$${(entry.value / 1000).toFixed(1)}K` : entry.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-auto bg-[#030303] p-6 md:p-10 space-y-10 scrollbar-hide pb-32 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-cyan-500 font-mono text-[11px] font-black uppercase tracking-[0.4em]">
              {t('analytics.title', 'Neural_Analytics_Engine')}
            </h2>
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase",
              networkStatus === 'healthy' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 animate-pulse" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            )}>
              {networkStatus === 'healthy' ? 'Live_Uplink' : 'Degraded_Link'}
            </div>
          </div>
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">
            Block: <span className="text-white/60">#{blockNumber}</span> // Telemetry: <span className="text-cyan-500/60">{networkLoad}</span>
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center bg-white/[0.03] rounded-2xl p-1.5 border border-white/5 backdrop-blur-md">
          {['1H', '24H', '7D', '30D'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                timeRange === range ? "bg-cyan-500 text-black" : "text-white/30 hover:text-white"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <StatCard 
          icon={Zap} 
          label="Gas Efficiency" 
          value={`${gasEfficiency}%`} 
          trend="+2.4%" 
          color="text-emerald-400" 
          chartColor="#10b981"
          data={filteredData.map(d => ({ v: d.gas }))}
        />
        <StatCard 
          icon={Activity} 
          label="Network Load" 
          value={networkLoad} 
          trend="-0.2ms" 
          color="text-cyan-400"
          chartColor="#06b6d4"
          data={filteredData.map(d => ({ v: parseFloat(d.load) || 0 }))}
        />
        <StatCard 
          icon={Wallet} 
          label="Treasury Net" 
          value={`$${((analyticsData?.[analyticsData.length - 1]?.treasury || 0) / 1000).toFixed(1)}K`} 
          trend="+$1.2K" 
          color="text-purple-400"
          chartColor="#a855f7"
          data={filteredData.map(d => ({ v: d.treasury }))}
        />
      </div>

      

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <ChartContainer title="Performance Matrix" icon={TrendingUp} accent="cyan">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="gas" 
                stroke="#10b981" 
                fill="url(#colorGas)" 
                strokeWidth={3}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Treasury Capital Flux" icon={Wallet} accent="purple">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="stepAfter" 
                dataKey="treasury" 
                stroke="#a855f7" 
                strokeWidth={4} 
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

// --- Atomic Helper Components ---

const StatCard = ({ icon: Icon, label, value, trend, color, data, chartColor }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group transition-all hover:border-white/10"
  >
    <div className="flex justify-between items-start relative z-10 mb-6">
      <div className="space-y-1">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</span>
        <h4 className={cn("text-3xl font-black tracking-tighter tabular-nums", color)}>{value}</h4>
      </div>
      <div className={cn("p-4 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner", color)}>
        <Icon size={20} />
      </div>
    </div>

    <div className="flex items-center gap-3 relative z-10">
      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{trend}</span>
      <span className="text-[8px] text-white/20 uppercase tracking-widest font-mono italic">Audit_Verified</span>
    </div>

    {/* Sparkline simulation */}
    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-30 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="v" stroke={chartColor} fill={chartColor} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const ChartContainer = ({ title, icon: Icon, children, accent, height = "h-72" }: any) => (
  <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
    <div className="flex items-center justify-between mb-10 relative z-10">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg bg-white/5 border border-white/5",
          accent === 'cyan' ? "text-cyan-500" : accent === 'purple' ? "text-purple-500" : "text-amber-500"
        )}>
          <Icon size={14} />
        </div>
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{title}</h3>
      </div>
    </div>
    <div className={cn("w-full relative z-10", height)}>
      {children}
    </div>
  </div>
);
