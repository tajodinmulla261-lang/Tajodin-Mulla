import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_MATCH_STATE, PRESET_TEAMS } from './src/server/defaultData.js';
import { MatchState, MatchEvent, TeamStats, BroadcastGraphic, MatchPeriod, ScoreboardLayoutType, Team } from './src/types/match.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Persistent storage setup
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'match_state.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let currentState: MatchState = { ...INITIAL_MATCH_STATE };

// Try loading saved match state
try {
  if (fs.existsSync(STATE_FILE)) {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    currentState = { ...INITIAL_MATCH_STATE, ...parsed };
    console.log('[Football Backend] Loaded saved match state from file');
  } else {
    fs.writeFileSync(STATE_FILE, JSON.stringify(currentState, null, 2), 'utf-8');
  }
} catch (err) {
  console.warn('[Football Backend] Failed to load saved state, using default:', err);
}

// SSE Clients for instant real-time sync with OBS / vMix
const sseClients: Set<Response> = new Set();

function broadcastState() {
  currentState.updatedAt = Date.now();
  const payload = `data: ${JSON.stringify(currentState)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }

  // Persist to disk asynchronously
  try {
    fs.writeFile(STATE_FILE, JSON.stringify(currentState, null, 2), (err) => {
      if (err) console.error('Error saving match state:', err);
    });
  } catch (err) {
    console.error('File write exception:', err);
  }
}

// Background Clock Engine (Server authoritative clock)
setInterval(() => {
  if (currentState.timer.isRunning) {
    currentState.timer.seconds += 1;
    // Broadcast clock tick every second to all connected overlays
    broadcastState();
  }
}, 1000);

// API Endpoints
// 1. Get Match State
app.get('/api/match', (req: Request, res: Response) => {
  res.json({ success: true, match: currentState });
});

// 2. Real-time SSE Stream (for OBS/vMix and controller)
app.get('/api/match/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send current state immediately on connection
  res.write(`data: ${JSON.stringify(currentState)}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 3. Update Match Details (Teams, Competition, Venue, Layout, Overlay Config)
app.post('/api/match/update', (req: Request, res: Response) => {
  const { competition, venue, referee, homeTeam, awayTeam, layout, overlayConfig } = req.body;

  if (competition !== undefined) currentState.competition = competition;
  if (venue !== undefined) currentState.venue = venue;
  if (referee !== undefined) currentState.referee = referee;
  if (homeTeam !== undefined) currentState.homeTeam = { ...currentState.homeTeam, ...homeTeam };
  if (awayTeam !== undefined) currentState.awayTeam = { ...currentState.awayTeam, ...awayTeam };
  if (layout !== undefined) currentState.layout = layout as ScoreboardLayoutType;
  if (overlayConfig !== undefined) currentState.overlayConfig = { ...currentState.overlayConfig, ...overlayConfig };

  broadcastState();
  res.json({ success: true, match: currentState });
});

// 4. Update Score
app.post('/api/match/score', (req: Request, res: Response) => {
  const { team, delta, player, assist } = req.body as {
    team: 'home' | 'away';
    delta: number;
    player?: { name: string; number?: number; photoUrl?: string };
    assist?: string;
  };

  if (team === 'home') {
    currentState.homeScore = Math.max(0, currentState.homeScore + delta);
  } else if (team === 'away') {
    currentState.awayScore = Math.max(0, currentState.awayScore + delta);
  }

  // If score increased and player provided, record Goal Event & trigger Broadcast graphic
  if (delta > 0 && player?.name) {
    const currentMinute = Math.floor(currentState.timer.seconds / 60) + 1;
    const targetTeam = team === 'home' ? currentState.homeTeam : currentState.awayTeam;
    const foundPlayer = targetTeam.lineup?.find(
      (p) => p.name.toLowerCase() === player.name.toLowerCase() || p.number === player.number
    );
    const resolvedPhoto = player.photoUrl || foundPlayer?.photoUrl;

    const newEvent: MatchEvent = {
      id: `evt_${Date.now()}`,
      type: 'GOAL',
      team,
      minute: currentMinute,
      playerName: player.name,
      playerNumber: player.number || foundPlayer?.number,
      assistPlayerName: assist,
      timestamp: Date.now(),
    };
    currentState.events.push(newEvent);

    // Update shots and shots on target stats
    const teamStats = currentState.stats[team];
    teamStats.shots += 1;
    teamStats.shotsOnTarget += 1;

    // Trigger TV Goal Banner graphic with player photo
    currentState.graphic = {
      active: true,
      type: 'GOAL_BANNER',
      title: 'GOAL!',
      subtitle: `${targetTeam.name}`,
      team,
      playerName: player.name,
      playerNumber: player.number || foundPlayer?.number,
      playerPhoto: resolvedPhoto,
      assistPlayerName: assist,
      durationMs: 7000,
      triggeredAt: Date.now(),
    };
  }

  broadcastState();
  res.json({ success: true, match: currentState });
});

// 5. Timer Controls
app.post('/api/match/timer', (req: Request, res: Response) => {
  const { action, seconds, stoppageTime, period } = req.body as {
    action: 'start' | 'pause' | 'reset' | 'set_seconds' | 'set_stoppage' | 'set_period';
    seconds?: number;
    stoppageTime?: number;
    period?: MatchPeriod;
  };

  if (action === 'start') {
    currentState.timer.isRunning = true;
    currentState.timer.lastTickTimestamp = Date.now();
  } else if (action === 'pause') {
    currentState.timer.isRunning = false;
  } else if (action === 'reset') {
    currentState.timer.isRunning = false;
    currentState.timer.seconds = 0;
    currentState.timer.stoppageTime = 0;
  } else if (action === 'set_seconds' && typeof seconds === 'number') {
    currentState.timer.seconds = Math.max(0, seconds);
  } else if (action === 'set_stoppage' && typeof stoppageTime === 'number') {
    currentState.timer.stoppageTime = Math.max(0, stoppageTime);
  } else if (action === 'set_period' && period) {
    currentState.timer.period = period;
    // Smart preset minute based on period
    if (period === '1H') currentState.timer.seconds = 0;
    else if (period === 'HT') {
      currentState.timer.seconds = 45 * 60;
      currentState.timer.isRunning = false;
    } else if (period === '2H') currentState.timer.seconds = 45 * 60;
    else if (period === 'FT') {
      currentState.timer.seconds = 90 * 60;
      currentState.timer.isRunning = false;
    } else if (period === 'ET1') currentState.timer.seconds = 90 * 60;
    else if (period === 'ET2') currentState.timer.seconds = 105 * 60;
  }

  broadcastState();
  res.json({ success: true, timer: currentState.timer });
});

// 6. Match Events (Goal, Cards, Subs, VAR)
app.post('/api/match/events', (req: Request, res: Response) => {
  const eventData = req.body as Omit<MatchEvent, 'id' | 'timestamp'>;
  const newEvent: MatchEvent = {
    ...eventData,
    id: `evt_${Date.now()}`,
    timestamp: Date.now(),
  };

  currentState.events.push(newEvent);

  // Sync with stats
  const targetStats = currentState.stats[newEvent.team];
  if (newEvent.type === 'YELLOW_CARD') {
    targetStats.yellowCards += 1;
    currentState.graphic = {
      active: true,
      type: 'CARD_ALERT',
      cardColor: 'yellow',
      title: 'YELLOW CARD',
      team: newEvent.team,
      playerName: newEvent.playerName,
      playerNumber: newEvent.playerNumber,
      durationMs: 5000,
      triggeredAt: Date.now(),
    };
  } else if (newEvent.type === 'RED_CARD') {
    targetStats.redCards += 1;
    currentState.graphic = {
      active: true,
      type: 'CARD_ALERT',
      cardColor: 'red',
      title: 'RED CARD',
      team: newEvent.team,
      playerName: newEvent.playerName,
      playerNumber: newEvent.playerNumber,
      durationMs: 6000,
      triggeredAt: Date.now(),
    };
  } else if (newEvent.type === 'CORNER') {
    targetStats.corners += 1;
  } else if (newEvent.type === 'FOUL') {
    targetStats.fouls += 1;
  } else if (newEvent.type === 'OFFSIDE') {
    targetStats.offsides += 1;
  } else if (newEvent.type === 'SUBSTITUTION') {
    currentState.graphic = {
      active: true,
      type: 'SUBSTITUTION_BOARD',
      title: 'SUBSTITUTION',
      subtitle: newEvent.team === 'home' ? currentState.homeTeam.name : currentState.awayTeam.name,
      team: newEvent.team,
      playerIn: newEvent.playerIn,
      playerInNumber: newEvent.playerInNumber,
      playerOut: newEvent.playerOut,
      playerOutNumber: newEvent.playerOutNumber,
      durationMs: 7000,
      triggeredAt: Date.now(),
    };
  }

  broadcastState();
  res.json({ success: true, event: newEvent, match: currentState });
});

// 7. Delete/Undo Event
app.delete('/api/match/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = currentState.events.findIndex((e) => e.id === id);
  if (index !== -1) {
    const deleted = currentState.events[index];
    currentState.events.splice(index, 1);

    // Rollback stats
    const teamStats = currentState.stats[deleted.team];
    if (deleted.type === 'YELLOW_CARD') teamStats.yellowCards = Math.max(0, teamStats.yellowCards - 1);
    else if (deleted.type === 'RED_CARD') teamStats.redCards = Math.max(0, teamStats.redCards - 1);
    else if (deleted.type === 'CORNER') teamStats.corners = Math.max(0, teamStats.corners - 1);
    else if (deleted.type === 'FOUL') teamStats.fouls = Math.max(0, teamStats.fouls - 1);
    else if (deleted.type === 'OFFSIDE') teamStats.offsides = Math.max(0, teamStats.offsides - 1);

    broadcastState();
  }
  res.json({ success: true, match: currentState });
});

// 8. Update Live Statistics
app.post('/api/match/stats', (req: Request, res: Response) => {
  const { home, away } = req.body as { home?: Partial<TeamStats>; away?: Partial<TeamStats> };
  if (home) currentState.stats.home = { ...currentState.stats.home, ...home };
  if (away) currentState.stats.away = { ...currentState.stats.away, ...away };

  // Ensure possession sums to 100
  if (home?.possession !== undefined && away?.possession === undefined) {
    currentState.stats.away.possession = Math.max(0, 100 - currentState.stats.home.possession);
  } else if (away?.possession !== undefined && home?.possession === undefined) {
    currentState.stats.home.possession = Math.max(0, 100 - currentState.stats.away.possession);
  }

  broadcastState();
  res.json({ success: true, stats: currentState.stats });
});

// 9. Trigger or Hide Broadcast Graphics (Goal, VAR, Subs, Lower Third)
app.post('/api/match/graphic', (req: Request, res: Response) => {
  const graphic = req.body as BroadcastGraphic;
  currentState.graphic = {
    ...graphic,
    triggeredAt: Date.now(),
  };

  broadcastState();
  res.json({ success: true, graphic: currentState.graphic });
});

// 10. Penalty Shootout Management
app.post('/api/match/penalties', (req: Request, res: Response) => {
  const { action, roundIndex, team, result } = req.body as {
    action: 'kick' | 'reset';
    roundIndex?: number;
    team?: 'home' | 'away';
    result?: 'scored' | 'missed';
  };

  if (action === 'reset') {
    currentState.penalties = {
      homeScore: 0,
      awayScore: 0,
      homeKicks: ['pending', 'pending', 'pending', 'pending', 'pending'],
      awayKicks: ['pending', 'pending', 'pending', 'pending', 'pending'],
      currentTurn: 'home',
    };
  } else if (action === 'kick' && team && typeof roundIndex === 'number' && result) {
    if (team === 'home') {
      currentState.penalties.homeKicks[roundIndex] = result;
      if (result === 'scored') currentState.penalties.homeScore += 1;
      currentState.penalties.currentTurn = 'away';
    } else {
      currentState.penalties.awayKicks[roundIndex] = result;
      if (result === 'scored') currentState.penalties.awayScore += 1;
      currentState.penalties.currentTurn = 'home';
    }
  }

  broadcastState();
  res.json({ success: true, penalties: currentState.penalties });
});

// 11. Reset Match or Load Preset
app.post('/api/match/reset', (req: Request, res: Response) => {
  const { presetKey } = req.body as { presetKey?: string };

  if (presetKey && presetKey in PRESET_TEAMS) {
    // switch teams
    console.log('[Football Backend] Switching to preset:', presetKey);
  }

  currentState = {
    ...INITIAL_MATCH_STATE,
    id: `match_${Date.now()}`,
    updatedAt: Date.now(),
    timer: {
      seconds: 0,
      isRunning: false,
      stoppageTime: 0,
      period: '1H',
      lastTickTimestamp: Date.now(),
    },
    homeScore: 0,
    awayScore: 0,
    events: [],
    stats: {
      home: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0, passes: 0, passAccuracy: 0 },
      away: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0, passes: 0, passAccuracy: 0 },
    },
    penalties: {
      homeScore: 0,
      awayScore: 0,
      homeKicks: ['pending', 'pending', 'pending', 'pending', 'pending'],
      awayKicks: ['pending', 'pending', 'pending', 'pending', 'pending'],
      currentTurn: 'home',
    },
    graphic: { active: false, type: 'NONE', title: '' },
  };

  broadcastState();
  res.json({ success: true, match: currentState });
});

// 11b. Create New Match Fixture
app.post('/api/match/create', (req: Request, res: Response) => {
  const { competition, venue, referee, homeTeam, awayTeam, startPeriod } = req.body;

  currentState = {
    ...currentState,
    id: `match_${Date.now()}`,
    updatedAt: Date.now(),
    competition: competition || 'ITC Sports Football Match',
    venue: venue || 'Main Stadium',
    referee: referee || 'Head Referee',
    homeTeam: homeTeam || currentState.homeTeam,
    awayTeam: awayTeam || currentState.awayTeam,
    homeScore: 0,
    awayScore: 0,
    timer: {
      seconds: 0,
      isRunning: false,
      stoppageTime: 0,
      period: startPeriod || '1H',
      lastTickTimestamp: Date.now(),
    },
    events: [],
    stats: {
      home: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0, passes: 0, passAccuracy: 0 },
      away: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0, passes: 0, passAccuracy: 0 },
    },
    penalties: {
      homeScore: 0,
      awayScore: 0,
      homeKicks: ['pending', 'pending', 'pending', 'pending', 'pending'],
      awayKicks: ['pending', 'pending', 'pending', 'pending', 'pending'],
      currentTurn: 'home',
    },
    graphic: { active: false, type: 'NONE', title: '' },
  };

  broadcastState();
  res.json({ success: true, match: currentState });
});

// Custom Teams Persistent Storage
const CUSTOM_TEAMS_FILE = path.join(DATA_DIR, 'custom_teams.json');
let customTeams: Record<string, Team> = {};

try {
  if (fs.existsSync(CUSTOM_TEAMS_FILE)) {
    const raw = fs.readFileSync(CUSTOM_TEAMS_FILE, 'utf-8');
    customTeams = JSON.parse(raw);
    console.log('[ITC Sports Server] Loaded custom teams from file');
  }
} catch (e) {
  console.warn('Failed to load custom teams:', e);
}

const DELETED_TEAMS_FILE = path.join(DATA_DIR, 'deleted_teams.json');
let deletedTeamIds: string[] = [];
try {
  if (fs.existsSync(DELETED_TEAMS_FILE)) {
    deletedTeamIds = JSON.parse(fs.readFileSync(DELETED_TEAMS_FILE, 'utf-8'));
  }
} catch (e) {
  deletedTeamIds = [];
}

function saveDeletedTeamIds() {
  try {
    fs.writeFileSync(DELETED_TEAMS_FILE, JSON.stringify(deletedTeamIds, null, 2), 'utf-8');
  } catch (err) {
    console.error('File write exception for deleted teams:', err);
  }
}

function saveCustomTeams() {
  try {
    fs.writeFileSync(CUSTOM_TEAMS_FILE, JSON.stringify(customTeams, null, 2), 'utf-8');
  } catch (err) {
    console.error('File write exception for custom teams:', err);
  }
}

function getFilteredTeams(): Record<string, Team> {
  const merged: Record<string, Team> = { ...PRESET_TEAMS, ...customTeams };
  for (const id of deletedTeamIds) {
    delete merged[id];
  }
  return merged;
}

// 12. Get All Teams (Presets + User Custom Teams minus deleted)
app.get('/api/teams', (req: Request, res: Response) => {
  res.json({ success: true, teams: getFilteredTeams() });
});

app.get('/api/presets', (req: Request, res: Response) => {
  res.json({ success: true, presets: getFilteredTeams() });
});

// 13. Create or Update a Complete Team
app.post('/api/teams', (req: Request, res: Response) => {
  const teamData = req.body as Team;
  if (!teamData || !teamData.name) {
    res.status(400).json({ success: false, error: 'Team name is required' });
    return;
  }

  const teamId = teamData.id || `team_${Date.now()}`;
  const completeTeam: Team = {
    ...teamData,
    id: teamId,
    shortName: teamData.shortName || teamData.name.slice(0, 3).toUpperCase(),
    code: teamData.code || teamData.shortName || teamData.name.slice(0, 3).toUpperCase(),
    primaryColor: teamData.primaryColor || '#1e40af',
    secondaryColor: teamData.secondaryColor || '#ffffff',
    textColor: teamData.textColor || '#ffffff',
    crest: teamData.crest || '⚽',
    lineup: teamData.lineup || [],
  };

  // Remove from deleted list if re-added
  if (deletedTeamIds.includes(teamId)) {
    deletedTeamIds = deletedTeamIds.filter((d) => d !== teamId);
    saveDeletedTeamIds();
  }

  customTeams[teamId] = completeTeam;
  saveCustomTeams();

  // If currently active match is using this team, update live match too
  if (currentState.homeTeam.id === teamId) {
    currentState.homeTeam = completeTeam;
    broadcastState();
  } else if (currentState.awayTeam.id === teamId) {
    currentState.awayTeam = completeTeam;
    broadcastState();
  }

  res.json({ success: true, team: completeTeam });
});

// 14. Delete Any Team by ID
app.delete('/api/teams/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // Add to deleted team list
  if (!deletedTeamIds.includes(id)) {
    deletedTeamIds.push(id);
    saveDeletedTeamIds();
  }

  if (customTeams[id]) {
    delete customTeams[id];
    saveCustomTeams();
  }

  // If deleted team is active in match, provide a clean fallback
  if (currentState.homeTeam.id === id) {
    currentState.homeTeam = {
      id: `team_${Date.now()}_home`,
      name: 'Home Team',
      shortName: 'HOM',
      code: 'HOM',
      primaryColor: '#2563eb',
      secondaryColor: '#050505',
      textColor: '#ffffff',
      crest: '⚽',
      lineup: [],
    };
    broadcastState();
  }
  if (currentState.awayTeam.id === id) {
    currentState.awayTeam = {
      id: `team_${Date.now()}_away`,
      name: 'Away Team',
      shortName: 'AWY',
      code: 'AWY',
      primaryColor: '#dc2626',
      secondaryColor: '#ffffff',
      textColor: '#ffffff',
      crest: '⚡',
      lineup: [],
    };
    broadcastState();
  }

  res.json({ success: true, teams: getFilteredTeams() });
});

// 14b. Delete all teams from library
app.delete('/api/teams', (req: Request, res: Response) => {
  const allIds = Object.keys({ ...PRESET_TEAMS, ...customTeams });
  deletedTeamIds = Array.from(new Set([...deletedTeamIds, ...allIds]));
  saveDeletedTeamIds();
  customTeams = {};
  saveCustomTeams();
  res.json({ success: true, teams: {} });
});

// 15. Clear all players from a team
app.post('/api/teams/:id/clear-players', (req: Request, res: Response) => {
  const { id } = req.params;
  if (customTeams[id]) {
    customTeams[id].lineup = [];
    saveCustomTeams();
  }
  if (currentState.homeTeam.id === id) {
    currentState.homeTeam.lineup = [];
  }
  if (currentState.awayTeam.id === id) {
    currentState.awayTeam.lineup = [];
  }
  broadcastState();
  res.json({ success: true });
});

// 15. Set Team as Home or Away in Active Match
app.post('/api/match/set-team', (req: Request, res: Response) => {
  const { slot, teamId, team } = req.body as {
    slot: 'home' | 'away';
    teamId?: string;
    team?: Team;
  };

  const allTeams = { ...PRESET_TEAMS, ...customTeams };
  const targetTeam = team || (teamId ? allTeams[teamId] : null);

  if (!targetTeam) {
    res.status(400).json({ success: false, error: 'Target team not found' });
    return;
  }

  if (slot === 'home') {
    currentState.homeTeam = targetTeam;
  } else {
    currentState.awayTeam = targetTeam;
  }

  broadcastState();
  res.json({ success: true, match: currentState });
});

// Start Server with Vite Integration
async function startServer() {
  if (!isProduction) {
    // Create Vite server in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ITC Sports Server] Running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ITC Sports Server] Startup failure:', err);
});
