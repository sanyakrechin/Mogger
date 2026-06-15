import { useState, useMemo, useCallback } from 'react';
import { Calendar, Plus, Trash2, Check } from 'lucide-react';
import { useAppState } from '../store/AppContext';
import type { DaySplit as DaySplitType, Habit } from '../store/types';
import './DaySplit.css';

const DAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] as const;

const SPHERE_COLORS: Record<string, string> = {
  'Программирование': '#00f0ff',
  'Творчество': '#8b5cf6',
  'Бизнес': '#f59e0b',
  'Спорт': '#00ff88',
  'Обучение': '#ff3366',
  'Личное': '#d0bcff',
  'Отдых': '#849495',
};

const DEFAULT_COLORS = [
  '#00f0ff', '#8b5cf6', '#f59e0b', '#00ff88', '#ff3366',
  '#d0bcff', '#849495', '#e879f9', '#38bdf8', '#fbbf24',
];

const HABIT_ICONS = ['🔥', '⚡', '🎯', '🧠', '💎', '🏆', '🚀', '🌊'];

const EMOJI_PICKER_LIST = [
  '🔥', '⚡', '🎯', '🧠', '💎', '🏆', '🚀', '🌊',
  '💪', '🏃', '🧘', '📚', '💧', '🥗', '🍏', '🍎',
  '📵', '💻', '📝', '🎨', '🎸', '🎮', '🧩', '🎲',
  '🚗', '✈️', '🏝️', '🏕️', '⛺', '🌅', '🌄', '🌃',
  '❤️', '💜', '💙', '💚', '💛', '🧡', '🤍', '🖤',
  '⭐', '🌟', '✨', '☀️', '🌙', '☁️', '❄️', '🌈',
];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekDates(): string[] {
  const monday = getMonday(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toLocalISO(d);
  });
}

function getTodayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

function getSphereColor(sphereName: string, daySplits: DaySplitType[]): string {
  const split = daySplits.find(s => s.sphere === sphereName);
  if (split) return split.color;
  return SPHERE_COLORS[sphereName] || DEFAULT_COLORS[Math.abs(hashCode(sphereName)) % DEFAULT_COLORS.length];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export default function DaySplit() {
  const { state, dispatch } = useAppState();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [newSphere, setNewSphere] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState(HABIT_ICONS[0]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const todayIndex = useMemo(() => getTodayIndex(), []);
  const weekDates = useMemo(() => getWeekDates(), []);
  const todayDate = useMemo(() => toLocalISO(new Date()), []);

  const handleAssignSphere = useCallback((dayIndex: number, sphere: string) => {
    const color = getSphereColor(sphere, state.daySplits);
    const newSplits = state.daySplits.map(s =>
      s.dayIndex === dayIndex ? { ...s, sphere, color } : s
    );
    // If dayIndex doesn't exist yet, add it
    if (!state.daySplits.find(s => s.dayIndex === dayIndex)) {
      newSplits.push({ dayIndex, sphere, color });
    }
    dispatch({ type: 'SET_DAY_SPLITS', splits: newSplits });
    setEditingDay(null);
  }, [state.daySplits, dispatch]);

  const handleAddSphere = useCallback(() => {
    const trimmed = newSphere.trim();
    if (!trimmed) return;
    dispatch({ type: 'ADD_SPHERE', sphere: trimmed });
    setNewSphere('');
  }, [newSphere, dispatch]);

  const handleRemoveSphere = useCallback((sphere: string) => {
    dispatch({ type: 'REMOVE_SPHERE', sphere });
  }, [dispatch]);

  const handleAddHabit = useCallback(() => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: trimmed,
      icon: newHabitIcon.trim() || HABIT_ICONS[Math.floor(Math.random() * HABIT_ICONS.length)],
      checkedDates: [],
    };
    dispatch({ type: 'ADD_HABIT', habit });
    setNewHabitName('');
    setNewHabitIcon(HABIT_ICONS[Math.floor(Math.random() * HABIT_ICONS.length)]);
  }, [newHabitName, newHabitIcon, dispatch]);

  const handleToggleHabit = useCallback((id: string, date: string) => {
    dispatch({ type: 'TOGGLE_HABIT', id, date });
  }, [dispatch]);

  const handleDeleteHabit = useCallback((id: string) => {
    dispatch({ type: 'DELETE_HABIT', id });
  }, [dispatch]);

  const getHabitPercent = useCallback((habit: Habit): number => {
    const checked = weekDates.filter(d => habit.checkedDates.includes(d)).length;
    return Math.round((checked / 7) * 100);
  }, [weekDates]);

  const getPercentClass = (pct: number): string => {
    if (pct === 100) return 'daysplit__habit-percent--full';
    if (pct >= 70) return 'daysplit__habit-percent--high';
    if (pct >= 30) return 'daysplit__habit-percent--mid';
    return 'daysplit__habit-percent--low';
  };

  return (
    <div className="daysplit">
      {/* ===== HEADER ===== */}
      <div className="daysplit__header">
        <Calendar className="daysplit__header-icon" size={22} />
        <div>
          <div className="daysplit__title">РАСПИСАНИЕ СФЕР</div>
          <div className="daysplit__subtitle">// управление фокусом по дням недели</div>
        </div>
      </div>

      {/* ===== A) WEEKLY SPLIT CALENDAR ===== */}
      <div className="daysplit__section" style={{ zIndex: 10 }}>
        <div className="daysplit__section-title">
          <span>📅</span> НЕДЕЛЬНЫЙ СПЛИТ
        </div>

        <div className="daysplit__week-grid">
          {DAY_LABELS.map((label, idx) => {
            const split = state.daySplits.find(s => s.dayIndex === idx);
            const isToday = idx === todayIndex;

            return (
              <div
                key={idx}
                className={`daysplit__day-card${isToday ? ' daysplit__day-card--today' : ''}`}
                onClick={() => setEditingDay(editingDay === idx ? null : idx)}
              >
                <span className="daysplit__day-label">{label}</span>

                {split && (
                  <>
                    <div
                      className="daysplit__day-sphere"
                      style={{ backgroundColor: split.color }}
                    />
                    <span className="daysplit__day-name">{split.sphere}</span>
                  </>
                )}

                {!split && (
                  <span className="daysplit__day-name" style={{ color: 'var(--text-dim)' }}>—</span>
                )}

                {isToday && <span className="daysplit__day-badge">СЕЙЧАС</span>}

                {/* Sphere Dropdown */}
                {editingDay === idx && (
                  <>
                    <div
                      className="daysplit__dropdown-overlay"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingDay(null);
                      }}
                    />
                    <div className="daysplit__dropdown">
                      {state.spheres.map(sphere => (
                        <button
                          key={sphere}
                          className="daysplit__dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignSphere(idx, sphere);
                          }}
                        >
                          <div
                            className="daysplit__dropdown-dot"
                            style={{
                              backgroundColor: getSphereColor(sphere, state.daySplits),
                            }}
                          />
                          {sphere}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== B) SPHERE MANAGER ===== */}
      <div className="daysplit__section" style={{ zIndex: 9 }}>
        <div className="daysplit__section-title">
          <span>🔮</span> УПРАВЛЕНИЕ СФЕРАМИ
        </div>

        <div className="daysplit__spheres-list">
          {state.spheres.map(sphere => (
            <div key={sphere} className="daysplit__sphere-tag">
              <div
                className="daysplit__sphere-dot"
                style={{ backgroundColor: getSphereColor(sphere, state.daySplits) }}
              />
              <span>{sphere}</span>
              <button
                className="daysplit__sphere-delete"
                onClick={() => handleRemoveSphere(sphere)}
                title="Удалить сферу"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="daysplit__add-form">
          <input
            type="text"
            className="daysplit__add-input"
            value={newSphere}
            onChange={(e) => setNewSphere(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSphere()}
            placeholder="Новая сфера..."
          />
          <button
            className="daysplit__add-btn"
            onClick={handleAddSphere}
            disabled={!newSphere.trim()}
          >
            <Plus size={14} />
            ДОБАВИТЬ
          </button>
        </div>
      </div>

      {/* ===== C) HABIT TRACKER ===== */}
      <div className="daysplit__section" style={{ zIndex: 8 }}>
        <div className="daysplit__section-title">
          <span>🔁</span> ТРЕКЕР ПРИВЫЧЕК
        </div>

        {state.habits.length > 0 ? (
          <div className="daysplit__habits-list">
            {state.habits.map(habit => {
              const pct = getHabitPercent(habit);
              return (
                <div key={habit.id} className="daysplit__habit-row">
                  {/* Habit Info */}
                  <div className="daysplit__habit-info">
                    <span className="daysplit__habit-icon">{habit.icon}</span>
                    <span className="daysplit__habit-name">{habit.name}</span>
                  </div>

                  {/* 7 Day Checkboxes */}
                  <div className="daysplit__habit-checks">
                    {weekDates.map((date, di) => {
                      const isChecked = habit.checkedDates.includes(date);
                      const isDayToday = date === todayDate;
                      return (
                        <div key={date} className="daysplit__habit-check">
                          <span
                            className={`daysplit__habit-day-label ${isDayToday ? 'daysplit__habit-day-label--today' : ''}`}
                          >
                            {DAY_LABELS[di]}
                          </span>
                          <button
                            className={[
                              'daysplit__habit-checkbox',
                              isChecked ? 'daysplit__habit-checkbox--checked' : '',
                              isDayToday ? 'daysplit__habit-checkbox--today' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => handleToggleHabit(habit.id, date)}
                            title={`${DAY_LABELS[di]} — ${date}`}
                          >
                            {isChecked && <Check size={14} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Percentage */}
                  <span className={`daysplit__habit-percent ${getPercentClass(pct)}`}>
                    {pct}%
                  </span>

                  {/* Delete */}
                  <button
                    className="daysplit__habit-delete"
                    onClick={() => handleDeleteHabit(habit.id)}
                    title="Удалить привычку"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="daysplit__empty">
            // нет привычек — добавьте первую ↓
          </div>
        )}

        <div className="daysplit__divider" />

        <div className="daysplit__add-form" style={{ marginTop: 16, position: 'relative' }}>
          <input
            type="text"
            className="daysplit__add-input daysplit__add-input--icon"
            value={newHabitIcon}
            onChange={(e) => setNewHabitIcon(e.target.value)}
            onFocus={() => setShowEmojiPicker(true)}
            maxLength={2}
            title="Иконка (смайлик)"
          />
          
          {showEmojiPicker && (
            <>
              <div 
                className="daysplit__emoji-overlay" 
                onClick={() => setShowEmojiPicker(false)} 
              />
              <div className="daysplit__emoji-picker">
                {EMOJI_PICKER_LIST.map(emoji => (
                  <button
                    key={emoji}
                    className="daysplit__emoji-btn"
                    onClick={() => {
                      setNewHabitIcon(emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}

          <input
            type="text"
            className="daysplit__add-input"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            placeholder="Новая привычка..."
          />
          <button
            className="daysplit__add-btn"
            onClick={handleAddHabit}
            disabled={!newHabitName.trim()}
          >
            <Plus size={14} />
            ДОБАВИТЬ
          </button>
        </div>
      </div>
    </div>
  );
}
