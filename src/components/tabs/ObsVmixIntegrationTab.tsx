import React, { useState, useMemo } from 'react';
import { MatchState, OverlayConfig, ScoreboardLayoutType } from '../../types/match';
import { Copy, Check, ExternalLink, Monitor, Video, ShieldCheck, Sparkles, Sliders } from 'lucide-react';

interface ObsVmixIntegrationTabProps {
  match: MatchState;
  onUpdateOverlayConfig: (config: Partial<OverlayConfig>) => void;
  onUpdateLayout: (layout: ScoreboardLayoutType) => void;
  onTriggerGraphic: (graphic: any) => void;
}

export const ObsVmixIntegrationTab: React.FC<ObsVmixIntegrationTabProps> = ({
  match,
  onUpdateOverlayConfig,
  onUpdateLayout,
  onTriggerGraphic,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  // Chroma selection
  const [chroma, setChroma] = useState<'transparent' | 'green' | 'magenta' | 'black'>(
    match.overlayConfig.chromaColor || 'transparent'
  );
  const [selectedLayout, setSelectedLayout] = useState<ScoreboardLayoutType>(match.layout);
  const [selectedPos, setSelectedPos] = useState<string>(match.overlayConfig.position || 'top-left');
  const [selectedScale, setSelectedScale] = useState<number>(match.overlayConfig.scale || 1);

  // Generate full overlay URL
  const overlayUrl = useMemo(() => {
    const origin = window.location.origin;
    const params = new URLSearchParams();
    params.set('overlay', 'true');
    if (chroma !== 'transparent') params.set('chroma', chroma);
    if (selectedLayout !== match.layout) params.set('layout', selectedLayout);
    if (selectedPos !== 'top-left') params.set('pos', selectedPos);
    if (selectedScale !== 1) params.set('scale', selectedScale.toString());

    return `${origin}/?${params.toString()}`;
  }, [chroma, selectedLayout, selectedPos, selectedScale, match.layout]);

  const customCss = `body {
  background-color: rgba(0, 0, 0, 0);
  margin: 0px auto;
  overflow: hidden;
}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(customCss);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. OVERLAY URL BUILDER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              BROADCAST STREAM LINK
            </span>
            <h3 className="font-extrabold text-xl font-['Outfit'] text-white mt-0.5">
              OBS Studio & vMix Browser Overlay URL
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add this URL as a Browser Source in OBS or Web Browser Input in vMix. Live changes update in real time with sub-second latency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg uppercase tracking-wider ${
                copiedUrl
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedUrl ? 'Copied to Clipboard!' : 'Copy Overlay URL'}
            </button>

            <a
              href={overlayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
            >
              <ExternalLink className="w-4 h-4" /> Open Overlay
            </a>
          </div>
        </div>

        {/* URL Box */}
        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 break-all select-all flex items-center justify-between gap-2">
          <span className="truncate">{overlayUrl}</span>
          <button
            onClick={handleCopyUrl}
            className="text-slate-400 hover:text-white shrink-0 p-1"
            title="Copy URL"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-800/80">
          {/* Chroma Background */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Background Chroma Mode
            </label>
            <select
              value={chroma}
              onChange={(e) => {
                const val = e.target.value as any;
                setChroma(val);
                onUpdateOverlayConfig({ chromaColor: val });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="transparent">Alpha Transparent (OBS Default)</option>
              <option value="green">Green Screen (#00FF00 Chroma)</option>
              <option value="magenta">Magenta (#FF00FF Chroma)</option>
              <option value="black">Black Background (#000000)</option>
            </select>
          </div>

          {/* Layout Override */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Scoreboard Layout
            </label>
            <select
              value={selectedLayout}
              onChange={(e) => {
                const val = e.target.value as ScoreboardLayoutType;
                setSelectedLayout(val);
                onUpdateLayout(val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="premier">Premier Broadcast</option>
              <option value="champions">Champions Elite</option>
              <option value="international">International Cup</option>
              <option value="matrix_led">Stadium LED & Matrix</option>
              <option value="tactical_lower">Tactical Lower-Third</option>
              <option value="minimal_bug">Streamer Minimal Bug</option>
            </select>
          </div>

          {/* Screen Position */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Screen Position
            </label>
            <select
              value={selectedPos}
              onChange={(e) => {
                setSelectedPos(e.target.value);
                onUpdateOverlayConfig({ position: e.target.value as any });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="top-left">Top Left (Standard)</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          {/* Scale */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Scale Multiplier
            </label>
            <select
              value={selectedScale}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSelectedScale(val);
                onUpdateOverlayConfig({ scale: val });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
            >
              <option value="0.8">80% (Compact)</option>
              <option value="1">100% (1080p Standard)</option>
              <option value="1.15">115%</option>
              <option value="1.3">130% (High DPI / 4K)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. STEP-BY-STEP INTEGRATION GUIDES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OBS STUDIO GUIDE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 text-blue-400">
            <Monitor className="w-6 h-6" />
            <h4 className="font-extrabold text-lg text-white font-['Outfit']">
              OBS Studio Setup Guide
            </h4>
          </div>

          <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside">
            <li className="leading-relaxed">
              Open <strong>OBS Studio</strong> and navigate to your active <strong>Scene</strong>.
            </li>
            <li className="leading-relaxed">
              In the <strong>Sources</strong> dock at the bottom, click the <strong>+</strong> button and select <strong>Browser</strong>.
            </li>
            <li className="leading-relaxed">
              Name it <code className="text-amber-300 font-mono">Football Scoreboard</code> and click <strong>OK</strong>.
            </li>
            <li className="leading-relaxed">
              In the Properties window:
              <ul className="list-disc list-inside mt-1.5 ml-4 space-y-1 text-slate-400">
                <li>Paste the copied URL into <strong>URL</strong> field.</li>
                <li>Set <strong>Width</strong> to <code className="text-white font-mono">1920</code>.</li>
                <li>Set <strong>Height</strong> to <code className="text-white font-mono">1080</code>.</li>
                <li>Set <strong>FPS</strong> to <code className="text-white font-mono">60</code>.</li>
              </ul>
            </li>
            <li className="leading-relaxed">
              Check the boxes: <strong>"Shutdown source when not visible"</strong> and <strong>"Refresh browser when scene becomes active"</strong>. Click <strong>OK</strong>!
            </li>
          </ol>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase text-[10px]">Recommended Custom CSS:</span>
              <button
                onClick={handleCopyCss}
                className="text-amber-400 hover:text-amber-300 font-bold text-[11px]"
              >
                {copiedCss ? 'Copied!' : 'Copy CSS'}
              </button>
            </div>
            <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {customCss}
            </pre>
          </div>
        </div>

        {/* VMIX GUIDE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Video className="w-6 h-6" />
            <h4 className="font-extrabold text-lg text-white font-['Outfit']">
              vMix Live Production Setup Guide
            </h4>
          </div>

          <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside">
            <li className="leading-relaxed">
              In <strong>vMix</strong>, click <strong>Add Input</strong> in the bottom-left corner of the interface.
            </li>
            <li className="leading-relaxed">
              In the Input Select window, click on <strong>Web Browser</strong> from the left sidebar.
            </li>
            <li className="leading-relaxed">
              Paste your Scoreboard Overlay URL into the <strong>URL</strong> field.
            </li>
            <li className="leading-relaxed">
              Set <strong>Width</strong> to <code className="text-white font-mono">1920</code> and <strong>Height</strong> to <code className="text-white font-mono">1080</code>. Click <strong>OK</strong>.
            </li>
            <li className="leading-relaxed">
              The scoreboard will now appear as an Input with complete <strong>Alpha Channel (Transparency)</strong> support.
            </li>
            <li className="leading-relaxed">
              Assign this input to <strong>Overlay 1, 2, 3, or 4</strong> to seamlessly key it over your live football video camera feed!
            </li>
          </ol>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 mt-4">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Zero-Lag Local Engine
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Because this applet uses Server-Sent Events (SSE) with persistent HTTP keep-alive, whenever you click a goal or pause the clock in this panel, vMix updates in less than 20 milliseconds!
            </p>
          </div>
        </div>
      </div>

      {/* 3. TEST TRIGGER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Test Overlay Feed Before Going Live
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          Click any test button below to ensure your OBS or vMix source displays graphics without clipping or alignment issues:
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              onTriggerGraphic({
                active: true,
                type: 'GOAL_BANNER',
                title: 'GOAL!',
                subtitle: match.homeTeam.name,
                team: 'home',
                playerName: 'Test Player',
                playerNumber: 10,
                assistPlayerName: 'Test Assist',
                durationMs: 5000,
                triggeredAt: Date.now(),
              });
            }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider"
          >
            Test Goal Graphic
          </button>

          <button
            onClick={() => {
              onTriggerGraphic({
                active: true,
                type: 'VAR_CHECK',
                title: 'VAR CHECK: PENALTY',
                subtitle: 'Testing OBS Browser alignment',
                varDecision: 'CHECKING',
                durationMs: 6000,
                triggeredAt: Date.now(),
              });
            }}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider"
          >
            Test VAR Graphic
          </button>

          <button
            onClick={() => {
              onTriggerGraphic({
                active: true,
                type: 'SUBSTITUTION_BOARD',
                title: 'SUBSTITUTION',
                subtitle: match.homeTeam.name,
                team: 'home',
                playerIn: 'Test Sub In',
                playerInNumber: 14,
                playerOut: 'Test Sub Out',
                playerOutNumber: 9,
                durationMs: 6000,
                triggeredAt: Date.now(),
              });
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider"
          >
            Test Sub Board
          </button>

          <button
            onClick={() => {
              onTriggerGraphic({
                active: true,
                type: 'STATS_LOWER_THIRD',
                title: 'MATCH STATISTICS',
                durationMs: 7000,
                triggeredAt: Date.now(),
              });
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider"
          >
            Test Stats Lower-Third
          </button>
        </div>
      </div>
    </div>
  );
};
