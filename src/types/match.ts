export type MatchPeriod = 'PRE' | '1H' | 'HT' | '2H' | 'FT' | 'ET1' | 'ET2' | 'PEN';

export type EventType =
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION'
  | 'FOUL'
  | 'CORNER'
  | 'OFFSIDE'
  | 'SHOT_ON_TARGET'
  | 'SHOT_OFF_TARGET'
  | 'PENALTY_AWARDED'
  | 'VAR_CHECK';

export interface Player {
  id: string;
  number: number;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  isStarter?: boolean;
  photoUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string; // 3-letter code, e.g. "MCI", "RMA"
  code: string;
  primaryColor: string; // Hex color, e.g. "#6CABDD"
  secondaryColor: string;
  textColor: string;
  crest: string; // Emoji, SVG icon name, or image URL
  crestUrl?: string; // High-resolution image/logo URL
  countryCode?: string; // e.g. "ENG", "ESP"
  coach?: string;
  formation?: string; // e.g. "4-3-3", "4-2-3-1"
  lineup: Player[];
}

export interface MatchTimer {
  seconds: number;
  isRunning: boolean;
  stoppageTime: number; // Stoppage time in minutes, e.g. 3
  period: MatchPeriod;
  lastTickTimestamp: number;
}

export interface MatchEvent {
  id: string;
  type: EventType;
  team: 'home' | 'away';
  minute: number;
  extraMinute?: number;
  playerName: string;
  playerNumber?: number;
  assistPlayerName?: string;
  playerOut?: string;
  playerOutNumber?: number;
  playerIn?: string;
  playerInNumber?: number;
  notes?: string;
  timestamp: number;
}

export interface TeamStats {
  possession: number; // Percentage
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  offsides: number;
  saves: number;
  passes: number;
  passAccuracy: number;
}

export interface PenaltyKick {
  round: number;
  team: 'home' | 'away';
  result: 'scored' | 'missed' | 'pending';
  playerName?: string;
}

export interface PenaltyShootout {
  homeScore: number;
  awayScore: number;
  homeKicks: ('scored' | 'missed' | 'pending')[];
  awayKicks: ('scored' | 'missed' | 'pending')[];
  currentTurn: 'home' | 'away';
}

export type GraphicType =
  | 'NONE'
  | 'GOAL_BANNER'
  | 'VAR_CHECK'
  | 'SUBSTITUTION_BOARD'
  | 'CARD_ALERT'
  | 'STATS_LOWER_THIRD'
  | 'PERIOD_BANNER'
  | 'TEAM_LINEUP';

export interface BroadcastGraphic {
  active: boolean;
  type: GraphicType;
  title: string;
  subtitle?: string;
  team?: 'home' | 'away';
  playerName?: string;
  playerNumber?: number;
  playerPhoto?: string;
  assistPlayerName?: string;
  playerIn?: string;
  playerInNumber?: number;
  playerInPhoto?: string;
  playerOut?: string;
  playerOutNumber?: number;
  playerOutPhoto?: string;
  cardColor?: 'yellow' | 'red';
  varDecision?: 'CHECKING' | 'GOAL' | 'NO_GOAL' | 'PENALTY' | 'NO_PENALTY' | 'RED_CARD' | 'DECISION';
  durationMs?: number;
  triggeredAt?: number;
}

export type ScoreboardLayoutType =
  | 'premier'
  | 'champions'
  | 'international'
  | 'matrix_led'
  | 'tactical_lower'
  | 'minimal_bug';

export interface OverlayConfig {
  chromaColor: 'transparent' | 'green' | 'magenta' | 'black';
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  scale: number;
  showTeamCrests: boolean;
  showEventPopups: boolean;
  soundEnabled: boolean;
}

export interface MatchState {
  id: string;
  competition: string;
  venue: string;
  referee: string;
  matchDate: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  timer: MatchTimer;
  events: MatchEvent[];
  stats: {
    home: TeamStats;
    away: TeamStats;
  };
  penalties: PenaltyShootout;
  graphic: BroadcastGraphic;
  layout: ScoreboardLayoutType;
  overlayConfig: OverlayConfig;
  updatedAt: number;
}
