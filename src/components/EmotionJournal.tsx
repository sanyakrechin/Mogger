import React, { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppState } from '../store/AppContext';
import type { MoodType, EmotionEntry } from '../store/types';
import './EmotionJournal.css';

const MOODS: { type: MoodType; icon: string; label: string; color: string }[] = [
  { type: 'great', icon: '😊', label: 'ОТЛИЧНО', color: 'var(--green)' },
  { type: 'good', icon: '🙂', label: 'ХОРОШО', color: 'var(--cyan)' },
  { type: 'neutral', icon: '😐', label: 'НЕЙТРАЛЬНО', color: 'var(--amber)' },
  { type: 'bad', icon: '😟', label: 'ПЛОХО', color: 'var(--violet)' },
  { type: 'terrible', icon: '😣', label: 'УЖАСНО', color: 'var(--red)' },
];

function getLocalDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function EmotionJournal() {
  const { state, dispatch } = useAppState();
  const [text, setText] = useState('');
  const [mood, setMood] = useState<MoodType | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateStr());

  const handleSave = () => {
    if (!text.trim() || !mood) return;

    const entry: EmotionEntry = {
      id: crypto.randomUUID(),
      text,
      mood,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_EMOTION', entry });
    
    const xpBase = 50;
    const bonus = text.length > 100 ? 25 : 0;
    setToast(`+${xpBase + bonus} XP ЗАПИСАНО`);
    setTimeout(() => setToast(null), 3000);

    setText('');
    setMood(null);
    setSelectedDate(getLocalDateStr());
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_EMOTION', id });
  };

  const last30Days = useMemo(() => {
    const days = [];
    const todayStr = getLocalDateStr();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const entry = state.emotions.find(e => e.createdAt.startsWith(dateStr));
      days.push({ date: dateStr, mood: entry?.mood, isToday: dateStr === todayStr });
    }
    return days;
  }, [state.emotions]);

  const selectedEntries = useMemo(() => {
    return state.emotions.filter(e => e.createdAt.startsWith(selectedDate)).reverse();
  }, [state.emotions, selectedDate]);

  const displayDateStr = new Date(selectedDate).toLocaleDateString('ru-RU');
  const isToday = selectedDate === getLocalDateStr();

  return (
    <div className="emotion-journal animate-fade-in">
      <div className="ej-top-row">
        {/* Left: Input */}
        <div className="glass-card ej-panel">
          <div className="ej-panel-title">БАЗА ДАННЫХ ЭМОЦИЙ</div>
          <textarea
            className="ej-textarea"
            placeholder="> выплесни свои мысли и эмоции..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="ej-mood-selector">
            {MOODS.map(m => (
              <button
                key={m.type}
                className={`ej-mood-btn ${mood === m.type ? 'ej-mood-btn--active' : ''}`}
                style={mood === m.type ? { '--color-bg': `${m.color}22`, '--color-border': m.color, '--color-glow': `${m.color}66` } as React.CSSProperties : {}}
                onClick={() => setMood(m.type)}
              >
                <span className="ej-mood-icon">{m.icon}</span>
                <span className="ej-mood-label">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="ej-save-row">
            {toast ? <div className="ej-toast">{toast}</div> : <div />}
            <button className="btn btn--primary" onClick={handleSave} disabled={!text.trim() || !mood}>
              ЗАПИСАТЬ
            </button>
          </div>
        </div>

        {/* Right: Mind Stats */}
        <div className="glass-card ej-panel">
          <div className="ej-panel-title">СОСТОЯНИЕ РАЗУМА</div>
          <div className="ej-level-display">
            <div className="ej-level-number">{state.emotions.length}</div>
            <div className="ej-level-name">ВСЕГО ЗАПИСЕЙ ЭМОЦИЙ</div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '8px' }}>
            Выплеск мыслей помогает освободить оперативную память мозга и снизить когнитивную нагрузку.
          </p>
          <div className="ej-stats-row" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <span>Единый уровень и награды:</span>
            <span style={{ color: 'var(--cyan)' }}>Вкладка Профиль 👤</span>
          </div>
        </div>
      </div>

      {/* Bottom: Calendar */}
      <div className="glass-card ej-panel">
        <div className="ej-panel-title">ПАТТЕРНЫ ЗА 30 ДНЕЙ</div>
        <div className="ej-calendar-grid">
          {last30Days.map((d, i) => (
            <div
              key={i}
              onClick={() => setSelectedDate(d.date)}
              className={`ej-calendar-day ${d.mood ? `ej-calendar-day--${d.mood}` : ''} ${selectedDate === d.date ? 'ej-calendar-day--active' : ''} ${d.isToday ? 'ej-calendar-day--today' : ''}`}
              title={`${d.date} ${d.isToday ? '(СЕГОДНЯ) ' : ''}${d.mood ? '- ' + d.mood : ''}`}
            >
              {d.isToday && <span className="ej-today-pulse" />}
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="glass-card ej-panel">
        <div className="ej-panel-title">ЗАПИСИ {isToday ? '(СЕГОДНЯ)' : `(${displayDateStr})`}</div>
        <div className="ej-history">
          {selectedEntries.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Нет данных за этот день...</div>
          ) : (
            selectedEntries.map(e => {
              const m = MOODS.find(x => x.type === e.mood);
              return (
                <div key={e.id} className="glass-card ej-history-item">
                  <div className="ej-history-left">
                    <div className="ej-history-meta">
                      <span className="ej-mood-icon">{m?.icon}</span>
                      <span className="ej-history-date">{new Date(e.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="ej-history-text">{e.text}</div>
                  </div>
                  <button 
                    className="ej-history-delete" 
                    onClick={() => handleDelete(e.id)}
                    title="Удалить запись"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
