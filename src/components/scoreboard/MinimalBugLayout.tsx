import React from 'react';
import { MatchState } from '../../types/match';
import { formatMatchTime } from '../../utils/formatters';

interface LayoutProps {
  match: MatchState;
  scale?: number;
}

export const MinimalBugLayout: React.FC<LayoutProps> = ({ match, scale = 1 }) => {
  const { homeTeam, awayTeam, homeScore, awayScore, timer, stats } = match;
  const timeInfo = formatMatchTime(timer.seconds, timer.stoppageTime);

  return (
    <div
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className="inline-flex items-center bg-black/90 text-white rounded-full px-3.5 py-1.5 border border-white/20 shadow-2xl backdrop-blur-md select-none gap-2.5 font-sans"
    >
      {/* Home Accent Dot & Short Name */}
      <div className="flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: homeTeam.primaryColor }}
        />
        <span className="font-extrabold text-sm tracking-tight font-['Barlow_Condensed'] uppercase">
          {homeTeam.shortName}
        </span>
        {stats.home.redCards > 0 && <span className="w-1.5 h-2.5 bg-red-600 rounded-[1px]" />}
      </div>

      {/* Live Score Pill */}
      <div className="bg-white/10 px-2 py-0.5 rounded-md font-mono font-black text-base tabular-nums flex items-center gap-1">
        <span>{homeScore}</span>
        <span className="text-white/40 text-xs">-</span>
        <span>{awayScore}</span>
      </div>

      {/* Away Accent Dot & Short Name */}
      <div className="flex items-center gap-1.5">
        {stats.away.redCards > 0 && <span className="w-1.5 h-2.5 bg-red-600 rounded-[1px]" />}
        <span className="font-extrabold text-sm tracking-tight font-['Barlow_Condensed'] uppercase">
          {awayTeam.shortName}
        </span>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: awayTeam.primaryColor }}
        />
      </div>

      <span className="w-[1px] h-3.5 bg-white/20" />

      {/* Compact Clock */}
      <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-300 tabular-nums">
        <span>{timeInfo.display}</span>
        {timeInfo.stoppageDisplay && (
          <span className="text-amber-400 text-[10px] font-bold">
            {timeInfo.stoppageDisplay}
          </span>
        )}
      </div>
    </div>
  );
};
