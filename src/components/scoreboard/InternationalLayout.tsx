import React from 'react';
import { MatchState } from '../../types/match';
import { formatMatchTime } from '../../utils/formatters';

interface LayoutProps {
  match: MatchState;
  scale?: number;
}

export const InternationalLayout: React.FC<LayoutProps> = ({ match, scale = 1 }) => {
  const { homeTeam, awayTeam, homeScore, awayScore, timer, penalties } = match;
  const timeInfo = formatMatchTime(timer.seconds, timer.stoppageTime);
  const isPenalties = timer.period === 'PEN';

  return (
    <div
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className="inline-flex flex-col shadow-2xl select-none font-sans"
    >
      <div className="flex items-stretch bg-slate-950/95 text-white border border-slate-700/60 rounded-md overflow-hidden backdrop-blur-md">
        
        {/* Home Country Segment */}
        <div className="flex items-center">
          <div
            className="w-3 self-stretch"
            style={{ backgroundColor: homeTeam.primaryColor }}
          />
          <div className="px-3.5 py-2.5 flex items-center gap-2.5 bg-slate-900/90">
            <span className="text-xl leading-none">{homeTeam.crest}</span>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-wider font-['Barlow_Condensed'] uppercase">
                {homeTeam.code || homeTeam.shortName}
              </span>
            </div>
          </div>
          <div className="px-3 py-2.5 bg-slate-950 font-black text-2xl font-mono tabular-nums text-white min-w-[38px] text-center border-l border-r border-slate-800">
            {homeScore}
          </div>
        </div>

        {/* Central Timer & Tournament Pill */}
        <div className="px-3.5 py-2 flex flex-col items-center justify-center bg-slate-800/80 border-r border-slate-800 min-w-[90px]">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {timer.period}
          </span>
          <div className="flex items-center gap-1">
            <span className="font-mono font-black text-sm tabular-nums text-white">
              {timeInfo.display}
            </span>
            {timeInfo.stoppageDisplay && (
              <span className="text-amber-400 font-bold text-xs font-mono">
                {timeInfo.stoppageDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Away Country Segment */}
        <div className="flex items-center">
          <div className="px-3 py-2.5 bg-slate-950 font-black text-2xl font-mono tabular-nums text-white min-w-[38px] text-center border-r border-slate-800">
            {awayScore}
          </div>
          <div className="px-3.5 py-2.5 flex items-center gap-2.5 bg-slate-900/90">
            <div className="flex flex-col items-end">
              <span className="font-black text-lg tracking-wider font-['Barlow_Condensed'] uppercase">
                {awayTeam.code || awayTeam.shortName}
              </span>
            </div>
            <span className="text-xl leading-none">{awayTeam.crest}</span>
          </div>
          <div
            className="w-3 self-stretch"
            style={{ backgroundColor: awayTeam.primaryColor }}
          />
        </div>

      </div>

      {/* Penalty Shootout Indicator Row (if active) */}
      {isPenalties && (
        <div className="bg-slate-900/95 border-t border-slate-800 px-3 py-1 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[10px] text-slate-400">PEN:</span>
            {penalties.homeKicks.map((kick, i) => (
              <span
                key={`home_kick_${i}`}
                className={`w-2.5 h-2.5 rounded-full border border-white/20 ${
                  kick === 'scored'
                    ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]'
                    : kick === 'missed'
                    ? 'bg-red-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <span className="font-mono font-bold text-amber-400 px-2">
            ({penalties.homeScore} - {penalties.awayScore})
          </span>

          <div className="flex items-center gap-1.5">
            {penalties.awayKicks.map((kick, i) => (
              <span
                key={`away_kick_${i}`}
                className={`w-2.5 h-2.5 rounded-full border border-white/20 ${
                  kick === 'scored'
                    ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]'
                    : kick === 'missed'
                    ? 'bg-red-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
