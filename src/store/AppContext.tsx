import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction, GamificationState } from './types';

// ====== XP & LEVEL SYSTEM ======
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100;
}

// ====== DEFAULT STATE ======
const defaultGamification: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastEntryDate: '',
  unlockedThemes: ['default'],
  unlockedSounds: [],
  achievements: [],
};

const defaultState: AppState = {
  tasks: [],
  emotions: [],
  sprints: [],
  meditations: [],
  delays: [],
  daySplits: [
    { dayIndex: 0, sphere: 'Программирование', color: '#00f0ff' },
    { dayIndex: 1, sphere: 'Творчество', color: '#8b5cf6' },
    { dayIndex: 2, sphere: 'Бизнес', color: '#f59e0b' },
    { dayIndex: 3, sphere: 'Спорт', color: '#00ff88' },
    { dayIndex: 4, sphere: 'Обучение', color: '#ff3366' },
    { dayIndex: 5, sphere: 'Личное', color: '#d0bcff' },
    { dayIndex: 6, sphere: 'Отдых', color: '#849495' },
  ],
  habits: [
    { id: '1', name: 'Контрастный душ', icon: '🚿', checkedDates: [] },
    { id: '2', name: 'Чтение 30 мин', icon: '📖', checkedDates: [] },
    { id: '3', name: 'Без гаджетов утром', icon: '📵', checkedDates: [] },
    { id: '4', name: 'Тренировка', icon: '💪', checkedDates: [] },
  ],
  gamification: defaultGamification,
  spheres: ['Программирование', 'Творчество', 'Бизнес', 'Спорт', 'Обучение', 'Личное', 'Отдых'],
  activeTab: 'dashboard',
};

// ====== REDUCER ======
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'TOGGLE_TASK_COMPLETION':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id ? { ...t, completed: !t.completed } : t
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.id),
      };

    case 'ADD_EMOTION': {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = state.gamification.lastEntryDate !== today;
      const wasYesterday = (() => {
        if (!state.gamification.lastEntryDate) return false;
        const last = new Date(state.gamification.lastEntryDate);
        const now = new Date(today);
        const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        return diff === 1;
      })();
      const newStreak = isNewDay ? (wasYesterday ? state.gamification.streak + 1 : 1) : state.gamification.streak;
      const bonusXP = action.entry.text.length > 100 ? 25 : 0;
      const streakBonus = newStreak >= 7 ? 20 : newStreak >= 3 ? 10 : 0;
      const totalXP = 50 + bonusXP + streakBonus;
      const newXP = state.gamification.xp + totalXP;
      const newLevel = calculateLevel(newXP);

      const newSounds = [...state.gamification.unlockedSounds];
      const newThemes = [...state.gamification.unlockedThemes];
      if (newLevel >= 3 && !newSounds.includes('lofi')) newSounds.push('lofi');
      if (newLevel >= 5 && !newSounds.includes('rain')) newSounds.push('rain');
      if (newLevel >= 7 && !newSounds.includes('ocean')) newSounds.push('ocean');
      if (newLevel >= 2 && !newThemes.includes('neon-zen')) newThemes.push('neon-zen');
      if (newLevel >= 4 && !newThemes.includes('cyberpunk-dusk')) newThemes.push('cyberpunk-dusk');
      if (newLevel >= 6 && !newThemes.includes('emerald-forest')) newThemes.push('emerald-forest');

      return {
        ...state,
        emotions: [...state.emotions, action.entry],
        gamification: {
          ...state.gamification,
          xp: newXP,
          level: newLevel,
          streak: newStreak,
          lastEntryDate: today,
          unlockedSounds: newSounds,
          unlockedThemes: newThemes,
        },
      };
    }

    case 'DELETE_EMOTION':
      return {
        ...state,
        emotions: state.emotions.filter(e => e.id !== action.id),
      };

    case 'ADD_SPRINT':
      return { ...state, sprints: [...state.sprints, action.session] };

    case 'ADD_MEDITATION':
      return { ...state, meditations: [...state.meditations, action.session] };

    case 'ADD_DELAY':
      return { ...state, delays: [...state.delays, action.entry] };

    case 'SET_DAY_SPLITS':
      return { ...state, daySplits: action.splits };

    case 'ADD_SPHERE':
      if (state.spheres.includes(action.sphere)) return state;
      return { ...state, spheres: [...state.spheres, action.sphere] };

    case 'REMOVE_SPHERE':
      return { ...state, spheres: state.spheres.filter(s => s !== action.sphere) };

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] };

    case 'TOGGLE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => {
          if (h.id !== action.id) return h;
          const dates = h.checkedDates.includes(action.date)
            ? h.checkedDates.filter(d => d !== action.date)
            : [...h.checkedDates, action.date];
          return { ...h, checkedDates: dates };
        }),
      };

    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.id) };

    case 'ADD_XP': {
      const newXP = state.gamification.xp + action.amount;
      return {
        ...state,
        gamification: {
          ...state.gamification,
          xp: newXP,
          level: calculateLevel(newXP),
        },
      };
    }

    case 'UPDATE_ACHIEVEMENT': {
      const exists = state.gamification.achievements.find(a => a.id === action.id);
      let newAchievements;
      if (exists) {
        newAchievements = state.gamification.achievements.map(a => 
          a.id === action.id ? { ...a, level: action.level } : a
        );
      } else {
        newAchievements = [...state.gamification.achievements, { id: action.id, level: action.level }];
      }
      return {
        ...state,
        gamification: {
          ...state.gamification,
          achievements: newAchievements
        }
      };
    }

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}

// ====== CONTEXT ======
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: defaultState,
  dispatch: () => undefined,
});

// ====== PROVIDER ======
const STORAGE_KEY = 'mogger-app-state';

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return defaultState;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppContext);
}

// ====== SELECTORS ======
export function getCognitiveLoad(tasks: AppState['tasks']): number {
  const activeTasks = tasks.filter(t => !t.completed);
  let load = 0;
  for (const t of activeTasks) {
    load += t.category === 'immediate' ? 3 : 10;
  }
  return Math.min(load, 100);
}

export function getLoadStatus(load: number): {
  label: string;
  color: string;
  level: 'clear' | 'moderate' | 'high' | 'overload';
} {
  if (load <= 30) return { label: 'МЕНТАЛЬНАЯ ЯСНОСТЬ', color: '#00ff88', level: 'clear' };
  if (load <= 70) return { label: 'УМЕРЕННАЯ НАГРУЗКА', color: '#f59e0b', level: 'moderate' };
  if (load <= 90) return { label: 'ВЫСОКАЯ НАГРУЗКА', color: '#8b5cf6', level: 'high' };
  return { label: 'ПЕРЕГРУЗКА!', color: '#ff3366', level: 'overload' };
}

export function getTodaySphere(splits: AppState['daySplits']): AppState['daySplits'][0] | undefined {
  const dayIndex = (new Date().getDay() + 6) % 7; // Convert Sun=0 to Mon=0
  return splits.find(s => s.dayIndex === dayIndex);
}
