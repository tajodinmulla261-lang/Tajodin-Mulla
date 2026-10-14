import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchState, MatchEvent, TeamStats, BroadcastGraphic, MatchPeriod, ScoreboardLayoutType, Team } from '../types/match';
import { INITIAL_MATCH_STATE } from '../server/defaultData';

export function useMatchSync() {
  const [match, setMatch] = useState<MatchState>(INITIAL_MATCH_STATE);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE stream
  useEffect(() => {
    let reconnectTimeout: any = null;

    function connectSSE() {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const es = new EventSource('/api/match/stream');
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
          setLastError(null);
        };

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.id) {
              setMatch(data);
            }
          } catch (err) {
            console.error('Failed to parse SSE payload:', err);
          }
        };

        es.onerror = () => {
          setIsConnected(false);
          es.close();
          // Attempt reconnect after 2 seconds
          reconnectTimeout = setTimeout(connectSSE, 2000);
        };
      } catch (err: any) {
        setLastError(err.message || 'SSE connection error');
        reconnectTimeout = setTimeout(connectSSE, 3000);
      }
    }

    connectSSE();

    // Also fallback polling in case SSE is blocked by proxies
    const pollingInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/match');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.match) {
            setMatch((prev) => {
              // Only update if server state is newer or timer progressed
              if (json.match.updatedAt >= prev.updatedAt || Math.abs(json.match.timer.seconds - prev.timer.seconds) > 1) {
                return json.match;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        // quiet fallback
      }
    }, 2000);

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(pollingInterval);
    };
  }, []);

  // Update Score
  const updateScore = useCallback(
    async (
      team: 'home' | 'away',
      delta: number,
      player?: { name: string; number?: number },
      assist?: string
    ) => {
      // Optimistic update
      setMatch((prev) => {
        const next = { ...prev };
        if (team === 'home') next.homeScore = Math.max(0, next.homeScore + delta);
        else next.awayScore = Math.max(0, next.awayScore + delta);
        return next;
      });

      try {
        const res = await fetch('/api/match/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ team, delta, player, assist }),
        });
        const data = await res.json();
        if (data.success && data.match) {
          setMatch(data.match);
        }
      } catch (err) {
        console.error('Failed to update score:', err);
      }
    },
    []
  );

  // Update Timer
  const updateTimer = useCallback(
    async (
      action: 'start' | 'pause' | 'reset' | 'set_seconds' | 'set_stoppage' | 'set_period',
      params?: { seconds?: number; stoppageTime?: number; period?: MatchPeriod }
    ) => {
      // Optimistic
      setMatch((prev) => {
        const nextTimer = { ...prev.timer };
        if (action === 'start') nextTimer.isRunning = true;
        if (action === 'pause') nextTimer.isRunning = false;
        if (action === 'reset') {
          nextTimer.isRunning = false;
          nextTimer.seconds = 0;
          nextTimer.stoppageTime = 0;
        }
        if (action === 'set_seconds' && typeof params?.seconds === 'number') nextTimer.seconds = params.seconds;
        if (action === 'set_stoppage' && typeof params?.stoppageTime === 'number') nextTimer.stoppageTime = params.stoppageTime;
        if (action === 'set_period' && params?.period) nextTimer.period = params.period;

        return { ...prev, timer: nextTimer };
      });

      try {
        await fetch('/api/match/timer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...params }),
        });
      } catch (err) {
        console.error('Failed to control timer:', err);
      }
    },
    []
  );

  // Add Match Event
  const addEvent = useCallback(
    async (eventData: Omit<MatchEvent, 'id' | 'timestamp'>) => {
      try {
        const res = await fetch('/api/match/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        const data = await res.json();
        if (data.success && data.match) {
          setMatch(data.match);
        }
      } catch (err) {
        console.error('Failed to add event:', err);
      }
    },
    []
  );

  // Delete Match Event (Undo)
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const res = await fetch(`/api/match/events/${eventId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.match) {
        setMatch(data.match);
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  }, []);

  // Update Stats
  const updateStats = useCallback(
    async (statsPayload: { home?: Partial<TeamStats>; away?: Partial<TeamStats> }) => {
      try {
        const res = await fetch('/api/match/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statsPayload),
        });
        const data = await res.json();
        if (data.success && data.stats) {
          setMatch((prev) => ({ ...prev, stats: data.stats }));
        }
      } catch (err) {
        console.error('Failed to update stats:', err);
      }
    },
    []
  );

  // Trigger Broadcast Graphic (Goal, VAR, Subs, Cards, Lower Third)
  const triggerGraphic = useCallback(async (graphic: BroadcastGraphic) => {
    try {
      const res = await fetch('/api/match/graphic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphic),
      });
      const data = await res.json();
      if (data.success && data.graphic) {
        setMatch((prev) => ({ ...prev, graphic: data.graphic }));
      }
    } catch (err) {
      console.error('Failed to trigger graphic:', err);
    }
  }, []);

  // Update Match Details (Teams, Layout, Venue, etc.)
  const updateMatchDetails = useCallback(
    async (details: {
      competition?: string;
      venue?: string;
      referee?: string;
      homeTeam?: Partial<Team>;
      awayTeam?: Partial<Team>;
      layout?: ScoreboardLayoutType;
      overlayConfig?: Partial<MatchState['overlayConfig']>;
    }) => {
      try {
        const res = await fetch('/api/match/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(details),
        });
        const data = await res.json();
        if (data.success && data.match) {
          setMatch(data.match);
        }
      } catch (err) {
        console.error('Failed to update match details:', err);
      }
    },
    []
  );

  // Penalty kick update
  const recordPenaltyKick = useCallback(
    async (payload: {
      action: 'kick' | 'reset';
      roundIndex?: number;
      team?: 'home' | 'away';
      result?: 'scored' | 'missed';
    }) => {
      try {
        const res = await fetch('/api/match/penalties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.penalties) {
          setMatch((prev) => ({ ...prev, penalties: data.penalties }));
        }
      } catch (err) {
        console.error('Failed to record penalty kick:', err);
      }
    },
    []
  );

  // Reset Match
  const resetMatch = useCallback(async (presetKey?: string) => {
    try {
      const res = await fetch('/api/match/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetKey }),
      });
      const data = await res.json();
      if (data.success && data.match) {
        setMatch(data.match);
      }
    } catch (err) {
      console.error('Failed to reset match:', err);
    }
  }, []);

  // Teams Library State
  const [teamsLibrary, setTeamsLibrary] = useState<Record<string, Team>>({});

  const loadTeams = useCallback(async () => {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.teams) {
          setTeamsLibrary(json.teams);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch teams:', e);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Save / Create Team
  const saveTeam = useCallback(async (team: Team) => {
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
      });
      const data = await res.json();
      if (data.success && data.team) {
        setTeamsLibrary((prev) => ({ ...prev, [data.team.id]: data.team }));
      }
    } catch (e) {
      console.error('Failed to save team:', e);
    }
  }, []);

  // Delete Team
  const deleteTeam = useCallback(async (teamId: string) => {
    // Immediate optimistic removal from UI
    setTeamsLibrary((prev) => {
      const next = { ...prev };
      delete next[teamId];
      return next;
    });

    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.teams) {
        setTeamsLibrary(data.teams);
      }
    } catch (e) {
      console.error('Failed to delete team:', e);
      loadTeams();
    }
  }, [loadTeams]);

  // Set Active Match Team
  const setMatchTeam = useCallback(async (slot: 'home' | 'away', teamId?: string, team?: Team) => {
    try {
      const res = await fetch('/api/match/set-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot, teamId, team }),
      });
      const data = await res.json();
      if (data.success && data.match) {
        setMatch(data.match);
      }
    } catch (e) {
      console.error('Failed to set match team:', e);
    }
  }, []);

  // Create New Match Fixture
  const createMatch = useCallback(async (matchConfig: any) => {
    try {
      const res = await fetch('/api/match/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchConfig),
      });
      const data = await res.json();
      if (data.success && data.match) {
        setMatch(data.match);
      }
    } catch (err) {
      console.error('Failed to create match:', err);
    }
  }, []);

  return {
    match,
    isConnected,
    lastError,
    teamsLibrary,
    loadTeams,
    saveTeam,
    deleteTeam,
    setMatchTeam,
    createMatch,
    updateScore,
    updateTimer,
    addEvent,
    deleteEvent,
    updateStats,
    triggerGraphic,
    updateMatchDetails,
    recordPenaltyKick,
    resetMatch,
  };
}
