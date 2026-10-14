import React, { useState } from 'react';
import { Team } from '../../types/match';
import { Trophy, X, Check, Users, MapPin, Calendar, SlidersHorizontal, Shield, PlusCircle } from 'lucide-react';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamsLibrary: Record<string, Team>;
  currentCompetition?: string;
  currentVenue?: string;
  currentReferee?: string;
  onSubmitMatch: (matchData: {
    competition: string;
    venue: string;
    referee: string;
    homeTeam: Team;
    awayTeam: Team;
    halfDurationMinutes: number;
    startPeriod: '1H' | 'PRE';
  }) => void;
  onOpenCreateTeamModal?: () => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  teamsLibrary,
  currentCompetition,
  currentVenue,
  currentReferee,
  onSubmitMatch,
  onOpenCreateTeamModal,
}) => {
  const allTeams = Object.values(teamsLibrary);

  const [competition, setCompetition] = useState(currentCompetition || 'ITC Sports Premier League');
  const [venue, setVenue] = useState(currentVenue || 'ITC Arena Stadium');
  const [referee, setReferee] = useState(currentReferee || 'Official Referee');
  const [halfDuration, setHalfDuration] = useState<number>(45);
  const [startPeriod, setStartPeriod] = useState<'1H' | 'PRE'>('1H');

  // Selected teams IDs
  const [selectedHomeId, setSelectedHomeId] = useState<string>(allTeams[0]?.id || '');
  const [selectedAwayId, setSelectedAwayId] = useState<string>(allTeams[1]?.id || allTeams[0]?.id || '');

  // Quick fallback custom teams if no teams in library yet
  const [customHomeName, setCustomHomeName] = useState('Home Team');
  const [customHomeCode, setCustomHomeCode] = useState('HOM');
  const [customHomeColor, setCustomHomeColor] = useState('#2563eb');
  const [customHomeCrest, setCustomHomeCrest] = useState('⚽');

  const [customAwayName, setCustomAwayName] = useState('Away Team');
  const [customAwayCode, setCustomAwayCode] = useState('AWY');
  const [customAwayColor, setCustomAwayColor] = useState('#dc2626');
  const [customAwayCrest, setCustomAwayCrest] = useState('⚡');

  React.useEffect(() => {
    if (allTeams.length > 0) {
      if (!selectedHomeId || !teamsLibrary[selectedHomeId]) {
        setSelectedHomeId(allTeams[0]?.id || '');
      }
      if (!selectedAwayId || !teamsLibrary[selectedAwayId]) {
        setSelectedAwayId(allTeams[1]?.id || allTeams[0]?.id || '');
      }
    }
  }, [teamsLibrary, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Resolve Home Team
    let resolvedHome: Team;
    if (selectedHomeId && teamsLibrary[selectedHomeId]) {
      resolvedHome = teamsLibrary[selectedHomeId];
    } else {
      resolvedHome = {
        id: `team_${Date.now()}_home`,
        name: customHomeName.trim() || 'Home Team',
        shortName: customHomeCode.trim().toUpperCase() || 'HOM',
        code: customHomeCode.trim().toUpperCase() || 'HOM',
        primaryColor: customHomeColor,
        secondaryColor: '#ffffff',
        textColor: '#ffffff',
        crest: customHomeCrest || '⚽',
        lineup: [],
      };
    }

    // Resolve Away Team
    let resolvedAway: Team;
    if (selectedAwayId && teamsLibrary[selectedAwayId]) {
      resolvedAway = teamsLibrary[selectedAwayId];
    } else {
      resolvedAway = {
        id: `team_${Date.now()}_away`,
        name: customAwayName.trim() || 'Away Team',
        shortName: customAwayCode.trim().toUpperCase() || 'AWY',
        code: customAwayCode.trim().toUpperCase() || 'AWY',
        primaryColor: customAwayColor,
        secondaryColor: '#000000',
        textColor: '#ffffff',
        crest: customAwayCrest || '⚡',
        lineup: [],
      };
    }

    onSubmitMatch({
      competition: competition.trim() || 'ITC Sports Football Match',
      venue: venue.trim() || 'Main Stadium',
      referee: referee.trim() || 'Head Referee',
      homeTeam: resolvedHome,
      awayTeam: resolvedAway,
      halfDurationMinutes: halfDuration,
      startPeriod,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-white my-8">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base tracking-wide font-['Outfit'] uppercase text-white">
                Create New Football Match (میچ بنائیں)
              </h3>
              <p className="text-[11px] text-slate-400">
                Setup new fixture, choose teams, and reset score & clock for live broadcast
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* 1. TOURNAMENT & FIXTURE DETAILS */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
              1. Competition & Venue Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Competition Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ITC Premier Cup"
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Stadium / Ground
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Arena"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Referee
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Referee"
                  value={referee}
                  onChange={(e) => setReferee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 2. TEAMS SELECTION (HOME vs AWAY) */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                2. Select Home & Away Teams
              </span>
              {onOpenCreateTeamModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreateTeamModal();
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> + Create New Team in Library
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* HOME TEAM SELECTOR */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" /> Home Team
                  </span>
                  <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-mono">
                    SLOT 1
                  </span>
                </div>

                {allTeams.length > 0 ? (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Choose from Library:
                    </label>
                    <select
                      value={selectedHomeId}
                      onChange={(e) => setSelectedHomeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {allTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.crest} {t.name} ({t.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Home Team Name"
                      value={customHomeName}
                      onChange={(e) => setCustomHomeName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Code (HOM)"
                        value={customHomeCode}
                        onChange={(e) => setCustomHomeCode(e.target.value.toUpperCase())}
                        className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white text-center font-mono"
                      />
                      <input
                        type="color"
                        value={customHomeColor}
                        onChange={(e) => setCustomHomeColor(e.target.value)}
                        className="w-8 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* AWAY TEAM SELECTOR */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" /> Away Team
                  </span>
                  <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-mono">
                    SLOT 2
                  </span>
                </div>

                {allTeams.length > 0 ? (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Choose from Library:
                    </label>
                    <select
                      value={selectedAwayId}
                      onChange={(e) => setSelectedAwayId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {allTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.crest} {t.name} ({t.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Away Team Name"
                      value={customAwayName}
                      onChange={(e) => setCustomAwayName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Code (AWY)"
                        value={customAwayCode}
                        onChange={(e) => setCustomAwayCode(e.target.value.toUpperCase())}
                        className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white text-center font-mono"
                      />
                      <input
                        type="color"
                        value={customAwayColor}
                        onChange={(e) => setCustomAwayColor(e.target.value)}
                        className="w-8 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 3. MATCH FORMAT & RESET RULES */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
              3. Match Duration & Starting Settings
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Half Duration
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[45, 30, 20, 15].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setHalfDuration(mins)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        halfDuration === mins
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Starting Clock State
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStartPeriod('1H')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      startPeriod === '1H'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    1st Half (00:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartPeriod('PRE')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      startPeriod === 'PRE'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pre-Match
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="text-amber-400 font-bold">ℹ</span>
              <span>
                Creating this match will reset live scores to <strong>0 - 0</strong>, reset the clock, and clear timeline events.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" /> Start & Launch Match
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
