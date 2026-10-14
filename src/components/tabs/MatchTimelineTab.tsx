import React from 'react';
import { MatchState, MatchEvent } from '../../types/match';
import { History, Award, AlertTriangle, ArrowLeftRight, Trash2, Download, Copy, ShieldAlert } from 'lucide-react';

interface MatchTimelineTabProps {
  match: MatchState;
  onDeleteEvent: (id: string) => void;
  onRecordPenaltyKick: (payload: any) => void;
}

export const MatchTimelineTab: React.FC<MatchTimelineTabProps> = ({
  match,
  onDeleteEvent,
  onRecordPenaltyKick,
}) => {
  const { events, homeTeam, awayTeam, penalties, timer } = match;

  const sortedEvents = [...events].sort((a, b) => b.minute - a.minute);

  const getEventIcon = (event: MatchEvent) => {
    switch (event.type) {
      case 'GOAL':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'YELLOW_CARD':
        return <span className="w-2.5 h-3.5 bg-amber-400 rounded-[1px] inline-block" />;
      case 'RED_CARD':
        return <span className="w-2.5 h-3.5 bg-red-600 rounded-[1px] inline-block" />;
      case 'SUBSTITUTION':
        return <ArrowLeftRight className="w-4 h-4 text-emerald-400" />;
      case 'VAR_CHECK':
        return <ShieldAlert className="w-4 h-4 text-cyan-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(match, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `match_report_${match.homeTeam.shortName}_vs_${match.awayTeam.shortName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* 1. PENALTY SHOOTOUT TRACKER (IF ACTIVE OR READY) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              SHOOTOUT CONSOLE
            </span>
            <h3 className="font-extrabold text-lg text-white font-['Outfit'] mt-0.5">
              Penalty Shootout Manager
            </h3>
          </div>

          <button
            onClick={() => onRecordPenaltyKick({ action: 'reset' })}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-colors"
          >
            Reset Penalties
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Home Penalties */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <span>{homeTeam.crest}</span> {homeTeam.name}
              </span>
              <span className="font-mono font-black text-2xl text-amber-400">
                {penalties.homeScore}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {penalties.homeKicks.map((kick, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                      kick === 'scored'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_8px_#10b981]'
                        : kick === 'missed'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-slate-900 text-slate-500 border-slate-700'
                    }`}
                  >
                    {kick === 'scored' ? '✓' : kick === 'missed' ? '✕' : '-'}
                  </div>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => onRecordPenaltyKick({ action: 'kick', team: 'home', roundIndex: idx, result: 'scored' })}
                      className="px-1.5 py-0.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded text-[9px] font-bold"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => onRecordPenaltyKick({ action: 'kick', team: 'home', roundIndex: idx, result: 'missed' })}
                      className="px-1.5 py-0.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded text-[9px] font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Away Penalties */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <span>{awayTeam.crest}</span> {awayTeam.name}
              </span>
              <span className="font-mono font-black text-2xl text-amber-400">
                {penalties.awayScore}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {penalties.awayKicks.map((kick, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                      kick === 'scored'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_8px_#10b981]'
                        : kick === 'missed'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-slate-900 text-slate-500 border-slate-700'
                    }`}
                  >
                    {kick === 'scored' ? '✓' : kick === 'missed' ? '✕' : '-'}
                  </div>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => onRecordPenaltyKick({ action: 'kick', team: 'away', roundIndex: idx, result: 'scored' })}
                      className="px-1.5 py-0.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded text-[9px] font-bold"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => onRecordPenaltyKick({ action: 'kick', team: 'away', roundIndex: idx, result: 'missed' })}
                      className="px-1.5 py-0.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded text-[9px] font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHRONOLOGICAL TIMELINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              MATCH HISTORY
            </span>
            <h3 className="font-extrabold text-lg text-white font-['Outfit'] mt-0.5 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" /> Match Event Log & Undo
            </h3>
          </div>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Match Report (JSON)
          </button>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No match events recorded yet. Click '+1 Goal', 'Issue Card', or 'Substitution' to begin logging!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 mt-2">
            {sortedEvents.map((evt) => {
              const teamName = evt.team === 'home' ? homeTeam.name : awayTeam.name;
              const teamCrest = evt.team === 'home' ? homeTeam.crest : awayTeam.crest;

              return (
                <div key={evt.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Minute Badge */}
                    <span className="w-10 text-center font-mono font-bold text-amber-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs">
                      {evt.minute}'
                    </span>

                    {/* Icon */}
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      {getEventIcon(evt)}
                    </div>

                    {/* Event Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {evt.playerName || evt.type}
                        </span>
                        <span className="text-xs text-slate-400">
                          {teamCrest} {teamName}
                        </span>
                      </div>
                      {evt.type === 'GOAL' && evt.assistPlayerName && (
                        <span className="text-[11px] text-slate-400 block">
                          Assist: {evt.assistPlayerName}
                        </span>
                      )}
                      {evt.type === 'SUBSTITUTION' && evt.playerIn && evt.playerOut && (
                        <span className="text-[11px] text-slate-400 block">
                          In: #{evt.playerInNumber} {evt.playerIn} · Out: #{evt.playerOutNumber} {evt.playerOut}
                        </span>
                      )}
                      {evt.notes && (
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {evt.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete / Undo Button */}
                  <button
                    onClick={() => onDeleteEvent(evt.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Undo / Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
