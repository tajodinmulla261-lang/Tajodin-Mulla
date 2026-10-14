import React, { useState } from 'react';
import { Team, Player } from '../../types/match';
import { Shield, X, Check, Sparkles, Users } from 'lucide-react';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTeam: (team: Team) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSaveTeam,
}) => {
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [crest, setCrest] = useState('⚽');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#1e293b');
  const [coach, setCoach] = useState('');
  const [formation, setFormation] = useState('4-3-3');
  const [autoGenerateSquad, setAutoGenerateSquad] = useState(true);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setTeamName(val);
    if (!shortName || shortName.length <= 4) {
      setShortName(val.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const teamId = `team_${Date.now()}`;
    const cleanShortName = (shortName || teamName.slice(0, 3)).toUpperCase();

    // Generate initial squad if requested
    let initialLineup: Player[] = [];
    if (autoGenerateSquad) {
      initialLineup = [
        { id: `${teamId}_1`, number: 1, name: 'Goalkeeper 1', position: 'GK', isStarter: true },
        { id: `${teamId}_2`, number: 2, name: 'Right Back', position: 'DEF', isStarter: true },
        { id: `${teamId}_4`, number: 4, name: 'Center Back 1', position: 'DEF', isStarter: true },
        { id: `${teamId}_5`, number: 5, name: 'Center Back 2', position: 'DEF', isStarter: true },
        { id: `${teamId}_3`, number: 3, name: 'Left Back', position: 'DEF', isStarter: true },
        { id: `${teamId}_6`, number: 6, name: 'Defensive Mid', position: 'MID', isStarter: true },
        { id: `${teamId}_8`, number: 8, name: 'Central Mid', position: 'MID', isStarter: true },
        { id: `${teamId}_10`, number: 10, name: 'Attacking Mid', position: 'MID', isStarter: true },
        { id: `${teamId}_7`, number: 7, name: 'Right Winger', position: 'FWD', isStarter: true },
        { id: `${teamId}_9`, number: 9, name: 'Center Forward', position: 'FWD', isStarter: true },
        { id: `${teamId}_11`, number: 11, name: 'Left Winger', position: 'FWD', isStarter: true },
        { id: `${teamId}_12`, number: 12, name: 'Reserve GK', position: 'GK', isStarter: false },
        { id: `${teamId}_14`, number: 14, name: 'Sub Defender', position: 'DEF', isStarter: false },
        { id: `${teamId}_17`, number: 17, name: 'Sub Midfielder', position: 'MID', isStarter: false },
        { id: `${teamId}_19`, number: 19, name: 'Sub Striker', position: 'FWD', isStarter: false },
      ];
    }

    const newTeam: Team = {
      id: teamId,
      name: teamName.trim(),
      shortName: cleanShortName,
      code: cleanShortName,
      countryCode: countryCode.trim().toUpperCase() || 'FC',
      crest: crest.trim() || '⚽',
      primaryColor,
      secondaryColor,
      textColor: '#ffffff',
      coach: coach.trim() || undefined,
      formation,
      lineup: initialLineup,
    };

    onSaveTeam(newTeam);
    onClose();

    // Reset fields
    setTeamName('');
    setShortName('');
    setCountryCode('');
    setCrest('⚽');
    setCoach('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-slate-950">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base tracking-wide font-['Outfit'] uppercase">
              Add New Football Team
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Team Name & Short Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Team Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bayern Munich"
                value={teamName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Short Code (3-4)
              </label>
              <input
                type="text"
                maxLength={4}
                required
                placeholder="BAY"
                value={shortName}
                onChange={(e) => setShortName(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase text-center focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Crest & Country Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Club Crest / Emoji
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={crest}
                  onChange={(e) => setCrest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white text-center"
                />
                <div className="flex gap-1 shrink-0">
                  {['⚽', '👑', '⚡', '🔴', '🔵', '🦁', '🦅', '⭐'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCrest(emoji)}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Country / League Code
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. GER, KSA, PAK"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase text-center focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Kit Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Primary Jersey Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded border-0 bg-transparent cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-9 h-9 rounded border-0 bg-transparent cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Coach & Formation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Manager / Head Coach
              </label>
              <input
                type="text"
                placeholder="e.g. Vincent Kompany"
                value={coach}
                onChange={(e) => setCoach(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Default Formation
              </label>
              <select
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="4-3-3">4-3-3 (Attacking)</option>
                <option value="4-2-3-1">4-2-3-1 (Balanced)</option>
                <option value="4-4-2">4-4-2 (Classic)</option>
                <option value="3-5-2">3-5-2 (Wingbacks)</option>
                <option value="5-3-2">5-3-2 (Defensive)</option>
              </select>
            </div>
          </div>

          {/* Auto-populate Squad Checkbox */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-xs text-white block">Auto-generate 15-Player Squad</span>
                <span className="text-[10px] text-slate-400">Pre-populates Starting XI + bench with jersey numbers</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoGenerateSquad}
              onChange={(e) => setAutoGenerateSquad(e.target.checked)}
              className="w-4 h-4 accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg uppercase tracking-wider flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Create & Add Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
