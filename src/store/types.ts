// ====== DAY TEMPLATE ======
export interface DayTemplate {
  id: string;
  name: string;          // "IT-ДЕНЬ", "СПОРТ", "ТВОРЧЕСТВО"
  color: string;         // Hex color
  icon: string;          // Emoji
  defaultTasks: string[]; // Default task titles for this template
}

// ====== WEEK ASSIGNMENT ======
export interface WeekAssignment {
  dayIndex: number;      // 0=Mon, 1=Tue, ..., 6=Sun
  templateId: string;    // Reference to DayTemplate.id
}

// ====== DAY INSTANCE ======
export interface DayTask {
  id: string;
  title: string;
  isDefault: boolean;    // true = from template, false = manually added
  completed: boolean;
}

export interface DayInstance {
  date: string;          // ISO date, e.g. "2026-07-21"
  templateId: string;
  tasks: DayTask[];
  completed: boolean;    // Day closed / report submitted
}

// ====== HABITS ======
export interface Habit {
  id: string;
  name: string;
  icon: string;
  checkedDates: string[]; // ISO date strings
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

// ====== GIFTS & MARKET ======
export type GiftRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'soulbound';

export interface GiftItem {
  id: string;
  name: string;
  icon: string;
  rarity: GiftRarity;
  priceCoins: number;
  description: string;
  isSoulbound?: boolean; // Unsellable trophy for achievements/quests
}

export interface WeeklyQuest {
  id: string;
  title: string;
  description: string;
  targetSphere: string;
  rewardCoins: number;
  rewardGiftId: string;
  status: 'active' | 'submitted' | 'completed';
  submittedProofText?: string;
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
  coins: number;
  activeTheme: string; // 'cyber-dark' | 'tokyo-drift' | 'matrix-code' | 'sunset-vapor' | 'gold-sigma'
  unlockedThemes: string[];
  unlockedSounds: string[];
  purchasedGiftIds: string[]; // List of gift IDs owned
  equippedGiftIds: string[]; // List of up to 3 gifts shown in Profile showcase
  achievements: Achievement[];
  weeklyQuest?: WeeklyQuest;
  pushNotificationsEnabled: boolean;
  pushStyle: 'aggressive' | 'coach';
}

// ====== GLOBAL STATE ======
export interface AppState {
  templates: DayTemplate[];
  weekAssignments: WeekAssignment[];
  dayInstances: DayInstance[];
  habits: Habit[];
  emotions: EmotionEntry[];
  sprints: SprintSession[];
  meditations: MeditationSession[];
  delays: DelayEntry[];
  gamification: GamificationState;
  activeTab: string;
}

// ====== ACTIONS ======
export type AppAction =
  | { type: 'SET_TAB'; tab: string }
  // Templates
  | { type: 'ADD_TEMPLATE'; template: DayTemplate }
  | { type: 'UPDATE_TEMPLATE'; template: DayTemplate }
  | { type: 'DELETE_TEMPLATE'; id: string }
  // Week assignments
  | { type: 'SET_WEEK_ASSIGNMENT'; dayIndex: number; templateId: string }
  | { type: 'REMOVE_WEEK_ASSIGNMENT'; dayIndex: number }
  // Day instances
  | { type: 'INIT_DAY'; date: string; templateId: string }
  | { type: 'ADD_DAY_TASK'; date: string; task: DayTask }
  | { type: 'TOGGLE_DAY_TASK'; date: string; taskId: string }
  | { type: 'DELETE_DAY_TASK'; date: string; taskId: string }
  | { type: 'COMPLETE_DAY'; date: string }
  // Habits
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'TOGGLE_HABIT'; id: string; date: string }
  | { type: 'DELETE_HABIT'; id: string }
  // Emotions
  | { type: 'ADD_EMOTION'; entry: EmotionEntry }
  | { type: 'DELETE_EMOTION'; id: string }
  // Training
  | { type: 'ADD_SPRINT'; session: SprintSession }
  | { type: 'ADD_MEDITATION'; session: MeditationSession }
  | { type: 'ADD_DELAY'; entry: DelayEntry }
  // Gamification
  | { type: 'ADD_XP'; amount: number }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'SET_THEME'; themeId: string }
  | { type: 'BUY_GIFT'; giftId: string; price: number }
  | { type: 'EQUIP_GIFT'; giftId: string }
  | { type: 'SUBMIT_WEEKLY_QUEST'; proofText: string }
  | { type: 'CLAIM_WEEKLY_QUEST_REWARD' }
  | { type: 'TOGGLE_PUSH_NOTIFICATIONS'; enabled?: boolean; style?: 'aggressive' | 'coach' }
  | { type: 'SET_MAX_TEST_LEVEL' }
  | { type: 'UPDATE_ACHIEVEMENT'; id: string; level: number }
  // System
  | { type: 'LOAD_STATE'; state: AppState };
