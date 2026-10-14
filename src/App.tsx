import React, { useState, useEffect } from 'react';
import { useMatchSync } from './hooks/useMatchSync';
import { OverlayView } from './components/overlay/OverlayView';
import { MatchControllerTab } from './components/tabs/MatchControllerTab';
import { LayoutsGalleryTab } from './components/tabs/LayoutsGalleryTab';
import { MatchStatsTab } from './components/tabs/MatchStatsTab';
import { BroadcastGraphicsTab } from './components/tabs/BroadcastGraphicsTab';
import { ObsVmixIntegrationTab } from './components/tabs/ObsVmixIntegrationTab';
import { TeamsEditorTab } from './components/tabs/TeamsEditorTab';
import { MatchTimelineTab } from './components/tabs/MatchTimelineTab';
import { formatMatchTime, getPeriodLabel } from './utils/formatters';
import {
  Trophy,
  Sliders,
  Layout,
  BarChart2,
  Tv,
  Monitor,
  Users,
  History,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  WifiOff,
  Radio,
  Smartphone,
} from 'lucide-react';
import { MobileScorerView } from './components/mobile/MobileScorerView';
import { PhoneAppApkTab } from './components/tabs/PhoneAppApkTab';
import { PWAInstallButton } from './components/pwa/PWAInstallButton';

export default function App() {
  const isOverlayMode = typeof window !== 'undefined' && (
    window.location.search.includes('overlay=true') ||
    window.location.pathname.startsWith('/overlay')
  );

  // If in pure overlay mode for OBS / vMix, render only the transparent overlay canvas
  if (isOverlayMode) {
    return <OverlayView />;
  }

  return <ControlRoomApp />;
}

function ControlRoomApp() {
  const {
    match,
    isConnected,
    teamsLibrary,
    saveTeam,
    deleteTeam,
    setMatchTeam,
    createMatch,
    updateScore,
    updateTimer,
    addEvent,
    deleteEvent,
    updateStats,
    triggerGraphic,
    updateMatchDetails,
    recordPenaltyKick,
    resetMatch,
  } = useMatchSync();

  const [viewMode, setViewMode] = useState<'studio' | 'mobile'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('mode=mobile') || window.location.search.includes('remote=true')) {
        return 'mobile';
      }
    }
    return 'studio';
  });

  const [activeTab, setActiveTab] = useState<
    'controller' | 'mobile' | 'layouts' | 'stats' | 'graphics' | 'integration' | 'teams' | 'timeline'
  >('controller');

  const [copiedUrl, setCopiedUrl] = useState(false);

  const timeInfo = formatMatchTime(match.timer.seconds, match.timer.stoppageTime);

  const handleCopyOverlayUrl = () => {
    const origin = window.location.origin;
    const url = `${origin}/?overlay=true&chroma=transparent`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // If in dedicated mobile phone scoring remote view
  if (viewMode === 'mobile') {
    return (
      <MobileScorerView
        match={match}
        teamsLibrary={teamsLibrary}
        isConnected={isConnected}
        onUpdateScore={updateScore}
        onUpdateTimer={updateTimer}
        onAddEvent={addEvent}
        onDeleteEvent={deleteEvent}
        onTriggerGraphic={triggerGraphic}
        onCreateMatch={createMatch}
        onResetMatch={resetMatch}
        onSaveTeam={saveTeam}
        onSetMatchTeam={setMatchTeam}
        onSwitchToStudio={() => setViewMode('studio')}
      />
    );
  }

  const tabs = [
    { id: 'controller', label: 'Match Controller', icon: Sliders },
    { id: 'mobile', label: '📱 Phone App / APK', icon: Smartphone },
    { id: 'layouts', label: '6 Scoreboard Layouts', icon: Layout },
    { id: 'stats', label: 'Match Statistics', icon: BarChart2 },
    { id: 'graphics', label: 'TV Graphics Triggers', icon: Tv },
    { id: 'integration', label: 'OBS & vMix Setup', icon: Monitor },
    { id: 'teams', label: 'Teams & Squads', icon: Users },
    { id: 'timeline', label: 'Match Timeline', icon: History },
  ] as const;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* 1. TOP HEADER (3-Zone Contract) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-[0_0_15px_rgba(251,191,36,0.4)]">
            ⚽
          </div>
          <a href="/" className="text-lg font-black tracking-tight text-white whitespace-nowrap font-['Outfit'] uppercase flex items-center gap-2">
            ITC Sports
          </a>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 border border-slate-800 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-red-500'}`} />
            {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <span className="truncate max-w-[280px] text-slate-300">
            {match.competition}
          </span>
          <span aria-hidden="true">·</span>
          <span>{match.venue}</span>
        </nav>

        {/* Zone 3: Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <PWAInstallButton />

          <button
            onClick={() => setViewMode('mobile')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-lg text-xs font-bold transition shadow-sm active:scale-95"
            title="Open Phone Scoring Remote"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Phone Remote</span>
          </button>

          <button
            onClick={handleCopyOverlayUrl}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm uppercase tracking-wider ${
              copiedUrl
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            }`}
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUrl ? 'Copied Link!' : 'Copy OBS Overlay URL'}
          </button>

          <a
            href="/?overlay=true&chroma=transparent"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Overlay
          </a>
        </div>
      </header>

      {/* 2. MATCH STATUS STRIP */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <span>{match.homeTeam.crest}</span>
            <span className="font-['Barlow_Condensed'] uppercase tracking-wide text-base">{match.homeTeam.shortName}</span>
            <span className="bg-slate-950 px-2 py-0.5 rounded text-amber-400 font-mono text-base border border-slate-800">
              {match.homeScore} - {match.awayScore}
            </span>
            <span className="font-['Barlow_Condensed'] uppercase tracking-wide text-base">{match.awayTeam.shortName}</span>
            <span>{match.awayTeam.crest}</span>
          </div>

          <span className="text-slate-500">|</span>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase font-sans text-[11px] font-bold">
              {getPeriodLabel(match.timer.period)}:
            </span>
            <span className="font-bold text-emerald-400 text-sm">
              {timeInfo.display}
            </span>
            {timeInfo.stoppageDisplay && (
              <span className="text-amber-400 font-bold bg-amber-400/10 px-1 rounded">
                {timeInfo.stoppageDisplay}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 uppercase font-sans text-[11px]">Active Layout:</span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold capitalize font-sans">
            {match.layout.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Tab Navigation Segmented Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 uppercase tracking-wider ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'controller' && (
          <MatchControllerTab
            match={match}
            teamsLibrary={teamsLibrary}
            onCreateMatch={createMatch}
            onResetMatch={resetMatch}
            onSetMatchTeam={setMatchTeam}
            onSaveTeam={saveTeam}
            onNavigateToTeams={() => setActiveTab('teams')}
            onUpdateScore={updateScore}
            onUpdateTimer={updateTimer}
            onAddEvent={addEvent}
            onTriggerGraphic={triggerGraphic}
          />
        )}

        {activeTab === 'mobile' && (
          <PhoneAppApkTab onLaunchMobileMode={() => setViewMode('mobile')} />
        )}

        {activeTab === 'layouts' && (
          <LayoutsGalleryTab
            match={match}
            onUpdateLayout={(layout) => updateMatchDetails({ layout })}
            onUpdateOverlayConfig={(config) => updateMatchDetails({ overlayConfig: config })}
          />
        )}

        {activeTab === 'stats' && (
          <MatchStatsTab match={match} onUpdateStats={updateStats} />
        )}

        {activeTab === 'graphics' && (
          <BroadcastGraphicsTab match={match} onTriggerGraphic={triggerGraphic} />
        )}

        {activeTab === 'integration' && (
          <ObsVmixIntegrationTab
            match={match}
            onUpdateOverlayConfig={(config) => updateMatchDetails({ overlayConfig: config })}
            onUpdateLayout={(layout) => updateMatchDetails({ layout })}
            onTriggerGraphic={triggerGraphic}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsEditorTab
            match={match}
            teamsLibrary={teamsLibrary}
            onSaveTeam={saveTeam}
            onDeleteTeam={deleteTeam}
            onSetMatchTeam={setMatchTeam}
            onUpdateMatchDetails={updateMatchDetails}
            onTriggerGraphic={triggerGraphic}
          />
        )}

        {activeTab === 'timeline' && (
          <MatchTimelineTab
            match={match}
            onDeleteEvent={deleteEvent}
            onRecordPenaltyKick={recordPenaltyKick}
          />
        )}

      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        <p>
          ITC Sports · Football Broadcast Scoreboard Engine · Real-Time SSE Stream · Seamless OBS & vMix Browser Input
        </p>
      </footer>
    </div>
  );
}
