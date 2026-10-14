import React, { useState } from 'react';
import { MatchState, MatchPeriod, Team } from '../../types/match';
import { formatMatchTime } from '../../utils/formatters';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Award,
  AlertTriangle,
  ArrowLeftRight,
  ShieldAlert,
  Flag,
  Crosshair,
  Trophy,
  PlusCircle,
  Users,
  Repeat,
  CheckCircle2,
  Calendar,
  Smartphone,
} from 'lucide-react';
import { GoalEventModal } from '../modals/GoalEventModal';
import { SubstitutionModal } from '../modals/SubstitutionModal';
import { CardEventModal } from '../modals/CardEventModal';
import { VarCheckModal } from '../modals/VarCheckModal';
import { CreateMatchModal } from '../modals/CreateMatchModal';
import { CreateTeamModal } from '../modals/CreateTeamModal';

interface MatchControllerTabProps {
  match: MatchState;
  teamsLibrary?: Record<string, Team>;
  onCreateMatch?: (matchData: any) => void;
  onResetMatch?: () => void;
  onSetMatchTeam?: (slot: 'home' | 'away', teamId?: string, team?: Team) => void;
  onSaveTeam?: (team: Team) => void;
  onNavigateToTeams?: () => void;
  onUpdateScore: (
    team: 'home' | 'away',
    delta: number,
    player?: { name: string; number?: number; photoUrl?: string },
    assist?: string
  ) => void;
  onUpdateTimer: (
    action: 'start' | 'pause' | 'reset' | 'set_seconds' | 'set_stoppage' | 'set_period',
    params?: { seconds?: number; stoppageTime?: number; period?: MatchPeriod }
  ) => void;
  onAddEvent: (eventData: any) => void;
  onTriggerGraphic: (graphic: any) => void;
}

export const MatchControllerTab: React.FC<MatchControllerTabProps> = ({
  match,
  teamsLibrary = {},
  onCreateMatch,
  onResetMatch,
  onSetMatchTeam,
  onSaveTeam,
  onNavigateToTeams,
  onUpdateScore,
  onUpdateTimer,
  onAddEvent,
  onTriggerGraphic,
}) => {
  const { homeTeam, awayTeam, homeScore, awayScore, timer } = match;
  const timeInfo = formatMatchTime(timer.seconds, timer.stoppageTime);

  // Modals state
  const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [showMatchCreatedAlert, setShowMatchCreatedAlert] = useState(false);

  const [goalModalState, setGoalModalState] = useState<{ isOpen: boolean; team: 'home' | 'away' }>({
    isOpen: false,
    team: 'home',
  });
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);

  // Quick team changer open state
  const [showHomeTeamSelect, setShowHomeTeamSelect] = useState(false);
  const [showAwayTeamSelect, setShowAwayTeamSelect] = useState(false);

  // Current match minute calculated from seconds
  const currentMinute = Math.floor(timer.seconds / 60) + 1;

  const handleGoalSubmit = (payload: {
    team: 'home' | 'away';
    minute: number;
    player: { name: string; number?: number; photoUrl?: string };
    assist?: string;
  }) => {
    onUpdateScore(payload.team, 1, payload.player, payload.assist);
  };

  const handleSubSubmit = (payload: {
    team: 'home' | 'away';
    minute: number;
    playerIn: string;
    playerInNumber: number;
    playerOut: string;
    playerOutNumber: number;
  }) => {
    onAddEvent({
      type: 'SUBSTITUTION',
      team: payload.team,
      minute: payload.minute,
      playerName: `${payload.playerIn} (In)`,
      playerIn: payload.playerIn,
      playerInNumber: payload.playerInNumber,
      playerOut: payload.playerOut,
      playerOutNumber: payload.playerOutNumber,
    });
  };

  const handleCardSubmit = (payload: {
    type: 'YELLOW_CARD' | 'RED_CARD';
    team: 'home' | 'away';
    minute: number;
    playerName: string;
    playerNumber?: number;
    notes?: string;
  }) => {
    onAddEvent(payload);
  };

  const handleVarSubmit = (payload: {
    title: string;
    subtitle: string;
    decision: 'CHECKING' | 'GOAL' | 'NO_GOAL' | 'PENALTY' | 'NO_PENALTY' | 'RED_CARD';
  }) => {
    onTriggerGraphic({
      active: true,
      type: 'VAR_CHECK',
      title: payload.title,
      subtitle: payload.subtitle,
      varDecision: payload.decision,
      durationMs: 8000,
      triggeredAt: Date.now(),
    });
  };

  const handleCreateMatchSubmit = (matchData: any) => {
    if (onCreateMatch) {
      onCreateMatch(matchData);
      setShowMatchCreatedAlert(true);
      setTimeout(() => setShowMatchCreatedAlert(false), 4500);
    }
  };

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSwapSides = () => {
    if (onSetMatchTeam) {
      onSetMatchTeam('home', undefined, awayTeam);
      onSetMatchTeam('away', undefined, homeTeam);
    }
  };

  const handleQuickResetMatch = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmResetMatch = () => {
    if (onResetMatch) {
      onResetMatch();
    } else {
      onUpdateTimer('reset');
      onUpdateScore('home', -homeScore);
      onUpdateScore('away', -awayScore);
    }
    setIsResetConfirmOpen(false);
  };

  const teamsList = Object.values(teamsLibrary);

  return (
    <div className="space-y-6">

      {/* TOP MATCH CONTROLLER ACTION BAR - CREATE MATCH PROMINENT BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                ACTIVE FIXTURE
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-mono text-slate-400">
                {match.competition || 'ITC Sports'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black font-['Outfit'] text-white uppercase tracking-tight flex items-center gap-2">
              <span>{homeTeam.name}</span>
              <span className="text-amber-400 font-mono text-sm px-1.5 py-0.2 bg-slate-950 border border-slate-800 rounded">
                vs
              </span>
              <span>{awayTeam.name}</span>
            </h2>
          </div>
        </div>

        {/* Right Action Buttons including "Create Match" */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* CREATE MATCH BUTTON (KEY USER REQUEST) */}
          <button
            onClick={() => setIsCreateMatchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all active:scale-95 hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]"
            title="Create a new football match with custom teams and reset"
          >
            <Trophy className="w-4 h-4 fill-slate-950" />
            <span>Create Match (میچ بنائیں)</span>
          </button>

          {/* Quick Swap Sides */}
          <button
            onClick={handleSwapSides}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold transition-colors"
            title="Swap Home and Away teams"
          >
            <Repeat className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Swap Sides</span>
          </button>

          {/* Quick Reset Match */}
          <button
            onClick={handleQuickResetMatch}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700/60 rounded-xl text-xs font-bold transition-colors"
            title="Reset match scores and clock to 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Phone Scorer Remote Link (User Request: Scoring on Phone APK) */}
          <a
            href="/?mode=mobile"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 rounded-xl text-xs font-bold transition-colors"
            title="Open Phone Scoring Remote (APK)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Phone Remote (APK)</span>
          </a>

          {/* Manage Teams Link */}
          {onNavigateToTeams && (
            <button
              onClick={onNavigateToTeams}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-colors"
              title="Open Teams and Squads Library"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Teams</span>
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS TOAST / CONFIRMATION BANNER */}
      {showMatchCreatedAlert && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              🎉 New match successfully created: <strong>{homeTeam.name}</strong> vs <strong>{awayTeam.name}</strong>. Live scoreboard overlay updated on OBS and vMix!
            </span>
          </div>
          <button
            onClick={() => setShowMatchCreatedAlert(false)}
            className="text-emerald-400 hover:text-white text-xs px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. PRIMARY LIVE SCORE COCKPIT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
          
          {/* HOME TEAM CONTROLS */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col items-center relative">
            <div className="flex items-center gap-3 mb-2 w-full justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{homeTeam.crest}</span>
                <div className="text-left">
                  <h3 className="font-extrabold text-xl font-['Outfit'] text-white">
                    {homeTeam.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono font-semibold">
                    {homeTeam.shortName} · HOME
                  </span>
                </div>
              </div>

              {/* Quick Change Home Team */}
              {onSetMatchTeam && teamsList.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowHomeTeamSelect(!showHomeTeamSelect)}
                    className="text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1"
                    title="Quick change team"
                  >
                    Change Team
                  </button>

                  {showHomeTeamSelect && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 px-2 block">
                        Select Home Team:
                      </span>
                      {teamsList.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSetMatchTeam('home', t.id, t);
                            setShowHomeTeamSelect(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                            t.id === homeTeam.id
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <span>{t.crest}</span>
                          <span className="truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Big Score Display */}
            <div className="font-mono font-black text-6xl tabular-nums text-white my-3">
              {homeScore}
            </div>

            {/* Score Buttons */}
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setGoalModalState({ isOpen: true, team: 'home' })}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 px-3 rounded-lg text-sm flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 uppercase tracking-wide"
              >
                <Award className="w-4 h-4" /> Goal +1
              </button>
              <button
                onClick={() => onUpdateScore('home', -1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 px-3 rounded-lg text-sm transition-colors"
                title="Subtract 1 goal"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CENTER CLOCK & PERIOD */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center px-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              MATCH TIME
            </span>

            {/* Big Clock */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-inner mb-3">
              <span className="font-mono font-black text-4xl text-emerald-400 tabular-nums">
                {timeInfo.display}
              </span>
              {timeInfo.stoppageDisplay && (
                <span className="bg-amber-500/20 text-amber-400 font-mono font-bold text-sm px-2 py-0.5 rounded border border-amber-500/30">
                  {timeInfo.stoppageDisplay}
                </span>
              )}
            </div>

            {/* Clock Start/Pause & Step Buttons */}
            <div className="flex items-center gap-2 mb-3">
              {timer.isRunning ? (
                <button
                  onClick={() => onUpdateTimer('pause')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
              ) : (
                <button
                  onClick={() => onUpdateTimer('start')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Start
                </button>
              )}

              <button
                onClick={() => onUpdateTimer('set_seconds', { seconds: timer.seconds + 60 })}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors"
                title="Add 1 minute"
              >
                +1m
              </button>

              <button
                onClick={() => onUpdateTimer('set_seconds', { seconds: Math.max(0, timer.seconds - 60) })}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors"
                title="Subtract 1 minute"
              >
                -1m
              </button>

              <button
                onClick={() => onUpdateTimer('reset')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 px-2.5 py-2 rounded-lg text-xs transition-colors"
                title="Reset timer to 00:00"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Stoppage Time Stepper */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-[11px] uppercase">Extra Time:</span>
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => onUpdateTimer('set_stoppage', { stoppageTime: num })}
                  className={`w-6 h-6 rounded text-xs font-mono font-bold transition-colors ${
                    timer.stoppageTime === num
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num === 0 ? '0' : `+${num}`}
                </button>
              ))}
            </div>
          </div>

          {/* AWAY TEAM CONTROLS */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col items-center relative">
            <div className="flex items-center gap-3 mb-2 w-full justify-between">
              {/* Quick Change Away Team */}
              {onSetMatchTeam && teamsList.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowAwayTeamSelect(!showAwayTeamSelect)}
                    className="text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1"
                    title="Quick change team"
                  >
                    Change Team
                  </button>

                  {showAwayTeamSelect && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 px-2 block">
                        Select Away Team:
                      </span>
                      {teamsList.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSetMatchTeam('away', t.id, t);
                            setShowAwayTeamSelect(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                            t.id === awayTeam.id
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <span>{t.crest}</span>
                          <span className="truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <div className="text-right">
                  <h3 className="font-extrabold text-xl font-['Outfit'] text-white">
                    {awayTeam.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono font-semibold">
                    {awayTeam.shortName} · AWAY
                  </span>
                </div>
                <span className="text-3xl">{awayTeam.crest}</span>
              </div>
            </div>

            {/* Big Score Display */}
            <div className="font-mono font-black text-6xl tabular-nums text-white my-3">
              {awayScore}
            </div>

            {/* Score Buttons */}
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => onUpdateScore('away', -1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 px-3 rounded-lg text-sm transition-colors"
                title="Subtract 1 goal"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGoalModalState({ isOpen: true, team: 'away' })}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 px-3 rounded-lg text-sm flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 uppercase tracking-wide"
              >
                <Award className="w-4 h-4" /> Goal +1
              </button>
            </div>
          </div>

        </div>

        {/* PERIOD SWITCHER ROW */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Match Period:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: '1H', label: '1st Half (00:00)' },
                { id: 'HT', label: 'Half Time (45:00)' },
                { id: '2H', label: '2nd Half (45:00)' },
                { id: 'FT', label: 'Full Time (90:00)' },
                { id: 'ET1', label: 'Extra Time 1H (90:00)' },
                { id: 'ET2', label: 'Extra Time 2H (105:00)' },
                { id: 'PEN', label: 'Penalties' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => onUpdateTimer('set_period', { period: item.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  timer.period === item.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. BROADCAST ACTION BUTTONS DECK */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Flag className="w-4 h-4 text-amber-400" /> Quick Match Events & Broadcast Triggers
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* Yellow Card */}
          <button
            onClick={() => setIsCardModalOpen(true)}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 rounded-xl flex flex-col items-center gap-2 text-slate-200 transition-all text-center"
          >
            <span className="w-5 h-7 bg-amber-400 rounded-[2px] shadow-sm" />
            <span className="text-xs font-bold">Issue Card</span>
          </button>

          {/* Substitution */}
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-400/50 rounded-xl flex flex-col items-center gap-2 text-slate-200 transition-all text-center"
          >
            <ArrowLeftRight className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-bold">Substitution</span>
          </button>

          {/* VAR Review */}
          <button
            onClick={() => setIsVarModalOpen(true)}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400/50 rounded-xl flex flex-col items-center gap-2 text-slate-200 transition-all text-center"
          >
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-bold">VAR Review</span>
          </button>

          {/* Corner Kick */}
          <button
            onClick={() => {
              onAddEvent({
                type: 'CORNER',
                team: 'home',
                minute: currentMinute,
                playerName: 'Corner Kick',
              });
            }}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 text-slate-200 transition-all text-center"
          >
            <Flag className="w-6 h-6 text-purple-400" />
            <span className="text-xs font-bold">+1 Corner</span>
          </button>

          {/* Shot on Target */}
          <button
            onClick={() => {
              onAddEvent({
                type: 'SHOT_ON_TARGET',
                team: 'home',
                minute: currentMinute,
                playerName: 'Shot On Target',
              });
            }}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 text-slate-200 transition-all text-center"
          >
            <Crosshair className="w-6 h-6 text-blue-400" />
            <span className="text-xs font-bold">+1 Shot (SOT)</span>
          </button>

          {/* Foul */}
          <button
            onClick={() => {
              onAddEvent({
                type: 'FOUL',
                team: 'home',
                minute: currentMinute,
                playerName: 'Foul Committed',
              });
            }}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 text-slate-200 transition-all text-center"
          >
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span className="text-xs font-bold">+1 Foul</span>
          </button>
        </div>
      </div>

      {/* MODALS */}
      <GoalEventModal
        isOpen={goalModalState.isOpen}
        onClose={() => setGoalModalState({ isOpen: false, team: 'home' })}
        team={goalModalState.team}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        currentMinute={currentMinute}
        onSave={handleGoalSubmit}
      />

      <SubstitutionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        currentMinute={currentMinute}
        onSave={handleSubSubmit}
      />

      <CardEventModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        currentMinute={currentMinute}
        onSave={handleCardSubmit}
      />

      <VarCheckModal
        isOpen={isVarModalOpen}
        onClose={() => setIsVarModalOpen(false)}
        onTrigger={handleVarSubmit}
      />

      {/* CREATE NEW MATCH MODAL (USER REQUEST) */}
      <CreateMatchModal
        isOpen={isCreateMatchModalOpen}
        onClose={() => setIsCreateMatchModalOpen(false)}
        teamsLibrary={teamsLibrary}
        currentCompetition={match.competition}
        currentVenue={match.venue}
        currentReferee={match.referee}
        onSubmitMatch={handleCreateMatchSubmit}
        onOpenCreateTeamModal={() => {
          setIsCreateMatchModalOpen(false);
          setIsCreateTeamModalOpen(true);
        }}
      />

      {/* CREATE NEW TEAM MODAL (FOR SQUADS & TEAMS) */}
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onSaveTeam={(newTeam) => {
          if (onSaveTeam) {
            onSaveTeam(newTeam);
          }
          setIsCreateTeamModalOpen(false);
          setIsCreateMatchModalOpen(true);
        }}
      />

      {/* Reset Match Confirmation Modal (Safe, No window.confirm) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base font-['Outfit']">Reset Match?</h4>
                <p className="text-xs text-slate-400">Score to 0-0 · Clock to 00:00</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to reset current match score to <strong>0-0</strong> and clock to <strong>00:00</strong>?
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetMatch}
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
