import React, { useState, useEffect } from 'react';
import { Player } from '../../types/match';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PhotoBackgroundRemover } from '../common/PhotoBackgroundRemover';
import { X, Image, User, Check, Scissors, Upload, Sparkles } from 'lucide-react';

interface PlayerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  player?: Player | null;
  teamColor: string;
  onSave: (player: Player) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export const PlayerEditModal: React.FC<PlayerEditModalProps> = ({
  isOpen,
  onClose,
  player,
  teamColor,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState(10);
  const [position, setPosition] = useState<'GK' | 'DEF' | 'MID' | 'FWD'>('FWD');
  const [isStarter, setIsStarter] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');
  const [activePhotoTab, setActivePhotoTab] = useState<'upload_cut' | 'url'>('upload_cut');

  useEffect(() => {
    if (player) {
      setName(player.name);
      setNumber(player.number);
      setPosition(player.position);
      setIsStarter(player.isStarter ?? true);
      setPhotoUrl(player.photoUrl || '');
    } else {
      setName('');
      setNumber(9);
      setPosition('FWD');
      setIsStarter(true);
      setPhotoUrl('');
    }
  }, [player, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: player?.id || `p_${Date.now()}`,
      name: name.trim(),
      number,
      position,
      isStarter,
      photoUrl: photoUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden text-white my-8">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-slate-950">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base tracking-wide font-['Outfit'] uppercase">
              {player ? 'Edit Player & Cutout Photo' : 'Add Player to Squad'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Top Preview Section */}
          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <PlayerAvatar
              name={name || 'New Player'}
              number={number}
              photoUrl={photoUrl}
              size="xl"
              primaryColor={teamColor}
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white font-['Outfit']">
                {name || 'Player Name Preview'}
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                #{number} · {position} · {isStarter ? 'Starting XI' : 'Substitute'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {photoUrl ? (
                  <span className="text-emerald-400 font-semibold">✓ Player photo ready (transparent cutout)</span>
                ) : (
                  'Upload photo below or use default jersey badge'
                )}
              </span>
            </div>
          </div>

          {/* Name & Jersey */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Player Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe / Player Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Jersey #
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono text-center focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Position & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Field Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="GK">Goalkeeper (GK)</option>
                <option value="DEF">Defender (DEF)</option>
                <option value="MID">Midfielder (MID)</option>
                <option value="FWD">Forward / Striker (FWD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Squad Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsStarter(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    isStarter
                      ? 'bg-amber-400 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Starter
                </button>
                <button
                  type="button"
                  onClick={() => setIsStarter(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    !isStarter
                      ? 'bg-amber-400 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Bench
                </button>
              </div>
            </div>
          </div>

          {/* PHOTO UPLOAD & BACKGROUND CUTOUT SECTION */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <Scissors className="w-4 h-4" /> Player Photo (Upload & Cut Background)
              </label>

              {/* Toggle upload vs url */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('upload_cut')}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${
                    activePhotoTab === 'upload_cut'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload & Auto-Cut
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('url')}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${
                    activePhotoTab === 'url'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste URL
                </button>
              </div>
            </div>

            {activePhotoTab === 'upload_cut' ? (
              <PhotoBackgroundRemover
                initialPhotoUrl={photoUrl}
                onApplyPhoto={(cutoutUrl) => {
                  setPhotoUrl(cutoutUrl);
                }}
                onCancel={() => {}}
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="https://example.com/player-photo.png"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />

                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-2">
                    Sample Presets:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(preset)}
                        className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                          photoUrl === preset ? 'border-amber-400 scale-105 ring-2 ring-amber-400' : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset}
                          alt={`preset ${idx}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] rounded uppercase font-bold shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" /> Save Player
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
