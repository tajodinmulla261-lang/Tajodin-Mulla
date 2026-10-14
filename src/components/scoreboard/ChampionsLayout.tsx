import React from 'react';
import { MatchState } from '../../types/match';
import { formatMatchTime, getPeriodShortLabel } from '../../utils/formatters';

interface LayoutProps {
  match: MatchState;
  scale?: number;
}

export const ChampionsLayout: React.FC<LayoutProps> = ({ match, scale = 1 }) => {
  const { homeTeam, awayTeam, homeScore, awayScore, timer, stats } = match;
  const timeInfo = formatMatchTime(timer.seconds, timer.stoppageTime);

  return (
    <div
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className="inline-flex flex-col shadow-2xl select-none"
    >
      {/* Luxury UEFA Style Container */}
      <div className="flex items-center bg-gradient-to-r from-[#07132B]/95 via-[#0A1A3C]/95 to-[#07132B]/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-1 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-white">
        
        {/* Home Team Card */}
        <div className="flex items-center gap-2.5 px-3 py-1.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg border border-white/20 shadow-inner">
            {homeTeam.crest}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wide font-['Outfit'] uppercase">
              {homeTeam.shortName}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-1 rounded-full" style={{ backgroundColor: homeTeam.primaryColor }} />
              {stats.home.redCards > 0 && <span className="w-2 h-3 bg-red-600 rounded-[1px]" />}
            </div>
          </div>
        </div>

        {/* Score Pill */}
        <div className="flex items-center bg-[#030914]/80 px-4 py-1.5 rounded-lg border border-cyan-400/20 mx-1">
          <span className="font-mono font-black text-2xl tabular-nums text-white min-w-[20px] text-center">
            {homeScore}
          </span>
          <span className="text-cyan-400/60 font-light mx-2 text-lg">
            :
          </span>
          <span className="font-mono font-black text-2xl tabular-nums text-white min-w-[20px] text-center">
            {awayScore}
          </span>
        </div>

        {/* Away Team Card */}
        <div className="flex items-center gap-2.5 px-3 py-1.5">
          <div className="flex flex-col items-end">
            <span className="font-extrabold text-base tracking-wide font-['Outfit'] uppercase">
              {awayTeam.shortName}
            </span>
            <div className="flex items-center gap-1">
              {stats.away.redCards > 0 && <span className="w-2 h-3 bg-red-600 rounded-[1px]" />}
              <span className="w-3 h-1 rounded-full" style={{ backgroundColor: awayTeam.primaryColor }} />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg border border-white/20 shadow-inner">
            {awayTeam.crest}
          </div>
        </div>

        {/* Timer & Stoppage */}
        <div className="bg-gradient-to-b from-cyan-950/60 to-blue-950/80 px-3 py-2 rounded-lg border-l border-cyan-500/30 flex flex-col items-center justify-center min-w-[70px]">
          <span className="font-mono font-bold text-sm text-cyan-200 tabular-nums">
            {timeInfo.display}
          </span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-slate-400 font-semibold">{getPeriodShortLabel(timer.period)}</span>
            {timeInfo.stoppageDisplay && (
              <span className="text-amber-400 font-bold">{timeInfo.stoppageDisplay}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
