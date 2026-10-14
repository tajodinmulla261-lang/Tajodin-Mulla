import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

interface VarCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrigger: (payload: {
    title: string;
    subtitle: string;
    decision: 'CHECKING' | 'GOAL' | 'NO_GOAL' | 'PENALTY' | 'NO_PENALTY' | 'RED_CARD';
  }) => void;
}

export const VarCheckModal: React.FC<VarCheckModalProps> = ({ isOpen, onClose, onTrigger }) => {
  const [reviewType, setReviewType] = useState<string>('POSSIBLE GOAL REVIEW');
  const [decision, setDecision] = useState<'CHECKING' | 'GOAL' | 'NO_GOAL' | 'PENALTY' | 'NO_PENALTY' | 'RED_CARD'>('CHECKING');
  const [subtitle, setSubtitle] = useState<string>('Offside in attacking buildup');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTrigger({
      title: reviewType,
      subtitle: subtitle.trim(),
      decision,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.2)] max-w-md w-full overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-950 to-slate-950">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-extrabold text-base tracking-wide font-['Outfit'] uppercase">
              VAR On-Screen Review Graphic
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Review Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Review Type
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'POSSIBLE GOAL REVIEW',
                'PENALTY CHECK',
                'POSSIBLE RED CARD',
                'OFFSIDE INCIDENT',
              ].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setReviewType(item)}
                  className={`py-2 px-2.5 rounded-lg border text-left font-medium transition-colors ${
                    reviewType === item
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Decision Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              VAR Decision / Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('CHECKING')}
                className={`py-2 px-2 rounded-lg text-xs font-bold border ${
                  decision === 'CHECKING'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                CHECKING
              </button>
              <button
                type="button"
                onClick={() => setDecision('GOAL')}
                className={`py-2 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 ${
                  decision === 'GOAL'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> GOAL
              </button>
              <button
                type="button"
                onClick={() => setDecision('NO_GOAL')}
                className={`py-2 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 ${
                  decision === 'NO_GOAL'
                    ? 'bg-red-500 text-slate-950 border-red-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> NO GOAL
              </button>
            </div>
          </div>

          {/* Subtitle / Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Reason / Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="e.g. Handball in penalty area"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg uppercase tracking-wider"
            >
              Show VAR Graphic on Stream
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
