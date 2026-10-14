import React, { useState } from 'react';
import { MatchState, MatchPeriod, Team, MatchEvent, BroadcastGraphic } from '../../types/match';
import { formatMatchTime, getPeriodLabel } from '../../utils/formatters';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Award,
  AlertTriangle,
  Flame,
  Tv,
  Smartphone,
  Download,
  Share2,
  RefreshCw,
  Monitor,
  Check,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
  X,
  Trophy,
  User,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { CreateMatchModal } from '../modals/CreateMatchModal';
import { CreateTeamModal } from '../modals/CreateTeamModal';
import { VarCheckModal } from '../modals/VarCheckModal';
import { ApkInstallModal } from '../modals/ApkInstallModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface MobileScorerViewProps {
  match: MatchState;
  teamsLibrary: Record<string, Team>;
  isConnected: boolean;
  onUpdateScore: (
    team: 'home' | 'away',
    delta: number,
    player?: { name: string; number?: number },
    assist?: string
  ) => Promise<void>;
  onUpdateTimer: (
    action: 'start' | 'pause' | 'reset' | 'set_seconds' | 'set_stoppage' | 'set_period',
    params?: { seconds?: number; stoppageTime?: number; period?: MatchPeriod }
  ) => Promise<void>;
  onAddEvent: (eventData: Omit<MatchEvent, 'id' | 'timestamp'>) => Promise<void>;
  onDeleteEvent?: (eventId: string) => Promise<void>;
  onTriggerGraphic: (graphic: BroadcastGraphic) => Promise<void>;
  onCreateMatch?: (params: any) => Promise<void>;
  onResetMatch?: () => Promise<void>;
  onSaveTeam?: (team: Team) => Promise<void>;
  onSetMatchTeam?: (slot: 'home' | 'away', teamId?: string, team?: Team) => Promise<void>;
  onSwitchToStudio?: () => void;
}

export const MobileScorerView: React.FC<MobileScorerViewProps> = ({
  match,
  teamsLibrary,
  isConnected,
  onUpdateScore,
  onUpdateTimer,
  onAddEvent,
  onDeleteEvent,
  onTriggerGraphic,
  onCreateMatch,
  onResetMatch,
  onSaveTeam,
  onSetMatchTeam,
  onSwitchToStudio,
}) => {
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isVarOpen, setIsVarOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Dedicated Goal Scorer Modal State
  const [goalModal, setGoalModal] = useState<{
    isOpen: boolean;
    team: 'home' | 'away';
  }>({
    isOpen: false,
    team: 'home',
  });

  const [scorerSelectedPlayer, setScorerSelectedPlayer] = useState<string>('');
  const [scorerPlayerNumber, setScorerPlayerNumber] = useState<number | undefined>(undefined);
  const [scorerPlayerPhoto, setScorerPlayerPhoto] = useState<string | undefined>(undefined);
  const [scorerCustomName, setScorerCustomName] = useState<string>('');
  const [scorerCustomNumber, setScorerCustomNumber] = useState<string>('');
  const [goalType, setGoalType] = useState<'REGULAR' | 'PENALTY' | 'FREE_KICK' | 'OWN_GOAL'>('REGULAR');
  const [assistName, setAssistName] = useState<string>('');
  const [goalMinute, setGoalMinute] = useState<number>(1);

  const { isInstallable, install } = usePWAInstall();

  // Haptic feedback helper for phone scoring
  const triggerHaptic = (ms: number = 40) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch {
      // Ignore vibration error
    }
  };

  const openGoalModal = (team: 'home' | 'away') => {
    triggerHaptic(40);
    const targetTeam = team === 'home' ? match.homeTeam : match.awayTeam;
    const currentMin = Math.max(1, Math.floor(match.timer.seconds / 60));
    setGoalMinute(currentMin);
    setGoalType('REGULAR');
    setAssistName('');
    setScorerCustomName('');
    setScorerCustomNumber('');

    if (targetTeam.lineup && targetTeam.lineup.length > 0) {
      setScorerSelectedPlayer(targetTeam.lineup[0].name);
      setScorerPlayerNumber(targetTeam.lineup[0].number);
      setScorerPlayerPhoto(targetTeam.lineup[0].photoUrl);
    } else {
      setScorerSelectedPlayer('');
      setScorerPlayerNumber(undefined);
      setScorerPlayerPhoto(undefined);
    }

    setGoalModal({ isOpen: true, team });
  };

  const handleConfirmGoal = async (quickWithoutDetails: boolean = false) => {
    triggerHaptic(70);
    const team = goalModal.team;
    const targetTeam = team === 'home' ? match.homeTeam : match.awayTeam;
    const minute = goalMinute;

    let finalPlayerName = targetTeam.name;
    let finalPlayerNumber: number | undefined = undefined;
    let finalPlayerPhoto: string | undefined = undefined;

    if (!quickWithoutDetails) {
      if (scorerCustomName.trim()) {
        finalPlayerName = scorerCustomName.trim();
        finalPlayerNumber = scorerCustomNumber ? parseInt(scorerCustomNumber, 10) : undefined;
      } else if (scorerSelectedPlayer) {
        finalPlayerName = scorerSelectedPlayer;
        finalPlayerNumber = scorerPlayerNumber;
        finalPlayerPhoto = scorerPlayerPhoto;
      } else if (goalType === 'OWN_GOAL') {
        finalPlayerName = 'Own Goal (OG)';
      }
    }

    const noteText =
      goalType === 'PENALTY'
        ? 'Penalty Goal'
        : goalType === 'FREE_KICK'
        ? 'Free Kick Goal'
        : goalType === 'OWN_GOAL'
        ? 'Own Goal'
        : 'Goal';

    await onUpdateScore(
      team,
      1,
      { name: finalPlayerName, number: finalPlayerNumber },
      assistName.trim() || undefined
    );

    await onAddEvent({
      type: 'GOAL',
      team,
      minute,
      playerName: finalPlayerName,
      playerNumber: finalPlayerNumber,
      assistPlayerName: assistName.trim() || undefined,
      notes: noteText,
    });

    await onTriggerGraphic({
      active: true,
      type: 'GOAL_BANNER',
      title: goalType === 'OWN_GOAL' ? 'OWN GOAL!' : goalType === 'PENALTY' ? 'PENALTY GOAL!' : 'GOAL!',
      subtitle: targetTeam.name,
      team,
      playerName: finalPlayerName,
      playerNumber: finalPlayerNumber,
      playerPhoto: finalPlayerPhoto,
      assistPlayerName: assistName.trim() || undefined,
      durationMs: 7000,
      triggeredAt: Date.now(),
    });

    setGoalModal({ isOpen: false, team: 'home' });
  };

  const handleDecrementGoal = async (team: 'home' | 'away') => {
    triggerHaptic(40);
    const currentScore = team === 'home' ? match.homeScore : match.awayScore;
    if (currentScore > 0) {
      await onUpdateScore(team, -1);
    }
  };

  const handleCard = async (team: 'home' | 'away', cardType: 'YELLOW_CARD' | 'RED_CARD') => {
    triggerHaptic(60);
    const minute = Math.max(1, Math.floor(match.timer.seconds / 60));
    const targetTeam = team === 'home' ? match.homeTeam : match.awayTeam;
    await onAddEvent({
      type: cardType,
      team,
      minute,
      playerName: `${targetTeam.shortName} Player`,
      notes: cardType === 'YELLOW_CARD' ? 'Yellow Card' : 'Red Card',
    });
    await onTriggerGraphic({
      active: true,
      type: 'CARD_ALERT',
      title: cardType === 'YELLOW_CARD' ? 'YELLOW CARD' : 'RED CARD',
      subtitle: targetTeam.name,
      team,
      cardColor: cardType === 'YELLOW_CARD' ? 'yellow' : 'red',
      durationMs: 4000,
      triggeredAt: Date.now(),
    });
  };

  const handleSwapSides = async () => {
    if (!onSetMatchTeam) return;
    triggerHaptic(50);
    const oldHome = match.homeTeam;
    const oldAway = match.awayTeam;
    await onSetMatchTeam('home', undefined, oldAway);
    await onSetMatchTeam('away', undefined, oldHome);
  };

  const timeInfo = formatMatchTime(match.timer.seconds, match.timer.stoppageTime);

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col font-sans pb-16 select-none touch-manipulation">
      {/* 1. TOP MOBILE APP HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-400/20">
            ⚽
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-['Outfit'] font-black text-sm text-white tracking-tight uppercase">
                ITC Sports
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PHONE REMOTE
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-red-500'}`} />
              <span>{isConnected ? 'LIVE OBS SYNC' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Create Match Button */}
          {onCreateMatch && (
            <button
              onClick={() => {
                triggerHaptic(30);
                setIsCreateMatchOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm active:scale-95 transition"
              title="Create New Match Fixture"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-wider font-extrabold hidden xs:inline">New Match</span>
            </button>
          )}

          {/* APK / Install Button */}
          <button
            onClick={() => {
              triggerHaptic(30);
              if (isInstallable) {
                install();
              } else {
                setIsApkModalOpen(true);
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-sm active:scale-95 transition"
            title="Install APK on Phone"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px]">APK App</span>
          </button>

          {/* Switch to Full Studio */}
          {onSwitchToStudio && (
            <button
              onClick={() => {
                triggerHaptic(30);
                onSwitchToStudio();
              }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Switch to Full Studio Mode"
            >
              <Monitor className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2. MATCH INFO & CREATE MATCH BAR */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
        <div className="truncate text-slate-300 font-medium">
          <span className="text-amber-400 font-bold">{match.competition}</span>
          {match.venue && <span className="text-slate-400 text-[11px] ml-1.5">· {match.venue}</span>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              triggerHaptic(30);
              setIsCreateMatchOpen(true);
            }}
            className="px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 active:scale-95 transition"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            New Match
          </button>

          <button
            onClick={handleSwapSides}
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] active:scale-95 transition"
            title="Swap Sides at Halftime"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. BIG SCORE TOUCH CONTROLLER */}
      <div className="p-3">
        <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-xl">
          <div className="grid grid-cols-5 items-center gap-2">
            
            {/* HOME TEAM CARD & CONTROLS (cols 2) */}
            <div className="col-span-2 flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border"
                style={{
                  backgroundColor: match.homeTeam.primaryColor || '#1e3a8a',
                  borderColor: match.homeTeam.secondaryColor || '#ffffff',
                }}
              >
                {match.homeTeam.crest || '⚽'}
              </div>
              <h3 className="mt-1.5 font-['Barlow_Condensed'] font-bold text-lg text-white uppercase tracking-wide truncate max-w-[120px]">
                {match.homeTeam.shortName || match.homeTeam.name}
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">HOME</span>

              {/* Big Score Display */}
              <div className="mt-2 text-5xl font-mono font-black text-white bg-slate-900 border border-slate-800 rounded-xl w-full py-2 shadow-inner">
                {match.homeScore}
              </div>

              {/* Score Buttons & Scorer Selector */}
              <div className="flex flex-col gap-1.5 w-full mt-2">
                <button
                  onClick={() => openGoalModal('home')}
                  className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition"
                  title="Select Goalscorer & Broadcast Goal"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Goal & Scorer</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5 w-full">
                  <button
                    onClick={() => openGoalModal('home')}
                    className="py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold active:scale-90 flex items-center justify-center gap-0.5"
                    title="Quick +1 Goal"
                  >
                    <Plus className="w-3.5 h-3.5" /> 1
                  </button>
                  <button
                    onClick={() => handleDecrementGoal('home')}
                    disabled={match.homeScore <= 0}
                    className="py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-400 text-xs font-bold active:scale-90 flex items-center justify-center gap-0.5"
                    title="Undo -1 Goal"
                  >
                    <Minus className="w-3.5 h-3.5" /> 1
                  </button>
                </div>
              </div>

              {/* Quick Cards for Home */}
              <div className="grid grid-cols-2 gap-1 w-full mt-2">
                <button
                  onClick={() => handleCard('home', 'YELLOW_CARD')}
                  className="py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold active:scale-95"
                >
                  🟨 Card
                </button>
                <button
                  onClick={() => handleCard('home', 'RED_CARD')}
                  className="py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold active:scale-95"
                >
                  🟥 Card
                </button>
              </div>
            </div>

            {/* CENTER MATCH PERIOD & CLOCK (col 1) */}
            <div className="col-span-1 flex flex-col items-center justify-center text-center px-1">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-400 border border-slate-800 mb-1">
                {getPeriodLabel(match.timer.period)}
              </span>

              <span className="text-xl font-mono font-black text-slate-100 tracking-tight">
                {timeInfo.display}
              </span>
              {timeInfo.stoppageDisplay && (
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {timeInfo.stoppageDisplay}
                </span>
              )}

              {/* Timer Start / Pause Button */}
              <button
                onClick={() => {
                  triggerHaptic(40);
                  onUpdateTimer(match.timer.isRunning ? 'pause' : 'start');
                }}
                className={`w-11 h-11 mt-3 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition ${
                  match.timer.isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                }`}
                title={match.timer.isRunning ? 'Pause Timer' : 'Start Timer'}
              >
                {match.timer.isRunning ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  triggerHaptic(30);
                  onUpdateTimer('reset');
                }}
                className="mt-2 text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5"
                title="Reset Clock"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* AWAY TEAM CARD & CONTROLS (cols 2) */}
            <div className="col-span-2 flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border"
                style={{
                  backgroundColor: match.awayTeam.primaryColor || '#dc2626',
                  borderColor: match.awayTeam.secondaryColor || '#ffffff',
                }}
              >
                {match.awayTeam.crest || '⚽'}
              </div>
              <h3 className="mt-1.5 font-['Barlow_Condensed'] font-bold text-lg text-white uppercase tracking-wide truncate max-w-[120px]">
                {match.awayTeam.shortName || match.awayTeam.name}
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">AWAY</span>

              {/* Big Score Display */}
              <div className="mt-2 text-5xl font-mono font-black text-white bg-slate-900 border border-slate-800 rounded-xl w-full py-2 shadow-inner">
                {match.awayScore}
              </div>

              {/* Score Buttons & Scorer Selector */}
              <div className="flex flex-col gap-1.5 w-full mt-2">
                <button
                  onClick={() => openGoalModal('away')}
                  className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition"
                  title="Select Goalscorer & Broadcast Goal"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Goal & Scorer</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5 w-full">
                  <button
                    onClick={() => openGoalModal('away')}
                    className="py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold active:scale-90 flex items-center justify-center gap-0.5"
                    title="Quick +1 Goal"
                  >
                    <Plus className="w-3.5 h-3.5" /> 1
                  </button>
                  <button
                    onClick={() => handleDecrementGoal('away')}
                    disabled={match.awayScore <= 0}
                    className="py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-400 text-xs font-bold active:scale-90 flex items-center justify-center gap-0.5"
                    title="Undo -1 Goal"
                  >
                    <Minus className="w-3.5 h-3.5" /> 1
                  </button>
                </div>
              </div>

              {/* Quick Cards for Away */}
              <div className="grid grid-cols-2 gap-1 w-full mt-2">
                <button
                  onClick={() => handleCard('away', 'YELLOW_CARD')}
                  className="py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold active:scale-95"
                >
                  🟨 Card
                </button>
                <button
                  onClick={() => handleCard('away', 'RED_CARD')}
                  className="py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold active:scale-95"
                >
                  🟥 Card
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. PERIOD SWITCHER BUTTONS (Thumb Reach) */}
      <div className="px-3 py-1">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2">
          <div className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
            <span>Match Period</span>
            <span className="text-amber-400 font-mono">{match.timer.period}</span>
          </div>
          <div className="grid grid-cols-6 gap-1 text-center">
            {(
              [
                { id: '1H', label: '1H', sec: 0 },
                { id: 'HT', label: 'HT', sec: 45 * 60 },
                { id: '2H', label: '2H', sec: 45 * 60 },
                { id: 'ET1', label: 'ET', sec: 90 * 60 },
                { id: 'PEN', label: 'PEN', sec: 120 * 60 },
                { id: 'FT', label: 'FT', sec: 90 * 60 },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  triggerHaptic(30);
                  onUpdateTimer('set_period', {
                    period: p.id,
                    seconds: p.sec,
                  });
                }}
                className={`py-2 rounded-lg text-xs font-black transition active:scale-95 ${
                  match.timer.period === p.id
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. QUICK CLOCK ADJUSTMENTS & STOPPAGE TIME */}
      <div className="px-3 py-1">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-slate-300">Stoppage Time:</span>
          </div>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4, 5].map((extra) => (
              <button
                key={extra}
                onClick={() => {
                  triggerHaptic(25);
                  onUpdateTimer('set_stoppage', { stoppageTime: extra });
                }}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-black transition active:scale-95 ${
                  (match.timer.stoppageTime || 0) === extra
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                +{extra}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. TV BROADCAST TRIGGERS (VAR & GRAPHICS) */}
      <div className="px-3 py-1">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Broadcast TV Triggers</span>
            <span className="text-emerald-400 text-[10px]">Real-time OBS Overlay</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                triggerHaptic(50);
                setIsVarOpen(true);
              }}
              className="py-2.5 px-3 rounded-xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span>VAR Check</span>
            </button>

            <button
              onClick={async () => {
                triggerHaptic(50);
                await onTriggerGraphic({
                  active: true,
                  type: 'GOAL_BANNER',
                  title: 'GOAL!',
                  subtitle: `${match.homeTeam.shortName} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.shortName}`,
                  durationMs: 5000,
                  triggeredAt: Date.now(),
                });
              }}
              className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Goal Banner</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6b. QUICK CREATE MATCH / NEW FIXTURE BANNER */}
      {onCreateMatch && (
        <div className="px-3 py-1">
          <button
            onClick={() => {
              triggerHaptic(40);
              setIsCreateMatchOpen(true);
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-300 font-extrabold text-xs flex items-center justify-between shadow-lg active:scale-98 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-white font-extrabold text-xs uppercase tracking-wider">
                  Create New Match (نیا میچ بنائیں)
                </div>
                <div className="text-[10px] text-amber-200/80">
                  Select teams, ground, competition & reset clock to 00:00
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
          </button>
        </div>
      )}

      {/* 7. RECENT MATCH EVENTS & UNDO LOG */}
      <div className="px-3 py-1">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span>Recent Events ({match.events.length})</span>
            {onResetMatch && (
              <button
                onClick={() => {
                  triggerHaptic(30);
                  setIsResetConfirmOpen(true);
                }}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold"
              >
                Reset Match
              </button>
            )}
          </div>

          {match.events.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-xs italic">
              No events recorded yet. Tap + or Cards above to log events!
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {[...match.events].reverse().slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-amber-400 font-bold text-[11px]">
                      {evt.minute}'
                    </span>
                    <span className="text-white font-medium truncate">
                      {evt.playerName || 'Event'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">
                      ({evt.team === 'home' ? match.homeTeam.shortName : match.awayTeam.shortName})
                    </span>
                  </div>

                  {onDeleteEvent && (
                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="text-slate-500 hover:text-red-400 p-1 text-[11px]"
                      title="Undo event"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
        teamsLibrary={teamsLibrary}
        currentCompetition={match.competition}
        currentVenue={match.venue}
        currentReferee={match.referee}
        onSubmitMatch={(matchData) => {
          if (onCreateMatch) {
            onCreateMatch(matchData);
          }
          setIsCreateMatchOpen(false);
        }}
        onOpenCreateTeamModal={() => {
          setIsCreateMatchOpen(false);
          setIsCreateTeamOpen(true);
        }}
      />

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => {
          setIsCreateTeamOpen(false);
          setIsCreateMatchOpen(true);
        }}
        onSaveTeam={onSaveTeam || (async () => {})}
      />

      <VarCheckModal
        isOpen={isVarOpen}
        onClose={() => setIsVarOpen(false)}
        onTrigger={async (payload) => {
          await onTriggerGraphic({
            active: true,
            type: 'VAR_CHECK',
            title: payload.title,
            subtitle: payload.subtitle,
            varDecision: payload.decision,
            durationMs: 8000,
            triggeredAt: Date.now(),
          });
          await onAddEvent({
            type: 'VAR_CHECK',
            team: 'home',
            minute: Math.max(1, Math.floor(match.timer.seconds / 60)),
            playerName: 'VAR Check',
            notes: `${payload.title}: ${payload.decision}`,
          });
        }}
      />

      <ApkInstallModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* 8. MOBILE GOAL SCORER SELECTION MODAL */}
      {goalModal.isOpen && (() => {
        const teamKey = goalModal.team;
        const targetTeam = teamKey === 'home' ? match.homeTeam : match.awayTeam;
        const teamColor = targetTeam.primaryColor || (teamKey === 'home' ? '#2563eb' : '#dc2626');
        const squad = targetTeam.lineup || [];

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
              
              {/* Header */}
              <div
                className="px-5 py-3.5 flex items-center justify-between text-white shrink-0 border-b border-white/10"
                style={{ backgroundColor: teamColor }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-lg shadow-sm shrink-0">
                    {targetTeam.crest || '⚽'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-['Outfit'] font-black text-sm tracking-wide uppercase">
                        GOAL! · {targetTeam.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/30">
                        {teamKey === 'home' ? 'HOME' : 'AWAY'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/80">
                      Select goalscorer name to broadcast live on TV
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setGoalModal({ isOpen: false, team: 'home' })}
                  className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                
                {/* Minute & Goal Type Bar */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {/* Minute adjuster */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Match Minute
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGoalMinute((m) => Math.max(1, m - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center active:scale-95"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-mono font-black text-base text-amber-400 bg-slate-900 py-1 rounded-lg">
                        {goalMinute}'
                      </span>
                      <button
                        type="button"
                        onClick={() => setGoalMinute((m) => m + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Goal Type */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Goal Type
                    </label>
                    <select
                      value={goalType}
                      onChange={(e) => setGoalType(e.target.value as any)}
                      className="w-full h-8 bg-slate-900 border border-slate-800 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="REGULAR">⚽ Normal Goal</option>
                      <option value="PENALTY">🎯 Penalty (PEN)</option>
                      <option value="FREE_KICK">⚡ Free Kick</option>
                      <option value="OWN_GOAL">💥 Own Goal (OG)</option>
                    </select>
                  </div>
                </div>

                {/* SQUAD PLAYERS SELECTION */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      Select Scorer (Squad: {squad.length} Players)
                    </label>
                    <span className="text-[10px] text-slate-400">Tap player to select</span>
                  </div>

                  {squad.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                      {squad.map((player) => {
                        const isSelected = scorerSelectedPlayer === player.name && !scorerCustomName;
                        return (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => {
                              triggerHaptic(30);
                              setScorerSelectedPlayer(player.name);
                              setScorerPlayerNumber(player.number);
                              setScorerPlayerPhoto(player.photoUrl);
                              setScorerCustomName('');
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg text-left transition active:scale-95 border ${
                              isSelected
                                ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                                isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {player.number}
                            </span>
                            <div className="truncate flex-1">
                              <div className="font-bold text-xs truncate leading-tight">
                                {player.name}
                              </div>
                              <span className="text-[10px] text-slate-500 uppercase">
                                {player.position}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-center text-xs text-slate-400">
                      No lineup squad saved for {targetTeam.name}. You can type the player name below!
                    </div>
                  )}
                </div>

                {/* OR CUSTOM NAME & NUMBER INPUT */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                    Or Enter Player Name & Jersey #
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="e.g. Tajodin Mulla"
                        value={scorerCustomName}
                        onChange={(e) => {
                          setScorerCustomName(e.target.value);
                          if (e.target.value) {
                            setScorerSelectedPlayer('');
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="No. (10)"
                        value={scorerCustomNumber}
                        onChange={(e) => setScorerCustomNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* ASSIST PROVIDER SELECTOR */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Assist By (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vincent Kompany (Assist)"
                    value={assistName}
                    onChange={(e) => setAssistName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

              </div>

              {/* Bottom Sticky Action Buttons */}
              <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleConfirmGoal(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-98 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    Confirm Goal · {scorerCustomName.trim() || scorerSelectedPlayer || targetTeam.name} (+1)
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleConfirmGoal(true)}
                    className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold active:scale-95 transition"
                  >
                    ⚡ Quick +1 (No Name)
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoalModal({ isOpen: false, team: 'home' })}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold active:scale-95 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 9. SAFE RESET MATCH CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base font-['Outfit']">Reset Match?</h4>
                <p className="text-xs text-slate-400">Score to 0-0 · Timer to 00:00</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Kya aap match score aur timer ko 0-0 reset karna chahte hain? Current match events aur cards reset ho jayenge.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetMatch) {
                    onResetMatch();
                  } else {
                    onUpdateTimer('reset');
                    onUpdateScore('home', -match.homeScore);
                    onUpdateScore('away', -match.awayScore);
                  }
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
