// ====== TASK SYSTEM ======
export type TaskCategory = 'immediate' | 'scheduled';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  sphere: string;
  completed: boolean;
  createdAt: string;
}

// ====== EMOTION JOURNAL ======
export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface EmotionEntry {
  id: string;
  text: string;
  mood: MoodType;
  createdAt: string;
}

// ====== BRAIN TRAINING ======
export interface SprintSession {
  id: string;
  taskTitle: string;
  durationMinutes: number;
  completedAt: string;
}

export interface MeditationSession {
  id: string;
  durationSeconds: number;
  completedAt: string;
}

export interface DelayEntry {
  id: string;
  urge: string;
  resisted: boolean;
  createdAt: string;
}

// ====== DAY SPLITS ======
export interface DaySplit {
  dayIndex: number; // 0=Mon, 1=Tue, ..., 6=Sun
  sphere: string;
  color: string;
}

// ====== HABITS ======
export interface Habit {
  id: string;
  name: string;
  icon: string;
  checkedDates: string[]; // ISO date strings
}

// ====== GAMIFICATION ======
export interface Achievement {
  id: string;
  level: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastEntryDate: string;
  unlockedThemes: string[];
  unlockedSounds: string[];
  achievements: Achievement[];
}

// ====== GLOBAL STATE ======
export interface AppState {
  tasks: Task[];
  emotions: EmotionEntry[];
  sprints: SprintSession[];
  meditations: MeditationSession[];
  delays: DelayEntry[];
  daySplits: DaySplit[];
  habits: Habit[];
  gamification: GamificationState;
  spheres: string[];
  activeTab: string;
}

// ====== ACTIONS ======
export type AppAction =
  | { type: 'SET_TAB'; tab: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'TOGGLE_TASK_COMPLETION'; id: string }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'ADD_EMOTION'; entry: EmotionEntry }
  | { type: 'DELETE_EMOTION'; id: string }
  | { type: 'ADD_SPRINT'; session: SprintSession }
  | { type: 'ADD_MEDITATION'; session: MeditationSession }
  | { type: 'ADD_DELAY'; entry: DelayEntry }
  | { type: 'SET_DAY_SPLITS'; splits: DaySplit[] }
  | { type: 'ADD_SPHERE'; sphere: string }
  | { type: 'REMOVE_SPHERE'; sphere: string }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'TOGGLE_HABIT'; id: string; date: string }
  | { type: 'DELETE_HABIT'; id: string }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'UPDATE_ACHIEVEMENT'; id: string; level: number }
  | { type: 'LOAD_STATE'; state: AppState };
