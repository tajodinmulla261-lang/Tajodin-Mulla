import React from 'react';
import { MatchState } from '../../types/match';
import { formatMatchTime, getPeriodShortLabel } from '../../utils/formatters';

interface LayoutProps {
  match: MatchState;
  scale?: number;
}

export const TacticalLowerLayout: React.FC<LayoutProps> = ({ match, scale = 1 }) => {
  const { homeTeam, awayTeam, homeScore, awayScore, timer, stats, events } = match;
  const timeInfo = formatMatchTime(timer.seconds, timer.stoppageTime);

  const goalEvents = events.filter((e) => e.type === 'GOAL');

  return (
    <div
      style={{ transform: `scale(${scale})`, transformOrigin: 'bottom left' }}
      className="w-full max-w-4xl select-none shadow-2xl font-sans"
    >
      {/* Top Ticker: Recent Goalscorers */}
      {goalEvents.length > 0 && (
        <div className="bg-slate-950/95 text-xs text-slate-300 px-4 py-1 border-t border-x border-white/10 rounded-t-lg flex items-center gap-3 overflow-hidden backdrop-blur-md">
          <span className="font-bold uppercase tracking-wider text-amber-400 shrink-0 text-[10px]">
            GOALS:
          </span>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            {goalEvents.map((g) => (
              <span key={g.id} className="inline-flex items-center gap-1">
                <span className="font-mono text-slate-400 font-bold">{g.minute}'</span>
                <span className="font-semibold text-white">{g.playerName}</span>
                <span className="text-[10px] text-slate-400">({g.team === 'home' ? homeTeam.shortName : awayTeam.shortName})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Lower-Third Banner */}
      <div className="bg-slate-900/95 text-white border border-white/10 rounded-b-lg p-3 backdrop-blur-md grid grid-cols-12 gap-3 items-center">
        
        {/* Col 1: Scores & Teams (4 cols) */}
        <div className="col-span-5 flex items-center justify-between bg-slate-950/80 p-2 rounded-md border border-white/10">
          {/* Home */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-sm shrink-0" style={{ backgroundColor: homeTeam.primaryColor }} />
            <span className="font-extrabold text-base font-['Barlow_Condensed'] uppercase tracking-tight">
              {homeTeam.shortName}
            </span>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-2 font-mono font-black text-2xl tabular-nums bg-slate-900 px-3 py-0.5 rounded border border-white/5">
            <span>{homeScore}</span>
            <span className="text-slate-500 font-light text-base">-</span>
            <span>{awayScore}</span>
          </div>

          {/* Away */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base font-['Barlow_Condensed'] uppercase tracking-tight">
              {awayTeam.shortName}
            </span>
            <span className="w-2.5 h-6 rounded-sm shrink-0" style={{ backgroundColor: awayTeam.primaryColor }} />
          </div>
        </div>

        {/* Col 2: Match Clock & Period (2 cols) */}
        <div className="col-span-2 flex flex-col items-center justify-center bg-slate-950/60 p-2 rounded-md border border-white/10">
          <span className="font-mono font-bold text-lg tabular-nums text-white">
            {timeInfo.display}
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-medium">{getPeriodShortLabel(timer.period)}</span>
            {timeInfo.stoppageDisplay && (
              <span className="text-amber-400 font-bold font-mono">{timeInfo.stoppageDisplay}</span>
            )}
          </div>
        </div>

        {/* Col 3: Live Possession Bar & Tactical Counters (5 cols) */}
        <div className="col-span-5 flex flex-col justify-center gap-1.5 bg-slate-950/60 p-2 rounded-md border border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="font-mono text-cyan-400">{stats.home.possession}%</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">POSSESSION</span>
            <span className="font-mono text-cyan-400">{stats.away.possession}%</span>
          </div>
          {/* Possession Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${stats.home.possession}%`, backgroundColor: homeTeam.primaryColor }}
            />
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${stats.away.possession}%`, backgroundColor: awayTeam.primaryColor }}
            />
          </div>
          {/* Quick Stats Grid */}
          <div className="flex items-center justify-around text-[11px] text-slate-300 font-mono pt-0.5 border-t border-white/5">
            <span>
              <strong className="text-white">{stats.home.shotsOnTarget}</strong> SOT <strong className="text-white">{stats.away.shotsOnTarget}</strong>
            </span>
            <span>·</span>
            <span>
              <strong className="text-white">{stats.home.corners}</strong> CRN <strong className="text-white">{stats.away.corners}</strong>
            </span>
            <span>·</span>
            <span>
              <strong className="text-white">{stats.home.fouls}</strong> FLS <strong className="text-white">{stats.away.fouls}</strong>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
