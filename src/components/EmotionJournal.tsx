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

const LEVEL_NAMES = [
  'ТУМАННЫЙ РАЗУМ',
  'ПРОБУЖДЕНИЕ',
  'ЯСНЫЙ ВЗГЛЯД',
  'ФОКУС',
  'МАСТЕР ДЗЕН',
  'КРИСТАЛЬНЫЙ РАЗУМ'
];

export default function EmotionJournal() {
  const { state, dispatch } = useAppState();
  const [text, setText] = useState('');
  const [mood, setMood] = useState<MoodType | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
    setSelectedDate(new Date().toISOString().split('T')[0]); // Reset to today
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_EMOTION', id });
  };

  const levelName = LEVEL_NAMES[Math.min(state.gamification.level - 1, LEVEL_NAMES.length - 1)];
  const xpInLevel = state.gamification.xp % 200;
  const xpSegments = 10;
  const filledSegments = Math.floor((xpInLevel / 200) * xpSegments);

  const last30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = state.emotions.find(e => e.createdAt.startsWith(dateStr));
      days.push({ date: dateStr, mood: entry?.mood });
    }
    return days;
  }, [state.emotions]);

  const selectedEntries = useMemo(() => {
    return state.emotions.filter(e => e.createdAt.startsWith(selectedDate)).reverse();
  }, [state.emotions, selectedDate]);

  const displayDateStr = new Date(selectedDate).toLocaleDateString('ru-RU');
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

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

        {/* Right: Gamification */}
        <div className="glass-card ej-panel">
          <div className="ej-panel-title">ПРОФИЛЬ ОПЕРАТОРА</div>
          <div className="ej-level-display">
            <div className="ej-level-number">УРОВЕНЬ {state.gamification.level}</div>
            <div className="ej-level-name">{levelName}</div>
          </div>
          <div className="ej-xp-bar">
            {Array.from({ length: xpSegments }).map((_, i) => (
              <div key={i} className={`ej-xp-segment ${i < filledSegments ? 'ej-xp-segment--filled' : ''}`} />
            ))}
          </div>
          <div className="ej-stats-row">
            <span>XP: {xpInLevel} / 200</span>
            <span style={{ color: 'var(--amber)' }}>🔥 СЕРИЯ: {state.gamification.streak} ДНЕЙ</span>
          </div>
          <div className="ej-stats-row" style={{ marginTop: 'auto' }}>
            <span>ВСЕГО ЗАПИСЕЙ: {state.emotions.length}</span>
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
              className={`ej-calendar-day ${d.mood ? `ej-calendar-day--${d.mood}` : ''} ${selectedDate === d.date ? 'ej-calendar-day--active' : ''}`}
              title={`${d.date} ${d.mood ? '- ' + d.mood : ''}`}
            />
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
                  <div className="ej-history-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="ej-mood-icon">{m?.icon}</span>
                      <span className="ej-history-date">{new Date(e.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <button 
                      className="ej-history-delete" 
                      onClick={() => handleDelete(e.id)}
                      title="Удалить запись"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="ej-history-text">{e.text}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
