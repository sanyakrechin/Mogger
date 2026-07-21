import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Trash2, Check, ChevronDown, ChevronUp, Pencil, Save, X } from 'lucide-react';
import { useAppState, getTodayIndex } from '../store/AppContext';
import type { DayTask, Habit } from '../store/types';
import './WeekDashboard.css';

const DAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
const DAY_LABELS_FULL = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА', 'ВОСКРЕСЕНЬЕ'];

const HABIT_ICONS = ['🔥', '⚡', '🎯', '🧠', '💎', '🏆', '🚀', '🌊'];
const EMOJI_PICKER_LIST = [
  '💻', '💪', '🎨', '📈', '📚', '🧘', '☁️', '🔥',
  '⚡', '🎯', '🧠', '💎', '🏆', '🚀', '🌊', '🎮',
  '🎸', '📝', '🏃', '🧩', '❤️', '⭐', '✨', '🌈',
];

function getWeekDates(): string[] {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diff);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${dayNum}`);
  }
  return dates;
}

export default function WeekDashboard() {
  const { state, dispatch } = useAppState();
  const todayIndex = useMemo(() => getTodayIndex(), []);
  const weekDates = useMemo(() => getWeekDates(), []);

  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateIcon, setTemplateIcon] = useState('');
  const [templateColor, setTemplateColor] = useState('#00f0ff');
  const [templateTasks, setTemplateTasks] = useState<string[]>([]);
  const [newDefaultTask, setNewDefaultTask] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // Habit states
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState(HABIT_ICONS[0]);
  const [showHabitEmojiPicker, setShowHabitEmojiPicker] = useState(false);
  const [showHabits, setShowHabits] = useState(true);

  const selectedDate = weekDates[selectedDayIndex];
  const assignment = state.weekAssignments.find(a => a.dayIndex === selectedDayIndex);
  const template = assignment ? state.templates.find(t => t.id === assignment.templateId) : undefined;

  // Auto-initialize day instance when selecting a day with a template
  useEffect(() => {
    if (template && selectedDate) {
      const existing = state.dayInstances.find(d => d.date === selectedDate);
      if (!existing) {
        dispatch({ type: 'INIT_DAY', date: selectedDate, templateId: template.id });
      }
    }
  }, [template, selectedDate, state.dayInstances, dispatch]);

  const dayInstance = state.dayInstances.find(d => d.date === selectedDate);

  const completedCount = dayInstance ? dayInstance.tasks.filter(t => t.completed).length : 0;
  const totalCount = dayInstance ? dayInstance.tasks.length : 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // ── Handlers ──
  const handleAddTask = useCallback(() => {
    const trimmed = newTaskText.trim();
    if (!trimmed || !selectedDate) return;
    const task: DayTask = {
      id: crypto.randomUUID(),
      title: trimmed,
      isDefault: false,
      completed: false,
    };
    // If day not initialized yet, init first
    if (!dayInstance && template) {
      dispatch({ type: 'INIT_DAY', date: selectedDate, templateId: template.id });
    }
    dispatch({ type: 'ADD_DAY_TASK', date: selectedDate, task });
    dispatch({ type: 'ADD_XP', amount: 10 });
    setNewTaskText('');
  }, [newTaskText, selectedDate, dayInstance, template, dispatch]);

  const handleToggleTask = useCallback((taskId: string) => {
    const task = dayInstance?.tasks.find(t => t.id === taskId);
    if (task) {
      if (!task.completed) {
        dispatch({ type: 'ADD_XP', amount: 25 });
      } else {
        dispatch({ type: 'ADD_XP', amount: -25 });
      }
    }
    dispatch({ type: 'TOGGLE_DAY_TASK', date: selectedDate, taskId });
  }, [selectedDate, dayInstance, dispatch]);

  const handleDeleteTask = useCallback((taskId: string) => {
    const task = dayInstance?.tasks.find(t => t.id === taskId);
    if (task && task.completed) {
      dispatch({ type: 'ADD_XP', amount: -25 });
    }
    dispatch({ type: 'DELETE_DAY_TASK', date: selectedDate, taskId });
  }, [selectedDate, dayInstance, dispatch]);

  const handleToggleHabit = useCallback((habitId: string, date: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (habit) {
      const isChecked = habit.checkedDates.includes(date);
      if (!isChecked) {
        dispatch({ type: 'ADD_XP', amount: 15 });
      } else {
        dispatch({ type: 'ADD_XP', amount: -15 });
      }
    }
    dispatch({ type: 'TOGGLE_HABIT', id: habitId, date });
  }, [state.habits, dispatch]);

  const handleDeleteHabit = useCallback((habitId: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (habit && habit.checkedDates.length > 0) {
      dispatch({ type: 'ADD_XP', amount: -(habit.checkedDates.length * 15) });
    }
    dispatch({ type: 'DELETE_HABIT', id: habitId });
  }, [state.habits, dispatch]);

  // ── Template editing ──
  const startEditTemplate = useCallback(() => {
    if (template) {
      setTemplateName(template.name);
      setTemplateIcon(template.icon);
      setTemplateColor(template.color);
      setTemplateTasks([...template.defaultTasks]);
    } else {
      setTemplateName('');
      setTemplateIcon('🎯');
      setTemplateColor('#00f0ff');
      setTemplateTasks([]);
    }
    setEditingTemplate(true);
  }, [template]);

  const saveTemplate = useCallback(() => {
    if (!templateName.trim()) return;

    if (template) {
      // Update existing
      dispatch({
        type: 'UPDATE_TEMPLATE',
        template: {
          ...template,
          name: templateName.trim().toUpperCase(),
          icon: templateIcon,
          color: templateColor,
          defaultTasks: templateTasks.filter(t => t.trim()),
        },
      });
    } else {
      // Create new
      const newId = `tpl-${Date.now()}`;
      dispatch({
        type: 'ADD_TEMPLATE',
        template: {
          id: newId,
          name: templateName.trim().toUpperCase(),
          icon: templateIcon,
          color: templateColor,
          defaultTasks: templateTasks.filter(t => t.trim()),
        },
      });
      dispatch({ type: 'SET_WEEK_ASSIGNMENT', dayIndex: selectedDayIndex, templateId: newId });
    }
    setEditingTemplate(false);
  }, [template, templateName, templateIcon, templateColor, templateTasks, selectedDayIndex, dispatch]);

  const addDefaultTask = useCallback(() => {
    if (newDefaultTask.trim()) {
      setTemplateTasks(prev => [...prev, newDefaultTask.trim()]);
      setNewDefaultTask('');
    }
  }, [newDefaultTask]);

  const removeDefaultTask = useCallback((index: number) => {
    setTemplateTasks(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ── Habits ──
  const handleAddHabit = useCallback(() => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: trimmed,
      icon: newHabitIcon || HABIT_ICONS[Math.floor(Math.random() * HABIT_ICONS.length)],
      checkedDates: [],
    };
    dispatch({ type: 'ADD_HABIT', habit });
    setNewHabitName('');
    setNewHabitIcon(HABIT_ICONS[Math.floor(Math.random() * HABIT_ICONS.length)]);
  }, [newHabitName, newHabitIcon, dispatch]);

  const getHabitPercent = useCallback((habit: Habit): number => {
    const checked = weekDates.filter(d => habit.checkedDates.includes(d)).length;
    return Math.round((checked / 7) * 100);
  }, [weekDates]);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Trigger swipe if horizontal drag > 45px and more horizontal than vertical
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        // Swipe Left -> Next Day
        setSelectedDayIndex(prev => Math.min(6, prev + 1));
      } else {
        // Swipe Right -> Previous Day
        setSelectedDayIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  return (
    <div
      className="week-dash animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ═══ WEEK STRIP ═══ */}
      <div className="week-dash__strip">
        {DAY_LABELS.map((label, idx) => {
          const a = state.weekAssignments.find(x => x.dayIndex === idx);
          const tpl = a ? state.templates.find(t => t.id === a.templateId) : undefined;
          const isToday = idx === todayIndex;
          const isSelected = idx === selectedDayIndex;
          const date = weekDates[idx];
          const inst = state.dayInstances.find(d => d.date === date);
          const done = inst ? inst.tasks.filter(t => t.completed).length : 0;
          const total = inst ? inst.tasks.length : (tpl?.defaultTasks.length ?? 0);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const dateNum = new Date(date).getDate();

          return (
            <div
              key={idx}
              className={[
                'week-dash__day-card',
                isToday ? 'week-dash__day-card--today' : '',
                isSelected ? 'week-dash__day-card--selected' : '',
              ].filter(Boolean).join(' ')}
              style={{ '--day-color': tpl?.color ?? '#444' } as React.CSSProperties}
              onClick={() => setSelectedDayIndex(idx)}
            >
              <span className="week-dash__day-label">{label}</span>
              <span className="week-dash__day-date">{dateNum}</span>
              {tpl ? (
                <>
                  <span className="week-dash__day-icon">{tpl.icon}</span>
                  <span className="week-dash__day-name">{tpl.name}</span>
                  <div className="week-dash__day-progress">
                    <div
                      className="week-dash__day-progress-fill"
                      style={{ width: `${pct}%`, backgroundColor: tpl.color }}
                    />
                  </div>
                  <span className="week-dash__day-stats">{done}/{total}</span>
                </>
              ) : (
                <span className="week-dash__day-empty">—</span>
              )}
              {isToday && <span className="week-dash__day-badge">СЕГОДНЯ</span>}
            </div>
          );
        })}
      </div>

      {/* ═══ SELECTED DAY DETAIL ═══ */}
      <div className="week-dash__detail glass-card">
        <div className="week-dash__detail-header">
          <div className="week-dash__detail-title-row">
            {template && (
              <span className="week-dash__detail-icon" style={{ color: template.color }}>
                {template.icon}
              </span>
            )}
            <div>
              <h2 className="week-dash__detail-title" style={{ color: template?.color ?? 'var(--cyan)' }}>
                {DAY_LABELS_FULL[selectedDayIndex]}: {template?.name ?? 'НЕ НАЗНАЧЕН'}
              </h2>
              <span className="week-dash__detail-date">{selectedDate}</span>
            </div>
          </div>

          <div className="week-dash__detail-actions">
            {/* Template picker */}
            <div style={{ position: 'relative' }}>
              <button
                className="week-dash__action-btn"
                onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                title="Сменить шаблон дня"
              >
                <ChevronDown size={16} />
                ШАБЛОН
              </button>
              {showTemplatePicker && (
                <>
                  <div className="week-dash__overlay" onClick={() => setShowTemplatePicker(false)} />
                  <div className="week-dash__template-picker">
                    {state.templates.map(tpl => (
                      <button
                        key={tpl.id}
                        className={`week-dash__template-option ${assignment?.templateId === tpl.id ? 'week-dash__template-option--active' : ''}`}
                        onClick={() => {
                          dispatch({ type: 'SET_WEEK_ASSIGNMENT', dayIndex: selectedDayIndex, templateId: tpl.id });
                          setShowTemplatePicker(false);
                        }}
                      >
                        <span>{tpl.icon}</span>
                        <span style={{ color: tpl.color }}>{tpl.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className="week-dash__action-btn" onClick={startEditTemplate}>
              <Pencil size={14} />
              РЕДАКТИРОВАТЬ
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="week-dash__progress-section">
            <div className="week-dash__progress-bar">
              <div
                className="week-dash__progress-fill"
                style={{
                  width: `${progress}%`,
                  backgroundColor: template?.color ?? 'var(--cyan)',
                }}
              />
            </div>
            <span className="week-dash__progress-text" style={{ color: template?.color ?? 'var(--cyan)' }}>
              {completedCount}/{totalCount} задач • {progress}%
            </span>
          </div>
        )}

        {/* Task list */}
        <div className="week-dash__tasks">
          {dayInstance && dayInstance.tasks.length > 0 ? (
            <>
              {/* Default tasks */}
              {dayInstance.tasks.filter(t => t.isDefault).length > 0 && (
                <div className="week-dash__task-group">
                  <div className="week-dash__task-group-label">ОБЯЗАТЕЛЬНЫЕ</div>
                  {dayInstance.tasks.filter(t => t.isDefault).map(task => (
                    <div
                      key={task.id}
                      className={`week-dash__task ${task.completed ? 'week-dash__task--done' : ''}`}
                    >
                      <button
                        className={`week-dash__task-check ${task.completed ? 'week-dash__task-check--checked' : ''}`}
                        style={task.completed ? { borderColor: template?.color, backgroundColor: template?.color } : {}}
                        onClick={() => handleToggleTask(task.id)}
                      >
                        {task.completed && <Check size={14} />}
                      </button>
                      <span className="week-dash__task-title">{task.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom tasks */}
              {dayInstance.tasks.filter(t => !t.isDefault).length > 0 && (
                <div className="week-dash__task-group">
                  <div className="week-dash__task-group-label">ДОПОЛНИТЕЛЬНЫЕ</div>
                  {dayInstance.tasks.filter(t => !t.isDefault).map(task => (
                    <div
                      key={task.id}
                      className={`week-dash__task ${task.completed ? 'week-dash__task--done' : ''}`}
                    >
                      <button
                        className={`week-dash__task-check ${task.completed ? 'week-dash__task-check--checked' : ''}`}
                        style={task.completed ? { borderColor: template?.color, backgroundColor: template?.color } : {}}
                        onClick={() => handleToggleTask(task.id)}
                      >
                        {task.completed && <Check size={14} />}
                      </button>
                      <span className="week-dash__task-title">{task.title}</span>
                      <button
                        className="week-dash__task-delete"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            !template && (
              <div className="week-dash__empty">
                Выбери шаблон для этого дня или создай новый
              </div>
            )
          )}

          {/* Add task input */}
          {(template || dayInstance) && (
            <div className="week-dash__add-task">
              <input
                type="text"
                placeholder="+ Добавить задачу на этот день..."
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                className="week-dash__add-input"
              />
              <button
                className="week-dash__add-btn"
                onClick={handleAddTask}
                disabled={!newTaskText.trim()}
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ TEMPLATE EDITOR MODAL ═══ */}
      {editingTemplate && (
        <div className="week-dash__modal-overlay" onClick={() => setEditingTemplate(false)}>
          <div className="week-dash__modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="week-dash__modal-header">
              <h3>{template ? 'РЕДАКТИРОВАТЬ ШАБЛОН' : 'НОВЫЙ ШАБЛОН'}</h3>
              <button className="week-dash__modal-close" onClick={() => setEditingTemplate(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="week-dash__modal-body">
              {/* Icon + Name */}
              <div className="week-dash__modal-row">
                <div style={{ position: 'relative' }}>
                  <button
                    className="week-dash__icon-btn"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{ borderColor: templateColor }}
                  >
                    {templateIcon || '🎯'}
                  </button>
                  {showEmojiPicker && (
                    <>
                      <div className="week-dash__overlay" onClick={() => setShowEmojiPicker(false)} />
                      <div className="week-dash__emoji-picker">
                        {EMOJI_PICKER_LIST.map(emoji => (
                          <button
                            key={emoji}
                            className="week-dash__emoji-btn"
                            onClick={() => { setTemplateIcon(emoji); setShowEmojiPicker(false); }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <input
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="Название дня..."
                  className="week-dash__modal-input"
                />
                <input
                  type="color"
                  value={templateColor}
                  onChange={e => setTemplateColor(e.target.value)}
                  className="week-dash__color-input"
                />
              </div>

              {/* Default tasks */}
              <div className="week-dash__modal-section">
                <label className="week-dash__modal-label">ОБЯЗАТЕЛЬНЫЕ ЗАДАЧИ (ШАБЛОН)</label>
                {templateTasks.map((task, i) => (
                  <div key={i} className="week-dash__modal-task-row">
                    <span className="week-dash__modal-task-text">{task}</span>
                    <button className="week-dash__modal-task-del" onClick={() => removeDefaultTask(i)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="week-dash__modal-add-row">
                  <input
                    type="text"
                    value={newDefaultTask}
                    onChange={e => setNewDefaultTask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addDefaultTask()}
                    placeholder="Новая задача..."
                    className="week-dash__modal-input"
                  />
                  <button className="week-dash__modal-add-btn" onClick={addDefaultTask} disabled={!newDefaultTask.trim()}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="week-dash__modal-footer">
              <button className="btn btn--primary" onClick={saveTemplate}>
                <Save size={14} />
                СОХРАНИТЬ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HABIT TRACKER ═══ */}
      <div className="week-dash__habits glass-card">
        <div
          className="week-dash__habits-header"
          onClick={() => setShowHabits(!showHabits)}
        >
          <span className="week-dash__habits-title">🔄 ТРЕКЕР ПРИВЫЧЕК</span>
          {showHabits ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {showHabits && (
          <>
            <div className="week-dash__habits-grid">
              {/* Header row */}
              <div className="week-dash__habits-row week-dash__habits-row--header">
                <div className="week-dash__habits-name" />
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    className={`week-dash__habits-day-label ${i === todayIndex ? 'week-dash__habits-day-label--today' : ''}`}
                  >
                    {label}
                  </div>
                ))}
                <div className="week-dash__habits-pct">%</div>
                <div />
              </div>

              {state.habits.map(habit => {
                const pct = getHabitPercent(habit);
                return (
                  <div key={habit.id} className="week-dash__habits-row">
                    <div className="week-dash__habits-name">
                      <span>{habit.icon}</span> {habit.name}
                    </div>
                    {weekDates.map((date, di) => {
                      const checked = habit.checkedDates.includes(date);
                      const isToday = di === todayIndex;
                      return (
                        <button
                          key={date}
                          className={[
                            'week-dash__habit-cb',
                            checked ? 'week-dash__habit-cb--checked' : '',
                            isToday ? 'week-dash__habit-cb--today' : '',
                          ].filter(Boolean).join(' ')}
                          onClick={() => handleToggleHabit(habit.id, date)}
                        >
                          {checked && <Check size={12} />}
                        </button>
                      );
                    })}
                    <div className={`week-dash__habits-pct ${pct === 100 ? 'week-dash__habits-pct--full' : pct >= 50 ? 'week-dash__habits-pct--mid' : ''}`}>
                      {pct}%
                    </div>
                    <button
                      className="week-dash__habit-del"
                      onClick={() => handleDeleteHabit(habit.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add habit */}
            <div className="week-dash__habit-add">
              <div style={{ position: 'relative' }}>
                <button
                  className="week-dash__habit-icon-btn"
                  onClick={() => setShowHabitEmojiPicker(!showHabitEmojiPicker)}
                >
                  {newHabitIcon}
                </button>
                {showHabitEmojiPicker && (
                  <>
                    <div className="week-dash__overlay" onClick={() => setShowHabitEmojiPicker(false)} />
                    <div className="week-dash__emoji-picker">
                      {EMOJI_PICKER_LIST.map(emoji => (
                        <button
                          key={emoji}
                          className="week-dash__emoji-btn"
                          onClick={() => { setNewHabitIcon(emoji); setShowHabitEmojiPicker(false); }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <input
                type="text"
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                placeholder="Новая привычка..."
                className="week-dash__add-input"
              />
              <button
                className="week-dash__add-btn"
                onClick={handleAddHabit}
                disabled={!newHabitName.trim()}
              >
                <Plus size={14} />
                ДОБАВИТЬ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
