import React, { useState } from 'react';
import { Team } from '../../types/match';
import { X, ArrowLeftRight, ArrowUp, ArrowDown } from 'lucide-react';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeam: Team;
  awayTeam: Team;
  currentMinute: number;
  onSave: (payload: {
    team: 'home' | 'away';
    minute: number;
    playerIn: string;
    playerInNumber: number;
    playerOut: string;
    playerOutNumber: number;
  }) => void;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  isOpen,
  onClose,
  homeTeam,
  awayTeam,
  currentMinute,
  onSave,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const activeTeam = selectedTeam === 'home' ? homeTeam : awayTeam;

  const [playerInName, setPlayerInName] = useState<string>('');
  const [playerInNumber, setPlayerInNumber] = useState<number>(11);
  const [playerOutName, setPlayerOutName] = useState<string>('');
  const [playerOutNumber, setPlayerOutNumber] = useState<number>(7);
  const [minute, setMinute] = useState<number>(currentMinute);

  if (!isOpen) return null;

  const handleSelectStarterOut = (name: string) => {
    setPlayerOutName(name);
    const p = activeTeam.lineup.find((x) => x.name === name);
    if (p) setPlayerOutNumber(p.number);
  };

  const handleSelectBenchIn = (name: string) => {
    setPlayerInName(name);
    const p = activeTeam.lineup.find((x) => x.name === name);
    if (p) setPlayerInNumber(p.number);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      team: selectedTeam,
      minute,
      playerIn: playerInName.trim() || 'Incoming Player',
      playerInNumber,
      playerOut: playerOutName.trim() || 'Outgoing Player',
      playerOutNumber,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/10 bg-slate-950">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base tracking-wide font-['Outfit'] uppercase">
              Electronic Substitution Board
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Team Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Select Team
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTeam('home')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  selectedTeam === 'home'
                    ? 'bg-slate-800 border-white text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{homeTeam.crest}</span>
                <span>{homeTeam.name}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeam('away')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  selectedTeam === 'away'
                    ? 'bg-slate-800 border-white text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{awayTeam.crest}</span>
                <span>{awayTeam.name}</span>
              </button>
            </div>
          </div>

          {/* Sub Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player OUT (Red) */}
            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3.5 space-y-2.5">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDown className="w-4 h-4" /> Player OUT
              </span>

              <select
                onChange={(e) => handleSelectStarterOut(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="">Select from squad</option>
                {activeTeam.lineup.map((p) => (
                  <option key={p.id} value={p.name}>
                    #{p.number} {p.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Or custom player name"
                value={playerOutName}
                onChange={(e) => setPlayerOutName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Jersey #</span>
                <input
                  type="number"
                  value={playerOutNumber}
                  onChange={(e) => setPlayerOutNumber(parseInt(e.target.value, 10) || 0)}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono text-center"
                />
              </div>
            </div>

            {/* Player IN (Green) */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUp className="w-4 h-4" /> Player IN
              </span>

              <select
                onChange={(e) => handleSelectBenchIn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="">Select from squad</option>
                {activeTeam.lineup.map((p) => (
                  <option key={p.id} value={p.name}>
                    #{p.number} {p.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Or custom player name"
                value={playerInName}
                onChange={(e) => setPlayerInName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Jersey #</span>
                <input
                  type="number"
                  value={playerInNumber}
                  onChange={(e) => setPlayerInNumber(parseInt(e.target.value, 10) || 0)}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Minute */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase">Match Minute</span>
            <input
              type="number"
              min="1"
              max="130"
              value={minute}
              onChange={(e) => setMinute(parseInt(e.target.value, 10) || 1)}
              className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm font-mono text-center text-white"
            />
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg uppercase tracking-wider"
            >
              Trigger Sub Board On-Screen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
