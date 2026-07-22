import { Home, Heart, Zap, CalendarDays, User } from 'lucide-react';
import { useAppState, getTodayIndex } from '../store/AppContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'history', label: 'История', icon: CalendarDays },
  { id: 'emotions', label: 'Эмоции', icon: Heart },
  { id: 'training', label: 'Тренинг', icon: Zap },
  { id: 'profile', label: 'Профиль', icon: User },
];

export default function Sidebar() {
  const { state, dispatch } = useAppState();
  const todayIndex = getTodayIndex();
  const assignment = state.weekAssignments.find(a => a.dayIndex === todayIndex);
  const todayTemplate = assignment ? state.templates.find(t => t.id === assignment.templateId) : undefined;

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-text">МОГГЕР</div>
        <div className="sidebar__logo-sub">BRAIN.OS v2.0</div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`sidebar__item ${state.activeTab === item.id ? 'sidebar__item--active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', tab: item.id })}
          >
            <item.icon className="sidebar__item-icon" />
            {item.label}
          </div>
        ))}
      </nav>

      {todayTemplate && (
        <div className="sidebar__split">
          <div className="sidebar__split-label">Сегодня</div>
          <div className="sidebar__split-value" style={{ color: todayTemplate.color }}>
            {todayTemplate.icon} {todayTemplate.name}
          </div>
        </div>
      )}
    </aside>
  );
}
