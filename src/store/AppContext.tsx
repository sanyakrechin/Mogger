import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction, GamificationState, DayTemplate, WeekAssignment } from './types';

// ====== XP & LEVEL SYSTEM ======
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100;
}

// ====== DEFAULT TEMPLATES ======
const defaultTemplates: DayTemplate[] = [
  {
    id: 'tpl-it',
    name: 'IT-ДЕНЬ',
    color: '#00f0ff',
    icon: '💻',
    defaultTasks: ['Написать код / коммит в проект', 'Пройти урок или документацию', 'Решить задачу на алгоритмы'],
  },
  {
    id: 'tpl-sport',
    name: 'СПОРТ',
    color: '#00ff88',
    icon: '💪',
    defaultTasks: ['Тренировка (основная)', 'Растяжка / разминка', 'Контрастный душ'],
  },
  {
    id: 'tpl-creative',
    name: 'ТВОРЧЕСТВО',
    color: '#8b5cf6',
    icon: '🎨',
    defaultTasks: ['Работа над творческим проектом', 'Изучить референсы / вдохновение', 'Практика навыка'],
  },
  {
    id: 'tpl-business',
    name: 'БИЗНЕС',
    color: '#f59e0b',
    icon: '📈',
    defaultTasks: ['Работа над бизнес-задачей', 'Нетворкинг / переговоры', 'Анализ метрик'],
  },
  {
    id: 'tpl-study',
    name: 'ОБУЧЕНИЕ',
    color: '#ff3366',
    icon: '📚',
    defaultTasks: ['Чтение / изучение материала', 'Конспект / заметки', 'Практика изученного'],
  },
  {
    id: 'tpl-personal',
    name: 'ЛИЧНОЕ',
    color: '#d0bcff',
    icon: '🧘',
    defaultTasks: ['Время для себя', 'Медитация / рефлексия'],
  },
  {
    id: 'tpl-rest',
    name: 'ОТДЫХ',
    color: '#849495',
    icon: '☁️',
    defaultTasks: ['Прогулка', 'Хобби без экранов'],
  },
];

const defaultWeekAssignments: WeekAssignment[] = [
  { dayIndex: 0, templateId: 'tpl-it' },
  { dayIndex: 1, templateId: 'tpl-creative' },
  { dayIndex: 2, templateId: 'tpl-business' },
  { dayIndex: 3, templateId: 'tpl-sport' },
  { dayIndex: 4, templateId: 'tpl-study' },
  { dayIndex: 5, templateId: 'tpl-personal' },
  { dayIndex: 6, templateId: 'tpl-rest' },
];

// ====== DEFAULT STATE ======
const defaultGamification: GamificationState = {
  xp: 0,
  level: 1,
  streak: 3, // Initial streak for testing UI
  lastEntryDate: new Date().toISOString().split('T')[0],
  coins: 250,
  activeTheme: 'cyber-dark',
  unlockedThemes: ['cyber-dark'],
  unlockedSounds: [],
  purchasedGiftIds: ['g-coffee'],
  equippedGiftIds: ['g-coffee'],
  achievements: [
    { id: 'first_split', level: 1 },
    { id: 'streak_3', level: 1 }
  ],
  pushNotificationsEnabled: true,
  pushStyle: 'aggressive',
  weeklyQuest: {
    id: 'wq-101',
    title: 'БОСС-КВЕСТ: СУПЕР-ФОКУС РАЗРАБОТЧИКА',
    description: 'Выполнить 3 Спринт-Фокуса (по 60 мин) и закрыть 100% сплитов за текущую неделю.',
    targetSphere: 'IT-ДЕНЬ',
    rewardCoins: 500,
    rewardGiftId: 'g-trophy-1',
    status: 'active'
  }
};

const defaultState: AppState = {
  templates: defaultTemplates,
  weekAssignments: defaultWeekAssignments,
  dayInstances: [],
  habits: [
    { id: '1', name: 'Контрастный душ', icon: '🚿', checkedDates: [] },
    { id: '2', name: 'Чтение 30 мин', icon: '📖', checkedDates: [] },
    { id: '3', name: 'Без гаджетов утром', icon: '📵', checkedDates: [] },
    { id: '4', name: 'Тренировка', icon: '💪', checkedDates: [] },
  ],
  emotions: [],
  sprints: [],
  meditations: [],
  delays: [],
  gamification: defaultGamification,
  activeTab: 'home',
};

// ====== REDUCER ======
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    // ── Templates ──
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.template] };

    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(t =>
          t.id === action.template.id ? action.template : t
        ),
      };

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.id),
        weekAssignments: state.weekAssignments.filter(a => a.templateId !== action.id),
      };

    // ── Week Assignments ──
    case 'SET_WEEK_ASSIGNMENT': {
      const existing = state.weekAssignments.find(a => a.dayIndex === action.dayIndex);
      if (existing) {
        return {
          ...state,
          weekAssignments: state.weekAssignments.map(a =>
            a.dayIndex === action.dayIndex ? { ...a, templateId: action.templateId } : a
          ),
        };
      }
      return {
        ...state,
        weekAssignments: [...state.weekAssignments, { dayIndex: action.dayIndex, templateId: action.templateId }],
      };
    }

    case 'REMOVE_WEEK_ASSIGNMENT':
      return {
        ...state,
        weekAssignments: state.weekAssignments.filter(a => a.dayIndex !== action.dayIndex),
      };

    // ── Day Instances ──
    case 'INIT_DAY': {
      const exists = state.dayInstances.find(d => d.date === action.date);
      if (exists) return state;
      const template = state.templates.find(t => t.id === action.templateId);
      const tasks = template
        ? template.defaultTasks.map((title, i) => ({
            id: `${action.date}-default-${i}`,
            title,
            isDefault: true,
            completed: false,
          }))
        : [];
      return {
        ...state,
        dayInstances: [
          ...state.dayInstances,
          { date: action.date, templateId: action.templateId, tasks, completed: false },
        ],
      };
    }

    case 'ADD_DAY_TASK': {
      return {
        ...state,
        dayInstances: state.dayInstances.map(d =>
          d.date === action.date
            ? { ...d, tasks: [...d.tasks, action.task] }
            : d
        ),
      };
    }

    case 'TOGGLE_DAY_TASK':
      return {
        ...state,
        dayInstances: state.dayInstances.map(d =>
          d.date === action.date
            ? {
                ...d,
                tasks: d.tasks.map(t =>
                  t.id === action.taskId ? { ...t, completed: !t.completed } : t
                ),
              }
            : d
        ),
      };

    case 'DELETE_DAY_TASK':
      return {
        ...state,
        dayInstances: state.dayInstances.map(d =>
          d.date === action.date
            ? { ...d, tasks: d.tasks.filter(t => t.id !== action.taskId) }
            : d
        ),
      };

    case 'COMPLETE_DAY':
      return {
        ...state,
        dayInstances: state.dayInstances.map(d =>
          d.date === action.date ? { ...d, completed: true } : d
        ),
      };

    // ── Habits ──
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

    // ── Emotions ──
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

      return {
        ...state,
        emotions: [...state.emotions, action.entry],
        gamification: {
          ...state.gamification,
          xp: newXP,
          level: newLevel,
          streak: newStreak,
          lastEntryDate: today,
        },
      };
    }

    case 'DELETE_EMOTION': {
      const emotionToDelete = state.emotions.find(e => e.id === action.id);
      if (!emotionToDelete) return state;
      const bonusXP = emotionToDelete.text.length > 100 ? 25 : 0;
      const xpToDeduct = 50 + bonusXP;
      const newXP = Math.max(0, state.gamification.xp - xpToDeduct);
      return {
        ...state,
        emotions: state.emotions.filter(e => e.id !== action.id),
        gamification: {
          ...state.gamification,
          xp: newXP,
          level: calculateLevel(newXP),
        },
      };
    }

    // ── Training ──
    case 'ADD_SPRINT':
      return { ...state, sprints: [...state.sprints, action.session] };

    case 'ADD_MEDITATION':
      return { ...state, meditations: [...state.meditations, action.session] };

    case 'ADD_DELAY':
      return { ...state, delays: [...state.delays, action.entry] };

    // ── Gamification ──
    case 'ADD_XP': {
      const newXP = Math.max(0, state.gamification.xp + action.amount);
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
          achievements: newAchievements,
        },
      };
    }

    case 'ADD_COINS': {
      return {
        ...state,
        gamification: {
          ...state.gamification,
          coins: Math.max(0, state.gamification.coins + action.amount),
        },
      };
    }

    case 'SET_THEME': {
      return {
        ...state,
        gamification: {
          ...state.gamification,
          activeTheme: action.themeId,
        },
      };
    }

    case 'BUY_GIFT': {
      if (state.gamification.coins < action.price) return state;
      if (state.gamification.purchasedGiftIds.includes(action.giftId)) return state;
      return {
        ...state,
        gamification: {
          ...state.gamification,
          coins: state.gamification.coins - action.price,
          purchasedGiftIds: [...state.gamification.purchasedGiftIds, action.giftId],
        },
      };
    }

    case 'EQUIP_GIFT': {
      const isEquipped = state.gamification.equippedGiftIds.includes(action.giftId);
      let newEquipped = [...state.gamification.equippedGiftIds];
      if (isEquipped) {
        newEquipped = newEquipped.filter(id => id !== action.giftId);
      } else {
        if (newEquipped.length >= 3) {
          newEquipped.shift(); // keep max 3 gifts in showcase
        }
        newEquipped.push(action.giftId);
      }
      return {
        ...state,
        gamification: {
          ...state.gamification,
          equippedGiftIds: newEquipped,
        },
      };
    }

    case 'SUBMIT_WEEKLY_QUEST': {
      if (!state.gamification.weeklyQuest) return state;
      return {
        ...state,
        gamification: {
          ...state.gamification,
          weeklyQuest: {
            ...state.gamification.weeklyQuest,
            status: 'submitted',
            submittedProofText: action.proofText,
          },
        },
      };
    }

    case 'CLAIM_WEEKLY_QUEST_REWARD': {
      if (!state.gamification.weeklyQuest) return state;
      const quest = state.gamification.weeklyQuest;
      const rewardGift = quest.rewardGiftId;
      const purchased = state.gamification.purchasedGiftIds.includes(rewardGift)
        ? state.gamification.purchasedGiftIds
        : [...state.gamification.purchasedGiftIds, rewardGift];
      
      return {
        ...state,
        gamification: {
          ...state.gamification,
          coins: state.gamification.coins + quest.rewardCoins,
          purchasedGiftIds: purchased,
          weeklyQuest: {
            ...quest,
            status: 'completed',
          },
        },
      };
    }

    case 'TOGGLE_PUSH_NOTIFICATIONS': {
      return {
        ...state,
        gamification: {
          ...state.gamification,
          pushNotificationsEnabled: action.enabled !== undefined ? action.enabled : !state.gamification.pushNotificationsEnabled,
          pushStyle: action.style || state.gamification.pushStyle,
        },
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
const STORAGE_KEY = 'mogger-v2-state';

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

// ====== HELPERS ======
export function getTodayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayIndex(): number {
  return (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
}

export function getDateIndex(dateStr: string): number {
  return (new Date(dateStr).getDay() + 6) % 7;
}
