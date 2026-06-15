import { Brain, Heart, Zap, Calendar, Settings } from 'lucide-react';
import { useAppState, getTodaySphere } from '../store/AppContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Дашборд', icon: Brain },
  { id: 'emotions', label: 'Эмоции', icon: Heart },
  { id: 'training', label: 'Тренинг', icon: Zap },
  { id: 'splits', label: 'Сплиты', icon: Calendar },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function Sidebar() {
  const { state, dispatch } = useAppState();
  const todaySphere = getTodaySphere(state.daySplits);

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-text">МОГГЕР</div>
        <div className="sidebar__logo-sub">BRAIN.OS v1.0</div>
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

      {todaySphere && (
        <div className="sidebar__split">
          <div className="sidebar__split-label">Сегодня</div>
          <div className="sidebar__split-value" style={{ color: todaySphere.color }}>
            {todaySphere.sphere}
          </div>
        </div>
      )}
    </aside>
  );
}
