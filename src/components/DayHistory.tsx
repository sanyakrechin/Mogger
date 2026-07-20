import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAppState } from '../store/AppContext';
import './DayHistory.css';

const DAY_LABELS_FULL = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА', 'ВОСКРЕСЕНЬЕ'];
const MONTH_NAMES = ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'];

export default function DayHistory() {
  const { state } = useAppState();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Generate week dates for the given offset
  const weekDates = useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diff + weekOffset * 7);

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
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const first = new Date(weekDates[0]);
    const last = new Date(weekDates[6]);
    return `${first.getDate()} ${MONTH_NAMES[first.getMonth()].slice(0, 3)} — ${last.getDate()} ${MONTH_NAMES[last.getMonth()].slice(0, 3)} ${last.getFullYear()}`;
  }, [weekDates]);

  const selectedInstance = selectedDate ? state.dayInstances.find(d => d.date === selectedDate) : null;
  const selectedTemplate = selectedInstance ? state.templates.find(t => t.id === selectedInstance.templateId) : null;
  const selectedDayIndex = selectedDate ? (new Date(selectedDate).getDay() + 6) % 7 : -1;

  return (
    <div className="day-history animate-fade-in">
      {/* Week navigator */}
      <div className="day-history__nav glass-card">
        <button className="day-history__nav-btn" onClick={() => setWeekOffset(o => o - 1)}>
          <ChevronLeft size={18} />
        </button>
        <span className="day-history__nav-label">{weekLabel}</span>
        <button
          className="day-history__nav-btn"
          onClick={() => setWeekOffset(o => Math.min(o + 1, 0))}
          disabled={weekOffset >= 0}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Week grid */}
      <div className="day-history__grid">
        {weekDates.map((date, idx) => {
          const inst = state.dayInstances.find(d => d.date === date);
          const tpl = inst ? state.templates.find(t => t.id === inst.templateId) : null;
          const done = inst ? inst.tasks.filter(t => t.completed).length : 0;
          const total = inst ? inst.tasks.length : 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const dateNum = new Date(date).getDate();
          const isSelected = selectedDate === date;
          const todayISO = new Date().toISOString().split('T')[0];
          const isPast = date < todayISO;
          const isToday = date === todayISO;

          return (
            <div
              key={date}
              className={[
                'day-history__card',
                isSelected ? 'day-history__card--selected' : '',
                isToday ? 'day-history__card--today' : '',
                !inst && isPast ? 'day-history__card--empty' : '',
              ].filter(Boolean).join(' ')}
              style={{ '--card-color': tpl?.color ?? '#444' } as React.CSSProperties}
              onClick={() => setSelectedDate(isSelected ? null : date)}
            >
              <span className="day-history__card-day">{['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'][idx]}</span>
              <span className="day-history__card-date">{dateNum}</span>
              {tpl && <span className="day-history__card-icon">{tpl.icon}</span>}
              {inst && total > 0 && (
                <div className="day-history__card-bar">
                  <div className="day-history__card-bar-fill" style={{ width: `${pct}%`, backgroundColor: tpl?.color }} />
                </div>
              )}
              {inst && <span className="day-history__card-stats">{done}/{total}</span>}
              {pct === 100 && total > 0 && <span className="day-history__card-complete">✓</span>}
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedInstance && selectedTemplate && (
        <div className="day-history__detail glass-card">
          <div className="day-history__detail-header" style={{ color: selectedTemplate.color }}>
            <span className="day-history__detail-icon">{selectedTemplate.icon}</span>
            <div>
              <h3 className="day-history__detail-title">
                {DAY_LABELS_FULL[selectedDayIndex]}: {selectedTemplate.name}
              </h3>
              <span className="day-history__detail-date">{selectedDate}</span>
            </div>
          </div>

          <div className="day-history__detail-tasks">
            {selectedInstance.tasks.map(task => (
              <div key={task.id} className={`day-history__detail-task ${task.completed ? 'day-history__detail-task--done' : ''}`}>
                <span className={`day-history__detail-check ${task.completed ? 'day-history__detail-check--done' : ''}`}>
                  {task.completed ? <Check size={14} /> : '○'}
                </span>
                <span>{task.title}</span>
                {task.isDefault && <span className="day-history__detail-badge">ШАБЛОН</span>}
              </div>
            ))}
          </div>

          <div className="day-history__detail-summary">
            {(() => {
              const done = selectedInstance.tasks.filter(t => t.completed).length;
              const total = selectedInstance.tasks.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <span style={{ color: selectedTemplate.color }}>
                  ВЫПОЛНЕНО: {done}/{total} ({pct}%)
                </span>
              );
            })()}
          </div>
        </div>
      )}

      {selectedDate && !selectedInstance && (
        <div className="day-history__detail glass-card">
          <div className="day-history__empty">Нет данных за этот день</div>
        </div>
      )}
    </div>
  );
}
