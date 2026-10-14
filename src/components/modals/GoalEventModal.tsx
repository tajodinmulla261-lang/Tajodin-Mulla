import React, { useState } from 'react';
import { Team, Player } from '../../types/match';
import { X, Award } from 'lucide-react';

interface GoalEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: 'home' | 'away';
  homeTeam: Team;
  awayTeam: Team;
  currentMinute: number;
  onSave: (payload: {
    team: 'home' | 'away';
    minute: number;
    player: { name: string; number?: number; photoUrl?: string };
    assist?: string;
  }) => void;
}

export const GoalEventModal: React.FC<GoalEventModalProps> = ({
  isOpen,
  onClose,
  team,
  homeTeam,
  awayTeam,
  currentMinute,
  onSave,
}) => {
  const activeTeam = team === 'home' ? homeTeam : awayTeam;
  const [selectedPlayer, setSelectedPlayer] = useState<string>(activeTeam.lineup[0]?.name || '');
  const [customPlayerName, setCustomPlayerName] = useState<string>('');
  const [playerNumber, setPlayerNumber] = useState<number>(activeTeam.lineup[0]?.number || 9);
  const [assistPlayer, setAssistPlayer] = useState<string>('');
  const [minute, setMinute] = useState<number>(currentMinute);

  if (!isOpen) return null;

  const [playerPhoto, setPlayerPhoto] = useState<string>(activeTeam.lineup[0]?.photoUrl || '');

  const handlePlayerSelect = (playerName: string) => {
    setSelectedPlayer(playerName);
    const found = activeTeam.lineup.find((p) => p.name === playerName);
    if (found) {
      setPlayerNumber(found.number);
      setPlayerPhoto(found.photoUrl || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customPlayerName.trim() || selectedPlayer || 'Player';
    onSave({
      team,
      minute,
      player: { name: finalName, number: playerNumber, photoUrl: playerPhoto || undefined },
      assist: assistPlayer.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-white">
        {/* Header */}
        <div
          className="px-5 py-3.5 flex items-center justify-between border-b border-white/10"
          style={{ backgroundColor: activeTeam.primaryColor }}
        >
          <div className="flex items-center gap-2 text-slate-950">
            <Award className="w-5 h-5" />
            <h3 className="font-extrabold text-base tracking-wide font-['Outfit'] uppercase">
              Record Goal · {activeTeam.name}
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
          {/* Select from Squad */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Goal Scorer (From Squad)
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => handlePlayerSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {activeTeam.lineup.map((p) => (
                <option key={p.id} value={p.name}>
                  #{p.number} - {p.name} ({p.position})
                </option>
              ))}
            </select>
          </div>

          {/* Or Custom Name & Number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Or Custom Name
              </label>
              <input
                type="text"
                placeholder="e.g. Own Goal / Sub"
                value={customPlayerName}
                onChange={(e) => setCustomPlayerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Jersey #
              </label>
              <input
                type="number"
                value={playerNumber}
                onChange={(e) => setPlayerNumber(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Assist & Minute */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Assist By (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. K. De Bruyne"
                value={assistPlayer}
                onChange={(e) => setAssistPlayer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors uppercase tracking-wider"
            >
              Confirm Goal & Show Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
