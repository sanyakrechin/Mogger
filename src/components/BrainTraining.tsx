import { useState, useEffect, useRef } from 'react';
import { Timer, Wind, Shield } from 'lucide-react';
import { useAppState } from '../store/AppContext';
import './BrainTraining.css';

type Tab = 'sprint' | 'meditation' | 'delay';

export default function BrainTraining() {
  const [activeTab, setActiveTab] = useState<Tab>('sprint');

  return (
    <div className="brain-training animate-fade-in">
      <div className="bt-tabs">
        <button
          className={`bt-tab ${activeTab === 'sprint' ? 'bt-tab--active' : ''}`}
          onClick={() => setActiveTab('sprint')}
        >
          <Timer size={18} /> СПРИНТ-ФОКУС
        </button>
        <button
          className={`bt-tab ${activeTab === 'meditation' ? 'bt-tab--active' : ''}`}
          onClick={() => setActiveTab('meditation')}
        >
          <Wind size={18} /> МЕДИТАЦИЯ ДЫХАНИЯ
        </button>
        <button
          className={`bt-tab ${activeTab === 'delay' ? 'bt-tab--active' : ''}`}
          onClick={() => setActiveTab('delay')}
        >
          <Shield size={18} /> ОТСРОЧКА УДОВОЛЬСТВИЯ
        </button>
      </div>

      {activeTab === 'sprint' && <SprintTab onComplete={() => setActiveTab('meditation')} />}
      {activeTab === 'meditation' && <MeditationTab />}
      {activeTab === 'delay' && <DelayTab />}
    </div>
  );
}

function SprintTab({ onComplete }: { onComplete: () => void }) {
  const { state, dispatch } = useAppState();
  const [duration, setDuration] = useState(60); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      dispatch({
        type: 'ADD_SPRINT',
        session: { id: crypto.randomUUID(), taskTitle: selectedTask || 'Без задачи', durationMinutes: duration, completedAt: new Date().toISOString() }
      });
      dispatch({ type: 'ADD_XP', amount: 30 });
      onComplete();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, duration, selectedTask, dispatch, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
  };

  const handleDuration = (m: number) => {
    if (isActive) return;
    setDuration(m);
    setTimeLeft(m * 60);
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  const activeTasks = state.tasks.filter(t => !t.completed);

  // Weekly progress
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Sunday start approx
  const sprintsThisWeek = state.sprints.filter(s => new Date(s.completedAt) >= weekStart).length;

  return (
    <div className="glass-card bt-panel animate-fade-in">
      <div style={{ alignSelf: 'flex-start', color: 'var(--cyan)', fontFamily: 'var(--font-heading)' }}>
        НЕДЕЛЬНЫЙ ПРОГРЕСС: {sprintsThisWeek}/3
      </div>
      
      <select
        value={selectedTask}
        onChange={e => setSelectedTask(e.target.value)}
        disabled={isActive}
        style={{ width: '300px', background: 'var(--bg-deepspace)' }}
      >
        <option value="">-- Выбрать задачу --</option>
        {activeTasks.map(t => (
          <option key={t.id} value={t.title}>{t.title}</option>
        ))}
      </select>

      <div className="bt-durations">
        {[60, 75, 90].map(m => (
          <button
            key={m}
            className={`btn ${duration === m ? 'btn--primary' : ''}`}
            onClick={() => handleDuration(m)}
            disabled={isActive}
          >
            {m} МИН
          </button>
        ))}
      </div>

      <div className={`bt-timer-display ${isActive ? 'bt-timer-display--active' : ''}`}>
        <div className="bt-timer-text">{mins}:{secs}</div>
      </div>

      <div className="bt-controls">
        <button className="btn btn--primary" onClick={toggleTimer}>
          {isActive ? 'ПАУЗА' : 'СТАРТ'}
        </button>
        <button className="btn" onClick={resetTimer}>СБРОС</button>
      </div>
    </div>
  );
}

function MeditationTab() {
  const { dispatch } = useAppState();
  const [duration, setDuration] = useState(10); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('exhale'); // Start shrunk

  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      
      if (phase === 'exhale') setPhase('inhale');

    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      
      dispatch({
        type: 'ADD_MEDITATION',
        session: { id: crypto.randomUUID(), durationSeconds: duration * 60, completedAt: new Date().toISOString() }
      });
      dispatch({ type: 'ADD_XP', amount: 20 });
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, timeLeft, duration, dispatch]);

  // Breathing logic
  useEffect(() => {
    if (!isActive) {
      setPhase('exhale');
      return;
    }
    let timeout: number;
    if (phase === 'inhale') {
      timeout = window.setTimeout(() => setPhase('hold'), 4000);
    } else if (phase === 'hold') {
      timeout = window.setTimeout(() => setPhase('exhale'), 6000);
    } else if (phase === 'exhale') {
      timeout = window.setTimeout(() => setPhase('inhale'), 8000);
    }
    return () => clearTimeout(timeout);
  }, [phase, isActive]);


  const toggleTimer = () => setIsActive(!isActive);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="glass-card bt-panel animate-fade-in">
      <div className="bt-durations">
        {[5, 10, 15].map(m => (
          <button
            key={m}
            className={`btn ${duration === m ? 'btn--primary' : ''}`}
            onClick={() => { if (!isActive) { setDuration(m); setTimeLeft(m * 60); } }}
            disabled={isActive}
          >
            {m} МИН
          </button>
        ))}
      </div>

      <div className="bt-breathe-container">
        <div className={`bt-breathe-circle bt-breathe-circle--${isActive ? phase : 'exhale'}`} />
        <div className="bt-breathe-text">
          {!isActive ? 'ГОТОВ?' : (phase === 'inhale' ? 'ВДОХ...' : phase === 'hold' ? 'ЗАДЕРЖКА...' : 'ВЫДОХ...')}
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', color: 'var(--text-secondary)' }}>
        {mins}:{secs}
      </div>

      <button className="btn btn--primary" onClick={toggleTimer}>
        {isActive ? 'СТОП' : 'СТАРТ'}
      </button>
    </div>
  );
}

function DelayTab() {
  const { state, dispatch } = useAppState();
  const [urge, setUrge] = useState('');
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isActive, setIsActive] = useState(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      dispatch({
        type: 'ADD_DELAY',
        entry: { id: crypto.randomUUID(), urge: urge || 'Скрытое искушение', resisted: true, createdAt: new Date().toISOString() }
      });
      dispatch({ type: 'ADD_XP', amount: 15 });
      setUrge('');
      setTimeLeft(10 * 60);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, urge, dispatch]);

  const toggleTimer = () => setIsActive(!isActive);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  const presets = ['📱 Рилсы', '🍫 Сладкое', '🎮 Игры', '📺 Сериалы'];

  return (
    <div className="glass-card bt-panel animate-fade-in">
      <input
        type="text"
        placeholder="> Чему ты сопротивляешься?"
        value={urge}
        onChange={e => setUrge(e.target.value)}
        disabled={isActive}
        style={{ width: '300px', textAlign: 'center' }}
      />
      <div className="bt-delay-presets">
        {presets.map(p => (
          <button key={p} className="bt-delay-btn" onClick={() => !isActive && setUrge(p)} disabled={isActive}>
            {p}
          </button>
        ))}
      </div>

      <div className={`bt-timer-display ${isActive ? 'bt-timer-display--active' : ''}`}>
        <div className="bt-timer-text">{mins}:{secs}</div>
      </div>

      <button className="btn btn--primary" onClick={toggleTimer} disabled={!urge.trim()}>
        {isActive ? 'СДАТЬСЯ (ОТМЕНА)' : 'ВЫДЕРЖАТЬ 10 МИН'}
      </button>

      {isActive && <div style={{ color: 'var(--amber)', fontFamily: 'var(--font-heading)' }}>СИЛА ВОЛИ ТРЕНИРУЕТСЯ...</div>}

      <div className="bt-history">
        <h3 style={{ color: 'var(--cyan)', marginBottom: '12px' }}>ПОСЛЕДНИЕ ПОБЕДЫ</h3>
        {[...state.delays].reverse().slice(0, 5).map(d => (
          <div key={d.id} className="bt-history-item">
            <span>{d.urge}</span>
            <span style={{ color: 'var(--green)' }}>✓ ВЫДЕРЖАЛ</span>
          </div>
        ))}
      </div>
    </div>
  );
}
