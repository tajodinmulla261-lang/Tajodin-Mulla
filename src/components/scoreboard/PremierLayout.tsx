import React from 'react';
import { MatchState } from '../../types/match';
import { formatMatchTime, getPeriodShortLabel } from '../../utils/formatters';

interface LayoutProps {
  match: MatchState;
  scale?: number;
}

export const PremierLayout: React.FC<LayoutProps> = ({ match, scale = 1 }) => {
  const { homeTeam, awayTeam, homeScore, awayScore, timer, stats } = match;
  const timeInfo = formatMatchTime(timer.seconds, timer.stoppageTime);

  return (
    <div
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className="inline-flex flex-col shadow-2xl select-none font-sans"
    >
      {/* Top Competition Bar */}
      <div className="bg-slate-950/90 text-slate-300 px-3 py-0.5 text-[11px] font-semibold tracking-wider uppercase border-b border-white/10 flex items-center justify-between">
        <span className="truncate max-w-[200px]">{match.competition}</span>
        <span className="text-amber-400 font-bold ml-2">{getPeriodShortLabel(timer.period)}</span>
      </div>

      {/* Main Scoreboard Body */}
      <div className="flex items-stretch bg-slate-900/95 backdrop-blur-md text-white border border-white/10 rounded-b-sm overflow-hidden">
        {/* Home Team */}
        <div className="flex items-center">
          <div
            className="w-2.5 self-stretch shrink-0"
            style={{ backgroundColor: homeTeam.primaryColor }}
          />
          <div className="px-3 py-2 flex items-center gap-2">
            <span className="text-base select-none">{homeTeam.crest}</span>
            <span className="font-extrabold text-lg tracking-tight font-['Barlow_Condensed'] uppercase">
              {homeTeam.shortName}
            </span>
            {stats.home.redCards > 0 && (
              <span className="w-2.5 h-3.5 bg-red-600 rounded-[1px] inline-block shadow-sm" title="Red Card" />
            )}
          </div>
        </div>

        {/* Home Score */}
        <div className="bg-slate-950 px-3 py-2 flex items-center justify-center font-bold text-xl tabular-nums font-mono text-white min-w-[36px] border-l border-white/10">
          {homeScore}
        </div>

        {/* Score Divider */}
        <div className="bg-slate-950 px-0.5 py-2 flex items-center justify-center text-slate-500 font-bold text-sm">
          -
        </div>

        {/* Away Score */}
        <div className="bg-slate-950 px-3 py-2 flex items-center justify-center font-bold text-xl tabular-nums font-mono text-white min-w-[36px] border-r border-white/10">
          {awayScore}
        </div>

        {/* Away Team */}
        <div className="flex items-center">
          <div className="px-3 py-2 flex items-center gap-2">
            {stats.away.redCards > 0 && (
              <span className="w-2.5 h-3.5 bg-red-600 rounded-[1px] inline-block shadow-sm" title="Red Card" />
            )}
            <span className="font-extrabold text-lg tracking-tight font-['Barlow_Condensed'] uppercase">
              {awayTeam.shortName}
            </span>
            <span className="text-base select-none">{awayTeam.crest}</span>
          </div>
          <div
            className="w-2.5 self-stretch shrink-0"
            style={{ backgroundColor: awayTeam.primaryColor }}
          />
        </div>

        {/* Match Clock Section */}
        <div className="bg-slate-800/95 px-3 py-2 flex items-center gap-1.5 border-l border-white/10 text-white min-w-[85px] justify-center">
          <span className="font-mono font-bold text-base tabular-nums">
            {timeInfo.display}
          </span>
          {timeInfo.stoppageDisplay && (
            <span className="bg-amber-500 text-slate-950 font-bold text-xs px-1 rounded-[2px] leading-tight font-mono">
              {timeInfo.stoppageDisplay}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
