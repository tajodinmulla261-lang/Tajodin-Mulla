import React, { useState } from 'react';
import { MatchState, Team, Player } from '../../types/match';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { CreateTeamModal } from '../modals/CreateTeamModal';
import { PlayerEditModal } from '../modals/PlayerEditModal';
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Shield,
  MapPin,
  Sparkles,
  Tv,
  Check,
  FolderPlus,
  Upload,
  Download,
} from 'lucide-react';

interface TeamsEditorTabProps {
  match: MatchState;
  teamsLibrary: Record<string, Team>;
  onSaveTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onSetMatchTeam: (slot: 'home' | 'away', teamId?: string, team?: Team) => void;
  onUpdateMatchDetails: (payload: any) => void;
  onTriggerGraphic: (graphic: any) => void;
}

export const TeamsEditorTab: React.FC<TeamsEditorTabProps> = ({
  match,
  teamsLibrary,
  onSaveTeam,
  onDeleteTeam,
  onSetMatchTeam,
  onUpdateMatchDetails,
  onTriggerGraphic,
}) => {
  const { homeTeam, awayTeam, competition, venue, referee } = match;

  // Active team selected for roster editing
  const [editingSlot, setEditingSlot] = useState<'home' | 'away'>('home');
  const activeEditingTeam = editingSlot === 'home' ? homeTeam : awayTeam;

  // Modals state
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isClearPlayersConfirmOpen, setIsClearPlayersConfirmOpen] = useState(false);
  const [playerModalState, setPlayerModalState] = useState<{
    isOpen: boolean;
    player: Player | null;
  }>({
    isOpen: false,
    player: null,
  });

  // Fixture inputs
  const [compName, setCompName] = useState(competition);
  const [venueName, setVenueName] = useState(venue);
  const [refName, setRefName] = useState(referee);

  const handleSaveFixtureInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMatchDetails({
      competition: compName,
      venue: venueName,
      referee: refName,
    });
  };

  const handlePlayerSave = (savedPlayer: Player) => {
    const currentLineup = activeEditingTeam.lineup || [];
    const existingIndex = currentLineup.findIndex((p) => p.id === savedPlayer.id);

    let newLineup: Player[];
    if (existingIndex !== -1) {
      newLineup = [...currentLineup];
      newLineup[existingIndex] = savedPlayer;
    } else {
      newLineup = [...currentLineup, savedPlayer];
    }

    const updatedTeam: Team = {
      ...activeEditingTeam,
      lineup: newLineup,
    };

    onSaveTeam(updatedTeam);
    onSetMatchTeam(editingSlot, undefined, updatedTeam);
  };

  const handleDeletePlayer = (playerId: string) => {
    const updatedTeam: Team = {
      ...activeEditingTeam,
      lineup: activeEditingTeam.lineup.filter((p) => p.id !== playerId),
    };
    onSaveTeam(updatedTeam);
    onSetMatchTeam(editingSlot, undefined, updatedTeam);
  };

  const handleClearAllPlayers = () => {
    setIsClearPlayersConfirmOpen(true);
  };

  const confirmClearAllPlayers = () => {
    const updatedTeam: Team = {
      ...activeEditingTeam,
      lineup: [],
    };
    onSaveTeam(updatedTeam);
    onSetMatchTeam(editingSlot, undefined, updatedTeam);
    setIsClearPlayersConfirmOpen(false);
  };

  const handleBroadcastLineup = (team: Team) => {
    onTriggerGraphic({
      active: true,
      type: 'TEAM_LINEUP',
      title: `${team.name} Starting XI`,
      subtitle: `${team.formation || '4-3-3'} · Coach: ${team.coach || 'Manager'}`,
      team: team.id === homeTeam.id ? 'home' : 'away',
      durationMs: 12000,
      triggeredAt: Date.now(),
    });
  };

  const allTeamsList = Object.values(teamsLibrary);

  return (
    <div className="space-y-6">
      {/* 1. TOP TEAM MANAGER ACTIONS & FIXTURE BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
            TEAMS & SQUADS DIRECTORY
          </span>
          <h3 className="font-extrabold text-xl font-['Outfit'] text-white mt-0.5 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" /> Complete Teams & Player Photos Manager
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Create new custom football teams, edit Starting XI rosters with player photos, and select teams for the live broadcast overlay.
          </p>
        </div>

        <button
          onClick={() => setIsCreateTeamOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shrink-0"
        >
          <FolderPlus className="w-4 h-4" /> Add New Complete Team
        </button>
      </div>

      {/* 2. TEAMS LIBRARY (GRID OF AVAILABLE TEAMS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Team Library ({allTeamsList.length} Teams Available)
          </h4>
          <span className="text-xs text-slate-400">Click to set as Home or Away team</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {allTeamsList.map((t) => {
            const isHome = homeTeam.id === t.id;
            const isAway = awayTeam.id === t.id;

            return (
              <div
                key={t.id}
                className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                  isHome || isAway
                    ? 'border-amber-400 ring-1 ring-amber-400/50 bg-slate-950/90 shadow-md'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{t.crest}</span>
                      <div>
                        <h5 className="font-bold text-sm text-white font-['Outfit']">{t.name}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t.shortName} · {t.countryCode || 'FC'} · {t.formation || '4-3-3'}
                        </span>
                      </div>
                    </div>

                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                      style={{ backgroundColor: t.primaryColor }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between py-1 border-t border-slate-800/80 my-2">
                    <span>Squad: <strong className="text-white">{t.lineup?.length || 0} players</strong></span>
                    {t.coach && <span>Coach: <strong className="text-slate-300">{t.coach}</strong></span>}
                  </div>
                </div>

                {/* Team Slot Switchers */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => onSetMatchTeam('home', t.id, t)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      isHome
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {isHome ? '✓ Home Team' : 'Set Home'}
                  </button>

                  <button
                    onClick={() => onSetMatchTeam('away', t.id, t)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      isAway
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {isAway ? '✓ Away Team' : 'Set Away'}
                  </button>

                  <button
                    onClick={() => handleBroadcastLineup(t)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg border border-slate-800"
                    title="Broadcast Starting Lineup graphic on-screen"
                  >
                    <Tv className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete team button */}
                  <button
                    onClick={() => setTeamToDelete(t)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                    title="Delete team"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ROSTER & PLAYER PHOTOS MANAGER (ACTIVE SQUAD TABLE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{activeEditingTeam.crest}</span>
              <h4 className="font-extrabold text-xl text-white font-['Outfit']">
                {activeEditingTeam.name} Roster & Photos
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              Manage player headshot photos, jersey numbers, and starting lineup assignments for this team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Switch between Home and Away */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setEditingSlot('home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editingSlot === 'home'
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {homeTeam.shortName} (Home)
              </button>
              <button
                onClick={() => setEditingSlot('away')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editingSlot === 'away'
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {awayTeam.shortName} (Away)
              </button>
            </div>

            {/* Clear All Players Button */}
            {activeEditingTeam.lineup?.length > 0 && (
              <button
                onClick={handleClearAllPlayers}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                title="Delete all players from this squad"
              >
                <Trash2 className="w-4 h-4" /> Delete All Players
              </button>
            )}

            <button
              onClick={() => setPlayerModalState({ isOpen: true, player: null })}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow"
            >
              <Plus className="w-4 h-4" /> Add Player
            </button>
          </div>
        </div>

        {/* Players Table / Empty State */}
        {activeEditingTeam.lineup?.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-950/60 rounded-xl border border-dashed border-slate-800 p-8">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <span className="font-extrabold text-base text-white block">No players in this squad yet</span>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto mb-4">
              All previous players have been removed. Click <strong>+ Add Player</strong> to upload your own photos with the automatic background remover!
            </p>
            <button
              onClick={() => setPlayerModalState({ isOpen: true, player: null })}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition-colors shadow"
            >
              <Plus className="w-4 h-4" /> Add First Player
            </button>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 font-mono tracking-wider">
                <th className="pb-3 pl-2">Photo & Name</th>
                <th className="pb-3 text-center">Jersey #</th>
                <th className="pb-3">Position</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeEditingTeam.lineup?.map((player) => (
                <tr key={player.id} className="hover:bg-slate-950/40 transition-colors">
                  {/* Photo & Name */}
                  <td className="py-2.5 pl-2 flex items-center gap-3">
                    <PlayerAvatar
                      name={player.name}
                      number={player.number}
                      photoUrl={player.photoUrl}
                      size="sm"
                      primaryColor={activeEditingTeam.primaryColor}
                    />
                    <div>
                      <span className="font-bold text-sm text-white block">{player.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {player.photoUrl ? 'Photo attached' : 'Default avatar'}
                      </span>
                    </div>
                  </td>

                  {/* Jersey */}
                  <td className="py-2.5 text-center font-mono font-bold text-amber-400 text-sm">
                    #{player.number}
                  </td>

                  {/* Position */}
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300">
                      {player.position}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        player.isStarter ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {player.isStarter ? 'Starting XI' : 'Bench'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 text-right pr-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPlayerModalState({ isOpen: true, player })}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit player & photo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Remove player"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* 4. MATCH VENUE & COMPETITION SETTINGS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400" /> Match Information & Competition
        </h4>

        <form onSubmit={handleSaveFixtureInfo} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Competition Name
            </label>
            <input
              type="text"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Stadium / Venue
            </label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Referee
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={refName}
                onChange={(e) => setRefName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* MODALS */}
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onSaveTeam={(newTeam) => {
          onSaveTeam(newTeam);
        }}
      />

      <PlayerEditModal
        isOpen={playerModalState.isOpen}
        onClose={() => setPlayerModalState({ isOpen: false, player: null })}
        player={playerModalState.player}
        teamColor={activeEditingTeam.primaryColor}
        onSave={handlePlayerSave}
      />

      {/* Delete Team Confirmation Modal (Safe, No window.confirm) */}
      {teamToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base font-['Outfit']">Delete Team?</h4>
                <p className="text-xs text-slate-400">{teamToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete <strong>{teamToDelete.name}</strong> from your teams library? This action cannot be undone.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setTeamToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteTeam(teamToDelete.id);
                  setTeamToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Players Confirmation Modal */}
      {isClearPlayersConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base font-['Outfit']">Clear Squad?</h4>
                <p className="text-xs text-slate-400">{activeEditingTeam.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete all players from <strong>{activeEditingTeam.name}</strong>?
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsClearPlayersConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAllPlayers}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
