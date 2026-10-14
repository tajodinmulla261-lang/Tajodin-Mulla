import React from 'react';
import { MatchState, BroadcastGraphic } from '../../types/match';
import { Tv, Award, ShieldAlert, ArrowLeftRight, AlertTriangle, BarChart3, EyeOff, Sparkles } from 'lucide-react';

interface BroadcastGraphicsTabProps {
  match: MatchState;
  onTriggerGraphic: (graphic: BroadcastGraphic) => void;
}

export const BroadcastGraphicsTab: React.FC<BroadcastGraphicsTabProps> = ({
  match,
  onTriggerGraphic,
}) => {
  const { graphic, homeTeam, awayTeam } = match;

  const handleClear = () => {
    onTriggerGraphic({
      active: false,
      type: 'NONE',
      title: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Active Graphic Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            ON-AIR GRAPHIC STATUS
          </span>
          <div className="flex items-center gap-3 mt-1">
            {graphic.active && graphic.type !== 'NONE' ? (
              <>
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                <h3 className="font-extrabold text-lg text-white font-['Outfit']">
                  Active: <span className="text-amber-400">{graphic.title || graphic.type}</span>
                </h3>
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-slate-600" />
                <h3 className="font-extrabold text-lg text-slate-400 font-['Outfit']">
                  No Graphic Currently Active On Stream
                </h3>
              </>
            )}
          </div>
        </div>

        {graphic.active && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg"
          >
            <EyeOff className="w-4 h-4" /> Clear On-Air Graphic
          </button>
        )}
      </div>

      {/* Triggers Deck Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. GOAL CELEBRATION LOWER-THIRD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Award className="w-5 h-5" />
              <h4 className="font-bold text-base text-white font-['Outfit']">Goal Celebration Stinger</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Dramatic animated lower-third graphic displaying goal scorer name, jersey #, assist player, and updated match score.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                onTriggerGraphic({
                  active: true,
                  type: 'GOAL_BANNER',
                  title: 'GOAL!',
                  subtitle: homeTeam.name,
                  team: 'home',
                  playerName: homeTeam.lineup[0]?.name || 'Vinicius Jr',
                  playerNumber: homeTeam.lineup[0]?.number || 7,
                  assistPlayerName: 'J. Bellingham',
                  durationMs: 7000,
                  triggeredAt: Date.now(),
                });
              }}
              className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>{homeTeam.crest}</span> Trigger {homeTeam.shortName} Goal
            </button>

            <button
              onClick={() => {
                onTriggerGraphic({
                  active: true,
                  type: 'GOAL_BANNER',
                  title: 'GOAL!',
                  subtitle: awayTeam.name,
                  team: 'away',
                  playerName: awayTeam.lineup[0]?.name || 'E. Haaland',
                  playerNumber: awayTeam.lineup[0]?.number || 9,
                  assistPlayerName: 'K. De Bruyne',
                  durationMs: 7000,
                  triggeredAt: Date.now(),
                });
              }}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <span>{awayTeam.crest}</span> Trigger {awayTeam.shortName} Goal
            </button>
          </div>
        </div>

        {/* 2. VAR CHECK BANNER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-bold text-base text-white font-['Outfit']">VAR Review Graphic</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Animated VAR review stinger with pulsing radar scanning line and official decision status.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                onTriggerGraphic({
                  active: true,
                  type: 'VAR_CHECK',
                  title: 'VAR CHECK: POSSIBLE PENALTY',
                  subtitle: 'Checking handball inside 18-yard box',
                  varDecision: 'CHECKING',
                  durationMs: 8000,
                  triggeredAt: Date.now(),
                });
              }}
              className="w-full py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition-colors"
            >
              Trigger VAR Checking
            </button>

            <button
              onClick={() => {
                onTriggerGraphic({
                  active: true,
                  type: 'VAR_CHECK',
                  title: 'VAR DECISION: GOAL CONFIRMED',
                  subtitle: 'No offside in buildup',
                  varDecision: 'GOAL',
                  durationMs: 6000,
                  triggeredAt: Date.now(),
                });
              }}
              className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition-colors"
            >
              Trigger Decision: GOAL
            </button>
          </div>
        </div>

        {/* 3. ELECTRONIC SUB BOARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ArrowLeftRight className="w-5 h-5" />
              <h4 className="font-bold text-base text-white font-['Outfit']">Substitution Board</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              High-contrast electronic LED board showing incoming player (# in green) and outgoing player (# in red).
            </p>
          </div>

          <button
            onClick={() => {
              onTriggerGraphic({
                active: true,
                type: 'SUBSTITUTION_BOARD',
                title: 'SUBSTITUTION',
                subtitle: homeTeam.name,
                team: 'home',
                playerIn: 'L. Modric',
                playerInNumber: 10,
                playerOut: 'T. Kroos',
                playerOutNumber: 8,
                durationMs: 7000,
                triggeredAt: Date.now(),
              });
            }}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            Trigger Substitution Board
          </button>
        </div>

        {/* 4. MATCH STATS FULL LOWER-THIRD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <BarChart3 className="w-5 h-5" />
              <h4 className="font-bold text-base text-white font-['Outfit']">Full Match Stats Lower-Third</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Side-by-side TV broadcast stats comparison card showing possession, shots, fouls, and corners.
            </p>
          </div>

          <button
            onClick={() => {
              onTriggerGraphic({
                active: true,
                type: 'STATS_LOWER_THIRD',
                title: 'MATCH STATISTICS',
                durationMs: 9000,
                triggeredAt: Date.now(),
              });
            }}
            className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors"
          >
            Trigger Match Stats Banner
          </button>
        </div>

        {/* 5. RED CARD STINGER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-base text-white font-['Outfit']">Red Card Alert</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Dramatic red card dismissal alert popup on the live broadcast.
            </p>
          </div>

          <button
            onClick={() => {
              onTriggerGraphic({
                active: true,
                type: 'CARD_ALERT',
                cardColor: 'red',
                title: 'RED CARD',
                team: 'home',
                playerName: 'D. Carvajal',
                playerNumber: 2,
                durationMs: 6000,
                triggeredAt: Date.now(),
              });
            }}
            className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors"
          >
            Trigger Red Card Alert
          </button>
        </div>

        {/* 6. HALF TIME / FULL TIME BANNER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Tv className="w-5 h-5" />
              <h4 className="font-bold text-base text-white font-['Outfit']">Period Stinger Banner</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Display official Half Time or Full Time graphic on-screen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onTriggerGraphic({
                  active: true,
                  type: 'PERIOD_BANNER',
                  title: 'HALF TIME',
                  subtitle: `${homeTeam.shortName} ${match.homeScore} - ${match.awayScore} ${awayTeam.shortName}`,
                  durationMs: 6000,
                  triggeredAt: Date.now(),
                });
              }}
              className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs uppercase transition-colors text-center"
            >
              Half Time
            </button>
            <button
              onClick={() => {
                onTriggerGraphic({
                  active: true,
                  type: 'PERIOD_BANNER',
                  title: 'FULL TIME',
                  subtitle: `${homeTeam.shortName} ${match.homeScore} - ${match.awayScore} ${awayTeam.shortName}`,
                  durationMs: 8000,
                  triggeredAt: Date.now(),
                });
              }}
              className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs uppercase transition-colors text-center"
            >
              Full Time
            </button>
          </div>
        </div>

        {/* 7. TEAM STARTING XI LINEUP WITH PHOTOS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Tv className="w-5 h-5" />
              <h4 className="font-bold text-base text-white font-['Outfit']">Starting XI Lineup with Photos</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Display official pre-match lineup card with all 11 player photos, numbers, and manager on the stream.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onTriggerGraphic({
                  active: true,
                  type: 'TEAM_LINEUP',
                  title: `${homeTeam.name} Lineup`,
                  subtitle: `${homeTeam.formation || '4-3-3'} · Coach: ${homeTeam.coach || 'Manager'}`,
                  team: 'home',
                  durationMs: 12000,
                  triggeredAt: Date.now(),
                });
              }}
              className="py-2.5 px-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs uppercase transition-colors text-center truncate"
            >
              {homeTeam.shortName} Lineup
            </button>
            <button
              onClick={() => {
                onTriggerGraphic({
                  active: true,
                  type: 'TEAM_LINEUP',
                  title: `${awayTeam.name} Lineup`,
                  subtitle: `${awayTeam.formation || '4-3-3'} · Coach: ${awayTeam.coach || 'Manager'}`,
                  team: 'away',
                  durationMs: 12000,
                  triggeredAt: Date.now(),
                });
              }}
              className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs uppercase transition-colors text-center truncate border border-slate-700"
            >
              {awayTeam.shortName} Lineup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
