import { createContext, useContext, useReducer } from 'react';

const initialState = {
  phase: 'cover',
  currentAct: 1,
  stats: { economy: 40, politics: 50, support: 45, innovation: 30 },
  year: 1979,
  season: '春',
  eventIndex: 0,
  eventQueue: [],
  buildings: [],
  history: [],
  decisions: [],
  flags: [],
  blastProgress: 0,
  reformPoints: { port: 0, industry: 0, housing: 0, commerce: 0 },
  newsQueue: [],
  showNews: false,
  currentNews: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'APPLY_DECISION': {
      const { effects, label } = action.payload;
      const newStats = { ...state.stats };
      for (const [key, delta] of Object.entries(effects)) {
        newStats[key] = Math.max(0, Math.min(100, newStats[key] + delta));
      }
      return {
        ...state,
        stats: newStats,
        history: [...state.history, { label, effects, year: state.year, season: state.season }],
      };
    }

    case 'RECORD_DECISION':
      return {
        ...state,
        decisions: [...state.decisions, action.payload],
      };

    case 'SET_FLAG': {
      const flag = action.payload;
      if (state.flags.includes(flag)) return state;
      return { ...state, flags: [...state.flags, flag] };
    }

    case 'SET_FLAGS': {
      const newFlags = action.payload.filter(f => !state.flags.includes(f));
      if (newFlags.length === 0) return state;
      return { ...state, flags: [...state.flags, ...newFlags] };
    }

    case 'REMOVE_FLAG':
      return { ...state, flags: state.flags.filter(f => f !== action.payload) };

    case 'REMOVE_FLAGS':
      return { ...state, flags: state.flags.filter(f => !action.payload.includes(f)) };

    case 'SET_EVENT_QUEUE':
      return { ...state, eventQueue: action.payload, eventIndex: 0 };

    case 'NEXT_EVENT':
      return { ...state, eventIndex: state.eventIndex + 1 };

    case 'START_ACT': {
      const actYears = { 1: 1979, 2: 1980, 3: 1983, 4: 1985 };
      return {
        ...state,
        currentAct: action.payload,
        eventIndex: 0,
        year: actYears[action.payload] || state.year,
        season: '春',
      };
    }

    case 'ADVANCE_SEASON': {
      const seasons = ['春', '夏', '秋', '冬'];
      const idx = seasons.indexOf(state.season);
      if (idx === 3) {
        return { ...state, season: '春', year: state.year + 1 };
      }
      return { ...state, season: seasons[idx + 1] };
    }

    case 'SET_BLAST_PROGRESS':
      return { ...state, blastProgress: action.payload };

    case 'ADD_BUILDING':
      return { ...state, buildings: [...state.buildings, action.payload] };

    case 'SET_REFORM_POINTS':
      return { ...state, reformPoints: action.payload };

    case 'SHOW_NEWS':
      return { ...state, showNews: true, currentNews: action.payload };

    case 'HIDE_NEWS':
      return { ...state, showNews: false, currentNews: null };

    default:
      return state;
  }
}

const GameContext = createContext(null);
const GameDispatchContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}

export function useGameDispatch() {
  return useContext(GameDispatchContext);
}
