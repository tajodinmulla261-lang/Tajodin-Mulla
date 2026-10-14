import { MatchPeriod } from '../types/match';

export function formatMatchTime(totalSeconds: number, stoppageTime: number = 0): {
  display: string;
  stoppageDisplay: string | null;
  minutes: number;
  seconds: number;
} {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const stoppageDisplay = stoppageTime > 0 ? `+${stoppageTime}` : null;

  return {
    display,
    stoppageDisplay,
    minutes: mins,
    seconds: secs,
  };
}

export function getPeriodLabel(period: MatchPeriod): string {
  switch (period) {
    case 'PRE':
      return 'Pre-Match';
    case '1H':
      return '1st Half';
    case 'HT':
      return 'Half Time';
    case '2H':
      return '2nd Half';
    case 'FT':
      return 'Full Time';
    case 'ET1':
      return 'Extra Time 1H';
    case 'ET2':
      return 'Extra Time 2H';
    case 'PEN':
      return 'Penalties';
    default:
      return period;
  }
}

export function getPeriodShortLabel(period: MatchPeriod): string {
  switch (period) {
    case 'PRE':
      return 'PRE';
    case '1H':
      return '1ST';
    case 'HT':
      return 'HT';
    case '2H':
      return '2ND';
    case 'FT':
      return 'FT';
    case 'ET1':
      return 'ET1';
    case 'ET2':
      return 'ET2';
    case 'PEN':
      return 'PEN';
    default:
      return period;
  }
}
