import React, { useEffect } from 'react';
import { MatchState } from '../../types/match';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ArrowDown, ArrowUp, UserCheck, Users } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface GraphicOverlayProps {
  match: MatchState;
  onDismiss?: () => void;
}

export const BroadcastGraphicOverlay: React.FC<GraphicOverlayProps> = ({ match, onDismiss }) => {
  const { graphic, homeTeam, awayTeam, stats } = match;

  useEffect(() => {
    if (graphic.active && graphic.durationMs && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, graphic.durationMs);
      return () => clearTimeout(timer);
    }
  }, [graphic.active, graphic.durationMs, graphic.triggeredAt, onDismiss]);

  if (!graphic.active || graphic.type === 'NONE') {
    return null;
  }

  const activeTeam = graphic.team === 'home' ? homeTeam : graphic.team === 'away' ? awayTeam : homeTeam;

  // Find player photo if not directly provided
  const resolvedGoalPhoto =
    graphic.playerPhoto ||
    activeTeam?.lineup?.find(
      (p) => p.name.toLowerCase() === graphic.playerName?.toLowerCase() || p.number === graphic.playerNumber
    )?.photoUrl;

  const resolvedInPhoto =
    graphic.playerInPhoto ||
    activeTeam?.lineup?.find(
      (p) => p.name.toLowerCase() === graphic.playerIn?.toLowerCase() || p.number === graphic.playerInNumber
    )?.photoUrl;

  const resolvedOutPhoto =
    graphic.playerOutPhoto ||
    activeTeam?.lineup?.find(
      (p) => p.name.toLowerCase() === graphic.playerOut?.toLowerCase() || p.number === graphic.playerOutNumber
    )?.photoUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-x-0 bottom-12 flex justify-center pointer-events-none z-50 px-4">
        
        {/* 1. GOAL CELEBRATION LOWER-THIRD WITH PLAYER PHOTO */}
        {graphic.type === 'GOAL_BANNER' && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-stretch bg-slate-950/95 text-white border-2 border-amber-400 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-w-3xl w-full backdrop-blur-md"
          >
            {/* Player Headshot Photo Card */}
            <div
              className="px-5 py-3 flex items-center justify-center relative overflow-hidden shrink-0 border-r border-white/10"
              style={{ backgroundColor: activeTeam?.primaryColor || '#1e3a8a' }}
            >
              <div className="relative">
                <PlayerAvatar
                  name={graphic.playerName || 'Goal Scorer'}
                  number={graphic.playerNumber}
                  photoUrl={resolvedGoalPhoto}
                  size="xl"
                  primaryColor={activeTeam?.primaryColor}
                  className="ring-4 ring-white/30"
                />
              </div>
            </div>

            {/* Goal Details */}
            <div className="flex-1 px-6 py-4 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded tracking-wider uppercase font-mono">
                  GOAL!
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <span>{activeTeam?.crest}</span>
                  <span>{activeTeam?.name}</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight mt-0.5">
                {graphic.playerName}
              </h2>
              {graphic.assistPlayerName && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Assist: <span className="text-slate-200 font-semibold">{graphic.assistPlayerName}</span>
                </p>
              )}
            </div>

            {/* Score Highlight Box */}
            <div className="bg-slate-900 px-6 flex flex-col items-center justify-center border-l border-white/10 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                SCORE
              </span>
              <span className="font-mono font-black text-3xl sm:text-4xl text-amber-400 tabular-nums">
                {match.homeScore} - {match.awayScore}
              </span>
            </div>
          </motion.div>
        )}

        {/* 2. VAR REVIEW BANNER */}
        {graphic.type === 'VAR_CHECK' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="flex items-center bg-[#070e1c]/95 border-2 border-cyan-400 text-white rounded-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.4)] max-w-xl w-full backdrop-blur-md"
          >
            <div className="bg-cyan-500 text-slate-950 p-4 flex flex-col items-center justify-center font-black tracking-widest font-mono shrink-0">
              <ShieldAlert className="w-7 h-7 mb-0.5" />
              <span className="text-sm">VAR</span>
            </div>
            <div className="px-6 py-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  {graphic.varDecision || 'CHECKING'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit'] mt-0.5">
                {graphic.title || 'VAR REVIEW IN PROGRESS'}
              </h3>
              {graphic.subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{graphic.subtitle}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. ELECTRONIC SUBSTITUTION BOARD WITH PLAYER PHOTOS */}
        {graphic.type === 'SUBSTITUTION_BOARD' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col bg-[#0b0c10]/95 border border-white/20 rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full backdrop-blur-md"
          >
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-white/10 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span>SUBSTITUTION · {activeTeam?.name || 'MATCH'}</span>
              <span>{activeTeam?.crest}</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              {/* Player IN (Green) */}
              <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3">
                <PlayerAvatar
                  name={graphic.playerIn || 'Incoming'}
                  number={graphic.playerInNumber}
                  photoUrl={resolvedInPhoto}
                  size="lg"
                  primaryColor="#10b981"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                    <ArrowUp className="w-3.5 h-3.5" /> IN (#{graphic.playerInNumber || 11})
                  </span>
                  <span className="font-bold text-base text-white truncate">
                    {graphic.playerIn || 'Incoming Player'}
                  </span>
                </div>
              </div>

              {/* Player OUT (Red) */}
              <div className="flex items-center gap-3 bg-red-950/40 border border-red-500/40 rounded-xl p-3">
                <PlayerAvatar
                  name={graphic.playerOut || 'Outgoing'}
                  number={graphic.playerOutNumber}
                  photoUrl={resolvedOutPhoto}
                  size="lg"
                  primaryColor="#ef4444"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                    <ArrowDown className="w-3.5 h-3.5" /> OUT (#{graphic.playerOutNumber || 7})
                  </span>
                  <span className="font-bold text-base text-white truncate">
                    {graphic.playerOut || 'Outgoing Player'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. YELLOW / RED CARD ALERT WITH PLAYER PHOTO */}
        {graphic.type === 'CARD_ALERT' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="flex items-center bg-slate-950/95 border border-white/20 text-white rounded-2xl overflow-hidden shadow-2xl p-4 gap-4 max-w-lg w-full backdrop-blur-md"
          >
            <div
              className={`w-12 h-16 rounded-[4px] shadow-lg shrink-0 flex items-center justify-center ${
                graphic.cardColor === 'red' ? 'bg-red-600 shadow-red-600/50' : 'bg-amber-400 shadow-amber-400/50'
              }`}
            />
            <PlayerAvatar
              name={graphic.playerName || 'Player'}
              number={graphic.playerNumber}
              photoUrl={resolvedGoalPhoto}
              size="lg"
              primaryColor={graphic.cardColor === 'red' ? '#ef4444' : '#f59e0b'}
            />
            <div className="flex flex-col">
              <span
                className={`text-xs font-mono font-bold tracking-wider uppercase ${
                  graphic.cardColor === 'red' ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {graphic.cardColor === 'red' ? 'RED CARD' : 'YELLOW CARD'}
              </span>
              <h3 className="text-xl font-black text-white font-['Outfit'] mt-0.5">
                {graphic.playerName || 'Player'}
              </h3>
              <span className="text-xs text-slate-400">
                {activeTeam?.name} · #{graphic.playerNumber || 5}
              </span>
            </div>
          </motion.div>
        )}

        {/* 5. MATCH STATS FULL COMPARISON LOWER-THIRD */}
        {graphic.type === 'STATS_LOWER_THIRD' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35 }}
            className="bg-slate-950/95 text-white border border-white/20 rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full p-4 backdrop-blur-md"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{homeTeam.crest}</span>
                <span className="font-extrabold text-base font-['Barlow_Condensed'] uppercase tracking-wide">
                  {homeTeam.name}
                </span>
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                MATCH STATISTICS
              </span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base font-['Barlow_Condensed'] uppercase tracking-wide">
                  {awayTeam.name}
                </span>
                <span className="text-xl">{awayTeam.crest}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between font-bold text-sm mb-1">
                  <span>{stats.home.possession}%</span>
                  <span className="text-slate-400 font-sans text-xs uppercase">Possession</span>
                  <span>{stats.away.possession}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full" style={{ width: `${stats.home.possession}%`, backgroundColor: homeTeam.primaryColor }} />
                  <div className="h-full" style={{ width: `${stats.away.possession}%`, backgroundColor: awayTeam.primaryColor }} />
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5 font-semibold">
                <span>{stats.home.shots}</span>
                <span className="text-slate-400 font-sans uppercase text-[11px]">Total Shots</span>
                <span>{stats.away.shots}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5 font-semibold">
                <span>{stats.home.shotsOnTarget}</span>
                <span className="text-slate-400 font-sans uppercase text-[11px]">Shots On Target</span>
                <span>{stats.away.shotsOnTarget}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5 font-semibold">
                <span>{stats.home.corners}</span>
                <span className="text-slate-400 font-sans uppercase text-[11px]">Corners</span>
                <span>{stats.away.corners}</span>
              </div>

              <div className="flex justify-between py-1 font-semibold">
                <span>{stats.home.fouls}</span>
                <span className="text-slate-400 font-sans uppercase text-[11px]">Fouls</span>
                <span>{stats.away.fouls}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 6. TEAM STARTING XI LINEUP CARD WITH PHOTOS */}
        {graphic.type === 'TEAM_LINEUP' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-950/98 text-white border-2 border-white/20 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-w-4xl w-full p-5 backdrop-blur-lg"
          >
            {/* Header */}
            <div
              className="p-4 rounded-xl flex items-center justify-between mb-4 border border-white/10"
              style={{ backgroundColor: activeTeam?.primaryColor || '#1e3a8a' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeTeam?.crest}</span>
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-950 bg-white/90 px-2 py-0.5 rounded uppercase">
                    STARTING XI · {activeTeam?.formation || '4-3-3'}
                  </span>
                  <h3 className="text-2xl font-black font-['Outfit'] uppercase text-white mt-0.5">
                    {activeTeam?.name}
                  </h3>
                </div>
              </div>
              {activeTeam?.coach && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">MANAGER</span>
                  <span className="font-bold text-sm text-white">{activeTeam.coach}</span>
                </div>
              )}
            </div>

            {/* Players Grid with Photos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto no-scrollbar">
              {activeTeam?.lineup?.slice(0, 11).map((player) => (
                <div
                  key={player.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm"
                >
                  <PlayerAvatar
                    name={player.name}
                    number={player.number}
                    photoUrl={player.photoUrl}
                    size="md"
                    primaryColor={activeTeam.primaryColor}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-white truncate">{player.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono font-semibold">
                      #{player.number} · {player.position}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </AnimatePresence>
  );
};
