import React from 'react';
import { MatchState, TeamStats } from '../../types/match';
import { BarChart2, Plus, Minus, RotateCcw, Database, Code } from 'lucide-react';

interface MatchStatsTabProps {
  match: MatchState;
  onUpdateStats: (payload: { home?: Partial<TeamStats>; away?: Partial<TeamStats> }) => void;
}

export const MatchStatsTab: React.FC<MatchStatsTabProps> = ({ match, onUpdateStats }) => {
  const { homeTeam, awayTeam, stats } = match;

  const handleStatDelta = (team: 'home' | 'away', field: keyof TeamStats, delta: number) => {
    const currentVal = stats[team][field];
    const newVal = Math.max(0, currentVal + delta);
    onUpdateStats({
      [team]: { [field]: newVal },
    });
  };

  const handlePossessionChange = (homeVal: number) => {
    const clamped = Math.min(100, Math.max(0, homeVal));
    onUpdateStats({
      home: { possession: clamped },
      away: { possession: 100 - clamped },
    });
  };

  const statRows: Array<{
    key: keyof TeamStats;
    label: string;
    description: string;
  }> = [
    { key: 'shots', label: 'Total Shots', description: 'All shot attempts towards goal' },
    { key: 'shotsOnTarget', label: 'Shots on Target', description: 'Shots requiring goalkeeper save or goals' },
    { key: 'corners', label: 'Corners', description: 'Corner kicks awarded' },
    { key: 'fouls', label: 'Fouls Committed', description: 'Referee whistles for infractions' },
    { key: 'offsides', label: 'Offsides', description: 'Offside flags raised' },
    { key: 'saves', label: 'Goalkeeper Saves', description: 'Saves made by the keeper' },
    { key: 'yellowCards', label: 'Yellow Cards', description: 'Cautions issued' },
    { key: 'redCards', label: 'Red Cards', description: 'Dismissals / Sendings off' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-xl font-['Outfit'] text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" /> Live Match Statistics Database
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Real-time football telemetry synchronized with the backend REST API & SSE stream. Updates reflect instantaneously across all broadcast layouts.
          </p>
        </div>

        <button
          onClick={() => {
            onUpdateStats({
              home: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0, passes: 0, passAccuracy: 0 },
              away: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0, passes: 0, passAccuracy: 0 },
            });
          }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset All Stats
        </button>
      </div>

      {/* POSSESSION INTERACTIVE SLIDER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{homeTeam.crest}</span>
            <span className="font-bold text-white text-sm">{homeTeam.name}</span>
            <span className="font-mono font-black text-2xl text-cyan-400">{stats.home.possession}%</span>
          </div>

          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            BALL POSSESSION
          </span>

          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-2xl text-cyan-400">{stats.away.possession}%</span>
            <span className="font-bold text-white text-sm">{awayTeam.name}</span>
            <span className="text-xl">{awayTeam.crest}</span>
          </div>
        </div>

        {/* Dual Color Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-white/10 shadow-inner">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${stats.home.possession}%`, backgroundColor: homeTeam.primaryColor }}
          />
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${stats.away.possession}%`, backgroundColor: awayTeam.primaryColor }}
          />
        </div>

        {/* Slider input */}
        <div className="pt-2">
          <input
            type="range"
            min="0"
            max="100"
            value={stats.home.possession}
            onChange={(e) => handlePossessionChange(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* DETAILED STATS COUNTER GRID */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 pb-3 border-b border-slate-800 text-xs font-bold uppercase text-slate-400 tracking-wider">
          <div className="col-span-4 flex items-center gap-2">
            <span>{homeTeam.crest}</span>
            <span>{homeTeam.shortName}</span>
          </div>
          <div className="col-span-4 text-center">Metric</div>
          <div className="col-span-4 flex items-center justify-end gap-2">
            <span>{awayTeam.shortName}</span>
            <span>{awayTeam.crest}</span>
          </div>
        </div>

        {/* Stats Rows */}
        <div className="divide-y divide-slate-800/60">
          {statRows.map((item) => {
            const homeVal = stats.home[item.key];
            const awayVal = stats.away[item.key];

            return (
              <div key={item.key} className="grid grid-cols-12 gap-4 py-3 items-center">
                {/* Home Controls */}
                <div className="col-span-4 flex items-center gap-2">
                  <button
                    onClick={() => handleStatDelta('home', item.key, -1)}
                    className="w-7 h-7 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-black text-xl text-white tabular-nums min-w-[28px] text-center">
                    {homeVal}
                  </span>
                  <button
                    onClick={() => handleStatDelta('home', item.key, 1)}
                    className="w-7 h-7 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white rounded flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Center Label */}
                <div className="col-span-4 text-center">
                  <span className="font-bold text-sm text-slate-200 block">{item.label}</span>
                  <span className="text-[10px] text-slate-500 hidden sm:block">{item.description}</span>
                </div>

                {/* Away Controls */}
                <div className="col-span-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleStatDelta('away', item.key, -1)}
                    className="w-7 h-7 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-black text-xl text-white tabular-nums min-w-[28px] text-center">
                    {awayVal}
                  </span>
                  <button
                    onClick={() => handleStatDelta('away', item.key, 1)}
                    className="w-7 h-7 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white rounded flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE REST API INTEGRATION DOCS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Code className="w-4 h-4 text-amber-400" /> Live REST API Endpoints For Developers & Automation
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          You can integrate external hardware controllers (Stream Deck, Companion, Python scripts, or vMix scripting) using standard HTTP requests:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold">GET /api/match</span>
            <p className="text-slate-400 text-[11px] font-sans">Fetches the complete real-time match state, scores, and statistics.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold">GET /api/match/stream</span>
            <p className="text-slate-400 text-[11px] font-sans">Server-Sent Events (SSE) live stream with zero polling delay.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold">POST /api/match/score</span>
            <p className="text-slate-400 text-[11px] font-sans">Payload: <code>{`{ "team": "home", "delta": 1 }`}</code></p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold">POST /api/match/timer</span>
            <p className="text-slate-400 text-[11px] font-sans">Payload: <code>{`{ "action": "start" | "pause" }`}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};
