import React from 'react';
import { MatchState } from '../../types/match';
import { formatMatchTime } from '../../utils/formatters';

interface LayoutProps {
  match: MatchState;
  scale?: number;
}

export const MatrixLedLayout: React.FC<LayoutProps> = ({ match, scale = 1 }) => {
  const { homeTeam, awayTeam, homeScore, awayScore, timer } = match;
  const timeInfo = formatMatchTime(timer.seconds, timer.stoppageTime);

  return (
    <div
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className="inline-flex flex-col select-none shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
    >
      {/* Stadium Frame */}
      <div className="bg-[#121214] p-2 rounded-lg border-2 border-[#2b2b30] shadow-inner">
        {/* LED Grid Panel */}
        <div className="bg-[#050506] border border-[#222226] rounded px-4 py-2 flex items-center gap-6 relative overflow-hidden">
          
          {/* Subtle LED Scanline / Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
              backgroundSize: '4px 4px',
            }}
          />

          {/* HOME TEAM */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono tracking-widest text-slate-400 font-bold uppercase">
              HOME
            </span>
            <div className="flex items-center gap-1.5 my-0.5">
              <span className="text-sm">{homeTeam.crest}</span>
              <span className="font-mono font-black text-lg text-amber-400 tracking-wider">
                {homeTeam.shortName}
              </span>
            </div>
            <div className="bg-[#0a0a0c] px-3 py-1 rounded border border-[#25252b] min-w-[45px] text-center shadow-inner">
              <span className="font-mono font-black text-3xl tabular-nums text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]">
                {homeScore.toString().padStart(2, ' ')}
              </span>
            </div>
          </div>

          {/* CENTER JUMBOTRON CLOCK */}
          <div className="flex flex-col items-center px-2 border-x border-[#25252a]">
            {/* Period Indicators */}
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`text-[9px] font-mono px-1 rounded font-bold ${
                  timer.period === '1H'
                    ? 'bg-amber-500 text-black shadow-[0_0_6px_#f59e0b]'
                    : 'text-slate-600 bg-black/40'
                }`}
              >
                1ST
              </span>
              <span
                className={`text-[9px] font-mono px-1 rounded font-bold ${
                  timer.period === '2H'
                    ? 'bg-amber-500 text-black shadow-[0_0_6px_#f59e0b]'
                    : 'text-slate-600 bg-black/40'
                }`}
              >
                2ND
              </span>
              <span
                className={`text-[9px] font-mono px-1 rounded font-bold ${
                  timer.period === 'ET1' || timer.period === 'ET2'
                    ? 'bg-amber-500 text-black shadow-[0_0_6px_#f59e0b]'
                    : 'text-slate-600 bg-black/40'
                }`}
              >
                ET
              </span>
            </div>

            {/* LED Time */}
            <div className="bg-[#020202] px-3 py-1 rounded border border-[#1e1e24] shadow-inner flex items-center gap-1">
              <span className="font-mono font-black text-2xl text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)] tabular-nums">
                {timeInfo.display}
              </span>
              {timeInfo.stoppageDisplay && (
                <span className="font-mono text-xs font-bold text-amber-400">
                  {timeInfo.stoppageDisplay}
                </span>
              )}
            </div>

            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase mt-1">
              MATCH TIME
            </span>
          </div>

          {/* AWAY TEAM */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono tracking-widest text-slate-400 font-bold uppercase">
              AWAY
            </span>
            <div className="flex items-center gap-1.5 my-0.5">
              <span className="font-mono font-black text-lg text-amber-400 tracking-wider">
                {awayTeam.shortName}
              </span>
              <span className="text-sm">{awayTeam.crest}</span>
            </div>
            <div className="bg-[#0a0a0c] px-3 py-1 rounded border border-[#25252b] min-w-[45px] text-center shadow-inner">
              <span className="font-mono font-black text-3xl tabular-nums text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]">
                {awayScore.toString().padStart(2, ' ')}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
