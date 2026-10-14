import React, { useState } from 'react';

interface PlayerAvatarProps {
  name: string;
  number?: number;
  photoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  primaryColor?: string;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  number,
  photoUrl,
  size = 'md',
  primaryColor = '#3b82f6',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // Size dimensions
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-4xl',
  }[size];

  // Derive initials
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'FC';

  if (photoUrl && !hasError) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border-2 border-white/20 shadow-md bg-slate-900 ${sizeClasses} ${className}`}
      >
        <img
          src={photoUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-top"
        />
        {number !== undefined && size !== 'xs' && (
          <span
            className="absolute bottom-0 right-0 bg-slate-950/90 text-amber-400 font-mono font-black text-[9px] px-1 rounded-tl leading-tight border-t border-l border-white/20"
          >
            #{number}
          </span>
        )}
      </div>
    );
  }

  // Resilient Styled Fallback
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
      }}
      className={`relative rounded-full flex items-center justify-center font-bold text-white shrink-0 border-2 border-white/20 shadow-md select-none font-['Outfit'] ${sizeClasses} ${className}`}
    >
      <span>{initials}</span>
      {number !== undefined && size !== 'xs' && (
        <span
          className="absolute bottom-0 right-0 bg-slate-950/90 text-amber-400 font-mono font-black text-[9px] px-1 rounded-tl leading-tight border-t border-l border-white/20"
        >
          #{number}
        </span>
      )}
    </div>
  );
};
