import { useState, useMemo } from 'react';
import { Plus, Trash2, Zap, ClipboardList, CalendarDays, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppState, getCognitiveLoad, getLoadStatus, getTodaySphere } from '../store/AppContext';
import type { Task, TaskCategory } from '../store/types';
import brainImg from '../assets/brain.png';
import './BrainDump.css';

export default function BrainDump() {
  const { state, dispatch } = useAppState();

  // ── Local state ──
  const [inputText, setInputText] = useState('');
  const [inputCategory, setInputCategory] = useState<TaskCategory>('immediate');
  const [inputSphere, setInputSphere] = useState(state.spheres[0] ?? '');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // ── Derived data ──
  const load = getCognitiveLoad(state.tasks);
  const loadStatus = getLoadStatus(load);
  const todaySphere = getTodaySphere(state.daySplits);

  // Active tasks only for the main panels
  const immediateTasks = useMemo(
    () => state.tasks.filter(t => t.category === 'immediate' && !t.completed),
    [state.tasks]
  );

  const scheduledTasks = useMemo(
    () => state.tasks.filter(t => t.category === 'scheduled' && !t.completed),
    [state.tasks]
  );

  const completedTasks = useMemo(
    () => state.tasks.filter(t => t.completed),
    [state.tasks]
  );

  // Today's sphere tasks — active tasks belonging to today's sphere
  const todaySphereTasks = useMemo(() => {
    if (!todaySphere) return [];
    return state.tasks.filter(t => t.sphere === todaySphere.sphere && !t.completed);
  }, [state.tasks, todaySphere]);

  // ── Handlers ──
  const handleAddTask = () => {
    const title = inputText.trim();
    if (!title) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title,
      category: inputCategory,
      sphere: inputSphere || state.spheres[0] || 'Без сферы',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TASK', task });
    dispatch({ type: 'ADD_XP', amount: 10 });
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddTask();
  };

  const handleComplete = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETION', id });
    dispatch({ type: 'ADD_XP', amount: 25 });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    dispatch({ type: 'DELETE_TASK', id: deleteTarget.id });
    setDeleteTarget(null);

    // 🎉 Confetti celebration for clearing mental load
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#8b5cf6', '#00ff88', '#f59e0b'],
    });
  };

  // ── Sphere color helper ──
  const getSphereColor = (sphereName: string): string => {
    const match = state.daySplits.find(s => s.sphere === sphereName);
    return match?.color ?? 'var(--cyan)';
  };

  // ── Brain clip (bottom-to-top fill) ──
  const brainClip = `inset(${100 - load}% 0 0 0)`;

  // ── Render helpers ──
  const renderTask = (task: Task) => {
    const sphereColor = getSphereColor(task.sphere);
    const weight = task.category === 'immediate' ? '3%' : '10%';

    return (
      <div
        key={task.id}
        className={`braindump__task ${task.completed ? 'braindump__task--completed' : ''}`}
      >
        {/* Checkbox */}
        <button
          className={`braindump__task-check ${task.completed ? 'braindump__task-check--done' : ''}`}
          onClick={() => handleComplete(task.id)}
          title={task.completed ? 'Вернуть в активные' : 'Отметить выполненной'}
        >
          {task.completed ? '✓' : ''}
        </button>

        {/* Body */}
        <div className="braindump__task-body">
          <span className="braindump__task-title">{task.title}</span>
          <div className="braindump__task-meta">
            <span
              className="braindump__task-sphere"
              style={{
                color: sphereColor,
                borderColor: sphereColor,
                background: `${sphereColor}15`,
              }}
            >
              {task.sphere}
            </span>
            <span className="braindump__task-weight">{weight}</span>
          </div>
        </div>

        {/* Delete */}
        <button
          className="braindump__task-delete"
          onClick={() => setDeleteTarget(task)}
          title="Удалить"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  };

  const renderEmpty = (icon: string, text: string) => (
    <div className="braindump__empty">
      <span className="braindump__empty-icon">{icon}</span>
      <span className="braindump__empty-text">{text}</span>
    </div>
  );

  // ──────────────────────────
  //  RENDER
  // ──────────────────────────
  return (
    <div className="braindump">
      {/* ═══ A) BRAIN LOAD HERO ═══ */}
      <section className="braindump__hero">
        <div
          className={`braindump__brain-wrap ${
            loadStatus.level === 'overload' ? 'braindump__brain-wrap--overload' : ''
          }`}
        >
          {/* Dim base brain */}
          <div className="braindump__brain-base">
            <img src={brainImg} alt="" aria-hidden="true" />
          </div>

          {/* Filled brain (clipped bottom→top) */}
          <div className="braindump__brain-fill" style={{ clipPath: brainClip }}>
            <img src={brainImg} alt="" aria-hidden="true" />
            <div className="braindump__brain-gradient" />
          </div>
        </div>

        <span className="braindump__load-value" style={{ color: loadStatus.color }}>
          {load}%
        </span>

        <span className="braindump__load-label">КОГНИТИВНАЯ ЗАГРУЗКА</span>

        <span
          className="braindump__load-status"
          style={{
            color: loadStatus.color,
            borderColor: loadStatus.color,
            background: `${loadStatus.color}18`,
            textShadow: `0 0 12px ${loadStatus.color}60`,
          }}
        >
          {loadStatus.label}
        </span>
      </section>

      {/* ═══ B) TASK INPUT ═══ */}
      <section className="braindump__input-section">
        <div className="braindump__input-section-title">
          <Plus size={14} /> ДОБАВИТЬ ЗАДАЧУ
        </div>

        <div className="braindump__input-row">
          <input
            type="text"
            className="braindump__input-text"
            placeholder="> введите задачу..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="braindump__input-controls">
          <select
            value={inputCategory}
            onChange={e => setInputCategory(e.target.value as TaskCategory)}
          >
            <option value="immediate">⚡ Немедленно (&lt; 15 мин)</option>
            <option value="scheduled">📋 Запланировано</option>
          </select>

          <select
            value={inputSphere}
            onChange={e => setInputSphere(e.target.value)}
          >
            {state.spheres.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button className="braindump__add-btn" onClick={handleAddTask}>
            <Plus size={16} />
            ДОБАВИТЬ
          </button>
        </div>
      </section>

      {/* ═══ D) TODAY'S SPHERE STRIP ═══ */}
      {todaySphere && (
        <section className="braindump__today-strip">
          <div className="braindump__today-header">
            <CalendarDays size={16} style={{ color: todaySphere.color }} />
            <span className="braindump__today-label">СФЕРА ДНЯ</span>
            <span
              className="braindump__today-sphere"
              style={{
                color: todaySphere.color,
                borderColor: todaySphere.color,
                background: `${todaySphere.color}15`,
              }}
            >
              {todaySphere.sphere}
            </span>
          </div>

          {todaySphereTasks.length > 0 ? (
            todaySphereTasks.map(renderTask)
          ) : (
            <span className="braindump__today-empty">
              Нет активных задач для сегодняшней сферы
            </span>
          )}
        </section>
      )}

      {/* ═══ C) TASK COLUMNS ═══ */}
      <div className="braindump__columns">
        {/* Immediate */}
        <div className="braindump__column">
          <div className="braindump__column-header">
            <span className="braindump__column-title">
              <Zap size={14} style={{ color: 'var(--amber)', marginRight: 6 }} />
              ⚡ НЕМЕДЛЕННО
            </span>
            <span className="braindump__column-count">{immediateTasks.length}</span>
          </div>
          {immediateTasks.length > 0
            ? immediateTasks.map(renderTask)
            : renderEmpty('🧘', 'НЕТ СРОЧНЫХ ЗАДАЧ')}
        </div>

        {/* Scheduled */}
        <div className="braindump__column">
          <div className="braindump__column-header">
            <span className="braindump__column-title">
              <ClipboardList size={14} style={{ color: 'var(--violet)', marginRight: 6 }} />
              📋 ЗАПЛАНИРОВАНО
            </span>
            <span className="braindump__column-count">{scheduledTasks.length}</span>
          </div>
          {scheduledTasks.length > 0
            ? scheduledTasks.map(renderTask)
            : renderEmpty('📭', 'НЕТ ЗАПЛАНИРОВАННЫХ ЗАДАЧ')}
        </div>
      </div>

      {/* ═══ E) COMPLETED TASKS HISTORY ═══ */}
      {completedTasks.length > 0 && (
        <section className="braindump__history">
          <button
            className="braindump__history-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={16} />
            {showHistory ? 'Скрыть историю выполненных задач' : `Показать историю (${completedTasks.length})`}
          </button>
          
          {showHistory && (
            <div className="braindump__history-list">
              {completedTasks.map(renderTask)}
            </div>
          )}
        </section>
      )}

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      {deleteTarget && (
        <div className="braindump__modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="braindump__modal" onClick={e => e.stopPropagation()}>
            <div className="braindump__modal-icon">🗑️</div>
            <div className="braindump__modal-title">ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ</div>
            <div className="braindump__modal-task">{deleteTarget.title}</div>
            <div className="braindump__modal-question">
              Что будет, если никогда не сделать?
            </div>
            <div className="braindump__modal-actions">
              <button
                className="braindump__modal-btn braindump__modal-btn--confirm"
                onClick={handleDeleteConfirm}
              >
                Ничего — удалить
              </button>
              <button
                className="braindump__modal-btn braindump__modal-btn--cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
