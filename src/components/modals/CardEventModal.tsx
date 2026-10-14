import React, { useState } from 'react';
import { Team } from '../../types/match';
import { X, AlertTriangle } from 'lucide-react';

interface CardEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeam: Team;
  awayTeam: Team;
  currentMinute: number;
  onSave: (payload: {
    type: 'YELLOW_CARD' | 'RED_CARD';
    team: 'home' | 'away';
    minute: number;
    playerName: string;
    playerNumber?: number;
    notes?: string;
  }) => void;
}

export const CardEventModal: React.FC<CardEventModalProps> = ({
  isOpen,
  onClose,
  homeTeam,
  awayTeam,
  currentMinute,
  onSave,
}) => {
  const [cardType, setCardType] = useState<'YELLOW_CARD' | 'RED_CARD'>('YELLOW_CARD');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const activeTeam = selectedTeam === 'home' ? homeTeam : awayTeam;

  const [playerName, setPlayerName] = useState<string>(activeTeam.lineup[0]?.name || '');
  const [playerNumber, setPlayerNumber] = useState<number>(activeTeam.lineup[0]?.number || 4);
  const [minute, setMinute] = useState<number>(currentMinute);
  const [notes, setNotes] = useState<string>('Tactical Foul');

  if (!isOpen) return null;

  const handleSelectSquadPlayer = (name: string) => {
    setPlayerName(name);
    const p = activeTeam.lineup.find((x) => x.name === name);
    if (p) setPlayerNumber(p.number);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: cardType,
      team: selectedTeam,
      minute,
      playerName: playerName.trim() || 'Player',
      playerNumber,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-white">
        {/* Header */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between border-b border-white/10 ${
            cardType === 'RED_CARD' ? 'bg-red-700' : 'bg-amber-400'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-950">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-extrabold text-base tracking-wide font-['Outfit'] uppercase">
              Issue {cardType === 'RED_CARD' ? 'Red Card' : 'Yellow Card'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-950 hover:bg-black/10 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Card Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCardType('YELLOW_CARD')}
              className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all ${
                cardType === 'YELLOW_CARD'
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-3 h-4 bg-amber-400 rounded-[1px]" />
              Yellow Card
            </button>
            <button
              type="button"
              onClick={() => setCardType('RED_CARD')}
              className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all ${
                cardType === 'RED_CARD'
                  ? 'bg-red-600/20 border-red-500 text-red-400 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-3 h-4 bg-red-600 rounded-[1px]" />
              Red Card
            </button>
          </div>

          {/* Team Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Team
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

          {/* Player Roster Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Select Player
            </label>
            <select
              value={playerName}
              onChange={(e) => handleSelectSquadPlayer(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              {activeTeam.lineup.map((p) => (
                <option key={p.id} value={p.name}>
                  #{p.number} - {p.name} ({p.position})
                </option>
              ))}
            </select>
          </div>

          {/* Minute & Reason */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Minute
              </label>
              <input
                type="number"
                min="1"
                max="130"
                value={minute}
                onChange={(e) => setMinute(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Infringement / Note
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Reckless Tackle"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
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
              className={`px-5 py-2 text-xs font-bold rounded-lg uppercase tracking-wider text-slate-950 ${
                cardType === 'RED_CARD' ? 'bg-red-500 hover:bg-red-400' : 'bg-amber-400 hover:bg-amber-300'
              }`}
            >
              Confirm & Alert Broadcast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
