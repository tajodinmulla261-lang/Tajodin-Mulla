import React from 'react';
import { MatchState, ScoreboardLayoutType, OverlayConfig } from '../../types/match';
import { ScoreboardRenderer } from '../scoreboard/ScoreboardRenderer';
import { Check, Sliders, Layout } from 'lucide-react';

interface LayoutsGalleryTabProps {
  match: MatchState;
  onUpdateLayout: (layout: ScoreboardLayoutType) => void;
  onUpdateOverlayConfig: (config: Partial<OverlayConfig>) => void;
}

interface LayoutItem {
  id: ScoreboardLayoutType;
  title: string;
  category: string;
  description: string;
  bestFor: string;
}

const LAYOUTS_LIST: LayoutItem[] = [
  {
    id: 'premier',
    title: 'Premier Broadcast',
    category: 'Modern TV Sports Graphic',
    description: 'Clean horizontal banner with team kit accent tabs, high contrast tabular score, and stoppage time pill.',
    bestFor: 'Premier League, domestic leagues, professional club matches',
  },
  {
    id: 'champions',
    title: 'Champions Elite',
    category: 'Luxury Glassmorphism',
    description: 'Deep royal navy background with glowing cyan and gold border accents, circular crest medallions, and starball theme.',
    bestFor: 'UEFA Champions League, finals, cup matches, premium tournaments',
  },
  {
    id: 'international',
    title: 'International Cup',
    category: 'World Cup & Tournaments',
    description: 'Dual-color nation blocks with FIFA country codes, central match period pill, and live penalty shootout dots.',
    bestFor: 'FIFA World Cup, Euro, Copa América, national teams',
  },
  {
    id: 'matrix_led',
    title: 'Stadium LED & Matrix',
    category: 'Arena Jumbotron',
    description: 'Authentic 7-segment and dot-matrix amber/yellow LED digits inside an industrial arena casing with period lights.',
    bestFor: 'Stadium arena feed, retro broadcasts, jumbotron displays',
  },
  {
    id: 'tactical_lower',
    title: 'Tactical Lower-Third',
    category: 'Broadcast Lower-Third',
    description: 'Wide lower-third TV graphic featuring score, live possession bar, shots on target, corners, and recent goalscorers ticker.',
    bestFor: 'Tactical analysis, half-time summaries, full-screen television',
  },
  {
    id: 'minimal_bug',
    title: 'Streamer Minimal Bug',
    category: 'Esports & Livestream HUD',
    description: 'Ultra-compact floating pill designed to sit in the corner of OBS or YouTube streams without covering pitch action.',
    bestFor: 'Twitch streamers, YouTube Gaming, grassroots commentary',
  },
];

export const LayoutsGalleryTab: React.FC<LayoutsGalleryTabProps> = ({
  match,
  onUpdateLayout,
  onUpdateOverlayConfig,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-xl font-['Outfit'] text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-400" /> 6 Broadcast Scoreboard Layouts
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Choose from 6 professionally crafted, broadcast-ready layouts. All layouts update in real-time on your OBS and vMix overlays.
          </p>
        </div>

        {/* Global Positioning & Scaling Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Position:</span>
            <select
              value={match.overlayConfig.position}
              onChange={(e) => onUpdateOverlayConfig({ position: e.target.value as any })}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Scale:</span>
            <select
              value={match.overlayConfig.scale}
              onChange={(e) => onUpdateOverlayConfig({ scale: parseFloat(e.target.value) })}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
            >
              <option value="0.8">80%</option>
              <option value="0.9">90%</option>
              <option value="1">100%</option>
              <option value="1.1">110%</option>
              <option value="1.2">120%</option>
              <option value="1.3">130%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of 6 Layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {LAYOUTS_LIST.map((layout) => {
          const isActive = match.layout === layout.id;

          return (
            <div
              key={layout.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.15)] ring-1 ring-amber-400'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      {layout.category}
                    </span>
                    <h4 className="font-extrabold text-lg text-white font-['Outfit']">
                      {layout.title}
                    </h4>
                  </div>

                  {isActive ? (
                    <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                      <Check className="w-3.5 h-3.5" /> Active On Stream
                    </span>
                  ) : (
                    <button
                      onClick={() => onUpdateLayout(layout.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                    >
                      Use Layout
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4">{layout.description}</p>

                {/* Live Preview Container (Simulating broadcast background) */}
                <div className="bg-[#0b101b] rounded-xl p-4 border border-white/5 relative overflow-hidden min-h-[110px] flex items-center justify-center shadow-inner">
                  {/* Subtle pitch turf watermark for preview context */}
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0, #10b981 40px, #059669 40px, #059669 80px)',
                    }}
                  />

                  <div className="relative z-10 w-full flex justify-center">
                    <ScoreboardRenderer match={match} layoutOverride={layout.id} scale={0.92} />
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Best for: <strong className="text-slate-300 font-semibold">{layout.bestFor}</strong>
                </span>
                <button
                  onClick={() => onUpdateLayout(layout.id)}
                  className="text-amber-400 hover:text-amber-300 font-bold ml-2 shrink-0"
                >
                  {isActive ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
